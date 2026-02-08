# task_plan.md

**Título:** Mejoras UX/UI y Funcionalidad de Crédito para Sistema POA

**Fecha:** Domingo, Febrero 8, 2026

**Semáforo de Viabilidad:** 🟡 AMARILLO

**Justificación del Semáforo:**
Las mejoras UX/UI (ejemplos en alertas, paleta de colores, alineación visual) son directamente implementables con los recursos existentes. Sin embargo, la sección de crédito requiere una definición clara de la integración (directa al partner vs. flujo intermedio en POA) y posibles acuerdos comerciales/técnicos con socios financieros, lo cual introduce dependencias externas y riesgos no definidos en el plan de negocio inicial, impactando la viabilidad completa sin más información.

**Enjambres Recomendados para Claude:**
- **Vision:** Para análisis detallado de la captura de pantalla y revisión de las implementaciones UI/UX (alineación, tonos, impacto de paleta de colores).
- **Builders:** Para la implementación de todas las características (lógica de alertas, configuración de paleta, flujos de crédito).
- **Experts:** Si la solución de crédito implica la integración de APIs de terceros (ej. Konfío, R2) más allá de un simple redirect.
- **Scribes:** Para documentar las nuevas características de personalización y los flujos de crédito.
- **Brain:** Para desglosar y planificar la integración del flujo de crédito en detalle una vez se decida el enfoque.

**Objetivo:**
Mejorar la experiencia de usuario de Sistema POA mediante la adición de ejemplos contextuales en las alertas, la implementación de una paleta de colores personalizable para clientes B2B, la profesionalización del diseño visual, y la creación de un flujo funcional y claro para la sección de crédito.

**Contexto:**
El plan de negocio actual de Sistema POA es robusto, pero se busca refinar la interacción del usuario y la funcionalidad para segmentos clave como el B2B y las oportunidades de embedded finance. Los usuarios necesitan mayor claridad en las alertas y un flujo de crédito que genere una acción concreta post-interacción inicial. La imagen proporcionada sugiere áreas de mejora en la alineación y el tono visual.

---
## Fases de Implementación y Tareas

### Fase 1: Mejoras UX/UI Generales (Enfoque: Frontend)

- [ ] **1.1. Ejemplos Contextuales en Alertas**
    - [ ] 1.1.1. Analizar tipos de alertas existentes y determinar dónde los ejemplos serían más valiosos (e.g., alertas fiscales, de liquidez).
    - [ ] 1.1.2. Diseñar la estructura de datos para incluir ejemplos en las alertas (e.g., campo `example_text` en el modelo de alerta).
    - [ ] 1.1.3. Implementar la visualización de estos ejemplos en el componente de alertas del frontend, asegurando que no sobrecarguen la UI.
    - [ ] 1.1.4. Redactar ejemplos claros y concisos para las 3-5 alertas más críticas.

- [ ] **1.2. Paleta de Colores Personalizable (para B2B)**
    - [ ] 1.2.1. Definir los elementos clave de la UI que serán afectados por la paleta de colores (e.g., colores primarios de botones, fondos de cabecera, colores de énfasis).
    - [ ] 1.2.2. Investigar e implementar una estrategia de tematización en el frontend (e.g., CSS variables, ThemeProvider en React).
    - [ ] 1.2.3. Desarrollar una interfaz de administración (panel de control para el cliente B2B o un administrador interno) para configurar y guardar la paleta de colores.
    - [ ] 1.2.4. Integrar la persistencia de estas preferencias en el backend.

- [ ] **1.3. Profesionalización del Tono Visual y Alineación**
    - [ ] 1.3.1. Revisar la captura de pantalla provista y elementos similares en la UI actual para identificar inconsistencias en espaciado, tipografía y alineación.
    - [ ] 1.3.2. Aplicar principios de diseño (e.g., grid system, spacing conventions) para asegurar la alineación horizontal y vertical de textos e información.
    - [ ] 1.3.3. Asegurar una consistencia en el uso de tipografías y tamaños para mejorar la legibilidad y el tono profesional.
    - [ ] 1.3.4. (Opcional, si aplica) Estandarizar la iconografía y el uso de elementos gráficos para una apariencia cohesiva.

### Fase 2: Flujo de Crédito (Enfoque: Frontend + Backend + Integración)

