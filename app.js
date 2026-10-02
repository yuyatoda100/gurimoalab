// --- GAME DATA DEFINITIONS ---

// All Elements (Total: 31)
const ELEMENTS = {
  // Tier 1
  FIRE: { id: 'FIRE', name: '火', tier: 1, color: '#ff4d4d' },
  WATER: { id: 'WATER', name: '水', tier: 1, color: '#3399ff' },
  WIND: { id: 'WIND', name: '風', tier: 1, color: '#55ff99' },
  EARTH: { id: 'EARTH', name: '土', tier: 1, color: '#cc9966' },

  // Tier 2 (12 Types)
  STEAM: { id: 'STEAM', name: '蒸気', tier: 2, color: '#e6f2ff' },
  HOT_MP: { id: 'HOT_MP', name: '熱湯マナ', tier: 2, color: '#ff66b2' },
  THUNDER: { id: 'THUNDER', name: '雷', tier: 2, color: '#ffff33' },
  BLAZE: { id: 'BLAZE', name: '爆炎', tier: 2, color: '#ff3300' },
  LAVA: { id: 'LAVA', name: '溶岩', tier: 2, color: '#ff6600' },
  ASH: { id: 'ASH', name: '灰', tier: 2, color: '#888888' },
  ICE: { id: 'ICE', name: '氷', tier: 2, color: '#99ffff' },
  BUBBLE: { id: 'BUBBLE', name: '泡沫', tier: 2, color: '#b3e6ff' },
  FLORA: { id: 'FLORA', name: '樹木', tier: 2, color: '#33cc33' },
  CLAY: { id: 'CLAY', name: '粘土', tier: 2, color: '#b37700' },
  SAND: { id: 'SAND', name: '砂利', tier: 2, color: '#e6c280' },
  STONE: { id: 'STONE', name: '風化石', tier: 2, color: '#a6a6a6' },

  // Tier 3 (15 Types)
  PLUME: { id: 'PLUME', name: '過熱気体', tier: 3, color: '#ff99ff' },
  HIGH_STEAM: { id: 'HIGH_STEAM', name: '高圧蒸気', tier: 3, color: '#cce6ff' },
  MIST: { id: 'MIST', name: '濃霧', tier: 3, color: '#d9d9d9' },
  ATHANOR: { id: 'ATHANOR', name: '生命液', tier: 3, color: '#00ffcc' },
  SILICON: { id: 'SILICON', name: '珪素', tier: 3, color: '#e6ffff' },
  MAGMA_SPARK: { id: 'MAGMA_SPARK', name: '熔雷', tier: 3, color: '#ff3399' },
  CHARGE_ICE: { id: 'CHARGE_ICE', name: '帯電氷晶', tier: 3, color: '#00ffff' },
  PHASE: { id: 'PHASE', name: '位相空間', tier: 3, color: '#cc66ff' },
  PIEZO: { id: 'PIEZO', name: '圧電体', tier: 3, color: '#ffff99' },
  OBSIDIAN: { id: 'OBSIDIAN', name: '黒曜石', tier: 3, color: '#331a00' },
  CHARCOAL: { id: 'CHARCOAL', name: '炭', tier: 3, color: '#404040' },
  STEEL: { id: 'STEEL', name: 'エーテル鋼', tier: 3, color: '#b3c6ff' },
  FROST_WOOD: { id: 'FROST_WOOD', name: '凍木', tier: 3, color: '#66ffe6' },
  CRYSTAL: { id: 'CRYSTAL', name: '結晶', tier: 3, color: '#ffffff' },
  AMBER: { id: 'AMBER', name: '琥珀', tier: 3, color: '#ffbf00' },
};

