#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Display a comprehensive summary of all git worktrees
.DESCRIPTION
    Shows status, commits, and changes for all worktrees in the repository
.EXAMPLE
    .\scripts\worktree-summary.ps1
#>

param(
    [switch]$Detailed,
    [switch]$ShowDiff
)

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          Git Worktree Summary - Orb Project                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Get all worktrees
$worktrees = git worktree list --porcelain

if (!$worktrees) {
    Write-Host "No worktrees found." -ForegroundColor Yellow
    exit 0
}

# Parse worktree information
$worktreeList = @()
$currentWorktree = @{}

foreach ($line in $worktrees) {
    if ($line -match '^worktree (.+)$') {
        if ($currentWorktree.Count -gt 0) {
            $worktreeList += [PSCustomObject]$currentWorktree
        }
        $currentWorktree = @{
            Path = $matches[1]
            Branch = $null
            Commit = $null
            Bare = $false
        }
    }
    elseif ($line -match '^HEAD (.+)$') {
        $currentWorktree.Commit = $matches[1]
    }
    elseif ($line -match '^branch (.+)$') {
        $currentWorktree.Branch = $matches[1] -replace 'refs/heads/', ''
    }
    elseif ($line -match '^bare') {
        $currentWorktree.Bare = $true
    }
}

# Add the last worktree
if ($currentWorktree.Count -gt 0) {
    $worktreeList += [PSCustomObject]$currentWorktree
}

# Display summary for each worktree
$index = 1
foreach ($wt in $worktreeList) {
    $branchName = if ($wt.Branch) { $wt.Branch } else { "detached HEAD" }
    $commitShort = $wt.Commit.Substring(0, 7)
    
    Write-Host "[$index] " -NoNewline -ForegroundColor White
    Write-Host "Worktree: " -NoNewline -ForegroundColor Gray
    Write-Host "$($wt.Path)" -ForegroundColor Cyan
    Write-Host "    Branch: " -NoNewline -ForegroundColor Gray
    Write-Host "$branchName" -ForegroundColor Green
    Write-Host "    Commit: " -NoNewline -ForegroundColor Gray
    Write-Host "$commitShort" -ForegroundColor Yellow
    
    # Get status
    $status = git -C $wt.Path status --porcelain
    $statusShort = git -C $wt.Path status --short
    
    if ($status) {
        Write-Host "    Status: " -NoNewline -ForegroundColor Gray
        Write-Host "HAS CHANGES" -ForegroundColor Red
        
        # Count changes
        $staged = ($status | Where-Object { $_ -match '^[MADRC]' }).Count
        $unstaged = ($status | Where-Object { $_ -match '^.[MD]' }).Count
        $untracked = ($status | Where-Object { $_ -match '^\?\?' }).Count
        
        if ($staged -gt 0) {
            Write-Host "      • Staged: " -NoNewline -ForegroundColor Gray
            Write-Host "$staged files" -ForegroundColor Green
        }
        if ($unstaged -gt 0) {
            Write-Host "      • Unstaged: " -NoNewline -ForegroundColor Gray
            Write-Host "$unstaged files" -ForegroundColor Yellow
        }
        if ($untracked -gt 0) {
            Write-Host "      • Untracked: " -NoNewline -ForegroundColor Gray
            Write-Host "$untracked files" -ForegroundColor Magenta
        }
        
        if ($Detailed) {
            Write-Host "`n      Changed files:" -ForegroundColor Gray
            foreach ($line in $statusShort) {
                $statusCode = $line.Substring(0, 2)
                $fileName = $line.Substring(3)
                
                $color = switch ($statusCode.Trim()) {
                    "M" { "Yellow" }
                    "A" { "Green" }
                    "D" { "Red" }
                    "R" { "Cyan" }
                    "C" { "Cyan" }
                    "??" { "Magenta" }
                    default { "White" }
                }
                
                Write-Host "        $statusCode $fileName" -ForegroundColor $color
            }
        }
    }
    else {
        Write-Host "    Status: " -NoNewline -ForegroundColor Gray
        Write-Host "Clean" -ForegroundColor Green
    }
    
    # Show recent commits on this branch
    if ($wt.Branch -and !$wt.Bare) {
        $recentCommits = git -C $wt.Path log --oneline -3 2>$null
        if ($recentCommits) {
            Write-Host "`n    Recent commits:" -ForegroundColor Gray
            foreach ($commit in $recentCommits) {
                Write-Host "      • $commit" -ForegroundColor DarkGray
            }
        }
        
        # Show commits ahead/behind main
        $mainBranch = git -C $wt.Path symbolic-ref refs/remotes/origin/HEAD 2>$null
        if ($mainBranch) {
            $mainBranch = $mainBranch -replace 'refs/remotes/origin/', ''
        }
        else {
            $mainBranch = "main"
        }
        
        if ($wt.Branch -ne $mainBranch) {
            $ahead = (git -C $wt.Path rev-list --count "$mainBranch..$($wt.Branch)" 2>$null)
            $behind = (git -C $wt.Path rev-list --count "$($wt.Branch)..$mainBranch" 2>$null)
            
            if ($ahead -or $behind) {
                Write-Host "`n    Compared to $mainBranch:" -ForegroundColor Gray
                if ($ahead -gt 0) {
                    Write-Host "      ↑ $ahead commits ahead" -ForegroundColor Green
                }
                if ($behind -gt 0) {
                    Write-Host "      ↓ $behind commits behind" -ForegroundColor Yellow
                }
            }
        }
    }
    
    # Show diff if requested
    if ($ShowDiff -and $status) {
        Write-Host "`n    Diff preview:" -ForegroundColor Gray
        $diff = git -C $wt.Path diff --stat 2>$null
        if ($diff) {
            $diff | ForEach-Object {
                Write-Host "      $_" -ForegroundColor DarkGray
            }
        }
    }
    
    Write-Host ""
    $index++
}

# Summary
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Summary                                                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$totalWorktrees = $worktreeList.Count
$withChanges = ($worktreeList | Where-Object { 
    $status = git -C $_.Path status --porcelain
    $status.Count -gt 0
}).Count
$clean = $totalWorktrees - $withChanges

Write-Host "Total worktrees: " -NoNewline -ForegroundColor Gray
Write-Host "$totalWorktrees" -ForegroundColor White
Write-Host "With changes:    " -NoNewline -ForegroundColor Gray
Write-Host "$withChanges" -ForegroundColor Yellow
Write-Host "Clean:           " -NoNewline -ForegroundColor Gray
Write-Host "$clean" -ForegroundColor Green
Write-Host ""

# Helpful tips
Write-Host "TIP: Run with -Detailed to see all changed files" -ForegroundColor DarkGray
Write-Host "TIP: Run with -ShowDiff to see diff stats" -ForegroundColor DarkGray
Write-Host ""

