# 📐 Documento de Diseño Técnico
## Plataforma Yuluka‑EKG

---

## 1. Introducción

Yuluka-EKG es una plataforma web interactiva diseñada para la formación de estudiantes del área de la salud. El sistema permite la visualización simultánea de electrocardiogramas (EKG) de 12 derivaciones, la manipulación de filtros digitales para la remoción de artefactos técnicos, y la evaluación interactiva mediante quices dinámicos respaldados por un tutor cognitivo basado en Inteligencia Artificial.

### Objetivos Técnicos

- **Procesamiento en Backend:** Filtrar bioseñales reales de la base de datos PTB-XL reduciendo el ruido de la red eléctrica colombiana (60 Hz) y variaciones de línea base sin introducir distorsiones de fase.

- **Persistencia Local Eficiente:** Registrar de forma segura sesiones de usuarios y métricas de rendimiento clínico utilizando bases de datos relacionales ligeras.

- **Inteligencia Artificial Contextualizada:** Implementar un agente conversacional capaz de guiar de forma pedagógica a los usuarios interpretando los datos en pantalla.*

---

## 2. Arquitectura del Sistema

El software sigue un patrón arquitectónico Cliente-Servidor, optimizado para el renderizado de alta fidelidad y despliegue rápido. La separación de responsabilidades asegura la escalabilidad del proyecto.

### Diagrama de capas 
```text
[ Capa de Presentación (Frontend) ]
├── UI Dashboard: HTML5, CSS3, JS ES6
└──Renderizado ECG: Chart.js (Animación circular vía requestAnimationFrame)


[ Capa de Lógica de Negocio (Backend API) ]
├── Enrutamiento & Control: Python (Flask)
├── Pipeline DSP: SciPy, NumPy (Filtrado Bidireccional)
└── Gestión de IA: Integración SDK Google Gemini API

[ Capa de Datos (Persistencia) ]
├── Registros Clínicos: JSON / WFDB (PhysioNet PTB-XL)
└── Datos de Usuario & Métricas: SQLite (Vía Flask-SQLAlchemy)
```
 
---

### 3. Modelo de Datos y Persistencia

Se implementa una arquitectura relacional basada en SQLite gestionada a través del ORM Flask-SQLAlchemy. Este enfoque garantiza la portabilidad del sistema al alojar la base de datos en un único archivo físico (.db), sin requerir configuración de servidores externos.
Diccionario de Datos Clave

Tabla: Usuarios

- `id` (Integer, Primary Key): Identificador único autoincremental.
- `nombre` (String): Nombre o identificador del estudiante.
- `correo` (String, Unique): Correo electrónico para el inicio de sesión.
- `password_hash` (String): Clave encriptada utilizando algoritmos de derivación (vía `Werkzeug`).

Tabla: ResultadosQuiz

- `id` (Integer, Primary Key): Identificador único del intento.
- `user_id` (Integer, Foreign Key): Referencia apuntando a `Usuarios.id`.
- `categoria_patologia` (String): Clasificación del caso evaluado (NORM, MI [Infarto], ARRH [Arritmia], CD [Bloqueos de Conducción]).
- `es_correcto (Boolean)`: Registro del acierto en la conducta y diagnóstico.
- `fecha (DateTime)`: Registro temporal para cálculos de analítica evolutiva de aprendizaje.
---

## 4. Diseño de modulo criticos

### Módulo 1: Diseño de Módulos Críticos

Módulo encargado de la remoción de ruido mediante la librería SciPy. Para evitar el desfase temporal de las ondas P-QRS-T (crítico para diagnósticos), las operaciones se ejecutan empleando filtrado bidireccional de fase cero (`filtfilt`).

- Filtro Notch (Rechazo de Banda): Configurado a una frecuencia central de $f_0 = 60.0\text{ Hz}$ para neutralizar la inducción de la red eléctrica.
- Filtro Clínico (Pasa-Banda): Filtro Butterworth de 3er orden con frecuencias de corte de $0.5\text{ Hz}$ a $40\text{ Hz}$. Elimina el baseline wander respiratorio y potenciales musculares.

### Módulo 2: Motor de Renderizado Dinámico (Chart.js)

Este componente gestiona la representación gráfica simultánea de las 12 derivaciones del electrocardiograma en el dashboard principal y en el apartado de quices de la plataforma.
- **Renderizado Estático de Alta Fidelidad:** El sistema carga ventanas de tiempo fijas (3 segundos de registro). Este diseño obedece a un enfoque pedagógico, permitiendo al estudiante analizar detalladamente y sin presión de tiempo la morfología de la señal (complejos QRS, segmento ST) y el comportamiento antes/después de aplicar los filtros.
- **Optimización de Interfaz (Canvas):** Para asegurar un rendimiento óptimo al dibujar múltiples instancias gráficas de manera simultánea en dispositivos de bajos recursos, se desactivan las transiciones y animaciones nativas de Chart.js (`animation: false`), priorizando la precisión técnica de los datos clínicos sobre los efectos visuales.

