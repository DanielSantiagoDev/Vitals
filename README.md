# Vitals

**Sistema personal de salud, dieta y entrenamiento para agentes de IA.** No es una app: es una base de conocimiento en archivos (Markdown + YAML) y un conjunto de *skills* que un agente —Claude Code, OpenAI Codex, OpenCode u otro compatible— usa para:

- conocerte con un cuestionario guiado y guardar tu perfil;
- organizar analíticas y síntomas y **preparar tus consultas médicas**;
- fijar **objetivos de ingesta** razonados (kcal, proteína, meta de peso);
- generar **planes de comidas** con lista de la compra;
- **registrar lo que comes** por foto o descripción, sin fricción;
- proponer **rutinas de ejercicio** orientativas y registrar lo que haces.

> ⚠️ **Aviso médico.** Vitals no diagnostica ni sustituye a un médico ni a un dietista-nutricionista. La parte médica es **descriptiva**: ordena datos, detecta patrones y prepara preguntas para tu consulta. Las reglas dietéticas derivadas de analíticas son orientaciones. Ante embarazo, enfermedad diagnosticada, trastornos de la conducta alimentaria o cualquier duda, consulta a un profesional.

## Requisitos

- Un agente de IA con acceso a archivos y soporte de skills (`SKILL.md`):
  - **Claude Code** — lee `CLAUDE.md` (que importa `AGENTS.md`) y `.claude/skills/`.
  - **OpenAI Codex** — lee `AGENTS.md` y `.agents/skills/`.
  - **OpenCode** — lee `AGENTS.md`, `.agents/skills/` y `.claude/skills/`.
- Recomendable: que el agente pueda leer imágenes/PDF (analíticas, fotos de comida) y buscar en la web (etiquetas nutricionales).
- Opcional: **Node.js ≥ 18** para los visores de `herramientas/`.

## Primeros pasos

```bash
git clone <url-del-repo> vitals
cd vitals
```

Abre la carpeta con tu agente y escribe **"empezar"** (o `/inicio`). El agente:

1. crea tu carpeta `datos/` a partir de `plantillas/`;
2. te hace el **cuestionario** por bloques — solo edad, sexo, altura, peso y objetivo son obligatorios; todo lo demás se puede saltar;
3. te pide **datos médicos** si quieres aportarlos (analíticas en PDF/foto, condiciones, medicación);
4. calcula contigo tus **objetivos** punto por punto;
5. te propone una primera **rutina de ejercicio**.

El onboarding se puede interrumpir y retomar cuando quieras. Después, lo habitual: `alimentos` → `platos` → `dieta` → `kcal` a diario.

## Skills

| Skill | Para qué | Ejemplos |
|---|---|---|
| `inicio` | Onboarding reanudable | "empezar", "rehacer mi perfil" |
| `objetivos` | kcal, macros, meta de peso y avisos médicos | "cuántas kcal debo comer", "revisa el objetivo" |
| `entreno` | Rutinas, registro y adherencia | "hazme una rutina", "hoy he nadado 30 min" |
| `dieta` | Plan de comidas + lista de la compra (HTML local) | "genera la dieta de la semana", "cambia el martes" |
| `kcal` | Registro de comidas (foto, pesos o descripción) | "me he comido un bocadillo de atún", "cuántas llevo hoy" |
| `platos` | Descubrir y curar tu pool de platos | "platos con garbanzos", "cenas rápidas" |
| `alimentos` | Gustos por alimento | "repasemos las verduras" |
| `consulta` | Informe para llevar al médico | "tengo cita con el médico" |

**Cómo invocarlas:** en lenguaje natural funciona en cualquier harness. Además: `/nombre` en Claude Code y OpenCode; `$nombre` o `/skills` en Codex.

## Estructura

```
AGENTS.md          instrucciones del sistema (fuente única)
CLAUDE.md          importa AGENTS.md para Claude Code
.agents/skills/    skills (formato Agent Skills)
.claude/skills/    stubs que apuntan a .agents/skills/ (Claude Code no lee .agents/)
plantillas/        formato de cada archivo de datos, vacío
herramientas/      visores locales opcionales
datos/             TUS DATOS — ignorado por git, se crea en el onboarding
```

## Privacidad

- **Todo lo personal vive en `datos/`**, que está en `.gitignore`. `git pull` para actualizar el sistema no toca tus datos.
- **No hagas `git add -f datos/`** ni quites esa línea del `.gitignore` si tu fork es público.
- Los planes e informes se generan como **archivos locales**; las skills tienen prohibido publicarlos en servicios externos.
- ⚠️ **Tus datos sí se envían al proveedor del modelo** que uses mientras el agente trabaja con ellos (Anthropic, OpenAI, el que configures en OpenCode…). Revisa su política de datos, o usa un modelo local si no quieres que salgan de tu equipo.
- Haz tu propia copia de seguridad de `datos/`: no está en el repositorio.

## Visores (opcional)

```bash
node herramientas/servir-visor-platos.js
```

```bash
node herramientas/servir-visor-dietas.js
```

- `visor-platos` — tu pool de platos, con edición de estado y tags.
- `visor-dietas` — navega tus planes de comidas por semana.

Solo escuchan en `127.0.0.1` y solo sirven esos archivos.

## Notas por harness

- **Claude Code** no lee `AGENTS.md` ni `.agents/skills/` de forma nativa ([anthropics/claude-code#31005](https://github.com/anthropics/claude-code/issues/31005)); por eso existen `CLAUDE.md` y los stubs.
- **OpenCode** carga tanto `.claude/skills/` como `.agents/skills/`, así que ve cada skill dos veces. Cuál elige no es determinista ([anomalyco/opencode#32202](https://github.com/anomalyco/opencode/issues/32202)), pero es indiferente: el stub remite a la misma skill.
- **Codex** solo lee `.agents/skills/`, así que cada skill aparece una vez en el selector `$`.
- La compatibilidad con Codex y OpenCode se basa en su documentación; **si algo no funciona en tu harness, abre un issue**.

## Licencia

[MIT](LICENSE). Contribuciones bienvenidas: mantén las skills genéricas (ningún dato de una persona concreta fuera de `datos/`) y el idioma en español.
