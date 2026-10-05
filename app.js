const KEY = "duofit_data_v1";

const defaultState = {
  user: "julien",
  users: [
    { id: "julien", name: "Julien" },
    { id: "arina", name: "Arina" }
  ],
  exercises: [
    { id: "exo_1", name: "Pompes", category: "Haut du corps", description: "Mains écartées largeur d'épaules, corps gainé.", points: 10 },
    { id: "exo_2", name: "Squats", category: "Bas du corps", description: "Pieds largeur de bassin, descendre cuisses parallèles au sol.", points: 10 },
    { id: "exo_3", name: "Fentes", category: "Bas du corps", description: "Buste droit, fléchir le genou arrière vers le sol.", points: 12 },
    { id: "exo_4", name: "Gainage", category: "Abdos", description: "Appui sur les avant-bras, corps droit sans creuser le dos.", points: 8 },
    { id: "exo_5", name: "Cardio / Vélo", category: "Cardio", description: "Activité d'endurance libre.", points: 5 }
  ],
  workouts: []
};

let state = JSON.parse(localStorage.getItem(KEY)) || defaultState;

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

const $ = s => document.querySelector(s); const $$ = s => [...document.querySelectorAll(s)];

const getUserName = id => (id === "julien" ? "Julien" : "Arina");

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function openModal(html) {
  $("#modal-content").innerHTML = html;
  $("#modal").classList.add("open");
}

function closeModal() {
  $("#modal").classList.remove("open");
}

// Navigation & utilisateur
$$(".user-btn").forEach(btn => {   btn.onclick = () => {     state.user = btn.dataset.user;     $$
(".user-btn").forEach(b => b.classList.toggle("active", b === btn));
    render();
  };
});

