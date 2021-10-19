navigator?.serviceWorker?.register("/sw.js").then(function () {
  console.log("Service worker registered!");
});
window.addEventListener("beforeinstallprompt", function (event) {
  console.log("beforeinstalprompt fired");
  event.preventDefault();
  defaultPrompt = event;
  return false;
});

fetch("http://httpbin.org/ip").then((response) => {
  console.log(response);
  response.json().then((l) => {
    console.log(l);
  });
});
