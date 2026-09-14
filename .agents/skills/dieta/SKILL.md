---
name: dieta
description: Genera el plan de comidas (semanal por defecto, o mensual = 4 semanas) a partir de la base de conocimiento, con infografía HTML local (calendario + lista de la compra) y persistencia en datos/dieta/planes/. Usar cuando el usuario diga "/dieta", "genera la dieta de la semana/mes", "plan de comidas", "qué como esta semana", "lista de la compra", "regenera el plan", "cambia el martes".
---

# /dieta — generar el plan de comidas

## Modos
- `/dieta` → según `plan_frecuencia` de `datos/perfil/preferencias.md` (por defecto `semanal`).
- `/dieta semana [YYYY-MM-DD]` → plan de 7 días (lunes a domingo). Sin fecha: la próxima semana que empieza en lunes (o la actual si hoy es lunes).
- `/dieta mes [YYYY-MM]` → 4 semanas. Se generan las 4 pero se marca la 1ª como "activa" y las demás como "borrador revisable": recomendar regenerar semana a semana según pesajes.
- `/dieta ajustar <instrucción>` → modificar el plan activo ("cambia el martes cena por udon", "quita el pescado esta semana", "menos calorías") y regenerar infografía + lista de la compra.
- `/dieta ver` → mostrar el plan activo.
- `/dieta cerrar` → al terminar la semana: pedir feedback (qué platos gustaron/valoración, qué no se cocinó, peso), actualizar `valoracion`, `ultima_vez`, `estado` en `platos.yaml`, añadir pesaje a `datos/registros/pesajes.md` y notas a `datos/dieta/historial-dietas.md`.

## Paso 1 — Leer contexto (siempre)
- `datos/perfil/objetivos.md` — **bloque `ingesta:` del frontmatter: es el objetivo energético del plan** (ver paso 2), además de la jerarquía de prioridades
- `datos/perfil/preferencias.md` — **bloque `plan:`**: reglas de composición de esta persona (tomas extra, variedad, batch, comidas libres, raciones, medidas caseras)
- `datos/perfil/cuerpo.md`, `datos/perfil/restricciones.md`, `datos/perfil/estilo-vida.md`
- `datos/dieta/platos.yaml`, `platos-descartados.yaml`, `alimentos.yaml`, `despensa-habitual.md`
- `datos/dieta/planes/` (últimos planes: para no repetir la misma rotación) y `datos/registros/pesajes.md` (tendencia)
- `datos/entreno/perfil-entreno.md` y el plan activo de `datos/entreno/planes/` si existe (días de entreno → algo más de carbohidrato ese día si aplica)

No leer `datos/medico/`: lo que de ahí afecta a la comida ya está destilado en `restricciones.md` y en `objetivos.md`.

No preguntar nada que ya esté ahí. Si falta algo crítico, preguntar una sola vez y guardarlo en el archivo correspondiente. Si una clave de `plan:` no existe, usar el valor por defecto indicado abajo.

## Paso 2 — Objetivo energético (leído, no recalculado)

**Los números salen del bloque `ingesta:` de `datos/perfil/objetivos.md`**, que fija y valida la skill `/objetivos`: `kcal_objetivo`, `proteina_g`, `grasa_min_g`, `fibra_min_g`, `agua_min_l`. Esta skill **no vuelve a calcular el TDEE ni elige el déficit por su cuenta** — si lo hiciera habría dos verdades.

Comprobaciones antes de usarlos:
- **No existe el bloque `ingesta:`** → parar y pedir `/objetivos definir`. No inventar un objetivo para salir del paso.
- **Caducado** (hoy > `revisar_desde`, o el peso de `pesajes.md` se ha movido ≥3 kg respecto a `base_peso_kg`) → avisar en una línea, generar el plan igualmente con lo que hay, y sugerir `/objetivos revisar`.
- Si el usuario pide en la instrucción un objetivo distinto ("esta semana más suave"), aplicarlo **solo a este plan** y decirlo en la infografía. Lo guardado no se toca desde aquí.

Mostrar el objetivo diario en la infografía como rango redondeado ("~2 000–2 200 kcal · ~150 g proteína · ~30 g fibra"), y por comida un reparto orientativo.

## Paso 3 — Construir el plan

Reglas de composición. Las marcadas *(preferencias)* se leen de `plan:`; entre paréntesis, el valor por defecto.

