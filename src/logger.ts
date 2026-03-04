import { App, moment } from 'obsidian';

export class BrainLogger {
    private app: App;
    private logFilePath: string;

    constructor(app: App, pluginDir: string) {
        this.app = app;
        this.logFilePath = `${pluginDir}/logs.txt`;
    }

    private async ensureLogFile() {
        const { adapter } = this.app.vault;
        if (!(await adapter.exists(this.logFilePath))) {
            await adapter.write(this.logFilePath, `--- Brain Plugin Logs Created at ${moment().format('YYYY-MM-DD HH:mm:ss')} ---\n\n`);
        }
    }

    private formatMessage(level: 'INFO' | 'ERROR' | 'WARN', message: string, data?: unknown): string {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        let formatted = `[${timestamp}] [${level}] ${message}`;
        if (data) {
            try {
                formatted += `\nData: ${JSON.stringify(data, null, 2)}`;
            } catch (e) {
                formatted += `\nData: [Unserializable Object]\nError: ${e}`;
            }
        }
        return formatted + '\n';
    }

    async log(message: string, data?: unknown) {
        await this.ensureLogFile();
        const formatted = this.formatMessage('INFO', message, data);
        console.debug(`[Brain] ${message}`, data || '');
        await this.app.vault.adapter.append(this.logFilePath, formatted);
    }

    async error(message: string, error?: unknown) {
        await this.ensureLogFile();
        const formatted = this.formatMessage('ERROR', message, error);
        console.error(`[Brain] ${message}`, error || '');
        await this.app.vault.adapter.append(this.logFilePath, formatted);
    }

    async warn(message: string, data?: unknown) {
        await this.ensureLogFile();
        const formatted = this.formatMessage('WARN', message, data);
        console.warn(`[Brain] ${message}`, data || '');
        await this.app.vault.adapter.append(this.logFilePath, formatted);
    }
}

let loggerInstance: BrainLogger | null = null;

export function initLogger(app: App, pluginDir: string) {
    loggerInstance = new BrainLogger(app, pluginDir);
}

export function getLogger(): BrainLogger {
    if (!loggerInstance) {
        throw new Error("Logger not initialized. Call initLogger first.");
    }
    return loggerInstance;
}
