/* eslint-disable no-console */
import { Plugin } from "obsidian";

export class Logger {
    private static originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
    };

    private static plugin: Plugin;
    private static logBuffer: string[] = [];
    private static isWriting = false;

    static init(plugin: Plugin) {
        this.plugin = plugin;

        console.log = (...args) => this.hook("log", args);
        console.error = (...args) => this.hook("error", args);
        console.warn = (...args) => this.hook("warn", args);
        console.info = (...args) => this.hook("info", args);

        console.log("Logger initialized and redirecting to file.");
    }

    private static hook(level: keyof typeof Logger.originalConsole, args: unknown[]) {
        // Call original console
        this.originalConsole[level](...(args));

        // Format message
        const timestamp = new Date().toISOString();
        const message = args.map(arg => {
            if (arg instanceof Error) {
                return arg.stack || arg.message;
            }
            if (typeof arg === 'object' && arg !== null) {
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        }).join(' ');

        const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
        this.logBuffer.push(logLine);

        void this.flush();
    }

    private static async flush() {
        if (this.isWriting || this.logBuffer.length === 0) return;

        this.isWriting = true;
        const toWrite = this.logBuffer.join('');
        this.logBuffer = [];

        try {
            const adapter = this.plugin.app.vault.adapter;
            const logPath = `${this.plugin.manifest.dir}/obsidian.log`;

            let exists = await adapter.exists(logPath);
            if (!exists) {
                await adapter.write(logPath, toWrite);
            } else {
                // For efficiency in Obsidian, we might want to use append if supported, 
                // but adapter.write is the standard way.
                // Note: appending large files this way can be slow.
                const current = await adapter.read(logPath);
                // Keep only last 1000 lines or something if it gets too big? 
                // For now, let's just append.
                await adapter.write(logPath, current + toWrite);
            }
        } catch (err) {
            this.originalConsole.error("Failed to write to log file:", err);
        } finally {
            this.isWriting = false;
            if (this.logBuffer.length > 0) {
                void this.flush();
            }
        }
    }
}
