# 功能規格說明書 (Functional Specification)

## 1. 產品概述
**Custom Script Injector** 是一個 Chrome 瀏覽器擴充功能，允許使用者針對特定網域注入自訂的 CSS 樣式與 JavaScript 腳本。本產品旨在提供開發者與進階使用者一個靈活、安全且強大的網頁客製化環境。

## 2. 核心功能

### 2.1 腳本注入 (Script Injection)
*   **CSS 注入**：支援即時將 CSS 樣式插入至目標網頁，用於修改外觀。
*   **JavaScript 注入**：支援將 JS 腳本注入至目標網頁的 **MAIN World** (透過 `executeScript` world: 'MAIN')，這意味著腳本可以：
    *   存取網頁原本的 `window` 物件與全域變數。
    *   不受擴充功能沙盒限制，與網頁原生程式碼直接互動。
*   **CSP 繞過 (CSP Bypass)**：
    *   利用 `declarativeNetRequest` API 修改 Response Headers。
    *   移除或放寬 `Content-Security-Policy` 限制，確保注入的腳本能順利執行 (unsafe-inline/unsafe-eval)。

### 2.2 網域管理 (Domain Management)
*   **新增網域**：使用者可輸入任意網域名稱 (如 `google.com`) 建立專屬設定檔。
*   **網域重新命名 (Rename)**：點擊標題即可修改網域名稱，系統自動遷移舊資料。
*   **刪除網域**：可刪除不再需要的網域設定。
*   **別名設定 (Alias)**：可為網域設定易讀的中文/英文別名。
*   **啟用/停用**：可一鍵開關特定網域的腳本注入功能。

### 2.3 程式碼編輯器 (Code Editor)
*   **核心技術**：基於 **CodeMirror 5**。
*   **語法高亮**：支援 CSS 與 JavaScript 語法顏色標記 (Monokai 主題)。
*   **智慧存檔**：
    *   點擊「保存」按鈕。
    *   快捷鍵 `Ctrl+S` / `Cmd+S`。
*   **即時熱重載**：存檔後，目標網頁無需手動重新整理即可看到 CSS 變更 (JS 視情況可能需重整)。

### 2.4 深連結與導航 (Deep Linking & Navigation)
*   **網域深連結**：選項頁面支援 URL 參數 (例如 `options.html?domain=example.com`)，可直接開啟特定網域的編輯畫面。
*   **新分頁開啟**：網域列表支援 `Ctrl` / `Cmd` + 點擊，於新分頁開啟不同網域的設定。
*   **開啟網站**：編輯器內建「開啟網站」按鈕，可直接跳轉至當前設定的目標網域。

### 2.5 雲端同步與備份 (Sync & Backup)
*   **GitHub Gist 整合**：
    *   支援設定 **GitHub Personal Access Token**。
    *   **備份 (Backup)**：將所有網域設定打包上傳至 Gist。
    *   **還原 (Restore)**：從 Gist 下載並覆蓋本地設定。
*   **Token 安全**：GitHub Token 僅儲存於本地 (`chrome.storage`), 不會隨 Chrome Sync 同步，避免外洩。

### 2.6 多國語言 (i18n)
*   支援語言：支援 **英文 (en)**、**繁體中文 (zh_TW)**、**簡體中文 (zh_CN)**、**日文 (ja)**。
*   自動偵測：依據瀏覽器語系自動切換，並提供介面選單手動切換。

## 3. 技術規格

| 項目 | 規格 |
| :--- | :--- |
| **Manifest 版本** | V3 |
| **權限需求** | `storage`, `scripting`, `activeTab`, `declarativeNetRequest`, `<all_urls>` |
| **前端框架** | Vanilla JS (無依賴大型框架) |
| **樣式庫** | Vanilla CSS (CSS Variables 主題化) |
| **資料儲存** | `chrome.storage.sync` (腳本設定), `chrome.storage.local` (大容量資料) |

## 4. UI/UX 規範
*   **配色**：深色模式 (Dark Theme)，主色調為深灰與霓虹色系 (Accent Color)。
*   **響應式**：支援桌面版與彈出視窗 (Popup) 顯示。
*   **互動**：所有按鈕需有 Hover 效果，破壞性操作 (刪除/還原) 需有 `confirm` 彈窗確認。

## 5. 發布流程
*   **自動化**：透過 GitHub Actions 監聽 `v*` Tag 推送。
*   **產出**：自動打包 ZIP 並發布至 GitHub Releases。
