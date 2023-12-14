# Change Log

## [1.1.6] - 2023-12-14

### Added

- The maxTokens settings is now validated against a 100-4096 range. See [issue #1](https://github.com/pAIrprogio/vscode-ui-sketcher/issues/1)

## [1.1.5] - 2023-11-28

### Changed

- Preview now requires the page to handle a window event and respond with a base64 screenshot. Please make sure to check the preview URL setup guide
- The generated screenshot will now be included in the rendered result

## [1.1.4] - 2023-11-26

### Fixed

- Error when closing the panel manually and closing the file after

## [1.1.3] - 2023-11-23

### Fixed

- Allow pasting images from clipboard
- Allow embeddings from urls

## [1.1.2] - 2023-11-22

### Fixed

- Prevent panel unmount from deleting the extension's state

## [1.1.1] - 2023-11-22

### Added

- Preview iframe can now be interacted with

## [1.1.0] - 2023-11-22

### Added

- Display a preview iframe with the `ui-sketcher.previewUrl` setting
- Render selection only by enabling the `ui-sketcher.partialRenderEnabled` setting
- Panel will close if the active file is closed (state remains saved)
- Opening the panel from a different file will reopen the webview with the new file
- If shapes are selected, the "Make real" button will only use those shapes
- Min 3s loading by default on "Make real" button to prevent double click
- UI Sketcher icon on canvas panels

### Changed

- Use `vscode.workspace.getWorkspaceFolder` to find the active file workspace folder
- Switched from Sawyer's implementation to [make-real](https://github.com/tldraw/make-real/tree/main)'s one
- Canvas state is now based on the file currently opened in the editor

### Fixed

- Reveal panel if already opened

### Removed

- `ui-sketcher.includeFileInPrompt` setting

## [1.0.5] - 2023-11-21

### Added

- User prompt now contains the relative path to the file based on the current workspace folder

### Fixed

- "Make real" button's position is now responsive

## [1.0.0] - 2023-11-09

- Initial release
