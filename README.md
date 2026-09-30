# refugiodebarro.com

Página de inicio animada de **Refugio de Barro**. Sitio estático: no requiere build.

```
index.html          estructura + ilustraciones SVG inline
css/styles.css      estilos (paleta tierra, tipografías Fraunces / DM Sans / Caveat)
js/main.js          animaciones (GSAP + ScrollTrigger + DrawSVG + SplitText)
assets/vendor/      GSAP 3.15 vendorizado (licencia estándar de GreenSock, gratuita)
```

Para verlo localmente: `python3 -m http.server` y abrir http://localhost:8000.

## Recorrido

1. **Hero**: título con aparición letra por letra, garabatos dibujados a mano con retrasos aleatorios, nubes y pájaros vivos. Al hacer scroll el paisaje atardece (sol que baja, cielo que cambia, colinas en parallax) y vuelve al subir.
2. **El barro**: manifiesto cuyas palabras se "encienden" a medida que se lee.
3. **Cómo construimos**: escena fijada donde la casa se arma con el scroll (tierra → agua y paja → adobes → revoque → techo vivo → refugio con luz y humo).
4. **Capítulos**: tarjetas flotantes que aparecen escalonadas, flotan suavemente, se inclinan en 3D con el mouse y redibujan su ícono.
5. **Materiales**: recorrido horizontal con una animación propia por material.
6. **Visitanos**: cae la noche; luna, estrellas, luciérnagas y la ventana encendida.

Todo lo ligado al scroll usa `scrub`, así que se des-anima al volver hacia arriba.

## Rendimiento y accesibilidad

- Sólo se animan `transform` / `opacity`; sin imágenes pesadas (todo es SVG inline).
- Los loops infinitos se pausan cuando su sección no está en pantalla.
- Con `prefers-reduced-motion: reduce` (o sin JS) se muestra una versión estática completa.

## Contenido

> ⚠️ Los textos, el mail (`hola@refugiodebarro.com`) y el link de Instagram son **provisorios**: el sitio original no era accesible al momento de armar esta versión. Reemplazalos en `index.html`.
> Para sumar fotos reales, se pueden agregar `<img>` dentro de `.card__inner` o `.panel` sin tocar las animaciones.
