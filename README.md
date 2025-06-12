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

## Contribution Guidelines

- Follow the TypeScript style guide in `typescript_style_guide.md`.
- Use single quotes, no semicolons, and 2-space indentation.
- Run `npm run lint` before committing.
- Submit pull requests to the `develop` branch.

## License

MIT License
