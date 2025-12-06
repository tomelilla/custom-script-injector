// Background Service Worker
// Handles CSP Bypassing via declarativeNetRequest



const RULE_ID_OFFSET = 1000;

function generateRuleId(domain) {
    // Simple hash to ID or maintain a mapping?
    // Since we re-sync all rules on change, we can just use index-based or deterministic hash.
    // Let's use a simple hash of the domain string for now, but collisions are possible.
    // Better: We re-calculate all rules from storage and replace ALL dynamic rules.
    return 0; // Not used in bulk replacement logic
}

async function syncRules() {
    try {
        const data = await chrome.storage.sync.get(null);
        const rules = [];
        let idCounter = RULE_ID_OFFSET;

        for (const [domain, config] of Object.entries(data)) {
            // valid config has keys like css, js, enabled
            if (config &&
                config.enabled !== false &&
                config.js &&
                config.js.trim().length > 0) {

                // Add CSP stripping rule for this domain
                rules.push({
                    id: idCounter++,
                    priority: 1,
                    action: {
                        type: "modifyHeaders",
                        responseHeaders: [
                            { header: "content-security-policy", operation: "remove" },
                            { header: "content-security-policy-report-only", operation: "remove" }
                        ]
                    },
                    condition: {
                        urlFilter: `||${domain}`,
                        resourceTypes: ["main_frame", "sub_frame"]
                    }
                });
            }
        }

        // Get existing rules to remove them to ensure clean state
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const removeRuleIds = existingRules.map(r => r.id);



        // Update rules
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: removeRuleIds,
            addRules: rules
        });



    } catch (e) {
        console.error("[Background] Error syncing rules:", e);
    }
}

// Initial Sync
chrome.runtime.onInstalled.addListener(() => {

    syncRules();
});
chrome.runtime.onStartup.addListener(() => {

    syncRules();
});

// Listen for script injection requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'INJECT_SCRIPT') {
        const tabId = sender.tab.id;
        const code = message.code;

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            world: 'MAIN',
            func: (codeContent) => {
                const script = document.createElement('script');
                script.textContent = codeContent;
                document.documentElement.appendChild(script);
                // script.remove(); // Optional

            },
            args: [code]
        }).catch(err => console.error('[Background] Injection failed:', err));
    }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {

        syncRules();
    }
});
