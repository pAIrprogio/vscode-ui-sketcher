# UI Sketcher

Turn sketches into UI code

![UI Sketcher Demo](https://raw.githubusercontent.com/pAIrprogio/vscode-ui-sketcher/main/ui-sketcher-extension/images/demo.gif)

## Installation

Once installed, make sure to run the command `UI Sketcher: Set OpenAI API Token`. Your token will be stored in a secret store handled by VSCode. It will never be shared with anyone.

## Usage

- Open a text file and put your cursor where you want the code to be generated
- Use the `UI Sketcher: Open drawing board`
- Draw your UI
- Click "Make Real" to generate code
- Watch the magic happen
- Iterate live using a [preview url](https://github.com/pAIrprogio/vscode-ui-sketcher/blob/main/doc/setup-preview-url.md)

## Quirks

- I haven't had the time to test a lot of stacks, but it works wonder with tailwind + svelte
- The drawing board may take a while to load the first time, but everything is cached so it should be seamless after that

## Custom settings

- `ui-sketcher.stack`: A string with the list of packages used in the project which should be taken into account when generating code
- `ui-sketcher.customInstructions`: Custom instructions to include when generating code
- `ui-sketcher.previewUrl`: A url which should be able to take a relative file's path as a query param and display the file's component as a result. [See doc to setup](https://github.com/pAIrprogio/vscode-ui-sketcher/blob/main/doc/setup-preview-url.md)
- `ui-sketcher.maxTokens`: Maximum number of tokens to generate, defaults to `1000`

## Thanks

- [Steve Ruiz](https://twitter.com/steveruizok) for [tldraw](https://github.com/tldraw/tldraw) and [makereal](https://github.com/tldraw/make-real)
- [Sawyer Hood](https://twitter.com/sawyerhood) for the headstart with [draw-a-ui](https://github.com/SawyerHood/draw-a-ui)
