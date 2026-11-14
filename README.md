# HODATEAM

Landing de HODATEAM construida con Angular 22. El contenido presenta al equipo, sus áreas de trabajo y StellarTraffic como un proyecto móvil **en desarrollo**. Las pantallas del proyecto son las capturas reales compartidas por el equipo.

## Requisitos

- Node.js 22.22.3 o posterior (`.nvmrc` usa 24.15.0).
- npm 11 o compatible.

## Desarrollo

```powershell
npm ci --maxsockets=1
npm start
```

La aplicación de desarrollo está disponible en `http://localhost:4200/`.

## Compilación y comprobaciones

```powershell
npm run build
npm test
```

Angular genera el sitio listo para publicar en `dist/hodateam/browser/`. El modo de renderizado estático deja el HTML principal prerenderizado: Cloudflare Pages solo necesita archivos estáticos, sin funciones ni servidor.

En la revisión de esta entrega, la instalación limpia añadió 367 paquetes; la compilación prerenderizó una ruta sin avisos de estilo y las 2 pruebas pasaron. La inspección del HTML generado confirmó que los enlaces internos, las imágenes y los metadatos estructurados tienen destino. npm reportó 0 vulnerabilidades en la instalación. No se obtuvo una captura de navegador ni una medición Lighthouse: el control del navegador agotó su tiempo de aprobación, así que esos resultados no se declaran.

## Publicar en Cloudflare Pages

1. Conecta el repositorio a Cloudflare Pages.
2. Usa `npm run build` como comando de compilación.
3. Usa `dist/hodateam/browser` como directorio de salida.
4. Define `NODE_VERSION=24.15.0` en las variables de entorno del proyecto.
5. Añade el dominio cuando esté confirmado en `src/app/site-config.ts` y en la configuración del proyecto de Cloudflare.
6. Despliega de nuevo. Para futuras versiones, actualiza la rama conectada y Cloudflare ejecutará la misma compilación.

La landing solo tiene navegación por anclas, así que no necesita una regla de rutas cliente. Si después se agregan rutas Angular, configura el fallback de Cloudflare para servir `index.csr.html` en rutas que no se prerendericen.

## Dominio y SEO

El dominio de producción todavía no está definido. Por eso no se incluye una URL canónica, un `og:url` ni un `sitemap.xml` inventados. Cuando el dominio real exista, actualiza una sola vez `SITE_CONFIG.siteOrigin` en `src/app/site-config.ts`. La aplicación emitirá la URL canónica y las URL absolutas de Open Graph y Twitter durante el prerenderizado. Después, crea y publica un `sitemap.xml` con ese dominio y añade su ubicación a `public/robots.txt`.

El título, la descripción, el idioma español, la tarjeta social, el color de tema y el favicon ya están definidos en el HTML de entrada.

## Navegación y acciones

| Elemento | Acción o destino |
| --- | --- |
| Logotipo HODATEAM | Inicio, `#inicio` |
| El equipo | Identidad, `#identidad` |
| Capacidades | Áreas de trabajo, `#capacidades` |
| Proyectos | StellarTraffic, `#proyectos` |
| Enfoque | Forma de construir, `#enfoque` |
| Contacto | Cierre, `#contacto` |
| Explorar StellarTraffic | Desplazamiento a `#proyectos` |
| Cada captura del proyecto | Abre su pantalla real en un diálogo accesible; Escape o el botón de cierre lo cierran |
| Abrir en GitHub | [Organización pública de StellarTraffic](https://github.com/StellarTraffic-organization) |

No se muestra formulario, dirección de correo ni canal social porque HODATEAM no los proporcionó en esta entrega.

## Recursos y procedencia

| Recurso | Procedencia |
| --- | --- |
| `hodateam-logo.png`, `hodateam-mark.png` | Logotipo e ícono final compartidos por el equipo; preparados con fondo transparente. |
| `stellar-inicio.webp`, `stellar-leyenda.webp`, `stellar-zoom.webp`, `stellar-ajustar.webp` | Capturas reales del prototipo móvil compartidas por el equipo; optimizadas localmente a WebP. |
| `city-at-night.webp` | Foto urbana nocturna de Santiago de Chile, por [Raúl Escobar](https://unsplash.com/photos/an-aerial-view-of-a-city-at-night-8Xci1c62GfA). Descarga local optimizada a WebP. |
| `hodateam-social-preview.jpg` | Composición propia con la foto anterior, el logotipo oficial y texto de HODATEAM. |

La foto de Unsplash se distribuye bajo la [licencia Unsplash](https://unsplash.com/license), que permite su descarga, modificación y uso comercial gratuitos. La atribución no es obligatoria; se incluye aquí como crédito. Las pantallas de StellarTraffic se conservan fieles a las capturas originales.

## Decisiones de diseño

- Contraste entre fondos azul petróleo y papel cálido para dar ritmo editorial.
- Verde lima como acento de navegación, movimiento y producto, sin trasladar al sitio la identidad cromática de StellarTraffic.
- Composición fotográfica del hero con una captura auténtica, y sección de proyecto compuesta únicamente con pantallas reales.
- Tipografía del sistema y serif editorial; no se carga una fuente ni un recurso externo en tiempo de ejecución.
- Animación breve de entrada y aparición al desplazarse; ambas respetan `prefers-reduced-motion`.
- Imágenes secundarias con carga diferida, hero priorizado, menú compacto accesible y ampliación de capturas mediante el elemento nativo `dialog`.

## Estructura

```text
src/app/
  sections/       Header, hero, capacidades, proyecto y cierre
  site-config.ts  Dominio público centralizado
  app.ts          Composición, SEO y apariciones al desplazarse
public/assets/    Logotipo, fotografía, tarjeta social y capturas WebP
```
