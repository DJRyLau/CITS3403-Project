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

// Function to save preferences to file
function savePreferences(csrfToken) {
  const preferences = {
    designTheme: document.getElementById('theme-selection').value,
    designBackColor: document.getElementById('back-color-selection').value,
    designSideBarColor: document.getElementById('panel-color-selection').value,
    timezone: document.getElementById('timezone-selection').value,
    enableEmailNotif: document.getElementById('toggle-notif').checked,
    enableEmailNotifReply: document.getElementById('toggle-notif-reply').checked,
    enableEmailNotifBoard: document.getElementById('toggle-notif-all-board').checked,
    enableEmailNotifOwn: document.getElementById('toggle-notif-all-own').checked,
    enableEmailNotifStar: document.getElementById('toggle-notif-all-star').checked,
    privacy: document.getElementById('privacy-visibility').value,
    profilePicture: document.getElementById('profile-picture').src,
    username: document.getElementById('username').textContent,
    lightDarkMode: document.getElementById('toggle-theme').checked,
    noteColour: document.getElementById('note-colour-picker').value,
  };

  console.log('Saving preferences:', preferences); // Debugging

  fetch('/save_preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken // Include CSRF token in the headers
    },
    body: JSON.stringify(preferences),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

// Function to load preferences from file
function loadPreferences() {
  fetch('/get_preferences')
  .then(response => response.json())
  .then(data => {
    if (data) {
      document.getElementById('theme-selection').value = data.designTheme;
      document.getElementById('back-color-selection').value = data.designBackColor;
      document.body.style.backgroundColor = data.designBackColor; // Load to background
      document.getElementById('panel-color-selection').value = data.designSideBarColor;
      document.getElementById("side-navbar").style.backgroundColor = data.designSideBarColor; // Load to side navbar
      document.getElementById('timezone-selection').value = data.timezone;
      document.getElementById('toggle-notif').checked = data.enableEmailNotif;
      document.getElementById('toggle-notif-reply').checked = data.enableEmailNotifReply;
      document.getElementById('toggle-notif-all-board').checked = data.enableEmailNotifBoard;
      document.getElementById('toggle-notif-all-own').checked = data.enableEmailNotifOwn;
      document.getElementById('toggle-notif-all-star').checked = data.enableEmailNotifStar;
      document.getElementById('privacy-visibility').value = data.privacy;
      document.getElementById('profile-picture').src = data.profilePicture;
      document.getElementById('note-sample-profile-picture').src = data.profilePicture; // Load to example note
      document.getElementById('username').textContent = data.username;
      document.getElementById('note-sample-user-name').textContent = data.username; // Load to example note
      document.getElementById('toggle-theme').checked = data.lightDarkMode;
      document.getElementById('note-colour-picker').value = data.noteColour;
      document.getElementById('note-sample').style.backgroundColor = data.noteColour; // Update note sample color

      // Toggle Light/Dark mode
      if (data.lightDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light-mode');
      }
    }
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}

// Load preferences when the page loads
loadPreferences();

// Event listeners for pop-ups
document.addEventListener("DOMContentLoaded", function () {
  let isEditingUsername = false;
  let changesMade = false;

  // Tab Handling in Settings Pop-up
  initializeSettingsTabs();

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

  // Close Buttons
  const closeButtons = document.querySelectorAll(".close-button");

  closeButtons.forEach(button => {
    button.addEventListener("click", function() {
      const popUp = button.closest('.settings-pop-up, .profile-pop-up, .about-pop-up');
      if (popUp) {
        togglePopUp(`#${popUp.id}`, false);
        // Case for profile pop-up for editing
        if (popUp.id === "profile-pop-up") {
          isEditingUsername = false; // Ensure to reset edit mode if closing via close button
        }
      }
      exitEditMode();
      saveChanges('profile-unsaved-changes-bar', false)
      saveChanges('settings-unsaved-changes-bar', false)
    });
  });

  // Overlay and Escape key listeners
  const overlay = document.querySelector(".overlay");
  overlay.addEventListener("click", function() {
    if (!isEditingUsername && !changesMade) { // Only close pop-ups if not editing username and no changes have been made
      document.querySelectorAll('.display-pop-up').forEach(popUp => {
        togglePopUp(`#${popUp.id}`, false);
      });
      saveChanges('profile-unsaved-changes-bar', false)
      saveChanges('settings-unsaved-changes-bar', false)
    }
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
      document.querySelectorAll('.display-pop-up').forEach(popUp => {
        togglePopUp(`#${popUp.id}`, false);
      });
      exitEditMode();
      saveChanges('profile-unsaved-changes-bar', false)
      saveChanges('settings-unsaved-changes-bar', false)
    }
  });

  const usernameContainer = document.querySelector('.username-container');
  const username = document.querySelector('.username');
  const editIcon = document.querySelector('.username-edit-icon');
  const editInput = document.querySelector('.username-edit');

  usernameContainer.addEventListener('click', function() {
    if (!isEditingUsername) {
      enterEditMode();
    }
  });

  editInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      username.textContent = editInput.value;
      document.getElementById('note-sample-user-name').textContent = editInput.value; // Load to example note
      exitEditMode();
    } else if (e.key === 'Escape') {
      exitEditMode();
    }
  });

  // Save changes when the input loses focus
  editInput.addEventListener('blur', function() {
    username.textContent = editInput.value;
    document.getElementById('note-sample-user-name').textContent = editInput.value; // Load to example note
    exitEditMode();
  });

  function enterEditMode() {
    editInput.style.display = 'block';
    username.style.display = 'none';
    editIcon.style.opacity = 0;
    editInput.value = username.textContent;
    editInput.focus();
    isEditingUsername = true;
  }

  // Function to exit Edit Mode for username
  function exitEditMode() {
    editInput.style.display = 'none';
    username.style.display = 'block';
    editIcon.style.opacity = '';
    isEditingUsername = false;
  }

  // Color Picker
  const colorPicker = document.getElementById('note-colour-picker');
  const noteSample = document.getElementById('note-sample');

  colorPicker.addEventListener('input', function() {
    noteSample.style.backgroundColor = this.value; // Update note sample color
  });

  // Unsaved Changes Bar
  const profileInputs = document.querySelectorAll('.profile-pop-up input, .profile-pop-up select');
  const settingsInputs = document.querySelectorAll('.settings-pop-up input, .settings-pop-up select');
  
  const profileUnsavedChangesBar = document.querySelector('.unsaved-changes-bar#profile-unsaved-changes-bar');
  const settingsUnsavedChangesBar = document.querySelector('.unsaved-changes-bar#settings-unsaved-changes-bar');

  // Get CSRF token from meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  //Detects any changes within the profile
  profileInputs.forEach(input => {
    input.addEventListener('change', function() {
      profileUnsavedChangesBar.classList.add('display');
      changesMade = true;
    }); 
  });

  //Detects any changes within the settings
  settingsInputs.forEach(input => {
    input.addEventListener('change', function() {
      settingsUnsavedChangesBar.classList.add('display');
      changesMade = true;
    }); 
  });
  
  // Function to revert or save changes
  function saveChanges(barID, save) {
    const unsavedChangesBar = document.getElementById(barID);
    changesMade = false;
    if (save) {
      unsavedChangesBar.classList.remove('display');
      savePreferences(csrfToken)
    } else {
      unsavedChangesBar.classList.remove('display');
      loadPreferences()
    }
  }
  
  // Save or Revert Changes
  document.getElementById('profile-save-changes').addEventListener('click', () => saveChanges('profile-unsaved-changes-bar', true));
  document.getElementById('profile-revert-changes').addEventListener('click', () => saveChanges('profile-unsaved-changes-bar', false));
  document.getElementById('settings-save-changes').addEventListener('click', () => saveChanges('settings-unsaved-changes-bar', true));
  document.getElementById('settings-revert-changes').addEventListener('click', () => saveChanges('settings-unsaved-changes-bar', false));
});

