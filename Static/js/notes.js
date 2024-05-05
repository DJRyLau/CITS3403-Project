// Function to create a new sticky note
function createStickyNote() {
  const board = document.getElementById("board");
  const note = document.createElement("div");
  note.classList.add("sticky-note");
  note.style.backgroundColor = getRandomColor();

  // Add header with user and photo
  const header = document.createElement("div");
  header.classList.add("sticky-note-header");
  header.innerHTML = `
    <img src="user-photo.jpg" alt="Profile Photo">
    <span>Name</span>
  `;
  note.appendChild(header);

  // Add content
  const content = document.createElement("div");
  content.classList.add("sticky-note-content");
  content.setAttribute("contenteditable", "true");
  content.textContent = "Write your note here...";
  note.appendChild(content);

  // Add replies container
  const repliesContainer = document.createElement("div");
  repliesContainer.classList.add("sticky-note-replies");
  note.appendChild(repliesContainer);

  // Event listener for adding replies
  content.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addReply(note, content.textContent.trim());
      content.textContent = ""; // Clears input after adding response
    }
  });

  board.appendChild(note);
}

// Function to add a reply to a sticky note
function addReply(note, replyText) {
  const repliesContainer = note.querySelector(".sticky-note-replies");
  const reply = document.createElement("div");
  reply.classList.add("sticky-note-reply");
  const timestamp = new Date().toLocaleString();
  reply.innerHTML = `
    <strong>User Name:</strong>
    <span class="timestamp">${timestamp}</span>
    <div class="reply-text">${replyText}</div>
  `;
  repliesContainer.appendChild(reply);
}

// Function to get a random colour for each note
function getRandomColor() {
  const colors = [
    "#ffcccc",
    "#ffe6cc",
    "#ffffcc",
    "#cce6ff",
    "#ccffcc",
    "#f2f2f2",
    "#e6ccff",
    "#ffccff",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Event listener for creating a new sticky note
document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.getElementById("add-note-button");
  addButton.addEventListener("click", createStickyNote);
});

document.addEventListener("DOMContentLoaded", function () {
  // Toggle functionality for SignIn and Create Account buttons
  const signinBtn = document.getElementById("signin-btn");
  const createBtn = document.getElementById("create-btn");
  const loginSection = document.getElementById("login-section");
  const createSection = document.getElementById("create-section");

  if (signinBtn && createBtn && loginSection && createSection) {
    signinBtn.addEventListener("click", function () {
      loginSection.style.display = "block";
      createSection.style.display = "none";
    });

    createBtn.addEventListener("click", function () {
      loginSection.style.display = "none";
      createSection.style.display = "block";
    });
  }

  // Handling the login form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      // Yet to implement handling login  login
    });
  }

  // Handling the create account form
  const createForm = document.getElementById("create-form");
  if (createForm) {
    createForm.addEventListener("submit", (event) => {
      // Yet to implement handling account creation
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var loginSection = document.getElementById("login-section");
  var createSection = document.getElementById("create-section");
  var showCreate = document.getElementById("show-create");
  var showSignin = document.getElementById("show-signin");

  showCreate.addEventListener("click", function (event) {
    loginSection.style.display = "none";
    createSection.style.display = "block";
  });
  showSignin.addEventListener("click", function (event) {
    event.preventDefault();
    loginSection.style.display = "block";
    createSection.style.display = "none";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var authContainer = document.querySelector(".auth-container");
  var aboutSection = document.querySelector(".about-section");
  var closeButtons = document.querySelectorAll(".close-btn");
  var pageHeader = document.querySelector(".page-title");
  var signinBtn = document.getElementById("signin-btn");
  var createBtn = document.getElementById("create-btn");
  var loginSection = document.getElementById("login-section");
  var createSection = document.getElementById("create-section");
  const loginAlertFail = document.querySelector(".alert-loginfail");
  const registerAlertFail = document.querySelector(".alert-registerfail");


  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      authContainer.style.display = "none";
      aboutSection.style.display = "flex";
    });
  });

  function showSection(showAbout) {
    if (showAbout) {
      aboutSection.style.display = "flex"; // Show the about section
      authContainer.style.display = "none";
      pageHeader.classList.add("page-title-large");
      pageHeader.classList.remove("page-title-small");
    } else {
      aboutSection.style.display = "none";
      authContainer.style.display = "flex"; // Show the auth container
      pageHeader.classList.add("page-title-small");
      pageHeader.classList.remove("page-title-large");
    }
  }

  // Initially show the about section
  showSection(true);
  // Retain login window if failed login
  if (loginAlertFail) {
    showSection(false);
    loginSection.style.display = "block";
    createSection.style.display = "none";
  }
  if (registerAlertFail) {
    showSection(false);
    loginSection.style.display = "none";
    createSection.style.display = "block";
  }

  signinBtn.addEventListener("click", function () {
    showSection(false);
    loginSection.style.display = "block";
    createSection.style.display = "none";
  });

  createBtn.addEventListener("click", function () {
    showSection(false);
    loginSection.style.display = "none";
    createSection.style.display = "block";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach(function (alert) {
      alert.style.opacity = 0;
    });
  }, 5000);
});
