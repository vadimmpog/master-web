// Load existent stats with the storage API.
let gettingStoredStats = browser.storage.local.get();

gettingStoredStats.then(store => {
  // Initialize the saved stats if not yet initialized.
  if (!store.stats) {
    store = {
      status: "default",
      scenarios: {}
    };
  }

  // Monitor completed navigation events and update
  // stats accordingly.
  browser.webNavigation.onCommitted.addListener((evt) => {
    if (evt.frameId !== 0) {
      return;
    }

    let transitionType = evt.transitionType;
    store.scenarios[transitionType] = store.scenarios[transitionType] || 0;
    store.scenarios[transitionType]++;

    // Persist the updated stats.
    browser.storage.local.set(store);
  });

  // browser.webNavigation.onCommitted.addListener((evt) => {
  //   if (evt.frameId !== 0) {
  //     return;
  //   }
  //
  //   let transitionType = evt.transitionType;
  //   store.type[transitionType] = store.type[transitionType] || 0;
  //   store.type[transitionType]++;
  //
  //   // Persist the updated stats.
  //   browser.storage.local.set(store);
  // });

  // browser.webNavigation.onCompleted.addListener(evt => {
  //   // Filter out any sub-frame related navigation event
  //   if (evt.frameId !== 0) {
  //     return;
  //   }
  //
  //   const url = new URL(evt.url);
  //
  //   store.host[url.hostname] = store.host[url.hostname] || 0;
  //   store.host[url.hostname]++;
  //
  //   // Persist the updated stats.
  //   browser.storage.local.set(store);
  // }, {
  //   url: [{schemes: ["http", "https"]}]});
});


