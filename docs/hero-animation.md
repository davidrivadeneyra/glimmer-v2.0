# Hero Animation

Este documento describe cómo está programada actualmente la animación del hero.

## Resumen

El hero tiene dos modos:

- Desktop (`>= 768px`): usa una secuencia de frames `webp` dibujados en un `canvas`
- Mobile (`< 768px`): usa un `video` de fondo

Además del fondo, el hero también anima:

- el isotipo central
- el cambio de títulos
- el ticker de palabras
- la salida progresiva del contenido principal

Archivo principal:

- [src/components/sections/HeroSection.jsx](/Users/davidrivadeneyra/Documents/Code/glimmer%202.0/src/components/sections/HeroSection.jsx)

Archivos relacionados:

- [src/lib/heroFrames.js](/Users/davidrivadeneyra/Documents/Code/glimmer%202.0/src/lib/heroFrames.js)
- [src/hooks/useViewportVideo.js](/Users/davidrivadeneyra/Documents/Code/glimmer%202.0/src/hooks/useViewportVideo.js)
- [src/hooks/useInViewport.js](/Users/davidrivadeneyra/Documents/Code/glimmer%202.0/src/hooks/useInViewport.js)
- [src/index.css](/Users/davidrivadeneyra/Documents/Code/glimmer%202.0/src/index.css)

## Desktop: secuencia de frames en canvas

En desktop el hero usa una secuencia de imágenes:

- total de frames: `626`
- origen del path: `getHeroFrameSrc(index)`
- carpeta: `public/assets/video-frames/hero-sequence`

Referencia:

- [src/lib/heroFrames.js](/Users/davidrivadeneyra/Documents/Code/glimmer%202.0/src/lib/heroFrames.js)

### Cómo se dibuja

En `HeroSection` existe un `canvas`:

- `heroCanvasRef`

Cada vez que cambia el frame activo:

1. se busca la imagen cargada en memoria
2. se calcula el escalado para cubrir el viewport
3. se limpia el canvas
4. se dibuja la imagen centrada

La función que hace esto es `drawFrame(frameIndex)`.

### Cómo se calcula el frame activo

El frame depende del progreso de scroll dentro del hero:

1. se toma el `getBoundingClientRect()` del hero
2. se calcula cuánto se ha recorrido respecto a la altura scrolleable
3. ese progreso se convierte a un índice entre `0` y `HERO_FRAME_COUNT - 1`

La relación es:

```js
frameIndex = Math.round(progress * (HERO_FRAME_COUNT - 1))
```

Esto ocurre dentro de `updateHeroProgress()`.

### Cómo se cargan los frames

Ahora ya no se precargan los `626` frames completos.

Se usa una estrategia de ventana:

- `HERO_FRAME_PRELOAD_RADIUS = 10`
- `HERO_FRAME_CACHE_RADIUS = 18`

Significa:

- se intentan cargar los frames cercanos al frame actual
- se conservan en memoria los frames dentro del radio de cache
- los frames muy lejanos se eliminan del `Map`

Estructuras usadas:

- `heroFrameImagesRef`: `Map` con frames ya cargados
- `heroPendingFramesRef`: `Set` con frames en proceso de carga

Funciones clave:

- `ensureFrameLoaded(frameIndex)`
- `syncFrameWindow(frameIndex)`
- `unloadFrame(frameIndex)`

### Resize y DPR

El canvas se ajusta al tamaño del viewport y al `devicePixelRatio`:

- ancho = `window.innerWidth * pixelRatio`
- alto = `window.innerHeight * pixelRatio`
- `pixelRatio` limitado a `2`

Esto se hace en `syncCanvasSize()`.

## Mobile: video de fondo

En mobile el hero no usa canvas.

Usa:

- [public/assets/video/final-video-hero-limmer.mp4](/Users/davidrivadeneyra/Documents/Code/glimmer%202.0/public/assets/video/final-video-hero-limmer.mp4)

El componente renderiza también un `<video>`, pero:

- en desktop está oculto
- en mobile se muestra por CSS

Referencia visual:

- `.hero-canvas`
- `.hero-video`

