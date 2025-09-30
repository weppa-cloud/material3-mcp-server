# Análisis de Implementaciones de Scraping en Proyectos MCP

## 📊 Comparación de Enfoques

### 1. Shadcn UI Oficial
**URL**: https://ui.shadcn.com/docs/mcp

**Estrategia**: ❌ NO usa scraping - Usa **Registry System (JSON API)**

**Cómo funciona**:
```json
{
  "registries": {
    "@shadcn": "https://ui.shadcn.com/r/{name}.json"
  }
}
```

- Cada componente tiene un archivo JSON estructurado
- Formato estandarizado con schema definido
- API endpoints públicos para cada componente
- AI assistants acceden vía URLs directas (ej: `/r/button.json`)

**Ventajas**:
- ✅ Rápido y confiable
- ✅ Datos estructurados
- ✅ No se rompe con cambios de UI
- ✅ Oficial y mantenido

**Desventajas**:
- ❌ Requiere que shadcn mantenga la registry
- ❌ No aplica a proyectos sin registry

---

### 2. ymadd/shadcn-ui-mcp-server (Community)
**URL**: https://github.com/ymadd/shadcn-ui-mcp-server

**Estrategia**: ✅ Usa **Web Scraping (Cheerio + Axios)**

**Dependencias**:
```json
{
  "cheerio": "^1.0.0-rc.12",
  "axios": "^1.7.9",
  "@modelcontextprotocol/sdk": "0.6.0"
}
```

**Arquitectura**:
```typescript
// Cache system
const componentCache = new Map();
const componentsListCache = new Map();

// Scraping functions
async function extractDescription(html) {
  const $ = cheerio.load(html);
  // DOM traversal con selectores CSS
}

async function fetchComponentDetails(name) {
  // 1. Check cache first
  if (componentCache.has(name)) return componentCache.get(name);

  // 2. Fetch from documentation site
  const response = await axios.get(`https://ui.shadcn.com/docs/components/${name}`);

  // 3. Parse with Cheerio
  const $ = cheerio.load(response.data);

  // 4. Extract data
  const description = extractDescription($);
  const installation = extractInstallation($);
  const examples = extractExamples($);

  // 5. Cache result
  componentCache.set(name, data);

  return data;
}
```

**Herramientas MCP**:
1. `list_shadcn_components` - Lista todos los componentes
2. `get_component_details` - Detalles completos (scraping completo)
3. `get_component_examples` - Solo ejemplos de código
4. `search_components` - Búsqueda por nombre/descripción

**Ventajas**:
- ✅ No depende de API oficial
- ✅ Puede extraer cualquier información del sitio
- ✅ Cache para optimizar performance
- ✅ Funciona con cualquier documentación web

**Desventajas**:
- ❌ Se puede romper con cambios HTML
- ❌ Más lento que API (primera request)
- ❌ Requiere mantenimiento si cambia el DOM

---

### 3. Material3 MCP Server (Nuestro Proyecto)
**URL**: https://github.com/weppa-cloud/material3-mcp-server

**Estrategia Actual**: ✅ **GitHub API + Mock Data**

**Arquitectura**:
```typescript
// Primary: GitHub API
async function getComponentCode(name) {
  const response = await githubClient.get(
    `/repos/material-components/material-web/contents/${name}`
  );
  return parseSourceCode(response.data);
}

// Fallback: Mock data
function getMockComponents() {
  return [
    { name: 'button', category: 'buttons', frameworks: ['web'] },
    { name: 'chips', category: 'chips', frameworks: ['web'] }
  ];
}
```

**Por qué NO usamos scraping actualmente**:
1. GitHub API proporciona código fuente real
2. Material Web Components está en GitHub (no solo en docs)
3. Mock data suficiente para metadata básica
4. Scraping de m3.material.io sería redundante

**Infraestructura de Scraping Lista**:
- ✅ Cheerio instalado
- ✅ Axios configurado
- ✅ Cache system implementado
- ✅ Método stub `getComponentsFromWeb()`
- ❌ Selectores CSS NO implementados

---

## 🎯 Cuándo Usar Cada Estrategia

### Registry/API (Shadcn Oficial)
**Usar cuando**:
- El proyecto tiene API/registry oficial
- Necesitas máxima confiabilidad
- Quieres soporte oficial

**Proyectos que lo tienen**:
- shadcn/ui
- Ant Design (tiene API)
- Material-UI (React - tiene API)

### Scraping (ymadd)
**Usar cuando**:
- NO hay API oficial
- Necesitas información de la documentación web
- El contenido está en HTML/MDX
- Quieres datos que GitHub API no tiene

**Casos de uso**:
- Descripciones de componentes
- Guidelines de uso
- Screenshots/ejemplos visuales
- Accessibility guidelines del sitio web

### GitHub API (Nuestro enfoque)
**Usar cuando**:
- Los componentes están en GitHub
- Necesitas código fuente real
- Quieres información de estructura de archivos
- El proyecto es open source

**Material 3 específicamente**:
- ✅ Código en GitHub: `material-components/material-web`
- ✅ TypeScript source disponible
- ❌ Descripciones NO están en código
- ❌ Guidelines están en m3.material.io (web)

---

## 🔧 Implementación Recomendada para Material3 MCP

### Enfoque Híbrido: GitHub API + Scraping

```typescript
class MaterialProvider {
  // Primary: GitHub API (código fuente)
  async getComponentCode(name: string) {
    return githubClient.get(`/repos/material-components/material-web/contents/${name}`);
  }

