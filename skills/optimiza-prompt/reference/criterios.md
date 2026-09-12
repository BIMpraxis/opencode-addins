# Criterios de optimización: desarrollo

## Esqueleto por defecto del prompt optimizado

No es un plantilla rígida: úsalo solo en la medida que el caso lo pida.

1. Frase de apertura: verbo de acción + objetivo + alcance/calificador clave.
2. (Si hay trasfondo) `Contexto:` en viñetas con los hechos y datos concretos.
3. Instrucciones: numeradas, una por petición, cada una verificable.
4. Reglas o restricciones: exclusiones, preservaciones, límites de alcance.
5. Formato de la respuesta esperada (si importa).
6. Criterios de aceptación / qué verificar (tareas de implementación).
7. Salvaguardas finales: no inventar; pedir lo que falte; distinguir hecho/hipótesis; confirmar antes de lo irreversible.
8. Primera acción esperada.

## Transformaciones típicas

- **Cadena de preguntas retóricas** → preguntas numeradas, cada una con su objeto («¿Es viable? ¿Buena idea?» → «Explica: 1. si es viable y bajo qué supuestos; 2. qué riesgos…; 3. una recomendación final»).
- **Propuestas vacilantes en medio de la narración** («quizá sería bueno tratar X como anexo…») → lista cerrada de opciones a evaluar o regla declarativa, según el tono de la petición.
- **Queja extensa sobre comportamiento previo del agente** → dos partes: (a) diagnóstico pedido («identifica y cita los apartados que causan X»), (b) requisitos de la corrección en viñetas neutras, incluida la restricción de no pasarse de simple («sin sobreingenierizar», «no eliminar por completo el mecanismo»).
- **Corrección airada de un error repetido** → instrucción positiva con el detalle literal preservado y demostración exigible en pantalla si el original la pedía; el reproche se traduce en requisitos de trabajo (claridad, no inventar, preguntar dudas, alineación con las instrucciones vigentes).
- **Respuesta de validación parcial a una lista previa** → frases completas, un punto por párrafo, motivo de cada no-validación conservado.
- **Instrucción que mezcla varias tareas con dependencias** → secuencia numerada con el orden de ejecución explícito (documentar antes de ejecutar, ejecutar, versionar, indicar pruebas de validación posteriores).
- **Spec de interfaz dispersa** → secciones por componente (ciclo de vida, apariencia con colores y tipografías exactas, comandos `Letra [X]`, formatos de archivo) y una cláusula final que fije el mecanismo de alineación antes de implementar (p. ej. ronda de preguntas vinculante).

## Reglas de fidelidad

- Ninguna cadena literal del original (nombres de modelos, rutas, combinaciones de teclas, umbrales, URLs, ejemplos) desaparece ni se normaliza, salvo error tipográfico evidente que forme parte de lo citado como ejemplo y no de lo exigido.
- Nada que el usuario no haya dicho se añade como requisito; las cláusulas nuevas son salvaguardas y estructura, no contenido.
- El idioma y el tratamiento (tú/usted) del original se conservan.

## Lista de comprobación antes de entregar

- [ ] ¿Toda petición del original tiene su hueco explícito en la versión optimizada?
- [ ] ¿Se conserva cada dato concreto con su grafía exacta?
- [ ] ¿Las restricciones implícitas («no implementes», «no toques X», «esto sigue igual») están explícitas?
- [ ] ¿El tono está neutralizado sin haber perdido ninguna exigencia que contenía?
- [ ] ¿Hay salvaguarda antialucinación si la tarea es abierta, y criterios de aceptación si es de implementación?
- [ ] ¿La estructura es proporcional a la complejidad del original?
- [ ] ¿Se entiende el prompt optimizado sin el contexto de la charla? Si algo seguía dependiendo de información no aportada, ¿está previsto pedirlo en lugar de asumirlo?
- [ ] ¿La respuesta empieza por la primera palabra del prompt y termina por la última? No hay fences (```` ``` ````, ```` ```markdown ````, cualquiera), ni preámbulo, ni resumen, ni saludo, ni una línea sobrante.
