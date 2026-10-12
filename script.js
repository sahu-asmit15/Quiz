/* ========================================
   CellQuest — Interactive Quiz Logic
   ======================================== */

// ========================
// QUIZ DATA
// ========================
const quizData = [
  {
    id: 1,
    question: "Which organelle is mainly responsible for lipid synthesis, detoxification, and calcium storage?",
    options: ["Rough ER", "Smooth ER", "Golgi apparatus", "Lysosome"],
    correct: 1,
    explanation: "Smooth ER has no ribosomes (so it's \"smooth\"). It makes lipids, breaks down toxins, and stores calcium.",
    organelle: "smooth-er",
    label: "Smooth Endoplasmic Reticulum"
  },
  {
    id: 2,
    question: "Which coat protein complex packages cargo leaving the ER toward the Golgi?",
    options: ["COPI", "COPII", "Clathrin", "SNARE"],
    correct: 1,
    explanation: "COPII is for forward movement, ER → Golgi. A coat protein is a protein shell that wraps around a vesicle (a tiny membrane bubble carrying cargo). COPI is for the return trip.",
    organelle: "vesicle",
    label: "Vesicular Trafficking (ER → Golgi)"
  },
  {
    id: 3,
    question: "Which organelle contains acidic hydrolytic enzymes that digest macromolecules and recycle damaged parts?",
    options: ["Vacuole", "Smooth ER", "Lysosome", "ERGIC"],
    correct: 2,
    explanation: "Lysosomes are acidic compartments filled with hydrolytic enzymes that break bonds using water. The acidic pH is the condition these enzymes need to work.",
    organelle: "lysosome",
    label: "Lysosome"
  },
  {
    id: 4,
    question: "In Cystic Fibrosis, what happens to the mutated CFTR protein during ER quality control?",
    options: [
      "It is secreted directly outside the cell",
      "It is retained in the ER and sent for degradation",
      "It bypasses quality control and piles up in the Golgi",
      "It becomes an ion channel in the sarcoplasmic reticulum"
    ],
    correct: 1,
    explanation: "The ER checks proteins for correct folding (quality control). The mutated CFTR is misfolded, so it is held back and destroyed instead of reaching the cell membrane.",
    organelle: "er-qc",
    label: "ER Quality Control"
  },
  {
    id: 5,
    question: "What is the correct order of steps in vesicular trafficking?",
    options: [
      "Docking → Fusion → Budding → Transport",
      "Budding → Transport → Docking → Fusion",
      "Fusion → Budding → Transport → Docking",
      "Transport → Docking → Budding → Fusion"
    ],
    correct: 1,
    explanation: "The vesicle buds off the donor compartment, travels through the cytoplasm, docks on the target membrane, then fuses to release its cargo.",
    organelle: "trafficking",
    label: "Vesicular Trafficking Pathway"
  }
];

// ========================
// STATE
// ========================
let currentQuestion = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let correctCount = 0;
let answered = 0;
let userAnswers = [];

