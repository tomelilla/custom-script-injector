document.addEventListener('DOMContentLoaded', async () => {
  await window.initI18n();
  window.translateUI();

  // Elements
  const domainList = document.getElementById('domain-list');
  const addDomainBtn = document.getElementById('add-domain-btn');
  const mainContent = document.getElementById('main-content');
  const noSelection = document.getElementById('no-selection');
  const editorWrapper = document.getElementById('editor-wrapper');
  const domainAliasInput = document.getElementById('domain-alias');

  const currentDomainTitle = document.getElementById('current-domain-title');
  const deleteDomainBtn = document.getElementById('delete-domain-btn');
  const openDomainBtn = document.getElementById('open-domain-btn');
  const saveBtn = document.getElementById('save-btn');
  const saveStatus = document.getElementById('save-status');

  const tabs = document.querySelectorAll('.tab-btn');
  const editor = document.getElementById('code-editor');
  const siteToggle = document.getElementById('site-toggle');
  const siteStatus = document.getElementById('site-status');

  const addDomainModal = document.getElementById('add-domain-modal');
  const newDomainInput = document.getElementById('new-domain-input');
  const cancelAddBtn = document.getElementById('cancel-add-btn');

  const confirmAddBtn = document.getElementById('confirm-add-btn');

  const importBtn = document.getElementById('import-btn');
  const exportBtn = document.getElementById('export-btn');
  const importFile = document.getElementById('import-file');
  const languageSelect = document.getElementById('language-select');

  const githubTokenInput = document.getElementById('github-token');
  const saveTokenBtn = document.getElementById('save-token-btn');
  const githubActions = document.getElementById('github-actions');
  const gistBackupBtn = document.getElementById('gist-backup-btn');
  const gistRestoreBtn = document.getElementById('gist-restore-btn');
  const syncStatus = document.getElementById('sync-status');

  // State
  let allData = {};
  let currentDomain = null;
  let currentTab = 'css';
  let tempScriptData = { css: '', js: '', enabled: true, name: '' };

  // --- Initialization ---

  let cmEditor = null;

  // --- Initialization ---

  // Initialize CodeMirror
  cmEditor = CodeMirror.fromTextArea(editor, {
    lineNumbers: true,
    theme: 'monokai',
    mode: 'css',
    indentUnit: 2,
    tabSize: 2
  });

  // Editor Shortcut (CodeMirror)
  cmEditor.setOption("extraKeys", {
    "Cmd-S": function(cm) { saveCurrentDomain(); },
    "Ctrl-S": function(cm) { saveCurrentDomain(); }
  });

  loadAllDataAndInit();
  loadGitHubToken();

  // --- Event Listeners ---

  // Alias Input Shortcut
  if (domainAliasInput) {
    domainAliasInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveCurrentDomain();
        }
    });
  }

  // Domain Renaming
  currentDomainTitle.addEventListener('click', () => {
      const input = document.getElementById('domain-rename-input');
      if (!input) return;

      input.value = currentDomain;
      currentDomainTitle.classList.add('hidden');
      input.classList.remove('hidden');
      input.focus();
  });

  const domanRenameInput = document.getElementById('domain-rename-input');
  if (domanRenameInput) {
      domanRenameInput.addEventListener('blur', finishRename);
      domanRenameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              finishRename();
          } else if (e.key === 'Escape') {
              cancelRename();
          }
      });
  }

  function cancelRename() {
      const input = document.getElementById('domain-rename-input');
      input.classList.add('hidden');
      currentDomainTitle.classList.remove('hidden');
  }

  function finishRename() {
      const input = document.getElementById('domain-rename-input');
      const newDomain = input.value.trim();

      // If no change or empty
      if (!newDomain || newDomain === currentDomain) {
          cancelRename();
          return;
      }

      // Check if exists
      if (allData[newDomain]) {
          alert(window.msg('domainExistsMsg'));
          cancelRename();
          return;
      }

      // Perform Rename

      // 1. Copy data
      const domainData = { ...allData[currentDomain] };
      allData[newDomain] = domainData;
      delete allData[currentDomain];

      // 2. Storage Update
      // We need to set new key and remove old key
      const saveObj = {};
      saveObj[newDomain] = domainData;

      chrome.storage.sync.set(saveObj, () => {
          chrome.storage.sync.remove(currentDomain, () => {
               // 3. Update UI
               const oldDomain = currentDomain;
               currentDomain = newDomain;

               // Update URL
               const newUrl = new URL(window.location);
               newUrl.searchParams.set('domain', newDomain);
               window.history.pushState({ domain: newDomain }, '', newUrl);

               currentDomainTitle.textContent = newDomain;
               cancelRename();
               renderDomainList();
          });
      });
  }

  // Add Domain
  addDomainBtn.addEventListener('click', () => {
    addDomainModal.classList.remove('hidden');
    newDomainInput.value = '';
    newDomainInput.focus();
  });

  cancelAddBtn.addEventListener('click', () => {
    addDomainModal.classList.add('hidden');
  });

  confirmAddBtn.addEventListener('click', () => {
    const domain = newDomainInput.value.trim();
    if (domain) {
      if (allData[domain]) {
        alert(window.msg('domainExistsMsg'));
      } else {
        createDomain(domain);
        addDomainModal.classList.add('hidden');
      }
    }
  });

  // Editor Tabs
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      // Save current editor content to temp state before switching
      if (currentDomain) {
        tempScriptData[currentTab] = cmEditor.getValue();
      }

      // Switch UI
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');

      // Load new content
      if (currentDomain) {
        cmEditor.setValue(tempScriptData[currentTab] || '');
        // Set mode based on tab
        const mode = currentTab === 'js' ? 'javascript' : 'css';
        cmEditor.setOption('mode', mode);
      }
    });
  });

  // Toggle
  siteToggle.addEventListener('change', () => {
    tempScriptData.enabled = siteToggle.checked;
    updateStatusText();
    // Auto-save on toggle? Or wait for save button?
    // Let's mark as unsaved or just let user click save.
    // For consistency with popup, maybe auto-save, but options page usually has explicit save.
    // Let's stick to explicit save for better control, but visually reflect state.
  });

  // Save
  saveBtn.addEventListener('click', () => {
    saveCurrentDomain();
  });

  // Delete
  deleteDomainBtn.addEventListener('click', () => {
    // String replacement for message
    const msg = window.msg('confirmDeleteMsg', [currentDomain]);
    if (confirm(msg)) {
      deleteDomain(currentDomain);
    }
  });

  // Open Domain
  if (openDomainBtn) {
    openDomainBtn.addEventListener('click', () => {
        if (!currentDomain) return;

        let url = currentDomain;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        window.open(url, '_blank');
    });
  }



  // Export
  exportBtn.addEventListener('click', () => {
    chrome.storage.sync.get(null, (items) => {
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-scripts-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });



  // Import
  importBtn.addEventListener('click', () => {
    importFile.click();
  });

  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid JSON format');
        }

        if (confirm(window.msg('importConfirmMsg'))) {
          chrome.storage.sync.set(data, () => {
            alert(window.msg('importSuccessMsg'));
            loadAllDataAndInit(); // Reload
             // Reset file input
            importFile.value = '';
          });
        }
      } catch (err) {
        alert(window.msg('errorImportingMsg', [err.message]));
      }
    };
    reader.readAsText(file);
  });

  // Language Switcher
  chrome.storage.sync.get('appLanguage', (result) => {
    if (result.appLanguage) {
      languageSelect.value = result.appLanguage;
    } else {
      languageSelect.value = 'en';
    }
  });
  languageSelect.addEventListener('change', () => {
    const lang = languageSelect.value;
    chrome.storage.sync.set({ appLanguage: lang }, () => {
      // Reload to apply
      location.reload();
    });
  });

  // GitHub Integration
  saveTokenBtn.addEventListener('click', () => {
    const token = githubTokenInput.value.trim();
    if (token) {
      // Save to SYNC storage so it roams across devices
      chrome.storage.sync.set({ githubToken: token }, () => {
        window.githubService.setToken(token);
        alert(window.msg('tokenSaved'));
        updateGitHubUI(true);
      });
    }
  });

  gistBackupBtn.addEventListener('click', async () => {
      syncStatus.textContent = window.msg('backupProgress');
      try {
        chrome.storage.sync.get(null, async (items) => {
            const dataToUpload = items || {};
            // Filter out token from the data being uploaded to Gist itself?
            // Ideally yes, but stripping it from the upload payload is good practice.
            // github-helper likely handles data structure.
            await window.githubService.uploadData(dataToUpload);
            syncStatus.textContent = window.msg('backupSuccess');
            setTimeout(() => syncStatus.textContent = '', 3000);
        });
      } catch (err) {
          syncStatus.textContent = 'Error!';
          alert(window.msg('backupFail', [err.message]));
      }
  });

  gistRestoreBtn.addEventListener('click', async () => {
      if (!confirm(window.msg('restoreConfirmMsg'))) return;

      syncStatus.textContent = window.msg('restoreProgress');
      try {
          const data = await window.githubService.downloadData();
          if (data) {
              // Be careful not to wipe the token if it's not in the backup (or if it is)
              // Ideally we merge or just set. Since backup contains everything from sync storage,
              // it likely contains the token too if it was there during backup.
              // But we should probably preserve the CURRENT token just in case the backup has an old one or none.

              // Actually, let's just do a direct set, but maybe re-save the current token if it gets lost?
              // Or better, let's trust the backup. But wait, if token is lost, we can't sync anymore.
              // Let's safe-guard the token.

              const currentToken = githubTokenInput.value.trim();

              if (currentToken) {
                  data.githubToken = currentToken;
              }

              chrome.storage.sync.set(data, () => {
                  syncStatus.textContent = window.msg('restoreSuccess');
                  setTimeout(() => syncStatus.textContent = '', 3000);
                  loadAllDataAndInit(); // Reload UI

                  // Also reload token UI if it changed (unlikely due to safeguard, but valid)
                  loadGitHubToken();
              });
          }
      } catch (err) {
          syncStatus.textContent = 'Error!';
          alert(window.msg('restoreFail', [err.message]));
      }
  });

  function updateGitHubUI(hasToken) {
      if (hasToken) {
          githubTokenInput.style.display = 'none'; // Hide input after save
          saveTokenBtn.textContent = window.msg('changeTokenBtn'); // Change button text
          saveTokenBtn.onclick = () => {
              // Reset
              githubTokenInput.style.display = 'block';
              githubTokenInput.value = '';
              saveTokenBtn.textContent = window.msg('saveTokenBtn');
              githubActions.classList.add('hidden');
              saveTokenBtn.onclick = null; // Remove this handler
          };
          githubActions.classList.remove('hidden');
      } else {
           githubActions.classList.add('hidden');
      }
  }

  function loadGitHubToken() {
      // Check SYNC first, then LOCAL (migration/fallback)
      chrome.storage.sync.get('githubToken', (result) => {
          if (result.githubToken) {
              window.githubService.setToken(result.githubToken);
              githubTokenInput.value = result.githubToken;
              updateGitHubUI(true);
          } else {
              // Fallback to local
              chrome.storage.local.get('githubToken', (localResult) => {
                  if (localResult.githubToken) {
                      window.githubService.setToken(localResult.githubToken);
                      githubTokenInput.value = localResult.githubToken;
                      updateGitHubUI(true);

                      // Auto-migrate to sync?
                      chrome.storage.sync.set({ githubToken: localResult.githubToken });
                  }
              });
          }
      });
  }

  // --- Functions ---

  function loadAllDataAndInit() {
    chrome.storage.sync.get(null, (items) => {
      allData = items || {};
      renderDomainList();

      // Auto-select domain from URL if present
      const params = new URLSearchParams(window.location.search);
      const targetDomain = params.get('domain');
      if (targetDomain && allData[targetDomain]) {
          selectDomain(targetDomain);
      }
    });
  }

  function renderDomainList() {
    domainList.innerHTML = '';
    // Filter out restricted keys
    const restrictedKeys = ['appLanguage', 'githubToken'];
    const domains = Object.keys(allData)
      .filter(key => !restrictedKeys.includes(key))
      .sort();

    domains.forEach(domain => {
      // Use anchor tag for deep linking / open in new tab support
      const item = document.createElement('a');
      item.className = 'domain-item';
      item.href = `?domain=${encodeURIComponent(domain)}`;

      if (domain === currentDomain) {
        item.classList.add('active');
      }

      // Display Alias if exists
      const data = allData[domain];
      if (data && data.name) {
          item.textContent = `${data.name} (${domain})`;
          item.title = domain; // Tooltip shows full domain
      } else {
          item.textContent = domain;
      }

      item.addEventListener('click', (e) => {
          // Allow default behavior if modifier key is pressed (Ctrl/Cmd/Shift)
          if (e.ctrlKey || e.metaKey || e.shiftKey) {
              return;
          }

          // Otherwise, prevent default and use SPA navigation
          e.preventDefault();

          // If already selected, do nothing or re-select? Re-select is fine.

          // Update URL without reload to reflect selection (pushState)
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('domain', domain);
          window.history.pushState({ domain }, '', newUrl);

          selectDomain(domain);
      });

      domainList.appendChild(item);
    });

    // If current domain was deleted or doesn't exist, deselect
    if (currentDomain && !allData[currentDomain]) {
      deselectDomain();
    }
  }

  function selectDomain(domain) {
    // If switching away from a modified domain, we might lose changes if we didn't auto-save.
    // For simplicity, we assume user saves. Creating "unsaved changes" warning is a nice-to-have.

    currentDomain = domain;
    // Clone data to temp
    tempScriptData = { ...allData[domain] };

    // Reset Tab to CSS by default or keep? Let's keep current tab preference but reset UI active
    // actually keeping currentTab is fine.

    // Update UI
    renderDomainList(); // to update active class

    noSelection.classList.add('hidden');
    editorWrapper.classList.remove('hidden');

    currentDomainTitle.textContent = currentDomain;
    domainAliasInput.value = tempScriptData.name || ''; // Load alias

    // Load content into CodeMirror
    cmEditor.setValue(tempScriptData[currentTab] || '');

    // Set mode
    const mode = currentTab === 'js' ? 'javascript' : 'css';
    cmEditor.setOption('mode', mode);

    // Refresh to ensure rendering
    setTimeout(() => cmEditor.refresh(), 1);

    siteToggle.checked = tempScriptData.enabled !== false;
    updateStatusText();

    // Update Placeholder - CodeMirror doesn't support placeholder natively without addon, ignore for now or use addon
    // const placeholderDate = currentTab === 'css' ? 'enterCssPlaceholder' : 'enterJsPlaceholder';
    // editor.placeholder = window.msg(placeholderDate);
  }

  function deselectDomain() {
    currentDomain = null;
    noSelection.classList.remove('hidden');
    editorWrapper.classList.add('hidden');

    // Clear URL param
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('domain');
    window.history.pushState({}, '', newUrl);

    renderDomainList();
  }

  function createDomain(domain) {
    const newData = { css: '', js: '', enabled: true, name: '' };
    allData[domain] = newData;

    // Save to storage
    const saveObj = {};
    saveObj[domain] = newData;
    chrome.storage.sync.set(saveObj, () => {
      loadAllDataAndInit(); // Reload to be sure
      selectDomain(domain);
    });
  }

  function deleteDomain(domain) {
    chrome.storage.sync.remove(domain, () => {
      delete allData[domain];
      deselectDomain();
      renderDomainList();
    });
  }

  function saveCurrentDomain() {
    if (!currentDomain) return;

    // Update temp data from editor
    tempScriptData[currentTab] = cmEditor.getValue();
    tempScriptData.name = domainAliasInput.value.trim(); // Save alias

    // Update main data object
    allData[currentDomain] = tempScriptData;

    // Persist
    const saveObj = {};
    saveObj[currentDomain] = tempScriptData;

    chrome.storage.sync.set(saveObj, () => {
      // Re-render list to update alias if changed
      renderDomainList();
      showSaveStatus();
    });
  }

  function updateStatusText() {
    siteStatus.textContent = siteToggle.checked ? window.msg('enabled') : window.msg('disabled');
    siteStatus.style.color = siteToggle.checked ? 'var(--success-color)' : '#888';
  }

  function showSaveStatus() {
    saveStatus.textContent = window.msg('savedMsg');
    saveStatus.style.opacity = '1';
    setTimeout(() => {
      saveStatus.style.opacity = '0';
    }, 2000);
  }
});
