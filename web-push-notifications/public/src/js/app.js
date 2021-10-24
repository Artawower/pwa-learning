var deferredPrompt;

var enableNotificationsButtons = document.querySelectorAll(
  ".enable-notifications"
);

if (!window.Promise) {
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function () {
      console.log("Service worker registered!");
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("beforeinstallprompt fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification(title) {
  if ("serviceWorker" in navigator) {
    const options = {
      body: title || "You sucessfully subscribed! But title not provided.",
      icon: "/src/images/icons/app-icon-96x96.png",
      iamge: "/src/images/sf-boat.jpg",
      dir: "ltr",
      lang: "en-UIS", // BCP 47
      vibrate: [100, 50, 200], // vibration ms, not every device support it
      badge: "/src/images/icons/app-icon-96x96.png", // Android, andoid will automatically mask colorfull pics
      tag: "confirm-notification", // Something like ID (for stack notification with same tag)
      renotify: true, // Even use same tag, phone will vibrate
      actions: [
        {
          action: "confirm",
          title: "Okay",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
        {
          action: "cancel",
          title: "Oh no..no-no",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
      ],
    };
    navigator.serviceWorker.ready.then((swreg) => {
      swreg.showNotification("Successfully subscribed! (from SW!)", options);
    });
  }
}

const publicVapidKey =
  "BJxgti75ow0Q96X5fGMIz5PAwdR4a_eGg9KbrpTo8qBaacix5UEMBX0S2amT3HweXWsClr5tsV3EOMYWElIlhOc";

function configurePushSub() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  let reg;
  navigator.serviceWorker.ready
    .then((swreg) => {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then((sub) => {
      console.debug("[line 74][app.js] 🚀 sub: ", sub);
      // if (!sub) {
      // Create a new subscription
      return reg.pushManager.subscribe({
        userVisibleOnly: true, // Only visible for current user
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey), // Our key for determine sender
      });
      // }

      // We have a subscription
    })
    .then((newSub) => {
      console.debug("[line 85][app.js] 🚀 newSub: ", newSub);
      return fetch("http://localhost:3010/subscribe", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(newSub),
      });
    })
    .then((res) => {
      return res.clone().json();
    })
    .then((res) => {
      console.debug("[line 101][app.js] 🚀 res: ", res);
      displayConfirmNotification(res.title);
    })
    .catch((err) => {
      console.warn("[line 101][app.js] 🚀 err: ", err);
    });
}

function askForNotificationPermission() {
  Notification.requestPermission((result) => {
    console.log("[line 30][app.js] 🚀 result: ", result);
    if (result !== "granted") {
      console.log("No notification permission granted!");
      return;
    }
    // TODO: SHOW NOTIFICATION
    // displayConfirmNotification();
    configurePushSub();
  });
}

if ("Notification" in window) {
  console.log(
    "[line 43][app.js] 🚀 enableNotificationsButtons: ",
    enableNotificationsButtons
  );
  enableNotificationsButtons.forEach((n) => {
    console.log(n);

    n.style.display = "inline-block";
    n.addEventListener("click", askForNotificationPermission);
  });
}
