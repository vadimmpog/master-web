const browserAppData = this.browser || this.chrome;
const tabs = {};
const inspectFile = 'inspect.js';
const activeIcon = 'web-master-active.svg';
const defaultIcon = 'web-master.svg';

let gettingStoredStats = browser.storage.local.get();

// ----------------- local storage logic ----------------- //
gettingStoredStats.then(store => {
  // Initialize the saved stats if not yet initialized.
  getScenariosDB().then(scenarios => {
    if (store.localScenarios === undefined) {
      store = {
        status: "main",
        localScenarios: scenarios,
        currentScenarioId: null,
        currentStep: 0,
        currentUser: null
      };
    }
    browser.storage.local.set(store);
  })
});

function updateScenariosList() {
  gettingStoredStats.then(store => {
    getScenariosDB().then(scenarios => {
      store.localScenarios = scenarios
      browser.storage.local.set(store)
      browser.runtime.sendMessage({response: "list_updated"});
    })
  })
}

function setStatus(status) {
  gettingStoredStats.then(store => {
    store.status = status
    browser.storage.local.set(store);
  })
}

// --------------------- inspector logic --------------------- //

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
    setStatus(msg.status)
  }
}

function inspector(msg) {
  browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
    let tab = tabs[0];
    toggle(tab, msg);
  })
}

async function getActiveTab() {
  let store = await gettingStoredStats;
  browser.tabs.query({ active: true, currentWindow: true }, tab => {
    inspect.toggleActivate(tab[0].id, store.status);
  });
}

// --------------------- listeners, msg controller --------------------- //

browserAppData.tabs.onUpdated.addListener(getActiveTab);
browserAppData.runtime.onMessage.addListener(msgController);

function msgController(msg) {
  switch (msg.status) {
    case 'activate': {
      inspector(msg)
      createScenario(msg.scenarioName);
      break;
    }
    case 'deactivate': {
      msg.status = 'main'
      inspector(msg)
      saveScenario();
      break;
    }
    case 'examination': {
      examineScenario(msg)
      break;
    }
    case 'end_examination': {
      msg.status = 'main'
      examineScenario(msg)
      break;
    }
    case 'update': {
      updateScenariosList()
      break;
    }
  }
}

// --------------------- scenario logic --------------------- //

function createScenario(scenarioName) {
  gettingStoredStats.then(store => {
    store.localScenarios.push({'_id': '0', 'name': scenarioName, 'steps': [], 'author': 'Vadim'});
    browser.storage.local.set(store);
  });
}

function saveScenario() {
  browser.storage.local.get().then(async store => {
    let scenario = store.localScenarios.find(it => it._id === '0');
    if (scenario.steps.length > 0) {
      await saveScenarioDB(scenario)
      updateScenariosList()
    }
  });
}

function examineScenario(msg) {
  gettingStoredStats.then(store => {
    store.currentScenarioId = msg.scenarioID;
    store.status = msg.status;
    store.currentStep = 0;
    browser.storage.local.set(store);
    browser.runtime.sendMessage({response: "examine_updated"});
  });
}

// --------------------- db communication logic --------------------- //

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

async function getScenariosDB() {
  return await fetch("http://127.0.0.1:5000/scenarios", {
    method: "Get",
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  }).then(function (res) {
    return res.json()
  })
}