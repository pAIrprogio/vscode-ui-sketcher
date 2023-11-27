# Setup URL Preview

## How it works

- If the opened text file is not empty, the preview frame will display on open
- If the opened text file is empty, the preview frame will display on save
- The content should update when the file is saved

## Quirks

- It is recommended to lock the preview frame inside the editor (select the preview, then press `shift+L`) so that you can quickly erase the rest of the canvas on each iteration
- It's always recommended to commit the setup locally in the project's `.vscode/settings.json` file to avoid switching between projects

## Standard

- The preview url should accept a `filePath` query parameter
- The preview page, should load the Component from the `filePath` query parameter dynamically and render it
- The preview page should be able to take a screenshot of itself and send it back
  - It should listen for a `message` event in the shape of `{ action: 'take-screenshot', shapeid: string }`
  - It should respond using `window.parent.postMessage({ screenshot: data, shapeid: event.data.shapeid }, '*');`
  - If the screenshot is not sent back, after a timeout, a blank element will be rendered instead
  - See the [sveltekit instructions](./setup-preview-url/sveltekit.md) for an example
- The preview page should have hot reloading / live reload enabled
- The preview url should be added to `ui-sketcher.previewUrl` in settings.json without any query parameters (e.g. `http://localhost:3000/preview`)

## Code

To setup a preview page on your stack, use the links bellow to get sample code and specific instructions.

| Stack                                                                                                             | Type     |
| ----------------------------------------------------------------------------------------------------------------- | -------- |
| [sveltekit](./setup-preview-url/sveltekit.md)                                                                     | standard |
| [Help by adding your own](./https://github.com/pAIrprogio/vscode-ui-sketcher/edit/main/doc/setup-preview-url.md)  | 🙏       |
