const MAX_ITEMS = 20;
// statuses
const EXAMINATION = 'examination'
const END_EXAMINATION = 'end_examination'
const EDUCATION = 'education'
const CREATION = 'activate'
const END_CREATION = 'deactivate'
const MAIN = 'main'
const UPDATE = 'update'
//views
const views = ["main", "creation", "adding_steps", "examination"]

let gettingStoredStats = browser.storage.local.get();

function addElements(element, array, callback) {
  if (array.length !== 0)
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }

  for (let i=0; i < array.length; i++) {
    if (i >= MAX_ITEMS) break;

    const listItem = document.createElement("option");
    listItem.textContent = callback(array[i]);
    listItem.id = array[i]._id;
    element.appendChild(listItem);
  }
}

// Get the saved stats and render the data in the popup window.
gettingStoredStats.then(async store => {
  console.log(store.status)
  switch (store.status){
    case CREATION: addStepsView(); break;
    case MAIN: mainView(); break;
    case EXAMINATION: examineScenarioView(); break;
  }
});

var start = document.querySelector('#start')
var create = document.querySelector('#create_button')
var close = document.querySelector('#close_button')
var closeExamination = document.querySelector('#close_examination_button')
var scenariosList = document.querySelector('#scenarios_list');


// ----------------------------- listeners ----------------------------- //

start.addEventListener('click', activate);
create.addEventListener('click', createScenarioView);
close.addEventListener('click', deactivate);
closeExamination.addEventListener('click', endExamineScenario);
scenariosList.addEventListener('dblclick', examineScenario, false);

// ----------------------------- frontend logic ----------------------------- //

function updateScenariosList() {
  gettingStoredStats.then(store => {
    let scenarios = store.localScenarios
    if (scenarios.length === 0) return;
    let scenariosElement = document.getElementById("scenarios_list");
    addElements(scenariosElement, scenarios, (scenario) => {
      return `${scenario.name}: steps ${scenario.steps.length}`;
    });
  })
}

function updateExamine() {
  gettingStoredStats.then(store => {
    let scenarioInfoElement = document.getElementById("scenario_examination_info");
    let scenario = store.localScenarios.find(scenario => scenario._id === store.currentScenarioId)
    scenarioInfoElement.textContent = `Шаг ${store.currentStep + 1} из ${scenario.steps.length}`;
  })
}

function createScenarioView() {
  hideOtherViewsAndSetMsg("creation", "Введите название сценария")
}

function addStepsView() {
  hideOtherViewsAndSetMsg("adding_steps", "Пройдите по логическому пути сценария и завершите создание")
}

function mainView() {
  hideOtherViewsAndSetMsg("main", "Импортируйте/создайте учебный сценарий или пройдите существующий")
  update()
}

function examineScenarioView() {
  hideOtherViewsAndSetMsg("examination", "Самостоятельно пройдите сценарий")
  update()
}

function hideOtherViewsAndSetMsg(currentView, msg) {
  if (msg !== undefined) document.querySelector('.message').textContent = msg
  document.getElementById(currentView).style.display = "flex";
  views.forEach( view => {
    if (view !== currentView)
      document.getElementById(view).style.display = "none"
  });
}

// ----------------------------- background script interaction ----------------------------- //

function examineScenario(el) {
  gettingStoredStats.then(async store => {
    if (store.status === MAIN) {
      browser.runtime.sendMessage({
        status: EXAMINATION,
        scenarioID: el.target.id
      });
    }
    examineScenarioView()
  });
}

async function endExamineScenario() {
  mainView()
  browser.runtime.sendMessage({
    status: END_EXAMINATION
  });
}

function activate() {
  addStepsView()
  let scenarioName = document.getElementById("input_scenario").value
  document.getElementById("input_scenario").value = ""
  browser.runtime.sendMessage({
    status: CREATION,
    scenarioName: scenarioName
  });
}

function deactivate() {
  mainView()
  browser.runtime.sendMessage({
    status: END_CREATION
  });
}

function update() {
  browser.runtime.sendMessage({
    status: UPDATE
  })
}

browser.runtime.onMessage.addListener(msgController);

function msgController(msg) {
  switch (msg.response) {
    case 'examine_updated': {
      updateExamine()
      break;
    }
    case 'list_updated': {
      updateScenariosList()
      break;
    }
  }
}