$$(".nav-item").forEach(btn => {   btn.onclick = () => {     $$
(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  };
});

$("#add-workout-btn").onclick = () => openAddWorkoutModal();
$("#json-btn").onclick = () => openJsonModal();
$("#modal").onclick = e => { if (e.target.id === "modal") closeModal(); };

function render() {
  const page = $(".nav-item.active")?.dataset.page || "dashboard";
  const views = {
    dashboard: renderDashboard,
    calendar: renderCalendar,
    exercises: renderExercises,
    challenges: renderChallenges,
    profile: renderProfile
  };
  views[page]();
}

// Calculs
function getPoints(userId) {
  return state.workouts
    .filter(w => w.user === userId)
    .reduce((sum, w) => sum + (w.points || 0), 0);
}

function getWorkoutsCount(userId) {
  return state.workouts.filter(w => w.user === userId).length;
}

// Vue Dashboard
function renderDashboard() {
  const ptsJulien = getPoints("julien");
  const ptsArina = getPoints("arina");
  const total = ptsJulien + ptsArina;

  $("#content").innerHTML = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="stat-label">COMPÉTITION / COOPÉRATION</span>
        <span style="font-weight:800; font-size:12px;">${total} pts cumulés</span>
      </div>
      <div style="margin-top:12px;">
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
          <span>Julien (${ptsJulien} pts)</span>
          <span>Arina (${ptsArina} pts)</span>
        </div>
        <div class="progress-bar" style="display:flex;">
          <div class="progress-fill" style="width:${total ? (ptsJulien / total * 100) : 50}%"></div>
          <div class="progress-fill arina" style="width:${total ? (ptsArina / total * 100) : 50}%"></div>
        </div>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-label">Mes séances</div>
        <div class="stat-val">${getWorkoutsCount(state.user)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Mes points</div>
        <div class="stat-val">${getPoints(state.user)}</div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">Dernières séances</h3>
      ${state.workouts.length === 0 
        ? `<p class="exercise-desc" style="text-align:center; padding:12px 0;">Aucune séance enregistrée pour le moment.</p>` 
        : state.workouts.slice(-5).reverse().map(w => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--line);">
              <div>
                <strong>${getUserName(w.user)}</strong> · <span class="exercise-desc">${w.date}</span>
                <div class="exercise-desc">${w.items.map(i => {
                  const ex = state.exercises.find(e => e.id === i.exercise);
                  return ex ? ex.name : "Exercice";
                }).join(", ")}</div>
              </div>
              <strong style="color:var(--julien);">+${w.points} pts</strong>
            </div>
          `).join("")
      }
    </div>
  `;
}

// Vue Calendrier
function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  let daysHtml = "";
  for (let i = 0; i < offset; i++) {
    daysHtml += `<div class="day-cell muted"></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayLogs = state.workouts.filter(w => w.date === dateStr);
    const hasJulien = dayLogs.some(w => w.user === "julien");
    const hasArina = dayLogs.some(w => w.user === "arina");
    const isToday = d === now.getDate();

    daysHtml += `
      <div class="day-cell ${isToday ? 'today' : ''}" onclick="showDayDetails('${dateStr}')">
        <span class="day-num">${d}</span>
        <div class="dots-wrapper">
          ${hasJulien ? '<div class="dot dot-julien"></div>' : ''}
          ${hasArina ? '<div class="dot dot-arina"></div>' : ''}
        </div>
      </div>
    `;
  }

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  $("#content").innerHTML = `
    <div class="card">
      <h3 class="card-title">${monthNames[month]} ${year}</h3>
      <div class="calendar-grid">
        ${["L", "M", "M", "J", "V", "S", "D"].map(h => `<div class="day-header">${h}</div>`).join("")}
        ${daysHtml}
      </div>
    </div>
  `;
}

function showDayDetails(dateStr) {
  const logs = state.workouts.filter(w => w.date === dateStr);
  openModal(`
    <div class="modal-header">
      <h3>Activités du ${dateStr}</h3>
      <button class="close-btn" onclick="closeModal()">×</button>
    </div>
    ${logs.length === 0 
      ? `<p class="exercise-desc">Pas de séance enregistrée ce jour-là.</p>`
      : logs.map(w => `
          <div style="padding:8px 0; border-bottom:1px solid var(--line);">
            <strong>${getUserName(w.user)}</strong> (+${w.points} pts)
            <div class="exercise-desc">${w.items.map(i => `${i.sets}x ${i.reps} ${(state.exercises.find(e => e.id === i.exercise)||{}).name || ''}`).join(", ")}</div>
          </div>
        `).join("")
    }
  `);
}

// Vue Exercices
function renderExercises() {
  $("#content").innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin:0;">Bibliothèque (${state.exercises.length})</h3>
      <button class="btn-primary" onclick="openAddExerciseModal()">+ Créer un exercice</button>
    </div>

    <div class="exercise-list">
      ${state.exercises.map(e => `
        <div class="card exercise-card">
          <div class="exercise-header">
            <h4 class="exercise-name">${e.name}</h4>
            <span class="tag">${e.category}</span>
          </div>
          <p class="exercise-desc">${e.description}</p>
          <div style="font-size:11px; font-weight:700; color:var(--julien);">${e.points} pts / série</div>
        </div>
      `).join("")}
    </div>
  `;
}

function openAddExerciseModal() {
  openModal(`
    <div class="modal-header">
      <h3>Nouvel exercice</h3>
      <button class="close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="field">
      <label>NOM DE L'EXERCICE</label>
      <input id="ex-name" type="text" placeholder="ex: Dips, Burpees...">
    </div>
    <div class="field">
      <label>CATÉGORIE</label>
      <input id="ex-cat" type="text" placeholder="ex: Haut du corps, Cardio...">
    </div>
    <div class="field">
      <label>DESCRIPTION / CONSIGNES</label>
      <textarea id="ex-desc" rows="2" placeholder="Description pour bien réaliser le mouvement..."></textarea>
    </div>
    <div class="field">
      <label>POINTS PAR SÉRIE</label>
      <input id="ex-pts" type="number" value="10" min="1">
    </div>
    <button class="btn-primary" style="width:100%; margin-top:8px;" onclick="saveCustomExercise()">Ajouter l'exercice</button>
  `);
}

function saveCustomExercise() {
  const name = $("#ex-name").value.trim();
  const category = $("#ex-cat").value.trim() || "Général";
  const description = $("#ex-desc").value.trim() || "Aucune description.";
  const points = parseInt($("#ex-pts").value) || 10;

  if (!name) {
    toast("Merci de saisir un nom d'exercice");
    return;
  }

  const newEx = { id: `exo_${Date.now()}`, name, category, description, points };
  state.exercises.push(newEx);
  save();
  closeModal();
  toast("Exercice ajouté !");
  renderExercises();
}

// Vue Défis
function renderChallenges() {
  const ptsJ = getPoints("julien");
  const ptsA = getPoints("arina");

  $("#content").innerHTML = `
    <div class="card">
      <h3 class="card-title">Défis & Compétition</h3>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="stat-box">
          <strong>Premier pas</strong>
          <p class="exercise-desc">Enregistrer au moins 1 séance.</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${(getWorkoutsCount(state.user) > 0) ? 100 : 0}%"></div>
          </div>
        </div>
        <div class="stat-box">
          <strong>Objectif Duo : 500 pts</strong>
          <p class="exercise-desc">Atteindre 500 points au total à deux.</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${Math.min(100, (ptsJ + ptsA) / 500 * 100)}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Vue Profil
function renderProfile() {
  const name = getUserName(state.user);
  $("#content").innerHTML = `
    <div class="card" style="text-align:center;">
      <div class="avatar ${state.user}" style="width:50px; height:50px; font-size:20px; margin:0 auto 10px;">${name[0]}</div>
      <h2 style="margin:0;">${name}</h2>
      <p class="exercise-desc" style="margin-top:4px;">Utilisateur connecté</p>
    </div>

    <div class="card">
      <h3 class="card-title">Données brutes JSON</h3>
      <button class="btn-ghost" style="width:100%;" onclick="openJsonModal()">Afficher / Modifier le JSON</button>
    </div>
  `;
}

// Modale de saisie de séance
function openAddWorkoutModal() {
  const todayStr = new Date().toISOString().split('T')[0];

  openModal(`
    <div class="modal-header">
      <h3>Saisir une séance (${getUserName(state.user)})</h3>
      <button class="close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="field">
      <label>DATE</label>
      <input id="w-date" type="date" value="${todayStr}">
    </div>
    <div class="field">
      <label>SÉLECTION DE SÉRIES</label>
      <div style="max-height:220px; overflow-y:auto;">
        ${state.exercises.map(ex => `
          <div class="exercise-picker-row">
            <div>
              <strong style="font-size:12px;">${ex.name}</strong>
              <div class="exercise-desc">${ex.points} pts/série</div>
            </div>
            <input type="number" class="w-sets" data-id="${ex.id}" min="0" placeholder="Séries">
            <input type="number" class="w-reps" data-id="${ex.id}" min="0" placeholder="Rép.">
          </div>
        `).join("")}
      </div>
    </div>
    <button class="btn-primary" style="width:100%; margin-top:12px;" onclick="saveWorkout()">Valider la séance</button>
  `);
}

function saveWorkout() {
  const date = $("#w-date").value;   const items = [];   let totalPoints = 0;    $$(".w-sets").forEach(sInput => {
    const sets = parseInt(sInput.value) || 0;
    const exId = sInput.dataset.id;
    const repsInput = document.querySelector(`.w-reps[data-id="${exId}"]`);
    const reps = parseInt(repsInput.value) || 0;

    if (sets > 0 && reps > 0) {
      const ex = state.exercises.find(e => e.id === exId);
      const pts = (ex ? ex.points : 10) * sets;
      items.push({ exercise: exId, sets, reps });
      totalPoints += pts;
    }
  });

  if (items.length === 0) {
    toast("Sélectionne au moins un exercice avec séries et répétitions.");
    return;
  }

  state.workouts.push({
    id: `w_${Date.now()}`,
    user: state.user,
    date,
    items,
    points: totalPoints
  });

  save();
  closeModal();
  toast(`Séance enregistrée ! +${totalPoints} pts`);
  render();
}

// Modale JSON / Supabase
function openJsonModal() {
  openModal(`
    <div class="modal-header">
      <h3>Données JSON</h3>
      <button class="close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="field">
      <label>STRUCTURE DES DONNÉES (ÉDITABLE)</label>
      <textarea id="json-editor" rows="12">${JSON.stringify(state, null, 2)}</textarea>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn-ghost" style="flex:1;" onclick="navigator.clipboard.writeText($('#json-editor').value); toast('Copié dans le presse-papier !');">Copier</button>
      <button class="btn-primary" style="flex:1;" onclick="importJson()">Sauvegarder</button>
    </div>
  `);
}

function importJson() {
  try {
    const parsed = JSON.parse($("#json-editor").value);
    state = parsed;
    save();
    closeModal();
    toast("Données mises à jour avec succès !");
    render();
  } catch (err) {
    toast("Erreur de format JSON synthaxiquement invalide.");
  }
}

// Initialisation
render();