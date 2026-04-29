#Requires -Version 5.1
# Detiene todos los procesos Java y Node de AgroFlex.

$killed = 0

Write-Host ''
Write-Host '  Deteniendo AgroFlex...' -ForegroundColor Yellow

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
