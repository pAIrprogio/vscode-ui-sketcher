# Change Log

## [Unreleased] - 2023-22-09

### Added

- If shapes are selected, the "Make real" button will only use those shapes
- Display a preview iframe with the `ui-sketcher.previewUrl` setting
- Min 3s loading by default on "Make real" button to prevent double click

### Changed

- Use `vscode.workspace.getWorkspaceFolder` to find the active file workspace folder

## [1.0.5] - 2023-21-09

### Added

- User prompt now contains the relative path to the file based on the current workspace folder

### Fixed

- "Make real" button's position is now responsive

## [1.0.0] - 2023-11-09

- Initial release
