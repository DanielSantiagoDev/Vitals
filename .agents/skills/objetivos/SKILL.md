---
name: objetivos
description: Define, valida y revisa los objetivos de ingesta (kcal, proteína, grasa, carbohidrato, meta de peso) y las vigilancias médicas que el resto del sistema obedece. Usar cuando el usuario diga "/objetivos", "cuántas kcal debo comer", "fija mi objetivo calórico", "recalcula mis macros", "revisa el objetivo", "¿voy bien de déficit?", "sube la proteína", o cuando cambie el peso o llegue una analítica nueva.
---

# /objetivos — objetivos de ingesta

Fija y mantiene **los números que el resto del sistema obedece**: kcal diarias, macros, meta de peso y qué debe avisar `/kcal`. No es un cálculo de usar y tirar: es un valor **guardado y con fecha de caducidad**, que `/dieta` y `/entreno` leen en vez de recalcular por su cuenta.

## Modos

- `/objetivos` → **ver los vigentes**. Leer solo `datos/perfil/objetivos.md`, mostrar el bloque en 8-10 líneas y cuándo toca revisar. Rápido, sin recalcular nada.
- `/objetivos definir` | `recalcular` → **flujo completo** de investigación + validación punto por punto (abajo). Es el modo cuando no hay objetivos, cuando llega una analítica nueva o cuando el peso se ha movido ≥3 kg.
- `/objetivos revisar` → **recalibrar contra la realidad**: contrastar el objetivo vigente con `datos/registros/pesajes.md` y `datos/registros/comidas/`. No rehace el cálculo teórico; ajusta según lo que ha pasado de verdad.
- `/objetivos ajustar <instrucción>` → cambio puntual ("sube la proteína a 180", "bájame 100 kcal", "cambia la meta a 100 kg"). Aplicar, recalcular lo que dependa de ello y guardar. Sin flujo completo.

## Qué lee

`datos/perfil/`: `identidad.md` · `cuerpo.md` · `objetivos.md` · `estilo-vida.md` · `restricciones.md`
`datos/entreno/`: `perfil-entreno.md` · `registro.md`
`datos/registros/`: `pesajes.md` · `diario.md`

**Y sí lee `datos/medico/`** — `analiticas.md`, `hipotesis.md`, `condiciones.md`. Es la única skill de dieta que lo hace, y es deliberado: la profundidad del déficit puede depender de marcadores alterados, del sueño o de condiciones activas. Lo que salga de ahí se destila en el archivo guardado, para que `/dieta` y `/kcal` no tengan que volver a leer nada médico. **Si `medico/` está vacío, seguir sin él y decirlo en P2** ("sin datos médicos: el cálculo no tiene condicionantes clínicos").

## Regla de rol

- **Los números de ingesta son prescriptivos**: se proponen, se deciden, se guardan.
- **Los condicionantes médicos son descriptivos**: entran como *razón para elegir un número más conservador*, nunca como diagnóstico ni como pauta. Si algo depende de una prueba pendiente, la salida es "esto conviene preguntarlo en consulta", y va a `datos/medico/pruebas-pendientes.md`, no aquí.
- Nunca proponer suplementación, medicación ni protocolos clínicos (ayunos terapéuticos, dietas cetogénicas por indicación médica). Si el usuario los pide, se puede calcular el encaje calórico, avisando de que la indicación no sale de aquí.
- Si hay embarazo, lactancia, menores de edad, trastorno de la conducta alimentaria declarado o enfermedad renal/hepática diagnosticada: **no fijar déficit**. Proponer mantenimiento y decir que el objetivo debe fijarlo un profesional.

## Paso 0 — Investigar antes de proponer

1. Leer toda la base de arriba. **No preguntar nada que ya esté ahí.**
2. Detectar los datos que faltan y que moverían el resultado (perímetro de cintura, pasos diarios, alcohol sin cuantificar). Se preguntan **una sola vez, agrupados, en P1** — y se guardan en su archivo, no aquí.
3. **Buscar en la web (máx. 3 búsquedas)** solo para los puntos donde el número dependa de evidencia que no esté ya destilada en la base: ritmos de pérdida seguros, umbrales de proteína según situación, % de peso que mueve un marcador concreto, interacción entre pérdida rápida y un marcador alterado. **Prohibido inventar cifras de referencia de memoria.** Lo que se use como razón se cita con fuente y fecha en el archivo guardado. Sin herramienta de búsqueda: decirlo y usar solo las fórmulas de este archivo.
4. Si una búsqueda contradice algo escrito en la base, decirlo en el punto correspondiente en vez de resolverlo en silencio.

