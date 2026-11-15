# HODATEAM

Landing de HODATEAM construida con Angular 22. El contenido presenta al equipo, sus áreas de trabajo y StellarTraffic como un proyecto móvil **en desarrollo**. Las pantallas del proyecto son las capturas reales compartidas por el equipo. La dirección visual actual es monocromática: negro, blanco y grises; el color queda en las capturas originales del prototipo.

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

Angular genera el sitio listo para publicar en `dist/hodateam/browser/`. `outputMode: "static"` y las rutas de servidor en modo `Prerender` generan HTML estático para `/`; no se necesita un servidor Angular en producción. Workers Static Assets publica ese directorio.

La compilación de producción prerenderiza una ruta; las 2 pruebas unitarias pasan. La inspección del HTML generado confirma que los enlaces internos y los recursos tienen destino. La instalación actual, con Wrangler incluido, reportó 0 vulnerabilidades.

### Revisión visual y Lighthouse

Lighthouse 13.6.0 se ejecutó sobre la compilación de producción servida localmente. En móvil, rendimiento subió de 90 a 94; accesibilidad, buenas prácticas y SEO conservaron 100. FCP mejoró de 1,3 a 1,2 s, LCP de 3,5 a 3,0 s, bloqueo total de 130 a 80 ms y CLS permaneció en 0. El peso bajó de 470 a 353 KiB. El LCP móvil sigue 0,5 s por encima del objetivo recomendado de 2,5 s.

En escritorio, rendimiento y las otras tres categorías marcaron 100. FCP se mantuvo en 0,3 s, LCP midió 0,8 s frente a 0,7 s, bloqueo total siguió en 0 ms y CLS en 0. Lighthouse transfirió 489 KiB, 19 KiB más que la línea base; la captura de auditoría cargó dos imágenes adicionales de la galería (33 KiB en conjunto), mientras el logo nuevo ahorra unos 21 KiB.

La revisión visual cubrió 320, 375, 430, 768, 1024, 1440 y 1920 px. No hubo desbordamiento horizontal, imágenes rotas, anclas faltantes ni errores de consola; menú con Escape, galería modal y movimiento reducido funcionaron. Las métricas INP de usuarios reales no están disponibles; TBT es un indicador de laboratorio complementario y la prueba de teclado confirma funcionamiento, no INP. Capturas, datos, investigación comparativa y limitaciones están en [el informe del rediseño](artifacts/redesign/REPORT.md).

Los informes iniciales están en `artifacts/lighthouse/`, y los finales en `artifacts/redesign/`. La prueba se hizo sobre un servidor estático local, que no aplica los encabezados de caché de Cloudflare; por eso la recomendación de caché de Lighthouse debe reevaluarse contra el sitio desplegado.

## Publicar en Cloudflare Workers

La configuración versionada de Wrangler está en `wrangler.jsonc`: el Worker `hodateam-landing` publica `dist/hodateam/browser/` como Static Assets. El build estático prerenderiza la ruta `/`; no configura fallback SPA porque la landing solo usa anclas y no declara rutas Angular de página. Si luego se agregan rutas prerenderizadas o CSR, revisa el fallback con `index.csr.html` antes de activarlo: el `index.html` actual contiene la página prerenderizada de `/`.

### Despliegue manual

```powershell
npm ci
npm run build
npm run deploy:workers
```

`npm run deploy:workers` ejecuta Wrangler y publica la configuración y los assets en Cloudflare; requiere autenticación previa con `npx wrangler login` o credenciales configuradas localmente. Para validar localmente después del build, ejecuta `npx wrangler dev` y abre la URL local que indique Wrangler.

### Workers Builds desde GitHub

En **Workers & Pages → `hodateam-landing` → Settings → Builds**, conecta este repositorio y configura la raíz del repositorio, la rama de producción `main` (rama actual de esta copia; confirma que sea la rama que quieres publicar), `npm run build` como Build command, `npx wrangler deploy` como Deploy command y `npx wrangler preview` como Preview command. Verifica que el nombre del Worker en el dashboard coincida con `name` en `wrangler.jsonc`. `.nvmrc` ya fija Node.js en `24.15.0`; Workers Builds reconoce ese archivo. Si el dashboard no lo detecta, define `NODE_VERSION=24.15.0` en las variables de build. Cloudflare instala las dependencias según `packageManager` y usa la versión de Wrangler declarada en `package.json`.

El repositorio no contiene workflows de GitHub Actions. Aunque esta copia tiene `origin` configurado, el dashboard y su historial de builds no son visibles desde el repo; confirma allí que el Worker esté conectado a este repositorio y a la rama de producción elegida. Evita configurar a la vez otra automatización de deploy en GitHub Actions.

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
| `hodateam-logo.webp` | Derivado WebP de 5,45 KB del logotipo oficial para el encabezado; sustituye el PNG de 27 KB en la landing. |
| `stellar-inicio.webp`, `stellar-leyenda.webp`, `stellar-zoom.webp`, `stellar-ajustar.webp` | Capturas reales del prototipo móvil compartidas por el equipo; optimizadas localmente a WebP. |
| `city-at-night.webp`, `city-at-night-mobile.webp` | Foto urbana nocturna de Santiago de Chile, por [Raúl Escobar](https://unsplash.com/photos/an-aerial-view-of-a-city-at-night-8Xci1c62GfA), optimizada y recortada localmente para escritorio y móvil. |
| `hodateam-social-preview.jpg` | Composición propia con la foto anterior, el logotipo oficial y texto de HODATEAM. |

La foto de Unsplash se distribuye bajo la [licencia Unsplash](https://unsplash.com/license), que permite su descarga, modificación y uso comercial gratuitos. La atribución no es obligatoria; se incluye aquí como crédito. Las pantallas de StellarTraffic se conservan fieles a las capturas originales.

## Decisiones de diseño

- Negro y blanco definen las secciones principales; grises suaves separan capacidades y contenido sin añadir otro color de marca.
- La foto nocturna y la ruta se muestran en monocromo. El color aparece solo dentro de las pantallas reales de StellarTraffic.
- Tipografía sans uniforme, títulos de alto contraste y menos etiquetas y adornos para una lectura más limpia.
- La tarjeta social sigue la misma paleta en escala de grises.
- El movimiento se limita a entradas breves del hero; se respetan las preferencias de movimiento reducido.
- Imágenes secundarias con carga diferida, hero priorizado, menú compacto accesible y ampliación de capturas mediante el elemento nativo `dialog`.

## Estructura

```text
src/app/
  sections/       Header, hero, capacidades, proyecto y cierre
  site-config.ts  Dominio público centralizado
  app.ts          Composición, SEO y apariciones al desplazarse
public/assets/    Logotipo, fotografía, tarjeta social y capturas WebP
```
