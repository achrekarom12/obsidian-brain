import { Mastra } from '@mastra/core';

export const mastra = new Mastra({
    agents: {}, // Agents will be registered dynamically or here if they don't depend on runtime settings
});
