import * as vscode from "vscode";
import sketcherHtml from "./ui-sketcher.html";
import * as ejs from "ejs";

export class UiSketcherWebview {
  panel: vscode.WebviewPanel | undefined;

  public constructor(private context: vscode.ExtensionContext) {}

  public register = () => {
    return this.context.subscriptions.push(
      vscode.commands.registerCommand("ui-sketcher.open", this.open)
    );
  };

  private open = () => {
    this.panel = vscode.window.createWebviewPanel(
      "uiSketcher",
      "UI Sketcher",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
      }
    );

    this.panel.webview.html = this.getWebviewContent();
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
      vscode.Uri.joinPath(this.context.extensionUri, "web-dist/assets/index.js")
    );

    const vendorsUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "web-dist/assets/vendors.js"
      )
    );

    const stylesUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "web-dist/assets/index.css"
      )
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
