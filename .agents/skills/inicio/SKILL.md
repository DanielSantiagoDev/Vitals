---
name: inicio
description: Onboarding de Vitals. Crea datos/ a partir de plantillas/ y guía, por este orden, cuestionario → datos médicos (opcional) → objetivos de ingesta → plan de entreno. Reanudable. Usar cuando no exista la carpeta datos/, o el usuario diga "/inicio", "empezar", "configurar Vitals", "primeros pasos", "onboarding", "retomar el cuestionario" o "rehacer mi perfil".
---

# /inicio — primeros pasos

Deja a una persona nueva con el sistema listo para usar: perfil básico, objetivos fijados y una primera rutina de ejercicio. **Solo lo básico es obligatorio**; todo lo demás se puede saltar y completar después.

## Paso 0 — ¿Dónde estamos?

Leer `datos/perfil/preferencias.md` si existe:

| Situación | Acción |
|---|---|
| No existe `datos/` | Empezar en el Paso 1 |
| `estado_onboarding` ≠ `completado` | Decir en una línea en qué paso quedó y retomar desde ahí |
| `completado` | Preguntar qué quiere rehacer (un bloque del cuestionario, datos médicos, objetivos, entreno) y ejecutar solo eso |

## Paso 1 — Crear `datos/`

1. Copiar el contenido de `plantillas/` a `datos/` **sin sobrescribir ningún archivo existente**:
   - PowerShell: `robocopy plantillas datos /E /XC /XN /XO`
   - bash: `cp -rn plantillas/. datos/`
   - Sin shell: crear cada archivo leyendo su plantilla.
2. Comprobar que `datos/` está en `.gitignore`. Si no lo está, **parar** y avisar: los datos personales se subirían al repositorio.
3. Poner `estado_onboarding: cuestionario` en `datos/perfil/preferencias.md`.

## Paso 2 — Presentación (un solo mensaje, máx. 6 líneas)

- Qué hace Vitals: organiza salud, dieta y entreno en archivos locales.
- **No sustituye a un médico ni a un dietista-nutricionista.** La parte médica ordena datos y prepara preguntas; no diagnostica.
- Todo se guarda en `datos/`, en este equipo, y **no se sube** al repositorio.
- Cualquier pregunta se puede responder con **"salta"**, **"luego"** o **"no sé"**, salvo las básicas.
- Se puede parar en cualquier momento y retomar después con `inicio`.

## Paso 3 — Cuestionario

Preguntas y archivo destino en [`cuestionario.md`](cuestionario.md).

- **Un bloque por mensaje**, preguntas numeradas. Si el entorno permite preguntas con opciones, usarlas para las respuestas discretas (sexo, objetivo, enfoque); el texto libre siempre vale.
- **Obligatorio (bloque 1):** fecha de nacimiento (o edad), sexo biológico, altura y peso actual — y **objetivo principal** (bloque 2). Sin eso no se pueden calcular objetivos. Si la persona no quiere dar el sexo biológico, explicar en una línea que cambia la fórmula del gasto energético; si aun así no lo da, guardar `null` y `objetivos` usará la media de las dos fórmulas avisándolo.
- **Guardar al terminar cada bloque** en su archivo destino, rellenando las claves del frontmatter de la plantilla. Lo saltado queda en `null`. No inventar valores ni rellenar "por defecto" datos de la persona.
- Interpretar respuestas libres con flexibilidad ("unos 80 kilos" → `peso_kg: 80`). Si una respuesta es ambigua y mueve un cálculo, repreguntar **una** vez.
- Vetos, alergias e intolerancias van a `perfil/restricciones.md`: alergias e intolerancias al frontmatter; odios absolutos al bloque A.
- El primer pesaje también va como fila en `registros/pesajes.md`.
- Gustos por alimento y platos **no** se preguntan aquí: son `alimentos` y `platos`, al final.
- Al terminar: `estado_onboarding: medico`.

## Paso 4 — Datos médicos (opcional)

