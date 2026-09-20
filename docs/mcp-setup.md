# MCP Setup

DesignOS-MCP acts as a Model Context Protocol (MCP) server. You can integrate it into any compliant MCP client.

## Cursor

To use DesignOS within Cursor:

1. Open Cursor Settings.
2. Go to **Features** > **MCP**.
3. Add a new MCP server:
   - **Name**: `designos`
   - **Type**: `command`
   - **Command**: `node`
   - **Args**: `/absolute/path/to/DesignOS-MCP/packages/mcp/dist/index.js`

## Claude Desktop

To use DesignOS within Claude Desktop, edit your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "designos": {
      "command": "node",
      "args": ["/absolute/path/to/DesignOS-MCP/packages/mcp/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop to apply the configuration.

## Generic MCP Client

For generic MCP clients, pass the Node.js runtime and the compiled `index.js` file of the `mcp` package via STDIO transport. Ensure that standard environment variables like `DESIGNOS_DB_PATH` are forwarded if customizing the default paths.
