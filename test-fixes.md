# Pruebas de Corrección de Bugs

## Bug 1: Framework Parameter Ignorado

### ✅ Test 1: Solicitar componente con framework Flutter (debe rechazar)
**Tool**: `get_component_code`
**Parámetros**:
```json
{
  "componentName": "button",
  "framework": "flutter"
}
```
**Resultado esperado**: Error explicando que solo 'web' está soportado

### ✅ Test 2: Solicitar componente con framework React (debe rechazar)
**Tool**: `get_component_code`
**Parámetros**:
```json
{
  "componentName": "chips",
  "framework": "react"
}
```
**Resultado esperado**: Error explicando que solo 'web' está soportado

### ✅ Test 3: Solicitar componente con framework Web (debe funcionar)
**Tool**: `get_component_code`
**Parámetros**:
```json
{
  "componentName": "button",
  "framework": "web"
}
```
**Resultado esperado**: Código del componente button

---

## Bug 2: Componentes No Encontrados

### ✅ Test 4: Listar todos los componentes disponibles
**Tool**: `list_material_components`
**Parámetros**:
```json
{
  "category": "all",
  "framework": "web"
}
```
**Resultado esperado**:
- Debe incluir: button, chips (plural), textfield (sin guión), checkbox, fab, dialog, list, etc.
- NO debe incluir: card, chip (singular), text-field (con guión)

### ✅ Test 5: Obtener código de 'chips' (plural)
**Tool**: `get_component_code`
**Parámetros**:
```json
{
  "componentName": "chips",
  "framework": "web"
}
```
**Resultado esperado**: Código del componente chips

### ✅ Test 6: Obtener código de 'textfield' (sin guión)
**Tool**: `get_component_code`
**Parámetros**:
```json
{
  "componentName": "textfield",
  "framework": "web"
}
```
**Resultado esperado**: Código del componente textfield

### ❌ Test 7: Intentar obtener 'card' (no existe en GitHub)
**Tool**: `get_component_code`
**Parámetros**:
```json
{
  "componentName": "card",
  "framework": "web"
}
```
**Resultado esperado**: Error "Component not found: card"

### ❌ Test 8: Intentar obtener 'chip' singular (debe fallar)
**Tool**: `get_component_code`
**Parámetros**:
```json
{
  "componentName": "chip",
  "framework": "web"
}
```
**Resultado esperado**: Error "Component not found: chip"

---

## Instrucciones de Prueba

1. Abre http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=9128112000dc759150eb898287b7455525b6db9dc7a96bf86a6a2d3f3bb153d5
2. Ejecuta cada test usando los parámetros especificados
3. Verifica que los resultados coincidan con lo esperado

## Componentes Reales en GitHub

Según material-components/material-web:
- ✅ button
- ✅ checkbox
- ✅ chips (plural)
- ✅ dialog
- ✅ divider
- ✅ fab
- ✅ iconbutton
- ✅ list
- ✅ menu
- ✅ progress
- ✅ radio
- ✅ select
- ✅ slider
- ✅ switch
- ✅ tabs
- ✅ textfield (una palabra)

**NO existen**: card, chip (singular), text-field (con guión)