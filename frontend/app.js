/* FarmMarket front end. Plain JavaScript talking to the Express/MongoDB API.
   Every collection gets: list + search, create, edit, delete (full CRUD). */

const API = '/api';
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ugx = (n) => (n == null ? '' : 'UGX ' + Number(n).toLocaleString('en-UG'));
const dateStr = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const tag = (v, kind = 'status') => (v ? `<span class="tag ${kind}-${esc(String(v)).replace(/\s/g, '.')}">${esc(v)}</span>` : '');
const tags = (arr) => (arr || []).map((v) => `<span class="tag">${esc(v)}</span>`).join('');

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function toast(msg, isError = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.add('hidden'), 3000);
}

/* ---------- Collection definitions ---------------------------------------- */

const collections = {
  farmers: {
    title: 'Farmers',
    blurb: 'Registered smallholder farmers. Only some have a cooperative, certifications or irrigation (flexible schema).',
    path: '/farmers',
    columns: ['ID', 'Name', 'Phone', 'District / subcounty / village', 'Crops grown', 'Acres', 'Cooperative', 'Mobile money', 'Joined'],
    row: (f) => [
      `<span class="mono">${esc(f._id)}</span>`,
      `<strong>${esc(f.name)}</strong>${f.certifications?.length ? '<br>' + tags(f.certifications) : ''}${f.has_irrigation ? '<br><span class="tag">irrigation</span>' : ''}`,
      esc(f.phone),
      esc([f.location?.district, f.location?.subcounty, f.location?.village].filter(Boolean).join(' / ')),
      tags(f.crops_grown),
      esc(f.farm_size_acres),
      esc(f.cooperative || '—'),
      esc(f.mobile_money ? `${f.mobile_money.provider || ''} ${f.mobile_money.number || ''}` : ''),
      dateStr(f.joined_on),
    ],
    fields: (f = {}) => [
      { name: 'name', label: 'Full name', value: f.name, required: true },
      { name: 'phone', label: 'Phone', value: f.phone, required: true },
      { name: 'location.district', label: 'District', value: f.location?.district, required: true },
      { name: 'location.subcounty', label: 'Subcounty', value: f.location?.subcounty },
      { name: 'location.village', label: 'Village', value: f.location?.village },
      { name: 'crops_grown', label: 'Crops grown (comma separated)', value: (f.crops_grown || []).join(', '), type: 'list' },
      { name: 'farm_size_acres', label: 'Farm size (acres)', value: f.farm_size_acres, type: 'number', step: '0.1' },
      { name: 'cooperative', label: 'Cooperative (optional)', value: f.cooperative },
      { name: 'certifications', label: 'Certifications (optional, comma separated)', value: (f.certifications || []).join(', '), type: 'list' },
      { name: 'has_irrigation', label: 'Has irrigation', value: f.has_irrigation, type: 'checkbox' },
      { name: 'mobile_money.provider', label: 'Mobile money provider', value: f.mobile_money?.provider, type: 'select', options: ['', 'MTN', 'Airtel'] },
      { name: 'mobile_money.number', label: 'Mobile money number', value: f.mobile_money?.number },
      { name: 'joined_on', label: 'Joined on', value: dateStr(f.joined_on), type: 'date' },
    ],
  },

  listings: {
    title: 'Produce listings',
    blurb: 'One lot of produce a farmer offers for sale. The attributes sub-document differs per crop.',
    path: '/listings',
    filters: [{ name: 'status', options: ['', 'available', 'reserved', 'sold out', 'withdrawn'] }],
    columns: ['ID', 'Farmer', 'Crop', 'Variety', 'Available (kg)', 'Price / kg', 'Harvest', 'Status', 'Attributes'],
    row: (l) => [
      `<span class="mono">${esc(l._id)}</span>`,
      `<span class="mono">${esc(l.farmer_id)}</span>`,
      `<strong>${esc(l.crop)}</strong>`,
      esc(l.variety),
      `<span class="num">${Number(l.quantity_kg_available).toLocaleString()}</span>`,
      ugx(l.price_per_kg_ugx),
      dateStr(l.harvest_date),
      tag(l.status),
      Object.entries(l.attributes || {}).map(([k, v]) => `<span class="tag">${esc(k)}: ${esc(v)}</span>`).join(''),
    ],
    fields: (l = {}, ctx) => [
      { name: 'farmer_id', label: 'Farmer', value: l.farmer_id, type: 'select', required: true, options: ctx.farmers.map((f) => [f._id, `${f._id} · ${f.name}`]) },
      { name: 'crop', label: 'Crop', value: l.crop, required: true },
      { name: 'variety', label: 'Variety', value: l.variety },
      { name: 'quantity_kg_available', label: 'Quantity available (kg)', value: l.quantity_kg_available, type: 'number', required: true },
      { name: 'price_per_kg_ugx', label: 'Price per kg (UGX)', value: l.price_per_kg_ugx, type: 'number', required: true },
      { name: 'harvest_date', label: 'Harvest date', value: dateStr(l.harvest_date), type: 'date' },
      { name: 'status', label: 'Status', value: l.status || 'available', type: 'select', options: ['available', 'reserved', 'sold out', 'withdrawn'] },
      { name: 'attributes', label: 'Crop attributes (JSON, differs per crop)', value: JSON.stringify(l.attributes || {}, null, 2), type: 'json', full: true, hint: 'e.g. {"grade": "A", "moisture_percent": 13} for maize, {"bunch_count": 60} for matooke' },
    ],
  },

  buyers: {
    title: 'Buyers',
    blurb: 'Schools, restaurants, market vendors, exporters and processors that buy produce.',
    path: '/buyers',
    filters: [{ name: 'type', options: ['', 'school', 'restaurant', 'market vendor', 'exporter', 'processor', 'hotel', 'hospital', 'other'] }],
    columns: ['ID', 'Name', 'Type', 'Contact', 'Location', 'Needs', 'Monthly kg', 'Terms / grade', 'Registered'],
    row: (b) => [
      `<span class="mono">${esc(b._id)}</span>`,
      `<strong>${esc(b.name)}</strong>`,
      tag(b.type, 'type'),
      esc(`${b.contact?.person || ''} ${b.contact?.phone || ''}`),
      esc([b.location?.district, b.location?.area].filter(Boolean).join(' / ')),
      tags(b.needs),
      b.monthly_volume_kg ? Number(b.monthly_volume_kg).toLocaleString() : '—',
      esc([b.payment_terms, b.required_grade && `grade ${b.required_grade}`].filter(Boolean).join(' · ') || '—'),
      dateStr(b.registered_on),
    ],
    fields: (b = {}) => [
      { name: 'name', label: 'Organisation name', value: b.name, required: true },
      { name: 'type', label: 'Type', value: b.type || 'school', type: 'select', required: true, options: ['school', 'restaurant', 'market vendor', 'exporter', 'processor', 'hotel', 'hospital', 'other'] },
      { name: 'contact.person', label: 'Contact person', value: b.contact?.person },
      { name: 'contact.phone', label: 'Contact phone', value: b.contact?.phone },
      { name: 'location.district', label: 'District', value: b.location?.district },
      { name: 'location.area', label: 'Area', value: b.location?.area },
      { name: 'needs', label: 'Crops needed (comma separated)', value: (b.needs || []).join(', '), type: 'list' },
      { name: 'monthly_volume_kg', label: 'Monthly volume (kg, optional)', value: b.monthly_volume_kg, type: 'number' },
      { name: 'payment_terms', label: 'Payment terms (optional)', value: b.payment_terms },
      { name: 'required_grade', label: 'Required grade (optional)', value: b.required_grade },
      { name: 'registered_on', label: 'Registered on', value: dateStr(b.registered_on), type: 'date' },
    ],
  },

  orders: {
    title: 'Orders',
    blurb: 'One purchase by a buyer. Items, payment and delivery are embedded in the order document.',
    path: '/orders',
    filters: [{ name: 'status', options: ['', 'pending', 'confirmed', 'delivered', 'cancelled'] }],
    columns: ['ID', 'Buyer', 'Ordered', 'Status', 'Items', 'Total', 'Payment', 'Delivery / cancellation'],
    row: (o, ctx) => [
      `<span class="mono">${esc(o._id)}</span>`,
      `<strong>${esc(ctx.buyerName(o.buyer_id))}</strong><br><span class="mono">${esc(o.buyer_id)}</span>`,
      dateStr(o.ordered_at),
      tag(o.status),
      (o.items || []).map((it) => `${esc(it.crop)} ${Number(it.quantity_kg).toLocaleString()} kg × ${Number(it.unit_price_ugx).toLocaleString()} = <b>${Number(it.line_total_ugx).toLocaleString()}</b> <span class="mono">(${esc(it.listing_id)})</span>`).join('<br>'),
      `<strong>${ugx(o.total_ugx)}</strong>`,
      `${esc(o.payment?.method || '')}<br>${tag(o.payment?.status)}${o.payment?.paid_on ? '<br>' + dateStr(o.payment.paid_on) : ''}`,
      o.status === 'cancelled'
        ? `${esc(o.cancellation?.reason || '')}<br><span class="mono">${dateStr(o.cancellation?.cancelled_on)}</span>`
        : `${esc(o.delivery?.address || '')}<br><span class="mono">${o.delivery?.delivered_on ? 'delivered ' + dateStr(o.delivery.delivered_on) : o.delivery?.expected_on ? 'expected ' + dateStr(o.delivery.expected_on) : ''}</span>`,
    ],
    fields: (o = {}, ctx) => [
      { name: 'buyer_id', label: 'Buyer', value: o.buyer_id, type: 'select', required: true, options: ctx.buyers.map((b) => [b._id, `${b._id} · ${b.name}`]) },
      { name: 'ordered_at', label: 'Ordered on', value: dateStr(o.ordered_at) || dateStr(new Date()), type: 'date' },
      { name: 'status', label: 'Status', value: o.status || 'pending', type: 'select', options: ['pending', 'confirmed', 'delivered', 'cancelled'] },
      { name: 'items', label: 'Items', value: o.items || [], type: 'items' },
      { name: 'payment.method', label: 'Payment method', value: o.payment?.method || 'MTN Mobile Money', type: 'select', options: ['MTN Mobile Money', 'Airtel Money', 'Cash', 'Bank transfer'] },
      { name: 'payment.status', label: 'Payment status', value: o.payment?.status || 'unpaid', type: 'select', options: ['unpaid', 'pending', 'paid', 'not charged'] },
      { name: 'payment.paid_on', label: 'Paid on', value: dateStr(o.payment?.paid_on), type: 'date' },
      { name: 'delivery.address', label: 'Delivery address', value: o.delivery?.address },
      { name: 'delivery.expected_on', label: 'Expected delivery', value: dateStr(o.delivery?.expected_on), type: 'date' },
      { name: 'delivery.delivered_on', label: 'Delivered on', value: dateStr(o.delivery?.delivered_on), type: 'date' },
      { name: 'cancellation.reason', label: 'Cancellation reason (if cancelled)', value: o.cancellation?.reason },
      { name: 'cancellation.cancelled_on', label: 'Cancelled on', value: dateStr(o.cancellation?.cancelled_on), type: 'date' },
    ],
  },

  'market-prices': {
    title: 'Market prices',
    blurb: 'Reference prices used to check whether a farmer\'s listing price is fair.',
    path: '/market-prices',
    filters: [{ name: 'trend', options: ['', 'rising', 'stable', 'falling'] }],
    columns: ['ID', 'Crop', 'Market', 'Date', 'Price / kg', 'Trend'],
    row: (m) => [
      `<span class="mono">${esc(m._id)}</span>`,
      `<strong>${esc(m.crop)}</strong>`,
      esc(m.market),
      dateStr(m.date),
      ugx(m.price_per_kg_ugx),
      tag(m.trend, 'trend'),
    ],
    fields: (m = {}) => [
      { name: 'crop', label: 'Crop', value: m.crop, required: true },
      { name: 'market', label: 'Market', value: m.market, required: true },
      { name: 'date', label: 'Date', value: dateStr(m.date) || dateStr(new Date()), type: 'date', required: true },
      { name: 'price_per_kg_ugx', label: 'Price per kg (UGX)', value: m.price_per_kg_ugx, type: 'number', required: true },
      { name: 'trend', label: 'Trend', value: m.trend || 'stable', type: 'select', options: ['rising', 'stable', 'falling'] },
    ],
  },
};

