const browserAppData = this.browser || this.chrome;
const tabs = {};
const inspectFile = 'inspect.js';
const activeIcon = 'web-master-active.svg';
const defaultIcon = 'web-master.svg';

const inspect = {
  toggleActivate: (id, type, icon) => {
    this.id = id;
    browserAppData.tabs.executeScript(id, { file: inspectFile }, () => { browserAppData.tabs.sendMessage(id, { action: type }); });
    browserAppData.browserAction.setIcon({ tabId: id, path: { 48: 'icons/' + icon } });
  }
};

function isSupportedProtocolAndFileType(urlString) {
  if (!urlString) { return false; }
  const supportedProtocols = ['https:', 'http:', 'file:'];
  const notSupportedFiles = ['xml', 'pdf', 'rss'];
  const extension = urlString.split('.').pop().split(/\#|\?/)[0];
  const url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) !== -1 && notSupportedFiles.indexOf(extension) === -1;
}

function toggle(tab) {
  if (isSupportedProtocolAndFileType(tab.url)) {
    if (!tabs[tab.id]) {
      tabs[tab.id] = Object.create(inspect);
      inspect.toggleActivate(tab.id, 'activate', activeIcon);
    } else {
      inspect.toggleActivate(tab.id, 'deactivate', defaultIcon);
      for (const tabId in tabs) {
        if (tabId == tab.id) delete tabs[tabId];
      }
    }
  }
}

function deactivateItem(tab) {
  if (tab[0]) {
    if (isSupportedProtocolAndFileType(tab[0].url)) {
      for (const tabId in tabs) {
        if (tabId == tab[0].id) {
          delete tabs[tabId];
          inspect.toggleActivate(tab[0].id, 'deactivate', defaultIcon);
        }
      }
    }
  }
}

function getActiveTab() {
  browserAppData.tabs.query({ active: true, currentWindow: true }, tab => { deactivateItem(tab); });
}

async function activateSelector(message) {
  browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
    let tab = tabs[0];
    toggle(tab, message)
  })
}

browserAppData.tabs.onUpdated.addListener(getActiveTab);
browserAppData.runtime.onMessage.addListener(activateSelector);


////////////////////////---------------------------------------------------------------------------------------//////////////////////////////////////
// Load existent stats with the storage API.
let gettingStoredStats = browser.storage.local.get();

gettingStoredStats.then(store => {
  // Initialize the saved stats if not yet initialized.
  if (!store.stats) {
    store = {
      status: "default",
      scenarios: {}
    };
  }

  // Monitor completed navigation events and update
  // stats accordingly.
  browser.webNavigation.onCommitted.addListener((evt) => {
    if (evt.frameId !== 0) {
      return;
    }

    let transitionType = evt.transitionType;
    store.scenarios[transitionType] = store.scenarios[transitionType] || 0;
    store.scenarios[transitionType]++;

    // Persist the updated stats.
    browser.storage.local.set(store);
  });

});

