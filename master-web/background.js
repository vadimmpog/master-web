const browserAppData = this.browser || this.chrome;
const tabs = {};
const inspectFile = 'inspect.js';
const activeIcon = 'web-master-active.svg';
const defaultIcon = 'web-master.svg';

let gettingStore = browser.storage.local.get();

// ----------------- local storage logic ----------------- //
gettingStore.then(store => {
  // Initialize the saved stats if not yet initialized.
  getScenariosDB().then(scenarios => {
    if (store.localScenarios === undefined) {
      store = {
        status: "main",
        inspectorStatus: "deactivate",
        localScenarios: scenarios,
        currentScenarioId: null,
        currentStep: 0,
        currentUser: null
      };
    }
    browser.storage.local.set(store);
  })
});

async function updateScenariosList() {
  gettingStore.then(store => {
    getScenariosDB().then(scenarios => {
      store.localScenarios = scenarios
      browser.storage.local.set(store)
    })
  })
}

function setStatus(status) {
  gettingStore.then(store => {
    store.status = status
    browser.storage.local.set(store);
  })
}

// --------------------- inspector logic --------------------- //

const inspect = {
  toggleActivate: (id, type, show) => {
    console.log(show)
    this.id = id;
    let icon = type === 'activate' ? activeIcon : defaultIcon
    browserAppData.tabs.executeScript(id, { file: inspectFile }, () => { browserAppData.tabs.sendMessage(id, { action: type, showInspector: show }); });
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

function toggle(tab, inspectorStatus, show) {
  if (isSupportedProtocolAndFileType(tab.url)) {
    if (!tabs[tab.id])
      tabs[tab.id] = Object.create(inspect);
    else
      for (const tabId in tabs)
        if (tabId == tab.id) delete tabs[tabId];

    inspect.toggleActivate(tab.id, inspectorStatus, show);
  }
}

function inspector(inspectorStatus, show) {
  browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
    let tab = tabs[0];
    toggle(tab, inspectorStatus, show);
    gettingStore.then(store => {
      store.inspector = inspectorStatus
      store.inspectorShow = show
      browser.storage.local.set(store);
    })
  })
}

async function getActiveTab() {
  let store = await gettingStore;
  browser.tabs.query({ active: true, currentWindow: true }, tab => {
    inspect.toggleActivate(tab[0].id, store.inspector, store.inspectorShow);
  });
}

// --------------------- listeners, msg controller --------------------- //

browserAppData.tabs.onUpdated.addListener(getActiveTab);
browserAppData.runtime.onMessage.addListener(msgController);

function msgController(msg, sender, sendResponse) {
  switch (msg.status) {
    case 'creation': {
      setStatus(msg.status)
      inspector(msg.inspectorStatus, msg.inspectorShow)
      createScenario(msg.scenarioName);
      break;
    }
    case 'end_creation': {
      setStatus('main')
      inspector(msg.inspectorStatus, msg.inspectorShow)
      saveScenario();
      break;
    }
    case 'examination': {
      setStatus(msg.status)
      inspector(msg.inspectorStatus, msg.inspectorShow)
      examineScenario(msg, sendResponse).then(scenario => {sendResponse({scenario: scenario})});
      return true;
    }
    case 'end_examination': {
      setStatus('main')
      inspector(msg.inspectorStatus, msg.inspectorShow)
      examineScenario(msg, sendResponse).then(r => {sendResponse({response: "examine_updated"})});
      return true;
    }
    case 'update': {
      updateScenariosList(msg, sendResponse).then(r => {sendResponse({response: "response from update"})});
      break;
    }
  }
}

// --------------------- scenario logic --------------------- //

function createScenario(scenarioName) {
  gettingStore.then(store => {
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

async function examineScenario(msg) {
  let store = await gettingStore
  store.currentScenarioId = msg.scenarioID;
  store.currentStep = 0;
  browser.storage.local.set(store);
  return store.localScenarios.find(scenario => scenario._id === msg.scenarioID)
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