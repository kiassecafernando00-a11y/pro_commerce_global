# Script para enviar o projeto para o GitHub
Write-Host "Iniciando processo de push para o GitHub..." -ForegroundColor Cyan

# Inicializar repositório se não existir
if (!(Test-Path .git)) {
    git init
    Write-Host "Repositório Git inicializado." -ForegroundColor Green
}

# Adicionar remote se não existir
$remote = git remote get-url origin 2>$null
if ($null -eq $remote) {
    git remote add origin https://github.com/kiassecafernando00-a11y/pro_commerce_global.git
    Write-Host "Remote 'origin' adicionado." -ForegroundColor Green
} else {
    git remote set-url origin https://github.com/kiassecafernando00-a11y/pro_commerce_global.git
    Write-Host "Remote 'origin' atualizado." -ForegroundColor Green
}

# Garantir que estamos na branch main
git branch -M main

# Adicionar arquivos e fazer commit
git add .
git commit -m "Initial commit: ProCommerce Global Platform"

# Push
Write-Host "Enviando para o GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "Concluído!" -ForegroundColor Green
