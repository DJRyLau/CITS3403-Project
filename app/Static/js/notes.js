let userPreferences = {};

// Fetch user preferences
function fetchUserPreferences() {
  fetch('/get_preferences')
    .then(response => response.json())
    .then(data => {
      userPreferences = data;
    })
    .catch(error => console.error('Error fetching user preferences:', error));
}

// Call this function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  fetchUserPreferences();
});

// Function to create a new sticky note
function createStickyNote() {
  const board = document.getElementById("board");
  if (!board) return;

  const note = document.createElement("div");
  note.classList.add("sticky-note");
  note.style.backgroundColor = userPreferences.noteColour || "#ffffff"; // Use user's default note color

  const noteHeader = document.createElement("div");
  noteHeader.classList.add("sticky-note-header");

  const headerBackground = document.createElement("div");
  headerBackground.classList.add("sticky-note-header-background");

  const profileImage = document.createElement("img");
  profileImage.src = userPreferences.profilePicture || "default-avatar.jpg"; // Use the user's profile picture
  profileImage.alt = "Profile Photo";
  profileImage.classList.add("sticky-note-profile-picture");

  const nameSpan = document.createElement("span");
  nameSpan.classList.add("sticky-note-user-name");
  nameSpan.innerHTML = `<b>${userPreferences.username || "User"}</b>`; // Use the user's name

  const colorPickerForm = document.createElement("form");
  colorPickerForm.classList.add("color-picker-form");
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.value = userPreferences.noteColour || "#ffffff";
  colorPicker.classList.add("note-color-picker");

  colorPicker.addEventListener("input", () => (note.style.backgroundColor = colorPicker.value));
  colorPickerForm.appendChild(colorPicker);

  headerBackground.appendChild(profileImage);
  headerBackground.appendChild(nameSpan);
  headerBackground.appendChild(colorPickerForm);
  noteHeader.appendChild(headerBackground);

  const noteContent = document.createElement("div");
  noteContent.classList.add("sticky-note-content");
  noteContent.setAttribute("contenteditable", "true");
  noteContent.textContent = "Write here...";

  noteContent.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote(noteContent.textContent.trim(), colorPicker.value, note);
      noteContent.setAttribute("contenteditable", "true");
      noteContent.blur();
      colorPicker.remove();
    }
  });

  const noteFooter = document.createElement("div");
  noteFooter.classList.add("note-footer");
  noteFooter.textContent = new Date().toLocaleString(); // Set current date and time

  note.appendChild(noteHeader);
  note.appendChild(noteContent);
  note.appendChild(noteFooter);

  board.appendChild(note);
}


function saveNote(content, color, noteElement) {
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
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text(); 
    })
    .then((text) => {
      try {
        const data = JSON.parse(text); 
        console.log("Note saved", data);
        noteElement.dataset.id = data.id; 
        saveNotePositionAndSize(noteElement)
      } catch (e) {
        console.error("Error parsing JSON:", e);
        console.error("Received text:", text);
      }
    })
    .catch((error) => {
      console.error("Error in fetch operation:", error);
    });
}

function createFooterWithTimestamp(timestamp) {
  const footer = document.createElement("div");
  footer.classList.add("note-footer");
  footer.textContent = new Date(timestamp).toLocaleString();
  return footer;
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

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".note-color-picker").forEach((picker) => {
    picker.addEventListener("input", function () {
      const noteElement = this.closest(".sticky-note");
      if (!noteElement) return;

      const noteId = noteElement.dataset.id;
      const newColor = this.value;
      noteElement.style.backgroundColor = newColor;
      updateNoteColor(noteId, newColor);
    });
  });

  document
    .querySelectorAll(".sticky-note-content")
    .forEach((contentElement) => {
      contentElement.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault(); 
          const noteElement = this.closest(".sticky-note");
          const noteId = noteElement.dataset.id;
          const updatedContent = this.textContent;
          const updatedColor = noteElement.style.backgroundColor;

          updateNoteDetails(noteId, {
            content: updatedContent,
            color: updatedColor,
          });
          this.blur(); 
        }
      });
    });
});

