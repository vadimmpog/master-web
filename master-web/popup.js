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
  if (store.status === "activate") startScenarioView(); else endScenarioView();
  let scenarios = await getScenariosDB()
  if (scenarios.length === 0) return;
  let scenariosElement = document.getElementById("scenarios");
  addElements(scenariosElement, scenarios, (scenario) => {
    return `${scenario.name}: steps ${scenario.steps.length}`;
  });

});


var start = document.querySelector('#start')
var create = document.querySelector('#create_button')
var close = document.querySelector('#close_button')

// ----------------------------- listeners ----------------------------- //

start.addEventListener('click', activate);
create.addEventListener('click', createScenarioView);
close.addEventListener('click', deactivate);

// ----------------------------- frontend logic ----------------------------- //

function createScenarioView() {
  document.querySelector('.message').textContent = "Вопроизведите сценарий и завершите создание"
  document.getElementById("main").style.display = "none";
  document.getElementById("creation").style.display = "flex";
  document.getElementById("end").style.display = "none";
}

function startScenarioView() {
  document.getElementById("main").style.display = "none";
  document.getElementById("creation").style.display = "none";
  document.getElementById("end").style.display = "flex";
}

function endScenarioView() {
  document.getElementById("creation").style.display = "none";
  document.getElementById("end").style.display = "none";
  document.getElementById("main").style.display = "flex";
}

// ----------------------------- background script interaction ----------------------------- //

function activate() {
  startScenarioView()
  let scenarioName = document.getElementById("input_scenario").value
  document.getElementById("input_scenario").value = ""
  browser.runtime.sendMessage({
    status: 'activate',
    scenarioName: scenarioName
  });
}

function deactivate() {
  endScenarioView()
  browser.runtime.sendMessage({
    status: 'deactivate'
  });
}

// ----------------------------- backend interaction ----------------------------- //

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
