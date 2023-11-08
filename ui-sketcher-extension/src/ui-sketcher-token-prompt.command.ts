import * as vscode from "vscode";

const OPENAI_API_TOKEN_REGEX = /^sk-\w{48}$/;

export class UiSketcherTokenPrompt {
  public constructor(
    private context: vscode.ExtensionContext,
    private logChannel: vscode.OutputChannel,
  ) {}

  public register = () => {
    return this.context.subscriptions.push(
      vscode.commands.registerCommand("ui-sketcher.set-openai-token", this.run),
    );
  };

  private run = async () => {
    const secretValue = await vscode.window.showInputBox({
      prompt: "Enter your Open AI API key",
      password: true,
      ignoreFocusOut: true,
    });

    if (!secretValue) {
      vscode.window.showErrorMessage(
        "UI Sketcher: Empty API key, please try again",
      );
      return;
    }

    if (!OPENAI_API_TOKEN_REGEX.test(secretValue)) {
      vscode.window.showErrorMessage(
        "UI Sketcher: Invalid API key, please try again",
      );
      return;
    }

    await this.context.secrets.store("OPENAI_API_KEY", secretValue);

    vscode.window.showInformationMessage(
      "UI Sketcher: API key successfully saved in secrets store",
    );
  };
}
