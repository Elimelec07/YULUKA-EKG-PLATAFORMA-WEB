# Matriz Comparativa de Alternativas Tecnológicas
## Proyecto Yuluka‑EKG

---

## 1. Introducción

Con el objetivo de seleccionar la alternativa tecnológica más adecuada para el desarrollo de la plataforma **Yuluka‑EKG**, se realizó un análisis comparativo entre diferentes enfoques y sistemas reportados en la literatura y en proyectos similares. Esta matriz permite evaluar de forma estructurada las ventajas y limitaciones de cada alternativa, considerando criterios técnicos, arquitectónicos y educativos.


---

## 2. Alternativas Evaluadas

Las alternativas consideradas en el presente análisis son las siguientes:

- **A1:** Métodos Tradicionales (Libros y Guías Estáticas)  
- **A2:** Simuladores Comerciales de Cuidado Crítico    
- **A3:** **Yuluka‑EKG (Alternativa Propuesta)**  

---

## 3. Criterios de Evaluación

La evaluación comparativa se realizó con base en los siguientes criterios:

- Realismo de las Señales
- Gestión de Ruido y Artefactos
- Tutoría y Acompañamiento
- Evaluación de Conductas
- Análisis de Progreso (Metacognición)
- Costo y Accesibilidad
  
---

## 4. Matriz Comparativa

### Matriz Comparativa de Soluciones de Aprendizaje en EKG

## Comparativa Tecnológica y Educativa

| Criterio de Evaluación | Métodos Tradicionales | Simuladores Comerciales | **Yuluka-EKG (Este Proyecto)** |
|---|---|---|---|
| **Realismo de las Señales** | ⭐⭐☆☆☆ **(2/5)**  <br> Gráficos impresos idealizados y poco representativos de la variabilidad clínica real. | ⭐⭐⭐☆☆ **(3/5)**  <br> Señales sintéticas parametrizadas digitalmente con baja imperfección fisiológica. | ⭐⭐⭐⭐⭐ **(5/5)**  <br> Uso de datos clínicos reales provenientes de **PTB-XL (PhysioNet)**, proporcionando escenarios auténticos de interpretación ECG. |
| **Tutoría y Acompañamiento** | ⭐☆☆☆☆ **(1/5)**  <br> El aprendizaje depende totalmente del estudiante o del acompañamiento docente presencial. | ⭐⭐⭐☆☆ **(3/5)**  <br> Necesita supervisión continua de instructores médicos para configurar y evaluar escenarios. | ⭐⭐⭐⭐⭐ **(5/5)**  <br> Integración de un **Monitor-Bot** basado en **Gemini 2.5 Flash**, disponible 24/7 con orientación contextual y retroalimentación visual inteligente. |
| **Evaluación de Conductas Clínicas** | ⭐⭐☆☆☆ **(2/5)**  <br> Evaluaciones teóricas centradas en memorización y reconocimiento básico de patologías. | ⭐⭐⭐⭐☆ **(4/5)**  <br> Simulaciones prácticas avanzadas, pero limitadas a laboratorios físicos y escenarios rígidos. | ⭐⭐⭐⭐⭐ **(5/5)**  <br> Simulación clínica web interactiva con casos aleatorios reales y toma de decisiones basadas en protocolos UCC. |
| **Análisis de Progreso (Metacognición)** | ⭐☆☆☆☆ **(1/5)**  <br> No existe seguimiento histórico ni análisis personalizado del desempeño académico. | ⭐⭐☆☆☆ **(2/5)**  <br> Reportes básicos de aprobación/reprobación sin inteligencia analítica profunda. | ⭐⭐⭐⭐⭐ **(5/5)**  <br> Sistema analítico con **SQLite** capaz de detectar debilidades específicas y generar recomendaciones adaptativas de estudio. |
| **Costo y Accesibilidad** | ⭐⭐⭐☆☆ **(3/5)**  <br> Material relativamente accesible, aunque costoso y rápidamente desactualizado. | ⭐☆☆☆☆ **(1/5)**  <br> Alto costo de licencias, infraestructura médica y estaciones físicas de simulación. | ⭐⭐⭐⭐⭐ **(5/5)**  <br> Plataforma web ligera, responsiva y de bajo costo operativo, accesible desde cualquier navegador mediante **Ngrok** o **Render**. |
| **Facilidad de Implementación / Tiempo de Desarrollo** | ⭐⭐⭐⭐☆ **(4/5)**  <br> Material educativo simple de producir y distribuir, aunque limitado en interactividad y actualización. | ⭐☆☆☆☆ **(1/5)**  <br> Desarrollo altamente complejo que requiere hardware especializado, integración médica y equipos multidisciplinarios. | ⭐⭐⭐⭐⭐ **(5/5)**  <br> Arquitectura web basada en `Flask`, `SQLite` y tecnologías frontend ligeras, permitiendo desarrollo rápido, despliegue ágil y mantenimiento simplificado. |


