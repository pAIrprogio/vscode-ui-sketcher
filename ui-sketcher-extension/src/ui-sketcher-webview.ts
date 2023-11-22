import * as vscode from "vscode";
import sketcherHtml from "./ui-sketcher.html";
import * as ejs from "ejs";
import { uiToComponent } from "./openai.client";
import { getRelativePathOfDocument } from "./vscode-utils";
import path = require("path");

export class UiSketcherWebview {
  panel: vscode.WebviewPanel | undefined;
  lastTextEditor: vscode.TextEditor | undefined;
  lastDocument: vscode.TextDocument | undefined;
  lastCursorPosition: vscode.Position | undefined;

  public constructor(
    private context: vscode.ExtensionContext,
    private logChannel: vscode.OutputChannel,
  ) {}

  public register = () => {
    return this.context.subscriptions.push(
      vscode.commands.registerCommand("ui-sketcher.open", this.open),
      this.watchActiveDocumentClose(),
    );
  };

  private watchActiveDocumentClose = () => {
    return vscode.workspace.onDidCloseTextDocument((document) => {
      if (this.lastDocument === document && this.panel) {
        this.panel.dispose();
        this.panel = undefined;
        this.lastTextEditor = undefined;
        this.lastDocument = undefined;
        this.lastCursorPosition = undefined;
      }
    });
  };

  private open = () => {
    if (this.isOpen) {
      this.panel?.reveal(vscode.ViewColumn.Beside);
      if (this.lastTextEditor === vscode.window.activeTextEditor) return;
    }

    this.saveCurrentPosition();
    const panelName = getRelativePathOfDocument(this.lastDocument!);
    if (this.isOpen) this.panel!.dispose();

    this.panel = vscode.window.createWebviewPanel(
      "uiSketcher",
      panelName,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
      },
    );

    this.panel.iconPath = vscode.Uri.file(
      path.join(this.context.extensionPath, "images", "icon.png"),
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
      this.lastTextEditor = undefined;
      this.lastDocument = undefined;
      this.lastCursorPosition = undefined;
    });

    this.panel.webview.html = this.getWebviewContent();
    this.panel.webview.onDidReceiveMessage(this.handleMessage);
    this.logChannel.appendLine("UI Sketcher: Panel opened");
  };

  private get isOpen() {
    return !!this.panel;
  }

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

  private cleanFile = async () => {
    if (!this.lastDocument) return false;

    const edit = new vscode.WorkspaceEdit();
    const lastLine = this.lastDocument.lineAt(this.lastDocument.lineCount - 1);
    const range = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(
        this.lastDocument.lineCount - 1,
        lastLine.range.end.character,
      ),
    );
    edit.delete(this.lastDocument.uri, range);

    await vscode.workspace.applyEdit(edit);
    this.resetCursorPosition();
  };

  private resetCursorPosition = () => {
    if (!this.lastDocument) return false;

    this.lastCursorPosition = new vscode.Position(0, 0);
    this.updateCursorPosition();

    return true;
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
      this.lastTextEditor = activeEditor;
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
    payload: { base64: string; imageTexts: string };
  }) => {
    this.logChannel.appendLine(
      `UI Sketcher: Received message with command ${message.command}`,
    );
    switch (message.command) {
      case "tldraw:export":
        const { base64, imageTexts } = message.payload;
        await this.createCompletion(base64, imageTexts);
        return;
      default:
        vscode.window.showErrorMessage(
          "Unable to handle command from UI Sketcher",
        );
    }
  };

  private createCompletion = async (
    base64Image: string,
    imageTexts: string,
  ) => {
    const apiToken = await this.context.secrets.get("OPENAI_API_KEY");

    if (!apiToken) {
      vscode.window.showErrorMessage(
        'UI Sketcher: Please set your Open AI API key first using "UI Sketcher: Set Open AI API Key" command',
      );
      return;
    }

    if (!this.lastDocument) {
      vscode.window.showErrorMessage(
        "UI Sketcher: Please open a text file before generating code",
      );
      return;
    }

    this.logChannel.appendLine("UI Sketcher: Creating completion");

    const config = vscode.workspace.getConfiguration("ui-sketcher");
    const maxTokens = config.get<number>("maxTokens")!;
    const stack = config.get<string>("stack");
    const customInstructions = config.get<string>("customInstructions");
    const fileContent = this.lastDocument.getText();
    const filePath = getRelativePathOfDocument(this.lastDocument);

    try {
      let hasStarted = false;

      const onChunk = async (text: string) => {
        if (!hasStarted) {
          await this.cleanFile();
          hasStarted = true;
        }

        this.logChannel.append(text);
        await this.insertText(text);
      };

      await uiToComponent({
        base64Image,
        apiKey: apiToken,
        maxTokens,
        stack,
        customInstructions,
        filePath,
        fileContent,
        onChunk,
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

    const config = vscode.workspace.getConfiguration("ui-sketcher");
    const previewUrl = config.get<string>("previewUrl");
    // Need to grab scheme + host and trailing slash
    const previewHost = previewUrl?.match(/^.*\/\/[^\/]+/)?.[0];
    const hidePreviewOnStart =
      this.lastDocument && this.lastDocument.getText().length === 0;
    const relativePath = getRelativePathOfDocument(this.lastDocument!);

    const nonce = this.getNonce();

    this.logChannel.appendLine("UI Sketcher: Getting webview content");

    return ejs.render(sketcherHtml, {
      previewHost,
      previewUrl,
      relativePath,
      displayPreviewOnStart: !hidePreviewOnStart,
      indexUri,
      vendorsUri,
      stylesUri,
      nonce,
      cspSource: this.panel.webview.cspSource,
    });
  };
}