Preguntar: *"¿Tienes analíticas, informes o condiciones médicas que quieras incorporar? (sí / más tarde / no)"*. Con "más tarde" o "no", saltar al Paso 5 y decir que se pueden añadir cuando quiera.

Si sí:

1. **Analíticas** (PDF, foto o texto):
   - Si la persona da una ruta de archivo, copiarlo a `datos/medico/fuentes/` con nombre `analitica-YYYY-MM-DD.pdf` (o la extensión que tenga).
   - Transcribir a `datos/medico/analiticas.md`: **una columna por fecha, cada una con el rango de su propio laboratorio**, marcadores 🔴/🟡/✅. Si no se puede leer el archivo, pedir que dicte los valores fuera de rango.
   - No transcribir datos identificativos (DNI, nº de historia, póliza).
2. **Condiciones, medicación, alergias a medicamentos, antecedentes familiares** → `datos/medico/condiciones.md`.
3. **Síntomas activos** → `datos/medico/sintomas.md`.
4. **Hallazgos**: listar en `condiciones.md` → "Hallazgos analíticos abiertos" los valores fuera de rango, con valor, rango y fecha. **Descriptivo**: el hallazgo es el dato, no una enfermedad.
5. **Reglas dietéticas (bloque B de `restricciones.md`)**: si un hallazgo tiene una relación dietética conocida, proponer la regla con este formato y **validar cada una** con la persona:
   `### Bn. <nombre> — <estricta|preferencia|nota> · origen: <marcador> <valor> (<fecha>, ref <rango>)`
   seguido de qué evitar / limitar / favorecer y, **obligatorio**, qué **no** se restringe (para no filtrar de más). Buscar en la web la evidencia antes de proponer (sin datos identificativos en la búsqueda); citar la fuente con fecha en la sección "Fuentes". Ante la duda sobre el nivel, `preferencia` y "conviene preguntarlo al médico".
6. **Pruebas a preguntar**: si algo lo sugiere, anotarlo en `datos/medico/pruebas-pendientes.md` como *"preguntar si procede…"*, nunca como indicación.

Al terminar: `estado_onboarding: objetivos`.

## Paso 5 — Objetivos

Ejecutar el flujo **`objetivos definir`** (leer y seguir `.agents/skills/objetivos/SKILL.md`). La persona puede decir "acepta el resto" en cualquier punto. Si decide saltarlo, dejarlo anotado: `dieta` y `kcal` avisarán de que faltan objetivos.

Al terminar: `estado_onboarding: entreno`.

## Paso 6 — Plan de ejercicio

Ejecutar **`entreno plan`** (leer y seguir `.agents/skills/entreno/SKILL.md`). Si en el cuestionario se saltó el bloque de ejercicio, preguntar aquí solo lo imprescindible para una primera rutina: dónde puede entrenar, días y minutos por semana, qué odia y molestias actuales. Saltable.

## Paso 7 — Cierre

1. Escribir `datos/NUCLEO.md` siguiendo su plantilla: 5-8 líneas con persona (alias si lo dio, edad, sexo, altura, peso/IMC con fecha), prioridades, objetivo de ingesta, hallazgos médicos abiertos, vetos duros, alergias/medicación y **lo pendiente más importante**.
2. `estado_onboarding: completado`.
3. Cerrar en 4-6 líneas:
   - qué quedó fijado (kcal/proteína, rutina);
   - qué quedó pendiente (lo saltado que más aporta);
   - siguientes pasos sugeridos, en orden: **`alimentos`** (gustos) → **`platos`** (pool de platos) → **`dieta`** (primer plan) → **`kcal`** a diario → pesaje semanal.

## Reglas

- Idioma español (o el de la persona en la conversación; los archivos siguen en español). Fechas ISO, fecha real del sistema.
- **Nunca bloquear por un dato opcional.** Un perfil con huecos que se usa vale más que un cuestionario perfecto abandonado.
- Guardar progresivamente: si la conversación se corta, lo respondido no se pierde.
- No preguntar dos veces lo que ya está en `datos/`.
- **Todo dato personal se escribe solo en `datos/`.** Nunca en `plantillas/`, en las skills ni en la raíz.
