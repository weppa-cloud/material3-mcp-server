# Cache Strategy - Avoiding Stale Data

## Problem
El cache puede servir datos desactualizados si los repositorios upstream (flutter/flutter, material-components/material-web) tienen nuevos commits.

## Solution: Multi-Layer Cache Validation

### 1. **Version-Based Invalidation**
Cada cache tiene un número de versión. Si el servidor se actualiza con una nueva versión, el cache se invalida automáticamente.

```typescript
const CURRENT_CACHE_VERSION = '1.0.0';
```

### 2. **Upstream Change Detection**
Cada hora, el sistema verifica si hay nuevos commits en los repositorios upstream:

```typescript
// Check flutter/flutter master branch
GET /repos/flutter/flutter/commits/master

// Check material-web main branch
GET /repos/material-components/material-web/commits/main
```

Si los SHAs de commit cambian, el cache se invalida automáticamente.

### 3. **TTL (Time-To-Live) Configurable**
Cada tipo de dato tiene un TTL específico:

```typescript
{
  components: 3600s (1 hora)
  icons: 86400s (24 horas)  // Los iconos cambian raramente
  docs: 43200s (12 horas)
}
```

Después del TTL, los datos se refrescan automáticamente.

### 4. **Manual Invalidation**
Los usuarios pueden invalidar el cache manualmente usando la herramienta `manage_cache_health`:

```typescript
// Ver estado del cache
manage_cache_health({ action: 'status' })

// Verificar cambios upstream ahora
manage_cache_health({ action: 'check_updates' })

// Limpiar todo el cache
manage_cache_health({ action: 'invalidate_all' })

// Limpiar componente específico
manage_cache_health({
  action: 'invalidate_component',
  componentName: 'button',
  framework: 'flutter'
})
```

## Flow Diagram

```
Request → Check Cache
           ↓
     Cache Hit?
     ↙        ↘
   Yes         No
    ↓           ↓
Expired?    Fetch from
    ↓       GitHub API
   Yes           ↓
    ↓       Cache Result
    ↓           ↓
Version     Return Data
Changed?
    ↓
   Yes
    ↓
Invalidate
    ↓
Fetch Fresh
```

## Checks on Startup

Cuando el servidor inicia:
1. ✅ Verifica versión del cache
2. ✅ Si pasó >1 hora desde último check, verifica upstream
3. ✅ Si hay cambios, invalida cache automáticamente
4. ✅ Registra todo en logs

## Best Practices

### Para Usuarios:
- **Desarrollo activo**: Ejecuta `manage_cache_health({ action: 'check_updates' })` cada hora
- **Producción estable**: Deja que el sistema auto-verifique cada hora
- **Después de actualizar Flutter SDK**: Ejecuta `invalidate_all`

### Para Desarrolladores:
- Incrementa `CURRENT_CACHE_VERSION` en cada release
- Ajusta TTLs en `userConfig.getCacheTTL()` según necesidad
- Monitorea logs para ver cache hit rate

## Environment Variables

```bash
# GitHub token para evitar rate limits al verificar upstream
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# Opcional: Personalizar TTLs
COMPONENT_CACHE_TTL=3600  # 1 hora
ICON_CACHE_TTL=86400      # 24 horas
DOCS_CACHE_TTL=43200      # 12 horas
```

## Monitoring

### Cache Health Check
```javascript
const health = cacheVersionManager.getCacheHealth();
console.log(health);
// {
//   version: '1.0.0',
//   lastChecked: 2025-09-30T01:00:00.000Z,
//   timeSinceCheck: '45m 23s',
//   needsCheck: false,
//   stats: { hits: 42, misses: 8, hitRate: '84%' }
// }
```

### Logs to Watch
```
[INFO] Checking for upstream changes
[INFO] New commits detected in upstream repositories
[WARN] Upstream changes detected - clearing cache
[INFO] Cache version set
```

## Trade-offs

| Strategy | Freshness | Performance | GitHub API Calls |
|----------|-----------|-------------|------------------|
| No Cache | ✅ Always fresh | ❌ Slow (2s) | ❌ High (rate limit risk) |
| Cache Forever | ❌ Stale | ✅ Fast (0ms) | ✅ Low |
| **Our Strategy** | ✅ Fresh (<1h) | ✅ Fast (0ms cached) | ✅ Low (1 check/hour) |

## Future Enhancements

1. **Webhooks**: Subscribe to GitHub webhooks para invalidar cache en tiempo real cuando hay push
2. **Selective Invalidation**: Solo invalidar componentes modificados (parsear git diff)
3. **CDN Integration**: Usar CDN con cache-control headers
4. **Background Refresh**: Pre-fetch datos antes de que expire TTL

## Testing

```bash
# Test cache persistence
npm run test:persistent-improvements

# Test cache versioning
node test-cache-versioning.js
```