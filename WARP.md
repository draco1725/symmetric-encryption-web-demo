# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Static, browser-based demo of password-derived symmetric encryption using Web Crypto (AES-GCM with a PBKDF2-derived key).
- No build, lint, or test tooling is configured; files are served statically.
- Runs locally on http://localhost:8000/.

Commonly used commands
- Start local server (Windows PowerShell):
```powershell path=null start=null
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
  - Use a custom port:
```powershell path=null start=null
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 9000
```
- Alternative (if Python is available in PATH):
```powershell path=null start=null
python -m http.server 8000
```
  - Or with the Windows Python launcher:
```powershell path=null start=null
py -m http.server 8000
```
- Open the app in your default browser (PowerShell):
```powershell path=null start=null
Start-Process http://localhost:8000/
```

High-level architecture and data flow
- index.html: Defines the UI and form fields for password and plaintext, Base64 parameters (salt, IV), and outputs (ciphertext, decrypted text). Loads app.js.
- app.js:
  - Utilities: byte/string conversions, Base64 encode/decode, secure random bytes.
  - Key derivation: deriveKeyFromPassword(password, salt, iterations=150000) → PBKDF2 (SHA-256) → AES-GCM 256-bit CryptoKey.
  - Encryption: encryptWithPassword(plaintext, password)
    - Generates salt (16 bytes) and IV (12 bytes), derives key, encrypts, returns Base64 salt/iv/ciphertext.
  - Decryption: decryptWithPassword(ciphertextB64, password, saltB64, ivB64)
    - Re-derives key from password+salt and decrypts with the provided IV; returns plaintext string.
  - DOM wiring: Binds Encrypt/Decrypt buttons to the above functions and manages form fields; surfaces errors via alert and console.
- styles.css: Presentational styling only; no logic.
- serve.ps1: Convenience script to host the static files on a local HTTP server (prefers python, falls back to py).

Operational notes
- Web Crypto API requires a secure context; localhost is considered secure and works for this demo.
- AES-GCM provides confidentiality and integrity; IVs must not be reused with the same key. This demo generates a fresh IV per encryption.
- All cryptography happens client-side in the browser; no backend is involved.
