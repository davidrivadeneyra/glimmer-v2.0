# Opportunity Section

Documentación técnica de cómo funciona `OpportunitySection.jsx`.

## Objetivo

La sección `opportunity-section` usa su propia secuencia animada y hace que las frases de `opportunityLines` aparezcan una por una con el scroll.

Comportamiento esperado:

- el fondo avanza con la secuencia propia de opportunity
- solo una frase está visible a la vez
- cada frase entra, permanece un tramo y luego sale
- al terminar una frase, empieza la siguiente

## Archivos implicados

- `src/components/sections/OpportunitySection.jsx`
- `src/lib/opportunityFrames.js`
- `src/index.css`

## Fondo animado

La sección usa una secuencia propia:

- `OPPORTUNITY_FRAME_COUNT = 360`
- `getOpportunityFrameSrc(index)` devuelve la ruta `/assets/video-frames/oportunity/frame-XXXX.webp`

Esa lógica vive en `src/lib/opportunityFrames.js`.

Dentro de `OpportunitySection.jsx`:

- se crea un `canvas`
- se precargan los 360 frames con `new Image()`
- en cada scroll se calcula un `frameIndex`
- ese frame se dibuja en el canvas con `drawImage`

La sección tiene un contenedor sticky para que el canvas ocupe toda la pantalla mientras el usuario recorre el tramo de scroll de la sección.

## Progreso por scroll

La sección calcula el progreso así:

- toma el `getBoundingClientRect()` de la sección
- calcula `scrollableDistance = rect.height - viewportHeight`
- convierte eso a un valor normalizado entre `0` y `1`
- ese progreso se mapea a un frame entre `0` y `359`

Fórmula conceptual:

```js
progress = clamp(-rect.top / (rect.height - viewportHeight), 0, 1)
frameIndex = round(progress * (OPPORTUNITY_FRAME_COUNT - 1))
```

## Altura total de scroll

La altura de la sección no es fija. Se define con:

```js
getOpportunityScrollSpan(lineCount) => `${Math.max(lineCount * 55, 220)}vh`
```

Eso significa:

- a más frases, más tramo de scroll
- el mínimo actual es `220vh`

## Reparto de frases por frames

Cada frase recibe un segmento del total de 360 frames.

Lógica actual:

```js
segmentSize = OPPORTUNITY_FRAME_COUNT / lineCount
segmentStart = lineIndex * segmentSize
localProgress = clamp((frameIndex - segmentStart) / segmentSize, 0, 1)
```

En otras palabras:

- si hay 4 frases, cada una recibe aproximadamente un cuarto del recorrido
- si hay 5 frases, cada una recibe aproximadamente un quinto

## Ciclo de cada frase

Cada frase pasa por 3 estados dentro de su propio segmento:

1. Entrada
2. Permanencia
3. Salida

Tramos actuales:

- `0.12 -> 0.32`: entra
- `0.32 -> 0.68`: permanece visible
- `0.68 -> 0.9`: sale

Fuera de esos tramos:

- la opacidad es `0`
- no debería verse esa frase

## Animación visual de cada frase

La función `getOpportunityLineProgress()` devuelve:

- `opacity`
- `translateY`

Durante la entrada:

- la opacidad sube de `0` a `1`
- la frase viene desde abajo

Durante la permanencia:

- `opacity = 1`
- `translateY = 0`

Durante la salida:

- la opacidad baja de `1` a `0`
- la frase sube ligeramente

## Por qué solo se ve una frase

En CSS, todas las frases están apiladas en el mismo lugar:

- `.opportunity-lines` es un contenedor relativo
- cada `p` está en `position: absolute`
- todas comparten el mismo centro visual

Eso evita una lista vertical y hace que una frase reemplace a la otra.

## Capas visuales

La sección tiene estas capas:

1. `opportunity-canvas`: fondo animado
2. `opportunity-media-wash`: overlay para contraste y lectura
3. `opportunity-shell`: contenido encima del fondo

## Ajustes rápidos

Si quieres cambiar la sensación de la sección, estos son los puntos principales:

- más duración por frase:
  aumenta `lineCount * 55` o los tramos de permanencia
- entrada más rápida:
  acorta el tramo `0.12 -> 0.32`
- salida más lenta:
  amplia el tramo `0.68 -> 0.9`
- más desplazamiento vertical:
  cambia los valores de `translateY` (`56` y `-40`)
- más o menos contraste del texto:
  ajusta `opportunity-media-wash` en `src/index.css`

## Resumen

`OpportunitySection` es una sección sticky con canvas a pantalla completa que:

- usa la secuencia visual propia de opportunity
- sincroniza esa secuencia con el scroll local
- divide los frames entre las frases disponibles
- muestra una única frase por vez, con entrada y salida progresiva
