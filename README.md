# Yuluka-EKG: Devolviendo la Armonía a las Señales del Corazón

## Descripción del Proyecto
¡Hola! Bienvenidos a Yuluka-EKG, un ecosistema digital interactivo que nace de la necesidad de evolucionar la forma tradicional de presentar la ingeniería, sustituyendo los informes estáticos por un entorno colaborativo vivo que documenta rigurosamente el desarrollo de nuestro proyecto. El nombre de nuestra plataforma rinde homenaje a la cosmogonía de las comunidades indígenas de la Sierra Nevada de Santa Marta, donde "Yuluka" significa entrar en armonía o hacer que el pensamiento y el corazón sientan en un mismo sentido. Inspirados en esta filosofía ancestral, hemos diseñado una plataforma web educativa dedicada al aprendizaje de la electrocardiografía (EKG), permitiendo a los usuarios visualizar, interactuar y comprender la morfología cardiaca a través de registros preexistentes de bases de datos estandarizadas. Yuluka-EKG es, por lo tanto, un puente pedagógico donde la tecnología y el latido del corazón se unen para transformar la enseñanza de la salud en una experiencia dinámica, intuitiva y en perfecta armonía.

## Estructura del Portafolio
*   `docs/`: Reporte de fundamentación (Estado del arte), matriz de alternativas y diseño técnico.
*   `src/`: Código fuente del pipeline de la aplicación web.
*   `data/`: Fichas técnicas de señales y datasets.
*   `evidence/`: Pruebas de validación, resultados y material para el Pitch.

### Componentes Principales:
*   **DSP Pedagógico:** Filtros en tiempo real (SciPy: Notch 60 Hz, Butterworth 0.5-40 Hz y Savitzky-Golay) para la eliminación guiada de ruidos hospitalarios comunes (red eléctrica y respiración).
*   **Quiz Clínico Simulado:** Evaluación interactiva (quiz.html) basada en casos reales de PTB-XL, enfocada en el reconocimiento de patrones y toma de decisiones.
*   **Retroalimentación Fisiopatológica:** Corrección inmediata que vincula los errores o aciertos con medidas clínicas exactas (como el intervalo PR o segmento ST) y su causa biológica.
*   **Tutor Inteligente (Monitor-Bot):** Asistente integrado con la API de Google Gemini 2.5 Flash que lee el contexto dinámico del paciente en pantalla y ofrece pistas visuales sin dar la respuesta directa.
*   **Métricas y Metacognición:** Base de datos relacional (SQLite + Flask-Login) que registra el progreso del estudiante para identificar sus debilidades y sugerir temas de repaso.
*   **Interfaz y Despliegue:** Dashboard responsivo de 12 derivaciones en papel milimetrado (Flask + Chart.js), optimizado para pruebas remotas en tiempo real a través de Ngrok.
  
## Tecnologías
* Backend: Python | Flask | Flask-Login | Flask-SQLAlchemy
* Procesamiento de Señales (DSP) e IA: SciPy | WFDB (PhysioNet) | Google Gemini API
* Base de Datos: SQLite
* Frontend: JavaScript (ES6+) | Chart.js | HTML5 | CSS3
* Despliegue y Pruebas: Ngrok | Git