// Craft Recipes (1:1 Combinations)
const RECIPES = [
  // Tier 2
  { in: ['FIRE', 'WATER'], out: 'STEAM' },
  { in: ['FIRE', 'WIND'], out: 'THUNDER' },
  { in: ['FIRE', 'EARTH'], out: 'LAVA' },
  { in: ['WATER', 'WIND'], out: 'ICE' },
  { in: ['WATER', 'EARTH'], out: 'FLORA' },
  { in: ['WIND', 'EARTH'], out: 'SAND' },

  // Tier 3 (6C2 = 15 Combinations)
  { in: ['STEAM', 'THUNDER'], out: 'PLUME' },
  { in: ['STEAM', 'LAVA'], out: 'HIGH_STEAM' },
  { in: ['STEAM', 'ICE'], out: 'MIST' },
  { in: ['STEAM', 'FLORA'], out: 'ATHANOR' },
  { in: ['STEAM', 'SAND'], out: 'SILICON' },
  { in: ['THUNDER', 'LAVA'], out: 'MAGMA_SPARK' },
  { in: ['THUNDER', 'ICE'], out: 'CHARGE_ICE' },
  { in: ['THUNDER', 'FLORA'], out: 'PHASE' },
  { in: ['THUNDER', 'SAND'], out: 'PIEZO' },
  { in: ['LAVA', 'ICE'], out: 'OBSIDIAN' },
  { in: ['LAVA', 'FLORA'], out: 'CHARCOAL' },
  { in: ['LAVA', 'SAND'], out: 'STEEL' },
  { in: ['ICE', 'FLORA'], out: 'FROST_WOOD' },
  { in: ['ICE', 'SAND'], out: 'CRYSTAL' },
  { in: ['FLORA', 'SAND'], out: 'AMBER' },
];

// --- ENGINE & STATE ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let state = {
  mp: 100,
  maxMp: 100,
  tps: 2.0,
  mode: 'select', // select, node, collector, factory
  selectedNode: null,
  connectingNode: null,
  dragOffset: { x: 0, y: 0 },
  isPanning: false,
  panStart: { x: 0, y: 0 },
  camera: { x: 0, y: 0, zoom: 1 },
  discovered: new Set(['FIRE', 'WATER', 'WIND', 'EARTH']),
  gameCleared: false
};

let nodes = [];
let lines = [];
let biomes = [];

// Init Canvas Size
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- INITIAL MAP SETUP ---
function initMap() {
  state.camera.x = canvas.width / 2;
  state.camera.y = canvas.height / 2;

  // Add Center Core (Grand Crucible)
  const core = {
    id: 'CORE',
    type: 'core',
    x: 0,
    y: 0,
    radius: 40,
    inputs: new Set(),
    output: null
  };
  nodes.push(core);

  // Generate Resource Biomes
  const types = ['FIRE', 'WATER', 'WIND', 'EARTH'];
  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  for (let i = 0; i < 4; i++) {
    const dist = 350;
    biomes.push({
      x: Math.cos(angles[i]) * dist,
      y: Math.sin(angles[i]) * dist,
      radius: 80,
      type: types[i]
    });
  }
}
initMap();

