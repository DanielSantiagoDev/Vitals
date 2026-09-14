---
name: kcal
description: Registra comidas y estima kcal, proteína y fibra a partir de foto, pesos, descripción libre o descripción vaga. Usar cuando el usuario diga "/kcal", pase una foto de comida, diga "me he comido X", "apunta 200g de pollo", "cuántas kcal llevo hoy", "resumen de la semana", o pida corregir/ver el registro de comidas.
---

# /kcal — contar calorías, proteína y fibra

Sistema de tracking **aproximado, sin fricción**. El usuario apunta lo que come de la forma más vaga que quiera; tú estimas, guardas y no le haces perder tiempo. Regla de oro: **antes cerrar una estimación razonable que pedir precisión**.

**Qué hace y qué no:**

- **Registra y cuenta.** No es una skill de planificación: no propone comidas, no corrige lo que ya se ha comido, no manda repetir nada.
- **Contrasta contra los objetivos** de `datos/perfil/objetivos.md` (salvo `kcal_contrasta_objetivos: false` en `preferencias.md`): cuánto llevas del día en kcal, proteína y fibra, y el desvío frente al plan activo si lo hay.
- **Avisa** cuando lo registrado choca con una vigilancia médica activa (ver Paso 5). El aviso es **factual y de una línea**: describe el efecto, no valora la decisión.
- **La fibra se muestra y se cuenta igual que kcal/proteína, pero nunca genera aviso por comida.** Solo se comenta en `/kcal hoy|semana|mes`.
- **Nunca juzga el día como "bien/mal"**, nunca acumula reproches, nunca bloquea el registro. Un día pasado de kcal se registra igual de rápido que uno normal — si registrar un exceso da pereza, el sistema deja de servir.

## Modos
- `/kcal <texto>` o foto adjunta → **registrar** (modo por defecto).
- `/kcal hoy` | `ayer` | `<YYYY-MM-DD>` → resumen de ese día (comidas, totales, confianza).
- `/kcal semana` | `mes` → agregados: total y media diaria de kcal, proteína y fibra **frente al objetivo**, días registrados vs días del periodo, comidas más repetidas, vigilancias disparadas (ver Paso 5c).
- `/kcal editar <lo que sea>` → corregir la última entrada o la que indique ("la comida de ayer eran 300g no 200").
- `/kcal quitar` → borrar la última entrada (o la indicada), confirmando cuál.
- `/kcal ref [filtro]` → ver/editar `datos/registros/referencias-kcal.yaml`.

## Archivos
- `datos/registros/comidas/YYYY-MM.yaml` — el registro (esquema en `datos/registros/comidas/README.md`).
- `datos/registros/referencias-kcal.yaml` — kcal, proteína y fibra memorizadas de **ingredientes y productos de marca** (nunca platos completos), para que lo mismo valga siempre lo mismo.
- `datos/perfil/objetivos.md` — bloque `ingesta:` del frontmatter: `kcal_objetivo`, `proteina_g`, `fibra_min_g` y `vigilancias`. **Leer solo el frontmatter**, no el resto del archivo.
- `datos/perfil/cuerpo.md` — **solo el frontmatter** (peso, sexo): escala las raciones típicas del Paso 2c.
- `datos/perfil/estilo-vida.md` — **solo** `horarios_comidas`, para inferir el tipo de comida.
- `datos/perfil/restricciones.md` — contexto de qué come/no come y **texto de las reglas del bloque B** a las que apunte una vigilancia disparada. Leerlo solo si hay vigilancia disparada.
- `datos/dieta/platos.yaml` — si lo comido coincide con un plato del pool, usar sus ingredientes para estimar.
- `datos/dieta/planes/` — **solo el plan `estado: activo`**, y solo para saber qué tocaba hoy. Si no hay plan activo, no se busca más.

No lee `datos/medico/`: lo que de ahí afecta a `/kcal` ya está destilado en `vigilancias` y en el bloque B.

## Paso 1 — Leer antes de estimar
Siempre `referencias-kcal.yaml`. Si el **ingrediente o producto** ya está ahí, **usar ese valor tal cual** (kcal, proteína y fibra si la tiene; no reestimar, no "afinar"). Si no está y es algo que se va a repetir, se añadirá en el paso 4.

Si la descripción encaja con un plato de `platos.yaml`, usar sus `ingredientes_clave` como base de la estimación.

