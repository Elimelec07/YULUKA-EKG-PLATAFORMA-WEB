============================================================
  YULUKA-EKG — Modelos 3D del Corazón
  Coloca tu archivo como:  static/models/heart.glb
============================================================

Si no hay archivo, el sistema carga una geometría procedural
funcional de inmediato (10 submallas nombradas).

------------------------------------------------------------
MODELOS GRATUITOS RECOMENDADOS (alta fidelidad + segmentados)
------------------------------------------------------------

1. SKETCHFAB — Mejor opción
   Busca: "human heart anatomy" filtrando por "Downloadable: Free"
   Descarga siempre en formato GLB.

   Modelos probados con este código:
   • "Realistic Human Heart" — múltiples submallas, texturas PBR
   • "Human Heart" by Zam3D — aurículas y ventrículos separados
   • "Heart Anatomy" — incluye coronarias visibles

   URL: https://sketchfab.com/search?q=human+heart+anatomy&type=models&downloadable=true

2. NIH 3D Print Exchange (dominio público, uso médico)
   URL: https://3d.nih.gov/
   Buscar: "heart" → descargar STL → convertir a GLB con Blender (gratis)

3. BodyParts3D / DBCLS (licencia CC Attribution-ShareAlike)
   URL: https://lifesciencedb.jp/bp3d/
   Modelos anatómicos del corazón humano en varios formatos

4. Poly Haven — no tiene corazones, pero tiene texturas PBR gratuitas
   que puedes aplicar a cualquier modelo descargado.

------------------------------------------------------------
CONVERTIR A GLB (si el modelo viene en otro formato)
------------------------------------------------------------

Con Blender (gratuito, https://www.blender.org/):
  1. File → Import → el formato de tu modelo (.obj, .fbx, .stl, etc.)
  2. Selecciona todos los objetos (A)
  3. File → Export → glTF 2.0 (.glb/.gltf)
     - Format: GLB (recomendado)
     - Include: Selected Objects, Materials, Normals, UVs
  4. Guarda como heart.glb en esta carpeta

------------------------------------------------------------
CÓMO CONFIGURAR LOS NOMBRES DE SUBMALLAS
------------------------------------------------------------

Después de cargar el modelo en Yuluka-EKG:
  1. Abre el visor 3D (botón "Modelo 3D Interactivo")
  2. Abre la consola del navegador (F12 → Consola)
  3. Verás el árbol completo: "[Heart3D] Submallas identificadas"
  4. Copia los nombres en el bloque CONFIG.mallas de heart3d.js

Ejemplo de lo que verás:
  "LeftVentricle"    →   clave: "leftventricle"
  "RightVentricle"   →   clave: "rightventricle"
  "Aorta"            →   clave: "aorta"
  ...

Luego en heart3d.js, bloque CONFIG.mallas:
  vi:       ['LeftVentricle'],
  vd:       ['RightVentricle'],
  aorta:    ['Aorta'],
  anterior: ['AnteriorWall'],
  ...

IMPORTANTE: Si el modelo es una sola pieza sólida sin submallas
separadas, el highlighting clínico NO funcionará por zonas.
Necesitas un modelo donde cada parte anatómica sea un objeto
independiente dentro del archivo GLB.

------------------------------------------------------------
