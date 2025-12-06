# 自動發布流程說明 (Release Process)

本專案使用 GitHub Actions 來自動化發布流程。

## 🚀 如何發布新版本

您只需要在本地端建立一個 git tag 並推送到 GitHub，系統就會自動處理剩下的工作。

### 步驟 1: 更新版本號
在 `manifest.json` 中更新版本號：
```json
{
  "version": "1.3.2"
}
```

### 步驟 2: 提交變更
```bash
git add manifest.json
git commit -m "chore(release): bump version to 1.3.2"
```

### 步驟 3: 建立與推送 Tag
Tag 名稱必須符合 `v*` 格式 (例如 `v1.3.2`)：
```bash
git tag v1.3.2
git push origin v1.3.2
```

## 🤖 自動化流程細節
當 Tag 推送後，GitHub Action (`.github/workflows/release.yml`) 會執行以下動作：

1.  **打包 (Build)**：建立 `custom-script-extension-v1.3.2.zip`。
    - *排除檔案*：`.git`, `.DS_Store`, `README`, `RELEASE_NOTES`, `doc/` 等開發文件。
2.  **發布 (Release)**：在 GitHub Releases 頁面建立 `v1.3.2` 版本。
3.  **上傳 (Upload)**：將 ZIP 檔上傳至 Release Assets。

## 📂 檔案結構
- `.github/workflows/release.yml`: 定義 CI/CD 流程的設定檔。
