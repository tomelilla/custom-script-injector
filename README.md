# Custom Script Injector

A powerful Chrome Extension that allows you to inject custom CSS and JavaScript into any website. 

Built with advanced features to bypass Content Security Policy (CSP) restrictions, giving you full control over your browsing experience.

## ✨ Key Features

- **🛡️ Advanced CSP Bypass**: Capable of injecting and executing JavaScript even on websites with strict Content Security Policy (via `declarativeNetRequest` and `executeScript` in MAIN world).
- **🎨 Syntax Highlighting**: Integrated **CodeMirror 5** editor with Monokai theme for a premium coding experience.
- **⚡ Hot Reload**: Scripts apply immediately upon saving, no manual page refresh needed.
- **☁️ Cloud Sync**: Backup and restore your scripts using **GitHub Gist**.
- **🌍 Internationalization (i18n)**: Supports English, Traditional Chinese (`zh_TW`), Simplified Chinese (`zh_CN`), and Japanese (`ja`).
- **⌨️ Shortcuts**: Support `Ctrl+S` / `Cmd+S` to save your code quickly.

## 🚀 Installation

1.  Clone this repository or download the ZIP.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** in the top-right corner.
4.  Click **Load unpacked**.
5.  Select the project directory.

## 📖 Usage

1.  **Open the Options Page**: Click the extension icon and select "Options" (or click the gear icon in the popup).
2.  **Add a Domain**: Enter a domain (e.g., `example.com`) to start customizing.
3.  **Write Code**:
    *   **CSS Tab**: Add styles to customize the look.
    *   **JavaScript Tab**: Add logic to customize behavior.
4.  **Save**: Click Save or press `Ctrl+S` / `Cmd+S`.
5.  **Enjoy**: Changes apply immediately to the target website.

## 🔄 GitHub Gist Sync

1.  Generate a **Personal Access Token** on GitHub with `gist` scope.
2.  Paste the token in the **GitHub Sync** section of the Options page.
3.  Click **Save Token**.
4.  Use **Backup** to upload your scripts to a private Gist.
5.  Use **Restore** to download scripts from your Gist (useful for syncing across computers).

## 🛠️ Development

- **Manifest V3**: Compliant with the latest Chrome Extension standards.
- **Vanilla JS**: No heavy frameworks, purely written in efficient Vanilla JavaScript.
- **Secure**: Sensitive tokens are stored in local storage and never synced via Chrome Sync.

## 📄 License

MIT License

## 📝 Release Notes

- [English](RELEASE_NOTES.md)
- [中文 (Chinese)](RELEASE_NOTES_zh-TW.md)

## 📦 Publishing
- [Release Process](doc/release-process/PUBLISHING.md)

## 📑 Specifications
- [Functional Spec](doc/specs/FUNCTIONAL_SPEC.md)
