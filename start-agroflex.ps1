#Requires -Version 5.1
param([switch]$SkipBuilt)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ROOT     = 'C:\xampp\htdocs\AgroflexSOA'
$BACKEND  = "$ROOT\agroflex-backend"
$FRONTEND = "$ROOT\agroflex-frontend"

# --- Servicios ---------------------------------------------------------------

$svcEureka  = @{ Name='Eureka';        Label='AgroFlex - Eureka :8761';         Port=8761; Color='Cyan';
                 Jar="$BACKEND\agroflex-eureka-server\target\agroflex-eureka-server-1.0.0.jar" }
$svcGateway = @{ Name='Gateway';       Label='AgroFlex - Gateway :8080';        Port=8080; Color='Magenta';
                 Jar="$BACKEND\agroflex-gateway\target\agroflex-gateway-1.0.0.jar" }
$svcAuth    = @{ Name='Auth';          Label='AgroFlex - Auth :8081';           Port=8081; Color='Green';
                 Jar="$BACKEND\agroflex-auth-service\target\agroflex-auth-service-1.0.0.jar" }
$svcCatalog = @{ Name='Catalog';       Label='AgroFlex - Catalog :8082';        Port=8082; Color='Yellow';
                 Jar="$BACKEND\agroflex-catalog-service\target\agroflex-catalog-service-1.0.0.jar" }
$svcUsers   = @{ Name='Users';         Label='AgroFlex - Users :8083';          Port=8083; Color='Cyan';
                 Jar="$BACKEND\agroflex-users-service\target\agroflex-users-service-1.0.0.jar" }
$svcOrders  = @{ Name='Orders';        Label='AgroFlex - Orders :8084';         Port=8084; Color='Blue';
                 Jar="$BACKEND\agroflex-orders-service\target\agroflex-orders-service-1.0.0.jar" }
$svcPayments= @{ Name='Payments';      Label='AgroFlex - Payments :8085';       Port=8085; Color='Green';
                 Jar="$BACKEND\agroflex-payments-service\target\agroflex-payments-service-1.0.0.jar" }
$svcQR      = @{ Name='QR';            Label='AgroFlex - QR :8086';             Port=8086; Color='Yellow';
                 Jar="$BACKEND\agroflex-qr-service\target\agroflex-qr-service-1.0.0.jar" }
$svcGeo     = @{ Name='Geolocation';   Label='AgroFlex - Geolocation :8087';    Port=8087; Color='Blue';
                 Jar="$BACKEND\agroflex-geolocation-service\target\agroflex-geolocation-service-1.0.0.jar" }
$svcNotif   = @{ Name='Notifications'; Label='AgroFlex - Notifications :8088';  Port=8088; Color='Cyan';
                 Jar="$BACKEND\agroflex-notifications-service\target\agroflex-notifications-service-1.0.0.jar" }
$svcAdmin   = @{ Name='Admin';         Label='AgroFlex - Admin :8089';          Port=8089; Color='Magenta';
                 Jar="$BACKEND\agroflex-admin-service\target\agroflex-admin-service-1.0.0.jar" }
$svcFront   = @{ Name='Frontend';      Label='AgroFlex - Frontend :5173';       Port=5173; Color='Blue' }

# Orden de arranque: Eureka primero, Gateway último antes del frontend
$backendServices = @(
    $svcEureka,
    $svcAuth,
    $svcCatalog,
    $svcUsers,
    $svcOrders,
    $svcPayments,
    $svcQR,
    $svcGeo,
    $svcNotif,
    $svcAdmin,
    $svcGateway
)

# --- Helpers -----------------------------------------------------------------

function Test-PortOpen {
    param([int]$Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $r   = $tcp.BeginConnect('127.0.0.1', $Port, $null, $null)
        $ok  = $r.AsyncWaitHandle.WaitOne(500)
        $tcp.Close()
        return $ok
    }
    catch { return $false }
}

function Wait-ServiceReady {
    param([string]$Name, [int]$Port, [int]$TimeoutSec = 90)
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    Write-Host "    Esperando $Name (:$Port)" -NoNewline -ForegroundColor DarkGray
    $dots = 0
    while ((Get-Date) -lt $deadline) {
        if (Test-PortOpen -Port $Port) {
            Write-Host ' listo' -ForegroundColor Green
            return $true
        }
        Start-Sleep -Milliseconds 800
        $dots++
        if ($dots % 5 -eq 0) { Write-Host '.' -NoNewline -ForegroundColor DarkGray }
    }
    Write-Host ' TIMEOUT' -ForegroundColor Red
    return $false
}

