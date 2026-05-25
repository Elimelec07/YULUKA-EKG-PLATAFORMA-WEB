# Yuluka-EKG: Devolviendo la Armonía a las Señales del Corazón

## Descripción del Proyecto
¡Hola! Bienvenidos a Yuluka-EKG, un ecosistema digital interactivo que nace de la necesidad de evolucionar la forma tradicional de presentar la ingeniería, sustituyendo los informes estáticos por un entorno colaborativo vivo que documenta rigurosamente el desarrollo de nuestro proyecto. El nombre de nuestra plataforma rinde homenaje a la cosmogonía de las comunidades indígenas de la Sierra Nevada de Santa Marta, donde "Yuluka" significa entrar en armonía o hacer que el pensamiento y el corazón sientan en un mismo sentido. Inspirados en esta filosofía ancestral, hemos diseñado una plataforma web educativa dedicada al aprendizaje de la electrocardiografía (EKG), permitiendo a los usuarios visualizar, interactuar y comprender la morfología cardiaca a través de registros preexistentes de bases de datos estandarizadas. Yuluka-EKG es, por lo tanto, un puente pedagógico donde la tecnología y el latido del corazón se unen para transformar la enseñanza de la salud en una experiencia dinámica, intuitiva y en perfecta armonía.

## Mapa de Navegación del Ecosistema (Estructura del Portafolio)

¡Explorar este proyecto es muy fácil! Imagina que nuestra plataforma es un edificio en construcción; cada carpeta es un piso diferente con herramientas específicas para la enseñanza del EKG:

```text
📁 Yuluka-EKG (Raíz)
├── README.md              <-- ¡Estás aquí! (La recepción del proyecto)
│
├── 📂 docs/                  <-- El Cerebro Teórico
│    ├── Encuesta realizada
│    ├── Reporte de Fundamentación (¿Por qué lo hacemos?)
│    ├── Matriz de Alternativas (¿Cómo elegimos la mejor opción?)
│    └── Documento de Diseño Técnico (Los planos del software)
│
├── 📂 src/                   <-- El Laboratorio de Desarrollo
│    └── Código fuente de la Aplicación Web (FastAPI + Tailwind)
│
├── 📂 data/                  <-- La Biblioteca de Señales
│    └── Fichas técnicas de los Datasets (El material didáctico / MIT-BIH)
│
└── 📂 evidence/              <-- La Sala de Exhibición
     ├── Pruebas de validación y Resultados (El simulador en acción)
     └── Material para el Pitch (Nuestra presentación final)
```
      
### ¿Qué vas a encontrar detalladamente en cada carpeta?

* ### `docs/` | El Cerebro Teórico
    * Aquí guardamos los planos, las ideas y la ciencia detrás del proyecto.
    * **¿Qué hay dentro?:** El **Reporte de Fundamentación** (el porqué de la plataforma), la **Matriz de Alternativas** (donde comparamos opciones para que todo sea óptimo), el analisis completo de una **Encuesta Realizada** al personal de la salud sobre el diseño de la plataforma y el **Diseño Técnico** que muestra cómo se estructuró la plataforma web.

* ### `src/` | El Laboratorio de Desarrollo
    * Es el motor de **Yuluka-EKG**. Aquí está toda la magia de la programación.
    * **¿Qué hay dentro?:** El código fuente completo que le da vida a la aplicación web interactiva educativa, utilizando el poder de *FastAPI* para que el aprendizaje sea rápido y dinámico.

* ### `data/` | La Biblioteca de Señales
    * El material de estudio. Aquí están los ejemplos de latidos reales que usamos para enseñar.
    * **¿Qué hay dentro?:** Las **Fichas Técnicas** detalladas de las señales y bases de datos internacionales estandarizadas (como el MIT-BIH) que sirven como insumo pedagógico en la plataforma.

* ### `evidence/` | La Sala de Exhibición
    * La prueba reina de que nuestro proyecto funciona y cómo lo presentamos.
    * **¿Qué hay dentro?:** Las gráficas de validación con los resultados interactivos de la app y el material gráfico/audiovisual listo para el **Pitch final** ante el jurado.

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
