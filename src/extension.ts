/* eslint-disable semi */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { spawn } from "child_process";
import { existsSync } from "fs";

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
      let captureFile = config.get<string>("captureFile", "");
      if (!captureFile) {
        const fileUri = await vscode.window.showOpenDialog({
          canSelectMany: false,
          openLabel: "Select capture file for tshark -r",
          filters: { "PCAP Files": ["pcap", "pcapng"], "All Files": ["*"] },
        });
        if (!fileUri || fileUri.length === 0) {
          vscode.window.showWarningMessage(
            "No capture file selected. Aborting REPL."
          );
          return;
        }
        captureFile = fileUri[0].fsPath;
      }
      const output = vscode.window.createOutputChannel("Wireshark REPL");
      output.show(true);
      output.appendLine(
        `Running: ${tsharkPath} -r ${captureFile} -X lua_script:${scriptPath}`
      );
      if (!existsSync(tsharkPath)) {
        const msg = `tshark.exe not found at: ${tsharkPath}`;
        output.appendLine(`[error] ${msg}`);
        vscode.window.showErrorMessage(msg);
        return;
      }
      if (!existsSync(captureFile)) {
        const msg = `Capture file not found: ${captureFile}`;
        output.appendLine(`[error] ${msg}`);
        vscode.window.showErrorMessage(msg);
        return;
      }
      try {
        const proc = spawn(tsharkPath, [
          "-r",
          captureFile,
          "-X",
          `lua_script:${scriptPath}`,
        ]);
        proc.stdout.on("data", (data) => output.append(data.toString()));
        proc.stderr.on("data", (data) =>
          output.append(`[stderr] ${data.toString()}`)
        );
        proc.on("error", (err) => {
          output.appendLine(`[error] ${err}`);
          vscode.window.showErrorMessage(`Failed to launch tshark.exe: ${err}`);
        });
        proc.on("close", (code) => {
          if (code !== 0) {
            output.appendLine(`\nProcess exited with code ${code}`);
            vscode.window.showErrorMessage(
              `tshark.exe exited with code ${code}`
            );
          } else {
            output.appendLine(`\nProcess exited with code 0`);
          }
        });
      } catch (err) {
        output.appendLine(`[error] ${err}`);
        vscode.window.showErrorMessage(
          "Failed to launch tshark.exe. Check your settings."
        );
      }
    }
  );

  context.subscriptions.push(runRepl);

  // Diagnostic: log environment variables and debug detection
  const debugLog = vscode.window.createOutputChannel("Wireshark Debug");
  debugLog.appendLine("process.env:");
  Object.entries(process.env).forEach(([k, v]) =>
    debugLog.appendLine(`${k}=${v}`)
  );
  debugLog.appendLine(`vscode.env.appHost: ${vscode.env.appHost}`);
  debugLog.appendLine(
    `process.env.VSCODE_DEBUG_MODE: ${process.env.VSCODE_DEBUG_MODE}`
  );
  debugLog.appendLine(
    `process.env.VSCODE_LAUNCHER_PORT: ${process.env.VSCODE_LAUNCHER_PORT}`
  );
  debugLog.appendLine(`vscode.env.appName: ${vscode.env.appName}`);
  // Automatically run the REPL if the setting is enabled
  const autoRun = vscode.workspace
    .getConfiguration("wiresharkLua")
    .get<boolean>("autoRunReplOnActivate", false);
  debugLog.appendLine(`wiresharkLua.autoRunReplOnActivate: ${autoRun}`);
  if (autoRun) {
    debugLog.appendLine(
      "autoRunReplOnActivate is true, running REPL automatically..."
    );
    setTimeout(() => {
      vscode.commands.executeCommand("wireshark-lua-dissector.runRepl");
    }, 1000);
  }

  const hoverProvider = vscode.languages.registerHoverProvider("lua", {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(
        position,
        /[A-Za-z_][A-Za-z0-9_.]*/
      );
      if (!range) {
        return;
      }
      const word = document.getText(range);
      // Support both base and method (e.g., Field, Field.new)
      const base = word.split(".")[0];
      if (WIRESHARK_API_DOCS[word]) {
        return new vscode.Hover(WIRESHARK_API_DOCS[word]);
      } else if (WIRESHARK_API_DOCS[base]) {
        return new vscode.Hover(WIRESHARK_API_DOCS[base]);
      }
    },
  });
  context.subscriptions.push(hoverProvider);

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    "lua",
    {
      provideCompletionItems(document, position) {
        const completions = Object.entries(WIRESHARK_API_DOCS).map(
          ([label, doc]) => {
            const item = new vscode.CompletionItem(
              label,
              vscode.CompletionItemKind.Function
            );
            item.detail = "Wireshark Lua API";
            item.documentation = doc;
            item.insertText = label;
            item.filterText = label;
            item.sortText = "0" + label; // Prioritize Wireshark API
            return item;
          }
        );
        return completions;
      },
    },
    ".",
    ":"
  );
  context.subscriptions.push(completionProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

const WIRESHARK_API_DOCS: Record<string, string> = {
  get_version:
    "Wireshark Lua API: get_version\nGets the Wireshark version as a string.",
  set_plugin_info:
    "Wireshark Lua API: set_plugin_info\nSet a Lua table with plugin metadata (version, description, author, repository).",
  format_date:
    "Wireshark Lua API: format_date\nFormats an absolute timestamp into a human-readable date.",
  format_time:
    "Wireshark Lua API: format_time\nFormats a relative timestamp into a human-readable time.",
  get_preference:
    "Wireshark Lua API: get_preference\nGet the value of a Wireshark preference.",
  set_preference:
    "Wireshark Lua API: set_preference\nSet the value of a Wireshark preference.",
  reset_preference:
    "Wireshark Lua API: reset_preference\nReset a Wireshark preference to its default value.",
  apply_preferences:
    "Wireshark Lua API: apply_preferences\nWrite preferences to file and apply changes.",
  report_failure:
    "Wireshark Lua API: report_failure\nReport a failure message to the user.",
  dofile:
    "Wireshark Lua API: dofile\nLoad and execute a Lua file, searching additional directories.",
  loadfile:
    "Wireshark Lua API: loadfile\nLoad and compile a Lua file as a chunk, searching additional directories.",
  register_stat_cmd_arg:
    "Wireshark Lua API: register_stat_cmd_arg\nRegister a function to handle a -z command-line option.",

  gui_enabled: "Wireshark Lua API: gui_enabled\nCheck if a GUI is available.",
  register_menu:
    "Wireshark Lua API: register_menu\nRegister a menu item in a Wireshark main menu.",
  register_packet_menu:
    "Wireshark Lua API: register_packet_menu\nRegister a context menu item in the packet list.",
  new_dialog:
    "Wireshark Lua API: new_dialog\nDisplay an input dialog with labeled fields.",
  retap_packets:
    "Wireshark Lua API: retap_packets\nRescan packets and invoke tap listeners without redisplay.",
  copy_to_clipboard:
    "Wireshark Lua API: copy_to_clipboard\nCopy a string into the system clipboard.",
  open_capture_file:
    "Wireshark Lua API: open_capture_file\nOpen and display a capture file with an optional display filter.",
  get_filter:
    "Wireshark Lua API: get_filter\nGet the current display filter text.",
  set_filter: "Wireshark Lua API: set_filter\nSet the display filter text.",
  get_color_filter_slot:
    "Wireshark Lua API: get_color_filter_slot\nGet the packet coloring rule for a given slot.",
  set_color_filter_slot:
    "Wireshark Lua API: set_color_filter_slot\nSet the packet coloring rule for a given slot.",

  ProgDlg:
    "Wireshark Lua API: ProgDlg\nCreates and manages a modal progress bar dialog.",
  TextWindow:
    "Wireshark Lua API: TextWindow\nCreates and manages a text output window.",

  Dissector:
    "Wireshark Lua API: Dissector\nReference to a dissector, used to call it on packets.",
  DissectorTable:
    "Wireshark Lua API: DissectorTable\nTable of subdissectors for a protocol (e.g., tcp.port).",
  Pref: "Wireshark Lua API: Pref\nConstruct and manage preferences for a protocol.",
  Prefs: "Wireshark Lua API: Prefs\nTable of preferences for a protocol.",
  Proto: "Wireshark Lua API: Proto\nDefines a new protocol dissector.",
  ProtoExpert:
    "Wireshark Lua API: ProtoExpert\nDefine expert information (warnings, notes) for a protocol.",
  ProtoField:
    "Wireshark Lua API: ProtoField\nDefine fields for protocol tree and filtering.",

  register_postdissector:
    "Wireshark Lua API: register_postdissector\nRegister a Lua postdissector function.",
  dissect_tcp_pdus:
    "Wireshark Lua API: dissect_tcp_pdus\nHelper to reassemble TCP PDUs for re-dissection.",
  all_field_infos:
    "Wireshark Lua API: all_field_infos\nReturn an array of all FieldInfo objects in a packet.",

  Field:
    "Wireshark Lua API: Field\nLookup a protocol field instance in packet info.",
  FieldInfo:
    "Wireshark Lua API: FieldInfo\nRepresents a field occurrence in a packet dissection.",

  Address:
    "Wireshark Lua API: Address\nConvert data to a network address object.",
  Column:
    "Wireshark Lua API: Column\nGet or set a column value in the packet list.",
  Columns: "Wireshark Lua API: Columns\nAccess all packet list columns.",
  Conversation:
    "Wireshark Lua API: Conversation\nTrack conversational state across packets.",
  NSTime:
    "Wireshark Lua API: NSTime\nHandle network timestamp representations.",
  Pinfo: "Wireshark Lua API: Pinfo\nPacket information passed to a dissector.",
  PrivateTable:
    "Wireshark Lua API: PrivateTable\nPer-packet private storage table.",

  ByteArray:
    "Wireshark Lua API: ByteArray\nAPI to access packet bytes as an array.",
  Tvb: "Wireshark Lua API: Tvb\nA testy virtual buffer object for packet data.",
  TvbRange: "Wireshark Lua API: TvbRange\nRepresents a range subset of a Tvb.",
  TreeItem:
    "Wireshark Lua API: TreeItem\nRepresents a node in the protocol dissection tree.",
  Listener:
    "Wireshark Lua API: Listener\nRegisters a listener to process packets postdissection.",

  Dumper:
    "Wireshark Lua API: Dumper\nCreates an object to write packets to a capture file.",
  PseudoHeader:
    "Wireshark Lua API: PseudoHeader\nGenerate pseudo-header data for a dumper file.",

  CaptureInfo:
    "Wireshark Lua API: CaptureInfo\nMetadata and functions for capture file info.",
  CaptureInfoConst:
    "Wireshark Lua API: CaptureInfoConst\nRead-only capture file metadata.",
  File: "Wireshark Lua API: File\nFile I/O for custom capture file formats.",
  FileHandler:
    "Wireshark Lua API: FileHandler\nRegister handlers for custom file formats.",
  FrameInfo:
    "Wireshark Lua API: FrameInfo\nMetadata and functions for a single packet frame.",
  FrameInfoConst:
    "Wireshark Lua API: FrameInfoConst\nRead-only frame metadata.",

  Dir: "Wireshark Lua API: Dir\nAPI for iterating directories of capture files.",

  Int64: "Wireshark Lua API: Int64\nHandle signed 64-bit integer values.",
  UInt64: "Wireshark Lua API: UInt64\nHandle unsigned 64-bit integer values.",

  Struct:
    "Wireshark Lua API: Struct\nBinary pack/unpack support for structured data.",

  GcryptCipher:
    "Wireshark Lua API: GcryptCipher\nSymmetric cipher support using libgcrypt.",
  gcry_cipher_algo_info:
    "Wireshark Lua API: gcry_cipher_algo_info\nGet information on a cipher algorithm.",
  gcry_cipher_algo_name:
    "Wireshark Lua API: gcry_cipher_algo_name\nGet the name of a cipher algorithm.",
  gcry_cipher_map_name:
    "Wireshark Lua API: gcry_cipher_map_name\nMap a cipher alias to its algorithm name.",
  gcry_cipher_mode_from_oid:
    "Wireshark Lua API: gcry_cipher_mode_from_oid\nGet cipher mode using its OID.",
  gcry_cipher_get_algo_keylen:
    "Wireshark Lua API: gcry_cipher_get_algo_keylen\nGet key length for a cipher algorithm.",
  gcry_cipher_get_algo_blklen:
    "Wireshark Lua API: gcry_cipher_get_algo_blklen\nGet block length for a cipher algorithm.",

  rex_pcre2:
    "Wireshark Lua API: rex_pcre2\nFunctions for PCRE2 regular expression matching.",
  bit: "Wireshark Lua API: bit\nBitwise operations on integers.",

  wtap_file_type_subtype_description:
    "Wireshark Lua API: wtap_file_type_subtype_description\nGet description of a capture file subtype.",
  wtap_file_type_subtype_name:
    "Wireshark Lua API: wtap_file_type_subtype_name\nGet name of a capture file subtype.",
  wtap_name_to_file_type_subtype:
    "Wireshark Lua API: wtap_name_to_file_type_subtype\nConvert subtype name to its numeric value.",
  wtap_pcap_file_type_subtype:
    "Wireshark Lua API: wtap_pcap_file_type_subtype\nNumeric constant for PCAP file subtype.",
  wtap_pcap_nsec_file_type_subtype:
    "Wireshark Lua API: wtap_pcap_nsec_file_type_subtype\nNumeric constant for PCAP (ns) file subtype.",
  wtap_pcapng_file_type_subtype:
    "Wireshark Lua API: wtap_pcapng_file_type_subtype\nNumeric constant for PCAPNG file subtype.",
  register_filehandler:
    "Wireshark Lua API: register_filehandler\nRegister a handler for custom capture file formats.",
  deregister_filehandler:
    "Wireshark Lua API: deregister_filehandler\nDeregister a custom capture file handler.",
};