/* ---------- State & navigation -------------------------------------------- */

const state = { view: 'dashboard', q: '', filters: {}, ctx: { farmers: [], buyers: [], listings: [], buyerName: (id) => id } };

async function loadContext() {
  const [farmers, buyers, listings] = await Promise.all([api('/farmers'), api('/buyers'), api('/listings')]);
  const byId = Object.fromEntries(buyers.map((b) => [b._id, b.name]));
  state.ctx = { farmers, buyers, listings, buyerName: (id) => byId[id] || '(deleted buyer)' };
}

$('#nav').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-view]');
  if (!btn) return;
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('active', b === btn));
  state.view = btn.dataset.view;
  state.q = '';
  state.filters = {};
  render();
});

async function render() {
  const main = $('#main');
  try {
    if (state.view === 'dashboard') return renderDashboard(main);
    await loadContext();
    await renderCollection(main, state.view);
  } catch (e) {
    main.innerHTML = `<div class="card empty">Could not load data: ${esc(e.message)}<br><small>Is the server running and MongoDB connected?</small></div>`;
  }
}

/* ---------- Collection list view ------------------------------------------ */

async function renderCollection(main, key) {
  const def = collections[key];
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  Object.entries(state.filters).forEach(([k, v]) => v && params.set(k, v));
  const docs = await api(`${def.path}?${params}`);

  const filterHtml = (def.filters || [])
    .map(
      (f) => `<select data-filter="${f.name}">${f.options
        .map((o) => `<option value="${esc(o)}" ${state.filters[f.name] === o ? 'selected' : ''}>${o ? esc(o) : 'All ' + f.name}</option>`)
        .join('')}</select>`
    )
    .join('');

  main.innerHTML = `
    <div class="view-head">
      <div><h2>${def.title} <span class="mono">(${docs.length})</span></h2><p>${def.blurb}</p></div>
      <div class="toolbar">
        <input id="search" type="search" placeholder="Search ${def.title.toLowerCase()}…" value="${esc(state.q)}" />
        ${filterHtml}
        <button class="btn primary" id="add-btn">+ Add</button>
      </div>
    </div>
    <div class="card table-wrap">
      ${
        docs.length
          ? `<table><thead><tr>${def.columns.map((c) => `<th>${c}</th>`).join('')}<th></th></tr></thead>
             <tbody>${docs
               .map(
                 (d) => `<tr data-id="${esc(d._id)}">${def.row(d, state.ctx).map((c) => `<td>${c}</td>`).join('')}
                   <td class="actions">
                     ${key === 'listings' ? `<button class="btn small" data-act="stock">− stock</button>` : ''}
                     <button class="btn small" data-act="edit">Edit</button>
                     <button class="btn small danger" data-act="delete">Delete</button>
                   </td></tr>`
               )
               .join('')}</tbody></table>`
          : `<div class="empty">No documents match. Add one with the button above.</div>`
      }
    </div>`;

  let timer;
  $('#search').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.q = e.target.value.trim();
      renderCollection(main, key);
    }, 250);
  });
  main.querySelectorAll('select[data-filter]').forEach((s) =>
    s.addEventListener('change', () => {
      state.filters[s.dataset.filter] = s.value;
      renderCollection(main, key);
    })
  );
  $('#add-btn').addEventListener('click', () => openForm(key));

  main.querySelector('tbody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    const doc = docs.find((d) => d._id === id);
    if (btn.dataset.act === 'edit') return openForm(key, doc);
    if (btn.dataset.act === 'stock') {
      const kg = prompt(`Reduce stock of ${doc.crop} (${id}) by how many kg? Available: ${doc.quantity_kg_available}`);
      if (!kg) return;
      try {
        await api(`/reports/listings/${id}/reduce-stock`, { method: 'POST', body: { kg: Number(kg) } });
        toast(`Stock reduced by ${kg} kg`);
        renderCollection(main, key);
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
    if (btn.dataset.act === 'delete') {
      if (!confirm(`Delete ${def.title.slice(0, -1).toLowerCase()} ${id}? This cannot be undone.`)) return;
      try {
        await api(`${def.path}/${id}`, { method: 'DELETE' });
        toast(`${id} deleted`);
        await loadContext();
        renderCollection(main, key);
      } catch (err) {
        toast(err.message, true);
      }
    }
  });
}