- [ ] **2.1. Definición del Flujo Post-"Solicitar Ahora" / "Ver Detalles"**
    - [ ] 2.1.1. **Decisión Arquitectónica Clave:** Determinar si el flujo de crédito se gestionará 100% dentro de POA (con formularios y seguimiento interno) o si se redirigirá al usuario a la plataforma del socio financiero.
        - **Alternativa A (Redirect Simple):** Redirigir al usuario directamente a un formulario de solicitud pre-llenado en la plataforma del socio.
        - **Alternativa B (Integración Parcial/Total):**
            - Recopilar datos iniciales en POA, validar elegibilidad básica.
            - Llamar a una API del socio financiero para iniciar la solicitud o pre-calificar.
            - Mostrar estado de la solicitud y próximas acciones dentro de POA.
    - [ ] 2.1.2. Documentar el flujo de usuario detallado para la opción seleccionada.

- [ ] **2.2. Implementación del Flujo de Crédito Seleccionado**
    - [ ] 2.2.1. **Si Alternativa A (Redirect Simple):**
        - [ ] 2.2.1.1. Implementar la lógica de redirección desde los botones "Solicitar Ahora" / "Ver Detalles" hacia la URL del socio financiero, pasando parámetros relevantes (si el socio lo permite).
        - [ ] 2.2.1.2. Asegurar que la apertura de la nueva ventana/pestaña sea amigable para el usuario.
    - [ ] 2.2.2. **Si Alternativa B (Integración Parcial/Total):**
        - [ ] 2.2.2.1. Diseñar y desarrollar los formularios frontend para la recopilación de datos de crédito.
        - [ ] 2.2.2.2. Desarrollar endpoints en el backend de POA para manejar la lógica de pre-calificación y comunicación con el socio (usando el enjambre Experts).
        - [ ] 2.2.2.3. Implementar pantallas de estado y seguimiento de la solicitud dentro de POA.
        - [ ] 2.2.2.4. Manejar posibles respuestas de error o requerimientos adicionales del socio financiero.

### Fase 3: Otras Mejoras Propuestas (Opcional, Sujeto a Priorización)

- [ ] **3.1. Dashboard de Resumen Ejecutivo con Acciones Recomendadas**
    - [ ] 3.1.1. Diseñar un dashboard de alto nivel que resuma la salud financiera y fiscal con las 2-3 acciones más impactantes que el usuario puede tomar.
    - [ ] 3.1.2. Cada acción recomendada debería tener un enlace directo a la funcionalidad relevante en POA (e.g., "Regularizar 3 CFDIs pendientes" → lleva a la sección de alertas de discrepancias).

- [ ] **3.2. Herramienta de Benchmarking Simplificada**
    - [ ] 3.2.1. Para el MVP, considerar una visualización comparativa simple (ej. barra de progreso) del "Score de Salud Financiera" del usuario vs. el promedio del sector/tamaño (usando datos anónimos).

---
## Riesgos Identificados

-   **Complejidad de Integración de Crédito:** Los flujos con socios financieros pueden ser complejos y requerir mucha coordinación. El riesgo es alto si se opta por una integración profunda sin un plan claro o acuerdos ya cerrados.
-   **Sobrecarga de Información en Alertas:** Añadir ejemplos puede hacer que las alertas sean demasiado densas si no se diseñan cuidadosamente.
-   **Coherencia Visual:** La implementación de una paleta de colores personalizable debe ser robusta para evitar rupturas de diseño o una experiencia "rota" para el usuario.
-   **Dependencia de Datos Anónimos:** Para mejoras como benchmarking, la disponibilidad y calidad de los datos agregados son cruciales.

## Recursos Faltantes / A Considerar

-   **Definición del Flujo de Crédito:** Es fundamental que el CEO (o Product Owner) defina la estrategia para la funcionalidad de crédito (redirect vs. integración). Esto impactará directamente la complejidad y el alcance de la Fase 2.
-   **Acuerdos con Socios Financieros:** Si se opta por una integración más profunda de crédito, se requieren acuerdos técnicos y legales con los socios (Konfío, R2) para el uso de sus APIs y el manejo de datos.
-   **Librerías de Tematización/UI:** Confirmar la existencia o necesidad de añadir librerías/frameworks para el manejo de temas de UI si `shadcn/ui` y `Tailwind` no cubren los requerimientos de personalización avanzada.
-   **Guías de Estilo/Brand Guidelines para B2B:** Necesidad de definir pautas de diseño para la personalización de la paleta de colores, para guiar a los clientes o a los administradores de POA.

---
## Notas para Claude

-   Priorizar la Fase 1 (mejoras UX/UI generales) ya que son de menor riesgo y alto impacto visual.
-   Para la Fase 2 (flujo de crédito), es *crítico* que el equipo de Producto/Negocio decida la estrategia (Alternativa A o B) antes de iniciar el desarrollo. Solo entonces se podrá detallar el sub-plan para Claude.
-   Utilizar el enjambre Vision para un análisis inicial de la captura de pantalla adjunta para identificar elementos específicos a mejorar en la alineación y tono profesional.