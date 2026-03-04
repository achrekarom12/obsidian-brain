import { App, Editor, MarkdownView, Modal, Plugin, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, BrainSettings, BrainSettingTab } from "./settings";
import { BrainView, VIEW_TYPE_CHAT } from './view';

// Remember to rename these classes and interfaces!

import { initLogger, getLogger } from "./logger";

export default class BrainPlugin extends Plugin {
	settings: BrainSettings;

	async onload() {
		const pluginDir = this.manifest.dir || '.obsidian/plugins/obsidian-brain';
		initLogger(this.app, pluginDir);
		const logger = getLogger();
		await logger.log("Brain Plugin loading...");

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
		statusBarItemEl.setText('Status bar text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-brain-chat',
			name: 'Open brain chat',
			callback: () => {
				void this.activateView();
			}
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-modal-simple',
			name: 'Open modal (simple)',
			callback: () => {
				new BrainModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'replace-selected',
			name: 'Replace selected content',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection('Sample editor command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-modal-complex',
			name: 'Open modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new BrainModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BrainSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	new Notice("Click");
		// });

	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | undefined;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CHAT);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar
			leaf = workspace.getRightLeaf(false) ?? undefined;
			await leaf?.setViewState({ type: VIEW_TYPE_CHAT, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			await this.app.workspace.revealLeaf(leaf);
		}
	}

	onunload() {
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
		let { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
