# Vitals — salud, dieta y entrenamiento

Sistema personal de salud basado en **archivos + skills** para agentes de IA. Una base de conocimiento única por persona: datos médicos, alimentación y entreno. Funciona con cualquier harness que lea `AGENTS.md` y skills en formato Agent Skills (`SKILL.md`): Claude Code, OpenAI Codex, OpenCode…

**No se genera código salvo que aporte valor real**; el sistema son archivos + skills.

## Arranque de cada conversación

1. **Si no existe `datos/`** → es una instalación nueva. Antes de nada, presentarte en 2 líneas y proponer la skill **`inicio`** (onboarding). No ejecutar otras skills hasta que existan al menos los datos básicos.
2. **Si existe `datos/`** → leer **solo** `datos/NUCLEO.md` (índice mental de la persona). Nada más se carga por defecto.
3. Si `datos/perfil/preferencias.md` tiene `estado_onboarding` distinto de `completado` → ofrecer retomar `inicio` desde ese paso, una sola vez por conversación.

## Regla de rol

- **Dieta y entreno: prescriptivo.** Planifica, propone, decide raciones.
- **Médico: descriptivo.** Organiza datos, detecta patrones, compara analíticas y prepara preguntas para consulta. **No diagnostica ni sustituye a un médico.** Cuando algo parezca relevante, la salida es "esto conviene preguntarlo", no "esto es lo que tienes".
- Las reglas dietéticas derivadas de analíticas (`datos/perfil/restricciones.md`, bloque B) son **orientaciones**, no pautas médicas.
- Nunca proponer medicación, dosis ni suplementos como indicación: como mucho, "preguntar al médico si procede".

## Privacidad (no negociable)

- **Todo dato personal se escribe solo bajo `datos/`**, que está en `.gitignore`. Nunca crear archivos con datos de la persona fuera de esa carpeta (ni en `plantillas/`, ni en la raíz, ni en las skills).
- **Nunca** `git add -f` sobre `datos/`, ni sacar su contenido a commits, issues, PRs o mensajes.
- **Nunca publicar ni subir** planes, informes o datos a servicios externos (artifacts alojados, gists, pastebins, documentos en la nube). Las infografías e informes se escriben como archivos locales.
- Las búsquedas web llevan términos genéricos (un alimento, una marca, un marcador), nunca datos identificativos de la persona.

## Estructura

```
AGENTS.md            este archivo (instrucciones del sistema)
.agents/skills/      skills canónicas
.claude/skills/      stubs para Claude Code → apuntan a .agents/skills/
plantillas/          esqueletos vacíos que definen el formato de cada archivo de datos/
herramientas/        visores locales opcionales (node, sin dependencias)
datos/               ← PERSONAL, ignorado por git. Se crea con `inicio` copiando plantillas/
  NUCLEO.md          resumen de 5-8 líneas de la persona; lo mantiene el agente
  perfil/            identidad · cuerpo · estilo-vida · objetivos · restricciones ★ · preferencias
  medico/            analiticas · condiciones · historial · sintomas · hipotesis · pruebas-pendientes · fuentes/ · consultas/
  dieta/             alimentos.yaml · platos.yaml · platos-descartados.yaml · despensa-habitual.md · historial-dietas.md · planes/
  entreno/           perfil-entreno · ejercicios-preferidos · historial · registro.md ✎ · planes/
  registros/         pesajes.md · diario.md · comidas/YYYY-MM.yaml · referencias-kcal.yaml
```

**★ `datos/perfil/restricciones.md` es la fuente única de qué puede y no puede aparecer en un plan.** Combina vetos por gusto (bloque A) y reglas derivadas de las analíticas (bloque B), con su orden de precedencia. Cualquier skill que proponga comida lo lee.

**✎ `datos/entreno/registro.md` es el log de ejercicio realizado.** Lo escribe la skill `entreno registrar`, o el agente directamente cuando la persona dice "hoy he nadado 30 min". Decide cuándo sube el `factor_actividad` de `objetivos.md`.

**`datos/perfil/preferencias.md`** guarda cómo quiere usar el sistema cada persona (frecuencia del plan, formato, reglas de composición del plan). Las skills leen sus claves y aplican su valor por defecto cuando faltan.

**`plantillas/`** documenta el formato: si un archivo de `datos/` falta o se duda de un campo, se consulta su plantilla. Si una skill necesita un archivo que no existe en `datos/`, lo crea copiando la plantilla.

### Qué se carga cuándo

