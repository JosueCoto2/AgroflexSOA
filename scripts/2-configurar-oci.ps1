# ============================================================
#  PASO 2 — Conectar OCI CLI con tu cuenta de Oracle
#
#  Necesitas tener a la mano (los encuentras en Oracle Cloud):
#
#  • Tu USER OCID:
#    Haz clic en tu avatar (arriba a la derecha) → "User settings"
#    Copia el OCID que aparece abajo del nombre
#
#  • Tu TENANCY OCID:
#    Haz clic en tu avatar → "Tenancy: joscot222"
#    Copia el OCID
#
#  • Región: escribe exactamente →  mx-queretaro-1
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configurando tu cuenta OCI CLI..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se va a abrir un asistente que te hace 5 preguntas." -ForegroundColor White
Write-Host "Responde así:" -ForegroundColor White
Write-Host ""
Write-Host "  Enter a location for your config: (presiona Enter para default)" -ForegroundColor Gray
Write-Host "  User OCID:    pega tu User OCID" -ForegroundColor Gray
Write-Host "  Tenancy OCID: pega tu Tenancy OCID" -ForegroundColor Gray
Write-Host "  Region:       escribe  mx-queretaro-1" -ForegroundColor Gray
Write-Host "  Generate new API signing key pair? Y (presiona Enter)" -ForegroundColor Gray
Write-Host "  Key passphrase: (presiona Enter para dejar vacío)" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

oci setup config

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Configuración guardada!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "AHORA DEBES subir la clave pública a Oracle Cloud:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a Oracle Cloud → tu avatar → 'User settings'" -ForegroundColor White
Write-Host "2. En el menú izquierdo haz clic en 'API keys'" -ForegroundColor White
Write-Host "3. Haz clic en 'Add API key'" -ForegroundColor White
Write-Host "4. Selecciona 'Paste a public key'" -ForegroundColor White
Write-Host "5. Abre este archivo y copia todo su contenido:" -ForegroundColor White
Write-Host ""
Write-Host "   $env:USERPROFILE\.oci\oci_api_key_public.pem" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. Pégalo en Oracle y haz clic en 'Add'" -ForegroundColor White
Write-Host ""
Write-Host "Cuando termines, ejecuta el script 3:" -ForegroundColor Yellow
Write-Host "  .\scripts\3-reintentar-servidor.ps1" -ForegroundColor Yellow
Write-Host ""
