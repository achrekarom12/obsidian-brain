import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_CHAT = "brain-chat-view";

export class BrainView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
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

        container.createEl("h2", { text: "Brainy" });

        const chatHistory = container.createDiv({ cls: "brain-chat-history" });
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
            const msgWrap = chatHistory.createDiv({ cls: `brain-chat-msg-wrap ${sender}` });
            msgWrap.createDiv({ cls: "brain-chat-msg-text", text: text });
            chatHistory.scrollTo(0, chatHistory.scrollHeight);
        };

        const handleSend = () => {
            const query = inputField.value.trim();
            if (query) {
                appendMessage("user", query);
                inputField.value = "";

                // Simulate AI response
                setTimeout(() => {
                    appendMessage("ai", "Gotcha");
                }, 500);
            }
        };

        sendButton.addEventListener("click", handleSend);
        inputField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleSend();
            }
        });
    }

    async onClose() {
        // Nothing to clean up
    }
}