### Módulo 3: Motor de Simulación y Evaluación (`quiz.html`)

Desacopla la evaluación clínica del monitor principal.
- Consume un set de datos JSON preconfigurado con registros de la base de datos PTB-XL.
- Incorpora una matriz de Retroalimentación Fisiopatológica: si el estudiante falla, el sistema contrasta la respuesta con medidas métricas específicas (longitud del intervalo PR, segmento ST) para justificar el error.

### Módulo 4: Asistente Cognitivo (Monitor-Bot) e IA
Integración mediante el SDK de Google (google-generativeai) con el modelo Gemini 2.5 Flash.
- Inyección de Contexto Dinámico: El backend intercepta el mensaje y adjunta parámetros clínicos invisibles para el usuario:
  `[SYSTEM]: El estudiante analiza el registro ID {id_actual}. Diagnóstico: {diagnostico}. No entregues la respuesta directa, guía mediante morfología.`

### Módulo 5: Soporte e Inducción de Usuario (`Ayuda.html`)

Este componente proporciona un entorno de asistencia integrado en el frontend para orientar al personal de salud en el usonde la plataforma, reduciendo la curva de aprendizaje inicial.
- **Onboarding e Interactividad Local:** Implementa una guía paso a paso del uso de la plataforma. Explica disposición del dashboard: la lectura de las 12 derivaciones, el impacto de activar/desactivar los filtros DSP la dinámica de envío de respuestas en el quiz.

---

## 6. Tecnologías y Herramientas Seleccionadas

## 🛠️ Stack Tecnológico

| Componente | Tecnología Seleccionada | Justificación Técnica |
|---|---|---|
| ⚙️ **Backend & Enrutamiento** | `Python` + `Flask` | Entorno ligero y flexible, ideal para integración de librerías científicas y despliegue ágil. |
| 📊 **Procesamiento DSP** | `NumPy` + `SciPy` | Estándar de la industria para filtrado digital, análisis e interpolación matemática. |
| 🗄️ **Persistencia Relacional** | `SQLite` + `SQLAlchemy` | Base de datos serverless adecuada para persistencia local y gestión de sesiones. |
| 🎨 **Frontend & UI** | `HTML5` + `CSS3` + `JavaScript (ES6)` | Desarrollo responsivo, moderno y compatible con navegadores web actuales. |
| 📈 **Visualización de Señales** | `Chart.js` | Renderizado eficiente en Canvas para series temporales multicanal. |
| 🌐 **Visualización 3D** | `Three.js (WebGL)` | Carga optimizada de modelos `GLTF/GLB` de bajo peso poligonal. |
| 🧠 **Fuente de Datos** | `PTB-XL (PhysioNet)` | Base de datos clínica validada y procesada en formato JSON. |

---

## 7. Consideraciones Técnicas
- Rendimiento: El renderizado asíncrono y la delegación de procesamiento de IA al modelo Gemini 2.5 previenen bloqueos en el hilo principal del navegador.
- Escalabilidad: La separación entre el backend de Flask y las vistas permite migrar a arquitecturas de microservicios (AWS, Google Cloud) en futuras etapas.
- Usabilidad: Diseño "Mobile-First" asegurando legibilidad de las gráficas médicas en tablets y celulares.

---

## 8. Limitaciones del Diseño

- La plataforma está concebida para la simulación educativa, por lo que no cumple con el nivel de aseguramiento de software de clase médica (IEC 62304).
- La calidad de la interpretación depende estrictamente de la integridad del JSON extraído de la base de datos PTB-XL original.

---

## 9. Advertencia de Uso

>⚠️ Advertencia Legal:
>Yuluka‑EKG es una plataforma con fines estrictamente educativos. Los algoritmos de filtrado, las visualizaciones 3D y >las sugerencias del asistente de Inteligencia Artificial no deben utilizarse para el diagnóstico médico de pacientes >reales ni para la toma de decisiones clínicas. Los desarrolladores no asumen responsabilidad por el uso indebido del >sistema fuera del ámbito académico.

---

## 10. Conclusión del Diseño Técnico

El diseño de Yuluka‑EKG establece una plataforma web robusta. Al sustituir la complejidad técnica de librerías clínicas pesadas por herramientas web dinámicas y apoyarse en datos estandarizados, se logra un balance óptimo entre rendimiento ingenieril y valor pedagógico para las ciencias de la salud.

---

