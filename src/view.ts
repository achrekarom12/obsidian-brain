import { ItemView, WorkspaceLeaf, MarkdownRenderer, setIcon } from "obsidian";
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

        const headerContainer = container.createDiv({ cls: "brain-chat-header-container" });
        const titleWrapper = headerContainer.createDiv({ cls: "brain-chat-title-wrapper" });
        const iconContainer = titleWrapper.createDiv({ cls: "brain-chat-header-icon" });
        setIcon(iconContainer, "brain");
        titleWrapper.createEl("h2", { text: "Brainy", cls: "brain-chat-title" });
        headerContainer.createDiv({ cls: "brain-chat-subtitle", text: "Your AI Assistant" });

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

        const appendMessage = async (sender: "user" | "ai", text: string) => {
            const msgWrap = this.chatHistory.createDiv({ cls: `brain-chat-msg-wrap ${sender}` });
            const msgText = msgWrap.createDiv({ cls: "brain-chat-msg-text" });

            if (text !== "...") {
                await MarkdownRenderer.render(this.app, text, msgText, "", this);
            } else {
                msgText.setText(text);
            }

            if (sender === "ai") {
                const footer = msgWrap.createDiv({ cls: "brain-chat-msg-footer" });

                // Add timestamp
                const now = new Date();
                const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                footer.createDiv({ cls: "brain-chat-timestamp", text: timestamp });

                const copyBtn = footer.createDiv({ cls: "brain-chat-copy-btn", title: "Copy response" });
                setIcon(copyBtn, "copy");

                copyBtn.addEventListener("click", () => {
                    const textContent = msgText.querySelector('.brain-chat-text-content');
                    const textToCopy = textContent ? (textContent as HTMLElement).innerText : msgText.innerText;

                    navigator.clipboard.writeText(textToCopy).then(() => {
                        copyBtn.empty();
                        setIcon(copyBtn, "check");
                        copyBtn.addClass("success");

                        setTimeout(() => {
                            copyBtn.removeClass("success");
                            copyBtn.empty();
                            setIcon(copyBtn, "copy");
                        }, 2000);
                    }).catch(err => {
                        console.error("Failed to copy text:", err);
                    });
                });
            }

            this.chatHistory.scrollTo(0, this.chatHistory.scrollHeight);
            return msgText;
        };

        const handleSend = async () => {
            const query = inputField.value.trim();
            if (query) {
                await appendMessage("user", query);
                inputField.value = "";
                const aiMsgText = await appendMessage("ai", "...");
                let fullText = "";

                try {
                    const agent = await createBrainAgent(this.plugin);
                    const stream = await agent.stream(query, {
                        maxSteps: 5,
                        memory: {
                            thread: this.threadId,
                            resource: "obsidian-user",
                        },
                    });

                    aiMsgText.setText("");

                    const toolBoxes = new Map<string, { container: HTMLDivElement, status: HTMLDivElement, content: HTMLDivElement }>();

                    const createToolBox = (toolName: string, toolCallId: string, args: Record<string, unknown>) => {
                        const container = aiMsgText.createDiv({ cls: 'brain-chat-tool-container' });
                        const header = container.createDiv({ cls: 'brain-chat-tool-header' });

                        // Icon
                        const iconEl = header.createDiv({ cls: 'brain-chat-tool-icon' });
                        // Simple SVG wrench icon
                        setIcon(iconEl, "wrench");

                        header.createDiv({ cls: 'brain-chat-tool-name', text: toolName });

                        const status = header.createDiv({ cls: 'brain-chat-tool-status running' });
                        status.createDiv({ cls: 'brain-chat-tool-status-dot' });
                        status.createSpan({ text: 'Running' });

                        const expand = header.createDiv({ cls: 'brain-chat-tool-expand' });
                        setIcon(expand, "chevron-down");

                        const content = container.createDiv({ cls: 'brain-chat-tool-content' });

                        const paramsSection = content.createDiv({ cls: 'brain-chat-tool-section' });
                        paramsSection.createDiv({ cls: 'brain-chat-tool-section-label', text: 'Parameters' });
                        paramsSection.createDiv({ cls: 'brain-chat-tool-data', text: JSON.stringify(args, null, 2) });

                        header.addEventListener('click', () => {
                            container.classList.toggle('expanded');
                        });

                        toolBoxes.set(toolCallId, { container, status, content });
                    };

                    for await (const chunk of stream.fullStream) {
                        console.debug('Chunk type:', chunk.type, chunk);

                        if (chunk.type === 'text-delta') {
                            const payload = (chunk as { payload: { text: string } }).payload;
                            fullText += payload.text;
                        } else if (chunk.type === 'tool-call') {
                            const payload = (chunk as { payload: { toolName: string, toolCallId: string, args: Record<string, unknown> } }).payload;
                            createToolBox(payload.toolName, payload.toolCallId, payload.args);
                        } else if (chunk.type === 'tool-result') {
                            const payload = (chunk as { payload: { toolCallId: string, result: unknown } }).payload;
                            const box = toolBoxes.get(payload.toolCallId);
                            if (box) {
                                box.status.className = 'brain-chat-tool-status completed';
                                box.status.empty();
                                box.status.createDiv({ cls: 'brain-chat-tool-status-dot' });
                                box.status.createSpan({ text: 'Completed' });

                                const resultSection = box.content.createDiv({ cls: 'brain-chat-tool-section' });
                                resultSection.createDiv({ cls: 'brain-chat-tool-section-label', text: 'Result' });
                                const resultText = typeof payload.result === 'string' ? payload.result : JSON.stringify(payload.result, null, 2);
                                resultSection.createDiv({ cls: 'brain-chat-tool-data', text: resultText });
                            }
                        }

                        if (fullText) {
                            // Don't clear every time if we want to keep tool boxes!
                            // Instead, we might need a separate text element for the AI response
                            // Or just manage the Markdown rendering carefully.
                            // For now, let's keep it simple: if fullText changed, we render it.
                            // BUT MarkdownRenderer.render(..., aiMsgText, ...) replaces content.
                            // We need to keep tool boxes visible.

                            // Let's create a dedicated text element inside aiMsgText if it doesn't exist
                            let textEl = aiMsgText.querySelector('.brain-chat-text-content') as HTMLDivElement;
                            if (!textEl) {
                                textEl = aiMsgText.createDiv({ cls: 'brain-chat-text-content' });
                            }
                            textEl.empty();
                            await MarkdownRenderer.render(this.app, fullText, textEl, "", this);
                        }
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
