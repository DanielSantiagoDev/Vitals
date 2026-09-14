---
actualizado: null
base_analitica: null          # fecha de la analítica de la que salen las reglas del bloque B
alergias: []                  # alimentarias
intolerancias: []
restricciones_eleccion: []    # [vegetariano, sin_cerdo, sin_lactosa, …]
suplementos_actuales: []
---

# Restricciones

Fuente única para `platos`, `dieta`, `alimentos` y `kcal`. Dos bloques: **A** son vetos por gusto, **B** son reglas derivadas de las analíticas.

> **Alcance.** El bloque B son **orientaciones dietéticas derivadas de analíticas propias**, no una pauta médica. No sustituyen a un médico ni a un dietista-nutricionista. Una indicación médica real tiene siempre precedencia.

## Precedencia

1. **Alergias e intolerancias** — duro, sin excepción.
2. **Bloque B, reglas marcadas `estricta`** — duro.
3. **Bloque A, odios absolutos** — duro.
4. **Bloque B, reglas marcadas `preferencia`** — orientan la composición, no vetan platos.

**Ante conflicto entre una regla médica dura y una preferencia: manda la médica, y se avisa en la respuesta.** No se retira un plato en silencio por motivo médico: se dice por qué.

---

## Bloque A — Vetos por gusto (NUNCA proponer)

(una viñeta por veto; matices como "solo fundido" o "solo en tortilla" en la propia viñeta)

Detalle por alimento en `../dieta/alimentos.yaml`.

---

## Bloque B — Reglas derivadas de las analíticas

Cada regla lleva su origen y fecha. Al llegar una analítica nueva, **revisar este bloque**. Se proponen en `inicio` o tras una analítica, y **se validan con la persona** antes de guardarlas.

<!-- Formato de cada regla:

### B1. <Nombre> — `estricta` | `preferencia` | `nota` · origen: <marcador> **<valor>** <unidad> (<fecha>, ref <rango>)

**Evitar / no proponer:**
- …

**Limitar frecuencia (máx. N veces/semana):**
- …

**Sin restricción — importante para no filtrar de más:**
- … (obligatorio: lo que la regla NO restringe aunque pudiera parecerlo)

**Favorecer:**
- …

**Sustitución explícita** (si aplica): …
**Cómo lo aplica cada skill** (si no es lo estándar): p. ej. "`platos` marca con el tag X en vez de vetar".
-->

(sin reglas todavía)

---

## Cómo lo usan las skills

| Skill | Qué aplica |
|---|---|
| `platos` | Alergias, bloque A completo y reglas `estricta` (no propone). Nunca retira algo por B en silencio: lo dice |
| `dieta` | Todo. `estricta` veta/limita, `preferencia` orienta la composición, `nota` va como nota del plan |
| `alimentos` | Alergias al registrar gustos; reglas `estricta` para avisar si un alimento `encanta` choca |
| `objetivos` | Traduce el bloque B a cifras (fibra, agua) y elige qué reglas se convierten en **vigilancias** de `kcal` |
| `kcal` | **Registra siempre todo, sin juicios ni bloqueos.** Usa el texto de la regla para el aviso de una línea cuando una vigilancia se dispara |

## Fuentes

(evidencia consultada para las reglas del bloque B, con enlace y fecha)

## Historial de cambios

(solo crece: fecha — qué regla cambió y por qué)
