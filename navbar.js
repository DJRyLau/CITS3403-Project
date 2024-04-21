// Function to open the about pop-up box from the navbar
function displayAboutPage() {
  const aboutBox = document.querySelector(".about-pop-up");
  aboutBox.classList.add("display-pop-up");
}

// Function to close about pop-up box
function closeAboutPage() {
  const aboutBox = document.querySelector(".about-pop-up");
  aboutBox.classList.remove("display-pop-up");
}

// Event listener for about button
document.addEventListener("DOMContentLoaded", function () {
  const aboutButton = document.getElementById("about-button");
  aboutButton.addEventListener("click", displayAboutPage);

  const closeButton = document.querySelector(".about-pop-up button");
  closeButton.addEventListener("click", closeAboutPage);
});
