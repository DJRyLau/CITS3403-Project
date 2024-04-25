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

// Function to open the settings pop-up box from the navbar
function displaySettingsPage() {
  const settingsBox = document.querySelector(".settings-pop-up");
  const overlay = document.querySelector(".overlay");
  overlay.style.display = "block";
  setTimeout(() => { // This timeout ensures the display is set before starting opacity transition
    overlay.style.opacity = "1";
    settingsBox.classList.add("display-pop-up");
  }, 10); // Short delay to ensure the display change has taken effect
}

// Function to close settings pop-up box
function closeSettingsPage() {
  const settingsBox = document.querySelector(".settings-pop-up");
  const overlay = document.querySelector(".overlay");
  settingsBox.classList.remove("display-pop-up");
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

// Event listener for settings button
document.addEventListener("DOMContentLoaded", function () {
  const settingsButton = document.getElementById("settings-button");
  settingsButton.addEventListener("click", displaySettingsPage);

  const closeButton = document.querySelector(".settings-close-button");
  closeButton.addEventListener("click", closeSettingsPage);

  const settingsPopUp = document.querySelector(".settings-pop-up");


  // Close overlay when clicking on the outside of the box
  const overlay = document.querySelector(".overlay");
  overlay.addEventListener("click", closeSettingsPage);

  // Close overlay when pressing Esc key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSettingsPage();
    }
  });

  // Handling tab switching
  const tabs = document.querySelectorAll(".settings-tab-button");
  const tabContents = document.querySelectorAll(".settings-tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", function() {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.style.display = 'none');

      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).style.display = 'block';
    });
  });
});