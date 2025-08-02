# MCP Analyzer Server

A dedicated MCP (Model Context Protocol) server for security analysis and malicious tool detection.

## Features

- **`analyze_mcp_tool`**: Enhanced context-aware security analysis for individual MCP tools
- **`batch_analyze_tools`**: Comprehensive security assessment for multiple tools at once
- **Context-aware detection**: Reduces false positives and negatives
- **Behavioral pattern analysis**: Identifies tool poisoning and covert operations
- **Risk scoring**: Provides detailed risk assessment with confidence levels

## Installation

```bash
npm install
npm run build
```

## Usage

### Start the server
```bash
npm start
# or
node dist/mcp-analyzer.js
```

### Test the server
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/mcp-analyzer.js
```

## Tools

### analyze_mcp_tool
Analyzes a single MCP tool for malicious indicators.

**Input:**
- `tool_name`: Name of the MCP tool
- `tool_description`: Description of the MCP tool  
- `tool_input_schema`: Input schema (JSON string, optional)

**Output:**
- Comprehensive security analysis report
- Risk level assessment (LOW/MEDIUM/HIGH)
- Malicious indicators detection
- Security recommendations

### batch_analyze_tools
Analyzes multiple MCP tools at once for comprehensive security assessment.

**Input:**
- `tools`: Array of tools to analyze

**Output:**
- Batch analysis report for all tools
- Comparative risk assessment
- Security recommendations for the toolset

## Security Analysis Features

- **Context-aware detection**: Uses semantic analysis to reduce false positives
- **Behavioral pattern analysis**: Identifies tool poisoning and covert operations
- **Input schema analysis**: Examines tool parameters for dangerous patterns
- **Risk scoring**: Provides detailed risk assessment with confidence levels
- **Security recommendations**: Offers specific mitigation strategies

## Use Cases

- **MCP tool security research**: Analyze tools for malicious patterns
- **Security assessment**: Evaluate tool safety before deployment
- **Compliance checking**: Ensure tools meet security requirements
- **Threat detection**: Identify potentially dangerous MCP tools

## License

MIT 