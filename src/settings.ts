import { App, PluginSettingTab, Setting } from "obsidian";
import BrainPlugin from "./main";

export interface BrainSettings {
	provider: 'OpenAI' | 'Google' | 'AzureOpenAI' | 'Custom';
	openaiApiKey: string;
	openaiModel: string;
	googleApiKey: string;
	googleModel: string;
	azureApiKey: string;
	azureResourceName: string;
	azureDeploymentName: string;
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
	azureResourceName: '',
	azureDeploymentName: '',
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
				.addOption('OpenAI', 'OpenAI')
				.addOption('Google', 'Google')
				.addOption('AzureOpenAI', 'Azure OpenAI')
				.addOption('Custom', 'Custom (OpenAI Compatible)')
				.setValue(this.plugin.settings.provider)
				.onChange(async (value: 'OpenAI' | 'Google' | 'AzureOpenAI' | 'Custom') => {
					this.plugin.settings.provider = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		if (this.plugin.settings.provider === 'OpenAI') {
			new Setting(containerEl)
				.setName('OpenAI API Key')
				.setDesc('Enter your OpenAI API key.')
				.addText(text => {
					text.inputEl.type = 'password';
					text.setPlaceholder('sk-...')
						.setValue(this.plugin.settings.openaiApiKey)
						.onChange(async (value) => {
							this.plugin.settings.openaiApiKey = value;
							await this.plugin.saveSettings();
						});
				});

			new Setting(containerEl)
				.setName('Model')
				.setDesc('Select the OpenAI model to use.')
				.addDropdown(dropdown => {
					dropdown.addOption('gpt-4o', 'GPT-4o');
					dropdown.addOption('gpt-4o-mini', 'GPT-4o-mini');
					dropdown.addOption('gpt-4-turbo', 'GPT-4-turbo');
					dropdown.addOption('gpt-3.5-turbo', 'GPT-3.5-turbo');
					dropdown.setValue(this.plugin.settings.openaiModel)
						.onChange(async (value) => {
							this.plugin.settings.openaiModel = value;
							await this.plugin.saveSettings();
						});
				})
		} else if (this.plugin.settings.provider === 'Google') {
			new Setting(containerEl)
				.setName('Google API Key')
				.setDesc('Enter your Gemini key.')
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
				.setDesc('Select the Google Gemini model.')
				.addDropdown(dropdown => {
					dropdown.addOption('gemini-2.5-flash', 'Gemini 2.5 Flash');
					dropdown.addOption('gemini-2.5-pro', 'Gemini 2.5 Pro');
					dropdown.addOption('gemini-2.0-flash', 'Gemini 2.0 Flash');
					dropdown.addOption('gemini-1.5-pro', 'Gemini 1.5 Pro');
					dropdown.addOption('gemini-1.5-flash', 'Gemini 1.5 Flash');
					dropdown.setValue(this.plugin.settings.googleModel)
						.onChange(async (value) => {
							this.plugin.settings.googleModel = value;
							await this.plugin.saveSettings();
						});
				});
		} else if (this.plugin.settings.provider === 'AzureOpenAI') {
			new Setting(containerEl)
				.setName('Resource Name')
				.setDesc('Enter your Azure OpenAI resource name.')
				.addText(text => text
					.setPlaceholder('resource-name')
					.setValue(this.plugin.settings.azureResourceName)
					.onChange(async (value) => {
						this.plugin.settings.azureResourceName = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('API Key')
				.setDesc('Enter your Azure OpenAI API key.')
				.addText(text => {
					text.inputEl.type = 'password';
					text.setPlaceholder('Enter key')
						.setValue(this.plugin.settings.azureApiKey)
						.onChange(async (value) => {
							this.plugin.settings.azureApiKey = value;
							await this.plugin.saveSettings();
						});
				});

			new Setting(containerEl)
				.setName('Deployment Name')
				.setDesc('Enter the deployment name for the model.')
				.addText(text => text
					.setPlaceholder('deployment-name')
					.setValue(this.plugin.settings.azureDeploymentName)
					.onChange(async (value) => {
						this.plugin.settings.azureDeploymentName = value;
						await this.plugin.saveSettings();
					}));
		} else if (this.plugin.settings.provider === 'Custom') {
			new Setting(containerEl)
				.setName('Base URL')
				.setDesc('Enter the base URL for the custom provider (e.g., https://api.together.xyz/v1).')
				.addText(text => text
					.setPlaceholder('https://...')
					.setValue(this.plugin.settings.customBaseUrl)
					.onChange(async (value) => {
						this.plugin.settings.customBaseUrl = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('API Key')
				.setDesc('Enter your API key for the custom provider.')
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
				.setDesc('Enter the model name (e.g., meta-llama/Llama-3-70b-chat-hf).')
				.addText(text => text
					.setPlaceholder('model-name')
					.setValue(this.plugin.settings.customModel)
					.onChange(async (value) => {
						this.plugin.settings.customModel = value;
						await this.plugin.saveSettings();
					}));
		}
	}
}