CSS:

- [src/index.css](/Users/davidrivadeneyra/Documents/Code/glimmer%202.0/src/index.css)

## Control de reproducción del video

El video del hero usa el hook `useViewportVideo`.

Comportamiento:

- `preload="metadata"`
- reproduce cuando entra al viewport
- se pausa cuando sale del viewport
- si el usuario tiene `prefers-reduced-motion: reduce`, no intenta reproducir

Esto evita que el video quede corriendo toda la sesión sin necesidad.

## Animación del isotipo central

Encima del fondo existe un isotipo central:

- clase: `hero-isotipo__image`
- asset: `/assets/isotipo-blur.svg`

Este isotipo:

- rota con la clase `spin-loop`
- cambia de escala según el frame activo usando `--spin-scale`

La escala se calcula con `getHeroLogoScale(frameIndex)`.

Fases:

- del frame `0` al `279`: crece ligeramente
- del frame `280` al `294`: se reduce hasta desaparecer
- después: escala `0`

Además, la rotación solo está activa cuando el hero está visible mediante `useInViewport`.

## Títulos del hero

Los títulos no dependen de tiempo real sino del frame actual.

Configuración:

```js
const HERO_TITLE_START_FRAMES = [0, 73, 147]
```

Eso determina en qué frame aparece cada bloque de título.

La función responsable es:

- `getHeroTitleIndex(frameIndex, titleCount)`

El estado visible se guarda en:

- `heroTitleIndex`

## Ticker de palabras

El ticker aparece más adelante en la secuencia.

Configuración:

```js
const HERO_TICKER_START_FRAME = 340
const HERO_TICKER_FRAME_STEP = 66
```

Comportamiento:

- antes del frame `340`: oculto
- después: va cambiando la palabra activa cada `66` frames

Funciones responsables:

- `getHeroTickerIndex(frameIndex, tickerCount)`
- `getHeroTickerStyle(frameIndex)`

Estados relacionados:

- `heroTickerIndex`
- `heroTickerStyle`

## Fade del contenido principal

El contenido principal del hero se desvanece y baja ligeramente cuando la secuencia avanza.

Configuración:

- `fadeStartFrame = 280`
- `fadeEndFrame = 294`

La función que lo controla es:

- `getHeroContentStyle(frameIndex)`

Eso actualiza:

- `opacity`
- `transform`

del contenedor principal del contenido.

## Scroll loop

La animación se actualiza con scroll usando `requestAnimationFrame`.

Flujo:

1. el listener de `scroll` llama `requestUpdate()`
2. `requestUpdate()` cancela el frame anterior
3. agenda `updateHeroProgress()` con `requestAnimationFrame`
4. `updateHeroProgress()` calcula progreso, frame e índices visuales

También hay listeners de:

- `scroll`
- `resize`

## CSS relevante

Las clases principales del hero son:

- `.hero-section`
- `.hero-sticky`
- `.hero-media`
- `.hero-canvas`
- `.hero-video`
- `.hero-isotipo`
- `.hero-ticker-stage`
- `.hero-grid`

Puntos importantes:

- el hero ocupa una altura extendida por scroll con `--hero-scroll-span`
- la capa visual principal es sticky
- en mobile:
  - el canvas se oculta
  - el video se muestra

## Riesgos actuales

El diseño actual prioriza reducir carga inicial, pero tiene implicancias:

- en desktop todavía depende de cientos de archivos `webp`
- si el cache de frames es muy pequeño, pueden aparecer saltos o parpadeos en producción
- la secuencia en canvas requiere más coordinación de red y memoria que un video único

Puntos sensibles:

- `HERO_FRAME_PRELOAD_RADIUS`
- `HERO_FRAME_CACHE_RADIUS`
- descarte de frames en `unloadFrame()`

## Resumen técnico corto

- Desktop: secuencia `webp` sobre `canvas`, controlada por scroll
- Mobile: video de fondo controlado por viewport
- Títulos, ticker y salida del contenido dependen del frame activo
- El isotipo central rota y escala según visibilidad + frame
- La lógica central vive en `HeroSection.jsx`
