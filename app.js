/* ====== Settings ====== */
const USER_NAME = "Ru"; // <- change if you like

/* ====== Helpers ====== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);
const todayISO = () => fmtDate(new Date());
const toKey = () => Math.random().toString(36).slice(2);
const pad = (n) => String(n).padStart(2, "0");
const parseDateTime = (date, time) =>
  new Date(time ? `${date}T${time}` : `${date}T00:00`);
const niceDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/* ====== Storage ====== */
const store = {
  get(k, fallback) {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  },
};
const KEYS = {
  todos: "startpage.todos.v1",
  events: "startpage.events.v1",
  settings: "startpage.settings.v1",
};

/* ====== Background animation toggle ====== */
const settings = store.get(KEYS.settings, { animateBg: true });
document.body.classList.toggle("bg-animate", settings.animateBg);

const bgToggleBtn = document.createElement("button");
bgToggleBtn.id = "toggleBg";
bgToggleBtn.className = "chip";
bgToggleBtn.textContent = settings.animateBg ? "Disable motion" : "Enable motion";
document.body.appendChild(bgToggleBtn);

bgToggleBtn.addEventListener("click", () => {
  settings.animateBg = !settings.animateBg;
  document.body.classList.toggle("bg-animate", settings.animateBg);
  bgToggleBtn.textContent = settings.animateBg
    ? "Disable motion"
    : "Enable motion";
  store.set(KEYS.settings, settings);
});

/* ====== Greeting & clock (time-aware, includes name) ====== */
function greetingForHour(h) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
function updateGreeting() {
  const h = new Date().getHours();
  $("#greeting").textContent = `${greetingForHour(h)}, ${USER_NAME} 👋`;
}
function updateClock() {
  const now = new Date();
  $("#clock").textContent =
    now.toLocaleString([], { hour: "2-digit", minute: "2-digit" }) +
    " • " +
    now.toLocaleDateString();
}
updateGreeting();
updateClock();
setInterval(() => {
  updateClock();
  updateGreeting();
}, 1000 * 30);

/* ====== Quick links ====== */
$("#quickLinks").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-url]");
  if (!b) return;
  window.location.href = b.dataset.url;
});

/* ====== Search ====== */
const engineUrls = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  ddg: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  brave: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  wiki: (q) =>
    `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
      q
    )}`,
  yt: (q) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
};
$("#searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("#q").value.trim();
  if (!q) return;
  const url = engineUrls[$("#engine").value](q);
  window.location.href = url;
});
// Focus search with '/'
window.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== $("#q")) {
    e.preventDefault();
    $("#q").focus();
  }
});

/* ====== To-do ====== */
let todos = store.get(KEYS.todos, []);
const listEl = $("#todoList");
const emptyEl = $("#todoEmpty");

