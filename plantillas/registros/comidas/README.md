# Registro de comidas

Un archivo YAML por mes: `YYYY-MM.yaml`. Lo escribe y lee la skill `kcal`; lo crea al registrar la primera comida del mes.

Estructura:

```yaml
dias:
  - fecha: 2026-01-15
    total_kcal: 2140
    total_proteina_g: 128
    total_fibra_g: 22
    confianza_dia: media        # alta | media | baja (la peor de las comidas del día, ponderada)
    comidas:
      - hora: "14:00"
        tipo: comida            # desayuno | almuerzo | comida | merienda | cena | picoteo
        descripcion: "Pollo a la plancha con arroz y ensalada"
        items:
          - alimento: "pechuga de pollo"
            cantidad: "180 g"
            kcal: 300
            proteina_g: 56
            fibra_g: 0
        kcal: 640
        proteina_g: 62
        fibra_g: 6
        confianza: alta         # alta (pesos) | media (foto/porción típica) | baja (descripción vaga)
        fuente: texto           # texto | foto | inferido
        notas: ""
```

Reglas:
- Solo se añade; nunca se recalcula el pasado aunque cambie una referencia.
- kcal redondeadas a 10, proteína y fibra a 1 g.
- Días sin `fibra_g` cuentan como dato ausente al calcular medias de fibra, no como 0.
- Las estimaciones repetidas de **ingredientes y productos de marca** se guardan en `../referencias-kcal.yaml`. Los platos completos NO se guardan: se recalculan siempre.
