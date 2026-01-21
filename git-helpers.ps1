# Git Workflow Helper Scripts fuer PowerShell
# UTF-8 Encoding setzen
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ============================================
# NEUE FEATURE BRANCH STARTEN
# ============================================
function Start-Feature {
    param(
        [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
        [string[]]$Name
    )

    # Falls mehrere Argumente übergeben wurden, zu einem String verbinden
    if ($Name -is [array]) {
        $FeatureName = $Name -join " "
    } else {
        $FeatureName = $Name
    }

    # Umlaute durch Ascii ersetzen für Branch-Namen
    $SafeName = $FeatureName -replace 'ä', 'ae' -replace 'ö', 'oe' -replace 'ü', 'ue' -replace 'ß', 'ss' -replace ' ', '-' -replace ':', '-'

    Write-Host "Starte neuen Feature Branch: feature/$SafeName" -ForegroundColor Cyan

    # Zu develop wechseln und aktualisieren
    git checkout develop
    git pull origin develop

    # Feature Branch erstellen
    git checkout -b "feature/$SafeName"

    # Branch zu Remote pushen
    Write-Host "Pushe Branch zu Remote..." -ForegroundColor Cyan
    git push -u origin "feature/$SafeName"

    Write-Host "Feature Branch 'feature/$SafeName' erstellt und aktiv" -ForegroundColor Green
    Write-Host "Branch ist jetzt auch auf GitHub sichtbar" -ForegroundColor Green
    Write-Host "Tipp: Committe regelmaessig mit 'git commit -m ""feat($SafeName): ...""'" -ForegroundColor Yellow
}

# ============================================
# FEATURE FERTIGSTELLEN (Merge in develop)
# ============================================
function Complete-Feature {
    param(
        [Parameter(Mandatory=$false)]
        [string]$Name
    )

    # Aktuellen Branch ermitteln - verwende git for-each-ref für korrektes Encoding
    $currentBranch = git rev-parse --abbrev-ref HEAD

    if (-not $currentBranch) {
        Write-Host "Fehler beim Ermitteln des aktuellen Branches!" -ForegroundColor Red
        return
    }

    if (-not $currentBranch.StartsWith("feature/")) {
        Write-Host "Du bist nicht in einem Feature Branch!" -ForegroundColor Red
        Write-Host "Aktueller Branch: $currentBranch" -ForegroundColor Yellow
        return
    }

    Write-Host "Schliesse Feature ab: $currentBranch" -ForegroundColor Cyan

    # WICHTIG: Commit Status pruefen
    $status = git status --porcelain
    if ($status) {
        Write-Host "WARNUNG: Du hast uncommitted changes!" -ForegroundColor Yellow
        Write-Host "Bitte erst committen:" -ForegroundColor Yellow
        Write-Host "  git add ." -ForegroundColor Gray
        Write-Host "  git commit -m 'deine message'" -ForegroundColor Gray
        return
    }

    # Zu develop wechseln
    Write-Host "Wechsle zu develop..." -ForegroundColor Cyan
    git checkout develop
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Fehler beim Wechsel zu develop!" -ForegroundColor Red
        return
    }

    git pull origin develop
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Fehler beim Pullen von develop!" -ForegroundColor Red
        return
    }

    # Merge mit automatischer Message (kein Editor!)
    Write-Host "Merge Feature Branch lokal..." -ForegroundColor Cyan
    $mergeMessage = "Merge $currentBranch into develop"

    # Verwende --no-edit um Editor zu vermeiden
    git merge $currentBranch --no-ff --no-edit -m $mergeMessage

    if ($LASTEXITCODE -eq 0) {
        # Pushen
        Write-Host "Pushe zu develop..." -ForegroundColor Cyan
        git push origin develop

        if ($LASTEXITCODE -eq 0) {
            Write-Host "Erfolgreich zu develop gepusht!" -ForegroundColor Green

            # Branch löschen automatisch (lokal UND remote)
            Write-Host "Loesche Feature Branch..." -ForegroundColor Cyan

            # Lokal löschen
            git branch -d $currentBranch
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Branch lokal geloescht" -ForegroundColor Green
            }

            # Remote löschen - finde alle möglichen Varianten des Branch-Namens
            $remoteBranches = git ls-remote --heads origin | Select-String $currentBranch.Replace("feature/", "")
            if ($remoteBranches) {
                foreach ($remoteBranch in $remoteBranches) {
                    $branchRef = $remoteBranch -replace '.*refs/heads/', ''
                    Write-Host "Loesche remote Branch: $branchRef" -ForegroundColor Cyan
                    git push origin --delete $branchRef 2>&1 | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "Remote Branch geloescht" -ForegroundColor Green
                    }
                }
            }

            Write-Host ""
            Write-Host "Feature abgeschlossen!" -ForegroundColor Green
            Write-Host "Teste auf Vercel Preview: https://driveincloud-dev.vercel.app" -ForegroundColor Cyan
        } else {
            Write-Host "Fehler beim Pushen!" -ForegroundColor Red
        }
    } else {
        Write-Host "Merge fehlgeschlagen! Bitte Konflikte loesen." -ForegroundColor Red
    }
}

