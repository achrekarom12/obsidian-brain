import { Agent } from "@mastra/core/agent";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAzure } from '@ai-sdk/azure';
import { BrainSettings } from '../../settings';

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

export function createBrainAgent(settings: BrainSettings) {
    return new Agent({
        id: 'brainy',
        name: 'Brainy',
        instructions: 'You are Brainy, a helpful assistant integrated into Obsidian. You help users manage their notes and answer questions.',
        model: getModel(settings),
    });
}
