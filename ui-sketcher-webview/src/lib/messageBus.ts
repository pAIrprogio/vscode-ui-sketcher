type Message = {
  command: "tldraw:export";
  payload: { base64: string };
};

const vscode = acquireVsCodeApi();

export const sendMessage = (message: Message) => {
  vscode.postMessage(message);
};
