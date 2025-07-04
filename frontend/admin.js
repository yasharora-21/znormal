const apiUrl = 'http://localhost:3000';
const token = localStorage.getItem('token');

const setAuthHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

const showMessage = (msg, type = 'success') => {
  const box = document.getElementById('messageBox');
  box.textContent = msg;
  box.className = `message-box ${type}`;
  box.style.display = 'block';
  setTimeout(() => box.style.display = 'none', 3000);
};

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}

async function fetchAdminData() {
  const resUsers = await fetch(`${apiUrl}/admin/users`, { headers: setAuthHeader() });
  const resNotes = await fetch(`${apiUrl}/admin/notes`, { headers: setAuthHeader() });

  if (resUsers.status === 401 || resNotes.status === 401) return logout();

  const users = await resUsers.json();
  const notes = await resNotes.json();

  renderUsers(users);
  renderNotes(notes);
}

function renderUsers(users) {
  const usersList = document.getElementById('usersList');
  usersList.innerHTML = users.map(u => `
    <div class="note-card">
      <p><strong>Email:</strong> ${u.email}</p>
      <p><strong>User ID:</strong> ${u.id}</p>
      <button onclick="deleteUser('${u.id}')">Delete</button>
    </div>
  `).join('');
}

function renderNotes(notes) {
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = notes.map(n => `
    <div class="note-card">
      <h3>${n.title}</h3>
      <p>${n.content}</p>
      <small>User ID: ${n.userId}</small><br />
      <small>Category: ${n.category}</small><br />
      <small>Created: ${new Date(n.createdAt).toLocaleString()}</small><br />
      <button onclick="deleteNote('${n.id}')">Delete</button>
    </div>
  `).join('');
}

async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;
  const res = await fetch(`${apiUrl}/admin/user/${id}`, {
    method: 'DELETE',
    headers: setAuthHeader()
  });
  const data = await res.json();
  showMessage(data.message || "User deleted");
  fetchAdminData();
}

async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  const res = await fetch(`${apiUrl}/admin/note/${id}`, {
    method: 'DELETE',
    headers: setAuthHeader()
  });
  const data = await res.json();
  showMessage(data.message || "Note deleted");
  fetchAdminData();
}

window.addEventListener('DOMContentLoaded', () => {
  if (!token) return logout();
  document.getElementById('adminControls').style.display = 'block';
  fetchAdminData();
});
