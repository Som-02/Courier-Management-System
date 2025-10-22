// admin.js
const listEl = document.getElementById('list');
const tpl = document.getElementById('rowTpl');
const search = document.getElementById('search');
const statusFilter = document.getElementById('statusFilter');
const refreshBtn = document.getElementById('refresh');

// Fetch courier data
async function fetchCouriers() {
  const q = encodeURIComponent(search.value || '');
  const status = encodeURIComponent(statusFilter.value || '');
  const res = await fetch(`/api/couriers?q=${q}&status=${status}`);
  return await res.json();
}

// Render courier rows in admin panel
function renderList(data) {
  listEl.innerHTML = '';

  if (!data.length) {
    listEl.innerHTML = `<p class="small">No courier requests found.</p>`;
    return;
  }

  data.forEach(item => {
    const node = tpl.content.cloneNode(true);

    // Fill in courier details
    node.querySelector('.tracking').textContent = item.TrackingNumber;
    node.querySelector('.sender').textContent = item.SenderName || 'N/A';
    node.querySelector('.receiver').textContent = item.ReceiverName || 'N/A';
    node.querySelector('.weight').textContent = item.Weight || '-';
    node.querySelector('.remarks').textContent = item.Remarks || '-';

    // Input fields
    const dispatchDateInput = node.querySelector('.dispatchDate');
    const statusSelect = node.querySelector('.statusSelect');

    if (dispatchDateInput) dispatchDateInput.value = item.DispatchDate || '';
    if (statusSelect) statusSelect.value = item.Status || 'Pending';

    // Status text display
    const statusText = node.querySelector('.status');
    if (statusText) statusText.textContent = item.Status || 'Pending';

    // Save button click
    const saveBtn = node.querySelector('.saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const dispatchDate = dispatchDateInput?.value || null;
        const newStatus = statusSelect?.value || item.Status;

        try {
          const res = await fetch(`/api/couriers/${item.CourierID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dispatchDate, status: newStatus })
          });

          if (res.ok) {
            alert('✅ Updated successfully!');
            load();
          } else {
            const err = await res.json();
            alert('❌ Update failed: ' + (err.error || 'Unknown error'));
          }
        } catch (err) {
          console.error(err);
          alert('⚠️ Network error');
        }
      });
    }

    listEl.appendChild(node);
  });
}

// Load couriers
async function load() {
  const data = await fetchCouriers();
  renderList(data);
}

// Debounce helper
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Event listeners
search.addEventListener('input', debounce(load, 300));
statusFilter.addEventListener('change', load);
refreshBtn.addEventListener('click', load);

// Initial load
load();
