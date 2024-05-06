// Function to toggle the visibility of pop-ups
function togglePopUp(popUpId, isOpen) {

  const popUp = document.querySelector(popUpId);
  const overlay = document.querySelector(".overlay");
  
  if (isOpen) {
      overlay.style.display = "block";
      setTimeout(() => {
          overlay.style.opacity = "1";
          popUp.classList.add("display-pop-up");
      }, 10);
  } else {
      popUp.classList.remove("display-pop-up");
      overlay.style.opacity = "0";
      setTimeout(() => {
          overlay.style.display = "none";
      }, 300);
  }
}

// Function to initialize and manage tabs in the settings pop-up
function initializeSettingsTabs() {
  const tabs = document.querySelectorAll(".settings-tab-button");
  const tabContents = document.querySelectorAll(".settings-tab-content");

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", function() {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.style.display = 'none');

      tab.classList.add("active");
      tabContents[index].style.display = 'block';
    });
  });

  // Default to the first tab on initial load
  if (tabs.length > 0) {
      tabs[0].click();
  }
}

// Event listeners for pop-ups
document.addEventListener("DOMContentLoaded", function () {
  const buttons = {
    "profile-button": ".profile-pop-up",
    "about-button": ".about-pop-up",
    "settings-button": ".settings-pop-up"
  };

  // Initialize listeners for each button
  Object.keys(buttons).forEach(btnId => {
    const button = document.getElementById(btnId);
    const popUpId = buttons[btnId];

    button.addEventListener("click", () => togglePopUp(popUpId, true));
  });

  const closeButtons = document.querySelectorAll(".close-button");
  closeButtons.forEach(button => {
    button.addEventListener("click", function() {
      // Assuming the close function needs to close the parent pop-up of this button
      const popUp = button.closest('.settings-pop-up, .profile-pop-up, .about-pop-up');
      if (popUp) {
        togglePopUp(`#${popUp.id}`, false);
      }
    });
  });

  // Tab handling in Settings pop-up
  initializeSettingsTabs();

  // Overlay and Escape key listeners
  const overlay = document.querySelector(".overlay");
  overlay.addEventListener("click", function() {
    document.querySelectorAll('.display-pop-up').forEach(popUp => {
      togglePopUp(`#${popUp.id}`, false);
    });
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
      document.querySelectorAll('.display-pop-up').forEach(popUp => {
        togglePopUp(`#${popUp.id}`, false);
      });
    }
  });
});


document.addEventListener('DOMContentLoaded', function() {
  const usernameContainer = document.querySelector('.username-container');
  const usernameSpan = document.querySelector('.username');
  const editIcon = document.querySelector('.edit-icon');
  const editInput = document.querySelector('.edit-username');

  usernameContainer.addEventListener('click', function() {
      editInput.style.display = 'block';
      usernameSpan.style.display = 'none';
      editIcon.style.visibility = 'hidden';
      editInput.value = usernameSpan.textContent;
      editInput.focus();
      document.querySelector('.settings-pop-up').removeEventListener('keydown', handlePopupKeydown);
  });

  editInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
          usernameSpan.textContent = editInput.value;
          cancelEdit();
      } else if (e.key === 'Escape') {
          cancelEdit();
      }
  });

  function cancelEdit() {
      editInput.style.display = 'none';
      usernameSpan.style.display = 'block';
      editIcon.style.visibility = 'visible';
      document.querySelector('.settings-pop-up').addEventListener('keydown', handlePopupKeydown);
  }
});

function handlePopupKeydown(e) {
  if (e.key === 'Escape') {
      // TODO: Close the settings pop-up
      // Must work together with event listener for 'escape' for closing pop-up
      closePopUp('.settings-pop-up');
  }
}