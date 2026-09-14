# Changelog

## [1.0.0] — 2026-09-14

Primera versión pública.

### Añadido
- **Agnóstico de harness**: instrucciones en `AGENTS.md` y skills en `.agents/skills/` (formato Agent Skills), con compatibilidad para Claude Code vía `CLAUDE.md` (`@AGENTS.md`) y stubs en `.claude/skills/`.
- **Skill `inicio`**: onboarding reanudable — cuestionario, datos médicos opcionales, objetivos de ingesta y plan de entreno. Solo los datos básicos son obligatorios.
- **Skill `entreno`**: rutinas orientativas, registro de ejercicio realizado y revisión de adherencia.
- **`plantillas/`**: esqueletos vacíos que definen el formato de cada archivo de datos.
- **`perfil/preferencias.md`**: reglas de uso y de composición del plan configurables por persona (tomas extra, variedad, batch, comidas libres, raciones).
- `fase_sensible` en `perfil/objetivos.md`: etapa en la que el déficit y el volumen de entreno se mantienen conservadores.

### Cambiado
- Todos los datos personales viven en `datos/`, ignorado por git.
- Skills `objetivos`, `dieta`, `kcal`, `platos`, `alimentos` y `consulta` generalizadas: las reglas personales se leen de `datos/` en lugar de estar escritas en la skill. Mifflin-St Jeor para ambos sexos.
- Las skills describen capacidades (preguntar con opciones, buscar en la web) en lugar de herramientas de un harness concreto.
- Visores movidos a `herramientas/` y apuntados a `datos/`.
