Set-Location "$PSScriptRoot\backend"
if (!(Test-Path ".env")) { Copy-Item ".env.example" ".env"; Write-Host "Edit backend\.env and add your Gemini API key, then run this script again."; notepad ".env"; exit }
if (!(Test-Path ".venv")) { py -3 -m venv .venv }
& ".\.venv\Scripts\Activate.ps1"
python -m pip install -r requirements.txt
python manage.py runserver 127.0.0.1:8000
