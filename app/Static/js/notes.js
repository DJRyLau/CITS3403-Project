// Function to create a new sticky note
document.addEventListener("DOMContentLoaded", function () {
  var addNoteButton = document.getElementById("add-note-button");
  if (addNoteButton) {
    addNoteButton.addEventListener("click", createStickyNote);
  }
});

function createStickyNote() {
  const board = document.getElementById("board");
  if (!board) return;

  const note = document.createElement("div");
  note.classList.add("sticky-note");
  note.setAttribute("contenteditable", "true");
  note.textContent = "Write your note here...";

  // Create and append the color picker
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.value = "#ffffff";
  colorPicker.style.position = "absolute";
  colorPicker.style.right = "5px";
  colorPicker.style.top = "5px";

  colorPicker.addEventListener("input", function () {
    note.style.backgroundColor = colorPicker.value;
  });

  note.appendChild(colorPicker);

  note.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote(note.textContent.trim(), colorPicker.value);
      note.setAttribute("contenteditable", "false");
      note.removeChild(colorPicker);
      note.blur();
    }
  });

  board.appendChild(note);
}

function saveNote(content, color) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  fetch("/notes/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-Token": csrfToken,
    },
    body: `content=${encodeURIComponent(content)}&color=${encodeURIComponent(
      color
    )}`,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Note saved", data);
      window.location.reload(); // Reload to see the new note
    })
    .catch((error) => console.error("Error saving note:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".delete-note-button").forEach((button) => {
    button.addEventListener("click", function (e) {
      if (!confirm("Are you sure you want to delete this note?")) {
        e.preventDefault();
      }
    });
  });
});

function deleteNote(noteId) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  fetch(`/notes/delete/${noteId}`, {
    method: "DELETE",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  })
    .then((response) => {
      if (response.ok) {
        document
          .querySelector(`[data-note-id="${noteId}"]`)
          .parentNode.remove();
        alert("Note deleted successfully");
      } else {
        throw new Error("Failed to delete note");
      }
    })
    .catch((error) => {
      console.error("Error deleting note:", error);
    });
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
    document.querySelectorAll(".auth-nav .auth-toggle-btn").forEach((btn) => {
      btn.classList.remove("selected", "clicked");
    });
    loginSection.style.display = "none";
    createSection.style.display = "block";
  });
  showSignin.addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelectorAll(".auth-nav .auth-toggle-btn").forEach((btn) => {
      btn.classList.remove("selected", "clicked");
    });
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
    button.addEventListener("click", () => {
      document.querySelectorAll(".auth-nav .auth-toggle-btn").forEach((btn) => {
        btn.classList.remove("selected", "clicked");
      });
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
//toggle button effect
document.querySelectorAll(".auth-nav .auth-toggle-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".auth-nav .auth-toggle-btn").forEach((btn) => {
      btn.classList.remove("selected", "clicked");
    });
    button.classList.add("selected");
    button.classList.add("clicked");
  });
});
(function () {
  let selectedNote = null,
    offsetX = 0,
    offsetY = 0,
    isResizing = false;

  document.addEventListener("DOMContentLoaded", function () {
    const board = document.getElementById("board");
    if (board) {
      board.addEventListener("mousedown", function (e) {
        if (
          e.target.matches(".sticky-note") ||
          e.target.closest(".sticky-note")
        ) {
          initiateDrag(e);
        }
      });
    }
  });

  function initiateDrag(e) {
    const target = e.target.closest(".sticky-note");
    if (!target) return;

    selectedNote = target;
    selectedNote.style.position = "absolute";
    selectedNote.style.cursor = "grabbing";

    const rect = selectedNote.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(selectedNote);
    const borderTop = parseInt(computedStyle.borderTopWidth, 10);
    const borderLeft = parseInt(computedStyle.borderLeftWidth, 10);

    const resizeMargin = 10;
    const nearRightEdge = e.clientX >= rect.right - resizeMargin;
    const nearBottomEdge = e.clientY >= rect.bottom - resizeMargin;

    if (nearRightEdge || nearBottomEdge) {
      isResizing = true;
      selectedNote.style.cursor =
        nearRightEdge && nearBottomEdge
          ? "nwse-resize"
          : nearRightEdge
          ? "ew-resize"
          : "ns-resize";
      document.addEventListener("mousemove", resizeStickyNote);
    } else {
      // Correct the offsets by including the border widths
      offsetX = e.clientX - (rect.left + borderLeft - 32);
      offsetY = e.clientY - (rect.top + borderTop - 130);
      document.addEventListener("mousemove", moveStickyNote);
    }
    document.addEventListener("mouseup", dropStickyNote);
  }

  function resizeStickyNote(e) {
    if (!selectedNote || !isResizing) return;

    const minWidth = 50; // Minimum width of the note
    const minHeight = 50; // Minimum height of the note

    const rect = selectedNote.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    const newHeight = e.clientY - rect.top;

    if (newWidth > minWidth) selectedNote.style.width = `${newWidth}px`;
    if (newHeight > minHeight) selectedNote.style.height = `${newHeight}px`;
  }

  function moveStickyNote(e) {
    if (!selectedNote) return;

    // Update the position of the selected note
    selectedNote.style.left = `${e.clientX - offsetX}px`;
    selectedNote.style.top = `${e.clientY - offsetY}px`;
  }

  function dropStickyNote() {
    if (selectedNote) {
      selectedNote.style.cursor = "grab";
      document.removeEventListener("mousemove", moveStickyNote);
      document.removeEventListener("mousemove", resizeStickyNote);
      document.removeEventListener("mouseup", dropStickyNote);
      saveNotePositionAndSize(selectedNote);
      if (isResizing) {
        saveNotePositionAndSize(selectedNote); // Save changes after resizing
        isResizing = false;
      }

      selectedNote = null;
    }
  }
})();

function saveNotePositionAndSize(note) {
  const id = note.dataset.id;
  if (!id) {
    console.error("Note ID is missing.");
    return;
  }
  const rect = note.getBoundingClientRect();

  fetch(`/notes/update/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
    },
    body: JSON.stringify({
      position_x: rect.left - 32,
      position_y: rect.top - 130,
      width: rect.width,
      height: rect.height,
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to save note.");
      return response.json();
    })
    .then((data) => console.log("Update successful", data))
    .catch((error) => console.error("Error updating note:", error));
}