## Paso 1 bis — Productos con marca: NUNCA inventar, buscar
Si el usuario nombra una **marca o referencia concreta** (un producto de supermercado, un pan de marca, un menú de una cadena...), **está prohibido estimar de memoria** sus valores nutricionales.

1. Mirar `referencias-kcal.yaml`: si el producto exacto ya está con `fuente_dato`, usarlo tal cual.
2. Si no está: **buscar en la web** la tabla nutricional real — web oficial de la marca, ficha del supermercado, Open Food Facts. Contrastar al menos que dos fuentes cuadren si la primera no es oficial.
3. Ojo a la **variante exacta** (original vs chocolate vs 0 % azúcares) y al **peso por unidad**: cambian mucho entre variantes. Si el usuario no precisa la variante, asumir la **básica/original** y decirlo en la respuesta para que pueda corregir en una línea.
4. Guardar el resultado en `referencias-kcal.yaml` con `fuente_dato: "<origen> (consultado YYYY-MM-DD)"` y confianza `alta`.
5. Si la búsqueda no da nada, o el entorno no permite buscar, estimar por producto genérico equivalente, decirlo explícitamente ("no he encontrado la etiqueta, estimo como galleta de desayuno genérica") y marcar confianza `media`.

Esto no rompe la regla de no bloquear el registro: la búsqueda la haces tú, no se le pregunta nada al usuario.

## Paso 2 — Estimar según el tipo de input

**a) Con pesos ("180 g de pollo, 70 g de arroz crudo")** → confianza `alta`.
Desglosar por item. Ojo crudo vs cocinado: arroz/pasta/legumbre crudos ≈ ×3 en peso cocinado; si el usuario no especifica, asumir **cocinado** para arroz/pasta y decirlo.

**b) Con foto** → confianza `media`.
- Identificar los componentes del plato y estimar volumen con referencias visuales: plato llano ≈ 26 cm, plato hondo ≈ 22 cm, tenedor ≈ 19 cm, lata de refresco ≈ 12 cm, mano.
- Estimar el aceite invisible: cualquier salteado/plancha/guiso casero lleva 10–20 g de aceite (90–180 kcal) que no se ven. **Nunca olvidarlo** — es el error más común.
- Si la foto trae datos (etiqueta nutricional, gramaje, ticket, pantalla de báscula), esos mandan sobre la estimación visual → confianza `alta`.
- Si la foto es de un envase/etiqueta, leer la tabla nutricional y multiplicar por la ración real.
- Si el entorno no puede leer imágenes, pedir una descripción breve y seguir por c).

**c) Descripción libre sin pesos ("pollo con arroz y ensalada")** → confianza `media`.
Raciones típicas de referencia para un adulto con hambre normal: carne/pescado 150 g, arroz/pasta cocidos 200 g, legumbre cocida 250 g, pan 60 g, aceite 10-15 g. **Escalar según `cuerpo.md`**: hacia arriba (~+20-30 %) en personas grandes o de peso alto, hacia abajo en personas pequeñas; decirlo en las asunciones.

**d) Vago de verdad ("he picado", "cené fuera", "un kebab")** → confianza `baja`.
Estimar por el escenario completo y dar el número directamente. Restaurante/fast food: asumir raciones grandes y aceite abundante. Un kebab ≈ 900–1100 kcal, una hamburguesa de menú con patatas ≈ 1100–1400, una pizza mediana entera ≈ 1200–1600. Elegir el punto medio y anotarlo como `baja`.

**Cuándo preguntar**: solo si la respuesta movería el resultado **más de ~250 kcal** y no hay forma razonable de asumir (típico: "¿te lo comiste entero o la mitad?", "¿esa pizza era individual o familiar?"). Máximo **una** pregunta, y siempre acompañada de tu estimación por defecto para que el usuario pueda simplemente decir "sí, va". Nunca preguntar por marcas, gramos exactos ni tipo de aceite.

**e) Fibra — estimarla junto a kcal y proteína, no aparte.**
Se estima por categoría del alimento, con la misma tolerancia que el resto del registro.
- **Alto en fibra** (contar de verdad): legumbres (~7-9 g/100 g cocidas), integrales — pan, arroz, pasta integral (~6-8 g/100 g), verdura y hortaliza (~2-4 g/100 g), fruta entera con piel/pulpa (~2-3 g/100 g), frutos secos (~5-10 g/100 g).
- **Bajo pero no cero**: pan/arroz/pasta blancos (~2-3 g/100 g), patata (~2 g/100 g).
- **Cero o despreciable**: carne, pescado, huevo, lácteos, aceites, azúcar, la mayoría de fiambres y embutidos.
- Un plato mixto se estima sumando la fibra de sus componentes; con acertar el orden de magnitud vale.
- Si el ingrediente ya tiene `fibra_g` en `referencias-kcal.yaml`, usar ese valor tal cual.

