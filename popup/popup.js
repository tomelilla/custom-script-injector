document.addEventListener('DOMContentLoaded', async () => {
  await window.initI18n();
  window.translateUI();

  const tabs = document.querySelectorAll('.tab-btn');
  const editor = document.getElementById('code-editor');
  const saveBtn = document.getElementById('save-btn');
  const siteToggle = document.getElementById('site-toggle');
  const siteStatus = document.getElementById('site-status');
  // Duplicate removed
  const currentDomainLabel = document.getElementById('current-domain');
  const settingsBtn = document.getElementById('settings-btn');

  let currentTab = 'css';
  let currentDomain = '';
  let storedData = {};

  // Get current tab domain
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      currentDomain = url.hostname;
      currentDomainLabel.textContent = currentDomain;
    } catch (e) {
      currentDomainLabel.textContent = window.msg('invalidUrlMsg');
      disableUI();
      return;
    }
  } else {
    disableUI();
    return;
  }

  // Load data
  chrome.storage.sync.get(currentDomain, (result) => {
    storedData = result[currentDomain] || {
      css: '',
      js: '',
      enabled: true,
      name: tab.title || '' // Default to tab title
    };

    // Ensure name is set if it was missing in existing data
    if (!storedData.name && tab.title) {
        storedData.name = tab.title;
    }

    // Update UI
    updateEditor();
    siteToggle.checked = storedData.enabled !== false; // Default true
    updateStatusText();
  });

  // Tab Switching
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      // Save current content to memory before switching
      storedData[currentTab] = editor.value;

      // Switch
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');

      updateEditor();
    });
  });

  // Save Button
  saveBtn.addEventListener('click', () => {
    saveData();
  });

  // Toggle
  siteToggle.addEventListener('change', () => {
    storedData.enabled = siteToggle.checked;
    updateStatusText();
    saveData(true); // Save immediately on toggle
  });

  function updateEditor() {
    editor.value = storedData[currentTab] || '';
    const placeholderDate = currentTab === 'css' ? 'enterCssPlaceholder' : 'enterJsPlaceholder';
    editor.placeholder = window.msg(placeholderDate);
  }

  function updateStatusText() {
    siteStatus.textContent = siteToggle.checked ? window.msg('enabled') : window.msg('disabled');
    siteStatus.style.color = siteToggle.checked ? 'var(--success-color)' : '#888';
  }

  function saveData(silent = false) {
    storedData[currentTab] = editor.value; // Ensure current view is captured

    const dataToSave = {};
    dataToSave[currentDomain] = storedData;

    chrome.storage.sync.set(dataToSave, () => {
      if (!silent) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = window.msg('savedMsg');
        setTimeout(() => saveBtn.textContent = window.msg('saveBtn'), 1500);
      }

      // Notify content script to reload/update if possible,
      // or rely on page reload. For better UX, we can try to reload the page or message the tab.
      // Re-injecting scripts dynamically might duplicate them unless carefully managed.
      // Simple approach: Suggest reload or auto-reload.
      // Let's try to notify the tab to update styles dynamically.
      chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_SCRIPTS', data: storedData }).catch(() => {
        // Content script might not be loaded yet or error
        console.log("Could not send message to content script (may not be loaded).");
      });
    });
  }

  function disableUI() {
    editor.disabled = true;
    saveBtn.disabled = true;
    siteToggle.disabled = true;
    editor.value = window.msg('invalidUrlMsg');
  }

  // Open Options Page
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
});
