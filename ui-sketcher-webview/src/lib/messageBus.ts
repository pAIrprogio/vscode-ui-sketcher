import { WebviewApi } from "vscode-webview";

type Message = {
  command: "tldraw:export";
  payload: { base64: string };
};

const vscode =
  typeof acquireVsCodeApi === "function"
    ? acquireVsCodeApi()
    : // Stub for testing in browser
      ({
        postMessage: (message: any) => {
          console.warn("VSCode API not available - postMessage", message);
        },
        getState: () => {
          console.warn("VSCode API not available - getState");
          const stringState = localStorage.getItem("state");
          return stringState ? JSON.parse(stringState) : null;
        },
        setState: (state: any) => {
          console.warn("VSCode API not available - setState", state);
          localStorage.setItem("state", JSON.stringify(state));
          return state;
        },
      } satisfies WebviewApi<any>);

export const sendMessage = (message: Message) => {
  vscode.postMessage(message);
};
