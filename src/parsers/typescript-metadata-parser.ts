import { parse } from '@typescript-eslint/typescript-estree';
import { logger } from '../utils/logger.js';

export interface TypeScriptProperty {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  readonly?: boolean;
}

export interface TypeScriptMethod {
  name: string;
  returnType: string;
  parameters: TypeScriptProperty[];
  description?: string;
}

export interface TypeScriptClass {
  name: string;
  extends?: string;
  implementsInterfaces?: string[];
  properties: TypeScriptProperty[];
  methods: TypeScriptMethod[];
  decorators?: string[];
  description?: string;
  isExported: boolean;
}

export interface TypeScriptMetadata {
  classes: TypeScriptClass[];
  interfaces: TypeScriptClass[];
  functions: TypeScriptMethod[];
  exports: string[];
  imports: string[];
}

export class TypeScriptMetadataParser {
  /**
   * Parse TypeScript source code and extract metadata
   */
  parse(sourceCode: string): TypeScriptMetadata {
    logger.debug('Parsing TypeScript source code for metadata');

    try {
      const ast = parse(sourceCode, {
        comment: true,
        loc: true,
        range: true,
        jsx: false
      });

      return {
        classes: this.extractClasses(ast, sourceCode),
        interfaces: this.extractInterfaces(ast, sourceCode),
        functions: this.extractFunctions(ast, sourceCode),
        exports: this.extractExports(ast),
        imports: this.extractImports(ast)
      };
    } catch (error: any) {
      logger.error('Failed to parse TypeScript', error);
      // Fallback to regex-based parsing
      return this.fallbackParse(sourceCode);
    }
  }

