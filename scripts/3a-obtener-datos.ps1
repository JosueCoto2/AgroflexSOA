# ============================================================
#  PASO 3a — Obtener datos de tu cuenta Oracle automáticamente
#
#  Este script busca el Subnet OCID que necesitas para el
#  script 3-reintentar-servidor.ps1
#
#  Ejecuta DESPUÉS de haber hecho el script 2 (configurar OCI CLI)
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Buscando datos de tu cuenta Oracle..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Obtener Tenancy/Compartment
$tenancy = (oci iam tenancy get `
    --tenancy-id (oci iam region-subscription list | ConvertFrom-Json).data[0]."tenancy-id" `
    2>$null | ConvertFrom-Json).data.id

if (-not $tenancy) {
    Write-Host "ERROR: No se pudo conectar con Oracle Cloud." -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "  1. Ejecutaste el script 2-configurar-oci.ps1" -ForegroundColor White
    Write-Host "  2. Subiste la clave API en Oracle Cloud (User settings → API keys)" -ForegroundColor White
    exit 1
}

Write-Host "Tenancy/Compartment OCID: $tenancy" -ForegroundColor Green

# Buscar VCNs
Write-Host ""
Write-Host "Buscando redes (VCNs) en tu cuenta..." -ForegroundColor Yellow
$vcns = (oci network vcn list --compartment-id $tenancy | ConvertFrom-Json).data

if ($vcns.Count -eq 0) {
    Write-Host ""
    Write-Host "No se encontraron VCNs." -ForegroundColor Red
    Write-Host "Necesitas crear una red primero." -ForegroundColor Yellow
    Write-Host "Intenta ejecutar el wizard de creación de instancia en Oracle Cloud" -ForegroundColor White
    Write-Host "hasta el paso de Networking — eso crea la VCN automáticamente." -ForegroundColor White
} else {
    Write-Host "VCNs encontradas:" -ForegroundColor Green
    $vcns | ForEach-Object {
        Write-Host "  - $($_.displayName) : $($_.id)" -ForegroundColor White
    }

    # Buscar subnets de la primera VCN
    $vcnId = $vcns[0].id
    Write-Host ""
    Write-Host "Buscando subnets en '$($vcns[0].displayName)'..." -ForegroundColor Yellow
    $subnets = (oci network subnet list --compartment-id $tenancy --vcn-id $vcnId | ConvertFrom-Json).data

    if ($subnets.Count -eq 0) {
        Write-Host "No se encontraron subnets." -ForegroundColor Red
    } else {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "  COPIA ESTE VALOR para el script 3:" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host ""
        $subnets | ForEach-Object {
            Write-Host "  SUBNET_OCID = `"$($_.id)`"" -ForegroundColor Yellow
            Write-Host "  Nombre: $($_.displayName)" -ForegroundColor Gray
            Write-Host ""
        }
    }
}

Write-Host "Listo. Ahora abre el script 3-reintentar-servidor.ps1," -ForegroundColor White
Write-Host "pega el SUBNET_OCID arriba y ejecútalo." -ForegroundColor White
Write-Host ""