// ========================
// DOM REFS
// ========================
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ========================
// PARTICLE BACKGROUND
// ========================
function initParticles() {
  const canvas = $('#particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.1;
      const colors = ['56,189,248', '167,139,250', '34,211,238', '52,211,153'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }

  animate();
}

// ========================
// CELL ANIMATION (START)
// ========================
function initCellAnimation() {
  const canvas = $('#cell-anim');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.015;

    // Outer cell membrane
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    for (let a = 0; a <= Math.PI * 2; a += 0.02) {
      const r = 130 + Math.sin(a * 4 + t) * 6 + Math.cos(a * 3 - t * 0.5) * 4;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Dashed orbit
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Nucleus
    const nGrad = ctx.createRadialGradient(cx - 25, cy - 10, 10, cx - 25, cy - 10, 55);
    nGrad.addColorStop(0, 'rgba(167, 139, 250, 0.25)');
    nGrad.addColorStop(1, 'rgba(167, 139, 250, 0.05)');
    ctx.beginPath();
    ctx.fillStyle = nGrad;
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.arc(cx - 25, cy - 10, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '600 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Nucleus', cx - 25, cy - 6);

    // ER (wavy lines)
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const startY = cy + 30 + i * 14;
      for (let x = cx + 10; x < cx + 90; x += 2) {
        const y = startY + Math.sin((x - cx) * 0.15 + t + i) * 5;
        x === cx + 10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(34,211,238,0.7)';
    ctx.font = '600 10px Inter';
    ctx.fillText('ER', cx + 55, cy + 25);

    // Golgi (stacked arcs)
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(cx + 70, cy - 50 + i * 12, 25 - i * 3, -0.6 + Math.sin(t + i * 0.3) * 0.1, Math.PI + 0.6 + Math.sin(t + i * 0.3) * 0.1);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(251,191,36,0.7)';
    ctx.font = '600 10px Inter';
    ctx.fillText('Golgi', cx + 70, cy - 65);

    // Mitochondria
    const mx = cx - 80 + Math.sin(t * 0.7) * 5;
    const my = cy + 60 + Math.cos(t * 0.5) * 3;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(0.4);
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 14, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const mGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
    mGrad.addColorStop(0, 'rgba(248, 113, 113, 0.15)');
    mGrad.addColorStop(1, 'rgba(248, 113, 113, 0.03)');
    ctx.fillStyle = mGrad;
    ctx.fill();
    // Cristae
    ctx.strokeStyle = 'rgba(248,113,113,0.3)';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 8, -10);
      ctx.quadraticCurveTo(i * 8 + 4, 0, i * 8, 10);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(248,113,113,0.7)';
    ctx.font = '600 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Mito', mx, my - 22);

    // Lysosome
    const lx = cx + 30 + Math.cos(t * 0.6) * 4;
    const ly = cy + 85 + Math.sin(t * 0.4) * 3;
    ctx.beginPath();
    ctx.arc(lx, ly, 16, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const lGrad = ctx.createRadialGradient(lx, ly, 2, lx, ly, 16);
    lGrad.addColorStop(0, 'rgba(52, 211, 153, 0.2)');
    lGrad.addColorStop(1, 'rgba(52, 211, 153, 0.03)');
    ctx.fillStyle = lGrad;
    ctx.fill();
    ctx.fillStyle = 'rgba(52,211,153,0.7)';
    ctx.font = '600 9px Inter';
    ctx.fillText('Lyso', lx, ly + 4);

    // Vesicles floating
    for (let i = 0; i < 5; i++) {
      const va = t * 0.6 + i * (Math.PI * 2 / 5);
      const vr = 95 + Math.sin(t + i) * 8;
      const vx = cx + Math.cos(va) * vr;
      const vy = cy + Math.sin(va) * vr;
      ctx.beginPath();
      ctx.arc(vx, vy, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + Math.sin(t + i * 2) * 0.15})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
}

// ========================
// ORGANELLE CANVAS PER QUESTION
// ========================
function drawOrganelle(type) {
  const canvas = $('#organelle-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  let t = 0;

  // Clear any previous animation
  if (window._organelleAnim) cancelAnimationFrame(window._organelleAnim);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.02;

    switch (type) {
      case 'smooth-er':
        drawSmoothER(ctx, W, H, t);
        break;
      case 'vesicle':
        drawVesicleTraffic(ctx, W, H, t);
        break;
      case 'lysosome':
        drawLysosome(ctx, W, H, t);
        break;
      case 'er-qc':
        drawERQC(ctx, W, H, t);
        break;
      case 'trafficking':
        drawTrafficking(ctx, W, H, t);
        break;
    }

    window._organelleAnim = requestAnimationFrame(draw);
  }

  draw();
}

function drawSmoothER(ctx, W, H, t) {
  const cx = W / 2, cy = H / 2;

  // Tubular network
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    const baseY = cy - 40 + i * 18;
    for (let x = 40; x < W - 40; x += 2) {
      const y = baseY + Math.sin((x) * 0.04 + t + i * 0.8) * 12 + Math.cos(x * 0.02 - t * 0.5) * 6;
      x === 40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Lipid droplets
  for (let i = 0; i < 8; i++) {
    const angle = t * 0.4 + i * (Math.PI * 2 / 8);
    const r = 60 + Math.sin(t + i) * 15;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * (r * 0.5);
    ctx.beginPath();
    ctx.arc(x, y, 5 + Math.sin(t + i * 3) * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + Math.sin(t + i) * 0.2})`;
    ctx.fill();
  }

  // Ca²⁺ ions
  ctx.font = '700 11px Inter';
  ctx.fillStyle = 'rgba(167, 139, 250, 0.7)';
  for (let i = 0; i < 4; i++) {
    const x = 60 + i * 60 + Math.sin(t + i * 2) * 8;
    const y = 30 + Math.cos(t * 0.8 + i) * 10;
    ctx.fillText('Ca²⁺', x, y);
  }
}

function drawVesicleTraffic(ctx, W, H, t) {
  const cx = W / 2, cy = H / 2;

  // ER (left)
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const y = cy - 30 + i * 16;
    for (let x = 20; x < 100; x += 2) {
      const yy = y + Math.sin(x * 0.12 + t + i) * 5;
      x === 20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(34,211,238,0.7)';
  ctx.font = '700 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('ER', 60, cy + 50);

  // Golgi (right)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(W - 70, cy - 10 + i * 14, 30 - i * 4, -0.5 + Math.sin(t + i * 0.3) * 0.1, Math.PI + 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(251,191,36,0.7)';
  ctx.fillText('Golgi', W - 70, cy + 50);

  // COPII vesicle moving ER → Golgi
  const progress = (Math.sin(t * 0.8) + 1) / 2;
  const vx = 110 + progress * (W - 190);
  const vy = cy - 10 + Math.sin(t * 2) * 8;
  ctx.beginPath();
  ctx.arc(vx, vy, 10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // COPII label on vesicle
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '700 9px Inter';
  ctx.fillText('COPII', vx, vy + 3);

  // Arrow path
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(110, cy - 10);
  ctx.lineTo(W - 110, cy - 10);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawLysosome(ctx, W, H, t) {
  const cx = W / 2, cy = H / 2;

  // Main lysosome body
  const r = 55 + Math.sin(t) * 3;
  const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
  grad.addColorStop(0, 'rgba(52, 211, 153, 0.2)');
  grad.addColorStop(0.7, 'rgba(52, 211, 153, 0.08)');
  grad.addColorStop(1, 'rgba(52, 211, 153, 0.02)');
  ctx.beginPath();
  for (let a = 0; a <= Math.PI * 2; a += 0.05) {
    const rr = r + Math.sin(a * 6 + t) * 4;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // pH indicator
  ctx.fillStyle = 'rgba(248, 113, 113, 0.8)';
  ctx.font = '800 14px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('pH ~4.5', cx, cy - 5);

  // Enzyme dots
  for (let i = 0; i < 12; i++) {
    const angle = t * 0.5 + i * (Math.PI * 2 / 12);
    const er = 25 + Math.sin(t * 2 + i) * 10;
    const ex = cx + Math.cos(angle) * er;
    const ey = cy + Math.sin(angle) * er;
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + Math.sin(t + i) * 0.3})`;
    ctx.fill();
  }

  // Digesting particle
  const dp = (Math.sin(t * 0.6) + 1) / 2;
  const dpSize = 12 - dp * 8;
  if (dpSize > 2) {
    ctx.beginPath();
    ctx.arc(cx + 10, cy + 15, dpSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(167, 139, 250, ${0.4 - dp * 0.3})`;
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(52,211,153,0.6)';
  ctx.font = '600 10px Inter';
  ctx.fillText('Hydrolytic Enzymes', cx, cy + r + 20);
}

function drawERQC(ctx, W, H, t) {
  const cx = W / 2, cy = H / 2;

  // ER membrane
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(30, 30, W - 60, H - 60, 20);
  ctx.stroke();
  ctx.fillStyle = 'rgba(34, 211, 238, 0.03)';
  ctx.fill();

  ctx.fillStyle = 'rgba(34,211,238,0.6)';
  ctx.font = '700 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('ER Lumen', cx, 50);

  // Chaperone (checker)
  ctx.beginPath();
  ctx.arc(cx - 50, cy - 10, 18, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
  ctx.fill();
  ctx.fillStyle = 'rgba(56,189,248,0.8)';
  ctx.font = '600 9px Inter';
  ctx.fillText('QC', cx - 50, cy - 7);

  // Misfolded CFTR protein (wiggly)
  ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const px = cx + 30;
  const py = cy - 15;
  for (let i = 0; i < 20; i++) {
    const x = px + i * 5;
    const y = py + Math.sin(i * 0.8 + t * 3) * 8;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(248,113,113,0.8)';
  ctx.font = '600 10px Inter';
  ctx.fillText('Misfolded CFTR ✕', cx + 55, py - 15);

  // Degradation arrow
  const arrowY = cy + 40;
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + 55, cy + 5);
  ctx.lineTo(cx + 55, arrowY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Proteasome
  ctx.beginPath();
  ctx.arc(cx + 55, arrowY + 18, 15, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(251,191,36,0.08)';
  ctx.fill();

  // Proteasome mouth
  const mouthOpen = 4 + Math.sin(t * 3) * 2;
  ctx.strokeStyle = 'rgba(251,191,36,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + 45, arrowY + 18 - mouthOpen);
  ctx.lineTo(cx + 42, arrowY + 18);
  ctx.lineTo(cx + 45, arrowY + 18 + mouthOpen);
  ctx.stroke();

  ctx.fillStyle = 'rgba(251,191,36,0.7)';
  ctx.font = '600 9px Inter';
  ctx.fillText('Degradation', cx + 55, arrowY + 40);
}

function drawTrafficking(ctx, W, H, t) {
  const cx = W / 2, cy = H / 2;

  // Steps
  const steps = ['Budding', 'Transport', 'Docking', 'Fusion'];
  const stepColors = [
    'rgba(56, 189, 248, 0.7)',
    'rgba(167, 139, 250, 0.7)',
    'rgba(251, 191, 36, 0.7)',
    'rgba(52, 211, 153, 0.7)'
  ];
  const stepBgs = [
    'rgba(56, 189, 248, 0.1)',
    'rgba(167, 139, 250, 0.1)',
    'rgba(251, 191, 36, 0.1)',
    'rgba(52, 211, 153, 0.1)'
  ];

  const stepWidth = (W - 60) / 4;

  for (let i = 0; i < 4; i++) {
    const sx = 30 + i * stepWidth + stepWidth / 2;

    // Circle
    const pulse = 20 + Math.sin(t + i * 1.5) * 3;
    ctx.beginPath();
    ctx.arc(sx, cy - 20, pulse, 0, Math.PI * 2);
    ctx.fillStyle = stepBgs[i];
    ctx.fill();
    ctx.strokeStyle = stepColors[i];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Step number
    ctx.fillStyle = stepColors[i];
    ctx.font = '800 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(i + 1, sx, cy - 15);

    // Label
    ctx.fillStyle = stepColors[i];
    ctx.font = '700 11px Inter';
    ctx.fillText(steps[i], sx, cy + 15);

    // Arrow to next
    if (i < 3) {
      const arrowProgress = (Math.sin(t * 1.5 + i) + 1) / 2;
      ctx.strokeStyle = `rgba(255,255,255,${0.15 + arrowProgress * 0.15})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + pulse + 5, cy - 20);
      ctx.lineTo(sx + stepWidth - pulse - 5, cy - 20);
      ctx.stroke();

      // Arrowhead
      const ax = sx + stepWidth - pulse - 5;
      ctx.beginPath();
      ctx.moveTo(ax, cy - 25);
      ctx.lineTo(ax + 6, cy - 20);
      ctx.lineTo(ax, cy - 15);
      ctx.strokeStyle = `rgba(255,255,255,${0.2 + arrowProgress * 0.2})`;
      ctx.stroke();
    }
  }

  // Moving vesicle indicator
  const activeStep = Math.floor((t * 0.5) % 4);
  const sx = 30 + activeStep * stepWidth + stepWidth / 2;
  ctx.beginPath();
  ctx.arc(sx, cy + 40, 4, 0, Math.PI * 2);
  ctx.fillStyle = stepColors[activeStep];
  ctx.fill();

  // Donor / Target labels
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '600 10px Inter';
  ctx.fillText('Donor Compartment', 30 + stepWidth / 2, H - 20);
  ctx.fillText('Target Membrane', W - 30 - stepWidth / 2, H - 20);
}

// ========================
// QUIZ FLOW
// ========================
function startQuiz() {
  // Reset
  currentQuestion = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  correctCount = 0;
  answered = 0;
  userAnswers = [];

  showScreen('quiz-screen');
  renderQuestion();
}

function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`#${id}`);
  target.classList.add('active');
  // Re-trigger animation
  target.style.animation = 'none';
  target.offsetHeight; // reflow
  target.style.animation = '';
}

