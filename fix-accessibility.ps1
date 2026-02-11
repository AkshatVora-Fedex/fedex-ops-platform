#!/usr/bin/env pwsh
<#
.SYNOPSIS
Fix accessibility issues in HTML files
.DESCRIPTION
Adds title attributes to select elements and aria-label/labels to form inputs
#>

$basePath = "C:\Users\9787080\Downloads\OPS_01\fedex-ops-platform"

# Files to process
$files = @(
    "$basePath\stitch_predictive_risk_analytics\alert_rules_configuration_2\code.html",
    "$basePath\stitch_predictive_risk_analytics\operations_health_dashboard_1\code.html",
    "$basePath\stitch_predictive_risk_analytics\operations_health_dashboard_2\code.html",
    "$basePath\stitch_predictive_risk_analytics\operations_health_dashboard_3\code.html",
    "$basePath\stitch_predictive_risk_analytics\predictive_risk_analytics_1\code.html",
    "$basePath\stitch_predictive_risk_analytics\predictive_risk_analytics_2\code.html",
    "$basePath\stitch_predictive_risk_analytics\predictive_risk_analytics_3\code.html",
    "$basePath\stitch_predictive_risk_analytics\performance_&_resolution_analytics\code.html",
    "$basePath\stitch_predictive_risk_analytics\shipment_telemetry_&_progress_trace_1\code.html",
    "$basePath\stitch_predictive_risk_analytics\shipment_telemetry_&_progress_trace_2\code.html",
    "$basePath\frontend\public\index.html"
)

function Fix-SelectElements {
    param([string]$content)
    
    # Pattern 1: <select class="..."> -> <select title="Select option" class="...">
    # Only if title attribute is not already present
    $pattern = '(<select)(\s+(?!.*title)[^>]*class="[^"]*"[^>]*)>'
    $replacement = '$1 title="Select option"$2>'
    
    return $content -replace $pattern, $replacement
}

function Fix-InputElements {
    param([string]$content)
    
    # Pattern 1: Add aria-label to inputs without labels
    # <input class="..." placeholder="..." type="text"/> -> <input aria-label="..." class="..." placeholder="..." type="text"/>
    $pattern = '(<input\s+[^>]*?)(\s+placeholder="([^"]*)"[^>]*type="text"[^>]*/?>)'
    $replacement = '$1 aria-label="$3" placeholder="$3"$4'
    
    $content = $content -replace $pattern, $replacement -replace '\$4', ''
    
    # Pattern 2: Add aria-label to inputs without labels (number type)
    $pattern = '(<input\s+[^>]*?)(\s+placeholder="([^"]*)"[^>]*type="number"[^>]*/?>)'
    $replacement = '$1 aria-label="$3" placeholder="$3"$4'
    
    return $content -replace $pattern, $replacement -replace '\$4', ''
}

$fixedCount = 0

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "⚠ Skipped (not found): $file" -ForegroundColor Yellow
        continue
    }
    
    try {
        $content = Get-Content $file -Raw -Encoding UTF8
        $original = $content
        
        # Apply fixes
        $content = Fix-SelectElements $content
        $content = Fix-InputElements $content
        
        # Write back if changed
        if ($content -ne $original) {
            Set-Content $file $content -Encoding UTF8 -NoNewline
            Write-Host "✓ Fixed: $(Split-Path -Leaf (Split-Path $file))" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "✓ Verified: $(Split-Path -Leaf (Split-Path $file))" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "✗ Error: $file - $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Summary: $fixedCount files processed" -ForegroundColor Green
