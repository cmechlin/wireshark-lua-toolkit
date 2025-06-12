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