function renderQuestion() {
  const q = quizData[currentQuestion];

  // Update stats
  updateStats();

  // Progress
  $('#progress-fill').style.width = `${((currentQuestion) / quizData.length) * 100}%`;
  $('#progress-text').textContent = `${currentQuestion + 1} / ${quizData.length}`;

  // Question
  $('#q-number').textContent = `Q${q.id}`;
  $('#q-text').textContent = q.question;

  // Organelle visual
  $('#organelle-label').textContent = q.label;
  drawOrganelle(q.organelle);

  // Options
  const letters = ['A', 'B', 'C', 'D'];
  const grid = $('#options-grid');
  grid.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.id = `option-${i}`;
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => handleAnswer(i));
    grid.appendChild(btn);
  });

  // Hide explanation & next
  $('#explanation-card').classList.add('hidden');
  $('#next-btn').classList.add('hidden');

  // Animate card in
  const card = $('#question-card');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'fadeSlideUp 0.4s ease forwards';
}

function handleAnswer(selected) {
  const q = quizData[currentQuestion];
  const buttons = $$('.option-btn');
  const isCorrect = selected === q.correct;

  answered++;

  // Disable all buttons
  buttons.forEach(btn => btn.classList.add('disabled'));

  // Highlight correct
  buttons[q.correct].classList.add('correct');

  let pointsEarned = 0;

  if (isCorrect) {
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    correctCount++;
    pointsEarned = 100 + streak * 20;
    score += pointsEarned;

    // Score pop animation
    const scoreEl = $('#stat-score');
    scoreEl.classList.add('score-pop');
    setTimeout(() => scoreEl.classList.remove('score-pop'), 400);

    // 🎉 CONFETTI BURST ANIMATION
    launchConfetti();
    showFeedbackIndicator(true, pointsEarned);
    showScreenFlash(true);
  } else {
    buttons[selected].classList.add('wrong');
    streak = 0;

    // 💥 SHOCKWAVE ANIMATION
    launchShockwave();
    showFeedbackIndicator(false, 0);
    showScreenFlash(false);
  }

  userAnswers.push({ questionIndex: currentQuestion, selected, isCorrect });

  updateStats();

  // Delay showing explanation to let the animation play
  setTimeout(() => {
    // Show explanation
    const expCard = $('#explanation-card');
    expCard.classList.remove('hidden');
    $('#explanation-icon').textContent = isCorrect ? '✅' : '❌';
    const titleEl = $('#explanation-title');
    titleEl.textContent = isCorrect ? 'Correct!' : 'Incorrect';
    titleEl.className = `explanation-title ${isCorrect ? 'correct-title' : 'wrong-title'}`;
    $('#explanation-text').textContent = q.explanation;

    // Show next button
    const nextBtn = $('#next-btn');
    nextBtn.classList.remove('hidden');
    $('#next-btn-text').textContent = currentQuestion < quizData.length - 1 ? 'Next Question' : 'View Results';

    // Smooth scroll to explanation
    expCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 600);
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    renderQuestion();
    // Scroll to top of quiz
    $('#quiz-screen').scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    showResults();
  }
}

