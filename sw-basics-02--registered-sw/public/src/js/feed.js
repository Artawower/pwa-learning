var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var defaultPrompt;

function openCreatePostModal() {
  createPostArea.style.display = "block";
  console.log(defaultPrompt);
  if (defaultPrompt) {
    defaultPrompt.prompt();
    defaultPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult);

      if (choiceResult.outcome === "dismissed") {
        console.log("User canceled installation");
      } else {
        console.log("User accepted installation");
      }
      defaultPrompt = null;
    });
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);
