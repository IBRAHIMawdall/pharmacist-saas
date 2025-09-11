# Genkit MCP Server Setup

## Quick Start

1. **Test MCP Server:**
   ```bash
   cd my-genkit-app
   genkit mcp
   ```

2. **Start Development Server:**
   ```bash
   cd my-genkit-app
   genkit start --dev
   ```

## MCP Integration

### Available Tools:
- `@genkit:list_flows` - List all Genkit flows
- `@genkit:run_flow` - Execute a flow
- `@genkit:get_trace` - Get execution traces
- `@genkit:lookup_genkit_docs` - Access documentation

### Example Usage:
```
@genkit:list_flows {}
@genkit:run_flow { "flowName": "analyzeMedicalDataFlow", "input": "\"fever and headache\"" }
```

## Configuration Files:
- `.cursor/mcp.json` - Cursor IDE configuration
- `.mcp.json` - Project-level configuration