function Start-JavaService {
    param([string]$Label, [string]$JarPath, [string]$WorkDir)
    $safeLabel = $Label -replace "'", "''"
    $cmd = "`$host.UI.RawUI.WindowTitle = '$safeLabel'; " +
           "java -jar '$JarPath'; " +
           "Write-Host 'Servicio detenido. Presiona Enter para cerrar...' -ForegroundColor Red; " +
           "Read-Host"
    Start-Process powershell.exe `
        -ArgumentList '-NoExit', '-Command', $cmd `
        -WorkingDirectory $WorkDir `
        -WindowStyle Normal
}

function Start-FrontendService {
    param([string]$Label, [string]$FrontendDir)
    $safeLabel = $Label -replace "'", "''"
    $cmd = "`$host.UI.RawUI.WindowTitle = '$safeLabel'; " +
           "npm run dev; " +
           "Write-Host 'Frontend detenido. Presiona Enter para cerrar...' -ForegroundColor Red; " +
           "Read-Host"
    Start-Process powershell.exe `
        -ArgumentList '-NoExit', '-Command', $cmd `
        -WorkingDirectory $FrontendDir `
        -WindowStyle Normal
}

# --- Stop-AgroFlex -----------------------------------------------------------

function Stop-AgroFlex {
    Write-Host ''
    Write-Host '  Deteniendo AgroFlex...' -ForegroundColor Yellow
    $killed = 0

    Get-WmiObject Win32_Process -Filter "Name = 'java.exe'" -ErrorAction SilentlyContinue |
    ForEach-Object {
        if ($_.CommandLine -and $_.CommandLine -match 'agroflex') {
            Write-Host "  Terminando Java PID $($_.ProcessId)" -ForegroundColor DarkYellow
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            $killed++
        }
    }

    Get-WmiObject Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    ForEach-Object {
        if ($_.CommandLine -and ($_.CommandLine -match 'vite' -or $_.CommandLine -match 'AgroflexSOA')) {
            Write-Host "  Terminando Node PID $($_.ProcessId)" -ForegroundColor DarkYellow
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            $killed++
        }
    }

    if ($killed -eq 0) {
        Write-Host '  Sin procesos activos de AgroFlex.' -ForegroundColor Gray
    } else {
        Write-Host "  $killed proceso(s) terminado(s)." -ForegroundColor Green
    }
    Write-Host ''
}

# --- Cargar variables de entorno desde .env ----------------------------------

$envFile = "$ROOT\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $idx = $line.IndexOf('=')
            if ($idx -gt 0) {
                $key   = $line.Substring(0, $idx).Trim()
                $value = $line.Substring($idx + 1).Trim()
                [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
            }
        }
    }
    Write-Host "  Variables cargadas desde .env" -ForegroundColor DarkGray
} else {
    Write-Host "  AVISO: No se encontro .env en $ROOT" -ForegroundColor Yellow
    Write-Host "         Copia .env.example como .env y configura los valores." -ForegroundColor DarkGray
}

# --- Validaciones previas ----------------------------------------------------

Write-Host ''
Write-Host 'o===============================================o' -ForegroundColor Cyan
Write-Host '      AgroFlex SOA - Inicio de Servicios        ' -ForegroundColor Cyan
Write-Host 'o===============================================o' -ForegroundColor Cyan
Write-Host ''

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "  ERROR: 'java' no encontrado en PATH." -ForegroundColor Red; exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "  ERROR: 'npm' no encontrado en PATH." -ForegroundColor Red; exit 1
}

$missingJars = @()
foreach ($svc in $backendServices) {
    if (-not (Test-Path $svc.Jar)) {
        $missingJars += $svc.Name
        Write-Host "  FALTA JAR: $($svc.Name) -> $($svc.Jar)" -ForegroundColor Red
    }
}

if ($missingJars.Count -gt 0) {
    Write-Host ''
    Write-Host '  Compila los servicios faltantes con:' -ForegroundColor Yellow
    Write-Host '    cd agroflex-backend\<servicio> && mvn clean package -DskipTests' -ForegroundColor DarkGray
    exit 1
}

if (-not (Test-Path "$FRONTEND\package.json")) {
    Write-Host "  ERROR: package.json no encontrado en $FRONTEND" -ForegroundColor Red; exit 1
}

# --- Verificar puertos -------------------------------------------------------

Write-Host '  Verificando puertos...' -ForegroundColor White
$allSvcs  = $backendServices + @($svcFront)
$conflict = $false

foreach ($svc in $allSvcs) {
    if (Test-PortOpen -Port $svc.Port) {
        Write-Host "  Puerto $($svc.Port) ya esta en uso ($($svc.Name))." -ForegroundColor Yellow
        $conflict = $true
    }
}

if ($conflict) {
    Write-Host ''
    $resp = if ($SkipBuilt) { 's' }
            else { Read-Host '  Algunos puertos ya estan ocupados. Continuar? (s/N)' }
    if ($resp -notin @('s','S','si','Si','SI','y','Y','yes')) {
        Write-Host '  Cancelado.' -ForegroundColor Yellow; exit 0
    }
}

# --- Arrancar microservicios Java ---------------------------------------------

Write-Host ''
Write-Host '  Iniciando microservicios backend...' -ForegroundColor White
Write-Host ''

foreach ($svc in $backendServices) {
    if (Test-PortOpen -Port $svc.Port) {
        Write-Host "  [$($svc.Name)] ya activo en :$($svc.Port), omitiendo." -ForegroundColor $svc.Color
        continue
    }

    Write-Host "  >> $($svc.Name) (:$($svc.Port))" -ForegroundColor $svc.Color
    Start-JavaService -Label $svc.Label -JarPath $svc.Jar -WorkDir $ROOT

    $timeoutSec = switch ($svc.Name) {
        'Catalog'  { 180 }
        'Eureka'   { 60  }
        default    { 90  }
    }
    $ok = Wait-ServiceReady -Name $svc.Name -Port $svc.Port -TimeoutSec $timeoutSec
    if (-not $ok) {
        Write-Host ''
        Write-Host "  ERROR: $($svc.Name) no respondio en $timeoutSec s." -ForegroundColor Red
        Write-Host "         Revisa la ventana '$($svc.Label)' para ver los logs." -ForegroundColor DarkGray
        Write-Host '  Ejecuta Stop-AgroFlex para limpiar procesos.' -ForegroundColor Yellow
        exit 1
    }

    Start-Sleep -Seconds 1
}

# --- Arrancar frontend -------------------------------------------------------

Write-Host ''
Write-Host '  Iniciando Frontend...' -ForegroundColor Blue
Write-Host ''

if (Test-PortOpen -Port $svcFront.Port) {
    Write-Host "  Frontend (:$($svcFront.Port)) ya activo, omitiendo." -ForegroundColor $svcFront.Color
} else {
    Write-Host "  >> Frontend (:$($svcFront.Port))" -ForegroundColor $svcFront.Color
    Start-FrontendService -Label $svcFront.Label -FrontendDir $FRONTEND

    $ok = Wait-ServiceReady -Name $svcFront.Name -Port $svcFront.Port -TimeoutSec 60
    if (-not $ok) {
        Write-Host ''
        Write-Host "  ERROR: Frontend no respondio en 60 s." -ForegroundColor Red
        Write-Host "         Revisa la ventana '$($svcFront.Label)'." -ForegroundColor DarkGray
        exit 1
    }
}

# --- Resumen -----------------------------------------------------------------

Write-Host ''
Write-Host 'o================================================================o' -ForegroundColor Green
Write-Host '              AgroFlex SOA - Todos los servicios activos          ' -ForegroundColor Green
Write-Host 'o================================================================o' -ForegroundColor Green
Write-Host '  Eureka Dashboard    ->  http://localhost:8761                   ' -ForegroundColor Cyan
Write-Host '  Gateway (API)       ->  http://localhost:8080                   ' -ForegroundColor Magenta
Write-Host '  Auth Service        ->  http://localhost:8081/api/auth          ' -ForegroundColor Green
Write-Host '  Catalog Service     ->  http://localhost:8082/api/catalog       ' -ForegroundColor Yellow
Write-Host '  Users Service       ->  http://localhost:8083/api/users         ' -ForegroundColor Cyan
Write-Host '  Orders Service      ->  http://localhost:8084/api/orders        ' -ForegroundColor Blue
Write-Host '  Payments Service    ->  http://localhost:8085/api/payments      ' -ForegroundColor Green
Write-Host '  QR Service          ->  http://localhost:8086/api/qr            ' -ForegroundColor Yellow
Write-Host '  Geolocation Service ->  http://localhost:8087/api/geolocation   ' -ForegroundColor Blue
Write-Host '  Notifications       ->  http://localhost:8088/api/notifications ' -ForegroundColor Cyan
Write-Host '  Admin Service       ->  http://localhost:8089/api/admin         ' -ForegroundColor Magenta
Write-Host '  Frontend            ->  http://localhost:5173                   ' -ForegroundColor Blue
Write-Host 'o================================================================o' -ForegroundColor Green
Write-Host '  Para detener todo: Stop-AgroFlex                                ' -ForegroundColor DarkGray
Write-Host 'o================================================================o' -ForegroundColor Green
Write-Host ''