/* ---------- Create / edit form -------------------------------------------- */

function fieldHtml(f) {
  const id = 'f_' + f.name.replace(/\./g, '_');
  let input;
  if (f.type === 'select') {
    input = `<select id="${id}" name="${f.name}" ${f.required ? 'required' : ''}>${(f.options || [])
      .map((o) => {
        const [val, label] = Array.isArray(o) ? o : [o, o || '—'];
        return `<option value="${esc(val)}" ${String(f.value ?? '') === String(val) ? 'selected' : ''}>${esc(label)}</option>`;
      })
      .join('')}</select>`;
  } else if (f.type === 'checkbox') {
    input = `<input id="${id}" name="${f.name}" type="checkbox" ${f.value ? 'checked' : ''} />`;
  } else if (f.type === 'json') {
    input = `<textarea id="${id}" name="${f.name}">${esc(f.value)}</textarea>`;
  } else if (f.type === 'items') {
    const opts = state.ctx.listings.map((l) => [l._id, `${l._id} · ${l.crop} (${l.variety || ''}) @ ${l.price_per_kg_ugx}`]);
    const rowHtml = (it = {}) => `<div class="item-row">
        <div class="field"><label>Listing</label><select name="item_listing">${opts.map(([v, l]) => `<option value="${esc(v)}" ${it.listing_id === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
        <div class="field"><label>Quantity (kg)</label><input name="item_qty" type="number" min="1" value="${esc(it.quantity_kg ?? 100)}" required /></div>
        <div class="field"><label>Unit price (UGX)</label><input name="item_price" type="number" min="0" value="${esc(it.unit_price_ugx ?? '')}" placeholder="from listing" /></div>
        <button type="button" class="btn small danger" data-remove-item>✕</button>
      </div>`;
    return `<fieldset><legend>${esc(f.label)} (unit price is saved with the order so later price changes don't alter it)</legend>
      <div class="items-list" id="items-list">${(f.value.length ? f.value : [{}]).map(rowHtml).join('')}</div>
      <template id="item-template">${rowHtml()}</template>
      <button type="button" class="btn small" id="add-item" style="margin-top:8px">+ Add item</button>
    </fieldset>`;
  } else {
    input = `<input id="${id}" name="${f.name}" type="${f.type === 'list' ? 'text' : f.type || 'text'}" value="${esc(f.value ?? '')}" ${f.step ? `step="${f.step}"` : ''} ${f.required ? 'required' : ''} />`;
  }
  return `<div class="field ${f.full ? 'full' : ''}"><label for="${id}">${esc(f.label)}</label>${input}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</div>`;
}

function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  parts.slice(0, -1).forEach((p) => (cur = cur[p] = cur[p] || {}));
  cur[parts.at(-1)] = value;
}

function openForm(key, doc) {
  const def = collections[key];
  const fields = def.fields(doc || {}, state.ctx);
  $('#modal-title').textContent = (doc ? 'Edit ' : 'New ') + def.title.toLowerCase().replace(/s$/, '') + (doc ? ` ${doc._id}` : '');
  const form = $('#modal-form');
  form.innerHTML = `<div class="form-grid">${fields.map(fieldHtml).join('')}</div>
    <div class="form-error" id="form-error"></div>
    <div class="form-actions"><button type="button" class="btn" id="cancel-btn">Cancel</button><button class="btn primary">${doc ? 'Save changes' : 'Create'}</button></div>`;
  $('#modal').classList.remove('hidden');

  form.querySelector('#add-item')?.addEventListener('click', () => {
    $('#items-list').insertAdjacentHTML('beforeend', $('#item-template').innerHTML);
  });
  form.addEventListener('click', (e) => {
    if (e.target.matches('[data-remove-item]')) e.target.closest('.item-row').remove();
  });
  // Auto-fill unit price from the chosen listing
  form.addEventListener('change', (e) => {
    if (e.target.name === 'item_listing') {
      const l = state.ctx.listings.find((x) => x._id === e.target.value);
      const price = e.target.closest('.item-row').querySelector('[name=item_price]');
      if (l && !price.value) price.value = l.price_per_kg_ugx;
    }
  });
  $('#cancel-btn').onclick = closeModal;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const body = {};
    try {
      for (const f of fields) {
        if (f.type === 'items') {
          body.items = [...form.querySelectorAll('.item-row')].map((row) => {
            const listing_id = row.querySelector('[name=item_listing]').value;
            const l = state.ctx.listings.find((x) => x._id === listing_id);
            const price = row.querySelector('[name=item_price]').value;
            return {
              listing_id,
              crop: l?.crop,
              quantity_kg: Number(row.querySelector('[name=item_qty]').value),
              unit_price_ugx: Number(price || l?.price_per_kg_ugx || 0),
            };
          });
          if (!body.items.length) throw new Error('An order needs at least one item');
          continue;
        }
        const el = form.elements[f.name];
        let v;
        if (f.type === 'checkbox') v = el.checked;
        else if (f.type === 'number') v = el.value === '' ? undefined : Number(el.value);
        else if (f.type === 'list') v = el.value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
        else if (f.type === 'json') v = el.value.trim() ? JSON.parse(el.value) : {};
        else if (f.type === 'date') v = el.value || undefined;
        else v = el.value.trim() === '' ? undefined : el.value.trim();
        if (v === undefined && !doc) continue; // leave optional fields out on create
        if (v === undefined) v = null; // explicit clear on edit
        setPath(body, f.name, v);
      }
      const saved = doc
        ? await api(`${def.path}/${doc._id}`, { method: 'PUT', body })
        : await api(def.path, { method: 'POST', body });
      toast(`${saved._id} ${doc ? 'updated' : 'created'}`);
      closeModal();
      await loadContext();
      renderCollection($('#main'), key);
    } catch (err) {
      $('#form-error').textContent = err instanceof SyntaxError ? 'Attributes must be valid JSON' : err.message;
    }
  };
}

function closeModal() {
  $('#modal').classList.add('hidden');
}
$('#modal-close').onclick = closeModal;
$('#modal').addEventListener('click', (e) => e.target === e.currentTarget && closeModal());

/* ---------- Dashboard: overview figures and reports ----------------------- */

async function renderDashboard(main) {
  main.innerHTML = '<div class="empty">Loading…</div>';
  const [s, q1, q2, q3, q4, q5] = await Promise.all([
    api('/reports/summary'),
    api('/reports/cheap-listings?crop=maize&max_price=1200'),
    api('/reports/cooperative-farmers'),
    api('/reports/sales-per-crop'),
    api('/reports/orders-with-buyers'),
    api('/reports/price-fairness'),
  ]);

  const table = (heads, rows) =>
    rows.length
      ? `<div class="table-wrap"><table><thead><tr>${heads
          .map((h) => `<th class="${h.num ? 'num' : ''}">${h.label || h}</th>`)
          .join('')}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c, i) => `<td class="${heads[i].num ? 'num' : ''}">${c}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`
      : '<div class="empty">No results</div>';
  const N = (label) => ({ label, num: true });

  const report = (title, text, body) =>
    `<section class="card report"><h3>${title}</h3><p class="q">${text}</p>${body}</section>`;

  const totalKg = q3.reduce((a, r) => a + r.kg_sold, 0);
  const fair = q5.filter((r) => r.market_price != null && r.difference >= 0).length;

  main.innerHTML = `
    <div class="view-head"><div><h2>Dashboard</h2><p>An overview of what is in the FarmMarket database right now.</p></div></div>

    <h4 class="section-title">Records in the database</h4>
    <div class="grid">
      ${[
        ['Farmers', s.farmers],
        ['Produce listings', s.produce_listings],
        ['Buyers', s.buyers],
        ['Orders', s.orders],
        ['Market prices', s.market_prices],
        ['All records', s.total_documents],
      ]
        .map(([l, v]) => `<div class="stat"><div class="label">${l}</div><div class="value">${v}</div></div>`)
        .join('')}
    </div>

    <h4 class="section-title">Sales at a glance</h4>
    <div class="grid">
      <div class="stat"><div class="label">Revenue from delivered orders</div><div class="value">${ugx(s.delivered_revenue_ugx)}</div></div>
      <div class="stat"><div class="label">Kilograms delivered</div><div class="value">${totalKg.toLocaleString()} kg</div></div>
      <div class="stat"><div class="label">Listings priced below market</div><div class="value">${fair} of ${q5.length}</div></div>
    </div>

    <h4 class="section-title">Reports</h4>
    <div class="reports">
      ${report(
        'Sales per crop',
        'Kilograms and shillings earned from every delivered order, highest earner first.',
        table(['Crop', N('Kg sold'), N('Revenue')], q3.map((r) => [esc(r._id), r.kg_sold.toLocaleString(), ugx(r.revenue_ugx)]))
      )}
      ${report(
        'Is the farmer\'s price fair?',
        'Each listing compared with the latest market price for the same crop. A green figure means the buyer pays less than the market price.',
        table(
          ['Listing', 'Crop', N('Farm price'), N('Market price'), N('Difference')],
          q5.map((r) => [
            `<span class="mono">${r._id}</span>`,
            esc(r.crop),
            ugx(r.farm_price),
            r.market_price != null ? ugx(r.market_price) : '—',
            r.market_price != null
              ? `<span class="tag ${r.difference >= 0 ? 'status-available' : 'status-cancelled'}">${r.difference >= 0 ? '+' : ''}${r.difference.toLocaleString()}</span>`
              : '—',
          ])
        )
      )}
      ${report(
        'Orders and their buyers',
        'Every order with the name of the organisation that placed it.',
        table(['Order', 'Buyer', 'Status', N('Total')], q4.map((o) => [`<span class="mono">${o._id}</span>`, esc(o.buyer), tag(o.status), ugx(o.total_ugx)]))
      )}
      ${report(
        'Affordable maize',
        'Maize that is available now at UGX 1,200 per kg or less, cheapest first.',
        table(['Listing', 'Farmer', 'Variety', N('Kg available'), N('Price per kg')], q1.map((l) => [`<span class="mono">${l._id}</span>`, `<span class="mono">${l.farmer_id}</span>`, esc(l.variety), l.quantity_kg_available.toLocaleString(), ugx(l.price_per_kg_ugx)]))
      )}
      ${report(
        'Farmers in a cooperative',
        'Farmers who sell through a cooperative.',
        table(['Farmer', 'Name', 'Cooperative'], q2.map((f) => [`<span class="mono">${f._id}</span>`, esc(f.name), esc(f.cooperative)]))
      )}
      ${report(
        'Updating stock after a sale',
        'When produce is sold, open <b>Produce listings</b> and use the <b>− stock</b> button on the listing. The quantity available goes down and can never fall below zero.',
        ''
      )}
    </div>`;
}

render();
