# Symmetric Encryption Web Demo

This is a simple static webpage that demonstrates how symmetric encryption (AES-GCM) works in the browser using the Web Crypto API. It runs locally on http://localhost:8000.

What you can do:
- Enter plaintext and a password
- Derive an AES key from the password via PBKDF2 (SHA-256)
- Encrypt to produce ciphertext, IV, and salt (all Base64)
- Decrypt using the same password, IV, and salt

Notes:
- Web Crypto requires a secure context, but localhost is considered secure, so this works locally.
- AES-GCM provides confidentiality and integrity. Do not reuse IVs with the same key.
- This demo is for educational purposes and not a drop-in for production.

## Run locally

Option A: Use the provided PowerShell script (Windows):

    powershell -ExecutionPolicy Bypass -File .\serve.ps1

Option B: Use Python directly (if available in PATH):

    python -m http.server 8000

or (using the Python launcher):

    py -m http.server 8000

Then open your browser at:

    http://localhost:8000/

## Files
- index.html — UI page
- styles.css — basic styling
- app.js — encryption/decryption logic (AES-GCM, PBKDF2)
- serve.ps1 — starts a local server on port 8000

## How it works (high level)
1. A random 16-byte salt and a 12-byte IV are generated.
2. PBKDF2 derives a 256-bit AES key from your password, salt, and iteration count.
3. AES-GCM encrypts your plaintext with the derived key and IV.
4. Outputs are displayed in Base64. To decrypt, the same password, salt, and IV must be used.
