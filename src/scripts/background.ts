window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    if (event.data.action == "SET_FAV") {
      console.log("FROM BG: Save post: " + event.data.id + ', status: ' + event.data.status);
    }
    // port.postMessage(event.data);
  }
}, false);