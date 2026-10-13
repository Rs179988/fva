import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'node:fs';
import { inferInvariants } from '../domain/invariantInferrer.js';
import { generatePropertyTestScript } from '../domain/propertyTestGenerator.js';
import { generateSmtLibProof } from '../domain/smtGenerator.js';
import { StateModel } from '../domain/types.js';

export function runMcpServer() {
  const server = new Server(
    {
      name: 'fva-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'inspect_state_model',
          description: 'Parses a state model and reports state variables, transitions, and constraints.',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: { type: 'string', description: 'Path to state model JSON file' },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'infer_system_invariants',
          description: 'Discovers conservation laws, non-negative quantity bounds, and monotonicity rules.',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'synthesize_property_tests',
          description: 'Synthesizes property-based test suites to fuzz invariant stability across randomized state transitions.',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'generate_smt_proof',
          description: 'Generates SMT-LIB 2.0 assertions for Z3/CVC5 automated theorem solvers to prove correctness.',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
            },
            required: ['filePath'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const filePath = args?.filePath as string;

    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const model: StateModel = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const invariants = inferInvariants(model);

    switch (name) {
      case 'inspect_state_model':
        return { content: [{ type: 'text', text: JSON.stringify(model, null, 2) }] };

      case 'infer_system_invariants':
        return { content: [{ type: 'text', text: JSON.stringify(invariants, null, 2) }] };

      case 'synthesize_property_tests':
        return { content: [{ type: 'text', text: generatePropertyTestScript(model, invariants) }] };

      case 'generate_smt_proof':
        return { content: [{ type: 'text', text: generateSmtLibProof(model, invariants) }] };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  const transport = new StdioServerTransport();
  server.connect(transport);
}
