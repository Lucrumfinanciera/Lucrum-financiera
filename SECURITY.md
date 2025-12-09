# Seguridad y endurecimiento

Este proyecto está preparado para ejecutarse solo sobre HTTPS y con cabeceras modernas. Si tu hosting no lee `_headers` (ej. Netlify), replica estas directivas en tu servidor/reverse proxy:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: data:; font-src 'self' data:; connect-src 'self' https://script.google.com https://script.googleusercontent.com https://assets.zyrosite.com; form-action 'self' https://script.google.com https://script.googleusercontent.com; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests; block-all-mixed-content
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), camera=(), geolocation=(), microphone=(), payment=(), usb=()
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
```

## Integridad (SRI)
- Los recursos locales se sirven con `integrity` y `crossorigin="anonymous"`. Si editas `css/styles.css`, `js/main.js` o ficheros en `ld/`, recalcula los hashes SHA-384 y actualiza los atributos en los HTML.

## CSP
- El CSP bloquea scripts inline y solo permite `script-src 'self'`. Si añades nuevos orígenes (CDN, analytics, etc.), actualiza `Content-Security-Policy` en `_headers` y en el meta http-equiv.
- `connect-src` está limitado a `self`, `script.google.com` y `script.googleusercontent.com` para el endpoint de formularios.
- `frame-ancestors 'none'` impide que el sitio se incruste en iframes.

## Fuentes abiertas
- El código está minificado para reducir la superficie de lectura, pero el HTML seguirá siendo visible en el navegador. Para ocultar más la estructura, usa políticas de cache agresivas y deshabilita el listado de directorios en el servidor.
