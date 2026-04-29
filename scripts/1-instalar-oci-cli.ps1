# ============================================================
#  PASO 1 — Instalar OCI CLI (solo se ejecuta una vez)
#
#  Abre PowerShell como Administrador y ejecuta:
#  Set-ExecutionPolicy Bypass -Scope Process -Force
#  .\scripts\1-instalar-oci-cli.ps1
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Instalando OCI CLI para Windows..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Descargar instalador oficial de Oracle
$installerPath = "$env:TEMP\install-oci.ps1"
Write-Host "Descargando instalador..." -ForegroundColor Yellow
Invoke-WebRequest `
    -Uri "https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.ps1" `
    -OutFile $installerPath

# Instalar sin preguntas
Write-Host "Instalando (puede tardar 2-3 minutos)..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File $installerPath --accept-all-defaults

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  OCI CLI instalado correctamente!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "SIGUIENTE PASO: Cierra esta ventana de PowerShell," -ForegroundColor White
Write-Host "abre una NUEVA y ejecuta el script 2:" -ForegroundColor White
Write-Host ""
Write-Host "  .\scripts\2-configurar-oci.ps1" -ForegroundColor Yellow
Write-Host ""
