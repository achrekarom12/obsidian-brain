import { Agent } from "@mastra/core/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { BrainSettings } from "./settings";
import { getLogger } from "./logger";

export function createBrainAgent(settings: BrainSettings) {
    const logger = getLogger();
    const providerStr = settings.provider;
    let provider: ReturnType<typeof createOpenAI> | ReturnType<typeof createGoogleGenerativeAI> | undefined;
    let model: string | undefined;

    void logger.log("Creating Brain Agent", { provider: providerStr });



    if (settings.provider === 'OpenAI') {
        provider = createOpenAI({
            apiKey: settings.openaiApiKey
        });
        model = settings.openaiModel;
    } else if (settings.provider === 'Google') {
        provider = createGoogleGenerativeAI({
            apiKey: settings.googleApiKey
        });
        model = settings.googleModel;
    }
    // Add other providers as needed...

    if (!provider || !model) {
        void logger.error("Brain creation failure - Provider/Model missing", { providerSelected: settings.provider, modelSelected: model });
        throw new Error(`Provider [${settings.provider}] is not configured correctly in settings. Please go to Settings > Brain.`);
    }



    return new Agent({
        id: "brainy",
        name: "Brainy",
        instructions: "You are a helpful assistant integrated into an Obsidian plugin called Brain. Help the user with their queries accurately and concisely.",
        model: provider(model),
    });

}
