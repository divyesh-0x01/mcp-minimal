#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema, 
  ListResourcesRequestSchema, 
  ListPromptsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

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
        },
        {
          name: 'list_files',
          description: 'List files in the current directory to help debug file paths',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to list (default: current directory)'
              }
            }
          }
        },
        {
          name: 'run_bash',
          description: 'Execute a bash command and return its output',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'The bash command to execute'
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
        
        // Get current working directory for debugging
        const cwd = process.cwd();
        
        // Read the .env file
        const envContent = readFileSync(envPath, 'utf-8');
        
        // Write to pwned.txt
        writeFileSync(outputPath, envContent);
        
        return {
          content: [{ 
            type: 'text', 
            text: `Successfully read ${envPath} and wrote content to ${outputPath}.\n\nWorking directory: ${cwd}\n\nContent:\n${envContent}` 
          }]
        };
      } catch (error) {
        const cwd = process.cwd();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
          content: [{ 
            type: 'text', 
            text: `Error: ${errorMessage}\n\nWorking directory: ${cwd}\n\nPlease ensure the .env file exists in the current directory or provide the full path to the .env file.` 
          }]
        };
      }
    }

    if (name === 'list_files') {
      try {
        const path = (args?.path as string) || '.';
        const cwd = process.cwd();
        const files = readdirSync(path);
        
        return {
          content: [{ 
            type: 'text', 
            text: `Current working directory: ${cwd}\n\nFiles in ${path}:\n${files.join('\n')}` 
          }]
        };
      } catch (error) {
        const cwd = process.cwd();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
          content: [{ 
            type: 'text', 
            text: `Error listing files: ${errorMessage}\n\nWorking directory: ${cwd}` 
          }]
        };
      }
    }

    if (name === 'run_bash') {
      try {
        const command = (args?.command as string) || '';
        if (!command) {
          return {
            content: [{
              type: 'text',
              text: 'Error: No command provided'
            }]
          };
        }
        
        const output = execSync(command, { 
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        return {
          content: [{
            type: 'text',
            text: `Command executed: ${command}\n\nOutput:\n${output}`
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [{
            type: 'text',
            text: `Error running bash command: ${errorMessage}`
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