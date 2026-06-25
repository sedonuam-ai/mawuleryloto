// ===== Données des 12 jeux (programme officiel des tirages) =====
const GAMES = [
  { id: 'lotto-diamant', name: 'Lotto Diamant', day: 'lundi', time: '13:00' },
  { id: 'loto-gold', name: 'Loto Gold', day: 'lundi', time: '18:00' },
  { id: 'loto-cash', name: 'Loto Cash', day: 'mardi', time: '13:00' },
  { id: 'loto-boom', name: 'Loto Boom', day: 'mardi', time: '18:00' },
  { id: 'loto-benz', name: 'Loto Benz', day: 'mercredi', time: '13:00' },
  { id: 'loto-prestige', name: 'Loto Prestige', day: 'mercredi', time: '18:00' },
  { id: 'loto-million', name: 'Loto Million', day: 'jeudi', time: '13:00' },
  { id: 'loto-super', name: 'Loto Super', day: 'jeudi', time: '18:00' },
  { id: 'loto-kadoo', name: 'Loto Kadoo', day: 'vendredi', time: '13:00' },
  { id: 'loto-king', name: 'Loto King', day: 'vendredi', time: '18:00' },
  { id: 'loto-sam', name: 'Loto Sam', day: 'samedi', time: '13:00' },
  { id: 'loto-bingo', name: 'Loto Bingo', day: 'samedi', time: '18:00' },
];

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

// ===== Stockage local (fonctionne hors-ligne, sauvegardé sur le téléphone) =====
const STORAGE_KEY = 'loto_togo_draws';

function getAllDraws() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAllDraws(draws) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
}

function addDraw(draw) {
  const draws = getAllDraws();
  draws.push(draw);
  saveAllDraws(draws);
}

