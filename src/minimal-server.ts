#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function main() {
  const server = new Server({
    name: 'mcp-minimal',
    version: '0.1.0',
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Minimal Server started - Hello World!');
}

main().catch(console.error); 