function updateStats() {
  $('#stat-score').textContent = score;
  $('#stat-streak').textContent = `${streak} 🔥`;
  const acc = answered > 0 ? Math.round((correctCount / answered) * 100) : 100;
  $('#stat-accuracy').textContent = `${acc}%`;
}

// ========================
// RESULTS
// ========================
function showResults() {
  showScreen('results-screen');

  const acc = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;

  // Icon & title
  let icon = '🏆';
  let title = 'Quiz Complete!';
  if (acc === 100) { icon = '🌟'; title = 'Perfect Score!'; }
  else if (acc >= 80) { icon = '🎉'; title = 'Excellent Work!'; }
  else if (acc >= 60) { icon = '👍'; title = 'Good Job!'; }
  else { icon = '📚'; title = 'Keep Studying!'; }

  $('#results-icon').textContent = icon;
  $('#results-title').textContent = title;

  $('#result-score').textContent = score;
  $('#result-correct').textContent = `${correctCount}/${quizData.length}`;
  $('#result-accuracy').textContent = `${acc}%`;
  $('#result-streak').textContent = `${bestStreak} 🔥`;

  // Breakdown
  const breakdown = $('#breakdown');
  breakdown.innerHTML = '';
  userAnswers.forEach((ua, i) => {
    const q = quizData[ua.questionIndex];
    const letters = ['A', 'B', 'C', 'D'];
    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.innerHTML = `
      <div class="breakdown-status ${ua.isCorrect ? 'correct-bg' : 'wrong-bg'}">
        ${ua.isCorrect ? '✅' : '❌'}
      </div>
      <div class="breakdown-info">
        <div class="breakdown-q">Q${i + 1}. ${q.question.substring(0, 80)}${q.question.length > 80 ? '...' : ''}</div>
        <div class="breakdown-answer">
          ${ua.isCorrect ? '' : `Your answer: ${letters[ua.selected]}. ${q.options[ua.selected]} · `}
          Correct: <span>${letters[q.correct]}. ${q.options[q.correct]}</span>
        </div>
      </div>
    `;
    breakdown.appendChild(div);
  });
}

