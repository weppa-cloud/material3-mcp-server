import { logger } from '../utils/logger.js';

export interface DartProperty {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  nullable: boolean;
}

export interface DartMethod {
  name: string;
  returnType: string;
  parameters: DartProperty[];
  description?: string;
}

export interface DartClass {
  name: string;
  extends?: string;
  implementsInterfaces?: string[];
  mixins?: string[];
  properties: DartProperty[];
  methods: DartMethod[];
  constructors: DartMethod[];
  description?: string;
}

export interface DartMetadata {
  classes: DartClass[];
  enums: string[];
  typedefs: string[];
  imports: string[];
}

export class DartMetadataParser {
  /**
   * Parse Dart source code and extract metadata
   */
  parse(sourceCode: string): DartMetadata {
    logger.debug('Parsing Dart source code for metadata');

    return {
      classes: this.extractClasses(sourceCode),
      enums: this.extractEnums(sourceCode),
      typedefs: this.extractTypedefs(sourceCode),
      imports: this.extractImports(sourceCode)
    };
  }

  /**
   * Extract class definitions
   */
  private extractClasses(sourceCode: string): DartClass[] {
    const classes: DartClass[] = [];

    // Match class declarations
    // Pattern: class ClassName extends/with/implements ... {
    const classRegex = /(?:\/\/\/.*?\n)*\s*class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+with\s+([\w,\s]+))?(?:\s+implements\s+([\w,\s]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gs;

    let match;
    while ((match = classRegex.exec(sourceCode)) !== null) {
      const [, className, extendsClass, mixins, implementsList, classBody] = match;

      // Extract doc comment if present
      const docComment = this.extractDocComment(sourceCode, match.index);

      const dartClass: DartClass = {
        name: className,
        extends: extendsClass,
        implementsInterfaces: implementsList?.split(',').map(i => i.trim()).filter(Boolean),
        mixins: mixins?.split(',').map(m => m.trim()).filter(Boolean),
        properties: this.extractProperties(classBody),
        methods: this.extractMethods(classBody),
        constructors: this.extractConstructors(className, classBody),
        description: docComment
      };

      classes.push(dartClass);
    }

    return classes;
  }

  /**
   * Extract properties from class body
   */
  private extractProperties(classBody: string): DartProperty[] {
    const properties: DartProperty[] = [];

    // Match property declarations
    // Pattern: final/const? Type? name = value;
    const propRegex = /(?:\/\/\/.*?\n)*\s*(final|const|static)?\s*([A-Z]\w+(?:<[^>]+>)?|\w+)\???\s+(\w+)(?:\s*=\s*([^;]+))?;/g;

    let match;
    while ((match = propRegex.exec(classBody)) !== null) {
      const [, modifier, type, name, defaultValue] = match;

      // Skip if it looks like a method
      if (classBody.includes(`${name}(`)) continue;

      // Extract doc comment
      const docComment = this.extractDocComment(classBody, match.index);

      properties.push({
        name,
        type: type || 'dynamic',
        required: !defaultValue && !type?.includes('?'),
        defaultValue,
        description: docComment,
        nullable: type?.includes('?') || false
      });
    }

    return properties;
  }

  /**
   * Extract methods from class body
   */
  private extractMethods(classBody: string): DartMethod[] {
    const methods: DartMethod[] = [];

    // Match method declarations
    // Pattern: ReturnType methodName(params) { ... }
    const methodRegex = /(?:\/\/\/.*?\n)*\s*(?:@override\s+)?([A-Z]\w+(?:<[^>]+>)?|void|Future<[^>]+>|\w+)\s+(\w+)\s*\(([^)]*)\)\s*(?:async\s*)?{/g;

    let match;
    while ((match = methodRegex.exec(classBody)) !== null) {
      const [, returnType, name, paramsStr] = match;

      // Skip constructors and private methods
      if (name.startsWith('_') || name[0] === name[0].toUpperCase()) continue;

      const docComment = this.extractDocComment(classBody, match.index);

      methods.push({
        name,
        returnType: returnType || 'void',
        parameters: this.parseParameters(paramsStr),
        description: docComment
      });
    }

    return methods;
  }

  /**
   * Extract constructors from class body
   */
  private extractConstructors(className: string, classBody: string): DartMethod[] {
    const constructors: DartMethod[] = [];

    // Match constructor declarations
    // Pattern: ClassName(...) or ClassName.named(...)
    const constructorRegex = new RegExp(
      `(?:\\/\\/\\/.*?\\n)*\\s*(?:const\\s+)?${className}(?:\\.(\\w+))?\\s*\\(([^)]*)\\)`,
      'g'
    );

    let match;
    while ((match = constructorRegex.exec(classBody)) !== null) {
      const [, namedConstructor, paramsStr] = match;

      const docComment = this.extractDocComment(classBody, match.index);

      constructors.push({
        name: namedConstructor || 'default',
        returnType: className,
        parameters: this.parseParameters(paramsStr),
        description: docComment
      });
    }

    return constructors;
  }

  /**
   * Parse parameter list
   */
  private parseParameters(paramsStr: string): DartProperty[] {
    if (!paramsStr.trim()) return [];

    const params: DartProperty[] = [];

    // Split by comma, but respect nested generics and braces
    const paramsList = this.splitParameters(paramsStr);

    for (const param of paramsList) {
      const trimmed = param.trim();
      if (!trimmed) continue;

      // Match: required? Type? name = defaultValue?
      const paramMatch = trimmed.match(/(?:(required)\s+)?(?:([A-Z]\w+(?:<[^>]+>)?|\w+)\??\s+)?(\w+)(?:\s*=\s*(.+))?/);

      if (paramMatch) {
        const [, required, type, name, defaultValue] = paramMatch;

        params.push({
          name,
          type: type || 'dynamic',
          required: !!required,
          defaultValue,
          nullable: type?.includes('?') || false
        });
      }
    }

    return params;
  }

  /**
   * Split parameters respecting nested structures
   */
  private splitParameters(str: string): string[] {
    const params: string[] = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (char === '<' || char === '{' || char === '[') {
        depth++;
      } else if (char === '>' || char === '}' || char === ']') {
        depth--;
      } else if (char === ',' && depth === 0) {
        params.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    if (current) {
      params.push(current);
    }

    return params;
  }

  /**
   * Extract enum definitions
   */
  private extractEnums(sourceCode: string): string[] {
    const enums: string[] = [];
    const enumRegex = /enum\s+(\w+)\s*\{/g;

    let match;
    while ((match = enumRegex.exec(sourceCode)) !== null) {
      enums.push(match[1]);
    }

    return enums;
  }

  /**
   * Extract typedef definitions
   */
  private extractTypedefs(sourceCode: string): string[] {
    const typedefs: string[] = [];
    const typedefRegex = /typedef\s+(\w+)/g;

    let match;
    while ((match = typedefRegex.exec(sourceCode)) !== null) {
      typedefs.push(match[1]);
    }

    return typedefs;
  }

  /**
   * Extract import statements
   */
  private extractImports(sourceCode: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+['"]([^'"]+)['"]/g;

    let match;
    while ((match = importRegex.exec(sourceCode)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Extract doc comment before a position
   */
  private extractDocComment(sourceCode: string, position: number): string | undefined {
    // Look backwards for /// comments
    const beforeCode = sourceCode.substring(Math.max(0, position - 500), position);
    const docCommentRegex = /(\/\/\/.*(?:\n\/\/\/.*)*)$/;
    const match = beforeCode.match(docCommentRegex);

    if (match) {
      // Clean up /// and trim
      return match[1]
        .split('\n')
        .map(line => line.replace(/^\s*\/\/\/\s?/, ''))
        .join('\n')
        .trim();
    }

    return undefined;
  }

  /**
   * Extract primary widget class from Flutter component
   */
  extractPrimaryWidget(sourceCode: string): DartClass | null {
    const metadata = this.parse(sourceCode);

    // Look for the main widget class (usually extends StatelessWidget or StatefulWidget)
    const widgetClass = metadata.classes.find(cls =>
      cls.extends === 'StatelessWidget' ||
      cls.extends === 'StatefulWidget' ||
      cls.extends === 'State'
    );

    return widgetClass || metadata.classes[0] || null;
  }
}

export const dartMetadataParser = new DartMetadataParser();