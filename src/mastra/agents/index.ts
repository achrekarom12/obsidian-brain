import { Agent } from "@mastra/core/agent";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAzure } from '@ai-sdk/azure';
import { BrainSettings } from '../../settings';
import type { Memory } from '@mastra/memory';

// Static imports of memory modules removed to prevent load-time crashes in Obsidian
// We use type-only imports to satisfy the linter without actually bundling the modules at the top level

let memoryInstance: Memory | undefined;

export async function getMemory() {
    if (!memoryInstance) {
        try {
            // Dynamic import to defer loading until first use
            const { Memory } = await import('@mastra/memory');
            const { InMemoryStore } = await import('@mastra/core/storage');

            const storage = new InMemoryStore();
            memoryInstance = new Memory({ storage });
        } catch (e) {
            console.error('Failed to initialize Mastra memory:', e);
        }
    }
    return memoryInstance;
}

export function getModel(settings: BrainSettings) {
    const { provider } = settings;

    if (provider === 'OpenAI') {
        const openai = createOpenAI({
            apiKey: settings.openaiApiKey,
        });
        return openai(settings.openaiModel || 'gpt-4o');
    } else if (provider === 'Google') {
        const google = createGoogleGenerativeAI({
            apiKey: settings.googleApiKey,
        });
        return google(settings.googleModel || 'gemini-1.5-pro');
    } else if (provider === 'AzureOpenAI') {
        const azure = createAzure({
            apiKey: settings.azureApiKey,
            baseURL: settings.azureBaseUrl,
        });
        // For Azure, the "model" in AI SDK is often the deployment name
        return azure(settings.openaiModel || 'gpt-4o');
    } else if (provider === 'Custom') {
        const openai = createOpenAI({
            apiKey: settings.customApiKey,
            baseURL: settings.customBaseUrl,
        });
        return openai(settings.customModel || 'gpt-4o');
    }

    // Fallback
    const openai = createOpenAI({
        apiKey: settings.openaiApiKey,
    });
    return openai('gpt-4o');
}

export async function createBrainAgent(settings: BrainSettings) {
    const mem = await getMemory();
    return new Agent({
        id: 'brainy',
        name: 'Brainy',
        instructions: 'You are Brainy, a helpful assistant integrated into Obsidian. You help users manage their notes and answer questions.',
        model: getModel(settings),
        memory: mem,
    });
}