// File Upload
document.addEventListener('DOMContentLoaded', function() {
  const profileContainer = document.querySelector('.profile-picture-container');
  const fileInput = document.getElementById('profile-picture-input');
  const profileImage = document.querySelector('.profile-picture');

  profileContainer.addEventListener('click', function() {
    fileInput.click();
  });

  //Detects any changes within the settings
  fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      // Check the file size (< 100 KB) and type (image)
      if (file.size < 102400 && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
            // Check the dimensions are at least 40px by 40px
            if (img.width >= 40 && img.height >= 40) {
              profileImage.src = e.target.result; // Update the image src
            } else {
              alert('Image dimensions are too small. Minimum size is 40x40 pixels.');
            }
          };
          img.src = e.target.result;
          document.getElementById('note-sample-profile-picture').src = e.target.result; // Load to example note
        };
        reader.readAsDataURL(file);
    } else {
        alert('File is too large or not an image. Please select an image less than 100kb.');
      }
    }
  });

  const toggleThemeCheckbox = document.getElementById('toggle-theme');

  // Load theme from localStorage
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    document.body.classList.add(currentTheme);
    toggleThemeCheckbox.checked = currentTheme === 'dark-mode';
  }

  // Toggle theme
  toggleThemeCheckbox.addEventListener('change', function() {
    if (toggleThemeCheckbox.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light-mode');
    }
  });

    // Side navbar
  const openSidebarButton = document.getElementById(
    "boards-sidebar-arrow-button"
  );
  const closeSidebarButton = document.getElementById("close-sidebar");
  const boardsNavbar = document.getElementById("side-navbar");
  const draggableBar = document.getElementById("draggable-bar");

  let isResizing = false;

  // Event listeners for opening and closing the side navbar
  openSidebarButton.addEventListener("click", openSidenav);
  closeSidebarButton.addEventListener("click", closeSidenav);

  function openSidenav() {
    isNavbarOpen = true;
    boardsNavbar.style.width = "250px";
  }

  function closeSidenav() {
    isNavbarOpen = false;
    boardsNavbar.style.width = "0";
  }

  draggableBar.addEventListener("mousedown", startResize);

  function startResize(e) {
    e.preventDefault();
    isResizing = true;
    const minWidth = 140; // Minimum width
    const startX = e.clientX;
    const startWidth = boardsNavbar.offsetWidth;

    function resizeNavbar(e) {
      const newWidth = startWidth + e.clientX - startX;
      boardsNavbar.style.width = `${Math.max(minWidth, newWidth)}px`;
    }

    function stopResizeNavbar() {
      isResizing = false;
      window.removeEventListener("mousemove", resizeNavbar);
      window.removeEventListener("mouseup", stopResizeNavbar);
    }

    window.addEventListener("mousemove", resizeNavbar);
    window.addEventListener("mouseup", stopResizeNavbar);
  }

});

document.addEventListener("DOMContentLoaded", function () {
  const backColorPicker = document.getElementById("back-color-selection");
  const panelColorPicker = document.getElementById("panel-color-selection");

  backColorPicker.addEventListener("input", function () {
    document.body.style.backgroundColor = backColorPicker.value;
  });

  panelColorPicker.addEventListener("input", function () {
    document.getElementById("side-navbar").style.backgroundColor = panelColorPicker.value;
  });
});