function renderTodos() {
  listEl.innerHTML = "";
  if (todos.length === 0) {
    emptyEl.hidden = false;
    return;
  } else {
    emptyEl.hidden = true;
  }
  const order = { 0: 0, 1: 1, 2: 2, 3: 3 };
  const sorted = [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if ((b.priority || 1) !== (a.priority || 1))
      return (b.priority || 1) - (a.priority || 1);
    return (a.due || "9999-12-31").localeCompare(b.due || "9999-12-31");
  });
  for (const t of sorted) {
    const li = document.createElement("li");
    li.className = "todo" + (t.done ? " done" : "");
    li.draggable = true;
    li.dataset.id = t.id;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!t.done;
    cb.addEventListener("change", () => {
      t.done = cb.checked;
      store.set(KEYS.todos, todos);
      renderTodos();
    });

    const text = document.createElement("div");
    text.className = "title";
    const label = document.createElement("div");
    label.textContent = t.text;
    const small = document.createElement("small");
    const due = document.createElement("span");
    due.className = "due";
    if (t.due) {
      const today = todayISO();
      due.textContent = "Due " + niceDate(t.due);
      if (t.due < today) due.classList.add("overdue");
      else if (t.due === today) due.classList.add("today");
    } else {
      due.textContent = "No due date";
    }
    small.appendChild(due);
    text.append(label, small);

    const priority = document.createElement("span");
    priority.className = "priority";
    priority.dataset.level = t.priority || "1";
    const names = { 1: "P1", 2: "P2", 3: "P3" };
    const cycle = () => {
      t.priority = ((t.priority || 1) % 3) + 1;
      store.set(KEYS.todos, todos);
      renderTodos();
    };
    priority.textContent = names[t.priority || 1];
    priority.title = "Click to change priority";
    priority.addEventListener("click", cycle);

    const del = document.createElement("button");
    del.className = "icon";
    del.title = "Delete";
    del.innerHTML = "✕";
    del.addEventListener("click", () => {
      todos = todos.filter((x) => x.id !== t.id);
      store.set(KEYS.todos, todos);
      renderTodos();
    });

    li.append(cb, text, priority, del);

    li.addEventListener("dragstart", () => li.classList.add("dragging"));
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      const ids = $$("#todoList .todo").map((n) => n.dataset.id);
      todos.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      store.set(KEYS.todos, todos);
    });
    listEl.appendChild(li);
  }
  listEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = $(".todo.dragging");
    const after = Array.from(
      listEl.querySelectorAll(".todo:not(.dragging)")
    ).find(
      (el) => e.clientY <= el.getBoundingClientRect().top + el.offsetHeight / 2
    );
    if (!after) listEl.appendChild(dragging);
    else listEl.insertBefore(dragging, after);
  });
}
function addTodo(text, due) {
  todos.push({ id: toKey(), text, due: due || null, done: false, priority: 1 });
  store.set(KEYS.todos, todos);
  renderTodos();
}
$("#todoAddBtn").addEventListener("click", () => {
  const text = $("#todoText").value.trim();
  if (!text) return;
  addTodo(text, $("#todoDate").value || null);
  $("#todoText").value = "";
  $("#todoDate").value = "";
  $("#todoText").focus();
});
$("#todoText").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    $("#todoAddBtn").click();
  }
});
$("#clearDone").addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  store.set(KEYS.todos, todos);
  renderTodos();
});
$("#exportTodos").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(todos, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "todos.json";
  a.click();
  URL.revokeObjectURL(a.href);
});
$("#importTodosBtn").addEventListener("click", () => $("#importTodos").click());
$("#importTodos").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error("Invalid file");
    todos = data;
    store.set(KEYS.todos, todos);
    renderTodos();
  } catch (err) {
    alert("Import failed: " + err.message);
  }
});
renderTodos();

/* ====== Calendar & events ====== */
let events = store.get(KEYS.events, []); // {id,title,date,time,type,notes}
const calGrid = $("#calGrid");
const calLabel = $("#calLabel");
let view = new Date();

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  const day = (first.getDay() + 6) % 7; // Monday=0
  start.setDate(1 - day);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}
function renderCalendar() {
  const y = view.getFullYear();
  const m = view.getMonth();
  calLabel.textContent = view.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  calGrid.innerHTML = "";
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d) => {
    const el = document.createElement("div");
    el.className = "dow";
    el.textContent = d;
    calGrid.appendChild(el);
  });
  const cells = monthMatrix(y, m);
  const today = todayISO();
  for (const d of cells) {
    const iso = fmtDate(d);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day" + (d.getMonth() !== m ? " other" : "");
    btn.dataset.date = iso;
    btn.innerHTML = `<div class="num">${d.getDate()}${
      iso === today
        ? ' • <span style="color:var(--accent);font-weight:700">today</span>'
        : ""
    }</div>`;
    const dayEvents = events.filter((ev) => ev.date === iso);
    const dots = document.createElement("div");
    dots.className = "dots";
    dayEvents.forEach((ev) => {
      const dot = document.createElement("span");
      dot.className = "dot " + (ev.type === "reminder" ? "yellow" : "green");
      const dt = parseDateTime(ev.date, ev.time);
      if (dt < new Date() && ev.type === "due") dot.classList.add("red");
      dots.appendChild(dot);
    });
    btn.appendChild(dots);
    btn.addEventListener("click", () => openEventModal(iso));
    calGrid.appendChild(btn);
  }
  renderUpcoming();
}
function renderUpcoming() {
  const wrap = $("#upcomingList");
  wrap.innerHTML = "";
  const now = new Date();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 30);
  const upcoming = events
    .map((ev) => ({ ...ev, dt: parseDateTime(ev.date, ev.time) }))
    .filter(
      (ev) =>
        ev.dt >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) &&
        ev.dt <= horizont
    )
    .sort((a, b) => a.dt - b.dt);
  if (upcoming.length === 0) {
    $("#upcomingEmpty").hidden = false;
    return;
  } else {
    $("#upcomingEmpty").hidden = true;
  }
  for (const ev of upcoming) {
    const row = document.createElement("div");
    row.className = "up-item";
    row.dataset.id = ev.id;
    const t = document.createElement("time");
    t.textContent = ev.time
      ? `${niceDate(ev.date)} • ${ev.time}`
      : niceDate(ev.date);
    const ttl = document.createElement("div");
    ttl.className = "ttl";
    ttl.textContent = ev.title + (ev.type === "reminder" ? " (reminder)" : "");
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = "Open";
    btn.addEventListener("click", () => openEventModal(ev.date, ev.id));
    row.append(t, ttl, btn);
    wrap.appendChild(row);
  }
}

