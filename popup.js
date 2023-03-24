// Get the saved stats and render the data in the popup window.

const MAX_ITEMS = 7;
function sorter(array) {
  return Object.keys(array).sort((a, b) => {
    return array[a] <= array[b];
  });
}
function addElements(element, array, callback) {
  console.log(element.firstElementChild)
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
