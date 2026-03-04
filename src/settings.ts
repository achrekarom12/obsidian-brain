import { App, PluginSettingTab, Setting } from "obsidian";
import BrainPlugin from "./main";

export interface BrainSettings {
	provider: 'OpenAI' | 'Google' | 'AzureOpenAI' | 'Custom';
	openaiApiKey: string;
	openaiModel: string;
	googleApiKey: string;
	googleModel: string;
	azureApiKey: string;
	azureBaseUrl: string;
	customBaseUrl: string;
	customApiKey: string;
	customModel: string;
}

export const DEFAULT_SETTINGS: BrainSettings = {
	provider: 'OpenAI',
	openaiApiKey: '',
	openaiModel: 'gpt-4o',
	googleApiKey: '',
	googleModel: 'gemini-1.5-pro',
	azureApiKey: '',
	azureBaseUrl: '',
	customBaseUrl: '',
	customApiKey: '',
	customModel: ''
}

export class BrainSettingTab extends PluginSettingTab {
	plugin: BrainPlugin;

	constructor(app: App, plugin: BrainPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// containerEl.createEl('h2', { text: 'Provider Settings' });

		new Setting(containerEl)
			.setName('Provider')
			.setDesc('Choose your AI provider')
			.addDropdown(dropdown => dropdown
				.addOption('OpenAI', 'Openai')
				.addOption('Google', 'Google')
				.addOption('AzureOpenAI', 'Azure openai')
				.addOption('Custom', 'Custom')
				.setValue(this.plugin.settings.provider)
				.onChange(async (value: 'OpenAI' | 'Google' | 'AzureOpenAI' | 'Custom') => {
					this.plugin.settings.provider = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		if (this.plugin.settings.provider === 'OpenAI') {
			new Setting(containerEl)
				.setName('Openai API key')
				.setDesc('Enter your API key')
				.addText(text => {
					text.inputEl.type = 'password';
					text.setPlaceholder('Sk-..')
						.setValue(this.plugin.settings.openaiApiKey)
						.onChange(async (value) => {
							this.plugin.settings.openaiApiKey = value;
							await this.plugin.saveSettings();
						});
				});

			new Setting(containerEl)
				.setName('Model')
				.setDesc('Select the openai model to use')
				.addDropdown(dropdown => {
					dropdown.addOption('gpt-5.2-pro', 'Gpt-5.2 pro');
					dropdown.addOption('gpt-5.2', 'Gpt-5.2');
					dropdown.addOption('gpt-5.1', 'Gpt-5.1');
					dropdown.addOption('gpt-5-pro', 'Gpt-5 pro');
					dropdown.addOption('gpt-5-nano', 'Gpt-5 nano');
					dropdown.addOption('gpt-5-mini', 'Gpt-5 mini');
					dropdown.addOption('gpt-4o-mini', 'Gpt-4o mini');
					dropdown.setValue(this.plugin.settings.openaiModel)
						.onChange(async (value) => {
							this.plugin.settings.openaiModel = value;
							await this.plugin.saveSettings();
						});
				})
		} else if (this.plugin.settings.provider === 'Google') {
			new Setting(containerEl)
				.setName('Google API key')
				.setDesc('Enter your gemini key')
				.addText(text => {
					text.inputEl.type = 'password'; // protected
					text.setPlaceholder('Enter key')
						.setValue(this.plugin.settings.googleApiKey)
						.onChange(async (value) => {
							this.plugin.settings.googleApiKey = value;
							await this.plugin.saveSettings();
						});
				});

			new Setting(containerEl)
				.setName('Model')
				.setDesc('Select your gemini model')
				.addDropdown(dropdown => {
					dropdown.addOption('gemini-3.1-pro', 'Gemini 3.1 pro');
					dropdown.addOption('gemini-3.1-flash-lite', 'Gemini 3.1 flash lite');
					dropdown.addOption('gemini-3.0-pro', 'Gemini 3.0 pro');
					dropdown.addOption('gemini-3.0-flash', 'Gemini 3.0 flash');
					dropdown.addOption('gemini-2.5-pro', 'Gemini 2.5 pro');
					dropdown.addOption('gemini-2.5-flash', 'Gemini 2.5 flash');
					dropdown.addOption('gemini-2.5-flash-lite', 'Gemini 2.5 flash lite');
					dropdown.setValue(this.plugin.settings.googleModel)
						.onChange(async (value) => {
							this.plugin.settings.googleModel = value;
							await this.plugin.saveSettings();
						});
				});
		} else if (this.plugin.settings.provider === 'AzureOpenAI') {
			new Setting(containerEl)
				.setName('Base URL')
				.setDesc('Enter your base URL')
				.addText(text => text
					.setPlaceholder('https://api.example.com')
					.setValue(this.plugin.settings.azureBaseUrl)
					.onChange(async (value) => {
						this.plugin.settings.azureBaseUrl = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('API key')
				.setDesc('Enter your azure openai API key')
				.addText(text => {
					text.inputEl.type = 'password';
					text.setPlaceholder('Enter key')
						.setValue(this.plugin.settings.azureApiKey)
						.onChange(async (value) => {
							this.plugin.settings.azureApiKey = value;
							await this.plugin.saveSettings();
						});
				});
		} else if (this.plugin.settings.provider === 'Custom') {
			new Setting(containerEl)
				.setName('Base URL')
				.setDesc('Enter the base URL for the custom provider (e.g., https://api.together.xyz/v1)')
				.addText(text => text
					.setPlaceholder('https://api.example.com')
					.setValue(this.plugin.settings.customBaseUrl)
					.onChange(async (value) => {
						this.plugin.settings.customBaseUrl = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('API key')
				.setDesc('Enter your API key for the custom provider')
				.addText(text => {
					text.inputEl.type = 'password';
					text.setPlaceholder('Enter key')
						.setValue(this.plugin.settings.customApiKey)
						.onChange(async (value) => {
							this.plugin.settings.customApiKey = value;
							await this.plugin.saveSettings();
						});
				});

			new Setting(containerEl)
				.setName('Model')
				.setDesc('Enter the model name (e.g., meta-llama/Llama-3-70b-chat-hf)')
				.addText(text => text
					.setPlaceholder('Model name')
					.setValue(this.plugin.settings.customModel)
					.onChange(async (value) => {
						this.plugin.settings.customModel = value;
						await this.plugin.saveSettings();
					}));
		}
	}
}