## Paso 1 — Flujo de validación

**Un punto por mensaje.** Formato de cada punto: **dato → propuesta → por qué**, máximo 6 líneas, y la pregunta al final. Preguntar con opciones cuando haya alternativas discretas (profundidad del déficit, meta de peso); texto plano cuando sea confirmar un número.

El usuario puede cortar en cualquier momento con "acepta el resto" → aplicar las propuestas por defecto de los puntos que queden y saltar al Paso 2, listando qué se dio por bueno.

### P1 · Punto de partida y gasto

- Confirmar peso, composición, altura, edad y sexo biológico con su fecha. **Si el pesaje más reciente tiene más de 14 días, decirlo** — el cálculo hereda ese error.
- Calcular la TMB por **dos vías** y dar el rango, no un número único:
  - Mifflin-St Jeor: `10×peso_kg + 6.25×altura_cm − 5×edad + s`, con `s = +5` (hombre) o `s = −161` (mujer). Si `sexo_biologico` es `null`, usar la media de ambas y decirlo.
  - Katch-McArdle: `370 + 21.6×masa_magra_kg` — solo si hay bioimpedancia; recordar que su error absoluto es alto.
- Factor de actividad desde `perfil-entreno.md` + `estilo-vida.md`:
  - Sin actividad estructurada y trabajo sedentario → **1.2**.
  - Actividad diaria real no estructurada (paseos largos, trabajo de pie) → hasta **1.3**, justificándolo.
  - 3 sesiones/semana reales y sostenidas → **1.375**; 5 → **1.55**.
  - **El factor se sube cuando el entreno ya está en `datos/entreno/registro.md`, no cuando se planea.**
- TDEE = rango redondeado a 50.
- Aquí es donde se piden de golpe los datos que falten (paso 0.2), si los hay.

### P2 · Dirección y profundidad

Según el objetivo principal de `objetivos.md`:

- **Perder grasa**: rango de trabajo **15-25 %** de déficit. **El 25 % es techo duro**, no un objetivo.
- **Recomposición, ganar músculo, rendimiento o mantenimiento**: no se aplica el rango anterior. Buscar la referencia (Paso 0.3), proponer mantenimiento o el ajuste que indique la evidencia, y validar igual.

Reglas que empujan al **extremo conservador**, siempre explicadas:

- **Fase sensible**: si `objetivos.md` tiene `fase_sensible` vigente (hoy < `desde` + `semanas`), o una prioridad por encima de la composición corporal que un plan con hambre pondría en riesgo, proponer el extremo bajo y decir por qué.
- **Condicionantes médicos vigentes**: listar cada uno con su marcador y fecha, en una línea. Es el punto donde el usuario ve el coste real de apretar.
- **Sueño malo o sospecha de trastorno del sueño**: la privación de sueño sube el apetito; el mismo déficit cuesta más.

Si el usuario elige un déficit más agresivo del propuesto: **se acepta y se guarda**, dejando escrito cuál era la recomendación y por qué. No se insiste dos veces.

### P3 · kcal objetivo

- `TDEE × (1 − déficit)`, redondeado a 50.
- Traducir a **ritmo esperado**: `déficit_kcal_día × 7 ÷ 7700 ≈ kg/semana`. Dar el ritmo, no solo la cifra: es lo que permite validar en 3 semanas si el número era bueno.
- Definir el **suelo** (`kcal_suelo`): kcal por debajo de las cuales no se baja aunque se estanque.

### P4 · Proteína

- Base: **~2 g/kg de masa magra**, o 1.6-2 g/kg de peso objetivo si no hay bioimpedancia fiable. Redondear a 5 g.
- Es el macro que se protege primero: mantiene masa magra en déficit y sacia.
- Comprobar que las fuentes de proteína disponibles no chocan con el bloque A ni con las reglas `estricta` del bloque B de `restricciones.md` (p. ej., si una regla limita carne roja o pescado, la proteína se cubre con lo permitido). Si el objetivo no es alcanzable con lo permitido, **decirlo aquí**, no en `/dieta`.

