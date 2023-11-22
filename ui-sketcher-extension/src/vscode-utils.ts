import * as vscode from "vscode";
import * as path from "path";

export function getRelativePathOfDocument(document: vscode.TextDocument) {
  const documentPath = document.uri.fsPath;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

  if (!workspaceFolder) return documentPath;

  return path.relative(workspaceFolder.uri.fsPath, documentPath);
}