  /**
   * Extract class definitions from AST
   */
  private extractClasses(ast: any, sourceCode: string): TypeScriptClass[] {
    const classes: TypeScriptClass[] = [];

    const visit = (node: any) => {
      if (node.type === 'ClassDeclaration') {
        const tsClass: TypeScriptClass = {
          name: node.id?.name || 'Anonymous',
          extends: node.superClass?.name,
          implementsInterfaces: node.implements?.map((impl: any) => impl.expression?.name).filter(Boolean),
          properties: this.extractClassProperties(node),
          methods: this.extractClassMethods(node),
          decorators: node.decorators?.map((d: any) => d.expression?.name).filter(Boolean),
          description: this.extractJSDoc(node, sourceCode),
          isExported: this.isExported(node)
        };

        classes.push(tsClass);
      }

      // Recurse
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(visit);
          } else {
            visit(node[key]);
          }
        }
      }
    };

    visit(ast);
    return classes;
  }

  /**
   * Extract interface definitions from AST
   */
  private extractInterfaces(ast: any, sourceCode: string): TypeScriptClass[] {
    const interfaces: TypeScriptClass[] = [];

    const visit = (node: any) => {
      if (node.type === 'TSInterfaceDeclaration') {
        const tsInterface: TypeScriptClass = {
          name: node.id?.name || 'Anonymous',
          extends: node.extends?.[0]?.expression?.name,
          implementsInterfaces: [],
          properties: this.extractInterfaceProperties(node),
          methods: [],
          description: this.extractJSDoc(node, sourceCode),
          isExported: this.isExported(node)
        };

        interfaces.push(tsInterface);
      }

      // Recurse
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(visit);
          } else {
            visit(node[key]);
          }
        }
      }
    };

    visit(ast);
    return interfaces;
  }

  /**
   * Extract class properties
   */
  private extractClassProperties(classNode: any): TypeScriptProperty[] {
    const properties: TypeScriptProperty[] = [];

    if (!classNode.body?.body) return properties;

    for (const member of classNode.body.body) {
      if (member.type === 'PropertyDefinition') {
        properties.push({
          name: member.key?.name || 'unknown',
          type: this.getTypeAnnotation(member.typeAnnotation),
          required: !member.optional,
          readonly: member.readonly,
          defaultValue: member.value ? this.getValueAsString(member.value) : undefined
        });
      }
    }

    return properties;
  }

  /**
   * Extract interface properties
   */
  private extractInterfaceProperties(interfaceNode: any): TypeScriptProperty[] {
    const properties: TypeScriptProperty[] = [];

    if (!interfaceNode.body?.body) return properties;

    for (const member of interfaceNode.body.body) {
      if (member.type === 'TSPropertySignature') {
        properties.push({
          name: member.key?.name || 'unknown',
          type: this.getTypeAnnotation(member.typeAnnotation),
          required: !member.optional,
          readonly: member.readonly
        });
      }
    }

    return properties;
  }

  /**
   * Extract class methods
   */
  private extractClassMethods(classNode: any): TypeScriptMethod[] {
    const methods: TypeScriptMethod[] = [];

    if (!classNode.body?.body) return methods;

    for (const member of classNode.body.body) {
      if (member.type === 'MethodDefinition') {
        methods.push({
          name: member.key?.name || 'unknown',
          returnType: this.getTypeAnnotation(member.value?.returnType),
          parameters: this.extractMethodParameters(member.value)
        });
      }
    }

    return methods;
  }

  /**
   * Extract method parameters
   */
  private extractMethodParameters(funcNode: any): TypeScriptProperty[] {
    if (!funcNode?.params) return [];

    return funcNode.params.map((param: any) => ({
      name: param.name || param.left?.name || 'unknown',
      type: this.getTypeAnnotation(param.typeAnnotation),
      required: !param.optional,
      defaultValue: param.right ? this.getValueAsString(param.right) : undefined
    }));
  }

  /**
   * Extract function declarations
   */
  private extractFunctions(ast: any, sourceCode: string): TypeScriptMethod[] {
    const functions: TypeScriptMethod[] = [];

    const visit = (node: any) => {
      if (node.type === 'FunctionDeclaration') {
        functions.push({
          name: node.id?.name || 'anonymous',
          returnType: this.getTypeAnnotation(node.returnType),
          parameters: this.extractMethodParameters(node),
          description: this.extractJSDoc(node, sourceCode)
        });
      }

      // Recurse
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(visit);
          } else {
            visit(node[key]);
          }
        }
      }
    };

    visit(ast);
    return functions;
  }

  /**
   * Extract exports
   */
  private extractExports(ast: any): string[] {
    const exports: string[] = [];

    const visit = (node: any) => {
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration?.id?.name) {
          exports.push(node.declaration.id.name);
        }
        if (node.specifiers) {
          node.specifiers.forEach((spec: any) => {
            if (spec.exported?.name) {
              exports.push(spec.exported.name);
            }
          });
        }
      }

      // Recurse
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(visit);
          } else {
            visit(node[key]);
          }
        }
      }
    };

    visit(ast);
    return exports;
  }

  /**
   * Extract imports
   */
  private extractImports(ast: any): string[] {
    const imports: string[] = [];

    const visit = (node: any) => {
      if (node.type === 'ImportDeclaration') {
        if (node.source?.value) {
          imports.push(node.source.value);
        }
      }

      // Recurse
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(visit);
          } else {
            visit(node[key]);
          }
        }
      }
    };

    visit(ast);
    return imports;
  }

  /**
   * Get type annotation as string
   */
  private getTypeAnnotation(typeAnnotation: any): string {
    if (!typeAnnotation) return 'any';

    const typeNode = typeAnnotation.typeAnnotation || typeAnnotation;

    if (!typeNode) return 'any';

    switch (typeNode.type) {
      case 'TSStringKeyword':
        return 'string';
      case 'TSNumberKeyword':
        return 'number';
      case 'TSBooleanKeyword':
        return 'boolean';
      case 'TSVoidKeyword':
        return 'void';
      case 'TSAnyKeyword':
        return 'any';
      case 'TSTypeReference':
        return typeNode.typeName?.name || 'unknown';
      case 'TSUnionType':
        return typeNode.types?.map((t: any) => this.getTypeAnnotation(t)).join(' | ') || 'any';
      case 'TSArrayType':
        return `${this.getTypeAnnotation(typeNode.elementType)}[]`;
      default:
        return 'any';
    }
  }

  /**
   * Get value as string
   */
  private getValueAsString(valueNode: any): string {
    if (!valueNode) return '';

    switch (valueNode.type) {
      case 'Literal':
        return String(valueNode.value);
      case 'Identifier':
        return valueNode.name;
      case 'TemplateLiteral':
        return '`...`';
      case 'ObjectExpression':
        return '{...}';
      case 'ArrayExpression':
        return '[...]';
      default:
        return '';
    }
  }

  /**
   * Extract JSDoc comment
   */
  private extractJSDoc(node: any, sourceCode: string): string | undefined {
    if (!node.range) return undefined;

    const [start] = node.range;
    const beforeCode = sourceCode.substring(Math.max(0, start - 500), start);

    const jsdocRegex = /\/\*\*([\s\S]*?)\*\//;
    const match = beforeCode.match(jsdocRegex);

    if (match) {
      return match[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join('\n')
        .trim();
    }

    return undefined;
  }

  /**
   * Check if node is exported
   */
  private isExported(node: any): boolean {
    return node.parent?.type === 'ExportNamedDeclaration' ||
      node.parent?.type === 'ExportDefaultDeclaration';
  }

  /**
   * Fallback regex-based parsing
   */
  private fallbackParse(sourceCode: string): TypeScriptMetadata {
    logger.warn('Using fallback regex parser for TypeScript');

    return {
      classes: [],
      interfaces: [],
      functions: [],
      exports: [],
      imports: this.extractImportsRegex(sourceCode)
    };
  }

  /**
   * Extract imports using regex (fallback)
   */
  private extractImportsRegex(sourceCode: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;

    let match;
    while ((match = importRegex.exec(sourceCode)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Extract primary exported class/component
   */
  extractPrimaryExport(sourceCode: string): TypeScriptClass | null {
    const metadata = this.parse(sourceCode);

    // Look for exported classes first
    const exportedClass = metadata.classes.find(cls => cls.isExported);
    if (exportedClass) return exportedClass;

    // Then interfaces
    const exportedInterface = metadata.interfaces.find(iface => iface.isExported);
    if (exportedInterface) return exportedInterface;

    // Fallback to first class
    return metadata.classes[0] || metadata.interfaces[0] || null;
  }
}

export const typeScriptMetadataParser = new TypeScriptMetadataParser();