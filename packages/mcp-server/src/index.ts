#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { analyzeDocument, lintMarkdown, formatSarif } from '@readmelens/core';
import { defaultProviderRegistry } from '@readmelens/providers';

const server = new Server(
  {
    name: 'readmelens-mcp-server',
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
        name: 'fetch_readme',
        description: 'Fetch README and repository documentation from GitHub, GitLab, npm, PyPI, or a raw URL',
        inputSchema: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              description: 'Repository name (e.g. "facebook/react"), npm package ("npm:express"), PyPI package ("pypi:requests"), or full URL',
            },
          },
          required: ['source'],
        },
      },
      {
        name: 'analyze_readme',
        description: 'Analyze markdown documentation: calculate 0-100 health score, breakdown, readability, quick start commands, and security audit',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The markdown content to analyze',
            },
            filePath: {
              type: 'string',
              description: 'Optional file path or repository name',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'lint_readme',
        description: 'Lint markdown documentation against best practices, returning violations, line numbers, and suggestions',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The markdown content to lint',
            },
            sarif: {
              type: 'boolean',
              description: 'Whether to return output in standard SARIF v2.1.0 format',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'search_docs',
        description: 'Search across sections and headings in a document',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The markdown documentation text',
            },
            query: {
              type: 'string',
              description: 'The search query or keyword',
            },
          },
          required: ['content', 'query'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'fetch_readme') {
      const source = String(args?.source || '');
      const fetched = await defaultProviderRegistry.fetch(source);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                path: fetched.path,
                content: fetched.content,
                meta: fetched.meta,
                editUrl: fetched.editUrl,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === 'analyze_readme') {
      const content = String(args?.content || '');
      const filePath = args?.filePath ? String(args.filePath) : undefined;
      const report = analyzeDocument(content, filePath);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(report, null, 2),
          },
        ],
      };
    }

    if (name === 'lint_readme') {
      const content = String(args?.content || '');
      const sarif = Boolean(args?.sarif);
      const result = lintMarkdown(content);
      if (sarif) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatSarif([result]), null, 2) }],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }

    if (name === 'search_docs') {
      const content = String(args?.content || '');
      const query = String(args?.query || '').toLowerCase();
      const report = analyzeDocument(content);
      const matchedSections = report.sections.filter(
        s => s.title.toLowerCase().includes(query) || s.content.toLowerCase().includes(query)
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query,
                matchedCount: matchedSections.length,
                results: matchedSections.map(s => ({
                  title: s.title,
                  level: s.level,
                  startLine: s.startLine,
                  snippet: s.content.slice(0, 300),
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error: ${err.message}` }],
    };
  }
});

export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startMcpServer().catch(console.error);
}
