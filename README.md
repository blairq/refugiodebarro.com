# refugiodebarro.com

Página de inicio animada de **Refugio de Barro**. Sitio estático: no requiere build.

```
index.html          estructura + ilustraciones SVG inline
css/styles.css      estilos (paleta de marca: #4d2208 · #f8f3ea · #6d7653)
js/main.js          animaciones (GSAP + ScrollTrigger + DrawSVG + SplitText)
assets/img/         fotos y logo del sitio original, optimizados a WebP
assets/vendor/      GSAP 3.15 vendorizado (licencia estándar de GreenSock, gratuita)
```

Para verlo localmente: `python3 -m http.server` y abrir http://localhost:8000.

## Contenido

Textos, fotos, logo, e-book y datos de contacto vienen de la home actual (Systeme.io).
Links: tienda → `/biblioteca`, e-book → `refugiodebarro.online`, WhatsApp → `wa.link/9b045d`, Instagram `@refugio.debarro`.

## Recorrido

1. **Hero**: el sello del logo gira al entrar, el título aparece letra por letra y los garabatos se dibujan a mano con retrasos aleatorios. Al hacer scroll el paisaje atardece (sol, cielo y colinas en parallax).
2. **No se construye: se cultiva**: el título sube letra por letra y el manifiesto se enciende palabra por palabra.
3. **Foto de la casa**: se abre desde una ventana redondeada hasta ocupar toda la pantalla.
4. **Más que cuatro paredes**: seis tarjetas flotantes (Hermosa, Saludable…) con inclinación 3D y redibujo del ícono.
5. **Estrategia única**: foto del muro de botellas que se revela, con luces de colores flotando y texto por líneas.
6. **Te acompañamos paso a paso**: escena fijada donde la casa se construye con el scroll.
7. **Técnicas**: recorrido horizontal (Superadobe, Adobe y cob, Tapial, Fardos de paja, Quincha), cada una con su animación.
8. **E-book**: el libro entra en 3D, flota, brilla y sigue al mouse.
9. **Tienda** y **Contacto** nocturno (luna, estrellas, luciérnagas) + botón flotante de WhatsApp.

Todo lo ligado al scroll usa `scrub`, así que se des-anima al volver hacia arriba.

## Rendimiento y accesibilidad

- Se anima sobre todo `transform` / `opacity`; las fotos pesan entre 40 y 190 KB (WebP) y cargan en diferido.
- Los loops infinitos se pausan cuando su sección no está en pantalla.
- Con `prefers-reduced-motion: reduce` (o sin JS) se muestra una versión estática completa.
