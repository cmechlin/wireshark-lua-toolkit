// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { spawn } from "child_process";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "wireshark-lua-dissector" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "wireshark-lua-dissector.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello World from wireshark lua dissector!"
      );
    }
  );

  context.subscriptions.push(disposable);

  const runRepl = vscode.commands.registerCommand(
    "wireshark-lua-dissector.runRepl",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== "lua") {
        vscode.window.showErrorMessage(
          "Open a Lua script to run in the Wireshark REPL"
        );
        return;
      }
      const scriptPath = editor.document.fileName;
      const config = vscode.workspace.getConfiguration("wiresharkLua");
      const tsharkPath = config.get<string>(
        "tsharkPath",
        "C:\\Program Files\\Wireshark\\tshark.exe"
      );
      const output = vscode.window.createOutputChannel("Wireshark REPL");
      output.show(true);
      output.appendLine(`Running: ${tsharkPath} -X lua_script:${scriptPath}`);
      try {
        const proc = spawn(tsharkPath, ["-X", `lua_script:${scriptPath}`]);
        proc.stdout.on("data", (data) => output.append(data.toString()));
        proc.stderr.on("data", (data) =>
          output.append(`[stderr] ${data.toString()}`)
        );
        proc.on("close", (code) =>
          output.appendLine(`\nProcess exited with code ${code}`)
        );
      } catch (err) {
        output.appendLine(`[error] ${err}`);
        vscode.window.showErrorMessage(
          "Failed to launch tshark.exe. Check your settings."
        );
      }
    }
  );

  context.subscriptions.push(runRepl);
}

// This method is called when your extension is deactivated
export function deactivate() {}
