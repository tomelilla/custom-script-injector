# 自訂腳本注入器 (Custom Script Injector)

這是一個強大的 Chrome 擴充功能，允許您將自訂的 CSS 和 JavaScript 注入到任何網站中。

它內建了先進的功能來繞過內容安全策略 (CSP) 的限制，讓您能夠完全掌控您的瀏覽體驗。

## ✨ 核心功能

- **🛡️ 進階 CSP 繞過技術**：即使在有嚴格內容安全策略 (Content Security Policy) 的網站上，也能順利注入並執行 JavaScript (透過 `declarativeNetRequest` 和 `executeScript` 注入至 MAIN world 實現)。
- **🎨 語法高亮編輯器**：整合了 **CodeMirror 5** 編輯器與 Monokai 主題，提供優質的寫 code 體驗。
- **⚡ 即時熱重載**：存檔後腳本立即生效，無需手動重新整理網頁。
- **☁️ 雲端同步**：支援使用 **GitHub Gist** 備份與還原您的腳本。
- **🌍 多國語言支援 (i18n)**：支援英文、繁體中文 (`zh_TW`)、簡體中文 (`zh_CN`) 和日文 (`ja`)。
- **⌨️ 快捷鍵支援**：支援 `Ctrl+S` / `Cmd+S` 快速存檔。

## 🚀 安裝方式

1.  Clone 此儲存庫，或下載 ZIP 檔案。
2.  開啟 Chrome 並前往 `chrome://extensions/`。
3.  開啟右上角的 **開發人員模式 (Developer mode)**。
4.  點擊 **載入未封裝項目 (Load unpacked)**。
5.  選擇此專案的資料夾。

## 📖 使用說明

1.  **開啟選項頁面**：點擊擴充功能圖示並選擇「選項 (Options)」(或點擊彈出視窗中的齒輪圖示)。
2.  **新增網域**：輸入網域 (例如 `example.com`) 開始自訂。
3.  **撰寫程式碼**：
    *   **CSS 分頁**：加入樣式以客製化外觀。
    *   **JavaScript 分頁**：加入邏輯以客製化行為。
4.  **存檔**：點擊「儲存」按鈕或按下 `Ctrl+S` / `Cmd+S`。
5.  **享受**：變更將會立即套用到目標網站上。

## 🔄 GitHub Gist 同步

1.  在 GitHub 上產生一個 **Personal Access Token** (需勾選 `gist` 權限)。
2.  在選項頁面的 **GitHub 同步** 區塊中貼上 Token。
3.  點擊 **儲存 Token**。
4.  使用 **備份 (Backup)** 將您的腳本上傳到私有的 Gist。
5.  使用 **還原 (Restore)** 從 Gist 下載腳本 (適合在不同電腦間同步)。

## 🛠️ 開發技術

- **Manifest V3**：符合最新的 Chrome 擴充功能標準。
- **Vanilla JS**：不使用笨重的框架，純粹使用高效的 Vanilla JavaScript 撰寫。
- **安全隱私**：敏感的 Token 僅儲存在本地端 (Local Storage)，不會透過 Chrome Sync 同步，保障安全。

## 📄 授權

MIT License
