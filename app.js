const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxal0uC2-alFA5qNiESe14cALi0ShmxfgTiHA6LDaPgYq5OCp8X3HnZIDZUBkQJSmpx/exec';

const $ = id => document.getElementById(id);
const fmt = v => (typeof v === 'number' ? v.toFixed(2) : (v == null || v === '' ? '—' : String(v)));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderPart(el, title, part, gradeLabel) {
  const groups = part.groups.map(g => `
    <div class="group">
      <div class="group-head"><span>${esc(g.name)} <small>(${esc(g.weight)})</small></span><em>${fmt(g.weighted)}</em></div>
      <table>
        <thead><tr><th>Item</th><th>Raw score</th><th>Transmuted</th></tr></thead>
        <tbody>${g.items.map(i => `<tr><td>${esc(i.label)}</td><td>${fmt(i.raw)}</td><td>${fmt(i.grade)}</td></tr>`).join('')}</tbody>
      </table>
    </div>`).join('');
  el.innerHTML = `<h3>${title}</h3>${groups}
    <div class="total"><span>${gradeLabel}</span><strong>${fmt(part.grade)}</strong></div>
    <p class="note">Each component's weighted value is shown beside its name; they add up to the ${gradeLabel}.</p>`;
}

function render(d) {
  $('r-section').textContent = d.student.section;
  $('r-name').textContent = d.student.name;
  $('r-meta').textContent = d.student.moniker;
  $('r-mg').textContent = fmt(d.midterm);
  renderPart($('written'), 'Written', d.written, 'Written Grade (WG)');
  renderPart($('lab'), 'Laboratory', d.lab, 'Lab Grade (LG)');
  $('login-card').hidden = true;
  $('result').hidden = false;
}

$('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = $('submit-btn'), err = $('error');
  err.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Checking…';
  try {
    const qs = new URLSearchParams({ class: $('class').value, moniker: $('moniker').value, id: $('student-id').value });
    const res = await fetch(`${APPS_SCRIPT_URL}?${qs}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);
    render(data);
  } catch (ex) {
    err.textContent = ex.message && ex.message !== 'Failed to fetch' ? ex.message : 'Could not reach the server. Please try again.';
    err.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Show my grade';
  }
});

$('logout-btn').addEventListener('click', () => {
  ['written', 'lab'].forEach(id => { $(id).innerHTML = ''; });
  ['r-section', 'r-name', 'r-meta', 'r-mg'].forEach(id => { $(id).textContent = ''; });
  $('result').hidden = true;
  $('login-form').reset();
  $('login-card').hidden = false;
  $('moniker').focus();
});
