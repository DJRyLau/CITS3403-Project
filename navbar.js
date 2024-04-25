// Function to open the about pop-up box from the navbar
function displayAboutPage() {
  const aboutBox = document.querySelector(".about-pop-up");
  const overlay = document.querySelector(".overlay");
  overlay.style.display = "block";
  setTimeout(() => { // This timeout ensures the display is set before starting opacity transition
    overlay.style.opacity = "1";
    aboutBox.classList.add("display-pop-up");
  }, 10); // Short delay to ensure the display change has taken effect
}

// Function to close about pop-up box
function closeAboutPage() {
  const aboutBox = document.querySelector(".about-pop-up");
  const overlay = document.querySelector(".overlay");
  aboutBox.classList.remove("display-pop-up");
  overlay.style.opacity = "0";
  setTimeout(() => { // Delay to wait for the opacity transition to finish before hiding the element
    overlay.style.display = "none";
  }, 300); // This should match the duration of the opacity transition
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
