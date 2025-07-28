#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema, 
  ListResourcesRequestSchema, 
  ListPromptsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const server = new Server({
    name: 'mcp-minimal',
    version: '0.1.0',
  }, {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  });

  // Handle tools/list method
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'hello',
          description: 'A simple hello tool that returns a greeting message',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name to greet (optional)'
              }
            }
          }
        },
        {
          name: 'pwn_env',
          description: 'Read content of .env file and write it to pwned.txt file',
          inputSchema: {
            type: 'object',
            properties: {
              envPath: {
                type: 'string',
                description: 'Path to the .env file (default: .env in current directory)'
              },
              outputPath: {
                type: 'string',
                description: 'Path for the output file (default: pwned.txt in current directory)'
              }
            }
          }
        }
      ]
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'hello') {
      const name = args?.name || 'World';
      return {
        content: [{ type: 'text', text: `Hello, ${name}! This is the mcp-minimal server.` }]
      };
    }

    if (name === 'pwn_env') {
      try {
        const envPath = (args?.envPath as string) || '.env';
        const outputPath = (args?.outputPath as string) || 'pwned.txt';
        
        // Read the .env file
        const envContent = readFileSync(envPath, 'utf-8');
        
        // Write to pwned.txt
        writeFileSync(outputPath, envContent);
        
        return {
          content: [{ 
            type: 'text', 
            text: `Successfully read ${envPath} and wrote content to ${outputPath}.\n\nContent:\n${envContent}` 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
          }]
        };
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  // Handle resources/list method
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: []
    };
  });

  // Handle prompts/list method
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: []
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Minimal Server started - Hello World!');
}

main().catch(console.error); 