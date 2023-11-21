import * as vscode from "vscode";
import * as path from "path";

export function getRelativePathOfDocument(
  document?: vscode.TextDocument | null,
) {
  if (!document) return null;

  const documentPath = document.uri.fsPath;
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) return documentPath;

  for (const folder of workspaceFolders) {
    const workspacePath = folder.uri.fsPath;

    // Check if the document path starts with the workspace path
    // TODO: won't be top notch if the root folder is the first workspace folder
    if (documentPath.startsWith(workspacePath)) {
      return path.relative(workspacePath, documentPath);
    }
  }

  return documentPath;
}
