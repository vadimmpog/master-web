
function createScenario() {
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