function restartQuiz() {
  startQuiz();
}

// ========================
// CONFETTI PARTICLE SYSTEM
// ========================
function launchConfetti() {
  const overlay = $('#feedback-overlay');
  const canvas = $('#feedback-canvas');
  overlay.classList.remove('hidden');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const particles = [];
  const PARTICLE_COUNT = 80;
  const colors = [
    '#34d399', '#22d3ee', '#38bdf8', '#a78bfa',
    '#fbbf24', '#fb923c', '#f472b6', '#818cf8'
  ];
  const shapes = ['circle', 'rect', 'star'];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: canvas.height / 2 + (Math.random() - 0.5) * 60,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      gravity: 0.12 + Math.random() * 0.08,
      friction: 0.98,
      opacity: 1,
      fadeRate: 0.008 + Math.random() * 0.008
    });
  }

  let animId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity -= p.fadeRate;

      if (p.opacity <= 0) return;
      alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        drawStar(ctx, 0, 0, 5, p.size / 2, p.size / 4);
      }

      ctx.restore();
    });

    if (alive) {
      animId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      overlay.classList.add('hidden');
    }
  }

  animate();

  // Auto-cleanup after 2s
  setTimeout(() => {
    cancelAnimationFrame(animId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    overlay.classList.add('hidden');
  }, 2000);
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

// ========================
// SHOCKWAVE ANIMATION
// ========================
function launchShockwave() {
  // Create 2 expanding rings
  for (let i = 0; i < 2; i++) {
    setTimeout(() => {
      const ring = document.createElement('div');
      ring.className = 'shockwave';
      document.body.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove());
    }, i * 150);
  }
}