function getDrawsForGame(gameId) {
  return getAllDraws()
    .filter(d => d.gameId === gameId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getLastDrawForGame(gameId) {
  const draws = getDrawsForGame(gameId);
  return draws.length ? draws[0] : null;
}

// Avancement automatique du curseur : dès que 2 chiffres sont tapés dans une
// case, le focus passe automatiquement à la case suivante (et inversement
// avec "Retour arrière" sur une case vide, on revient à la précédente).
function setupAutoAdvance(prefix) {
  const inputs = [0, 1, 2, 3, 4].map(i => document.getElementById(`${prefix}${i}`));
  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 2);
      if (input.value.length === 2 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value === '' && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

setupAutoAdvance('num');
setupAutoAdvance('check-num');

// Jeu actuellement sélectionné à l'étape 1 (réutilisé dans les étapes 2,3,4)
let selectedGameId = null;

// ===== Navigation entre écrans =====
const screens = {
  home: document.getElementById('screen-home'),
  detail: document.getElementById('screen-detail'),
  admin: document.getElementById('screen-admin'),
  tools: document.getElementById('screen-tools'),
};
const headerTitle = document.getElementById('header-title');
const backBtn = document.getElementById('back-btn');
const adminBtn = document.getElementById('admin-btn');
const toolsBtn = document.getElementById('tools-btn');

function showScreen(name, title) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  headerTitle.textContent = title;
  backBtn.style.display = name === 'home' ? 'none' : 'inline-block';
  adminBtn.style.display = (name === 'admin') ? 'none' : 'inline-block';
  toolsBtn.style.display = (name === 'tools') ? 'none' : 'inline-block';
}

backBtn.addEventListener('click', () => renderHome());
adminBtn.addEventListener('click', () => renderAdmin());
toolsBtn.addEventListener('click', () => renderTools());

// ===== Écran Accueil : parcours guidé en 4 étapes =====
function renderHome() {
  const container = screens.home;

  container.innerHTML = `
    <div class="step-card" style="cursor:default; align-items:flex-start;">
      <div class="step-number">1</div>
      <div class="step-text" style="width:100%;">
        <div class="step-title">Choisir le jeu parmi les 12</div>
        <select id="home-game-select" style="margin-top:8px;">
          <option value="">-- Sélectionner un jeu --</option>
          ${GAMES.map(g => `<option value="${g.id}">${g.name} (${g.day} ${g.time})</option>`).join('')}
        </select>
        <div id="selected-game-info" style="margin-top:8px;"></div>
      </div>
    </div>

    <div class="step-card" id="step-2">
      <div class="step-number">2</div>
      <div class="step-text">
        <div class="step-title">Générer une combinaison de grilles</div>
        <div class="step-sub">Aléatoire, fréquents, écarts, mixte ou manuel</div>
      </div>
      <div class="chevron">›</div>
    </div>

    <div class="step-card" id="step-3">
      <div class="step-number">3</div>
      <div class="step-text">
        <div class="step-title">Saisir le résultat du tirage officiel</div>
        <div class="step-sub">Entre les 5 numéros gagnants après un tirage</div>
      </div>
      <div class="chevron">›</div>
    </div>

    <div class="step-card" id="step-4">
      <div class="step-number">4</div>
      <div class="step-text">
        <div class="step-title">Vérifier mes gains</div>
        <div class="step-sub">Compare ta grille jouée au résultat officiel</div>
      </div>
      <div class="chevron">›</div>
    </div>

    <div id="see-all-games" class="see-all-link">Voir les 12 jeux (tous les jours) ›</div>
  `;

  // ----- Étape 1 : choix d'un jeu parmi les 12 -----
  const select = document.getElementById('home-game-select');
  if (selectedGameId) select.value = selectedGameId;
  updateSelectedGameInfo();

  select.addEventListener('change', () => {
    selectedGameId = select.value || null;
    updateSelectedGameInfo();
  });

  function updateSelectedGameInfo() {
    const info = document.getElementById('selected-game-info');
    if (!selectedGameId) {
      info.innerHTML = '';
      return;
    }
    const game = GAMES.find(g => g.id === selectedGameId);
    const lastDraw = getLastDrawForGame(game.id);
    info.innerHTML = `
      <div class="card" style="margin:8px 0 0;">
        <div class="badge">${game.time.slice(0, 2)}h</div>
        <div class="card-info">
          <div class="name">${game.name}</div>
          <div class="sub">${
            lastDraw
              ? `Dernier résultat (${lastDraw.date}) : ${lastDraw.numbers.join(' - ')}`
              : `Tirage : ${game.day} à ${game.time} — pas encore de résultat`
          }</div>
        </div>
      </div>
    `;
  }

  // ----- Étapes 2, 3, 4 -----
  document.getElementById('step-2').addEventListener('click', () => renderTools('predictions'));
  document.getElementById('step-3').addEventListener('click', () => renderAdmin());
  document.getElementById('step-4').addEventListener('click', () => renderTools('check'));

  // ----- Lien vers la liste complète des 12 jeux -----
  document.getElementById('see-all-games').addEventListener('click', () => renderAllGames());

  showScreen('home', 'Loto Togo');
}

// Construit une carte d'affichage pour un jeu (réutilisée à plusieurs endroits)
function buildGameCard(game) {
  const lastDraw = getLastDrawForGame(game.id);
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="badge">${game.time.slice(0, 2)}h</div>
    <div class="card-info">
      <div class="name">${game.name}</div>
      <div class="sub">${
        lastDraw
          ? `Dernier résultat (${lastDraw.date}) : ${lastDraw.numbers.join(' - ')}`
          : `Tirage à ${game.time} — pas encore de résultat`
      }</div>
    </div>
    <div class="chevron">›</div>
  `;
  card.addEventListener('click', () => renderDetail(game));
  return card;
}

// ===== Écran liste complète des 12 jeux (accessible depuis l'accueil) =====
function renderAllGames() {
  const container = screens.detail; // on réutilise l'écran "detail" comme conteneur générique
  container.innerHTML = '';

  JOURS.forEach(jour => {
    const gamesDuJour = GAMES.filter(g => g.day === jour);
    if (gamesDuJour.length === 0) return;

    const title = document.createElement('div');
    title.className = 'day-title';
    title.textContent = jour;
    container.appendChild(title);

    gamesDuJour.forEach(game => container.appendChild(buildGameCard(game)));
  });

  showScreen('detail', 'Les 12 jeux');
}

// ===== Écran Détail d'un jeu =====
function renderDetail(game) {
  const container = screens.detail;
  const draws = getDrawsForGame(game.id);

  let historyHtml = '<div class="empty-msg">Aucun résultat enregistré pour ce jeu.</div>';
  if (draws.length > 0) {
    historyHtml = draws.map(d => `
      <div class="history-item">
        <div class="history-date">${d.date}</div>
        <div>${d.numbers.map(n => `<span class="num-circle">${n}</span>`).join('')}</div>
      </div>
    `).join('');
  }

  container.innerHTML = `
    <div class="info-banner">Tirage : ${game.day.toUpperCase()} à ${game.time}</div>
    ${historyHtml}
  `;

  showScreen('detail', game.name);
}

// ===== Écran Admin (saisie des résultats) =====
function renderAdmin() {
  const select = document.getElementById('admin-game-select');
  select.innerHTML = '<option value="">-- Sélectionner un jeu parmi les 12 --</option>';
  GAMES.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = `${g.name} (${g.day} ${g.time})`;
    select.appendChild(opt);
  });

  document.getElementById('admin-date').value = new Date().toISOString().slice(0, 10);
  [0, 1, 2, 3, 4].forEach(i => document.getElementById(`num${i}`).value = '');
  if (selectedGameId) select.value = selectedGameId;

  showScreen('admin', 'Saisir un résultat');
}

document.getElementById('save-draw-btn').addEventListener('click', () => {
  const gameId = document.getElementById('admin-game-select').value;
  const date = document.getElementById('admin-date').value;
  const numbers = [0, 1, 2, 3, 4].map(i => parseInt(document.getElementById(`num${i}`).value, 10));

  if (!gameId) {
    alert('Choisis un jeu avant de valider.');
    return;
  }
  if (!date) {
    alert('Choisis une date.');
    return;
  }
  if (numbers.some(n => isNaN(n) || n < 1 || n > 90)) {
    alert('Chaque numéro doit être entre 1 et 90.');
    return;
  }

  addDraw({ gameId, date, numbers });
  alert('Résultat enregistré !');
  renderHome();
});

// ===== Fonctions statistiques de base =====

// Renvoie les tirages filtrés selon le périmètre choisi ("all" ou un gameId)
function getDrawsForScope(scope) {
  const all = getAllDraws();
  return scope === 'all' ? all : all.filter(d => d.gameId === scope);
}

// Compte combien de fois chaque numéro (1 à 90) est sorti
function computeFrequencies(draws) {
  const freq = {};
  for (let n = 1; n <= 90; n++) freq[n] = 0;
  draws.forEach(d => d.numbers.forEach(n => freq[n] = (freq[n] || 0) + 1));
  return freq;
}

// Pour chaque numéro, calcule depuis combien de tirages il n'est pas ressorti
// (0 = sorti au dernier tirage, total = jamais sorti)
function computeEcarts(draws) {
  const sorted = draws.slice().sort((a, b) => a.date.localeCompare(b.date));
  const lastSeenIndex = {};
  sorted.forEach((d, idx) => d.numbers.forEach(n => { lastSeenIndex[n] = idx; }));
  const total = sorted.length;
  const ecarts = {};
  for (let n = 1; n <= 90; n++) {
    ecarts[n] = (lastSeenIndex[n] === undefined) ? total : (total - 1 - lastSeenIndex[n]);
  }
  return ecarts;
}

function pickTopN(scoreMap, n) {
  return Object.entries(scoreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([num]) => parseInt(num, 10));
}

// ===== Remplissage des listes déroulantes "jeu" pour les outils =====
function fillGameScopeSelect(selectEl) {
  GAMES.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.name;
    selectEl.appendChild(opt);
  });
}
fillGameScopeSelect(document.getElementById('pred-game-scope'));
fillGameScopeSelect(document.getElementById('counter-game-scope'));

// ===== Navigation entre les 3 onglets de l'écran Outils =====
function renderTools(initialTab) {
  document.getElementById('generated-grids').innerHTML = '';
  document.getElementById('check-result').innerHTML = '';
  refreshPredictionsInfo();
  renderCounterTable();
  fillCheckGameSelect();
  showScreen('tools', 'Outils & Statistiques');

  if (initialTab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${initialTab}"]`);
    if (btn) btn.classList.add('active');
    const content = document.getElementById('tab-' + initialTab);
    if (content) content.classList.add('active');
  }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ===== ONGLET PRÉDICTIONS =====
let manualSelection = new Set();

function generateRandomGrid() {
  const numbers = new Set();
  while (numbers.size < 5) numbers.add(Math.floor(Math.random() * 90) + 1);
  return Array.from(numbers).sort((a, b) => a - b);
}

function generateFrequentGrid(draws) {
  const freq = computeFrequencies(draws);
  // Parmi les 15 numéros les plus fréquents, on en pioche 5 au hasard
  const top15 = pickTopN(freq, 15);
  const shuffled = top15.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).sort((a, b) => a - b);
}

