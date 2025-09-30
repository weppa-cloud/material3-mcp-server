# Testing Guide - Material 3 MCP Server

## Testing con MCP Inspector

El MCP Inspector es la herramienta oficial para probar servidores MCP de forma interactiva.

### Iniciar el Inspector

```bash
cd material3-mcp-server
npm run inspector
```

Esto abrirá automáticamente una interfaz web en `http://localhost:6274`

### Probar las 5 Herramientas

#### 1. list_material_components

**Prueba básica:**
```json
{
  "category": "buttons",
  "framework": "web"
}
```

**Resultado esperado:** Lista de componentes de botones para Web

**Prueba con todos los filtros:**
```json
{
  "category": "all",
  "complexity": "simple",
  "framework": "flutter"
}
```

#### 2. get_component_code

**Prueba básica:**
```json
{
  "componentName": "button",
  "framework": "web"
}
```

**Resultado esperado:** Código fuente del componente button con ejemplos

**Prueba con variante:**
```json
{
  "componentName": "button",
  "framework": "web",
  "variant": "filled",
  "includeExamples": true,
  "includeDependencies": true
}
```

#### 3. get_design_tokens

**Prueba básica:**
```json
{
  "tokenType": "color",
  "format": "json"
}
```

**Resultado esperado:** Tokens de color en formato JSON

**Prueba CSS:**
```json
{
  "tokenType": "all",
  "format": "css",
  "includeDocumentation": true
}
```

**Resultado esperado:** Tokens en formato CSS (:root { --md-sys-color-primary: ... })

#### 4. search_material_icons

**Prueba básica:**
```json
{
  "query": "home",
  "limit": 10
}
```

**Resultado esperado:** Lista de iconos relacionados con "home"

**Prueba con filtros:**
```json
{
  "query": "search",
  "style": "outlined",
  "filled": false,
  "limit": 5
}
```

#### 5. get_accessibility_guidelines

**Prueba básica:**
```json
{
  "componentName": "button",
  "wcagLevel": "AA"
}
```

**Resultado esperado:** Guías WCAG 2.1 AA para botones

**Prueba nivel AAA:**
```json
{
  "componentName": "text-field",
  "wcagLevel": "AAA",
  "includeARIA": true,
  "includeKeyboard": true
}
```

## Verificación de Éxito

✅ **Criterio de éxito del MVP:**

"El agente puede usar las herramientas convenientemente para implementar características usando las guidelines de Material 3"

### Checklist de Verificación:

- [ ] Todas las 5 herramientas se muestran en MCP Inspector
- [ ] `list_material_components` retorna lista de componentes
- [ ] `get_component_code` retorna código con ejemplos
- [ ] `get_design_tokens` retorna tokens en el formato solicitado
- [ ] `search_material_icons` encuentra iconos por query
- [ ] `get_accessibility_guidelines` retorna guías WCAG
- [ ] Los errores se manejan correctamente (componente no encontrado, etc.)
- [ ] Los logs aparecen en stderr (no en stdout)

## Testing Manual en Claude Desktop

### 1. Configurar Claude Desktop

Edita el archivo de configuración:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "material3": {
      "command": "node",
      "args": ["/ruta/absoluta/a/material3-mcp-server/build/index.js"],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### 2. Reiniciar Claude Desktop

Cierra completamente Claude Desktop y vuelve a abrirlo.

### 3. Pruebas con Claude

Prueba estos prompts en Claude:

1. **"List all Material 3 button components for React"**
   - Debe llamar a `list_material_components`
   - Mostrar lista de botones

2. **"Show me the code for a filled button in Flutter"**
   - Debe llamar a `get_component_code`
   - Retornar código Flutter

3. **"Get Material 3 color tokens in CSS format"**
   - Debe llamar a `get_design_tokens`
   - Retornar CSS con variables

4. **"Find home icons"**
   - Debe llamar a `search_material_icons`
   - Mostrar iconos de home

5. **"What are the accessibility guidelines for buttons?"**
   - Debe llamar a `get_accessibility_guidelines`
   - Listar guías WCAG

## Troubleshooting

### El servidor no aparece en Claude Desktop

1. Verificar que el path en el config sea absoluto
2. Verificar que el build esté actualizado (`npm run build`)
3. Revisar logs de Claude Desktop (Help → View Logs)

### Errores de TypeScript

```bash
npm run build
```

Si hay errores, revisar que todas las dependencias estén instaladas.

### Inspector no inicia

```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

## Performance Testing

Para verificar que las herramientas responden rápidamente:

```bash
# En el Inspector, medir el tiempo de respuesta
# Objetivo: < 1 segundo para todas las herramientas
```

## Logs

Los logs del servidor aparecen en stderr:

```
[INFO] [2025-09-29T...] Starting Material 3 MCP Server
[INFO] [2025-09-29T...] Registered 5 MCP tools
[INFO] [2025-09-29T...] Material 3 MCP Server connected and ready
[INFO] [2025-09-29T...] list_material_components called { category: 'buttons', framework: 'web' }
```

Para ver logs más detallados:

```bash
LOG_LEVEL=DEBUG node build/index.js
```