- **Estructura del día**: según `horarios_comidas` de `estilo-vida.md` (por defecto desayuno, comida y cena). Añadir cada entrada de `plan.tomas_extra` *(preferencias; ninguna)* en su hora, con su `etiqueta` visible en el plan y siguiendo su `criterio` y `ejemplos`.
- **Pool**: solo platos de `platos.yaml` con estado `me_gusta` o `por_probar`. Máx. `plan.por_probar_max_semana` *(3)* `por_probar` por semana; el resto conocidos. Nunca descartados; nunca ingredientes `no_gusta`.
- **Restricciones** (`restricciones.md`, en su orden de precedencia):
  - **Alergias e intolerancias**: duro, sin excepción.
  - **Bloque A** (vetos por gusto): nunca.
  - **Bloque B `estricta`**: vetar o limitar exactamente como diga cada regla, incluidas sus frecuencias máximas por semana. **Respetar también sus listas de "sin restricción"**: no filtrar de más.
  - **Bloque B `preferencia`**: orientan qué platos priorizar, no vetan.
  - **Bloque B `nota`**: se incluyen como nota informativa del plan.
  - Si una regla propone una **sustitución** (p. ej. una bebida por su versión sin azúcar) o una nota de hidratación, incluirla de forma explícita en el plan.
- **Variedad**: ningún plato de comida, cena o toma extra se repite en un margen menor a `plan.variedad_min_dias` *(2)* días — con 2, nunca en días consecutivos. Las tomas de `plan.variedad_excepciones` *(desayuno)* pueden repetirse sin restricción. Alternar proteínas y cocinas (`cocinas_favoritas` de `estilo-vida.md`) a lo largo de la semana. Priorizar platos con `ultima_vez` antigua o null.
- **Batch cooking** (solo si `batch_cooking_ok` en `estilo-vida.md`): si `plan.batch_respeta_variedad` *(true)*, comer el mismo batch en días consecutivos incumple la variedad igual que cocinarlo dos veces: separarlo con al menos 1 día sin ese plato. Máx. `plan.batch_max_preparaciones_semana` *(2)* preparaciones base por semana; no convertir la semana en tuppers.
- **Tiempo**: recetas ≤ `plan.tiempo_max_entre_semana_min` (o `tiempo_cocina_entre_semana_min` de `estilo-vida.md`; *60*) entre semana. Los platos largos, en fin de semana o batch.
- **Comidas libres**: `plan.comidas_libres_semana` *(0)*, en `plan.comida_libre_cuando`, siguiendo `plan.comida_libre_criterio`. Se planifican, no se pesan.
- **Desayunos**: si el pool no tiene desayunos, proponer 3–4 básicos compatibles con todas las restricciones, decir que no vienen del pool y sugerir una tanda `/platos desayunos`.
- **Bebidas**: según `plan.bebidas` *(agua)*.

### Cantidades: cada ingrediente lleva su medida

**Todo plato del plan se desglosa en sus ingredientes con una cantidad al lado.** El objetivo es que se vean las proporciones — cuánta proteína frente a cuánto hidrato — no que se cocine con báscula de precisión.

**Qué unidad usar. Manda la que se entienda de un vistazo:**

- **Gramos** cuando la cantidad no es evidente y el peso importa: carne, pescado, arroz, pasta, legumbre, queso, frutos secos, hummus, harina, pan rallado. Redondear a múltiplos de 10 g (o de 25 g por encima de 100 g). Nunca "187 g".
- **Unidades o medidas caseras** cuando el alimento viene en piezas o el gramo no aporta nada: `1 limón`, `2 rebanadas de pan`, `2 huevos`, `½ cebolla`, `2 dientes de ajo`, `1 lata de atún`, `1 yogur`, `2 tortillas de trigo`, `1 chorrito de aceite`. **Escribir "100 g de limón" es un error**: se pone la pieza.
- **Ambas** cuando la pieza varía mucho y el peso decide la ración: `2 filetes de merluza (~300 g)`, `2-3 muslos de pollo (~350 g con hueso)`.
- **Sin cantidad**: especias, sal, hierbas, ajo en sofrito, y **la comida libre**.

**Convenciones:**
- Arroz, pasta y legumbre seca **en crudo**; si es legumbre de bote, en **escurrido** y decirlo.
- Carne y pescado **en crudo**, y avisar cuando lleva hueso.
- Aceite en **ml** o en "chorrito" (≈10 ml). Si `plan.medidas_caseras` define medidas propias (p. ej. `chorreton_g`), usarlas con ese nombre.
- Las cantidades son **para `plan.raciones_para` *(1)* persona(s)**, y el plan lo dice una vez arriba.

**Coherencia con el objetivo:** la suma de las cantidades del día tiene que acercarse a `kcal_objetivo`, `proteina_g` y `fibra_min_g`. Poner **kcal, proteína y fibra aproximadas por día** en el plan y en la infografía. Un plan con gramos que no suman es peor que uno sin gramos.

**Cómo corregir un día corto de proteína u otra macro:** nunca añadir un "refuerzo" como nota suelta con un ingrediente que no pega con la comida ("+250 g de pollo" colgado de una ensalada de fruta) — **ni colarlo dentro del propio plato solo porque el hueco de kcal encaja.** Que un ingrediente quepa en el presupuesto calórico de una receta no significa que combine con ella: el pollo en un guiso de legumbre vegetariano es el mismo error, mejor camuflado. La opción por defecto es la 1; la 2 es la excepción:

