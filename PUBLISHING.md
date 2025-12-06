# Chrome Web Store 上架指南

將擴充功能發布到 Chrome 線上應用程式商店，讓全世界的使用者下載。

## ✅ 事前準備

1.  **Google 帳號**。
2.  **信用卡**：第一次註冊開發者帳號需支付一次性費用 **5 美元**。
3.  **安裝檔**：`custom-script-extension-v1.2.zip` (已在專案目錄中)。
4.  **圖片素材**：
    *   **Icon (必要)**：128x128 px PNG (專案 `icons/icon128.png` 可用)。
    *   **截圖 (必要)**：至少一張 1280x800 或 640x400 的擴充功能截圖。
    *   **宣傳圖 (選填)**：440x280 px (小圖) 或 920x680 px (大圖)。

## 🚀 步驟一：註冊開發者帳號

1.  前往 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)。
2.  登入您的 Google 帳號。
3.  如果還沒註冊，請依照指示支付 5 美元註冊費。

## 📤 步驟二：上傳擴充功能

1.  在儀表板首頁，點擊 **「+ 新增項目 (Add new item)」**。
2.  點擊 **「上傳檔案」**。
3.  選擇專案中的 **`custom-script-extension-v1.2.zip`**。
4.  上傳成功後，您會進入詳細資訊編輯頁面。

## 📝 步驟三：填寫商店資訊 (Store Listing)

這是使用者在商店看到的內容：

1.  **名稱 (Name)**：系統會自動讀取 manifest 中的名稱，您也可以微調。
2.  **摘要 (Summary)**：簡短說明，例如「Inject custom CSS and JavaScript into any website with advanced CSP bypass capabilities.」。
3.  **描述 (Description)**：詳細介紹。建議直接複製 `README_zh-TW.md` 或 `README.md` 的內容。
4.  **類別 (Category)**：選擇 **「開發人員工具 (Developer Tools)」**。
5.  **語言**：選擇繁體中文或英文。
6.  **圖示與截圖**：上傳準備好的圖片。

## 🔒 步驟四：隱私權慣例 (Privacy practices)

這是審核**最嚴格**的部分，請務必照實填寫以免被拒：

1.  **單一用途 (Single Purpose)**：
    *   填寫：`Allow users to customize the appearance and behavior of websites by injecting custom CSS and JavaScript.`
2.  **權限理由 (Permission Justification)**：
    *   **Host Permissions (`<all_urls>`)**：
        *   理由：`Required to inject custom scripts and styles into any webpage the user visits.`
    *   **Scripting**：
        *   理由：`Required to execute the user's custom JavaScript code within the context of the webpage.`
    *   **Storage**：
        *   理由：`Required to save the user's custom scripts and settings locally.`
    *   **DeclarativeNetRequest**：
        *   理由：`Required to modify response headers to bypass Content Security Policy (CSP), allowing the user's custom scripts to execute safely.`
3.  **數據使用 (Data usage)**：
    *   勾選 **「否 (No, I don't collect any user data)」**。
    *   (因為我們的 Token 和腳本都只存在 Local Storage 或 Chrome Sync，只有使用者自己能存取，不算我們收集)。

## ✅ 步驟五：提交審核

1.  確認所有必填欄位都已完成 (左側選單會有綠色勾勾)。
2.  點擊右上角的 **「提交審核 (Submit for review)」**。
3.  通常審核時間為 **24 小時至 3 天**。
4.  審核通過後，您的擴充功能就會正式上架了！

## ⚠️ 常見拒絕原因與對策

*   **權限過大**：如果被質疑 `<all_urls>`，請強調這是擴充功能的核心功能 (Generic Injector)，必須要在所有網站運作。
*   **功能不清**：請確保描述欄位清楚說明這是一個「開發者工具」，給想要修改網頁的人使用。
