const browserAppData = this.browser || this.chrome;


function saveOptions(e) {
  browserAppData.storage.local.set({
    inspector: document.querySelector('#inspector').checked,
    shortid: document.querySelector('#shortid').checked,
    position: document.querySelector('#position').value
  }, () => {
    const status = document.querySelector('.status');
    status.textContent = 'Options saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 1000);
  });
  e && e.preventDefault();
}

function restoreOptions() {
  browserAppData.storage.local.get({
    inspector: true,
    shortid: true,
    position: 'bl'
  }, items => {
    document.querySelector('#inspector').checked = items.inspector;
    document.querySelector('#shortid').checked = items.shortid;
    document.querySelector('#position').value = items.position;
  });
}


document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