/* ====== Event modal ====== */
const dlg = $("#eventDialog");
function openEventModal(dateISO, eventId = null) {
  $("#eventDialogTitle").textContent = eventId ? "Edit item" : "Add item";
  $("#eventDate").value = dateISO || todayISO();
  $("#eventTime").value = "";
  $("#eventTitle").value = "";
  $("#eventNotes").value = "";
  $("#eventType").value = "due";
  $("#eventId").value = eventId || "";
  $("#deleteEventBtn").hidden = !eventId;

  if (eventId) {
    const ev = events.find((x) => x.id === eventId);
    if (ev) {
      $("#eventTitle").value = ev.title || "";
      $("#eventDate").value = ev.date || dateISO || todayISO();
      $("#eventTime").value = ev.time || "";
      $("#eventNotes").value = ev.notes || "";
      $("#eventType").value = ev.type || "due";
    }
  }
  dlg.showModal();
}
$("#eventForm").addEventListener("submit", (e) => e.preventDefault());
$("#eventForm").addEventListener("click", (e) => {
  const val = e.target.value;
  if (!["save", "cancel", "delete"].includes(val)) return;

  if (val === "cancel") {
    dlg.close();
    return;
  }

  if (val === "delete") {
    const id = $("#eventId").value;
    if (id) {
      events = events.filter((x) => x.id !== id);
      store.set(KEYS.events, events);
      dlg.close();
      renderCalendar();
    }
    return;
  }

  const payload = {
    id: $("#eventId").value || toKey(),
    title: $("#eventTitle").value.trim(),
    date: $("#eventDate").value,
    time: $("#eventTime").value || null,
    type: $("#eventType").value,
    notes: $("#eventNotes").value.trim() || null,
  };
  if (!payload.title) {
    alert("Please add a title");
    return;
  }
  const idx = events.findIndex((x) => x.id === payload.id);
  if (idx >= 0) events[idx] = payload;
  else events.push(payload);
  store.set(KEYS.events, events);
  dlg.close();
  renderCalendar();
});

$("#prevMonth").addEventListener("click", () => {
  view.setMonth(view.getMonth() - 1);
  renderCalendar();
});
$("#nextMonth").addEventListener("click", () => {
  view.setMonth(view.getMonth() + 1);
  renderCalendar();
});
$("#todayBtn").addEventListener("click", () => {
  view = new Date();
  renderCalendar();
});

$("#exportEvents").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(events, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "events.json";
  a.click();
  URL.revokeObjectURL(a.href);
});
$("#importEventsBtn").addEventListener("click", () =>
  $("#importEvents").click()
);
$("#importEvents").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error("Invalid file");
    events = data;
    store.set(KEYS.events, events);
    renderCalendar();
  } catch (err) {
    alert("Import failed: " + err.message);
  }
});

renderCalendar();