// --- GAME LOOP ---
let lastTime = performance.now();
function gameLoop(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// --- UPDATE LOGIC ---
function update(dt) {
  if (state.gameCleared) return;

  // MP Regeneration
  state.mp = Math.min(state.maxMp, state.mp + state.tps * dt);

  // Nodes Production & Transfer
  nodes.forEach(node => {
    if (node.type === 'collector') {
      const biome = biomes.find(b => Math.hypot(b.x - node.x, b.y - node.y) < b.radius);
      if (biome) {
        node.output = biome.type;
        state.discovered.add(biome.type);
      }
    } else if (node.type === 'factory') {
      // Check inputs to craft recipe
      const inputList = Array.from(node.inputs);
      const recipe = RECIPES.find(r => {
        return r.in.length === inputList.length && r.in.every(elem => inputList.includes(elem));
      });
      if (recipe) {
        node.output = recipe.out;
        state.discovered.add(recipe.out);
      } else {
        node.output = null;
      }
    } else if (node.type === 'core') {
      // Core receives all elements
      nodes.forEach(n => {
        lines.forEach(l => {
          if (l.to === 'CORE' && l.from === n.id && n.output) {
            node.inputs.add(n.output);
          }
        });
      });
    }
  });

  // Transfer outputs through connected lines
  lines.forEach(line => {
    const fromNode = nodes.find(n => n.id === line.from);
    const toNode = nodes.find(n => n.id === line.to);
    if (fromNode && toNode && fromNode.output) {
      if (toNode.type === 'factory' || toNode.type === 'core') {
        toNode.inputs.add(fromNode.output);
      } else if (toNode.type === 'node') {
        toNode.output = fromNode.output;
      }
    }
  });

  // UI Updates
  document.getElementById('mp-display').innerText = `${Math.floor(state.mp)} / ${state.maxMp}`;
  document.getElementById('tps-display').innerText = `+${state.tps.toFixed(1)} MP/s`;
  document.getElementById('discovered-display').innerText = `${state.discovered.size} / 31`;

  // Check Game Clear Conditions
  const coreNode = nodes.find(n => n.type === 'core');
  if (coreNode && coreNode.inputs.size >= 31 && state.mp >= 100) {
    triggerClear();
  }
}

function triggerClear() {
  state.gameCleared = true;
  document.getElementById('clear-modal').style.display = 'flex';
}

function meditate() {
  state.mp = Math.min(state.maxMp, state.mp + 5);
}

// --- RENDER LOGIC ---
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // Camera transform
  ctx.translate(state.camera.x, state.camera.y);
  ctx.scale(state.camera.zoom, state.camera.zoom);

  // Draw Grid Lines (Alchemy Background Grid)
  drawGrid();

  // Draw Biomes
  biomes.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = ELEMENTS[b.type].color + '22';
    ctx.strokeStyle = ELEMENTS[b.type].color + '88';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = ELEMENTS[b.type].color;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${ELEMENTS[b.type].name} 霊脈`, b.x, b.y + 5);
  });

  // Draw Lines (Magic Connections)
  lines.forEach(l => {
    const fn = nodes.find(n => n.id === l.from);
    const tn = nodes.find(n => n.id === l.to);
    if (!fn || !tn) return;

    ctx.beginPath();
    ctx.moveTo(fn.x, fn.y);
    ctx.lineTo(tn.x, tn.y);
    
    const activeColor = fn.output ? ELEMENTS[fn.output].color : '#45f3ff';
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = fn.output ? 3 : 1;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = fn.output ? 10 : 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // Draw Connecting Drag Line
  if (state.connectingNode) {
    const mouseWorld = screenToWorld(lastMouse.x, lastMouse.y);
    ctx.beginPath();
    ctx.moveTo(state.connectingNode.x, state.connectingNode.y);
    ctx.lineTo(mouseWorld.x, mouseWorld.y);
    ctx.strokeStyle = '#ffff33';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw Nodes
  nodes.forEach(n => {
    ctx.beginPath();
    const r = n.radius || 18;
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);

    if (n.type === 'core') {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ffeb3b';
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = n.output ? ELEMENTS[n.output].color + '44' : '#1f2833';
      ctx.strokeStyle = state.selectedNode === n ? '#ffffff' : (n.output ? ELEMENTS[n.output].color : '#45f3ff');
      ctx.lineWidth = state.selectedNode === n ? 3 : 2;
      ctx.shadowBlur = 0;
    }

    ctx.fill();
    ctx.stroke();

    // Node Icons / Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    let label = n.type === 'core' ? '大賢者の炉' : (n.output ? ELEMENTS[n.output].name : n.type);
    ctx.fillText(label, n.x, n.y + 4);

    if (n.type === 'core') {
      ctx.font = '10px monospace';
      ctx.fillStyle = '#ffeb3b';
      ctx.fillText(`${n.inputs.size} / 31`, n.x, n.y + 20);
    }
  });

  ctx.restore();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(69, 243, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 100;
  const size = 3000;
  for (let x = -size; x <= size; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, -size); ctx.lineTo(x, size); ctx.stroke();
  }
  for (let y = -size; y <= size; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(-size, y); ctx.lineTo(size, y); ctx.stroke();
  }
}

// --- INPUT HANDLERS ---
let lastMouse = { x: 0, y: 0 };
let isRightDrag = false;

function screenToWorld(sx, sy) {
  return {
    x: (sx - state.camera.x) / state.camera.zoom,
    y: (sy - state.camera.y) / state.camera.zoom
  };
}

canvas.addEventListener('mousedown', e => {
  const world = screenToWorld(e.clientX, e.clientY);
  const clickedNode = nodes.find(n => Math.hypot(n.x - world.x, n.y - world.y) < (n.radius || 18));

  if (e.button === 2 || e.shiftKey) { // Right Click or Shift+Left Click for line draw
    isRightDrag = true;
    if (clickedNode) state.connectingNode = clickedNode;
    return;
  }

  if (e.button === 0) { // Left Click
    if (state.mode === 'select') {
      if (clickedNode) {
        state.selectedNode = clickedNode;
        updatePanel(clickedNode);
      } else {
        state.isPanning = true;
        state.panStart = { x: e.clientX - state.camera.x, y: e.clientY - state.camera.y };
      }
    } else {
      // Build Node
      const costs = { node: 10, collector: 25, factory: 50 };
      const cost = costs[state.mode] || 0;

      if (state.mp >= cost) {
        state.mp -= cost;
        const newNode = {
          id: 'node_' + Date.now(),
          type: state.mode,
          x: world.x,
          y: world.y,
          inputs: new Set(),
          output: null
        };
        nodes.push(newNode);
        state.selectedNode = newNode;
        updatePanel(newNode);
      }
    }
  }
});

canvas.addEventListener('mousemove', e => {
  lastMouse = { x: e.clientX, y: e.clientY };

  if (state.isPanning) {
    state.camera.x = e.clientX - state.panStart.x;
    state.camera.y = e.clientY - state.panStart.y;
  }
});

canvas.addEventListener('mouseup', e => {
  if (isRightDrag && state.connectingNode) {
    const world = screenToWorld(e.clientX, e.clientY);
    const targetNode = nodes.find(n => Math.hypot(n.x - world.x, n.y - world.y) < (n.radius || 18));
    
    if (targetNode && targetNode !== state.connectingNode) {
      lines.push({ from: state.connectingNode.id, to: targetNode.id });
    }
    state.connectingNode = null;
    isRightDrag = false;
  }
  state.isPanning = false;
});

canvas.addEventListener('wheel', e => {
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  state.camera.zoom = Math.max(0.3, Math.min(2.5, state.camera.zoom * zoomFactor));
});

canvas.addEventListener('contextmenu', e => e.preventDefault());

// --- UI CONTROL ---
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('#toolbar .btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-${mode}`).classList.add('active');
}

function updatePanel(node) {
  const title = document.getElementById('panel-title');
  const content = document.getElementById('panel-content');

  title.innerText = node.type.toUpperCase();
  let html = `<b>ID:</b> ${node.id}<br><b>位置:</b> (${Math.round(node.x)}, ${Math.round(node.y)})<br>`;
  
  if (node.type === 'collector') {
    html += `<br><b>状態:</b> 基礎エレメントを採取中<br><b>出力:</b> ${node.output ? ELEMENTS[node.output].name : 'なし (バイオーム上に配置してください)'}`;
  } else if (node.type === 'factory') {
    const inputsList = Array.from(node.inputs).map(i => ELEMENTS[i].name).join(', ') || 'なし';
    html += `<br><b>供給中の入力:</b> ${inputsList}<br><b>調合生成物:</b> ${node.output ? ELEMENTS[node.output].name : '未合致 (1:1組み合わせが必要)'}`;
  } else if (node.type === 'core') {
    html += `<br><b>供給済エレメント数:</b> ${node.inputs.size} / 31<br>全31種類のエレメントを同時に接続供給してください。`;
  }

  content.innerHTML = html;
}