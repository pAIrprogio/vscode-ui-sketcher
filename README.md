# UI Sketcher

Turn rough sketches into UI code

https://github.com/pAIrprogio/vscode-ui-sketcher/assets/1863461/b9f1a1ac-00c9-4c96-bbd0-de15c0e20db8

## Download

Head to the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=pAIrprog.ui-sketcher) or search for "UI Sketcher" in the extensions tab.

## Installation & Usage

You can read the extension's readme [here](./ui-sketcher-extension/README.md).

## Development

- Only work from the `ui-sketcher.code-workspace` file
- Install dependencies with `pnpm install`
- From `./ui-sketcher-webview` run `pnpm build` or `pnpm build --watch` if you're working on the webview
- Use VSCodes debugger to run the extension
- You can also work on the webview in a browser by running `pnpm --filter ui-sketcher-webview dev` from `./ui-sketcher-webview` and opening [http://localhost:3174](http://localhost:3174)

## Thanks

- [Steve Ruiz](https://twitter.com/steveruizok) for [tldraw](https://github.com/tldraw/tldraw) and [makereal](https://github.com/tldraw/make-real)
- [Sawyer Hood](https://twitter.com/sawyerhood) for the headstart with [draw-a-ui](https://github.com/SawyerHood/draw-a-ui)
