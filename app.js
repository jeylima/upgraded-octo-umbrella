const storageKey = "marcenariaPremiumData";
const state = {
  clients: [],
  selectedClientId: null,
};

const refs = {
  headerDate: document.getElementById("headerDate"),
  previewDate: document.getElementById("previewDate"),
  clientForm: document.getElementById("clientForm"),
  toggleClientFormBtn: document.getElementById("toggleClientFormBtn"),
  clientList: document.getElementById("clientList"),
  selectedClientLabel: document.getElementById("selectedClientLabel"),
  quoteForm: document.getElementById("quoteForm"),
  addDoorBtn: document.getElementById("addDoorBtn"),
  doorRows: document.getElementById("doorRows"),
  doorRowTemplate: document.getElementById("doorRowTemplate"),
  totalArea: document.getElementById("totalArea"),
  grandTotal: document.getElementById("grandTotal"),
  pricePerM2: document.getElementById("pricePerM2"),
  quoteHistory: document.getElementById("quoteHistory"),
  previewClient: document.getElementById("previewClient"),
  previewRows: document.getElementById("previewRows"),
  previewTotal: document.getElementById("previewTotal"),
  printPdfBtn: document.getElementById("printPdfBtn"),
};

function uid() {
  return crypto.randomUUID();
}

