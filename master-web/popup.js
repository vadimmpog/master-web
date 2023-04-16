
const MAX_ITEMS = 7;
function sorter(array) {
  return Object.keys(array).sort((a, b) => {
    return array[a] <= array[b];
  });
}

function addElements(element, array, callback) {
  if (array.length !== 0)
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }

  for (let i=0; i < array.length; i++) {
    if (i >= MAX_ITEMS) {
      break;
    }

    const listItem = document.createElement("option");
    listItem.textContent = callback(array[i]);
    element.appendChild(listItem);
  }
}

let gettingStoredStats = browser.storage.local.get();

// Get the saved stats and render the data in the popup window.
gettingStoredStats.then(store => {
  if (store.status === "activate") createScenario(); else endScenario();
  if (store.scenarios.length === 0) {
    return;
  }

  let scenariosElement = document.getElementById("scenarios");
  let sortedScenarios = sorter(store.scenarios);
  addElements(scenariosElement, sortedScenarios, (scenario) => {
    return `${store.scenarios[scenario].author}: ${scenario}`;
  });

});


var create = document.querySelector('#create_button')
var close = document.querySelector('#close_button')

create.addEventListener('click', activate);
close.addEventListener('click', deactivate);

function createScenario() {
  document.querySelector('.message').textContent = "Вопроизведите сценарий и завершите создание"
  document.getElementById("import_button").style.display = "none";
  document.getElementById("create_button").style.display = "none";
  document.getElementById("close_button").style.display = "block";
}

function endScenario() {
  document.getElementById("import_button").style.display = "";
  document.getElementById("create_button").style.display = "";
  document.getElementById("close_button").style.display = "none";
}

function activate() {
  createScenario()
  browser.runtime.sendMessage({
    status: 'activate'
  });
}

function deactivate() {
  endScenario()
  browser.runtime.sendMessage({
    status: 'deactivate'
  });
}
