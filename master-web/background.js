const browserAppData = this.browser || this.chrome;
const tabs = {};
const inspectFile = 'inspect.js';
const activeIcon = 'web-master-active.svg';
const defaultIcon = 'web-master.svg';

let gettingStoredStats = browser.storage.local.get();

gettingStoredStats.then(store => {
  // Initialize the saved stats if not yet initialized.
  if (!store.status) {
    store = {
      status: "default",
      scenarios: {},
      currentScenario: null
    };
  }
  browser.storage.local.set(store);
});

const inspect = {
  toggleActivate: (id, type) => {
    this.id = id;
    let icon = type === 'activate' ? activeIcon : defaultIcon
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

function toggle(tab, msg) {
  if (isSupportedProtocolAndFileType(tab.url)) {
    if (!tabs[tab.id])
      tabs[tab.id] = Object.create(inspect);
    else
      for (const tabId in tabs)
        if (tabId == tab.id) delete tabs[tabId];

    inspect.toggleActivate(tab.id, msg.status);
    gettingStoredStats.then( store => {
      store.status = msg.status
      browser.storage.local.set(store);
    })
  }
}

async function getActiveTab() {
  let store = await gettingStoredStats;
  browser.tabs.query({ active: true, currentWindow: true }, tab => {
    inspect.toggleActivate(tab[0].id, store.status);
  });
}

async function activateSelector(msg) {
  browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
    let tab = tabs[0];
    toggle(tab, msg);
  })
}

browserAppData.tabs.onUpdated.addListener(getActiveTab);
browserAppData.runtime.onMessage.addListener(activateSelector);
