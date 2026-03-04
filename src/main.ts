import { App, Editor, MarkdownView, Modal, Plugin, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, BrainSettings, BrainSettingTab } from "./settings";
import { BrainView, VIEW_TYPE_CHAT } from './view';
import { Logger } from './logger';

// Remember to rename these classes and interfaces!

export default class BrainPlugin extends Plugin {
	settings: BrainSettings;

	async onload() {
		Logger.init(this);
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_CHAT,
			(leaf) => new BrainView(leaf, this)
		);

		this.addRibbonIcon('brain', 'Brain', () => {
			void this.activateView();
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Brain active');

		// Commands
		this.addCommand({
			id: 'open-brain-chat',
			name: 'Open chat',
			callback: () => {
				void this.activateView();
			}
		});

		this.addCommand({
			id: 'new-brain-chat',
			name: 'New chat',
			callback: () => {
				const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_CHAT);
				if (leaves.length > 0) {
					const leaf = leaves[0];
					if (leaf) {
						const view = leaf.view as BrainView;
						if (view.clearHistory) {
							view.clearHistory();
						}
					}
				}
				void this.activateView();
			}
		});

		// this.addCommand({
		// 	id: 'open-modal-simple',
		// 	name: 'Open modal (simple)',
		// 	callback: () => {
		// 		new BrainModal(this.app).open();
		// 	}
		// });

		// this.addCommand({
		// 	id: 'replace-selected',
		// 	name: 'Replace selected content',
		// 	editorCallback: (editor: Editor) => {
		// 		editor.replaceSelection('Sample editor command');
		// 	}
		// });

		// this.addCommand({
		// 	id: 'open-modal-complex',
		// 	name: 'Open modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			if (!checking) {
		// 				new BrainModal(this.app).open();
		// 			}
		// 			return true;
		// 		}
		// 		return false;
		// 	}
		// });

		this.addSettingTab(new BrainSettingTab(this.app, this));
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CHAT);

		if (leaves.length > 0) {
			leaf = leaves[0] as WorkspaceLeaf;
		} else {
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({ type: VIEW_TYPE_CHAT, active: true });
			}
		}

		if (leaf) {
			await workspace.revealLeaf(leaf);
		}
	}

	onunload() {
		// Cleanup if necessary
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<BrainSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class BrainModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
