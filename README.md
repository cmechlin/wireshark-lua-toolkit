# Wireshark Lua Dissector VSCode Extension

A Visual Studio Code extension to streamline development of Wireshark Lua dissector scripts on Windows.

## Features

- Syntax highlighting for Lua and the Wireshark dissector API
- IntelliSense and code hinting for Lua and Wireshark-specific functions
- Integrated REPL and debugging interface leveraging the external `tshark.exe` CLI
- Packaging and publishing workflow for the VSCode Marketplace

## Installation

1. Ensure you have Node.js v22, Yeoman, VSCode Extension Generator, and vsce installed globally.
2. Install Wireshark (ensure `tshark.exe` is available, e.g., `D:\Program Files\Wireshark\tshark.exe`).
3. Clone this repository and checkout the `develop` branch.
4. Run `npm install` to install dependencies.

## Usage

- Open a `.lua` file and start authoring your dissector.
- Use the REPL panel to test scripts instantly against packet dumps.
- Set breakpoints and debug using the integrated controls.
- Configure the path to `tshark.exe` in your VSCode `settings.json` if not using the default.

### Example: Running the REPL

1. Open your Lua script.
2. Run the REPL command from the Command Palette or use the provided UI button.
3. Output from `tshark.exe` will appear in the Wireshark REPL panel.

### Example: Debugging

1. Set breakpoints in your Lua script by clicking the gutter.
2. Start debugging from the Run menu or Command Palette.
3. Step through code and inspect variables as needed.

## Requirements

- Node.js v22 and npm
- Yeoman and VSCode Extension Generator (global install)
- vsce CLI for packaging/publishing
- Wireshark (with `tshark.exe` available, e.g., `C:\Program Files\Wireshark\tshark.exe`)
- Windows OS (MVP)

## Extension Settings

This extension contributes the following setting:

- `wiresharkLua.tsharkPath`: Path to `tshark.exe` (default: `C:\\Program Files\\Wireshark\\tshark.exe`). Configure in your VSCode `settings.json` if not using the default.

## Known Issues

- Linux/macOS support is not available in the initial release.
- GUI packet viewer is not included (CLI output only).
- Please report issues via GitHub and check for duplicates before submitting.

## Release Notes

### 0.1.0

- Initial release: syntax highlighting, IntelliSense, REPL, debug integration, Windows support.

## Contribution Guidelines

- Follow the TypeScript style guide in `typescript_style_guide.md`.
- Use single quotes, no semicolons, and 2-space indentation.
- Run `npm run lint` before committing.
- Submit pull requests to the `develop` branch.

## Extension Guidelines

See the [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) for best practices.

## Working with Markdown

- Split the editor (`Ctrl+\` on Windows/Linux)
- Toggle preview (`Shift+Ctrl+V`)
- Use `Ctrl+Space` for Markdown snippets

For more info:

- [VSCode Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

## License

MIT License