function generateEcartGrid(draws) {
  const ecarts = computeEcarts(draws);
  const top15 = pickTopN(ecarts, 15);
  const shuffled = top15.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).sort((a, b) => a - b);
}

function generateMixteGrid(draws) {
  const freq = computeFrequencies(draws);
  const ecarts = computeEcarts(draws);
  const topFreq = pickTopN(freq, 8);
  const topEcart = pickTopN(ecarts, 8);
  // On mélange 3 numéros fréquents + 2 numéros en retard
  const freqPick = topFreq.sort(() => Math.random() - 0.5).slice(0, 3);
  const ecartPick = topEcart.filter(n => !freqPick.includes(n)).sort(() => Math.random() - 0.5).slice(0, 2);
  const result = new Set([...freqPick, ...ecartPick]);
  while (result.size < 5) result.add(Math.floor(Math.random() * 90) + 1);
  return Array.from(result).sort((a, b) => a - b);
}

function generateManualGrid(preset) {
  const pool = Array.from(preset);
  // Si le réservoir choisi contient au moins 5 numéros, on tire 5 numéros
  // uniquement parmi ceux-ci. S'il en contient moins de 5, on complète avec
  // des numéros au hasard parmi les 90.
  if (pool.length >= 5) {
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).sort((a, b) => a - b);
  }
  const result = new Set(pool);
  while (result.size < 5) result.add(Math.floor(Math.random() * 90) + 1);
  return Array.from(result).sort((a, b) => a - b);
}

