const tableBody = document.querySelector('#requests-body');
const emptyState = document.querySelector('#empty-state');
const requestCount = document.querySelector('#request-count');
const lastUpdate = document.querySelector('#last-update');
const dashboardStatus = document.querySelector('#dashboard-status');
const refreshButton = document.querySelector('#refresh-dashboard');

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character]));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function renderRequests(consultations) {
  requestCount.textContent = consultations.length;
  lastUpdate.textContent = consultations.length ? formatDate(consultations[0].created_at) : 'Waiting for requests';
  emptyState.hidden = consultations.length > 0;
  tableBody.innerHTML = consultations.map((request) => `
    <tr>
      <td>${escapeHtml(formatDate(request.created_at))}</td>
      <td><strong>${escapeHtml(request.name)}</strong></td>
      <td>${escapeHtml(request.phone)}</td>
      <td>${escapeHtml(request.email || 'Not provided')}</td>
      <td>${escapeHtml(request.matter)}</td>
      <td>${escapeHtml(request.message || 'No additional message provided.')}</td>
    </tr>`).join('');
}

async function loadRequests(showStatus = true) {
  if (showStatus) dashboardStatus.textContent = 'Refreshing requests…';
  try {
    const response = await fetch('/api/consultations', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load requests.');
    const data = await response.json();
    renderRequests(data.consultations || []);
    dashboardStatus.textContent = `Updated ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  } catch (error) {
    dashboardStatus.textContent = 'Dashboard unavailable. Start the Python server and refresh.';
  }
}

refreshButton?.addEventListener('click', () => loadRequests(true));
loadRequests(true);
window.setInterval(() => loadRequests(false), 5000);
