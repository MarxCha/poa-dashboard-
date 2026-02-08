# Sistema POA — Inteligencia Financiera Automatizada

Capa de inteligencia que *lee* datos del SAT, *interpreta* con IA en español, y *predice* salud financiera para PyMEs mexicanas.

**Status:** MVP Complete

## Quick Start

### Option 1: Setup Script (Recommended)

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
python -c "from app.database import init_db; init_db()"
python seed_data.py
uvicorn app.main:app --reload --port 8000 &

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:8000/docs

---

## Escenarios de Demo

| Escenario | Descripción | Score | Semáforo |
|-----------|-------------|-------|----------|
| **A** | SME Estable - Pequeña empresa con operación sana | 85 | 5 verdes |
| **B** | Scale-up en Riesgo - Empresa de tech con alertas | 62 | 3 verdes, 2 amarillos |
| **C** | Despacho Contable - Contador con 20 clientes | 78 | Mix |

---

## Estructura del Proyecto

```
poa-dashboard/
├── backend/                 # FastAPI
│   ├── app/
│   │   ├── main.py         # Endpoints principales
│   │   ├── config.py       # Configuración
│   │   ├── database.py     # SQLAlchemy setup
│   │   ├── models/         # Modelos de BD
│   │   ├── schemas/        # Pydantic schemas
│   │   └── seeds/          # Motor de datos demo
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/               # Next.js 14
│   ├── app/               # App Router
│   ├── components/        # React components
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml      # Orquestación
└── README.md
```

---

## API Endpoints

### Health & Seeding
- `GET /health` - Estado del servidor
- `POST /api/seed` - Sembrar datos de demo
- `GET /api/scenarios` - Info de escenarios

### Dashboard
- `GET /api/dashboard/{company_id}` - Stats completos del dashboard

### Empresas
- `GET /api/companies` - Listar empresas
- `GET /api/companies/{id}` - Detalle de empresa

### CFDIs
- `GET /api/companies/{id}/cfdis` - Listar CFDIs con paginación

### Health Score
- `GET /api/companies/{id}/health-score` - Score de salud financiera

### CFO Virtual
- `POST /api/cfo/chat?message=...&company_id=...` - Chat con CFO Virtual

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14, Tailwind CSS, Recharts, Framer Motion, dnd-kit |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic |
| Database | PostgreSQL 16 |
| Containers | Docker, Docker Compose |

---

## Desarrollo Local (sin Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Roadmap MVP

- [x] Estructura monorepo
- [x] Backend FastAPI con 7 módulos
- [x] SQLite database (dev)
- [x] Motor de semillas (3 escenarios, 10,536 CFDIs)
- [x] Dashboard Bento-Grid con dnd-kit
- [x] Framer Motion animations
- [x] Web Speech API (Voice Commands)
- [x] XML Drop Zone para CFDIs
- [x] Semáforo Fiscal con alertas
- [x] CFO Virtual chat
- [ ] Vista Predicciones
- [ ] Vista Crédito
- [ ] Autenticación JWT
- [ ] Integración SAT real
- [ ] Deploy producción

---

## Licencia

Propiedad de Sistema POA. Todos los derechos reservados.