function updateNoteDetails(noteId, details) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  fetch(`/notes/update/${noteId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(details),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to update note");
      return response.json();
    })
    .then((data) => {
      console.log("Note updated successfully", data);
      const noteElement = document.querySelector(
        `.sticky-note[data-id="${noteId}"]`
      );
      if (noteElement) {
        noteElement.querySelector(".sticky-note-content").textContent =
          details.content;
        noteElement.style.backgroundColor = details.color;
      }
    })
    .catch((error) => {
      console.error("Error updating note:", error);
    });
}

function updateNoteColor(noteId, newColor) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  fetch(`/notes/update/color/${noteId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ color: newColor }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to update color");
      return response.json();
    })
    .then((data) => {
      console.log("Color updated", data);
    })
    .catch((error) => {
      console.error("Error updating color:", error);
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
function createNoteElement(note) {
  const noteElement = document.createElement("div");
  noteElement.classList.add("sticky-note");
  noteElement.style.backgroundColor = note.color;
  noteElement.style.left = `${note.position_x}px`;
  noteElement.style.top = `${note.position_y}px`;
  noteElement.style.width = `${note.width}px`;
  noteElement.style.height = `${note.height}px`;
  noteElement.dataset.id = note.id;

  const noteHeader = document.createElement("div");
  noteHeader.classList.add("sticky-note-header");

  const profileImage = document.createElement("img");
  profileImage.src = "user-photo.jpg"; // Updates automatically
  profileImage.alt = "Profile Photo";
  noteHeader.appendChild(profileImage);

  const nameSpan = document.createElement("span");
  nameSpan.textContent = "Name"; // Updates automatically
  noteHeader.appendChild(nameSpan);

  const deleteForm = document.createElement("form");
  deleteForm.classList.add("delete-note-form");
  deleteForm.action = `/notes/delete/${note.id}`;
  deleteForm.method = "POST";

  const csrfInput = document.createElement("input");
  csrfInput.type = "hidden";
  csrfInput.name = "csrf_token";
  csrfInput.value = document.querySelector('meta[name="csrf-token"]').content;
  deleteForm.appendChild(csrfInput);

  const deleteButton = document.createElement("button");
  deleteButton.type = "submit";
  deleteButton.classList.add("delete-note-button");
  deleteButton.textContent = "X";
  deleteForm.appendChild(deleteButton);

  noteHeader.appendChild(deleteForm);
  noteElement.appendChild(noteHeader);

  const noteContent = document.createElement("div");
  noteContent.classList.add("sticky-note-content");
  noteContent.textContent = note.content;
  noteElement.appendChild(noteContent);

  const noteFooter = document.createElement("div");
  noteFooter.classList.add("note-footer");
  noteFooter.textContent = new Date(note.created_at).toLocaleString();
  noteElement.appendChild(noteFooter);

  return noteElement;
}

document.addEventListener("DOMContentLoaded", function () {
  const noteFooters = document.querySelectorAll('.note-footer');
  noteFooters.forEach(footer => {
    const createdAt = footer.getAttribute('data-created-at');
    if (createdAt) {
      const date = new Date(createdAt);
      footer.textContent = date.toLocaleString();
    }
  });
});

function fetchNotesForBoard(boardId) {
  console.log("Fetching notes for board ID:", boardId); // Debug 

  fetch(`/notes/get_by_board/${boardId}`)
    .then((response) => response.json())
    .then((notes) => {
      const boardElement = document.getElementById("board");
      boardElement.innerHTML = ""; // Clear existing notes
      console.log("Fetched notes:", notes); // Debug 
      notes.forEach((note) => {
        const noteElement = createNoteElement(note);
        boardElement.appendChild(noteElement);
      });
    })
    .catch((error) => console.error("Error loading notes:", error));
}


function switchBoard(boardId) {
  console.log("Attempting to switch to board:", boardId); // Debug 

  fetch(`/boards/switch/${boardId}`, {
    method: "POST",
    headers: {
      "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Switched to board:", boardId); // Debug 
        fetchNotesForBoard(boardId);
        window.location.reload();

      } else {
        console.error("Failed to switch board:", data.message);
      }
    })
    .catch((error) => console.error("Error switching board:", error));
}


document
  .getElementById("create-board-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const title = document.getElementById("new-board-title").value;
    if (!title) {
      alert("Please provide a title for the board.");
      return;
    }
    fetch("/create_board", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
          .content,
      },
      body: `title=${encodeURIComponent(title)}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          updateBoardList(); 
          alert("Board created successfully!");
          switchBoard(data.board_id);
        } else {
          alert(`Failed to create board: ${data.message}`);
        }
      })
      .catch((error) => console.error("Error creating board:", error));
  });

function updateBoardList() {
  fetch("/boards/list")
    .then((response) => response.json())
    .then((data) => {
      const boardsContainer = document.getElementById("boards-container");
      boardsContainer.innerHTML = ""; 
      data.forEach((board) => {
        const boardLink = document.createElement("a");
        boardLink.className = "navbar-board";
        boardLink.textContent = board.title;
        boardLink.href = "#";
        boardLink.onclick = () => switchBoard(board.id);
        boardsContainer.appendChild(boardLink);
      });
    })
    .catch((error) => console.error("Error fetching boards:", error));
}


document
  .getElementById("grant-access-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const userEmail = document.getElementById("user-to-grant").value;
    const boardId = document.body.getAttribute("board-id");

    console.log("Grant Access - Board ID:", boardId); // Debug 
    console.log("Grant Access - Email:", userEmail); // Debug 

    fetch("/boards/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
          .content,
      },
      body: `email=${encodeURIComponent(
        userEmail
      )}&board_id=${encodeURIComponent(boardId)}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Access granted successfully!");
        } else {
          alert(`Failed to grant access: ${data.message}`);
        }
      })
      .catch((error) => console.error("Error granting access:", error));
  });


function grantAccess(username) {
  const boardId = document.body.getAttribute("board-id");
  const url = `/boards/share`; 

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
    },
    body: `email=${encodeURIComponent(userEmail)}&boardId=${boardId}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Access granted to user:", username);
      } else {
        console.error("Failed to grant access:", data.message);
      }
    })
    .catch((error) => console.error("Error granting access:", error));
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".sticky-note").forEach((note) => {
    const noteId = note.dataset.id;
    fetch(`/notes/${noteId}/replies`)
      .then((response) => response.json())
      .then((replies) => {
        replies.forEach((reply) => displayReply(reply, noteId));
      })
      .catch((error) => console.error("Error loading replies:", error));
  });
});

function addReply(button, noteId) {
  const replyInput = button.previousElementSibling;
  const replyText = replyInput.value.trim();
  if (replyText === "") return;

  const data = { content: replyText };
  fetch(`/notes/${noteId}/add_reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((reply) => {
      displayReply(reply, noteId);
      replyInput.value = "";
    })
    .catch((error) => console.error("Error adding reply:", error));
}

function displayReply(reply, noteId) {
  const noteElement = document.querySelector(`#note${noteId}`);
  const repliesContainer = noteElement.querySelector(".replies-container");
  const replyDiv = document.createElement("div");
  replyDiv.className = "reply";
  replyDiv.innerHTML = `<strong>${reply.username}</strong>: ${reply.content}
                          <div class="reply-timestamp">${reply.timestamp}</div>`;
  repliesContainer.appendChild(replyDiv);
}
