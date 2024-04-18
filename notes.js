// Function to create a new sticky note
function createStickyNote() {
  const notesContainer = document.getElementById("notes-container");
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

  notesContainer.appendChild(note);
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
  const addButton = document.getElementById("add-button");
  addButton.addEventListener("click", createStickyNote);
});