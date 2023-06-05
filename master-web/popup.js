const MAX_ITEMS = 20;
// statuses
const EXAMINATION = 'examination'
const END_EXAMINATION = 'end_examination'
const FINISHED_EXAMINATION = 'finished'
// const EDUCATION = 'education'
const CREATION = 'creation'
const ACTIVATE = 'activate'
const DEACTIVATE = 'deactivate'
const END_CREATION = 'end_creation'
const MAIN = 'main'
const UPDATE = 'update'
//views
const views = ["main", "creation", "adding_steps", "examination"]

let gettingStore = browser.storage.local.get();

// Get the saved stats and render the data in the popup window.
gettingStore.then(async store => {
  console.log(store.status)
  console.log(store.inspector)
  switch (store.status){
    case CREATION: addStepsView(); break;
    case MAIN: mainView(); break;
    case EXAMINATION: examineScenarioView(); break;
    case FINISHED_EXAMINATION: endExamineScenarioView(); break;
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
scenariosList.addEventListener('dblclick', examineScenario);

// ----------------------------- frontend logic ----------------------------- //

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

function updateScenariosList() {
  gettingStore.then(store => {
    let scenarios = store.localScenarios
    if (scenarios.length === 0) return;
    let scenariosElement = document.getElementById("scenarios_list");
    addElements(scenariosElement, scenarios, (scenario) => {
      return `${scenario.name}: steps ${scenario.steps.length}`;
    });
  })
}

function updateExamine(msg) {
  gettingStore.then(store => {
    let scenario = (msg !== undefined) ? msg.scenario : store.localScenarios.find(scenario => scenario._id === store.currentScenarioId)
    let scenarioInfoElement = document.getElementById("scenario_examination_info");
    scenarioInfoElement.textContent = `Шаг ${store.currentStep + 1} из ${scenario.steps.length}`;
  })
}

function createScenarioView() {
  hideOtherViewsAndSetMsg("creation", "Введите название сценария")
}

function endExamineScenarioView() {
  hideOtherViewsAndSetMsg("examination", "Введите название сценария")
  document.getElementById("scenario_examination_info").textContent = "Вы прошли сценарий!";
  document.getElementById("close_examination_button").textContent = "Завершить";
}

function addStepsView() {
  hideOtherViewsAndSetMsg("adding_steps", "Пройдите по логическому пути сценария и завершите создание")
}

function mainView() {
  hideOtherViewsAndSetMsg("main", "Импортируйте/создайте учебный сценарий или пройдите существующий")
  update()
}

function examineScenarioView(msg) {
  updateExamine(msg)
  hideOtherViewsAndSetMsg("examination", "Самостоятельно пройдите сценарий")
}

function hideOtherViewsAndSetMsg(currentView, msg) {
  if (msg !== undefined) document.querySelector('.message').textContent = msg
  document.getElementById(currentView).style.display = "flex";
  views.forEach( view => {
    if (view !== currentView)
      document.getElementById(view).style.display = "none"
  });
  if (currentView === 'main')
    document.getElementById("scenarios").style.display = "flex"
  else
    document.getElementById("scenarios").style.display = "none"
}

// ----------------------------- background script interaction ----------------------------- //

async function examineScenario(el) {
  let store = await gettingStore
  if (store.status === MAIN) {
    const sending = browser.runtime.sendMessage({
      status: EXAMINATION,
      inspectorStatus: ACTIVATE,
      inspectorShow: false,
      scenarioID: el.target.id

    });
    sending.then(examineScenarioView, handleError);
  }
}

async function endExamineScenario() {
  mainView()
  browser.runtime.sendMessage({
    status: END_EXAMINATION,
    inspectorStatus: DEACTIVATE,
    inspectorShow: false,
  });
}

function activate() {
  addStepsView()
  let scenarioName = document.getElementById("input_scenario").value
  document.getElementById("input_scenario").value = ""
  browser.runtime.sendMessage({
    status: CREATION,
    inspectorStatus: ACTIVATE,
    inspectorShow: true,
    scenarioName: scenarioName
  });
}

function deactivate() {
  mainView()
  browser.runtime.sendMessage({
    status: END_CREATION,
    inspectorStatus: DEACTIVATE,
    inspectorShow: true
  });
}

function update() {
  const sending = browser.runtime.sendMessage({
    status: UPDATE
  });
  sending.then(updateScenariosList, handleError);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}
