import * as vscode from "vscode";
import sketcherHtml from "./ui-sketcher.html";
import * as ejs from "ejs";
import { uiToComponent } from "./openai.client";

export class UiSketcherWebview {
  panel: vscode.WebviewPanel | undefined;
  lastDocument: vscode.TextDocument | undefined;
  lastCursorPosition: vscode.Position | undefined;

  public constructor(
    private context: vscode.ExtensionContext,
    private logChannel: vscode.OutputChannel,
  ) {}

  public register = () => {
    return this.context.subscriptions.push(
      vscode.commands.registerCommand("ui-sketcher.open", this.open),
    );
  };

  private open = () => {
    this.saveCurrentPosition();
    this.panel = vscode.window.createWebviewPanel(
      "uiSketcher",
      "UI Sketcher",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
      },
    );

    this.panel.webview.html = this.getWebviewContent();

    this.panel.webview.onDidReceiveMessage(this.handleMessage);
    this.logChannel.appendLine("UI Sketcher: Panel opened");
  };

  private insertText = async (text: string) => {
    if (!this.lastDocument || !this.lastCursorPosition) return false;

    const edit = new vscode.WorkspaceEdit();
    edit.insert(this.lastDocument.uri, this.lastCursorPosition, text);

    await vscode.workspace.applyEdit(edit);

    const textLines = text.split("\n");
    const newLineCount = textLines.length - 1;
    const lastLineLength = textLines[textLines.length - 1].length;
    if (newLineCount === 0) {
      this.lastCursorPosition = this.lastCursorPosition.translate(
        0,
        lastLineLength,
      );
    } else {
      this.lastCursorPosition = new vscode.Position(
        this.lastCursorPosition.line + newLineCount,
        lastLineLength,
      );
    }
    this.updateCursorPosition();
  };

  private saveCurrentPosition = () => {
    let activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
      vscode.window.showErrorMessage(
        "UI Sketcher: Please open a text file before using UI Sketcher",
      );
      throw new Error("No active editor");
    }

    if (activeEditor) {
      this.lastDocument = activeEditor.document;
      this.lastCursorPosition = activeEditor.selection.active;
      return true;
    }
  };

  private updateCursorPosition = () => {
    const activeEditor = vscode.window.activeTextEditor;
    const position = this.lastCursorPosition;

    if (!activeEditor || !position) return;

    activeEditor.selection = new vscode.Selection(position, position);
    activeEditor.revealRange(new vscode.Range(position, position));
  };

  private handleMessage = async (message: {
    command: "tldraw:export";
    payload: { base64: string };
  }) => {
    this.logChannel.appendLine(
      `UI Sketcher: Received message with command ${message.command}`,
    );
    switch (message.command) {
      case "tldraw:export":
        const { base64 } = message.payload;
        await this.createCompletion(base64);
        return;
      default:
        vscode.window.showErrorMessage(
          "Unable to handle command from UI Sketcher",
        );
    }
  };

  private createCompletion = async (base64Image: string) => {
    const apiToken = await this.context.secrets.get("OPENAI_API_KEY");

    if (!apiToken) {
      vscode.window.showErrorMessage(
        'UI Sketcher: Please set your Open AI API key first using "UI Sketcher: Set Open AI API Key" command',
      );
      return;
    }

    this.logChannel.appendLine("UI Sketcher: Creating completion");

    const config = vscode.workspace.getConfiguration("ui-sketcher");
    const maxTokens = config.get<number>("maxTokens")!;
    const stack = config.get<string>("stack");
    const customInstructions = config.get<string>("customInstructions");
    const includeFileInPrompt = config.get<boolean>("includeFileInPrompt")!;
    const { preCode, postCode } = includeFileInPrompt
      ? this.textAroundCursor()
      : { preCode: undefined, postCode: undefined };
    const fileName = this.lastDocument?.fileName || "<undefined>";

    if (fileName === "<undefined>")
      this.logChannel.appendLine("UI Sketcher: Unable to get file name");

    try {
      await uiToComponent(base64Image, {
        apiKey: apiToken,
        maxTokens,
        stack,
        customInstructions,
        preCode,
        postCode,
        fileName,
        onChunk: async (text) => {
          this.logChannel.append(text);
          await this.insertText(text);
        },
      });
    } catch (e: any) {
      vscode.window.showErrorMessage(
        "UI Sketcher: Unable to create completion due to issues with Open AI API",
      );
      this.logChannel.appendLine("UI Sketcher: Unable to create completion");
      if (e?.message) this.logChannel.appendLine(e.message);
    }

    this.logChannel.append("\n");
  };

  private textAroundCursor = (): { preCode?: string; postCode?: string } => {
    if (!this.lastDocument || !this.lastCursorPosition)
      return { preCode: undefined, postCode: undefined };

    const text = this.lastDocument.getText();
    const cursorOffset = this.lastDocument.offsetAt(this.lastCursorPosition);
    const preCode = text.substring(0, cursorOffset);
    const postCode = text.substring(cursorOffset);

    return { preCode, postCode };
  };

  private getNonce() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private getWebviewContent = () => {
    if (!this.panel) throw new Error("Panel not initialized");

    const indexUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "web-dist/assets/index.js",
      ),
    );

    const vendorsUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "web-dist/assets/vendors.js",
      ),
    );

    const stylesUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "web-dist/assets/index.css",
      ),
    );

    const nonce = this.getNonce();

    return ejs.render(sketcherHtml, {
      indexUri,
      vendorsUri,
      stylesUri,
      nonce,
      cspSource: this.panel.webview.cspSource,
    });
  };
}
