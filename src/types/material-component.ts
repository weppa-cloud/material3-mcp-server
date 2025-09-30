export interface MaterialComponent {
  name: string;
  displayName: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  frameworks: string[];
  variants: string[];
  description: string;
  documentationUrl: string;
}

export interface ComponentMetadata {
  properties?: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: string;
    description?: string;
  }>;
  methods?: Array<{
    name: string;
    returnType: string;
    parameters: Array<{
      name: string;
      type: string;
      required: boolean;
    }>;
    description?: string;
  }>;
  events?: string[];
  className?: string;
  description?: string;
}

export interface ComponentCode {
  component: string;
  framework: string;
  variant?: string;
  sourceCode: string;
  examples: CodeExample[];
  dependencies: string[];
  imports: string[];
  cssVariables?: string[];
  documentation: string;
  metadata?: ComponentMetadata;
  availableVariants?: string[];
}

export interface CodeExample {
  title: string;
  code: string;
  description: string;
}

export interface DesignToken {
  value: string;
  type: string;
  description?: string;
  wcag?: {
    aa: boolean;
    aaa: boolean;
  };
}

export interface MaterialIcon {
  name: string;
  codepoint: string;
  categories: string[];
  tags: string[];
  svgPath: string;
  usage: {
    web: string;
    flutter: string;
    react: string;
  };
}

export interface AccessibilityGuideline {
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  requirement: string;
  implementation: string;
  status: 'pass' | 'fail' | 'warning';
}

export type Framework = 'web' | 'flutter' | 'react' | 'angular';
export type Category = 'buttons' | 'cards' | 'chips' | 'dialogs' | 'lists' | 'menus' | 'navigation' | 'progress' | 'selection' | 'sliders' | 'text-fields' | 'all';
export type Complexity = 'simple' | 'medium' | 'complex' | 'all';