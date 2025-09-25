param(
  [int]$Port = 8000
)

Write-Host "Starting local server on http://localhost:$Port (Ctrl+C to stop)" -ForegroundColor Green

# Prefer 'python' if available, else try 'py'
if (Get-Command python -ErrorAction SilentlyContinue) {
  python -m http.server $Port
}
elseif (Get-Command py -ErrorAction SilentlyContinue) {
  py -m http.server $Port
}
else {
  Write-Error "Python not found. Please install Python 3 or use another static file server."
}
