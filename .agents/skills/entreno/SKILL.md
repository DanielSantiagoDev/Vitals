---
name: entreno
description: Propone rutinas de ejercicio orientativas según perfil, objetivos y limitaciones, registra el ejercicio realizado y revisa la adherencia. Usar cuando el usuario diga "/entreno", "hazme una rutina", "plan de ejercicio", "qué entreno esta semana", "hoy he nadado / caminado / ido al gimnasio", "apunta el entreno", "cómo voy con el ejercicio" o "revisa mi entreno".
---

# /entreno — rutinas y registro de ejercicio

## Modos

- `/entreno` → si hay plan activo, `ver`; si no, proponer `plan`.
- `/entreno plan [YYYY-MM-DD]` → rutina de la semana que empieza ese lunes (por defecto, la próxima; la actual si hoy es lunes).
- `/entreno registrar <texto>` → anota ejercicio realizado. También se activa sin comando cuando la persona cuenta que ha entrenado.
- `/entreno ver` → plan activo y progreso de la semana.
- `/entreno revisar` → adherencia de las últimas 4 semanas y ajuste del plan.

## Qué lee

- `datos/entreno/perfil-entreno.md` — nivel, lugar y material, días y minutos, lo que disfruta y odia, molestias.
- `datos/entreno/registro.md` y el último plan de `datos/entreno/planes/`.
- `datos/perfil/objetivos.md` — **solo el frontmatter**: prioridades, `meta_peso`, `fase_sensible` y `ingesta.factor_actividad`.
- `datos/perfil/cuerpo.md` y `datos/perfil/estilo-vida.md` (trabajo, pasos, sueño).
- `datos/perfil/preferencias.md` → `entreno_seguimiento`.
- **Solo en `plan` y `revisar`:** `datos/medico/condiciones.md` y `datos/medico/sintomas.md`, únicamente para extraer **limitaciones** (molestias, condiciones que afecten al esfuerzo).

Si falta un dato imprescindible para el plan (dónde entrena, días/minutos), preguntarlo una vez y guardarlo en `perfil-entreno.md`.

## Regla de rol

- **La rutina es prescriptiva**: se propone y se decide.
- **Lo médico es descriptivo.** Una molestia o condición adapta el plan de forma conservadora (menos volumen, alternativa sin carga en la zona), nunca se trata ni se diagnostica.
- **Señales para parar y consultarlo**, que se dicen explícitamente cuando apliquen: dolor que pasa de ocasional a constante, dolor en reposo o nocturno, y cualquier dolor torácico, mareo, desmayo, palpitaciones o falta de aire desproporcionada durante el esfuerzo.
- Si `medico/` o `sintomas.md` recogen síntomas cardiorrespiratorios, o la persona parte de sedentarismo con condiciones relevantes, recomendar **preguntar al médico antes de subir a intensidad alta**. No bloquea empezar con actividad suave.

## `plan` — construir la rutina

1. **Marco semanal**: `dias_semana` × `minutos_sesion` del perfil. Referencia general para adultos (OMS, 2020): 150-300 min/semana de actividad aeróbica moderada y fuerza de grupos musculares principales ≥2 días/semana. Es un horizonte, **no el punto de partida**: con nivel principiante se empieza por debajo y se sube.
2. **Selección**:
   - Solo actividades posibles con `lugar_entreno` y `material_disponible`.
   - **Nunca** lo que esté en `odia`; priorizar `disfruta` — la adherencia manda sobre la eficiencia.
   - Con fuerza disponible: 2 sesiones de cuerpo completo antes que rutinas divididas.
   - Con peso corporal alto o molestias articulares: priorizar actividades sin impacto.
   - Respetar `fase_sensible` de `objetivos.md`: si está vigente, volumen en el extremo bajo; no se apilan cambios.
3. **Cada sesión** lleva: calentamiento (5-10 min), bloques con ejercicio y dosis (series × repeticiones, o minutos), intensidad percibida en lenguaje llano ("puedes hablar con frases cortas"), vuelta a la calma, y **alternativa** si la molestia de ese día aparece.
4. **Progresión**: subir **una sola variable** (minutos, series o intensidad) cada 1-2 semanas si las sesiones anteriores fueron cómodas. Nunca subir todo a la vez.
5. `entreno_seguimiento: orientativo` → sin cargas ni registro de series; `series_y_pesos` → incluir columna de carga a rellenar.
6. **Gasto energético**: el plan **nunca** modifica `objetivos.md` ni suma las kcal del ejercicio al objetivo diario. `factor_actividad` sube solo cuando el ejercicio aparece **sostenido en el registro** (ver `revisar`).

### Salida

- Guardar en `datos/entreno/planes/YYYY-Www.md` (semana ISO), con:
  - frontmatter: `semana`, `inicio`, `fin`, `estado: activo`, `dias`, `minutos_sesion`;
  - tabla L-D con cada sesión o descanso;
  - detalle de cada sesión;
  - notas: progresión prevista, señales para parar.
- Pasar el plan activo anterior a `estado: cerrado`.
- 100 % local: nunca publicar el plan en servicios externos.
- Confirmar en 2-3 líneas: ruta, resumen de la semana y la progresión prevista.

## `registrar`

1. Interpretar lenguaje natural → una fila por actividad en `datos/entreno/registro.md`: `fecha | tipo | duracion_min | intensidad | detalle | notas`. Los valores válidos de `tipo` e `intensidad` están en la sección "Campos" del propio archivo.
2. Si no dice la intensidad, inferirla del contexto o poner `moderada`. **No preguntar por detalles menores.** Fechas pasadas se aceptan ("ayer nadé").
3. Añadir al final: el log **solo crece**; una corrección es una fila nueva que lo dice en `notas`.
4. Si menciona una molestia nueva o que empeora, anotarla en `notas` y **preguntar** si se añade a `datos/medico/sintomas.md`.
5. Responder en 1-2 líneas: lo registrado y el progreso frente al plan activo ("2 de 3 sesiones esta semana"). Sin valoraciones.

## `ver`

Plan activo resumido (una línea por día) y sesiones hechas frente a planificadas en la semana en curso.

## `revisar`

1. Últimas 4 semanas de `registro.md` frente a los planes: sesiones hechas / planificadas, minutos totales, tipos.
2. Patrones, en tono factual: días que se caen siempre, sesiones cortadas por cansancio o molestias. Una sesión caída por cansancio es información, no falta de voluntad.
3. Proponer ajuste del plan: bajar volumen si la adherencia es <60 %, mantener si es irregular, progresar si ha cumplido ≥3 semanas.
4. **Si el ejercicio está sostenido** (≥3 semanas cumpliendo el plan) y `factor_actividad` no lo refleja → sugerir `objetivos recalcular` en una línea. No cambiar el factor desde aquí.
5. Si la persona está de acuerdo con el ajuste, generar el plan de la semana siguiente.

## Reglas

- Idioma español, fechas ISO, fecha real del sistema.
- Rutinas **orientativas**: sin prometer resultados ni cifras de pérdida de peso por el ejercicio.
- Nunca proponer suplementos, fármacos ni protocolos de rehabilitación.
- Si el perfil está casi vacío, proponer una rutina suave de caminata + movilidad y decir qué datos permitirían afinarla.
