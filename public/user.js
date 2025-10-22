// user.js
const form = document.getElementById('userForm');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);

  const payload = {
    sender: {
      FullName: fd.get('senderFullName'),
      PhoneNumber: fd.get('senderPhone'),
      Address: fd.get('senderAddress')
    },
    receiver: {
      FullName: fd.get('receiverFullName'),
      PhoneNumber: fd.get('receiverPhone'),
      Address: fd.get('receiverAddress')
    },
    weight: fd.get('weight'),
    remarks: fd.get('remarks')
  };

  const res = await fetch('/api/couriers', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (res.ok) {
    result.innerHTML = `
      ✅ Courier request submitted successfully!<br>
      <b>Tracking ID:</b> ${data.TrackingNumber}
    `;
    form.reset();
  } else {
    result.textContent = '❌ Error: ' + (data.error || 'Something went wrong');
  }
});
