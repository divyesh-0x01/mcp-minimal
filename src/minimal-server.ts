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
          name: 'check_tool_poisoning',
          description: 'Check for tool poisoning vulnerabilities in the current MCP server',
          inputSchema: {
            type: 'object',
            properties: {
              detailed: {
                type: 'boolean',
                description: 'Whether to provide detailed analysis (default: true)'
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

    if (name === 'check_tool_poisoning') {
      try {
        const detailed = args?.detailed !== false; // Default to true
        
        interface Vulnerability {
          type: string;
          tools: string[];
          risk: string;
          description: string;
        }
        
        const vulnerabilities: Vulnerability[] = [];
        const recommendations: string[] = [];
        
        // Check for dangerous tools
        const dangerousTools = [
          { name: 'run_bash', risk: 'HIGH', description: 'Allows arbitrary command execution' },
          { name: 'list_files', risk: 'MEDIUM', description: 'Can expose sensitive file information' }
        ];
        
        // Check for file system access
        const fileSystemTools = ['list_files'];
        if (fileSystemTools.length > 0) {
          vulnerabilities.push({
            type: 'File System Access',
            tools: fileSystemTools,
            risk: 'MEDIUM',
            description: 'Tools that can access file system may expose sensitive information'
          });
        }
        
        // Check for command execution
        const commandExecutionTools = ['run_bash'];
        if (commandExecutionTools.length > 0) {
          vulnerabilities.push({
            type: 'Command Execution',
            tools: commandExecutionTools,
            risk: 'HIGH',
            description: 'Tools that can execute arbitrary commands pose significant security risks'
          });
        }
        
        // Generate recommendations
        if (commandExecutionTools.length > 0) {
          recommendations.push('Consider removing or restricting command execution tools');
          recommendations.push('Implement input validation and sanitization for command parameters');
          recommendations.push('Use allowlist approach for permitted commands');
        }
        
        if (fileSystemTools.length > 0) {
          recommendations.push('Implement path restrictions to prevent access to sensitive directories');
          recommendations.push('Add file type filtering to prevent access to sensitive files');
        }
        
        recommendations.push('Implement proper authentication and authorization mechanisms');
        recommendations.push('Add rate limiting to prevent abuse');
        recommendations.push('Log all tool usage for audit purposes');
        
        let report = `🔍 Tool Poisoning Vulnerability Analysis\n\n`;
        report += `📊 Summary:\n`;
        report += `- Total tools analyzed: 4\n`;
        report += `- High risk tools: ${commandExecutionTools.length}\n`;
        report += `- Medium risk tools: ${fileSystemTools.length}\n\n`;
        
        if (detailed) {
          report += `🚨 Vulnerabilities Found:\n`;
          vulnerabilities.forEach((vuln, index) => {
            report += `${index + 1}. ${vuln.type} (${vuln.risk} Risk)\n`;
            report += `   Tools: ${vuln.tools.join(', ')}\n`;
            report += `   Description: ${vuln.description}\n\n`;
          });
          
          report += `💡 Recommendations:\n`;
          recommendations.forEach((rec, index) => {
            report += `${index + 1}. ${rec}\n`;
          });
        } else {
          report += `🚨 High Risk Tools: ${commandExecutionTools.join(', ')}\n`;
          report += `⚠️ Medium Risk Tools: ${fileSystemTools.join(', ')}\n\n`;
          report += `💡 Key Recommendations:\n`;
          report += `- Remove or restrict command execution capabilities\n`;
          report += `- Implement proper input validation\n`;
          report += `- Add authentication and rate limiting\n`;
        }
        
        return {
          content: [{ type: 'text', text: report }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [{ 
            type: 'text', 
            text: `Error analyzing tool poisoning vulnerabilities: ${errorMessage}` 
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