# 🫀 Yuluka‑EKG
## Reporte de Fundamentación Técnica

---

## 1. Introducción y Justificación

El **electrocardiograma (EKG)** es la herramienta de referencia para la detección y monitorización de enfermedades cardiovasculares. Sin embargo, su enseñanza tradicional se basa en trazados estáticos e idealizados en papel, lo que crea una brecha significativa con la realidad, donde las señales sufren alteraciones dinámicas por artefactos técnicos e interferencias biológicas.

**Yuluka‑ECG** surge para cerrar esta brecha formativa. Más que un software de filtrado, es un entorno web de simulación de aprendizaje de estas señales diseñado para el personal de la salud. La plataforma integra señales reales de alta fidelidad, procesamiento digital y tutoría basada en Inteligencia Artificial (IA), permitiendo a los estudiantes enfrentarse a escenarios hospitalarios reales, gestionar artefactos técnicos y tomar decisiones clínicas con retroalimentación inmediata.

---

## 2. Estado del Arte (Resumen Técnico)

La literatura científica en procesamiento de señales EKG es extensa, pero frecuentemente se desconecta de la necesidad educativa del usuario final. Yuluka-ECG adapta este conocimiento para fines pedagógicos:

Artefactos Clínicos vs. Ruido Teórico

En el entorno hospitalario, la degradación de la señal no es solo un problema matemático, sino una barrera diagnóstica. Los principales artefactos incluyen:
- Deriva de línea base (BW): Causada por la respiración del paciente, altera la lectura del segmento ST (crítico en  infartos)
- Interferencia de la red eléctrica (PLI): Ruido a 60 Hz inducido por equipos médicos cercanos o mala conexión de electrodos.
- Ruido electromiográfico (EMG): Artefactos de alta frecuencia por temblores o movimiento muscular del paciente [4].

Procesamiento Digital de Señales (DSP) Aplicado a la Educación

Mientras la investigación actual prioriza técnicas como la Transformada Wavelet (DWT) o Redes Neuronales para limpiar señales automáticamente, el aprendizaje clínico requiere transparencia. Por ello, Yuluka-EKG implementa filtros clásicos (Notch a 60 Hz y Pasa-Banda Butterworth). Esto permite al estudiante comprender activamente cómo funciona el monitor del paciente y diferenciar entre un artefacto técnico y una patología real.

Detección Automatizada como Soporte (Pan-Tompkins)

Para la evaluación del estudiante, el sistema backend utiliza el algoritmo estandarizado de Pan‑Tompkins. Al detectar los complejos QRS con precisión superior al 99%, el software puede calcular la frecuencia cardíaca y los intervalos reales, usándolos como "verdad fundamental" (Ground Truth) para corregir los cálculos manuales del aprendiz.


## 3. Estado de la Técnica y Tecnologías Seleccionadas

Yuluka‑ECG adopta un stack tecnológico moderno, ligero y de código abierto, garantizando que la plataforma pueda ejecutarse en navegadores web estándar (celulares o tablets) sin requerir instalación de software médico costoso.

### Backend
- Lenguaje y Framework: Python con Flask, optimizado para el enrutamiento y manejo de sesiones.
- Procesamiento (DSP): SciPy para la ejecución matemática de los filtros digitales (IIR/FIR).
- Persistencia (Metacognición): SQLite + Flask-SQLAlchemy para el registro histórico de evaluaciones, permitiendo mapear las debilidades del estudiante.

### Frontend
- **Tecnologías:** HTML5, CSS3 y JavaScript (ES6+)  
- **Visualización:** `Plotly.js` para señales y métricas interactivas  

### Asistencia Cognitiva (Monitor-Bot)

Uno de los aportes más innovadores de la arquitectura es la integración de la API de Google Gemini 2.5 Flash. Este modelo de lenguaje actúa como un "tutor de cabecera" que conoce el diagnóstico real del paciente en pantalla, pero está programado bajo un esquema de andamiaje pedagógico: guía al estudiante mediante pistas morfofisiológicas sin revelar la respuesta diagnóstica directamente.

---

## 4. Estándares y Normatividad

El desarrollo de Yuluka‑ECG opera bajo estándares internacionales de ingeniería biomédica y datos abiertos:

- Fuente de Datos Clínicos: Utilización de la base de datos estandarizada PTB-XL (PhysioNet), garantizando variabilidad biológica real.
- Normatividad: Consideraciones de la norma IEC 60601‑2‑25 respecto a la preservación morfológica del ECG durante el filtrado.

Nota Legal: Yuluka‑EKG no es un dispositivo médico certificado (SaMD). Su uso es estrictamente educativo y formativo para la simulación de escenarios de cuidado crítico.

---

## 5. Enfoque del Proyecto y Conclusión

La arquitectura de Yuluka-EKG justifica sus decisiones de diseño al poner al estudiante de la salud en el centro del ecosistema. La combinación de Flask y Chart.js hace accesible el acceso, haciendo asi el mas facil el aprendizaje para estudiantes acostumbrados a señales esteticas y sin la inmersion que logra YULUKA-EKG. Al integrar los datos reales de PhysioNet con las métricas de evaluación de SQLite y el acompañamiento de IA (Gemini), la plataforma no solo evalúa si el usuario aprueba o reprueba, sino que le enseña por qué se equivocó, optimizando su curva de aprendizaje.

---

## 6. Referencias Bibliográficas

- [1] Issenberg, S. B., et al. (2005). Features and uses of high-fidelity medical simulations that lead to effective learning: a BEME systematic review. Medical Teacher, 27(1), 10-28.
- [2] Sörnmo, L., & Laguna, P. (2005). Bioelectrical signal processing in cardiac and neurological applications. Academic Press.
- [3] Pan, J., & Tompkins, W. J. (1985). A real-time QRS detection algorithm. IEEE Transactions on Biomedical Engineering, (3), 230-236.
- [4] Wagner, P., et al. (2020). PTB-XL, a large publicly available electrocardiography dataset. Scientific Data, 7(1), 154.
- [5] Goldberger, A. L., et al. (2000). PhysioBank, PhysioToolkit, and PhysioNet: components of a new research resource for complex physiologic signals. Circulation, 101(23), e215-e220.

