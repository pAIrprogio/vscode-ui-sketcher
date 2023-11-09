# UI Sketcher

Turn rough UI sketches into code

## Installation

Once installed, make sure to run the command `UI Sketcher: Set OpenAI API Token`. Your token will be stored in a secret store handled by VSCode. It will never be shared with anyone.

https://github.com/pAIrprogio/vscode-ui-sketcher/assets/1863461/9a4b482b-add3-4820-9406-3c16870a180b

## Usage

- Open a text file and put your cursor where you want the code to be generated
- Use the `UI Sketcher: Open drawing board`
- Draw your UI
- Click "Make Real" to generate code
- Watch the magic happen

## Quirks

- I haven't had the time to test a lot of stacks, but it works wonder with tailwind + svelte
- The drawing board may take a while to load the first time, but everything is cached so it should be seamless after that
- When pressing "Make Real", it may take a few seconds before the code appears, so don't click multiple times or it will trigger multiple runs. This will be fixed in a future version.

## Custom settings

- `ui-sketcher.stack`: A string with the list of packages used in the project which should be taken into account when generating code
- `ui-sketcher.customInstructions`: Custom instructions to include when generating code
- `ui-sketcher.includeFileInPrompt`: Whether to include the whole file in the prompt, defaults to `false`
- `ui-sketcher.maxTokens`: Maximum number of tokens to generate, defaults to `1000`

## Thanks

- [Steve Ruiz](https://twitter.com/steveruizok) for [tldraw](https://github.com/tldraw/tldraw)
- [Sawyer Hood](https://twitter.com/sawyerhood) for the headstart with [draw-a-ui](https://github.com/SawyerHood/draw-a-ui/tree/main)
