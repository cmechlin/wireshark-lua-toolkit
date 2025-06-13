/**
 * Wireshark Lua API Type Declarations
 * Covers core objects: Proto, Field, Listener, and constants
 */

declare interface Proto {
  name: string;
  description: string;
  fields: ProtoField[];
  dissector: (buffer: Tvb, pinfo: Pinfo, tree: TreeItem) => void;
}

declare interface ProtoField {
  name: string;
  abbr: string;
  type: string;
  base: number;
  value?: any;
}

declare interface Field {
  new (name: string, abbr: string, type: string, base: number): ProtoField;
}

declare interface Listener {
  new (protoName: string): Listener;
  remove(): void;
}

declare interface Tap {
  new (name: string): Tap;
  remove(): void;
}

declare interface Tvb {
  len: number;
  raw(offset: number, length: number): Uint8Array;
}

declare interface Pinfo {
  src_port: number;
  dst_port: number;
  match_uint: number;
}

declare interface TreeItem {
  add(protoField: ProtoField, value: any): TreeItem;
}

declare const register_postdissector: (fn: () => void) => void;

declare const register_init: (fn: () => void) => void;

// Additional Wireshark Lua API objects and functions (minimal stubs)
declare interface Dissector {
  call: (tvb: Tvb, pinfo: Pinfo, tree: TreeItem) => void;
}
declare interface DissectorTable {
  add: (name: string, dissector: Dissector) => void;
  remove: (name: string) => void;
}
declare interface Pref {}
declare interface Prefs {}
declare interface ProtoExpert {}
declare interface FieldInfo {}
declare interface Address {}
declare interface Column {}
declare interface Columns {}
declare interface Conversation {}
declare interface NSTime {}
declare interface PrivateTable {}
declare interface ByteArray {}
declare interface TvbRange {}
declare interface Dumper {}
declare interface PseudoHeader {}
declare interface CaptureInfo {}
declare interface CaptureInfoConst {}
declare interface File {}
declare interface FileHandler {}
declare interface FrameInfo {}
declare interface FrameInfoConst {}
declare interface Dir {}
declare interface Int64 {}
declare interface UInt64 {}
declare interface Struct {}
declare interface GcryptCipher {}

declare function register_stat_cmd_arg(fn: () => void): void;
declare function register_menu(...args: any[]): void;
declare function register_packet_menu(...args: any[]): void;
declare function new_dialog(...args: any[]): void;
declare function retap_packets(): void;
declare function copy_to_clipboard(str: string): void;
declare function open_capture_file(path: string, filter?: string): void;
declare function get_filter(): string;
declare function set_filter(filter: string): void;
declare function get_color_filter_slot(slot: number): any;
declare function set_color_filter_slot(slot: number, rule: any): void;
declare function dissect_tcp_pdus(...args: any[]): void;
declare function all_field_infos(): FieldInfo[];
declare function wtap_file_type_subtype_description(subtype: number): string;
declare function wtap_file_type_subtype_name(subtype: number): string;
declare function wtap_name_to_file_type_subtype(name: string): number;
declare const wtap_pcap_file_type_subtype: number;
declare const wtap_pcap_nsec_file_type_subtype: number;
declare const wtap_pcapng_file_type_subtype: number;
declare function register_filehandler(handler: FileHandler): void;
declare function deregister_filehandler(handler: FileHandler): void;