### P5 · Grasa, carbohidrato, fibra y agua

- **Grasa**: suelo de ~0.6-0.8 g/kg de peso corporal. Se fija como mínimo, no como cuota.
- **Carbohidrato**: el resto de las kcal. No se fija como diana; es la variable de ajuste.
- **Fibra** y **agua**: si el bloque B de `restricciones.md` fija cifras, copiarlas aquí; si no, proponer una referencia general contrastada (Paso 0.3) y validarla.
- Aplicar las reglas B vigentes que afecten a la composición tal como estén ese día, sin reinterpretarlas.

### P6 · Meta de peso y horizonte

- Proponer la meta como **% de peso perdido**, no como número redondo bonito, y explicar qué desbloquea ese porcentaje según la base médica (si la hay) o según la evidencia general.
- Definir **hitos intermedios** (el primero a 4-6 semanas) y dejar `plazo: null` si el usuario prioriza sostenibilidad.
- Actualizar `meta_peso` en el frontmatter de `datos/perfil/objetivos.md`.

### P7 · Vigilancias para `/kcal`

Este punto **es el contrato con `/kcal`**. Se decide qué avisa y con qué umbral. **Si no hay marcadores alterados, puede no haber vigilancias médicas**: se dice así y solo se añaden las de `alcance: resumen` que el usuario quiera (fibra, hidratación).

> **Una vigilancia es un marcador alterado, no una lista de alimentos.** Se parte de `medico/analiticas.md`: un marcador fuera de rango, la dirección en la que se quiere mover, y **los mecanismos por los que la comida actúa sobre él**. Los alimentos concretos se citan como *ejemplos*, nunca como el disparador.
>
> Una lista siempre se queda corta, y lo que se escapa es justo lo que nadie previó. Si la vigilancia nombra un alimento, sus equivalentes no previstos pasan sin aviso; si describe el mecanismo, todos avisan. `/kcal` razona del mecanismo al alimento, no al revés.

Campos por vigilancia:

- `id` — identificador corto, `snake_case`
- `marcador` — valor, unidad, rango y fecha. Es lo que da autoridad al aviso: se nombra el dato, no una regla abstracta.
- `objetivo` — `bajar` · `subir` · `mantener`
- `reglas` — las del bloque B de `restricciones.md` de las que sale
- `mecanismos` — **cómo** actúa la comida sobre el marcador, redactado de forma que permita reconocer casos nuevos
- `ejemplos` — anclas concretas. Explícitamente **no exhaustivas**
- `no_dispara` — **obligatorio**: los falsos positivos que nunca deben avisar (lo que el propio bloque B dice que no se restringe). Sin este campo, el razonamiento semántico acaba avisando de lo que no hay que restringir
- `alcance` — `comida` · `semana` (+ `umbral`) · `resumen`

Reglas de este punto:

- Máximo **6 vigilancias**. Más que eso convierte `/kcal` en un sermón y se deja de usar. Agrupar por marcador, no por alimento: un marcador con cuatro mecanismos es **una** vigilancia.
- **No se redefine ningún criterio aquí**: los mecanismos se toman del bloque B y de `medico/hipotesis.md`. Si cambian, cambian allí.
- Un marcador que no se pueda detectar desde una comida registrada (hidratación, fibra) va con `alcance: resumen` y se declara explícitamente como recordatorio, no como detección. No fingir una medición que no existe.
- Confirmar con el usuario el **tono**: por defecto, factual y sin juicio ("esto sube X"), nunca valorativo ("mal día").

### P8 · Regla de revisión

Cuándo caduca esto: por peso (≥3 kg de cambio), por tiempo (4-6 semanas), por analítica nueva, o por estancamiento (3 semanas sin movimiento en la tendencia). Guardar como `revisar_si` y `revisar_desde`.

## Paso 2 — Guardar

Todo va a **`datos/perfil/objetivos.md`**, fuente única (si no existe, crearlo desde `plantillas/perfil/objetivos.md`):

