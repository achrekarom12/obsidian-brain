import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { Chat } from "./Chat";
import BrainPlugin from "./main";

export const VIEW_TYPE_CHAT = "brain-chat-view";

export class BrainView extends ItemView {
    root: Root | null = null;
    plugin: BrainPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: BrainPlugin) {
        super(leaf);
        this.plugin = plugin;
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

        // Create mounting point
        const mount = container.createDiv({ cls: "brain-react-mount" });
        this.root = createRoot(mount);
        this.root.render(
            <React.StrictMode>
                <Chat settings={this.plugin.settings} />
            </React.StrictMode>
        );
    }

    async onClose() {
        this.root?.unmount();
    }
}
