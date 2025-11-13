# Fix: Acumulación de Cookies en Localhost

## Problema
Laravel estaba creando múltiples cookies de sesión en cada request, causando que el navegador acumulara cientos de cookies y eventualmente dejara de funcionar el localhost.

## Causas Identificadas

1. **SESSION_DOMAIN vacío**: Laravel no podía determinar correctamente el dominio para las cookies
2. **SESSION_COOKIE no especificado**: Generaba nombres de cookie aleatorios en cada request
3. **Middleware duplicado**: Se estaban aplicando middlewares de sesión múltiples veces:
   - `EncryptCookies`
   - `AddQueuedCookiesToResponse`
   - `StartSession`
   
   Estos ya están incluidos en `EnsureFrontendRequestsAreStateful` de Sanctum

## Soluciones Aplicadas

### 1. Configuración de Sesión (.env)
```env
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=localhost          # ← AÑADIDO
SESSION_COOKIE=laravel_session    # ← AÑADIDO
```

### 2. Middleware Optimizado (bootstrap/app.php)
Se eliminó la duplicación de middlewares. `EnsureFrontendRequestsAreStateful` ya incluye todos los middlewares necesarios:

```php
->withMiddleware(function (Middleware $middleware): void {
    // EnsureFrontendRequestsAreStateful ya incluye:
    // - EncryptCookies
    // - AddQueuedCookiesToResponse
    // - StartSession
    $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
    
    $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
})
```

## Pasos para Aplicar el Fix

### 1. Limpiar Cookies Actuales (UNA VEZ)

**Opción A: Chrome/Edge**
1. Abre DevTools (F12)
2. Ve a la pestaña "Application" o "Aplicación"
3. En el menú lateral, expande "Cookies"
4. Haz clic en "http://localhost"
5. Selecciona todas las cookies (Ctrl+A / Cmd+A)
6. Presiona Delete o haz clic derecho → "Clear"

**Opción B: Firefox**
1. Abre DevTools (F12)
2. Ve a la pestaña "Storage" o "Almacenamiento"
3. Expande "Cookies" en el menú lateral
4. Haz clic en "http://localhost"
5. Selecciona todas y elimina

**Opción C: Safari**
1. Desarrollador → Mostrar Consola Web
2. Pestaña "Storage"
3. Cookies → localhost
4. Eliminar todas

**Opción D: Desde Configuración del Navegador**
1. Configuración → Privacidad y seguridad
2. Cookies y datos del sitio
3. Ver todas las cookies y datos del sitio
4. Buscar "localhost"
5. Eliminar

### 2. Reiniciar el Servidor de Laravel
```bash
# Detén el servidor actual (Ctrl+C)
# Inicia nuevamente
php artisan serve
```

### 3. Reiniciar Next.js (Frontend)
```bash
# Detén el servidor de desarrollo (Ctrl+C)
# Inicia nuevamente
npm run dev
# o
yarn dev
```

### 4. Verificar el Fix
1. Abre el navegador en modo incógnito o privado
2. Ve a http://localhost:3000
3. Inicia sesión
4. Abre DevTools → Application → Cookies
5. Deberías ver SOLO:
   - `laravel_session` (1 cookie)
   - `XSRF-TOKEN` (1 cookie)
   - Cookies de Next.js si aplican

## Cookies Esperadas

Después del fix, deberías tener solamente estas cookies:

```
Nombre                    Dominio      Descripción
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
laravel_session           localhost    Sesión de Laravel
XSRF-TOKEN               localhost    Token CSRF de Laravel
next-auth.session-token  localhost    Sesión de Next.js (si usas)
```

## Prevención Futura

### Buenas Prácticas:

1. **Siempre define SESSION_DOMAIN** en desarrollo:
   ```env
   SESSION_DOMAIN=localhost
   ```

2. **Define un nombre de cookie consistente**:
   ```env
   SESSION_COOKIE=laravel_session
   ```

3. **No dupliques middlewares**: Revisa que no estés aplicando middlewares de sesión múltiples veces

4. **Monitorea las cookies**: Revisa periódicamente las cookies en DevTools

### Configuración Recomendada para Producción:

```env
# Producción
SESSION_DOMAIN=.tudominio.com
SESSION_COOKIE=app_session
SESSION_SECURE_COOKIE=true
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
```

## Troubleshooting

### Las cookies siguen acumulándose
1. Verifica que reiniciaste el servidor de Laravel
2. Limpia las cookies del navegador completamente
3. Verifica que los cambios en `.env` se hayan guardado
4. Ejecuta `php artisan config:clear`

### Error de CSRF token mismatch
1. Limpia las cookies
2. Verifica que CORS esté correctamente configurado
3. Asegúrate de que `supports_credentials: true` en `config/cors.php`

### Sesión no persiste
1. Verifica que `SESSION_DRIVER=cookie` esté configurado
2. Revisa que `SESSION_LIFETIME` sea suficiente
3. Verifica que el dominio del frontend coincida con `SANCTUM_STATEFUL_DOMAINS`

## Referencias

- [Laravel Session Documentation](https://laravel.com/docs/11.x/session)
- [Laravel Sanctum SPA Authentication](https://laravel.com/docs/11.x/sanctum#spa-authentication)
- [CORS Configuration](https://laravel.com/docs/11.x/routing#cors)

---

**Fecha del Fix**: Noviembre 2, 2025
**Archivos Modificados**:
- `apps/laravel/.env`
- `apps/laravel/bootstrap/app.php`
