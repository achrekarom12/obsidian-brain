import { createTool } from '@mastra/core/tools';
import { App, TFile } from 'obsidian';
import { z } from 'zod';

export const createVaultTools = (app: App) => {
    return {
        list_notes: createTool({
            id: 'list_notes',
            description: 'List all markdown notes in the Obsidian vault',
            inputSchema: z.object({}),
            execute: async () => {
                console.debug('Tool: list_notes called');
                const files = app.vault.getMarkdownFiles();
                console.debug(`Tool: list_notes found ${files.length} notes`);
                console.debug(files.map(f => f.path));
                return {
                    notes: files.map(f => f.path)
                };
            }
        }),
        read_note: createTool({
            id: 'read_note',
            description: 'Read the content of a specific note in the vault',
            inputSchema: z.object({
                path: z.string().describe('The full path of the note to read (e.g., "Folder/Note.md")'),
            }),
            execute: async ({ path }: { path: string }) => {
                console.debug(`Tool: read_note called with path: ${path}`);
                const file = app.vault.getAbstractFileByPath(path);
                if (file instanceof TFile) {
                    const content = await app.vault.read(file);
                    console.debug(`Tool: read_note successfully read ${path}`);
                    return { content };
                }
                console.error(`Tool: read_note failed to find path: ${path}`);
                return { error: `File not found at path: ${path}` };
            }
        }),
        search_notes: createTool({
            id: 'search_notes',
            description: 'Search for notes containing a specific keyword',
            inputSchema: z.object({
                query: z.string().describe('The keyword to search for'),
            }),
            execute: async ({ query }: { query: string }) => {
                console.debug(`Tool: search_notes called with query: ${query}`);
                const files = app.vault.getMarkdownFiles();
                const results = [];

                for (const file of files) {
                    const content = await app.vault.read(file);
                    if (content.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            path: file.path,
                            snippet: content.substring(0, 200) + '...'
                        });
                    }
                    if (results.length >= 10) break;
                }

                console.debug(`Tool: search_notes found ${results.length} results`);
                return { results };
            }
        }),
        get_active_note: createTool({
            id: 'get_active_note',
            description: 'Get the content of the currently active note in Obsidian',
            inputSchema: z.object({}),
            execute: async () => {
                console.debug('Tool: get_active_note called');
                const activeFile = app.workspace.getActiveFile();
                if (activeFile) {
                    const content = await app.vault.read(activeFile);
                    console.debug(`Tool: get_active_note reading active file: ${activeFile.path}`);
                    return {
                        path: activeFile.path,
                        content: content
                    };
                }
                console.debug('Tool: get_active_note - no active file found');
                return { error: 'No active file found' };
            }
        })
    };
};