function buildNumberGrid() {
  const container = document.getElementById('number-grid');
  container.innerHTML = '';
  for (let n = 1; n <= 90; n++) {
    const btn = document.createElement('div');
    btn.className = 'num-btn';
    btn.textContent = n;
    btn.dataset.num = n;
    if (manualSelection.has(n)) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      if (manualSelection.has(n)) manualSelection.delete(n);
      else manualSelection.add(n);
      buildNumberGrid();
      updateManualCount();
    });
    container.appendChild(btn);
  }
}

function updateManualCount() {
  const n = manualSelection.size;
  document.getElementById('manual-selected-count').textContent =
    n === 0
      ? 'Aucun numéro sélectionné — choisis-en autant que tu veux'
      : `${n} numéro(s) sélectionné(s)` + (n >= 5 ? ' — chaque grille piochera 5 numéros parmi eux' : ' — il en manque pour atteindre 5, le reste sera complété au hasard');
}

function refreshPredictionsInfo() {
  const mode = document.getElementById('generator-mode').value;
  const scope = document.getElementById('pred-game-scope').value;
  const draws = getDrawsForScope(scope);

  document.getElementById('manual-picker').style.display = mode === 'manual' ? 'block' : 'none';
  document.getElementById('stats-info').style.display = (mode === 'frequent' || mode === 'ecart' || mode === 'mixte') ? 'block' : 'none';
  document.getElementById('stats-draw-count').textContent = draws.length;

  if (mode === 'manual') {
    manualSelection = new Set();
    buildNumberGrid();
    updateManualCount();
  }
}