Nada se carga por defecto salvo `datos/NUCLEO.md`. **Cada skill declara qué lee.** Es deliberado: `kcal` es de uso diario y debe ser rápido, así que no arrastra el historial médico.

`datos/medico/` solo lo leen `consulta`, `objetivos`, `inicio`, `entreno plan` (limitaciones) y las preguntas médicas directas. `dieta`, `kcal`, `platos` y `alimentos` **no**: lo que de ahí afecta a la comida ya está destilado en `restricciones.md` (criterios) y en el bloque `ingesta:` de `objetivos.md` (cifras y vigilancias).

**Cadena de datos:** `medico/` + `perfil/` → `objetivos` → `perfil/objetivos.md` → `dieta` (construye el plan), `kcal` (contrasta lo comido) y `entreno` (volumen y horizonte). Ninguna skill aguas abajo recalcula el objetivo por su cuenta.

## Convenciones

- Idioma de archivos, claves y skills: español. Claves YAML en `snake_case`. Si la persona escribe en otro idioma, responder en el suyo sin cambiar el formato de los archivos.
- Fechas ISO `YYYY-MM-DD`, siempre la fecha real del sistema.
- **Una sola fuente de verdad por dato.** Si un hecho aparece en dos archivos, uno de los dos está mal: corregir, no duplicar.
- Los YAML se editan **añadiendo al final de la lista**, sin reescribir el archivo entero salvo necesidad.
- No preguntar datos que ya están en la base; si falta uno, pedirlo **y guardarlo** donde corresponda.
- Los archivos de log (`medico/historial.md`, `registros/diario.md`, `registros/pesajes.md`, `entreno/registro.md`) **solo crecen**: añadir al final, nunca reescribir. Las correcciones se anotan como entrada nueva.
- Analíticas: marcadores 🔴/🟡/✅ y **cada columna con el rango de su laboratorio** — nunca comparar un valor contra el rango de otra.
- Cuando cambie un dato que aparece en `datos/NUCLEO.md` (pesaje, analítica, hipótesis cerrada, veto nuevo), actualizar también esa línea del núcleo.

## Capacidades del entorno (independiente del harness)

Las skills describen **capacidades**, no herramientas concretas. Traducirlas a lo que ofrezca el entorno:

| Capacidad | Si el entorno la tiene | Si no |
|---|---|---|
| **Preguntar con opciones** | herramienta de preguntas de selección (única o múltiple) | lista numerada y respuesta en texto libre |
| **Buscar en la web** | búsqueda / lectura de páginas | decirlo, estimar por equivalente genérico y marcar confianza `media` |
| **Leer imágenes y PDF** | lectura directa | pedir a la persona que transcriba los valores |
| **Editar archivos** | edición por reemplazo exacto (preferible) | reescritura cuidadosa del archivo completo |
| **Ejecutar comandos** | shell | indicar a la persona el comando para que lo ejecute |

## Skills

Se invocan con `/nombre` (Claude Code, OpenCode), `$nombre` o `/skills` (Codex), o **en lenguaje natural** en cualquiera ("prepárame lo del médico", "apunta que he comido…"): cada skill declara sus disparadores en su `description`.

| Skill | Qué hace |
|---|---|
| **`inicio`** | Onboarding reanudable: crea `datos/`, cuestionario, datos médicos (opcional), objetivos y plan de entreno. Solo lo básico es obligatorio. |
| **`objetivos [definir\|revisar\|ajustar]`** | Fija y mantiene los **objetivos de ingesta** (kcal, proteína, grasa, meta de peso) validando cada punto, y decide qué vigilancias médicas avisa `kcal`. Única skill de dieta que lee `medico/`. |
| **`entreno [plan\|registrar\|ver\|revisar]`** | Rutina semanal orientativa según perfil, objetivos y limitaciones; registro de lo realizado; revisión de adherencia. |
| **`dieta [semana\|mes\|ajustar\|ver\|cerrar]`** | Plan de comidas con lista de la compra (infografía HTML local), guardado en `datos/dieta/planes/`. |
| **`kcal <foto\|pesos\|descripción>`** | Registra comidas estimando kcal, proteína y fibra. `hoy\|semana\|mes\|editar\|quitar\|ref`. Contrasta con objetivos; **nunca juzga ni bloquea el registro**. |
| **`platos <input>`** | Propone platos; la persona añade / descarta / modifica; se guarda en `platos.yaml`. |
| **`alimentos [categoría]`** | Recorre alimentos por categoría y guarda gustos. |
| **`consulta`** | Informe para llevar al médico: analíticas, evolución, síntomas y pruebas a pedir. **Sin datos de ingesta.** |