  // Secondary: Web Scraping (metadata y guidelines)
  async getComponentMetadata(name: string) {
    const url = `https://m3.material.io/components/${name}/overview`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    return {
      description: $('meta[name="description"]').attr('content'),
      usage_guidelines: $('.guidelines-section').text(),
      anatomy: extractAnatomy($),
      accessibility: extractAccessibility($)
    };
  }

  // Combine both sources
  async getCompleteComponent(name: string) {
    const [code, metadata] = await Promise.all([
      this.getComponentCode(name),
      this.getComponentMetadata(name)
    ]);

    return { ...code, ...metadata };
  }
}
```

### Ventajas del Enfoque Híbrido:
1. ✅ Código fuente real de GitHub
2. ✅ Descripciones rich de documentación web
3. ✅ Guidelines y best practices
4. ✅ Accessibility info completa
5. ✅ Redundancia (si uno falla, hay fallback)

---

## 📝 Selectores CSS para m3.material.io

### Estructura de la Documentación Material 3

```typescript
// Example selectors (need to verify on actual site)
const selectors = {
  title: 'h1.component-title',
  description: '.component-description p',
  usage_guidelines: '.usage-section',
  anatomy_items: '.anatomy-list li',
  accessibility: '.a11y-section',
  code_examples: 'pre code',
  variants: '.variants-list .variant-card'
};
```

### Scraping Completo

```typescript
async function scrapeMaterial3Component(name: string) {
  const url = `https://m3.material.io/components/${name}/overview`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  return {
    name,
    title: $('h1').first().text().trim(),
    description: $('.component-description').text().trim(),

    usage: {
      guidelines: $('.usage-section').text().trim(),
      whenToUse: $('.when-to-use').text().trim(),
      whenNotToUse: $('.when-not-to-use').text().trim()
    },

    anatomy: $('.anatomy-list li').map((i, el) => ({
      part: $(el).find('.part-name').text(),
      description: $(el).find('.part-description').text()
    })).get(),

    accessibility: {
      guidelines: $('.a11y-section p').text(),
      ariaRoles: $('.aria-roles li').map((i, el) => $(el).text()).get(),
      keyboardSupport: $('.keyboard-support li').map((i, el) => $(el).text()).get()
    },

    examples: $('pre code').map((i, el) => $(el).text()).get()
  };
}
```

---

## 🚀 Próximos Pasos

### Fase 1: Analizar m3.material.io
1. Inspeccionar estructura HTML del sitio
2. Identificar selectores CSS estables
3. Verificar que el scraping es permitido (robots.txt)

### Fase 2: Implementar Scraping Básico
1. Completar `getComponentsFromWeb()`
2. Extraer descripción y guidelines básicas
3. Agregar cache (12h como shadcn)

### Fase 3: Enriquecer con Metadata
1. Anatomy diagrams
2. Accessibility guidelines detalladas
3. Usage examples del sitio web

### Fase 4: Combinar Fuentes
1. GitHub API para código
2. Web scraping para metadata
3. Herramienta única que combine ambos

---

## ⚠️ Consideraciones Legales y Éticas

### Robots.txt
Verificar: https://m3.material.io/robots.txt

### Rate Limiting
- Implementar delays entre requests
- Usar cache agresivo (12-24h)
- Respetar headers HTTP

### Alternativas al Scraping
1. **Contactar a Google Material Team** - Preguntar si hay API
2. **Usar GitHub Discussions** - Documentación puede estar en repo
3. **Material Design System JSON** - Buscar design tokens JSON

---

## 📚 Referencias

- [ymadd/shadcn-ui-mcp-server](https://github.com/ymadd/shadcn-ui-mcp-server)
- [Shadcn UI Official MCP](https://ui.shadcn.com/docs/mcp)
- [Material 3 Guidelines](https://m3.material.io/)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Axios Documentation](https://axios-http.com/)