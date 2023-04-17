const MAX_ITEMS = 20;
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
    element.appendChild(listItem);
  }
}


// Get the saved stats and render the data in the popup window.
gettingStoredStats.then(async store => {
  if (store.status === "activate") createScenarioView(); else endScenarioView();
  let scenarios = await getScenariosDB()
  if (scenarios.length === 0) return;
  let scenariosElement = document.getElementById("scenarios");
  addElements(scenariosElement, scenarios, (scenario) => {
    return `${scenario.name}: steps ${scenario.steps.length}`;
  });

});


var create = document.querySelector('#create_button')
var close = document.querySelector('#close_button')

create.addEventListener('click', activate);
close.addEventListener('click', deactivate);

function createScenarioView() {
  document.querySelector('.message').textContent = "Вопроизведите сценарий и завершите создание"
  document.getElementById("import_button").style.display = "none";
  document.getElementById("create_button").style.display = "none";
  document.getElementById("close_button").style.display = "block";
}

function endScenarioView() {
  document.getElementById("import_button").style.display = "";
  document.getElementById("create_button").style.display = "";
  document.getElementById("close_button").style.display = "none";
}

function activate() {
  createScenarioView()
  browser.runtime.sendMessage({
    status: 'activate',
    scenarioName: 'text'
  });
}

function deactivate() {
  endScenarioView()
  browser.runtime.sendMessage({
    status: 'deactivate'
  });
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
