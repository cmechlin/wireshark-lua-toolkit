-- myproto.lua
-- A minimal “Hello World” Lua dissector for Wireshark

-- 1. Define the protocol
local myproto = Proto("myproto", "My Protocol")

-- 2. (Optional) Define any fields (none in this minimal example)
-- myproto.fields.example = ProtoField.uint8("myproto.example", "Example Field", base.DEC)

-- 3. The dissector function
function myproto.dissector(buffer, pinfo, tree)

    -- print("test")
    -- buffer: Tvb, pinfo: PacketInfo, tree: TreeItem

    -- a) Label the protocol column
    pinfo.cols.protocol = myproto.name:upper()

    -- b) Add a subtree for “My Protocol”
    local subtree = tree:add(myproto, buffer(), "My Protocol Data")

    -- c) For now, just dump the entire packet payload as bytes
    --    (In a real dissector you’d parse fields here)
    subtree:add(buffer(0), buffer:len(), "Raw Data")
end

-- 4. Register the dissector on TCP port 12345
local udp_port = DissectorTable.get("udp.port")
udp_port:add(2381, myproto)
