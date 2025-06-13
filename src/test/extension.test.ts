import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import type { SinonStub } from "sinon";
import * as childProcess from "child_process";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

suite("Wireshark Lua Dissector Extension", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("REPL command is registered", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes("wireshark-lua-toolkit.runRepl"),
      "REPL command should be registered"
    );
  });

  test("Reads configuration settings", async () => {
    const config = vscode.workspace.getConfiguration("wiresharkLua");
    assert.strictEqual(typeof config.get("tsharkPath"), "string");
    assert.ok(Array.isArray(config.get("tsharkEFields")));
  });

  suite("REPL Integration", () => {
    let spawnStub: SinonStub;
    let showErrorStub: SinonStub;
    let showWarningStub: SinonStub;

    setup(() => {
      spawnStub = sinon.stub(childProcess, "spawn").callsFake(() => {
        return {
          stdout: {
            on: (event: string, cb: Function) => {
              if (event === "data") {
                cb("fake output");
              }
            },
          },
          stderr: {
            on: (event: string, cb: Function) => {
              if (event === "data") {
                cb("tshark: Some fields aren't valid:\n  badfield");
              }
            },
          },
          on: (event: string, cb: Function) => {
            if (event === "close") {
              cb(2);
            }
          },
        } as any;
      });
      showErrorStub = sinon.stub(vscode.window, "showErrorMessage");
      showWarningStub = sinon.stub(vscode.window, "showWarningMessage");
    });

    teardown(() => {
      spawnStub.restore();
      showErrorStub.restore();
      showWarningStub.restore();
    });

    test("REPL command runs and outputs to channel", async () => {
      await vscode.commands.executeCommand("wireshark-lua-toolkit.runRepl");
      assert.ok(spawnStub.called, "spawn should be called");
    });

    test("Shows error notification for invalid tshark field", async () => {
      await vscode.commands.executeCommand("wireshark-lua-toolkit.runRepl");
      assert.ok(
        showErrorStub.called,
        "showErrorMessage should be called for invalid field"
      );
    });
  });

  test("Completion provider returns Wireshark API symbols", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "lua",
      content: "Proto.",
    });
    const pos = new vscode.Position(0, 6);
    const completions =
      await vscode.commands.executeCommand<vscode.CompletionList>(
        "vscode.executeCompletionItemProvider",
        doc.uri,
        pos
      );
    assert.ok(
      completions && completions.items.some((item) => item.label === "Proto"),
      "Completion should include Proto"
    );
  });

  test("Hover provider returns documentation for Wireshark API", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "lua",
      content: "Field.new",
    });
    const pos = new vscode.Position(0, 5);
    const hover = await vscode.commands.executeCommand<vscode.Hover[]>(
      "vscode.executeHoverProvider",
      doc.uri,
      pos
    );
    assert.ok(
      hover && hover.length > 0,
      "Hover should return documentation for Field.new"
    );
  });
});
