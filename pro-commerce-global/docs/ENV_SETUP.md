# 🔐 Variáveis de Ambiente - Guia Completo

## 📋 Setup Rápido

Criar ficheiro `.env` na raiz do projeto com:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="[gerar com: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Payment Gateway
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Service (Resend)
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@localhost"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 🔑 Como Obter Cada Chave

### 1. NEXTAUTH_SECRET
```bash
# Gerar chave aleatória segura
openssl rand -base64 32
```
Copiar output para `NEXTAUTH_SECRET`

### 2. Stripe Keys (Modo Test)
1. Ir para https://dashboard.stripe.com/test/apikeys
2. Copiar **Secret key** → `STRIPE_SECRET_KEY`
3. Copiar **Publishable key** → `STRIPE_PUBLISHABLE_KEY`

### 3. Stripe Webhook Secret
1. Ir para https://dashboard.stripe.com/test/webhooks
2. Clicar "Add endpoint"
3. URL: `http://localhost:3000/api/webhooks/stripe` (ou domínio de produção)
4. Eventos: Selecionar:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copiar **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 4. Resend API Key
1. Criar conta em https://resend.com
2. Ir para https://resend.com/api-keys
3. Clicar "Create API Key"
4. Copiar → `RESEND_API_KEY`
5. Definir `FROM_EMAIL` com email verificado

### 5. Database URL

**Desenvolvimento (SQLite):**
```env
DATABASE_URL="file:./dev.db"
```

**Produção (PostgreSQL):**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

## 🌍 Configuração por Ambiente

### Desenvolvimento (Local)
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."  # Test mode
FROM_EMAIL="noreply@localhost"
```

### Staging
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://staging.seudominio.com"
NEXT_PUBLIC_BASE_URL="https://staging.seudominio.com"
STRIPE_SECRET_KEY="sk_test_..."  # Ainda test
FROM_EMAIL="noreply@staging.seudominio.com"
```

### Produção
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://seudominio.com"
NEXT_PUBLIC_BASE_URL="https://seudominio.com"
STRIPE_SECRET_KEY="sk_live_..."  # LIVE MODE!
STRIPE_PUBLISHABLE_KEY="pk_live_..."
FROM_EMAIL="noreply@seudominio.com"
```

## ⚠️ Notas Importantes

### Stripe Webhook em Desenvolvimento
Para testar webhooks localmente, use Stripe CLI:
```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Isto vai gerar um webhook secret temporário
# Use-o no .env durante desenvolvimento
```

### Resend Email Limits
- **Free tier**: 100 emails/dia
- **Domínio**: Verificar domínio para evitar spam
- **DNS**: Configurar SPF, DKIM records

### Database Production
- Usar PostgreSQL para produção
- SQLite apenas para desenvolvimento
- Fazer backups regulares

## ✅ Validação

### Verificar Configuração
Aceder: `/admin/sistema` após login como admin

Deve mostrar:
- ✅ Database conectado
- ✅ Todas ENV vars presentes
- ✅ System config inicializado

### Teste Rápido
```bash
# Verificar se .env carrega
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

## 🔒 Segurança

### .gitignore
Garantir que `.env` está em `.gitignore`:
```gitignore
.env
.env.local
.env.production
```

### Nunca Commitar
❌ NUNCA fazer commit de:
- `.env`
- Chaves privadas (sk_live_, sk_test_)
- Secrets de webhook
- Passwords de database

✅ PODE commitar:
- `.env.example` (sem valores reais)
- Documentação (este ficheiro)

## 📦 Deploy Platforms

### Vercel
1. Dashboard → Settings → Environment Variables
2. Adicionar cada variável manualmente
3. Separar por ambiente (Development, Preview, Production)

### Railway
1. Project → Variables
2. Adicionar todas as vars
3. Railway auto-reload em mudanças

### Heroku
```bash
heroku config:set NEXTAUTH_SECRET="..."
heroku config:set STRIPE_SECRET_KEY="..."
# etc
```

---

**Importante**: Este ficheiro pode ser commitado, mas garanta que não contém valores reais!
