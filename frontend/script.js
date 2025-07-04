const apiUrl = 'http://localhost:3000';

// 🔐 Auth Elements
const authSection = document.getElementById('authSection');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authForm = document.getElementById('authForm');
const switchModeBtn = document.getElementById('switchMode');
const authMessage = document.getElementById('authMessage');

const userInfo = document.getElementById('userInfo');
const userEmailSpan = document.getElementById('userEmail');

const noteForm = document.getElementById('noteForm');
const pinnedContainer = document.getElementById('pinnedNotes');
const otherContainer = document.getElementById('otherNotes');
const searchInput = document.getElementById('search');
const filterCategory = document.getElementById('filterCategory');
const notesSection = document.getElementById('notesSection');

let notes = [];
let authMode = 'login';

const getToken = () => localStorage.getItem('token');

const setAuthHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

// 🔍 Decode JWT payload
function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// 🎭 Switch UI based on auth
function updateUI() {
  const token = getToken();
  if (token) {
    const user = decodeToken(token);
    userEmailSpan.textContent = `Logged in as: ${user?.email || 'User'}`;
    authSection.style.display = 'none';
    userInfo.style.display = 'flex';
    notesSection.style.display = 'block'; // 👈 SHOW Notes Section
    noteForm.style.display = 'block';
    fetchNotes();
  } else {
    authSection.style.display = 'block';
    userInfo.style.display = 'none';
    notesSection.style.display = 'none'; // 👈 HIDE Notes Section
    noteForm.style.display = 'none';
    pinnedContainer.innerHTML = '';
    otherContainer.innerHTML = '';
  }
}

// 🧠 Show message box
function showMessage(message, type = 'success') {
  const box = document.getElementById('messageBox');
  box.textContent = message;
  box.className = `message-box ${type}`;
  box.style.display = 'block';
  setTimeout(() => {
    box.style.display = 'none';
  }, 3000);
}

// 📥 Register
async function register() {
  const res = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: authEmail.value,
      password: authPassword.value
    })
  });

  const data = await res.json();
  if (res.ok) {
    showMessage('Registered! Now login.');
    switchToLogin();
  } else {
    showMessage(data.message || 'Registration failed', 'error');
  }
}

// 🔐 Login
async function login() {
  const res = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: authEmail.value,
      password: authPassword.value
    })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    updateUI();
  } else {
    showMessage(data.message || 'Login failed', 'error');
  }
}

// 🚪 Logout
function logout() {
  localStorage.removeItem('token');
  updateUI();
}

// 📝 Fetch notes securely
const fetchNotes = async () => {
  const res = await fetch(`${apiUrl}/notes`, {
    headers: setAuthHeader()
  });

  if (res.status === 401) return logout();

  notes = await res.json();
  renderNotes();
};

// 🧾 Add new note
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const category = document.getElementById('category').value;

  await fetch(`${apiUrl}/notes`, {
    method: 'POST',
    headers: setAuthHeader(),
    body: JSON.stringify({ title, content, category }),
  });

  noteForm.reset();
  fetchNotes();
});

// 🔄 Pin, Delete, Edit
const deleteNote = async (id) => {
  await fetch(`${apiUrl}/note/${id}`, {
    method: 'DELETE',
    headers: setAuthHeader()
  });
  fetchNotes();
};

const togglePin = async (id) => {
  await fetch(`${apiUrl}/note/${id}/pin`, {
    method: 'PUT',
    headers: setAuthHeader()
  });
  fetchNotes();
};

window.saveEdit = async (id) => {
  const title = document.getElementById(`edit-title-${id}`).value;
  const content = document.getElementById(`edit-content-${id}`).value;
  const category = document.getElementById(`edit-category-${id}`).value;

  await fetch(`${apiUrl}/note/${id}`, {
    method: 'PUT',
    headers: setAuthHeader(),
    body: JSON.stringify({ title, content, category }),
  });

  fetchNotes();
};

const renderNotes = () => {
  const searchTerm = searchInput.value.toLowerCase();
  const category = filterCategory.value;

  const filtered = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm) || note.content.toLowerCase().includes(searchTerm);
    const matchesCategory = category === 'All' || note.category === category;
    return matchesSearch && matchesCategory;
  });

  const pinned = filtered.filter(n => n.isPinned);
  const others = filtered.filter(n => !n.isPinned);

  pinnedContainer.innerHTML = pinned.map(n => renderNote(n)).join('');
  otherContainer.innerHTML = others.map(n => renderNote(n)).join('');
};

const renderNote = (note) => {
  return `
    <div class="note-card ${note.isPinned ? 'pinned' : ''}">
      ${note.isEditing
        ? `
          <input type="text" id="edit-title-${note.id}" value="${note.title}" />
          <textarea id="edit-content-${note.id}">${note.content}</textarea>
          <select id="edit-category-${note.id}">
            ${['Work','Personal','Shopping','Health','Important','Urgent','Others'].map(opt =>
              `<option value="${opt}" ${note.category === opt ? 'selected' : ''}>${opt}</option>`
            ).join('')}
          </select>
        `
        : `
          <h3>${note.title}</h3>
          <p>${note.content}</p>
        `
      }

      <small>Created: ${new Date(note.createdAt).toLocaleString()}</small><br>
      <small>Category: ${note.category || 'Others'}</small>

      <div class="button-group">
        ${note.isEditing
          ? `<button onclick="saveEdit('${note.id}')">Save</button>
             <button onclick="cancelEdit('${note.id}')">Cancel</button>`
          : `<button onclick="deleteNote('${note.id}')">Delete</button>
             <button onclick="startEdit('${note.id}')">Edit</button>
             <button onclick="togglePin('${note.id}')">${note.isPinned ? 'Unpin' : 'Pin'}</button>`
        }
      </div>
    </div>
  `;
};

window.startEdit = (id) => {
  notes = notes.map(n => n.id === id ? { ...n, isEditing: true } : { ...n, isEditing: false });
  renderNotes();
};

window.cancelEdit = (id) => {
  notes = notes.map(n => n.id === id ? { ...n, isEditing: false } : n);
  renderNotes();
};

searchInput.addEventListener('input', renderNotes);
filterCategory.addEventListener('change', renderNotes);

authForm.addEventListener('submit', e => {
  e.preventDefault();
  if (authMode === 'login') login();
  else register();
});

switchModeBtn.addEventListener('click', () => {
  authMode = authMode === 'login' ? 'register' : 'login';
  switchModeBtn.textContent = authMode === 'login' ? 'Switch to Register' : 'Switch to Login';
});

// 🚀 Init
window.addEventListener('DOMContentLoaded', updateUI);

const toggleBtn = document.getElementById('toggleTheme');

// 🌗 Initialize theme from localStorage
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  document.body.classList.add('dark');
  toggleBtn.textContent = '🌙';
} else {
  toggleBtn.textContent = '☀️';
}

// 🌙 Toggle theme and icon
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  toggleBtn.textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
