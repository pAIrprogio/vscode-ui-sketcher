// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { UiSketcherWebview } from "./ui-sketcher-webview";
import { UiSketcherTokenPrompt } from "./ui-sketcher-token-prompt.command";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const logChannel = vscode.window.createOutputChannel("UI Sketcher");

  new UiSketcherWebview(context, logChannel).register();
  new UiSketcherTokenPrompt(context, logChannel).register();
}

// This method is called when your extension is deactivated
export function deactivate() {}
