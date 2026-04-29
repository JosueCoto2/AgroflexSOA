# ============================================================
#  PASO 3 — Reintento automático: crear servidor en Oracle Cloud
#
#  Este script intenta crear tu instancia cada 2 minutos
#  hasta que Oracle tenga capacidad disponible.
#
#  ANTES DE EJECUTAR, llena las 2 variables de abajo.
#  Si no sabes cómo, ejecuta primero:
#    .\scripts\3a-obtener-datos.ps1
#  Ese script busca los valores automáticamente y te los muestra.
# ============================================================

# ── CONFIGURA ESTO ──────────────────────────────────────────
# Pega aquí el valor que te mostró el script 3a-obtener-datos.ps1

$SUBNET_OCID = "PEGAR_AQUI_EL_SUBNET_OCID"

# Ruta a tu llave SSH pública (.pub) que descargaste de Oracle
# Cámbiala si guardaste el archivo en otro lugar
$SSH_KEY_PUB = "$env:USERPROFILE\Downloads\ssh-key-agroflex.pub"

# ── NO CAMBIES NADA DE AQUI PARA ABAJO ──────────────────────

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AgroFlex — Reintento automático de VM" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Validar que el archivo de llave SSH existe
if (-not (Test-Path $SSH_KEY_PUB)) {
    Write-Host "ERROR: No se encontró el archivo de llave SSH en:" -ForegroundColor Red
    Write-Host "  $SSH_KEY_PUB" -ForegroundColor Red
    Write-Host ""
    Write-Host "Busca el archivo .pub que descargaste de Oracle Cloud" -ForegroundColor Yellow
    Write-Host "y actualiza la variable SSH_KEY_PUB en este script." -ForegroundColor Yellow
    exit 1
}

# Validar que el SUBNET_OCID fue llenado
if ($SUBNET_OCID -eq "PEGAR_AQUI_EL_SUBNET_OCID") {
    Write-Host "ERROR: No llenaste el SUBNET_OCID." -ForegroundColor Red
    Write-Host "Ejecuta primero:  .\scripts\3a-obtener-datos.ps1" -ForegroundColor Yellow
    exit 1
}

# Obtener datos automáticamente
Write-Host "Obteniendo datos de tu cuenta Oracle..." -ForegroundColor Yellow

$tenancy   = (oci iam tenancy get --tenancy-id (oci iam region-subscription list | ConvertFrom-Json).data[0]."tenancy-id" 2>$null | ConvertFrom-Json).data.id
$compartId = $tenancy  # En free tier el compartment raíz = tenancy

$adList    = (oci iam availability-domain list --compartment-id $compartId | ConvertFrom-Json).data
$AD        = $adList[0].name

$imageList = (oci compute image list `
    --compartment-id $compartId `
    --operating-system "Canonical Ubuntu" `
    --operating-system-version "22.04" `
    --shape "VM.Standard.A1.Flex" `
    --sort-by TIMECREATED `
    --sort-order DESC `
    --limit 1 | ConvertFrom-Json).data

$IMAGE_OCID = $imageList[0].id

if (-not $IMAGE_OCID) {
    Write-Host "ERROR: No se encontró la imagen Ubuntu 22.04." -ForegroundColor Red
    Write-Host "Verifica que OCI CLI está configurado correctamente." -ForegroundColor Yellow
    exit 1
}

Write-Host "  Availability Domain : $AD" -ForegroundColor Green
Write-Host "  Imagen Ubuntu 22.04 : $IMAGE_OCID" -ForegroundColor Green
Write-Host "  Subnet              : $SUBNET_OCID" -ForegroundColor Green
Write-Host "  SSH Key             : $SSH_KEY_PUB" -ForegroundColor Green
Write-Host ""
Write-Host "Iniciando reintentos cada 2 minutos..." -ForegroundColor Yellow
Write-Host "Puedes dejar esta ventana minimizada." -ForegroundColor Gray
Write-Host "Suena una alarma cuando el servidor se cree." -ForegroundColor Gray
Write-Host "Presiona Ctrl+C para cancelar." -ForegroundColor Gray
Write-Host ""

$intento = 1

while ($true) {
    $hora = Get-Date -Format "HH:mm:ss"
    Write-Host "[$hora] Intento #$intento — creando instancia..." -ForegroundColor Cyan

    $shapeConfig = '{"ocpus": 4, "memoryInGBs": 24}'

    $resultado = oci compute instance launch `
        --availability-domain $AD `
        --compartment-id $compartId `
        --shape "VM.Standard.A1.Flex" `
        --shape-config $shapeConfig `
        --image-id $IMAGE_OCID `
        --subnet-id $SUBNET_OCID `
        --assign-public-ip true `
        --ssh-authorized-keys-file $SSH_KEY_PUB `
        --display-name "agroflex-server" `
        --wait-for-state RUNNING 2>&1

    $resultadoStr = $resultado | Out-String

    if ($resultadoStr -match "capacity" -or $resultadoStr -match "ServiceError" -or $resultadoStr -match "500") {
        Write-Host "  Sin capacidad. Esperando 2 minutos..." -ForegroundColor Yellow
        $intento++
        Start-Sleep -Seconds 120

    } elseif ($resultadoStr -match "Error" -or $resultadoStr -match "error") {
        Write-Host "  Error inesperado:" -ForegroundColor Red
        Write-Host "  $resultadoStr" -ForegroundColor Red
        Write-Host "  Reintentando en 2 minutos..." -ForegroundColor Yellow
        $intento++
        Start-Sleep -Seconds 120

    } else {
        # ¡Éxito!
        $instance   = $resultado | ConvertFrom-Json
        $instanceId = $instance.data.id

        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "  SERVIDOR CREADO EN EL INTENTO #$intento!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green

        # Sonido de alerta
        1..5 | ForEach-Object {
            [System.Console]::Beep(1000, 300)
            Start-Sleep -Milliseconds 100
        }

        # Obtener IP pública
        Write-Host "Obteniendo IP pública..." -ForegroundColor Cyan
        Start-Sleep -Seconds 15
        $vnics    = oci compute instance list-vnics --instance-id $instanceId | ConvertFrom-Json
        $publicIp = $vnics.data[0]."public-ip"

        Write-Host ""
        Write-Host "  IP del servidor: $publicIp" -ForegroundColor Green
        Write-Host ""
        Write-Host "Para conectarte, abre PowerShell y ejecuta:" -ForegroundColor White
        Write-Host "  ssh -i $env:USERPROFILE\Downloads\ssh-key-agroflex.key ubuntu@$publicIp" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Cuando estés conectado, ejecuta el siguiente paso:" -ForegroundColor White
        Write-Host "  .\scripts\4-deploy-en-servidor.sh" -ForegroundColor Yellow
        Write-Host ""
        break
    }
}
