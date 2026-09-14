---
name: platos
description: Flujo interactivo para descubrir, recordar y curar platos del pool de dieta. Usar cuando el usuario diga "/platos", "platos con X", "sugiéreme platos", "qué platos hay con garbanzos", "añade este plato", "quita/descarta este plato", "ver platos", o quiera ampliar/editar datos/dieta/platos.yaml.
---

# /platos — descubrir y curar el pool de platos

Objetivo: ayudar al usuario a **recordar** y **descubrir** platos que le gustan, y persistirlos en `datos/dieta/platos.yaml`. El usuario no sabe listar platos de memoria; tú propones, él filtra.

## Modos (según el argumento)
- `/platos <input libre>` → **descubrir** (modo por defecto). Ej: "platos con garbanzos", "cenas rápidas asiáticas", "desayunos", "platos típicos andaluces", "algo con lo que hay en despensa".
- `/platos` sin argumento → descubrir, eligiendo tú un ángulo poco cubierto en el pool (cocina, ingrediente, tipo de comida con pocas entradas). Di qué ángulo elegiste. Con el pool vacío, empezar por "platos de siempre": lo que la persona ya cocina o pide habitualmente.
- `/platos ver [filtro]` → listar el pool (filtrado por texto/tag/tipo_comida/cocina/estado).
- `/platos editar <nombre>` → modificar campos de un plato existente.
- `/platos quitar <nombre>` → mover un plato del pool a descartados (pedir motivo opcional).
- `/platos añadir <descripción>` → el usuario recuerda un plato por sí mismo; crea la entrada (`origen: recuerdo`) preguntando solo lo que no se deduzca.

## Flujo de descubrir
1. **Leer contexto** (siempre, antes de proponer):
   - `datos/dieta/platos.yaml` — no repetir nada que ya esté (comparar por nombre normalizado y por combinación de ingredientes clave; "lentejas con chorizo" ≈ "lentejas estofadas con chorizo").
   - `datos/dieta/platos-descartados.yaml` — nunca proponer.
   - `datos/dieta/alimentos.yaml` — no proponer platos cuyo ingrediente central esté en `no_gusta`; priorizar `encanta`.
   - `datos/perfil/restricciones.md` — **los dos bloques**:
     - **Frontmatter y bloque A**: alergias, intolerancias, `restricciones_eleccion`, odios absolutos.
     - **Bloque B** (reglas derivadas de analíticas): filtrar por las marcadas `estricta` tal como estén escritas (qué evitar y con qué frecuencia máxima). Las `preferencia` no vetan: orientan qué priorizar.
     - Ojo con **no filtrar de más**: respetar lo que cada regla declara explícitamente como "sin restricción". Un alimento `encanta` que la regla no restringe no se retira.
   - `datos/perfil/estilo-vida.md` — tener en cuenta `cocinas_favoritas`, `cocinas_no`, `nivel_cocina`, `electrodomesticos`, tiempos disponibles (si están rellenos).
2. **Proponer 10–15 platos** que encajen con el input. Variar dentro del input (distintas cocinas, técnicas, tipos de comida) para maximizar el recuerdo. Incluir clásicos conocidos (que el usuario probablemente ya conozca y haya olvidado) mezclados con alguno menos obvio.
3. **Presentar** lista numerada, una línea por plato:
   `N. **Nombre** — ingredientes clave · tipo_comida · ~tiempo min · cocina`
   Al final, instrucciones breves de respuesta: "Responde con: añade 1,3,5 · descarta 2 (motivo opcional) · 4 pero sin nata · el 6 lo hago con pollo · todos · ninguno · otra tanda / cambia a <input>". Si el entorno permite preguntas de selección múltiple, se pueden usar (una opción por plato); el texto libre siempre es válido.
4. **Interpretar la respuesta** del usuario con flexibilidad (números, nombres, comentarios). Para cada plato:
   - **añadir** → entrada en `platos.yaml` con `origen: sugerido`, `estado: por_probar` (o `me_gusta` si el usuario dice que ya lo conoce y le gusta), `fecha_alta: hoy`, `valoracion: null`, `ultima_vez: null`. Rellenar el resto de campos con tu mejor estimación.
   - **modificar** ("sin nata", "con pollo") → guardar ya modificado; anotar el cambio en `notas`.
   - **descartar** → entrada en `platos-descartados.yaml` con `motivo` si lo dio. Si el motivo revela un alimento que no le gusta ("no me gusta el hinojo"), añadir/actualizar ese alimento en `alimentos.yaml` con `gusto: no_gusta`.
   - No mencionados → ignorar (no guardar ni descartar) salvo que el usuario diga "el resto descártalos".
5. **Persistir** añadiendo entradas al final de las listas YAML (no reescribir archivos completos). Formato YAML válido, indentación 2 espacios, strings con comillas si llevan `:` o caracteres especiales. Si la lista está vacía (`platos: []`), sustituir `[]` por la primera entrada en bloque.
6. **Confirmar** en 1–3 líneas qué se guardó y dónde (contadores: +N añadidos, N descartados). Luego preguntar: "¿Otra tanda con «<input>», cambiamos de ángulo, o paramos?". Repetir hasta que el usuario pare.

## Reglas
- Nunca proponer platos ya presentes en `platos.yaml` ni en `platos-descartados.yaml`.
- Nunca proponer platos que violen alergias/intolerancias/restricciones/odios.
- **Nunca retirar un plato por motivo médico en silencio.** Si el input pedía algo que choca con una regla `estricta` del bloque B, decirlo en una línea con el marcador que la origina y ofrecer la alternativa: *"Lo dejo fuera por la regla Bn (<marcador> <valor> el <fecha>). Te propongo estos otros."* El usuario decide; si insiste, se le proponen y se anota en `notas` del plato.
- Si una regla del bloque B indica que los platos afectados **se marcan en vez de vetarse** (p. ej. irritantes gástricos, de tolerancia individual), proponerlos igual con el tag que indique la regla.
- No preguntar datos que ya están en la base.
- Si `datos/perfil/` está vacío, proponer igualmente (sin filtros) y avisar de que faltan restricciones (sugerir `inicio`).
- Mantener nombres de platos concisos y reconocibles (en español; nombres propios de otras cocinas tal cual: "pad thai", "shakshuka").
- Fecha de hoy: la real del sistema, formato ISO.

## Esquema de entrada (platos.yaml)
```yaml
  - nombre: "Garbanzos con acelgas"
    tipo_comida: [comida, cena]
    cocina: española
    ingredientes_clave: [garbanzos, acelgas, ajo, pimentón]
    tiempo_min: 30
    dificultad: baja
    estado: por_probar
    valoracion: null
    tags: [legumbres, vegetariano, batch, tupper]
    notas: ""
    origen: sugerido
    fecha_alta: 2026-01-15
    ultima_vez: null
```