## Paso 3 — Responder
Formato compacto, sin preámbulos:

```
🍽️ Comida · 14:00 · confianza media
Pollo a la plancha con arroz y ensalada
  · pechuga de pollo ~180 g ....... 300 kcal · 56 g P · 0 g F
  · arroz blanco cocido ~220 g .... 290 kcal ·  5 g P · 1 g F
  · ensalada + 10 g aceite ........  110 kcal ·  1 g P · 2 g F
  ─────────────────────────────────────────────
  700 kcal · 62 g proteína · 3 g fibra

Hoy: 1 340 / 2 100 kcal · 98 / 160 g proteína · 9 / 30 g fibra  (2 comidas · quedan ~760)
```

- Redondear kcal a 10, proteína a 1 g y fibra a 1 g.
- La línea `Hoy` va **contra objetivo** cuando `objetivos.md` tenga el bloque `ingesta:`. Sin objetivos guardados, se muestra el total a secas y **una sola vez** se sugiere `/objetivos`; no repetirlo en cada registro.
- La columna de fibra por item se puede omitir en la respuesta cuando el plato es evidentemente cero-fibra — pero siempre se guarda en el YAML, aunque sea 0.
- Decir en una línea las asunciones que hiciste ("asumo arroz ya cocido y ~10 g de aceite").
- Con confianza `baja`, dar el rango además del número: "~1 000 kcal (rango 850–1 200)".
- No añadir consejos, valoraciones ni "podrías mejorar" salvo que el usuario pregunte.
- Si el Paso 5 genera desvío o aviso, va **debajo** de esa línea, no intercalado en el desglose.

## Paso 4 — Persistir
1. Si no existe `datos/registros/comidas/YYYY-MM.yaml` del mes en curso, crearlo con `dias: []`.
2. Añadir la comida al día correspondiente (crear el día si es el primero). Cada item lleva su `fibra_g` (0 si no aporta), cada comida su `fibra_g` total, y cada día su `total_fibra_g`. Recalcular `total_kcal`, `total_proteina_g`, `total_fibra_g` y `confianza_dia` de ese día.
3. **Hora y tipo**: si el usuario no los dice, inferir de la hora real del sistema y de `horarios_comidas` de `estilo-vida.md` (por defecto: desayuno por la mañana, comida a mediodía, merienda a media tarde, cena por la noche); fuera de esas franjas, `picoteo`.
4. **Referencias**: guardar solo **ingredientes, productos de marca y raciones estándar** que se vayan a repetir (o actualizar su `veces_usada`) en `referencias-kcal.yaml`, incluyendo `fibra_g` cuando el alimento aporte algo. **NUNCA guardar platos completos**: los ingredientes y cantidades cambian de un día a otro, así que un plato se calcula siempre desde cero sumando sus componentes.
5. Nunca recalcular registros pasados aunque una referencia cambie. **Los registros sin `fibra_g`** (anteriores a que se registrara) no se rellenan retroactivamente: cuentan como dato ausente, no como 0.

## Paso 5 — Contraste y avisos

Va después del registro, **nunca antes**: primero se guarda, luego se comenta. Máximo **3 líneas en total** entre desvío y avisos. Si no hay nada que decir, no se dice nada.

### a) Desvío frente al plan

Solo si existe un plan con `estado: activo` en `datos/dieta/planes/` que cubra la fecha de hoy y **lo comido no es lo planificado**:

```
📋 Plan de hoy: pollo al curry con arroz (~700 kcal). Registrado: kebab (~1 050). +350 kcal.
```

- Una línea. Sin "deberías", sin proponer compensar mañana, sin reordenar el plan.
- Si el usuario quiere rehacer el plan, ya existe `/dieta ajustar`; mencionarlo **solo si pregunta**.
- Si lo comido coincide razonablemente con lo planificado, **no decir nada**. Confirmar aciertos también es ruido.

### b) Vigilancias médicas

Cada vigilancia de `objetivos.md` es un **marcador alterado con sus mecanismos**, no una lista de alimentos prohibidos. La comprobación es **semántica, no de coincidencia**:

