# MUD Command Wrapper for PowerShell
# Usage: .\mud-command.ps1 <command> [args...]
# Examples:
#   .\mud-command.ps1 connect
#   .\mud-command.ps1 status
#   .\mud-command.ps1 look
#   .\mud-command.ps1 cast fireball

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,

    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MudCli = Join-Path $ScriptDir ".." "02_agent_skills" "mud-client" "mud-cli.js"

if (-not (Test-Path $MudCli)) {
    Write-Error "Error: mud-cli.js not found at $MudCli"
    Write-Error "Expected path: ../02_agent_skills/mud-client/mud-cli.js"
    exit 1
}

# Build the full command string
if ($Args.Count -gt 0) {
    $FullCommand = "$Command $($Args -join ' ')"
} else {
    $FullCommand = $Command
}

# Execute via mud-cli
& node $MudCli $FullCommand
