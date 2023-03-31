
const MAX_ITEMS = 7;
function sorter(array) {
  return Object.keys(array).sort((a, b) => {
    return array[a] <= array[b];
  });
}
function addElements(element, array, callback) {
  // while(element.firstChild) {
  //   element.removeChild(element.firstChild);
  // }

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
gettingStoredStats.then(results => {
  if (results.scenarios.length === 0) {
    return;
  }

  let scenariosElement = document.getElementById("scenarios");
  let sortedScenarios = sorter(results.scenarios);
  addElements(scenariosElement, sortedScenarios, (scenario) => {
    return `${scenario}: ${results.scenarios[scenario]}`;
  });

});


var create = document.querySelector('#create_button')
var close = document.querySelector('#close_button')

create.addEventListener('click', activateSelector);
// close.addEventListener('click', endScenario);

function activateSelector() {
  browser.window.close()
  browser.runtime.sendMessage({
    creationStatus: 'activate'
  });
}