1. **Frontmatter**: bloque anidado `ingesta:` con las claves del contrato (abajo). `meta_peso` y `plazo` se actualizan en su sitio, no se duplican dentro de `ingesta`.
2. **Sección `## Objetivos de ingesta`**: los números, el razonamiento de cada uno en una línea, los condicionantes médicos con su marcador y fecha, la tabla de vigilancias y las fuentes consultadas (con fecha).
3. **Historial**: añadir una entrada con fecha, qué cambió y por qué. Esa sección **solo crece**.
4. Si el flujo cambió el factor de actividad o la meta de peso, comprobar que no contradice `perfil-entreno.md` ni `cuerpo.md`; si contradice, corregir el otro archivo — nunca dejar dos verdades.
5. Actualizar la línea de objetivos de `datos/NUCLEO.md` si existe.

### Contrato de datos

Claves que otras skills leen. **Cambiar un nombre aquí obliga a actualizar quien lo lee.**

| clave | uso |
|---|---|
| `kcal_objetivo` | `/dieta` construye el plan · `/kcal` contrasta el día |
| `kcal_suelo` | límite inferior al ajustar |
| `proteina_g` | `/dieta` reparte por comida · `/kcal` contrasta |
| `grasa_min_g` · `fibra_min_g` · `agua_min_l` | mínimos que `/dieta` respeta y `/kcal` puede señalar |
| `deficit_pct` · `tdee_estimado` · `base_peso_kg` | trazabilidad del cálculo y base del recálculo |
| `ritmo_esperado_kg_semana` | criterio de `/objetivos revisar` |
| `factor_actividad` | **lo lee `/entreno`**: cuánto volumen está ya contado y si el gasto sube |
| `vigilancias` | lista que `/kcal` usa para avisar |
| `revisar_desde` | fecha a partir de la cual el objetivo se considera caducado |

**Quién lo lee:**

- `/dieta` — usa estos números en vez de recalcular. Si faltan o están caducados, avisa y sugiere `/objetivos`.
- `/kcal` — contrasta el día contra `kcal_objetivo`, `proteina_g` y `fibra_min_g`, y avisa según `vigilancias`.
- `/entreno` — `factor_actividad` (si sube por entrenar, las kcal se recalculan con `/objetivos recalcular`: **nunca se suman a mano las calorías del ejercicio** al objetivo diario), `meta_peso` y `fase_sensible`.

## Paso 3 — Confirmar

Cerrar en 3-4 líneas: los números finales, qué skills quedan afectadas, cuándo toca revisar. Si algo quedó pendiente de dato (cintura, pasos, alcohol), decirlo como lo único que falta.

## `/objetivos revisar`

No rehace el cálculo teórico. Contrasta:

1. **Tendencia real** de `pesajes.md` — mínimo **3 pesajes en 3 semanas**. Con menos, no se toca nada y se dice por qué.
2. **Ingesta real** de `registros/comidas/` — media diaria y días registrados. **Si se registró menos del 70 % de los días, el objetivo no se juzga: el problema es el registro, no el número.**
3. Diagnóstico:
   - Pérdida < 50 % de `ritmo_esperado_kg_semana` **con ingesta cumplida** → bajar 100-150 kcal, nunca más de una vez por revisión, nunca por debajo de `kcal_suelo`.
   - Pérdida > 1 % del peso por semana → **subir** kcal, con más motivo si hay marcadores que empeoran con la pérdida rápida.
   - Ingesta real muy por encima del objetivo → el problema es adherencia, no aritmética: proponer cambio de plan (`/dieta ajustar`) antes que bajar el número.
4. Guardar el cambio en el historial con el dato que lo justificó.

## Reglas

- Idioma español, fechas ISO, fecha real del sistema.
- **Nunca fijar un número sin que el usuario lo haya validado**, salvo que diga explícitamente "acepta el resto".
- Redondeos: kcal a 50, proteína y grasa a 5 g, peso a 0.5 kg.
- Todo número guardado lleva **por qué** al lado. Un objetivo sin razón escrita no se puede revisar dentro de 6 semanas.
- **Una sola fuente de verdad**: los criterios médicos viven en `restricciones.md` y `medico/`; aquí solo se referencian y se traducen a cifras.
- Si el usuario pide un objetivo que contradice una regla `estricta` del bloque B, aplicarlo si insiste, dejándolo escrito como decisión suya con fecha.
