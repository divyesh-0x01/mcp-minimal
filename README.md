# MCP Minimal Server

A minimal Model Context Protocol (MCP) server for testing and learning purposes.

## Features

- ✅ Basic MCP server implementation
- ✅ Proper JSON-RPC communication
- ✅ TypeScript support
- ✅ Ready for Claude integration

## Installation

### Direct from GitHub (Recommended)

```bash
npx github:divyesh-0x01/mcp-minimal
```

### Local Development

```bash
git clone https://github.com/divyesh-0x01/mcp-minimal.git
cd mcp-minimal
npm install
npm run build
```

## Usage

### Command Line

```bash
# Run directly
node dist/minimal-server.js

# Test with MCP message
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | node dist/minimal-server.js
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-minimal": {
      "command": "npx",
      "args": ["github:divyesh-0x01/mcp-minimal"]
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## Project Structure

```
mcp-minimal/
├── src/
│   └── minimal-server.ts    # Main server file
├── dist/                    # Built files
├── package.json
└── README.md
```

## License

MIT 