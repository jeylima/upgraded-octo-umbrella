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
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowDate() {
  return new Date().toLocaleDateString("pt-PT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function euro(value) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function normalizeClient(rawClient) {
  return {
    id: rawClient.id || uid(),
    name: String(rawClient.name || "").trim(),
    phone: String(rawClient.phone || "").trim(),
    location: String(rawClient.location || "").trim(),
    notes: String(rawClient.notes || "").trim(),
    quotes: Array.isArray(rawClient.quotes) ? rawClient.quotes : [],
  };
}

function load() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const clients = Array.isArray(parsed.clients) ? parsed.clients.map(normalizeClient) : [];
    state.clients = clients;
    state.selectedClientId = parsed.selectedClientId || clients[0]?.id || null;
  } catch {
    state.clients = [];
    state.selectedClientId = null;
  }
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getSelectedClient() {
  return state.clients.find((client) => client.id === state.selectedClientId) || null;
}

function calculateDoorLine(width, height, quantity, pricePerM2) {
  const area = (width * height * quantity) / 1000000;
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

function getValidDoors() {
  return parseDoorRows().filter((door) => door.width > 0 && door.height > 0 && door.quantity > 0);
}

function renderPreview(doors, total) {
  refs.previewRows.innerHTML = "";

  if (!doors.length) {
    const empty = document.createElement("tr");
    empty.innerHTML = "<td colspan='6'>Adicione portas para visualizar.</td>";
    refs.previewRows.appendChild(empty);
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
      <td>${euro(door.subtotal)}</td>
    `;
    refs.previewRows.appendChild(row);
  });

  refs.previewTotal.textContent = euro(total);
}

function renderTotals() {
  const doors = getValidDoors();
  const totalArea = doors.reduce((sum, door) => sum + door.area, 0);
  const total = doors.reduce((sum, door) => sum + door.subtotal, 0);

  refs.totalArea.textContent = `${totalArea.toFixed(2)} m²`;
  refs.grandTotal.textContent = euro(total);
  renderPreview(doors, total);
}

function addDoorRow(values = {}) {
  const row = refs.doorRowTemplate.content.firstElementChild.cloneNode(true);

  row.querySelector(".door-width").value = values.width || "";
  row.querySelector(".door-height").value = values.height || "";
  row.querySelector(".door-qty").value = values.quantity || 1;

  row.addEventListener("input", renderTotals);
  row.querySelector(".remove-row").addEventListener("click", () => {
    row.remove();
    if (!refs.doorRows.querySelector("tr")) {
      addDoorRow();
      return;
    }
    renderTotals();
  });

  refs.doorRows.appendChild(row);
  renderTotals();
}

function renderClients() {
  refs.clientList.innerHTML = "";

  if (!state.clients.length) {
    const empty = document.createElement("p");
    empty.textContent = "Nenhum cliente registado.";
    refs.clientList.appendChild(empty);
    return;
  }

  state.clients.forEach((client) => {
    const card = document.createElement("article");
    card.className = `client-card ${client.id === state.selectedClientId ? "active" : ""}`;

    const name = document.createElement("strong");
    name.textContent = client.name;
    const phone = document.createElement("p");
    phone.textContent = client.phone;
    const location = document.createElement("p");
    location.textContent = client.location;
    const notes = document.createElement("small");
    notes.textContent = client.notes || "Sem observações";

    const selectBtn = document.createElement("button");
    selectBtn.type = "button";
    selectBtn.textContent = "Selecionar";
    selectBtn.addEventListener("click", () => {
      state.selectedClientId = client.id;
      save();
      syncSelectedClient();
      renderClients();
      renderQuoteHistory();
      renderTotals();
    });

    card.append(name, phone, location, notes, selectBtn);
    refs.clientList.appendChild(card);
  });
}

function syncSelectedClient() {
  const client = getSelectedClient();
  refs.selectedClientLabel.textContent = client ? client.name : "Sem cliente selecionado";

  if (!client) {
    refs.previewClient.textContent = "Selecione um cliente para começar.";
    return;
  }

  const details = [client.name, client.phone, client.location, client.notes].filter(Boolean);
  refs.previewClient.textContent = details.join(" | ");
}

function renderQuoteHistory() {
  refs.quoteHistory.innerHTML = "";
  const client = getSelectedClient();

  if (!client) {
    refs.quoteHistory.innerHTML = "<p>Selecione um cliente para ver o histórico.</p>";
    return;
  }

  if (!client.quotes.length) {
    refs.quoteHistory.innerHTML = "<p>Este cliente ainda não tem orçamentos.</p>";
    return;
  }

  [...client.quotes]
    .reverse()
    .forEach((quote) => {
      const card = document.createElement("article");
      card.className = "quote-card";

      const date = document.createElement("strong");
      date.textContent = quote.date;
      const lines = document.createElement("p");
      lines.textContent = `${quote.doors.length} porta(s)`;
      const total = document.createElement("p");
      total.textContent = `Total: ${euro(quote.total)}`;

      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.className = "secondary";
      loadBtn.textContent = "Carregar no editor";
      loadBtn.addEventListener("click", () => {
        refs.pricePerM2.value = Number(quote.pricePerM2 || 0).toFixed(2);
        refs.doorRows.innerHTML = "";
        quote.doors.forEach((door) => addDoorRow(door));
        renderTotals();
      });

      card.append(date, lines, total, loadBtn);
      refs.quoteHistory.appendChild(card);
    });
}

function createClientFromForm() {
  return {
    id: uid(),
    name: document.getElementById("clientName").value.trim(),
    phone: document.getElementById("clientPhone").value.trim(),
    location: document.getElementById("clientLocation").value.trim(),
    notes: document.getElementById("clientNotes").value.trim(),
    quotes: [],
  };
}

function bindEvents() {
  refs.toggleClientFormBtn.addEventListener("click", () => {
    refs.clientForm.classList.toggle("hidden");
  });

  refs.clientForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const client = createClientFromForm();
    if (!client.name || !client.phone || !client.location) {
      alert("Preencha nome, telefone e localização.");
      return;
    }

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

    const doors = getValidDoors();
    if (!doors.length) {
      alert("Insira pelo menos uma porta válida.");
      return;
    }

    const total = doors.reduce((sum, door) => sum + door.subtotal, 0);

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

function resetDoorRows() {
  refs.doorRows.innerHTML = "";
  addDoorRow();
}

function init() {
  const date = nowDate();
  refs.headerDate.textContent = date;
  refs.previewDate.textContent = `Data: ${date}`;

  load();
  bindEvents();
  renderClients();
  syncSelectedClient();
  renderQuoteHistory();
  resetDoorRows();
}

init();
