var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#location");
var videoPlayer = document.querySelector("#player");
var canvasElement = document.querySelector("#canvas");
var captureButton = document.querySelector("#capture-btn");
var imagePickerArea = document.querySelector("#pick-image");
var picture;
var locationLoader = document.querySelector("#location-loader");
var locationBtn = document.querySelector("#location-btn");

var fetchedLocation;

locationBtn.addEventListener("click", function (e) {
  initializeLocation();
});

function restoreLocationView() {
  locationBtn.style.display = "inline";
  locationLoader.style.display = "none";
}

function initializeLocation() {
  if (!("geolocation" in navigator)) {
    locationBtn.style.display = "none";
  }

  locationBtn.style.display = "none";
  locationLoader.style.display = "block";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.debug("[line 36][feed.js] 🚀 position: ", position);
      restoreLocationView();
      fetchedLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      locationInput.value = JSON.stringify(fetchedLocation);
      locationInput.classList.add("is-focused");
    },
    (err) => {
      console.debug("[line 46][feed.js] 🚀 err: ", err);
      restoreLocationView();
      fetchedLocation = { lat: null, lng: null };
      alert("Couldn't fetch location, please enter manually");
    },
    {
      timeout: 7000, // 7 секунд на нахождение позиции.
    }
  );
}

function initalizeMedia() {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = (constraints) => {
      const getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented"));
      }

      return new Promise((resolve, reject) => {
        return getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then((stream) => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = "block";
    })
    .catch((error) => {
      imagePickerArea.style.display = "block";
      videoPlayer.style.display = "none";
    });
}

imagePickerArea.addEventListener("change", (event) => {
  picture = event.target.files[0];
});

captureButton.addEventListener("click", (event) => {
  canvasElement.style.display = "block";
  videoPlayer.style.display = "none";
  captureButton.style.display = "none";
  const context = canvasElement.getContext("2d");
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvasElement.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  );
  console.debug("[line 60][feed.js] 🚀 canvas.width: ", canvas.width);
  videoPlayer.srcObject.getVideoTracks().forEach((track) => {
    track.stop();
  });
  picture = dataURItoBlob(canvasElement.toDataURL());
});

function openCreatePostModal() {
  createPostArea.style.display = "block";
  setTimeout(function () {
    createPostArea.style.transform = "translateY(0)";
  }, 1);
  initalizeMedia();
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  imagePickerArea.style.display = "none";
  videoPlayer.style.display = "none";
  canvasElement.style.display = "none";
  locationBtn.style.display = "inline";
  locationLoader.style.display = "none";
  captureButton.style.display = "inline";
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
      track.stop();
    });
  }
  setTimeout(function () {
    createPostArea.style.transform = "translateY(100vh)";
  }, 1);
  // createPostArea.style.display = 'none';
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
  console.log("clicked");
  if ("caches" in window) {
    caches.open("user-requested").then(function (cache) {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  // cardTitle.style.backgroundImage = "url(" + data.image + ")";
  // console.log("Image converted", toBase64(data.image.buffer.data));
  cardTitle.style.backgroundImage = `url(data:image/png;base64,${toBase64(
    data.image.buffer.data
  )})`;
  cardTitle.style.backgroundSize = "cover";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

var url = "http://localhost:3010/posts";
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("From web", data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  readAllData("posts").then(function (data) {
    if (!networkDataReceived) {
      console.log("From cache", data);
      updateUI(data);
    }
  });
}

function sendData() {
  const id = new Date().toISOString();
  const postData = new FormData();
  postData.append("id", id);
  postData.append("title", d.title);
  postData.append("rawLocationLat", fetchedLocation.lat);
  postData.append("rawLocationLng", fetchedLocation.lng);
  postData.append("location", d.location);
  postData.append("file", dt.picture, `${id}.png`);

  fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: postData,
  }).then((res) => {
    console.log("Sent data", res);
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  event.stopPropagation();

  if (titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert("Please enter valid data!");
    return;
  }

  closeCreatePostModal();

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((sw) => {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        picture,
        rawLocation: fetchedLocation,
      };
      // Store indexdb
      writeData("sync-posts", post)
        .then(() => {
          return sw.sync.register("sync-posts");
        })
        .then(() => {
          const snackbar = document.querySelector("#confirmation-toast");
          const data = { message: "Your Post was save for syncing!" };
          snackbar.MaterialSnackbar.showSnackbar(data);
        });
    });
    return;
  }
  // Service worker unsupported block
  sendData();
});
