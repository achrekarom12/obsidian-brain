# Obsidian Plugin Agent Guidelines

This reference document outlines the strict guidelines, constraints, and best practices for AI agents modifying or writing code for this Obsidian community plugin.

## 1. Agent Directives (Do's and Don'ts)

**Do:**
- Write idempotent code paths so reload/unload doesn't leak listeners or intervals.
- Use `this.register*` helpers for everything that needs cleanup.
- Add commands with stable IDs (don't rename once released).
- Provide defaults and validation in settings.
- Keep `main.ts` minimal: Focus only on plugin lifecycle (onload, onunload). Delegate logic to separate modules.

**Don't:**
- Introduce network calls without an obvious user-facing reason and documentation.
- Ship features that require cloud services without clear disclosure and explicit opt-in.
- Store or transmit vault contents unless essential and explicitly consented.
- Commit build artifacts (`node_modules/`, `main.js`, `manifest.json`, etc.) to version control.
- Access files outside the vault boundaries.

---

## 2. Project Overview & Environment

- **Target:** Obsidian Community Plugin (TypeScript → bundled JavaScript).
- **Environment:** Node.js 18+ LTS, npm for package management.
- **Bundler:** esbuild (required for this project, configured via `esbuild.config.mjs`). Release artifacts must end up at the top level of the plugin folder.
- **Important Commands:**
  - `npm install` - Install dependencies
  - `npm run dev` - Run development build in watch mode
  - `npm run build` - Generate the production build (`main.js`)
- **Linting:** Use `eslint ./src/` or `eslint main.ts` (install via `npm install -g eslint`).
- **Testing Locally:** Copy `main.js`, `manifest.json`, and `styles.css` to `<Vault>/.obsidian/plugins/<plugin-id>/` and reload Obsidian.

---

## 3. Architecture & Code Conventions

- **TypeScript:** Use `"strict": true`. Prefer `async/await` over promise chains and handle errors gracefully.
- **Code Organization:** Organize code into multiple files.
  - `src/main.ts` - Plugin entry point, lifecycle management
  - `src/settings.ts` - Settings interface and defaults
  - `src/commands/` - Command implementations
  - `src/ui/` - UI components, modals, views
  - `src/utils/` - Utility functions, helpers
  - `src/types.ts` - TypeScript interfaces and types
- **File Constraints:** If a file exceeds ~200-300 lines, chunk it into smaller, well-defined modules with single responsibilities.
- **Dependencies:** Avoid large dependencies and keep the plugin small. Prefer browser-compatible packages. Bundle everything into `main.js` without any unbundled runtime dependencies.

---

## 4. Obsidian API, Features & UX Guidelines

### UI & UX Copy
- Prefer sentence case for headings, buttons, and titles.
- Use clear, action-oriented imperatives for steps. Use **bold** to indicate literal UI labels, and prefer "select" for interactions.
- Keep in-app strings short, consistent, and free of jargon.
- Use arrow notation for navigation (e.g., **Settings → Community plugins**).

### Commands & Settings
- Register commands with `this.addCommand(...)`.
- Persist settings via `this.loadData()` and `this.saveData()`. Make sure to provide a settings tab and sensible defaults.

### Performance & Mobile
- Keep startup light; defer heavy workloads and rely on lazy initialization.
- Batch disk accessing and debounce/throttle expensive operations (e.g., in response to file system events).
- Avoid large memory allocations and keep storage constraints in mind.
- For mobile compatibility, avoid Node/Electron APIs unless the plugin explicitly has `isDesktopOnly: true`. Code should avoid assuming desktop-only behavior without checks.

---

## 5. Security, Privacy, and Compliance

- **Offline-First:** Default to local, offline operation. Make network requests only when strictly essential.
- **Transparency & Telemetry:** No hidden telemetry. Disclose external services and data sent. If adding optional analytics, require explicit opt-in.
- **No Remote Execution:** Never execute remote code, fetch, or `eval` scripts.
- **Scope Limitation:** Read/write only what is necessary inside the Obsidian vault.
- **Privacy:** Do not collect vault contents, filenames, or personal info unless absolutely necessary and user consented. Avoid deceptive UX, ads, or spam.
- **Cleanup:** Always use `this.registerEvent`, `this.registerDomEvent`, and `this.registerInterval` to clean up event listeners to avoid memory leaks.

---

## 6. Manifest (`manifest.json`) & Releases

- **Manifest format:** Must include `id` (stable, matches folder), `name`, `version` (SemVer), `minAppVersion`, `description`, and `isDesktopOnly`.
- **Validation:** Canonical release rules live here: [validations](https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/validate-plugin-entry.yml).
- **Versioning:** Bump version in `manifest.json`. Update `versions.json` to map plugin version to the minimum app version needed.
- **Release Procedure:** GitHub release tags must match the `version` precisely without a leading `v`. Attach `manifest.json`, `main.js` and `styles.css`.

---

## 7. Common Snippets

### Standard Module Separation
**main.ts** (minimal lifecycle):
```ts
import { Plugin } from "obsidian";
import { MySettings, DEFAULT_SETTINGS } from "./settings";
import { registerCommands } from "./commands";

export default class MyPlugin extends Plugin {
  settings: MySettings;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    registerCommands(this);
  }
}
```

**settings.ts**:
```ts
export interface MySettings {
  enabled: boolean;
  apiKey: string;
}

export const DEFAULT_SETTINGS: MySettings = {
  enabled: true,
  apiKey: "",
};
```

**commands/index.ts**:
```ts
import { Plugin } from "obsidian";

export function registerCommands(plugin: Plugin) {
  plugin.addCommand({
    id: "do-something",
    name: "Do something",
    callback: () => { /* ... */ },
  });
}
```

### Safely Register Listeners
```ts
// Workspace events
this.registerEvent(this.app.workspace.on("file-open", file => { /* ... */ }));

// DOM events that clean up automatically when unloaded
this.registerDomEvent(window, "resize", () => { /* ... */ });

// Intervals that clear when the plugin unwraps
this.registerInterval(window.setInterval(() => { /* ... */ }, 1000));
```

---

## 8. Troubleshooting

- **Plugin doesn't load:** Ensure `main.js` and `manifest.json` are properly placed in `<Vault>/.obsidian/plugins/<plugin-id>/`.
- **File missing:** If `main.js` is absent, double-check that `npm run build` or `npm run dev` was run to compile the TypeScript source.
- **Commands missing:** Verify `addCommand` gets invoked after `onload` and the IDs are unique.
- **Settings not saving:** Ensure `loadData`/`saveData` are awaited properly and the user interface updates after changes.
- **Mobile-only issues:** Verify node/electron APIs are not unintentionally used if `isDesktopOnly` is false.

---

## 9. References

- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [API Documentation](https://docs.obsidian.md)
- [Developer Policies](https://docs.obsidian.md/Developer+policies)
- [Plugin Guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [Style Guide](https://help.obsidian.md/style-guide)
