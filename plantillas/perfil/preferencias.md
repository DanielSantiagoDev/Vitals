---
actualizado: null
estado_onboarding: pendiente      # pendiente | cuestionario | medico | objetivos | entreno | completado
# ─── Uso del sistema ───
plan_frecuencia: semanal          # semanal | mensual
lista_compra: true
formato_plan: infografia_html     # infografia_html | markdown
tracking_comida: aproximado       # aproximado | ninguno
kcal_contrasta_objetivos: true    # kcal muestra el día frente a objetivos y avisa por vigilancias
platos_nuevos: bajo_demanda       # bajo_demanda | proactivo
entreno_seguimiento: orientativo  # orientativo | series_y_pesos
# ─── Reglas de composición del plan (las lee la skill dieta; si falta una clave, usa su valor por defecto) ───
plan:
  raciones_para: 1                # las cantidades del plan son para N personas
  tomas_extra: []                 # tomas fijas además de horarios_comidas. Ejemplo:
  #  - nombre: merienda
  #    hora: "17:30-18:30"
  #    etiqueta: saciante
  #    criterio: "salada y saciante; cubre el hueco largo entre comida y cena"
  #    ejemplos: [yogur con frutos secos, tostada con pavo, hummus con zanahoria]
  variedad_min_dias: 2            # 2 = un plato no se repite en días consecutivos
  variedad_excepciones: [desayuno]
  batch_respeta_variedad: true    # comer el mismo batch dos días seguidos también cuenta como repetir
  batch_max_preparaciones_semana: 2
  comidas_libres_semana: 0
  comida_libre_cuando: null       # "sábado noche"
  comida_libre_criterio: null
  por_probar_max_semana: 3
  tiempo_max_entre_semana_min: null   # null → tiempo_cocina_entre_semana_min de estilo-vida (o 60)
  bebidas: null                   # "agua y café"
  medidas_caseras: {}             # medidas propias con nombre, p. ej. {chorreton_g: 7}
---

# Preferencias de uso

Cómo quiere usar el sistema esta persona. Las skills leen el frontmatter; si una clave falta o es `null`, aplican su valor por defecto.

## Decisiones vigentes

(solo crece: cuando la persona decide cambiar cómo funciona algo, anotarlo con fecha y, si sustituye a otra decisión, decir cuál)
