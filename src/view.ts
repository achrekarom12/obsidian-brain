import { ItemView, WorkspaceLeaf } from "obsidian";
import BrainPlugin from "./main";
import { createBrainAgent } from "./mastra/agents";

export const VIEW_TYPE_CHAT = "brain-chat-view";

export class BrainView extends ItemView {
    plugin: BrainPlugin;
    chatHistory: HTMLDivElement;
    threadId: string;

    constructor(leaf: WorkspaceLeaf, plugin: BrainPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.threadId = crypto.randomUUID();
    }

    getViewType() {
        return VIEW_TYPE_CHAT;
    }

    getDisplayText() {
        return "Brain chat";
    }

    getIcon(): string {
        return "brain";
    }

    async onOpen() {
        const container = this.contentEl;
        container.empty();
        container.addClass("brain-chat-container");

        container.createEl("h2", { text: "Brainy", cls: "brain-chat-title" });

        this.chatHistory = container.createDiv({ cls: "brain-chat-history" });

        this.addAction("plus-with-circle", "New Chat", () => {
            this.clearHistory();
        });

        const inputContainer = container.createDiv({ cls: "brain-chat-input-container" });

        const inputField = inputContainer.createEl("input", {
            type: "text",
            placeholder: "Type your query...",
            cls: "brain-chat-input"
        });

        const sendButton = inputContainer.createEl("button", {
            text: "Send",
            cls: "brain-chat-send-btn"
        });

        const appendMessage = (sender: "user" | "ai", text: string) => {
            const msgWrap = this.chatHistory.createDiv({ cls: `brain-chat-msg-wrap ${sender}` });
            const msgText = msgWrap.createDiv({ cls: "brain-chat-msg-text", text: text });
            this.chatHistory.scrollTo(0, this.chatHistory.scrollHeight);
            return msgText;
        };

        const handleSend = async () => {
            const query = inputField.value.trim();
            if (query) {
                appendMessage("user", query);
                inputField.value = "";

                const aiMsgText = appendMessage("ai", "...");
                let fullText = "";

                try {
                    const agent = await createBrainAgent(this.plugin.settings);
                    const stream = await agent.stream(query, {
                        memory: {
                            thread: this.threadId,
                            resource: "obsidian-user",
                        },
                    });

                    aiMsgText.setText("");

                    for await (const chunk of stream.textStream) {
                        fullText += chunk;
                        aiMsgText.setText(fullText);
                        this.chatHistory.scrollTo(0, this.chatHistory.scrollHeight);
                    }
                } catch (error) {
                    console.error("Mastra error:", error);
                    aiMsgText.setText("Error: " + (error instanceof Error ? error.message : String(error)));
                }
            }
        };

        sendButton.addEventListener("click", () => {
            void handleSend();
        });
        inputField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                void handleSend();
            }
        });
    }

    async onClose() {
        // Nothing to clean up
    }

    clearHistory() {
        if (this.chatHistory) {
            this.chatHistory.empty();
        }
        this.threadId = crypto.randomUUID();
    }
}