1. **Añadir una toma extra ese día — vía por defecto.** Un picoteo a media mañana o una merienda más generosa, con su propio desglose de ingredientes y kcal, igual que cualquier otra toma. Puede ser una combinación suelta razonable (yogur + fiambre + frutos secos) compatible con las restricciones. Nunca puede "no pegar", porque no se injerta en nada.
2. **Ampliar una toma ya existente — solo si el plato ya admite ese ingrediente de forma reconocible.** ¿Es una variante habitual de ese plato concreto, o algo que el pool ya asocia con él? Si hay la más mínima duda, usar la vía 1. Sí vale: más cantidad de un ingrediente que la receta ya lleva, o uno que ya está en `ingredientes_clave` del plato. No vale: cualquier ingrediente que cambie lo que el plato *es*.

Si con eso el día se queda igualmente por debajo del objetivo, decirlo con la cifra real en una nota ("día de legumbre, se queda en ~104 g") en vez de forzar más añadidos. Un día corto con cifra honesta es mejor que uno que la alcanza a base de mezclas que no pegan.

**Kcal y fibra por toma:** además del total del día, cada toma individual (desayuno / media mañana si la hay / comida / tomas extra / cena) lleva su **kcal y fibra aproximadas** junto al nombre del plato — en el plan persistido y en la infografía. Kcal redondeada a la decena, fibra al gramo; el total del día es la suma de sus tomas.

**Esto no cambia `/kcal`.** Ahí el registro sigue siendo aproximado. Aquí se prescribe una ración; allí se estima lo que se comió.

## Paso 4 — Lista de la compra
- Solo si `lista_compra` *(true)* en `preferencias.md`.
- Agregar ingredientes de todos los platos de la semana, restar lo de `despensa-habitual.md`, y agrupar por tienda según `donde_compra` y `frecuencia_compra` de `estilo-vida.md` (formatos grandes y congelables a la tienda de compra grande; frescos a la de frescos). Sin tiendas declaradas, agrupar por categoría (fruta y verdura, carne y pescado, lácteos, despensa, congelados).
- Cantidades aproximadas por raciones; indicar para cuántos se cocina (`cocina_para` de `estilo-vida.md`; si no está claro, 1 y "×2 si sois dos").
- Sección "batch": qué cocinar y cuándo.

## Paso 5 — Salida
1. **Infografía HTML — 100 % local, nunca se publica** (si `formato_plan` es `infografia_html`, valor por defecto). Escribirla directamente como archivo. **Nunca subirla a servicios externos** (artifacts alojados, gists, documentos en la nube): contiene peso, objetivos y hábitos. HTML autocontenido: CSS inline, sin fuentes ni recursos externos, para que abra igual sin conexión. Contenido:
   - Cabecera: semana (fechas), objetivo kcal/proteína/fibra, peso del último registro, nº platos nuevos.
   - **Calendario semanal**: columnas L–D, filas por toma (incluidas las tomas extra y una fila **media mañana** solo en los días que la lleven); cada celda: nombre del plato, **su kcal y fibra aproximadas**, **su desglose de ingredientes con cantidades**, badge `nuevo` para `por_probar`, tiempo aprox., marca de batch/comida libre/etiqueta de toma extra. Cada día cierra con sus **kcal, proteína y fibra aproximadas**.
   - Lista de la compra por tienda con checkboxes.
   - Bloque "preparación": qué hacer el día de batch, descongelar qué día.
   - Notas: comida libre, tomas extra, notas del bloque B, recordatorio de pesaje semanal.
   Estilo limpio, legible en móvil, tema claro/oscuro vía `prefers-color-scheme`.
2. **Persistir** en `datos/dieta/planes/YYYY-Www.md` (semana ISO; para un mes, 4 archivos + `YYYY-MM.md` índice) con: frontmatter (`semana`, `inicio`, `fin`, `kcal_objetivo`, `proteina_g`, `fibra_min_g`, `estado: activo|borrador|cerrado`) + tabla del calendario en markdown + lista de la compra. El HTML se guarda junto al md (`YYYY-Www.html`). Pasar el plan activo anterior a `cerrado` si ya terminó su semana.
3. Actualizar `ultima_vez` de los platos usados **solo al cerrar** la semana (`/dieta cerrar`), no al planificar.
4. Confirmar en 2–3 líneas: ruta del plan y del HTML (se abre con doble clic; también con `node herramientas/servir-visor-dietas.js`), platos nuevos incluidos, y sugerencias de tandas `/platos` si el pool quedó corto en algún tipo de comida.

## Reglas
- **Todo 100 % local.** Nunca subir el plan, la infografía o la lista de la compra a internet.
- Nunca inventar platos fuera del pool salvo desayunos, tomas extra y tomas de corrección básicas (y decirlo explícitamente).
- Si el pool tiene < 15 platos aptos para comida/cena, avisar de que habrá repeticiones y sugerir `/platos`.
- Cifras calóricas y de fibra siempre como aproximaciones. Las **cantidades por ingrediente son obligatorias**, pero redondeadas.
- Idioma español; fechas ISO; fecha real del sistema.
