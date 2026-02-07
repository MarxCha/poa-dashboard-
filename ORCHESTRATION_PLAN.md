# Plan de Orquestación — Sistema POA MVP

**Generado por:** TaskOrchestrator v3.0
**Fecha:** 7 de Febrero, 2026
**Clasificación:** ESTRATÉGICA (Sequential Thinking aplicado)

---

## 1. Resumen Ejecutivo

### Objetivo
Construir un MVP Demo de Sistema POA — Capa de Inteligencia Financiera Automatizada — con UX de vanguardia para presentación a inversionistas.

### Alcance MVP
- Dashboard financiero interactivo (Bento-Grid)
- Gestión de CFDIs con Drag & Drop
- Semáforo Fiscal con detección EFOS
- CFO Virtual conversacional
- Navegación por voz (Web Speech API)
- 3 escenarios de demo para storytelling

### Exclusiones MVP
- Integración SAT real (Descarga Masiva WS)
- Integración bancaria (Belvo)
- ML para predicciones
- Multi-tenant para despachos
- Embedded finance

---

## 2. Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Dashboard│ │  CFDIs  │ │Semáforo │ │   CFO   │ │  Config │   │
│  │  Bento  │ │  Table  │ │  Fiscal │ │ Virtual │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │   Web Speech    │ │   Framer Motion │ │     dnd-kit     │    │
│  │      API        │ │    Animations   │ │   Drag & Drop   │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   auth   │ │sat-conn* │ │analytics │ │notificat.│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ banking* │ │predict.* │ │ billing  │  (* = Mock para MVP)   │
│  └──────────┘ └──────────┘ └──────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER (PostgreSQL)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  users   │ │companies │ │  cfdis   │ │  alerts  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐                                      │
│  │  scores  │ │  seeds   │  (3 escenarios demo)                │
│  └──────────┘ └──────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | Next.js (App Router) | 14.x |
| UI Components | shadcn/ui | latest |
| Estilos | Tailwind CSS | 3.x |
| Animaciones | Framer Motion | 11.x |
| Drag & Drop | @dnd-kit/core | 6.x |
| Charts | Recharts | 2.x |
| Backend | FastAPI | 0.109+ |
| ORM | SQLAlchemy | 2.x |
| Database | PostgreSQL | 16 |
| Containers | Docker + Compose | 24.x |

---

## 4. Estructura de Carpetas

```
poa-dashboard/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── sat_connector/
│   │   │   ├── analytics/
│   │   │   ├── predictions/
│   │   │   ├── notifications/
│   │   │   ├── banking/
│   │   │   └── billing/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── seeds/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── cfdis/
│   │   ├── fiscal/
│   │   ├── cfo/
│   │   └── config/
│   ├── components/
│   │   ├── ui/           (shadcn)
│   │   ├── dashboard/
│   │   ├── charts/
│   │   └── voice/
│   ├── lib/
│   ├── hooks/
│   ├── styles/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── README.md
└── docs/
    ├── api/
    └── architecture/
```

---

## 5. Motor de Semillas — 3 Escenarios

### Escenario A: SME Estable
- **Perfil:** Pequeña empresa de servicios profesionales
- **Ingresos mensuales:** $280,000 - $350,000 MXN
- **CFDIs:** ~50-80/mes
- **Score Salud:** 85/100
- **Semáforo:** 5 verdes
- **Storytelling:** "Todo bajo control, operación sana"

### Escenario B: Scale-up en Riesgo
- **Perfil:** Empresa de tecnología en crecimiento
- **Ingresos mensuales:** $1,200,000 - $1,800,000 MXN
- **CFDIs:** ~200-300/mes
- **Score Salud:** 62/100
- **Semáforo:** 3 verdes, 2 amarillos (EFOS + concentración)
- **Storytelling:** "Creciendo rápido, pero con alertas que atender"

### Escenario C: Despacho Contable
- **Perfil:** Contador con 20 clientes
- **Vista consolidada:** 20 RFCs
- **CFDIs totales:** ~1,500/mes
- **Scores variados:** 45-92 por cliente
- **Storytelling:** "Visibilidad total de tu cartera de clientes"

---

## 6. Flujo de Enjambres

### 6.1 /swarm-plan (Brain)
```
Entrada: business_plan.md, task_plan.md
Salida:
  - architecture.md
  - requirements.md
  - db-schema.sql
  - api-contracts.md
```

### 6.2 /swarm-build (Vision + Builders)
```
Entrada: Outputs de /swarm-plan
Salida:
  - Código funcional en /backend y /frontend
  - Docker Compose funcionando
  - 3 escenarios de demo cargados
  - build-report.json
  - test-evidence.json
```

### 6.3 /swarm-verify (Guardians)
```
Entrada: Código de /swarm-build
Salida:
  - audit-report.json (Score 0-50)
  - test-coverage.json
  - a11y-report.json
Gate: Score ≥ 45 para continuar
```

### 6.4 /swarm-ship (Scribes)
```
Entrada: Todo lo anterior
Salida:
  - README.md actualizado
  - docs/api/openapi.yaml
  - checkpoint.json
```

---

## 7. Asignación de Agentes

| Fase | Agentes | Prioridad |
|------|---------|-----------|
| Plan | StrategicPlanner, RequirementsAnalyzer, ArchitectureDesigner | P0 |
| Design | UXStrategist, UIDesigner, InteractionDesigner | P0 |
| Backend | BackendDeveloper, DatabaseArchitect | P0 |
| Frontend | NextJSExpert, TailwindExpert, FrontendDeveloper | P0 |
| Charts | ChartsExpert | P1 |
| Integraciones | IntegrationEngineer | P1 |
| Data MX | MexicoAPIExpert | P1 |
| Testing | TestingExpert v2 | P2 |
| Auditoría | FunctionalAuditor, DesignAuditor | P2 |
| Docs | ProcessDocumenter, APIDocumenter | P3 |

---

## 8. Criterios de Aceptación MVP

### Funcionales
- [ ] Dashboard carga en < 2s
- [ ] Drag & Drop reordena KPIs y persiste layout
- [ ] Drop zone acepta XMLs y muestra preview
- [ ] Navegación por voz funciona con 4 comandos
- [ ] Demo Mode alterna entre 3 escenarios
- [ ] CFO Virtual responde preguntas básicas
- [ ] Semáforo muestra 5 indicadores verificables

### No Funcionales
- [ ] Score funcional ≥ 45/50
- [ ] Core Web Vitals verdes
- [ ] WCAG 2.1 AA
- [ ] Docker Compose levanta con `docker-compose up`
- [ ] Tests críticos pasan

---

## 9. Riesgos y Mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Web Speech API no soportado en Safari | Media | Bajo | Graceful degradation, detectar soporte |
| dnd-kit conflictos con Framer Motion | Baja | Medio | Usar spring animations de dnd-kit |
| Mock data no realista | Media | Alto | MexicoAPIExpert genera RFCs/montos reales |
| Performance con 300+ CFDIs | Media | Medio | Paginación virtual, React.memo |

---

## 10. Siguiente Paso

Ejecutar `/swarm-plan` para generar arquitectura detallada y comenzar construcción.

```bash
# Comando recomendado
/swarm-plan
```
