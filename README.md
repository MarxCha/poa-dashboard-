# Sistema POA — Inteligencia Financiera Automatizada

Capa de inteligencia que *lee* datos del SAT, *interpreta* con IA en español, y *predice* salud financiera para PyMEs mexicanas.

**Status:** MVP Complete | **Score Auditoría:** 92.5% | **Tests:** 18 Playwright

---

## Quick Start (Local)

### Option 1: Setup Script

```bash
git clone https://github.com/MarxCha/poa-dashboard-.git
cd poa-dashboard-
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./venv/bin/python -m uvicorn app.main:app --reload --port 8001 &

# Seed demo data
curl -X POST http://localhost:8001/api/seed

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001/docs
- **Login:** Usa "Entrar en modo demo" o registra una cuenta

---

## Deploy a Produccion

### Requisitos
- Docker y Docker Compose
- Dominio o IP publica (opcional)

### Paso 1: Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con valores de produccion:

```env
POSTGRES_PASSWORD=<password-seguro>
SECRET_KEY=<generar-con: openssl rand -hex 32>
NEXT_PUBLIC_API_URL=https://tu-dominio.com:8001
DEBUG=false
```

### Paso 2: Levantar con Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Esto levanta 3 servicios:
- **db** — PostgreSQL 16 con health checks
- **backend** — FastAPI (2 workers, non-root user)
- **frontend** — Next.js standalone (non-root user)

### Paso 3: Sembrar datos demo

```bash
# Todos los escenarios
curl -X POST http://localhost:8001/api/seed

# O un escenario especifico
curl -X POST "http://localhost:8001/api/seed?scenario=A"
```

### Paso 4: Verificar

```bash
# Health check
curl http://localhost:8001/health

# Docker status
docker-compose -f docker-compose.prod.yml ps
```

### Comandos utiles

```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Reiniciar un servicio
docker-compose -f docker-compose.prod.yml restart backend

# Parar todo
docker-compose -f docker-compose.prod.yml down

# Parar todo + borrar datos
docker-compose -f docker-compose.prod.yml down -v
```

---

## Escenarios de Demo

| Escenario | Descripcion | Score | CFDIs | Semaforo |
|-----------|-------------|-------|-------|----------|
| **A** | SME Estable — empresa sana | 85 | 480 | Todo verde |
| **B** | Scale-up en Riesgo — alertas EFOS + concentracion | 62 | 2,000 | Warnings |
| **C** | Despacho Contable — 20 clientes, Partner Plata | 78 | 640 | Mix |

---

## API Endpoints (14)

### Auth
- `POST /api/auth/register` — Registrar usuario
- `POST /api/auth/login` — Login, retorna JWT
- `GET /api/auth/me` — Perfil del usuario autenticado

### Health & Seeding
- `GET /health` — Estado del servidor
- `POST /api/seed` — Sembrar datos demo
- `GET /api/scenarios` — Info de escenarios

### Dashboard
- `GET /api/dashboard/{company_id}` — Stats completos

### Empresas
- `GET /api/companies` — Listar empresas
- `GET /api/companies/{id}` — Detalle de empresa

### CFDIs
- `GET /api/companies/{id}/cfdis` — Listar con paginacion y filtros

### Health Score
- `GET /api/companies/{id}/health-score` — Score de salud financiera

### CFO Virtual
- `POST /api/cfo/chat` — Chat conversacional (8 temas data-driven)

### Predicciones & Credito
- `GET /api/predictions/{company_id}` — Proyecciones a 3 meses
- `GET /api/credit/{company_id}` — Opciones de financiamiento

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts, Framer Motion, dnd-kit |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic, JWT (bcrypt + python-jose) |
| Database | SQLite (dev) / PostgreSQL 16 (prod) |
| Testing | Playwright (18 E2E tests) |
| CI/CD | GitHub Actions |
| Containers | Docker multi-stage builds |

---

## Estructura del Proyecto

```
poa-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py              # 14 endpoints + auth
│   │   ├── config.py            # Settings con .env
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models/              # User, Company, CFDI, FiscalAlert, HealthScore
│   │   ├── schemas/             # Pydantic schemas
│   │   └── seeds/               # 3 escenarios demo
│   ├── requirements.txt
│   └── Dockerfile               # Multi-stage (dev + prod)
│
├── frontend/
│   ├── app/                     # Next.js App Router
│   ├── components/
│   │   ├── auth/                # Login screen
│   │   ├── dashboard/           # 10 view components
│   │   ├── layout/              # Sidebar
│   │   ├── providers/           # ThemeProvider
│   │   └── ui/                  # Shared UI components
│   ├── tests/                   # 5 Playwright test suites
│   ├── hooks/                   # Voice commands
│   ├── lib/                     # API client + themes
│   ├── playwright.config.ts
│   ├── package.json
│   └── Dockerfile               # Multi-stage (dev + prod)
│
├── screenshots/                 # 13 demo screenshots
├── docker-compose.yml           # Development
├── docker-compose.prod.yml      # Production
├── .github/workflows/ci.yml     # GitHub Actions CI
├── .env.example                 # Variables de entorno
└── setup.sh                     # Script de setup local
```

---

## Tests

```bash
cd frontend

# Correr todos los tests
npm test

# Con UI interactiva
npm run test:ui
```

18 tests en 5 suites: navigation (6), scenarios (3), CFO Virtual (3), CFDIs (2), auth (4).

---

## Roadmap

- [x] Dashboard con KPIs, charts, drag & drop
- [x] Semaforo Fiscal con alertas color-coded
- [x] CFO Virtual (chat + voz + TTS)
- [x] Predicciones financieras (3 meses)
- [x] Credito y Financiamiento (3 tabs)
- [x] Tabla de CFDIs con paginacion
- [x] Temas B2B personalizables (5 temas)
- [x] Autenticacion JWT
- [x] 18 tests Playwright
- [x] Docker multi-stage + CI/CD
- [ ] Integracion SAT real (post-inversion)
- [ ] Deploy a produccion

---

## Licencia

Propiedad de Sistema POA. Todos los derechos reservados.
