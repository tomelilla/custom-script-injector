const STORAGE_KEY = window.location.hostname;


function injectCSS(css) {
  const styleId = 'custom-script-extension-style';
  let style = document.getElementById(styleId);

  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }

  style.textContent = css || '';
}

function injectJS(js) {
  if (!js) return;


  // Delegate to background script to use chrome.scripting.executeScript (simulating reference extension)
  chrome.runtime.sendMessage({
      type: 'INJECT_SCRIPT',
      code: js
  });
}

// Aggressively remove Meta CSP at sub-millisecond timing
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.tagName === 'META' && node.getAttribute('http-equiv') === 'Content-Security-Policy') {

                node.remove();
            }
        });
    });
});

observer.observe(document.documentElement, { childList: true, subtree: true });

// Also check existing
document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]').forEach(m => m.remove());

// Helper to wait for body if needed, but for now we inject immediately or when ready
function applyScripts(data) {
  if (!data || data.enabled === false) {
    injectCSS('');
    return;
  }

  // Inject CSS immediately
  injectCSS(data.css);

  // Inject JS
  injectJS(data.js);
}

// Initial Load
chrome.storage.sync.get(STORAGE_KEY, (result) => {
  const data = result[STORAGE_KEY];

  if (data) {
    // Attempt to remove Meta CSP if present (Header CSP handled by background)
    const metaCsp = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    if (metaCsp.length > 0) {

      metaCsp.forEach(m => m.remove());
    }

    applyScripts(data);
  }
});

// Listen for updates from Storage (Options Page Save)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes[STORAGE_KEY]) {


    // Remove Meta CSP on update too
    const metaCsp = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    metaCsp.forEach(m => m.remove());

    applyScripts(changes[STORAGE_KEY].newValue);
  }
});

// Listen for updates from Popup (if still used)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_SCRIPTS') {
    applyScripts(message.data);
  }
});
