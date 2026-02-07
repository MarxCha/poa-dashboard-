# Plan de Implementación: Sistema POA (MVP + UX Avanzada)

**Fecha:** 7 de Febrero, 2026
**Estrategia:** Monolito Modular (FastAPI + Next.js) + UI de Vanguardia

## 🚦 Semáforo de Viabilidad: VERDE (🟢)
- **Recursos:** Tenemos las herramientas para Web Speech API, Drag & Drop nativo y mocks de datos complejos.

## 🐝 Enjambres Activados
- **Builders:** Estructura Full Stack y lógica de datos.
- **Vision:** Diseño de interfaz "Bento Grid", animaciones y micro-interacciones.
- **Experts:** Implementación de Web Speech API (Voz) y Dnd-kit (Drag & Drop).

---

## 📅 Fases de Implementación

### Fase 0: Cimientos y Storytelling de Datos (Día 1-2)
- [ ] **Estructura Monorepo**: `/backend`, `/frontend`.
- [ ] **Motor de Semillas (Multinivel)**: Script que genere 3 escenarios para inversionistas:
    - *Usuario A (SME)*: Operación estable, cumplimiento 100%.
    - *Usuario B (Scale-up)*: Alerta de iliquidez + Proveedor EFOS detectado.
    - *Usuario C (Despacho)*: Vista de 20 empresas con KPIs consolidados.
- [ ] **Backend Setup**: FastAPI con persistencia para estos perfiles.

### Fase 1: UI/UX Novedosa e Interactiva (Día 3-4)
- [ ] **Dashboard Bento-Grid**: Implementar `dnd-kit` para que el usuario organice sus KPIs.
- [ ] **Carga Drag & Drop**: Zona de soltado para XMLs con feedback visual premium.
- [ ] **Animaciones**: Integrar `Framer Motion` para transiciones de estado y gráficos.

### Fase 2: Comandos de Voz y Accesibilidad (Día 5)
- [ ] **Voz (Sin IA)**: Implementar `Web Speech API` para navegación por voz.
    - *Comandos*: "Dashboard", "Ver facturas", "Estado fiscal", "Sincronizar".
- [ ] **Feedback Auditivo**: Respuestas breves del sistema (Text-to-Speech) para confirmar acciones.

### Fase 3: Lógica Fiscal y Simulación (Día 6-7)
- [ ] **Parser de XML**: Extracción de datos reales de los XMLs cargados.
- [ ] **Semáforo y EFOS**: Lógica determinística (reglas de negocio) para alertas fiscales.

---

## 🎨 Especificaciones de Diseño
- **Estilo**: "Glassmorphism" oscuro (acorde al prototipo previo).
- **Interactividad**: Todo elemento de KPI debe ser "arrastrable" para reordenar la importancia.
- **Storytelling**: Botón "Demo Mode" para saltar entre los 3 niveles de usuario para inversionistas.

## 📝 Notas para Claude
- Prioriza **Web Speech API** nativa para los comandos de voz (evitar costos de Whisper/IA).
- La UI debe sentirse como un software de Apple o Linear: minimalista pero con micro-detalles.
- Asegúrate de que los datos de ejemplo (Usuario A, B, C) cuenten una "historia" financiera clara.