# ============================================
# RELEASE ZU PRODUCTION (develop -> main)
# ============================================
function New-Release {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Version,

        [Parameter(Mandatory=$true)]
        [string]$Message
    )

    Write-Host "Erstelle Release: v$Version" -ForegroundColor Cyan

    # Bestätigung
    Write-Host "ACHTUNG: Deployed zu Production!" -ForegroundColor Yellow
    $confirm = Read-Host "Wirklich fortfahren? (y/n)"
    if ($confirm -ne "y") {
        Write-Host "Abgebrochen" -ForegroundColor Red
        return
    }

    # Zu main wechseln
    git checkout main
    git pull origin main

    # develop mergen
    Write-Host "Merge develop in main..." -ForegroundColor Cyan
    git merge develop --no-ff -m "Release: $Message"

    if ($LASTEXITCODE -eq 0) {
        # Tag erstellen
        git tag -a "v$Version" -m "$Message"

        # Pushen
        Write-Host "Pushe zu Production..." -ForegroundColor Cyan
        git push origin main
        git push origin "v$Version"

        Write-Host "Release v$Version deployed!" -ForegroundColor Green
        Write-Host "Production ist live!" -ForegroundColor Green

        # Zurück zu develop
        git checkout develop
    } else {
        Write-Host "Merge fehlgeschlagen!" -ForegroundColor Red
    }
}

# ============================================
# QUICK COMMIT (fuer schnelle Zwischenstaende)
# ============================================
function Quick-Commit {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )

    git add .
    git commit -m $Message

    Write-Host "Committed: $Message" -ForegroundColor Green

    $push = Read-Host "Auch pushen? (y/n)"
    if ($push -eq "y") {
        $currentBranch = git branch --show-current
        git push origin $currentBranch
        Write-Host "Gepusht zu origin/$currentBranch" -ForegroundColor Cyan
    }
}

# ============================================
# STATUS ANZEIGEN
# ============================================
function Show-GitStatus {
    Write-Host "Git Status" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan

    $currentBranch = git branch --show-current
    Write-Host "Current Branch: $currentBranch" -ForegroundColor Yellow

    Write-Host ""
    Write-Host "Local Branches:" -ForegroundColor Cyan
    git branch

    Write-Host ""
    Write-Host "Recent Commits:" -ForegroundColor Cyan
    git log --oneline -5

    Write-Host ""
    Write-Host "Uncommitted Changes:" -ForegroundColor Cyan
    git status --short
}

# ============================================
# HELPER AUSGEBEN
# ============================================
function Show-GitHelp {
    Write-Host ""
    Write-Host "CloudBox Git Workflow Helper" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Verfuegbare Commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Start-Feature <name>" -ForegroundColor Green
    Write-Host "    Neuen Feature Branch starten" -ForegroundColor Gray
    Write-Host "    Beispiel: Start-Feature 'US-A.1-typescript-errors'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Complete-Feature" -ForegroundColor Green
    Write-Host "    Feature in develop mergen und Branch loeschen" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  New-Release <version> <message>" -ForegroundColor Green
    Write-Host "    Release zu Production (develop -> main)" -ForegroundColor Gray
    Write-Host "    Beispiel: New-Release '1.0.0' 'Phase 1 Sprint 1 completed'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Quick-Commit <message>" -ForegroundColor Green
    Write-Host "    Schneller Commit mit add ." -ForegroundColor Gray
    Write-Host "    Beispiel: Quick-Commit 'feat(US-A.1): Fix API types'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Show-GitStatus" -ForegroundColor Green
    Write-Host "    Aktuellen Status anzeigen" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Show-GitHelp" -ForegroundColor Green
    Write-Host "    Diese Hilfe anzeigen" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Siehe GIT_WORKFLOW.md fuer Details" -ForegroundColor Cyan
}

# ============================================
# ALIASES SETZEN
# ============================================
Set-Alias -Name feature -Value Start-Feature
Set-Alias -Name done -Value Complete-Feature
Set-Alias -Name release -Value New-Release
Set-Alias -Name qc -Value Quick-Commit
Set-Alias -Name gs -Value Show-GitStatus
Set-Alias -Name gh -Value Show-GitHelp