document.getElementById('manual-reset-btn').addEventListener('click', () => {
  manualSelection = new Set();
  buildNumberGrid();
  updateManualCount();
});

document.getElementById('clear-grids-btn').addEventListener('click', () => {
  document.getElementById('generated-grids').innerHTML = '';
});

document.getElementById('generator-mode').addEventListener('change', refreshPredictionsInfo);
document.getElementById('pred-game-scope').addEventListener('change', refreshPredictionsInfo);

document.getElementById('generate-btn').addEventListener('click', () => {
  const mode = document.getElementById('generator-mode').value;
  const scope = document.getElementById('pred-game-scope').value;
  const count = parseInt(document.getElementById('generator-count').value, 10);
  const draws = getDrawsForScope(scope);
  const container = document.getElementById('generated-grids');
  container.innerHTML = '';

  if (mode === 'manual' && manualSelection.size === 0) {
    alert('Sélectionne au moins un numéro, ou choisis un autre mode.');
    return;
  }
  if ((mode === 'frequent' || mode === 'ecart' || mode === 'mixte') && draws.length === 0) {
    alert('Aucun historique enregistré pour ce périmètre : saisis d\'abord des résultats, ou choisis "Totalement aléatoire".');
    return;
  }

  for (let i = 0; i < count; i++) {
    let grid;
    if (mode === 'frequent') grid = generateFrequentGrid(draws);
    else if (mode === 'ecart') grid = generateEcartGrid(draws);
    else if (mode === 'mixte') grid = generateMixteGrid(draws);
    else if (mode === 'manual') grid = generateManualGrid(manualSelection);
    else grid = generateRandomGrid();

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-date">Grille n°${i + 1}</div>
      <div>${grid.map(n => `<span class="num-circle">${n}</span>`).join('')}</div>
    `;
    container.appendChild(item);
  }
});

// ===== ONGLET COMPTEUR =====
function renderCounterTable() {
  const scope = document.getElementById('counter-game-scope').value;
  const draws = getDrawsForScope(scope);
  document.getElementById('counter-draw-count').textContent = draws.length;

  const freq = computeFrequencies(draws);
  const ecarts = computeEcarts(draws);

  const numbers = Array.from({ length: 90 }, (_, i) => i + 1)
    .sort((a, b) => freq[b] - freq[a]);

  const container = document.getElementById('counter-table');
  container.innerHTML = numbers.map(n => `
    <div class="counter-row">
      <div class="cnum">${n}</div>
      <div class="cinfo">Écart : ${ecarts[n]} tirage(s) sans sortir</div>
      <div class="ccount">x${freq[n]}</div>
    </div>
  `).join('');
}
document.getElementById('counter-game-scope').addEventListener('change', renderCounterTable);

// ===== ONGLET VÉRIFIER GAINS =====
function fillCheckGameSelect() {
  const select = document.getElementById('check-game-select');
  select.innerHTML = '<option value="">-- Sélectionner un jeu --</option>';
  GAMES.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = `${g.name} (${g.day} ${g.time})`;
    select.appendChild(opt);
  });
  document.getElementById('check-draw-select').innerHTML = '<option value="">-- Choisis d\'abord un jeu --</option>';

  if (selectedGameId) {
    select.value = selectedGameId;
    select.dispatchEvent(new Event('change'));
  }
}

document.getElementById('check-game-select').addEventListener('change', () => {
  const gameId = document.getElementById('check-game-select').value;
  const drawSelect = document.getElementById('check-draw-select');
  drawSelect.innerHTML = '';
  if (!gameId) {
    drawSelect.innerHTML = '<option value="">-- Choisis d\'abord un jeu --</option>';
    return;
  }
  const draws = getDrawsForGame(gameId);
  if (draws.length === 0) {
    drawSelect.innerHTML = '<option value="">Aucun tirage enregistré pour ce jeu</option>';
    return;
  }
  drawSelect.innerHTML = draws.map((d, i) =>
    `<option value="${i}">${d.date} — ${d.numbers.join(', ')}</option>`
  ).join('');
});

// Calcule le nombre de "paires" gagnées selon le nombre de bons numéros
function getPaires(matchCount) {
  const table = { 5: 10, 4: 6, 3: 3, 2: 2, 1: 0, 0: 0 };
  return table[matchCount] ?? 0;
}

document.getElementById('check-btn').addEventListener('click', () => {
  const gameId = document.getElementById('check-game-select').value;
  const drawIndex = document.getElementById('check-draw-select').value;
  const played = [0, 1, 2, 3, 4].map(i => parseInt(document.getElementById(`check-num${i}`).value, 10));

  if (!gameId || drawIndex === '') {
    alert('Choisis un jeu et un tirage à comparer.');
    return;
  }
  if (played.some(n => isNaN(n) || n < 1 || n > 90)) {
    alert('Entre tes 5 numéros joués (entre 1 et 90).');
    return;
  }

  const draws = getDrawsForGame(gameId);
  const draw = draws[parseInt(drawIndex, 10)];
  const matches = played.filter(n => draw.numbers.includes(n));
  const paires = getPaires(matches.length);
  const isWinning = matches.length >= 1;

  const banner = matches.length >= 2
    ? `<div class="match-result-banner" style="background:#e8f5e9; color:#1B5E20; display:flex; align-items:center; gap:8px;">
         <span class="blinking-dot"></span>
         🎉 ${matches.length} bon(s) numéro(s) — ${paires} paire(s) gagnée(s) !
       </div>`
    : `<div class="match-result-banner" style="background:#f5f5f5; color:#555; display:flex; align-items:center; gap:8px;">
         ${isWinning ? '<span class="blinking-dot"></span>' : ''}
         ${matches.length} bon(s) numéro(s) — ${paires} paire(s) gagnée(s)
       </div>`;

  document.getElementById('check-result').innerHTML = `
    ${banner}
    <div class="history-item">
      <div class="history-date">Tirage officiel (${draw.date})</div>
      <div>${draw.numbers.map(n => `<span class="num-circle ${matches.includes(n) ? 'match-good' : ''}" style="${matches.includes(n) ? 'background:#FFD700; color:#1B5E20;' : ''}">${n}</span>`).join('')}</div>
    </div>
    <div class="history-item">
      <div class="history-date">Ta grille jouée</div>
      <div>${played.map(n => `<span class="num-circle" style="${draw.numbers.includes(n) ? 'background:#FFD700; color:#1B5E20;' : ''}">${n}</span>`).join('')}</div>
    </div>
    <div class="info-banner" style="margin-top:10px; font-size:13px;">
      <strong>Barème des paires :</strong><br/>
      5 bons numéros = 10 paires · 4 bons = 6 paires · 3 bons = 3 paires ·
      2 bons = 2 paires · 1 bon = 0 paire
    </div>
  `;
});

// ===== Démarrage de l'application =====
renderHome();

// ===== Activation du mode hors-ligne (Service Worker) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}
