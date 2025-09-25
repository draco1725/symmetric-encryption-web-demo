// Symmetric Encryption Demo using Web Crypto (AES-GCM + PBKDF2)

// ---------- Utilities ----------
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBytes(str) { return textEncoder.encode(str); }
function fromBytes(buf) { return textDecoder.decode(buf); }

function bytesToBase64(bytes) {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin);
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

function randomBytes(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

// ---------- Key Derivation (PBKDF2 -> AES-GCM 256) ----------
async function deriveKeyFromPassword(password, saltB, iterations = 150000) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    toBytes(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltB, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ---------- Encrypt / Decrypt ----------
async function encryptWithPassword(plaintext, password) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKeyFromPassword(password, salt);
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    toBytes(plaintext)
  );
  return {
    saltB64: bytesToBase64(salt),
    ivB64: bytesToBase64(iv),
    ciphertextB64: bytesToBase64(cipherBuf),
  };
}

async function decryptWithPassword(ciphertextB64, password, saltB64, ivB64) {
  const salt = new Uint8Array(base64ToBytes(saltB64));
  const iv = new Uint8Array(base64ToBytes(ivB64));
  const key = await deriveKeyFromPassword(password, salt);
  const cipherBuf = base64ToBytes(ciphertextB64);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf);
  return fromBytes(plainBuf);
}

// ---------- DOM Wiring ----------
const els = {
  password: document.getElementById('password'),
  plaintext: document.getElementById('plaintext'),
  salt: document.getElementById('salt'),
  iv: document.getElementById('iv'),
  ciphertext: document.getElementById('ciphertext'),
  decrypted: document.getElementById('decrypted'),
  btnEncrypt: document.getElementById('btn-encrypt'),
  btnDecrypt: document.getElementById('btn-decrypt'),
};

els.btnEncrypt.addEventListener('click', async () => {
  clearOutput();
  const pw = els.password.value || '';
  const pt = els.plaintext.value || '';
  if (!pw) return alert('Please enter a password.');
  if (!pt) return alert('Please enter plaintext to encrypt.');
  try {
    const { saltB64, ivB64, ciphertextB64 } = await encryptWithPassword(pt, pw);
    els.salt.value = saltB64;
    els.iv.value = ivB64;
    els.ciphertext.value = ciphertextB64;
  } catch (err) {
    console.error(err);
    alert('Encryption failed: ' + (err && err.message ? err.message : err));
  }
});

els.btnDecrypt.addEventListener('click', async () => {
  els.decrypted.value = '';
  const pw = els.password.value || '';
  const ct = els.ciphertext.value || '';
  const saltB64 = els.salt.value || '';
  const ivB64 = els.iv.value || '';
  if (!pw || !ct || !saltB64 || !ivB64) return alert('Please provide password, ciphertext, salt, and IV.');
  try {
    const plain = await decryptWithPassword(ct, pw, saltB64, ivB64);
    els.decrypted.value = plain;
  } catch (err) {
    console.error(err);
    alert('Decryption failed: ' + (err && err.message ? err.message : err));
  }
});

function clearOutput() {
  els.ciphertext.value = '';
  els.decrypted.value = '';
}

// ---------- Visual FX: Matrix background, text scramble, panel flash ----------
(function setupMatrixCanvas() {
  const canvas = document.getElementById('matrix');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, columns, drops;
  const glyphs = 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-/<>=';
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / 16);
    drops = Array(columns).fill(0);
  }
  function draw() {
    ctx.fillStyle = 'rgba(0, 10, 20, 0.08)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#00ff9c';
    ctx.font = '14px monospace';
    for (let i = 0; i < drops.length; i++) {
      const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      ctx.fillText(ch, i * 16, drops[i] * 16);
      if (drops[i] * 16 > height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize();
  draw();
})();

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.frame = 0;
    this.queue = [];
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.textContent;
    const length = Math.max(oldText.length, newText.length);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end, char: '' });
    }
    cancelAnimationFrame(this.raf);
    this.frame = 0;
    this.update();
  }
  update() {
    let output = '';
    let complete = 0;
    for (const item of this.queue) {
      if (this.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) item.char = this.randomChar();
        output += item.char;
      } else {
        output += item.from;
      }
    }
    this.el.textContent = output;
    if (complete === this.queue.length) return;
    this.frame++;
    this.raf = requestAnimationFrame(this.update);
  }
  randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
}

(function initScramble() {
  const title = document.querySelector('.glow-title');
  if (title) {
    const scrambler = new TextScramble(title);
    const text = title.dataset.scramble || title.textContent;
    setTimeout(() => scrambler.setText(text), 300);
  }
})();

function flashPanels() {
  document.querySelectorAll('.panel').forEach((p) => {
    p.classList.add('flash');
    setTimeout(() => p.classList.remove('flash'), 500);
  });
}

if (els && els.btnEncrypt) els.btnEncrypt.addEventListener('click', flashPanels);
if (els && els.btnDecrypt) els.btnDecrypt.addEventListener('click', flashPanels);
