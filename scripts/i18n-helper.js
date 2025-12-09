/**
 * Helper for i18n with manual language override support.
 */

let messages = null;
let currentLang = 'en'; // Default to 'en' manually if not set, instead of relying on browser 'auto' logic for extension default.

async function initI18n() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('appLanguage', async (result) => {
      // Default to auto-detect if not set
      if (result.appLanguage) {
        currentLang = result.appLanguage;
      } else {
        // Auto-detect browser language
        const uiLang = chrome.i18n.getUILanguage().replace('-', '_');
        const supported = ['en', 'zh_TW', 'zh_CN', 'ja'];
        const baseLang = uiLang.split('_')[0];

        if (supported.includes(uiLang)) {
          currentLang = uiLang;
        } else if (supported.includes(baseLang)) {
          // Fallback to base language (e.g. ja_JP -> ja)
          currentLang = baseLang;
        } else if (uiLang.startsWith('zh')) {
           // Fallback for other Chinese variants
           currentLang = (uiLang === 'zh_CN' || uiLang === 'zh_SG') ? 'zh_CN' : 'zh_TW';
        } else {
          currentLang = 'en';
        }

        // Ensure strictly supported
        if (!supported.includes(currentLang)) {
            currentLang = 'en';
        }
      }

      try {
        const url = chrome.runtime.getURL(`_locales/${currentLang}/messages.json`);
        const response = await fetch(url);
        messages = await response.json();
        resolve();
      } catch (e) {
        console.error(`Failed to load locale: ${currentLang}`, e);
        // Fallback to en if failed (e.g. file missing)
        if (currentLang !== 'en') {
             try {
                const url = chrome.runtime.getURL(`_locales/en/messages.json`);
                const response = await fetch(url);
                messages = await response.json();
             } catch (e2) {
                console.error(`Failed to load fallback 'en' locale`, e2);
                messages = null; // Ensure messages is null if even fallback fails
             }
        } else {
            messages = null; // If 'en' was the target and it failed, set messages to null
        }
        resolve();
      }
    });
  });
}

function msg(key, placeholders) {
  if (messages && messages[key]) {
    let message = messages[key].message;
    if (placeholders && messages[key].placeholders) {
       // Simple replacement for $1, $2 etc if we implemented complex replacement logic.
       // For now, let's assume placeholders are arrays or single values passed in.
       // The original chrome.i18n.getMessage uses $PLACEHOLDER$ syntax defined in messages.json
       // but here we might just do simple substitution if needed.
       // However, to keep it compatible with chrome.i18n.getMessage behavior is complex.
       // Let's do a simple substitution for $1, $2...
       if (Array.isArray(placeholders)) {
         placeholders.forEach((val, index) => {
           // We might need to look up the placeholder name in messages.json, but for
           // simplicity, let's just support direct string injection if our code uses it.
           // Actually, our code uses chrome.i18n.getMessage(key, [replacements])
           // chrome.i18n handles getting the placeholder name.
           // Re-implementing full chrome.i18n logic is hard.
           // Let's assume we replace $PlaceholderName$ with value.

           // For this extension, we used $DOMAIN$ and $ERROR$ which mapped to $1.
           // So for now, a simple regex replacement of $PLACEHOLDER$ with content might work
           // if we parse placeholders structure.

           // Simplified approach: just replace $NAME$ if we know the map.
           // Since we don't assume we know the map here easily without parsing placeholders object.
           // BUT, we know we only used $1 style in the call site `[currentDomain]`.

           // Re-implementing substitution:
           for (const [pKey, pVal] of Object.entries(messages[key].placeholders || {})) {
             if (pVal.content === '$1' && placeholders[0]) {
               message = message.replace(`$${pKey.toUpperCase()}$`, placeholders[0]);
             }
           }
         });
       }
    }
    return message;
  }
  return chrome.i18n.getMessage(key, placeholders);
}

// Expose globally
window.initI18n = initI18n;
window.msg = msg;
window.getLang = () => currentLang;

// Auto-run translation on DOMContentLoaded, but user must call initI18n first manually if they want async load.
// However, since we need to wait for storage, we can't just auto-run synchronously.
// We will expose a `translateUI` function.

function translateUI() {
  const objects = document.querySelectorAll('[data-i18n]');
  objects.forEach(obj => {
    const key = obj.getAttribute('data-i18n');
    const message = msg(key);
    if (message) {
      if (obj.tagName === 'INPUT' || obj.tagName === 'TEXTAREA') {
        // placeholder handling handled separately usually, but here:
      } else {
         obj.textContent = message;
      }
      if (obj.hasAttribute('title')) {
         obj.title = message;
      }
    }
  });

  const attributes = ['placeholder', 'title'];
  attributes.forEach(attr => {
    const attrObjects = document.querySelectorAll(`[data-i18n-${attr}]`);
    attrObjects.forEach(obj => {
        const key = obj.getAttribute(`data-i18n-${attr}`);
        const message = msg(key);
        if (message) {
            obj.setAttribute(attr, message);
        }
    });
  });
}

window.translateUI = translateUI;
