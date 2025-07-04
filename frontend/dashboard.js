const apiUrl = 'http://localhost:3000';
const getToken = () => localStorage.getItem('token');

const setAuthHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

async function loadDashboard() {
  const token = getToken();
  if (!token) return logout();

  const user = decodeToken(token);
  document.getElementById('dashboardUserEmail').textContent = user?.email || 'User';

  const res = await fetch(`${apiUrl}/notes`, { headers: setAuthHeader() });

  if (res.status === 401) return logout();

  const notes = await res.json();

  // Stats
  document.getElementById('totalNotes').textContent = notes.length;
  const pinned = notes.filter(n => n.isPinned);
  document.getElementById('pinnedNotesCount').textContent = pinned.length;

  const categoryCounts = {};
  notes.forEach(note => {
    const cat = note.category || 'Others';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryList = document.getElementById('categoryCounts');
  categoryList.innerHTML = Object.entries(categoryCounts)
    .map(([cat, count]) => `<li>${cat}: ${count}</li>`)
    .join('');

  // Recent notes
  const recentNotes = notes
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentList = document.getElementById('recentNotesList');
  recentList.innerHTML = recentNotes
    .map(note => `
      <div class="note-preview">
        <strong>${note.title}</strong><br>
        <small>${new Date(note.createdAt).toLocaleString()}</small>
        <p>${note.content.slice(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
      </div>
    `).join('');
}

window.addEventListener('DOMContentLoaded', loadDashboard);