> Para cada vigilancia, preguntarse: *¿algo de lo que acaba de registrarse actúa sobre este marcador, en la dirección contraria al objetivo, por alguno de sus `mecanismos`?*

**El campo `ejemplos` son anclas, no la lista de disparo.** Un alimento que no esté nombrado pero actúe por el mismo mecanismo **avisa igual**. Razonar desde el mecanismo hacia el alimento, nunca al revés — una lista siempre se queda corta.

El **contexto del marcador es lo que da autoridad al aviso**: se nombra el valor y su fecha, no una regla abstracta. Formato (valores de ejemplo, ficticios):

```
⚠️ Refresco azucarado: la fructosa añadida eleva el urato (ácido úrico 8.4 el 2026-01-15,
   ref 3.5-7.2). Agua abundante hoy.
```

Reglas del aviso — importan más que el aviso:

- **Umbral de materialidad.** Solo avisa una cantidad que mueva el marcador de verdad: un plato entero de un alimento implicado sí, una guarnición testimonial no. Ante la duda de si es material, no avisar.
- **`no_dispara` es vinculante.** Es la lista de falsos positivos y se respeta sin excepción. Si el razonamiento semántico lleva a algo que está en `no_dispara`, el razonamiento está mal.
- **Máximo 2 avisos por comida**, solo por lo registrado en **esa** comida.
- **Solapamiento: un aviso, no dos.** Si el mismo alimento activa dos marcadores, se da **un solo aviso que nombre los dos**.
- **Factual, nunca valorativo.** Se describe el mecanismo y, si cabe, la contramedida barata (agua, verdura). Nunca "esto está mal", "te has pasado", "cuidado con eso".
- **Nunca repetir el mismo aviso dos veces en el mismo día.**
- `alcance: semana` (+`umbral`) se comprueba contra el registro de la semana en curso y **solo avisa al superar el umbral**. `alcance: resumen` no avisa nunca en una comida: solo en `/kcal semana|mes`.
- **Un aviso nunca condiciona el registro**: se guarda igual, con los mismos números, sin marcarlo como "malo" en el YAML.
- Si el usuario dice que no quiere avisos, se apagan quitando `vigilancias` con `/objetivos ajustar`. No se discute.
- Si aparece un alimento cuyo efecto sobre el marcador **no tienes claro**, no inventes el mecanismo: no avises. Un aviso falso cuesta más credibilidad que un aviso omitido.

### c) Resúmenes (`hoy` · `semana` · `mes`)

Añadir al agregado: media diaria **frente a `kcal_objetivo`, `proteina_g` y `fibra_min_g`**, días dentro/fuera de rango (±10 %) y vigilancias disparadas en el periodo, como recuento seco ("carne roja 3 veces"). Las vigilancias de `alcance: resumen` (p. ej. fibra) se comentan **aquí y solo aquí**: si la media del periodo queda por debajo del objetivo, una línea factual; si lo cubre, no hace falta decir nada. Días sin `fibra_g` se excluyen de esa media y, si son la mayoría del periodo, decirlo ("fibra: solo N de M días con dato"). Sin conclusiones ni felicitaciones. Si la ingesta real se desvía de forma sostenida, la salida es una sola línea: "esto es material para `/objetivos revisar`".

## Reglas
- Idioma español, fechas ISO, fecha y hora reales del sistema.
- Un registro dudoso guardado vale más que un registro perfecto que el usuario abandona: **nunca bloquear el registro por falta de datos**.
- Marcar siempre la confianza; es lo que permite luego saber cuánto fiarse de la media semanal.
- La fibra **nunca condiciona ni retrasa el registro** — si no hay forma razonable de estimarla, se pone 0 y ya.
- Varias comidas en un mismo mensaje ("desayuné X y comí Y") → registrar cada una por separado.
- Si el usuario registra algo de un día pasado, aceptarlo y colocarlo en su fecha.
- Si el usuario corrige una estimación, actualizar también la referencia correspondiente (aprende de la corrección).
- **Marcas y productos concretos: dato buscado, nunca inventado** (ver Paso 1 bis).
- Alcohol: contarlo siempre (cerveza 330 ml ≈ 140 kcal, copa de vino ≈ 120, combinado ≈ 250). Si alguna vigilancia lo incluye como mecanismo, aplica el aviso de una línea del Paso 5; si no, se cuenta y ya.
- **El registro manda sobre el objetivo.** Ante la duda entre dar un aviso o no darlo, no darlo.
- Editar YAML añadiendo al final de las listas, sin reescribir el archivo entero.
