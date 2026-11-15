# Investigación de motion y recursos

## Dirección propuesta

Motion editorial urbano: superficies negras y blancas, una línea de recorrido dibujada con SVG y un teléfono real del prototipo como foco tangible. Las animaciones son cortas, responden a la presencia del visitante y no simulan datos de tráfico en vivo. La escena cartográfica ya existente conserva su dibujo de calles y la ruta de StellarTraffic.

## Selección antes de implementar

| Recurso | Formato / licencia | Uso posible y coste | Decisión |
|---|---|---|---|
| [Map and Pin · LottieFiles](https://lottiefiles.com/free-animation/map-and-pin-KEIvtpAiY9) | dotLottie (~6.8 KB) o JSON (~36.4 KB optimizado); Lottie Simple License. Atribución no obligatoria, recomendada. | Pin de mapa listo para usar; archivo pequeño, pero una animación Lottie necesita runtime y su API añade JavaScript. | Referencia prefabricada revisada. Se eligió SVG de geometría propia: encaja con la ruta real del proyecto y evita una dependencia de animación. |
| [useAnimations · Maps & Location](https://useanimations.com/categories/maps-location) | SVG y JSON; colección MIT, sin atribución requerida. | Iconos puntuales; hace falta reproducir el JSON con un player Lottie, que no está incluido en el proyecto. | Revisado; el lenguaje de icono no aporta el mapa editorial que pide la marca. |
| [Figma Smart Animate](https://help.figma.com/hc/en-us/articles/360039818874-Smart-animate-layers-between-frames) | Prototipado entre frames de Figma. | Referencia útil para continuidad y transiciones entre estados; no es un runtime de la landing. | Se trasladan los principios de continuidad; no se recibió un archivo/link Figma y el conector de Figma no está instalado aquí. |
| [Higgsfield · Display Transition](https://higgsfield.ai/motion/cf852c5b-8e2a-45b7-807e-2a35b2636a3f) | Efecto de video generado; herramienta remota. | Sirve para explorar un corte cinematográfico, pero un clip de video no responde al foco, puntero, tamaño de pantalla o preferencias de movimiento. | Referencia para el reveal de apertura; Higgsfield no está conectado y no se incorpora un video. |
| [Rive](https://www.rive.app/pricing) | Archivo `.riv`, runtime web; autoría y exportación dependen del plan. | State machines interactivas, útiles para personajes o interfaces complejas; coste de authoring y runtime superior al necesario para dos paneles y una ruta. | No elegido para este alcance. |
| [Lordicon](https://lordicon.com/docs/license/free) | Lottie, GIF, SVG y PNG; iconos gratuitos requieren atribución. | Microiconos; una animación de icono no resolvería el foco visual de la landing. | No elegido. |
| [IconScout](https://iconscout.com/licenses) | Lottie/dotLottie, GIF, After Effects y otros; licencia depende de cada asset/plan. | Hay que validar licencia por pieza y añadir player para Lottie. | No elegido; no se necesita comprar un asset genérico. |
| [Icons8](https://icons.docs.icons8.com/) | SVG, JSON, GIF y After Effects según el recurso; uso gratuito sujeto a atribución y restricciones por categoría. | Útil para iconografía, pero no para la animación principal. | No elegido. |
| [Storyset](https://storyset.com/faqs) | SVG/PNG; se puede animar SVG; los recursos gratuitos requieren atribución. | Ilustraciones editables, pero introducirían una estética de biblioteca ajena a la cartografía y a las capturas reales. | No elegido. |
| [DrawKit](https://www.drawkit.com/license) | SVG/PNG; permite usos comerciales según su licencia, sin redistribuir el recurso como asset independiente. | Ilustración lista para integrar; el peso depende de la pieza y su rasterización. | No elegido: se conserva el prototipo suministrado y se dibuja geometría original. |
| [SVG Repo](https://www.svgrepo.com/page/licensing) | SVG; cada asset puede tener licencia diferente. | Icono vectorial ligero; exige revisar licencia y atribución pieza por pieza. | No hace falta importar otro icono para esta escena. |
| [SVGator](https://www.svgator.com/pricing) | Exportación SVG/Lottie según plan. | El SVG animado evita el runtime Lottie; sus funciones de autoría/exportación animada dependen del plan. | Se escribe el trazo SVG directamente y se mantiene en el repositorio. |
| [Jitter](https://help.jitter.video/en/articles/5369843-export-your-work) | Lottie, GIF o video según exportación/plan. | Bueno para motion entregado como asset; la salida de video no sería interactiva y Lottie añade player. | No elegido. |
| [Spline](https://spline.design/pricing) · [exportación web](https://docs.spline.design/exporting-your-scene/web/exporting-as-code) | Escena WebGL/3D y runtime. | Puede crear una escena tridimensional, con coste adicional de CPU/GPU y descarga. | No elegido: una escena 3D no mejora la explicación del mapa y sacrificaría ligereza. |

## Técnicas aplicadas

- Apertura a dos paneles con bordes quebrados: CSS `transform`, de una sola ejecución por sesión; capa decorativa no interactiva.
- Perspectiva 2.5D del teléfono: `pointermove` en escritorio con puntero fino, coordenadas acotadas y `requestAnimationFrame`; flotación muy leve fuera de pantallas táctiles.
- SVG Line Drawing para la ruta de la tarjeta y la escena de ciudad, con contenido estático visible si no hay JavaScript.
- La escena de ciudad hace un settle de cámara de 4% al entrar en vista; el cambio es de una sola vez y no altera el layout.
- El usuario conserva el control de lectura: sin scroll scrubbing, morphing, WebGL ni reproducción automática en móvil.
- `prefers-reduced-motion` elimina las animaciones, el desplazamiento suave y el seguimiento del puntero.

## Referencias de dirección

Se consultaron [CodePen](https://codepen.io/search/pens?q=split%20screen%20reveal), [Codrops](https://tympanus.net/codrops/), [Awwwards](https://www.awwwards.com/), [Dribbble](https://dribbble.com/search/split-screen-navigation) y [Behance](https://www.behance.net/search/projects?search=editorial%20motion%20web) como referencias de transición, jerarquía y reveal. Son referencias de técnica y composición, no assets copiados. Apple, Samsung y Waze se usan como referencias del trabajo previo de esta landing; el teléfono y el contenido de producto siguen siendo las capturas reales suministradas para StellarTraffic.

## Integraciones y disponibilidad

El proyecto instala Angular 22 y no instala GSAP, Anime.js, Motion, Rive, Lottie/dotLottie, Three.js ni Spline. La inspección de herramientas de Codex no mostró un conector de Figma ni de Higgsfield instalado. No se añadieron dependencias ni se declaró conectada una integración que no está disponible. La implementación usa CSS, SVG y APIs del navegador ya incluidos.

