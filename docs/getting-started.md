# Getting Started

DesignOS can be set up in under 10 minutes.

## Requirements
- Node.js (v22.x recommended)
- `pnpm`
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Razepriv/DesignOS-MCP.git
   cd DesignOS-MCP
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run setup & diagnostics**
   ```bash
   pnpm designos:setup
   pnpm designos:doctor
   ```

4. **Start the MCP server**
   ```bash
   pnpm dev
   ```

## Connect to an AI Client

You can connect your preferred AI agent (like Cursor or Claude Desktop) directly to the running instance, or configure it to spin up the local server automatically. See the [MCP Setup Guide](./mcp-setup.md) for detailed instructions.