---

## 5. Análisis Comparativo

El análisis evidencia que los métodos tradicionales de enseñanza (A1), como libros y guías estáticas, presentan una fuerte limitación formativa al mostrar trazos electrocardiográficos idealizados y limpios que omiten por completo la variabilidad biológica y los artefactos técnicos del entorno hospitalario. Por otro lado, los simuladores comerciales de cuidado crítico (A2) ofrecen entornos prácticos rígidos, pero operan como una "caja negra" donde los filtros digitales vienen preconfigurados, impidiendo que el estudiante comprenda el impacto del procesamiento de señales; además, exigen hardware costoso y laboratorios físicos especializados, lo que limita severamente su accesibilidad.

La alternativa Yuluka‑EKG (A3) resuelve de manera óptima estas deficiencias. Combina el realismo clínico de señales biológicas verdaderas provenientes de la base de datos PTB-XL (PhysioNet). la plataforma no solo expone al estudiante a patologías reales, sino que le permite interactuar con la naturaleza estocástica de la señal. Esta propuesta trasciende la visualización pasiva, incorporando analíticas de aprendizaje y un tutor cognitivo basado en IA que transforma el error en una oportunidad de refuerzo conceptual.

---

## 6. Justificación de la Alternativa Seleccionada

A partir de la matriz comparativa presentada, se selecciona Yuluka‑EKG como la solución óptima y definitiva para el desarrollo del proyecto, debido a los siguientes criterios de ingeniería y diseño pedagógico:
* Fidelidad y Realismo Biológico: A diferencia de las señales sintéticas de los simuladores comerciales, implementa registros clínicos reales indexados de la base de datos global PTB-XL de PhysioNet.

* Apertura de la "Caja Negra" del DSP: Permite la manipulación interactiva de filtros digitales en tiempo real (Notch a 60 Hz y Pasa-Banda Butterworth de 0.5-40 Hz), enseñando al personal de salud a discernir de forma autónoma entre un artefacto técnico y una patología cardíaca real.

* Tutoría Cognitiva Inteligente y 24/7: Integra la API de Google Gemini 2.5 Flash bajo un esquema de inyección de contexto dinámico. El asistente actúa como un tutor clínico de cabecera que guía visualmente al alumno mediante pistas morfofisiológicas sin entregar la respuesta diagnóstica de manera directa.

* Evaluación Orientada a Conductas Clínicas: El módulo de quices simulados desafía al estudiante a tomar decisiones bajo presión basadas en protocolos reales de enfermería en cuidado crítico (ej. administración de oxígeno, activación de código azul), complementado con un motor de retroalimentación fisiopatológica inmediata fundamentada en medidas métricas exactas (intervalos PR, segmentos ST).

* Enfoque Metacognitivo y Persistencia: A través de una arquitectura local robusta con SQLite y SQLAlchemy, el sistema registra de manera persistente el historial de intentos para mapear las debilidades específicas del usuario por patología y sugerir rutas personalizadas de estudio.

* Accesibilidad y Despliegue Eficiente: Al ser un entorno web responsivo optimizado (Flask + Chart.js), elimina la barrera económica de las licencias médicas y permite la realización de pruebas de usuario remotas en tiempo real mediante túneles seguros con Ngrok.

---

## 7. Conclusión

El análisis demuestra que Yuluka-EKG es la solución más eficiente frente a las alternativas actuales. Al integrar señales clínicas reales, procesamiento digital e Inteligencia Artificial, la plataforma cierra la brecha teórica y prepara al personal de salud para los retos de la práctica clínica real.