// ========================
// FEEDBACK INDICATOR
// ========================
function showFeedbackIndicator(isCorrect, points) {
  const indicator = $('#feedback-indicator');
  const emoji = $('#feedback-emoji');
  const label = $('#feedback-label');
  const pointsEl = $('#feedback-points');

  // Clear previous
  indicator.className = 'feedback-indicator';
  void indicator.offsetHeight; // force reflow

  if (isCorrect) {
    const emojis = ['🎉', '✨', '🌟', '💪', '🔥'];
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    label.textContent = 'Correct!';
    label.className = 'feedback-label correct-label';
    pointsEl.textContent = `+${points} pts`;
    pointsEl.style.display = 'block';
    indicator.classList.add('show-correct');
  } else {
    const emojis = ['😬', '💔', '❌', '😤'];
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    label.textContent = 'Wrong!';
    label.className = 'feedback-label wrong-label';
    pointsEl.style.display = 'none';
    indicator.classList.add('show-wrong');
  }

  // Auto-remove class after animation
  setTimeout(() => {
    indicator.className = 'feedback-indicator';
  }, isCorrect ? 1100 : 900);
}

// ========================
// SCREEN FLASH
// ========================
function showScreenFlash(isCorrect) {
  const flash = document.createElement('div');
  flash.className = isCorrect ? 'correct-flash' : 'wrong-flash';
  document.body.appendChild(flash);
  flash.addEventListener('animationend', () => flash.remove());
}

// ========================
// INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCellAnimation();
});
