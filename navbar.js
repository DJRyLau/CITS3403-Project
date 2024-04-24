// Function to open the about pop-up box from the navbar
function displayAboutPage() {
  const aboutBox = document.querySelector(".about-pop-up");
  const overlay = document.querySelector(".overlay");
  aboutBox.classList.add("display-pop-up");
  overlay.style.display = "block";
}

// Function to close about pop-up box
function closeAboutPage() {
  const aboutBox = document.querySelector(".about-pop-up");
  const overlay = document.querySelector(".overlay");
  aboutBox.classList.remove("display-pop-up");
  overlay.style.display = "none";
}

// Event listener for about button
document.addEventListener("DOMContentLoaded", function () {
  const aboutButton = document.getElementById("about-button");
  aboutButton.addEventListener("click", displayAboutPage);

  const closeButton = document.querySelector(".about-pop-up button");
  closeButton.addEventListener("click", closeAboutPage);

  // Close overlay when clicking on the outside of the box
  const overlay = document.querySelector(".overlay");
  overlay.addEventListener("click", closeAboutPage);

  // Close overlay when pressing Esc key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAboutPage();
    }
  });
});
