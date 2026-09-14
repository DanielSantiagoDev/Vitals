---
name: alimentos
description: Flujo interactivo para registrar gustos por alimento (encanta / ok / no_gusta / por_probar) por categoría en datos/dieta/alimentos.yaml. Usar cuando el usuario diga "/alimentos", "repasemos las verduras", "qué alimentos me gustan", "no me gusta X", "añade X a alimentos", o quiera curar sus preferencias de ingredientes.
---

# /alimentos — curar gustos por alimento

Objetivo: construir `datos/dieta/alimentos.yaml` sin que el usuario tenga que recordar de memoria: tú listas, él marca.

## Modos
- `/alimentos <categoría>` → recorrer esa categoría. Categorías: `carnes`, `pescados_mariscos`, `huevos_lacteos`, `legumbres`, `cereales_pan_pasta`, `verduras`, `frutas`, `frutos_secos_semillas`, `salsas_condimentos`, `snacks`, `bebidas`, `otros`. Acepta sinónimos ("pescado", "lácteos", "verdura").
- `/alimentos` sin argumento → mostrar cuántos alimentos hay registrados por categoría y proponer empezar por la menos cubierta.
- `/alimentos ver [filtro]` → listar registrados (por categoría o gusto).
- `/alimentos <alimento> = <gusto> [motivo]` → registro directo de uno o varios (ej. "/alimentos hinojo = no_gusta sabor anisado").

## Flujo de recorrer categoría
1. Leer `datos/dieta/alimentos.yaml` y `datos/perfil/restricciones.md`. Excluir de la lista lo ya registrado (salvo que el usuario pida repasar todo) y lo que sea alergia/intolerancia (registrarlo directamente como `no_gusta` con motivo "alergia/intolerancia" si aún no está).
2. Listar **15–25 alimentos** de la categoría, los más comunes en el supermercado primero y luego menos habituales, numerados, agrupados si ayuda (ej. verduras: hoja, raíz, crucíferas, ...).
3. Instrucciones de respuesta: "Responde con: encanta 1,4,7 · ok 2,3 · no 5 (motivo opcional) · probar 9 · el resto ok / el resto no". Si el entorno permite preguntas de selección múltiple, se pueden usar por bloques ("¿Cuáles te encantan?", "¿Cuáles no?"). Texto libre siempre válido.
4. Interpretar y **persistir** al final de la lista `alimentos:` en `alimentos.yaml`, una entrada por alimento con `categoria`, `gusto`, `motivo`, `notas`, `fecha`. Si el alimento ya existe, actualizar su entrada en lugar de duplicar. Si la lista está vacía (`alimentos: []`), sustituir `[]` por la primera entrada en bloque. Los no mencionados se ignoran salvo instrucción "el resto ...".
5. Confirmar contadores y ofrecer: "¿Otra tanda de la misma categoría, siguiente categoría, o paramos?".

## Reglas
- Nombres en singular y minúsculas (`pollo`, `garbanzo`, `brócoli`).
- Si un alimento que el usuario marca como `encanta` choca con una regla `estricta` del bloque B de `restricciones.md`, **guardar el gusto igualmente** y avisar en una línea: el gusto es un dato real, la restricción es otra capa. Anotarlo en `notas` (ej. `"limitado por Bn"`).
- Si el usuario marca `no_gusta` algo que debería ser un veto absoluto ("nunca me lo propongas"), ofrecer añadirlo también al bloque A de `restricciones.md`.
- Si el usuario matiza ("solo a la plancha", "no crudo"), guardarlo en `notas`, no cambiar el `gusto`.
- No preguntar lo ya registrado.
- Fecha ISO real del sistema.

## Esquema de entrada
```yaml
  - nombre: garbanzo
    categoria: legumbres
    gusto: encanta
    motivo: null
    notas: null
    fecha: 2026-01-15
```