function nowDate() {
  return new Date().toLocaleDateString("pt-PT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function load() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.clients = Array.isArray(parsed.clients) ? parsed.clients : [];
    state.selectedClientId = parsed.selectedClientId ?? null;
  } catch {
    state.clients = [];
    state.selectedClientId = null;
  }
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getSelectedClient() {
  return state.clients.find((client) => client.id === state.selectedClientId) ?? null;
}

function euro(value) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function calculateDoorLine(width, height, qty, pricePerM2) {
  const area = (width * height * qty) / 1000000;
  const subtotal = area * pricePerM2;
  return { area, subtotal };
}

function parseDoorRows() {
  const rows = [...refs.doorRows.querySelectorAll("tr")];
  const pricePerM2 = Number(refs.pricePerM2.value) || 0;

  return rows.map((row) => {
    const width = Number(row.querySelector(".door-width").value) || 0;
    const height = Number(row.querySelector(".door-height").value) || 0;
    const quantity = Number(row.querySelector(".door-qty").value) || 0;
    const { area, subtotal } = calculateDoorLine(width, height, quantity, pricePerM2);

    row.querySelector(".row-area").textContent = area.toFixed(2);
    row.querySelector(".row-subtotal").textContent = subtotal.toFixed(2);

    return { width, height, quantity, area, subtotal };
  });
}

function renderTotals() {
  const doors = parseDoorRows();
  const totalArea = doors.reduce((sum, item) => sum + item.area, 0);
  const total = doors.reduce((sum, item) => sum + item.subtotal, 0);
  refs.totalArea.textContent = `${totalArea.toFixed(2)} m²`;
  refs.grandTotal.textContent = euro(total);

  renderPreview(doors, total);
}

function addDoorRow(values = {}) {
  const row = refs.doorRowTemplate.content.firstElementChild.cloneNode(true);
  row.querySelector(".door-width").value = values.width ?? "";
  row.querySelector(".door-height").value = values.height ?? "";
  row.querySelector(".door-qty").value = values.quantity ?? 1;

  row.addEventListener("input", renderTotals);
  row.querySelector(".remove-row").addEventListener("click", () => {
    row.remove();
    renderTotals();
  });

  refs.doorRows.appendChild(row);
  renderTotals();
}

function resetDoorRows() {
  refs.doorRows.innerHTML = "";
  addDoorRow();
}

function renderClients() {
  refs.clientList.innerHTML = "";
  if (!state.clients.length) {
    refs.clientList.innerHTML = "<p>Nenhum cliente registado.</p>";
    return;
  }

  state.clients.forEach((client) => {
    const card = document.createElement("article");
    card.className = `client-card ${client.id === state.selectedClientId ? "active" : ""}`;
    card.innerHTML = `
      <strong>${client.name}</strong>
      <p>${client.phone}</p>
      <p>${client.location}</p>
      <small>${client.notes || "Sem observações"}</small>
    `;

    const selectBtn = document.createElement("button");
    selectBtn.textContent = "Selecionar";
    selectBtn.type = "button";
    selectBtn.addEventListener("click", () => {
      state.selectedClientId = client.id;
      save();
      syncSelectedClient();
      renderClients();
      renderQuoteHistory();
    });

    card.appendChild(selectBtn);
    refs.clientList.appendChild(card);
  });
}

function syncSelectedClient() {
  const client = getSelectedClient();
  refs.selectedClientLabel.textContent = client ? client.name : "Sem cliente selecionado";
  refs.previewClient.textContent = client
    ? `${client.name} | ${client.phone} | ${client.location}${client.notes ? ` | ${client.notes}` : ""}`
    : "Selecione um cliente para começar.";
}

function renderQuoteHistory() {
  const client = getSelectedClient();
  refs.quoteHistory.innerHTML = "";

  if (!client) {
    refs.quoteHistory.innerHTML = "<p>Selecione um cliente para ver o histórico.</p>";
    return;
  }

  if (!client.quotes?.length) {
    refs.quoteHistory.innerHTML = "<p>Este cliente ainda não tem orçamentos.</p>";
    return;
  }

  [...client.quotes]
    .reverse()
    .forEach((quote) => {
      const card = document.createElement("article");
      card.className = "quote-card";
      card.innerHTML = `
        <strong>${quote.date}</strong>
        <p>${quote.doors.length} porta(s)</p>
        <p>Total: ${euro(quote.total)}</p>
      `;

      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.className = "secondary";
      loadBtn.textContent = "Carregar no editor";
      loadBtn.addEventListener("click", () => {
        refs.pricePerM2.value = quote.pricePerM2.toFixed(2);
        refs.doorRows.innerHTML = "";
        quote.doors.forEach((door) => addDoorRow(door));
        renderTotals();
      });

      card.appendChild(loadBtn);
      refs.quoteHistory.appendChild(card);
    });
}

function renderPreview(doors, total) {
  refs.previewRows.innerHTML = "";
  if (!doors.length || doors.every((item) => !item.width || !item.height || !item.quantity)) {
    refs.previewRows.innerHTML = "<tr><td colspan='6'>Adicione portas para visualizar.</td></tr>";
    refs.previewTotal.textContent = euro(0);
    return;
  }

  doors.forEach((door, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${door.width}</td>
      <td>${door.height}</td>
      <td>${door.quantity}</td>
      <td>${door.area.toFixed(2)}</td>
      <td>${door.subtotal.toFixed(2)}</td>
    `;
    refs.previewRows.appendChild(row);
  });

  refs.previewTotal.textContent = euro(total);
}

function bindEvents() {
  refs.toggleClientFormBtn.addEventListener("click", () => {
    refs.clientForm.classList.toggle("hidden");
  });

  refs.clientForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const client = {
      id: uid(),
      name: document.getElementById("clientName").value.trim(),
      phone: document.getElementById("clientPhone").value.trim(),
      location: document.getElementById("clientLocation").value.trim(),
      notes: document.getElementById("clientNotes").value.trim(),
      quotes: [],
    };

    state.clients.unshift(client);
    state.selectedClientId = client.id;
    save();

    refs.clientForm.reset();
    refs.clientForm.classList.add("hidden");
    renderClients();
    syncSelectedClient();
    renderQuoteHistory();
  });

  refs.addDoorBtn.addEventListener("click", () => addDoorRow());
  refs.pricePerM2.addEventListener("input", renderTotals);

  refs.quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const client = getSelectedClient();
    if (!client) {
      alert("Selecione um cliente antes de guardar o orçamento.");
      return;
    }

    const doors = parseDoorRows().filter((item) => item.width && item.height && item.quantity);
    if (!doors.length) {
      alert("Insira pelo menos uma porta válida.");
      return;
    }

    const total = doors.reduce((sum, item) => sum + item.subtotal, 0);

    client.quotes.push({
      id: uid(),
      date: nowDate(),
      pricePerM2: Number(refs.pricePerM2.value) || 0,
      doors,
      total,
    });

    save();
    renderQuoteHistory();
    alert("Orçamento guardado com sucesso.");
  });

  refs.printPdfBtn.addEventListener("click", () => {
    window.print();
  });
}

function init() {
  const dateText = nowDate();
  refs.headerDate.textContent = dateText;
  refs.previewDate.textContent = `Data: ${dateText}`;

  load();
  bindEvents();
  renderClients();
  syncSelectedClient();
  renderQuoteHistory();
  resetDoorRows();
}

init();
