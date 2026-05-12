# 🏪 ProCommerce Global - E-commerce Marketplace Platform

**Plataforma completa de marketplace com sistema financeiro integrado**

## 🎯 Visão Geral

ProCommerce Global é uma plataforma de e-commerce multi-vendor com sistema financeiro completo, suportando:
- Múltiplos vendedores com lojas independentes
- Sistema de carteira digital e transações
- Integração com gateways de pagamento (Stripe)
- Gestão automática de comissões
- Relatórios financeiros exportáveis
- Notificações por email automatizadas

## ✨ Funcionalidades Principais

### Para Clientes
- 🛍️ Navegação por categorias e produtos
- 🔍 Busca e filtros avançados
- 🛒 Carrinho de compras inteligente
- 💳 Checkout com Stripe (cartão de crédito)
- 📦 Rastreamento de pedidos
- 🌍 Suporte multi-idioma e multi-moeda

### Para Vendedores
- 🏪 Dashboard personalizado
- 📦 Gestão de produtos e inventário
- 💰 **Carteira Digital** com saldo em tempo real
- 📊 **Relatórios Financeiros** (Excel/CSV)
- 💸 Solicitação de saques (IBAN)
- 📧 Notificações de vendas e saques

### Para Administradores
- 👥 Gestão de utilizadores e lojas
- 💵 **Painel Financeiro** completo
- ⚙️ **Configuração de Taxas** (comissões, saques)
- ✅ Aprovação de saques
- 📈 Analytics e métricas
- 🔧 **Sistema de Configuração** e health check

## 🚀 Sistema Financeiro (Implementado)

### Arquitetura
```
Cliente → Compra → Stripe → Webhook → Sistema
                                ↓
                    Cria Pedido (PAID)
                                ↓
                OrderFinancialService
                ↓               ↓
        Credita Wallet    Deduz Comissão
            Vendedor       (5% default)
                ↓
        Email: "Nova Venda!"
```

### Models Prisma
- `Wallet` - Carteira digital (balance, pending)
- `Transaction` - Ledger de transações
- `PayoutRequest` - Gestão de saques
- `SystemConfig` - Configurações globais

### Services
- `WalletService` - Operações de carteira
- `OrderFinancialService` - Processamento automático
- `EmailService` - Notificações (Resend)
- `ReportService` - Geração de relatórios

## 📦 Tecnologias

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Lucide Icons

**Backend:**
- Next.js API Routes
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- NextAuth.js

**Integrações:**
- Stripe (Payments)
- Resend (Email)
- OpenStreetMap (Mapas)

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup Local

```bash
# Clone o repositório
git clone https://github.com/kiassecafernando00-a11y/pro_commerce_global.git
cd pro_commerce_global

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Editar .env com suas credenciais

# Setup database
npx prisma generate
npx prisma migrate dev

# Iniciar dev server
npm run dev
```

Aceder: `http://localhost:3000`

## ⚙️ Configuração

### Variáveis de Ambiente Essenciais

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth
NEXTAUTH_SECRET="[gerar: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@seudominio.com"

# Base
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Ver `DEPLOYMENT.md` para guia completo.

## 📊 Estrutura do Projeto

```
src/
├── app/
│   ├── (admin)/          # Admin dashboard
│   ├── (dashboard)/      # Vendor dashboard
│   ├── api/              # API routes
│   │   ├── payments/     # Stripe checkout
│   │   ├── webhooks/     # Stripe webhook
│   │   └── reports/      # Excel/CSV export
│   ├── checkout/         # Checkout pages
│   └── ...
├── components/           # React components
├── contexts/             # React contexts (Cart, Lang, Currency)
├── services/
│   ├── financial/        # Wallet, OrderFinancial
│   ├── notifications/    # Email
│   └── reports/          # Report generation
└── lib/                  # Utilities (Prisma, Stripe)

prisma/
└── schema.prisma         # Database schema
```

## 🎓 Documentação Adicional

- **`walkthrough.md`** - Resumo técnico completo
- **`DEPLOYMENT.md`** - Guia de deploy passo-a-passo
- **`implementation_plan.md`** - Plano de implementação
- **`task.md`** - Checklist de tarefas

## 🧪 Testes

### Fluxo Completo
1. Criar conta como vendedor
2. Pagar taxa de inscrição (upload comprovativo)
3. Admin aprovar loja
4. Vendedor adicionar produtos
5. Cliente fazer compra (Stripe test card: `4242 4242 4242 4242`)
6. Verificar wallet creditada automaticamente
7. Vendedor solicitar saque
8. Admin aprovar → Email enviado

### Health Check
Aceder `/admin/sistema` para:
- Verificar database
- Validar ENV vars
- Ver estatísticas do sistema

## 📈 Status do Projeto

### Implementado (✅)
- [x] Sistema de autenticação (Admin/Vendor/Customer)
- [x] Gestão de produtos e categorias
- [x] Carrinho e checkout
- [x] **Stripe Payment Gateway**
- [x] **Sistema de Carteira Digital**
- [x] **Processamento Automático de Comissões**
- [x] **Email Notifications**
- [x] **Relatórios Exportáveis (Excel/CSV)**
- [x] **Admin Fee Configuration**
- [x] Rastreamento de pedidos
- [x] Multi-idioma e multi-moeda
- [x] Sistema de marketing (banners, campanhas)

### Em Desenvolvimento (🔵)
- [ ] PayPal integration
- [ ] ProxyPay (Multicaixa) para Angola
- [ ] 2FA para saques
- [ ] Antifraud system
- [ ] Advanced analytics dashboards

## 🤝 Contribuindo

1. Fork o projeto
2. Criar feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licença

Open Source - MIT License

## 👥 Suporte

Para questões técnicas ou suporte:
- Email: kiassecafernando00@gmail.com
- Docs: Ver `walkthrough.md` e `DEPLOYMENT.md`

---

**Desenvolvido com ❤️ para o mercado africano**
