
let gettingStoredScenarios = browser.storage.local.get();
var create = document.querySelector('#create_button')
var close = document.querySelector('#close_button')

create.addEventListener('click', createScenario);
close.addEventListener('click', endScenario);
function createScenario() {
    console.log("store.status")
    gettingStoredStats.then(store => {
        store.status = "creating";
    })
    document.querySelector('.message').textContent = "Вопроизведите сценарий и завершите создание"
    document.getElementById("import_button").style.display = "none";
    document.getElementById("create_button").style.display = "none";
    document.getElementById("close_button").style.display = "block";
}
function endScenario() {
    console.log("store.status")
    document.getElementById("import_button").style.display = "";
    document.getElementById("create_button").style.display = "";
    document.getElementById("close_button").style.display = "none";
}