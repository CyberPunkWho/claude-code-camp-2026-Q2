# Simple test script to verify MUD connection

$nodePath = "C:\Program Files\nodejs\node.exe"
$workDir = Get-Location

Write-Host "=== MUD Connection Test ==="
Write-Host "Working directory: $workDir"
Write-Host ""

# Kill any existing node processes on port 9999
Write-Host "Cleaning up old processes..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue 2>$null
Start-Sleep -Seconds 1

#Clean up log
if (Test-Path ".mud-state\mud.log") {
    Clear-Content ".mud-state\mud.log"
}

# Start daemon
Write-Host "Starting daemon..."
$proc = Start-Process -FilePath $nodePath -ArgumentList "mud-daemon.js" -PassThru -WindowStyle Hidden
Write-Host "Daemon started (PID: $($proc.Id))"
Start-Sleep -Seconds 2

# Test connection
Write-Host "`nAttempting to connect to MUD..."
& $nodePath mud-cli.js connect

# Check log
Write-Host "`n=== Daemon Log ==="
if (Test-Path ".mud-state\mud.log") {
    Get-Content ".mud-state\mud.log" | Select-Object -Last 20
} else {
    Write-Host "(No log file created)"
}

# Keep daemon running
Write-Host "`nDaemon is running. Use 'node mud-cli.js <command>' to interact."
Write-Host "Example: node mud-cli.js look"
Write-Host "         node mud-cli.js status"
Write-Host "         node mud-cli.js disconnect"
