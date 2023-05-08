const browserAppData = this.browser || this.chrome;
const tabs = {};
const inspectFile = 'inspect.js';
const activeIcon = 'web-master-active.svg';
const defaultIcon = 'web-master.svg';

let gettingStoredStats = browser.storage.local.get();

gettingStoredStats.then(store => {
  // Initialize the saved stats if not yet initialized.
  if (store.scenarios === undefined) {
    store = {
      status: "default",
      scenarios: [],
      currentScenario: null,
      currentUser: null
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

browserAppData.tabs.onUpdated.addListener(getActiveTab);
browserAppData.runtime.onMessage.addListener(msgController);

function isSupportedProtocolAndFileType(urlString) {
  if (!urlString) { return false; }
  const supportedProtocols = ['https:', 'http:', 'file:'];
  const notSupportedFiles = ['xml', 'pdf', 'rss'];
  const extension = urlString.split('.').pop().split(/\#|\?/)[0];
  const url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) !== -1 && notSupportedFiles.indexOf(extension) === -1;
}

// --------------------- inspector logic --------------------- //

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

function msgController(msg) {
  browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
    let tab = tabs[0];
    toggle(tab, msg);
  })
  switch (msg.status) {
    case 'activate': {
      createScenario(msg.scenarioName);
      break;
    }
    case 'deactivate': {
      saveScenario();
      break;
    }
  }
}

// --------------------- scenario logic --------------------- //

function createScenario(scenarioName) {
  gettingStoredStats.then(store => {
    store.scenarios.push({'name': scenarioName, 'steps': [], 'author': 'Vadim'});
    store.currentScenario = scenarioName
    browser.storage.local.set(store);
  });
}

function saveScenario() {
  browser.storage.local.get().then(async store => {
    await saveScenarioDB(store.scenarios.find(it => it.name === store.currentScenario))
  });
}

async function saveScenarioDB(scenario) {
    let response = await fetch("http://127.0.0.1:5000/scenarios", {
      method: "Post",
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(scenario)
    });
    if (response.ok) {
      console.log("Сохранение прошло успешно.");
    } else {
      console.log("Ошибка " + response.status)
    }
}