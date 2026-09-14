---
name: consulta
description: Prepara el informe para llevar al médico — analíticas con su evolución, síntomas activos, constantes y pruebas a pedir, priorizadas. Usar cuando el usuario diga "/consulta", "tengo cita con el médico", "prepárame lo del médico", "qué le pregunto al médico", "informe para el médico", "resumen médico", o vaya a una consulta y quiera llevar los datos ordenados.
---

# /consulta — preparar la visita al médico

Objetivo: que la persona llegue a la consulta con **una página o dos** donde esté todo lo relevante, ordenado por importancia, sin tener que acordarse de nada.

## Regla de rol (no negociable)

**Esta skill NO diagnostica.** Organiza datos, muestra tendencias y formula preguntas. La salida es *"esto conviene preguntarlo"*, nunca *"esto es lo que tienes"*.

- No proponer tratamientos, dosis ni suplementos como indicación. Si algo se corrige habitualmente con suplementación, la forma correcta es **"preguntar si procede suplementar"**, no "toma X".
- No dar porcentajes de probabilidad ni nombres de enfermedad como conclusión.
- Las hipótesis de `datos/medico/hipotesis.md` se presentan **como lo que son**: patrones detectados, con el dato que los sostiene, para que el médico decida.

## Sin datos de ingesta

**No leer** `datos/registros/comidas/`, `datos/registros/referencias-kcal.yaml` ni `datos/dieta/`.
**No reportar** kcal, proteína, adherencia a la dieta ni qué come.

El peso y la composición corporal **sí** van (son datos clínicos, no ingesta). Si el médico pregunta por la alimentación, es una conversación, no una tabla.

## Modos

- `/consulta` → informe completo (por defecto).
- `/consulta <motivo>` → informe centrado en un motivo ("digestivo", "sueño", "revisión general"). Sigue incluyendo el resumen de constantes y valores fuera de rango, pero prioriza lo del motivo.
- `/consulta pruebas` → solo la lista priorizada de pruebas a pedir, para no perderse en la consulta.
- `/consulta html` → además del markdown, una versión imprimible en HTML, 100 % local.

## Paso 1 — Leer

- `datos/medico/analiticas.md` — valores, rangos **de cada laboratorio** y evolución
- `datos/medico/sintomas.md` — síntomas activos
- `datos/medico/hipotesis.md` — patrones abiertos y cuáles se han cerrado
- `datos/medico/pruebas-pendientes.md` — la lista ya priorizada
- `datos/medico/historial.md` — cronología, últimas consultas
- `datos/medico/condiciones.md` — condiciones, alergias, medicación, antecedentes familiares
- `datos/registros/pesajes.md` — peso, composición y constantes
- `datos/registros/diario.md` — solo síntomas y eventos de salud registrados
- `datos/perfil/identidad.md`, `datos/perfil/cuerpo.md`
- `datos/perfil/estilo-vida.md` — solo sueño, actividad, tabaco y alcohol
- `datos/perfil/objetivos.md` — solo prioridades y `fase_sensible`, si son de salud

Si `datos/medico/` está vacío o casi vacío, decirlo al principio: el informe se limitará a constantes, síntomas declarados y contexto, y es buen momento para aportar analíticas.

## Paso 2 — Construir el informe

Orden fijo, de más a menos accionable:

### 1. Cabecera
Nombre o alias, edad, fecha de la consulta, motivo. Peso e IMC actuales. Medicación habitual y alergias (aunque estén vacías: el médico lo va a preguntar).

### 2. Motivo y qué se busca resolver
Dos o tres líneas. Si hay un motivo declarado, ese; si no, los síntomas activos de mayor peso.

### 3. Lo que ha cambiado desde la última analítica
Tabla corta, **solo lo que se mueve o está fuera de rango**. Nunca volcar la analítica entera: el médico ya tiene el informe del laboratorio; lo que aporta valor es **la comparación entre fechas**, que él no tiene delante.

Columnas: parámetro · valor anterior (fecha) · valor actual (fecha) · rango actual · flecha.

⚠️ **Advertir siempre cuando los rangos de referencia cambien entre laboratorios**, y no marcar como patológico un valor que solo lo es en el rango del laboratorio nuevo (o que deja de serlo solo por el cambio de rango).

### 4. Síntomas activos
Agrupados como en `sintomas.md`, con desde cuándo y evolución reciente. Marcar los que hayan cambiado — mejoras incluidas.

### 5. Preguntas para el médico
Formuladas para responderse en consulta, concretas y con el dato que las motiva. Formato de ejemplo: *"¿Procede <prueba> con estos datos?"*, *"<Marcador> ha pasado de <valor> a <valor> en <meses>, ¿justifica <prueba>?"*, *"<Parámetro> no se midió en la última analítica, ¿se puede solicitar explícitamente?"*.

### 6. Pruebas a pedir
De `pruebas-pendientes.md`, respetando su prioridad, con **una línea de justificación cada una**. Incluir las que están en curso y su fecha estimada.

### 7. Contexto que el médico va a preguntar
Tabaco, alcohol, sueño, actividad física, antecedentes familiares.

## Paso 3 — Salida

- **Markdown imprimible por defecto**, 1-2 páginas. Compacto: el objetivo es leerlo de un vistazo en la sala de espera.
- Guardar en `datos/medico/consultas/YYYY-MM-DD-<motivo>.md`. Crear la carpeta si no existe.
- HTML imprimible **solo si el usuario lo pide** (`/consulta html`): escribirlo en `datos/medico/consultas/YYYY-MM-DD-<motivo>.html`, autocontenido (CSS inline, sin recursos externos).
- Cerrar con 2-3 líneas: ruta del archivo, cuántas pruebas se piden y cuál es la prioridad 1.

## Paso 4 — Después de la consulta

Si el usuario cuenta qué pasó, **ofrecer registrarlo**:
- Línea en `datos/medico/historial.md` con fecha, motivo y qué se decidió.
- Actualizar `pruebas-pendientes.md`: mover lo solicitado a "en curso" con su fecha estimada.
- Si hay diagnóstico o medicación nueva, a `condiciones.md`, y actualizar `datos/NUCLEO.md`.
- Si hay una indicación dietética, evaluar si toca una regla del bloque B de `datos/perfil/restricciones.md` — **una indicación médica real tiene precedencia sobre las reglas derivadas**, y así debe anotarse.

## Reglas

- **Todo 100 % local.** Nunca subir el informe a servicios externos: lleva datos médicos.
- Idioma español, fechas ISO, fecha real del sistema.
- **Nunca inventar un valor ni una fecha.** Si un dato no está, se dice "no medido" o "sin registrar" — un hueco identificado es información útil para el médico.
- No incluir el número de historia, la póliza ni documentos de identidad salvo que el usuario lo pida.
- Si `analiticas.md` tiene una sola columna, decirlo: sin comparación, el informe vale bastante menos.
- Si hay un resultado pendiente con fecha estimada ya pasada, **avisarlo**: probablemente esté disponible y sin recoger.
