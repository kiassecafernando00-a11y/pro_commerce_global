# Script para corrigir a estrutura do repositório
Write-Host "Iniciando correção da estrutura do projeto..." -ForegroundColor Cyan

$sourceDir = "pro-commerce-global"

if (Test-Path $sourceDir) {
    Write-Host "Movendo arquivos de $sourceDir para a raiz..." -ForegroundColor Yellow
    
    # Mover arquivos e pastas (excluindo .git se existisse lá dentro)
    Get-ChildItem -Path $sourceDir | ForEach-Object {
        $dest = Join-Path "." $_.Name
        if (Test-Path $dest) {
            Write-Host "Aviso: $dest já existe, pulando..." -ForegroundColor Gray
        } else {
            Move-Item $_.FullName "."
        }
    }
    
    # Mover arquivos ocultos (como .gitignore, .env)
    Get-ChildItem -Path $sourceDir -Force | Where-Object { $_.Name -ne "." -and $_.Name -ne ".." } | ForEach-Object {
        $dest = Join-Path "." $_.Name
        if (!(Test-Path $dest)) {
            Move-Item $_.FullName "."
        }
    }

    # Remover a pasta agora vazia
    Remove-Item $sourceDir -Recurse -Force
    Write-Host "Pasta $sourceDir removida." -ForegroundColor Green
} else {
    Write-Host "Pasta $sourceDir não encontrada. Os arquivos já podem estar na raiz." -ForegroundColor Gray
}

# Atualizar o Git
Write-Host "Atualizando o GitHub..." -ForegroundColor Cyan
git add .
git commit -m "Fix: Move project files to repository root"
git push origin main

Write-Host "Estrutura corrigida e enviada com sucesso!" -ForegroundColor Green
