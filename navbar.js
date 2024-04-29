// Function to open the about pop-up box from the navbar
function displayProfilePage() {
  const profileBox = document.querySelector(".profile-pop-up");
  const overlay = document.querySelector(".overlay");
  overlay.style.display = "block";
  setTimeout(() => { // Timeout ensures the display is set before starting opacity transition
    overlay.style.opacity = "1";
    profileBox.classList.add("display-pop-up");
  }, 10);
}

// Function to close about pop-up box
function closeProfilePage() {
  const profileBox = document.querySelector(".profile-pop-up");
  const overlay = document.querySelector(".overlay");
  profileBox.classList.remove("display-pop-up");
  overlay.style.opacity = "0";
  setTimeout(() => { // Delay to wait for the opacity transition to finish before hiding the display
    overlay.style.display = "none";
  }, 300);
}

// Function to open the about pop-up box from the navbar
function displayAboutPage() {
  const aboutBox = document.querySelector(".about-pop-up");
  const overlay = document.querySelector(".overlay");
  overlay.style.display = "block";
  setTimeout(() => { // Timeout ensures the display is set before starting opacity transition
    overlay.style.opacity = "1";
    aboutBox.classList.add("display-pop-up");
  }, 10);
}

// Function to close about pop-up box
function closeAboutPage() {
  const aboutBox = document.querySelector(".about-pop-up");
  const overlay = document.querySelector(".overlay");
  aboutBox.classList.remove("display-pop-up");
  overlay.style.opacity = "0";
  setTimeout(() => { // Delay to wait for the opacity transition to finish before hiding the display
    overlay.style.display = "none";
  }, 300);
}

// Function to open the settings pop-up box from the navbar
function displaySettingsPage() {
  const settingsBox = document.querySelector(".settings-pop-up");
  const overlay = document.querySelector(".overlay");
  overlay.style.display = "block";
  setTimeout(() => { // Timeout ensures the display is set before starting opacity transition
    overlay.style.opacity = "1";
    settingsBox.classList.add("display-pop-up");
  }, 10);
}

// Function to close settings pop-up box
function closeSettingsPage() {
  const settingsBox = document.querySelector(".settings-pop-up");
  const overlay = document.querySelector(".overlay");
  settingsBox.classList.remove("display-pop-up");
  overlay.style.opacity = "0";
  setTimeout(() => { // Delay to wait for the opacity transition to finish before hiding the display
    overlay.style.display = "none";
  }, 300);
}

// Event listener for profile button
document.addEventListener("DOMContentLoaded", function () {
  const profileButton = document.getElementById("profile-button");
  profileButton.addEventListener("click", displayProfilePage);

  const closeButton = document.querySelector(".profile-pop-up button");
  closeButton.addEventListener("click", closeProfilePage);

  // Close overlay when clicking on the outside of the box
  const overlay = document.querySelector(".overlay");
  overlay.addEventListener("click", closeProfilePage);

  // Close overlay when pressing Esc key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeProfilePage();
    }
  });
});

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

  // Handling tab switching
  const tabs = document.querySelectorAll(".settings-tab-button");
  const tabContents = document.querySelectorAll(".settings-tab-content");
  
  // Function to default the settings popup to the first tab (Profile)
  function defaultToFirstTab() {
    // Remove 'active' class from all tabs and hide all content
    tabs.forEach(tab => {
      tab.classList.remove("active");
    });
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Add 'active' class to the first tab and display the first tab content
    tabs[0].classList.add("active");
    tabContents[0].style.display = 'block';
  }

  const settingsButton = document.getElementById("settings-button");
  settingsButton.addEventListener("click", function() {
    defaultToFirstTab();
    displaySettingsPage();
  });

  const closeButton = document.querySelector(".settings-close-button");
  closeButton.addEventListener("click", closeSettingsPage);

  // Close overlay when clicking on the outside of the box
  const overlay = document.querySelector(".overlay");
  overlay.addEventListener("click", closeSettingsPage);

  // Close overlay when pressing Esc key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSettingsPage();
    }
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", function() {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.style.display = 'none');

      tab.classList.add("active");
      tabContents[index].style.display = 'block';
    });
  
  defaultToFirstTab()

  });
});