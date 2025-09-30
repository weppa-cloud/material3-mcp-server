import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { userConfig } from '../config/user-config.js';

export const suggestComponentsForUseCaseSchema = z.object({
  useCase: z.string()
    .min(10, 'Please provide a detailed use case description')
    .describe('Description of what you want to build (e.g., "user profile card with avatar, name, and edit button")'),
  framework: z.enum(['web', 'flutter', 'react', 'angular']).optional()
    .describe('Target framework (defaults to user preference)')
});

interface ComponentSuggestion {
  component: string;
  variant?: string;
  rationale: string;
  props?: string[];
  priority: 'primary' | 'secondary' | 'optional';
}

interface CompositionExample {
  description: string;
  structure: string;
  code?: string;
}

// Knowledge base of Material 3 components and their common use cases
const COMPONENT_KNOWLEDGE = {
  // Actions
  button: {
    keywords: ['click', 'action', 'submit', 'confirm', 'cta', 'primary action', 'button'],
    variants: ['filled', 'outlined', 'text', 'elevated', 'tonal'],
    useCases: ['primary actions', 'form submission', 'calls to action', 'navigation triggers'],
    props: ['label', 'icon', 'disabled', 'loading']
  },
  fab: {
    keywords: ['floating', 'primary action', 'create', 'add', 'new', 'compose', 'fab'],
    variants: ['regular', 'small', 'large', 'extended'],
    useCases: ['primary screen action', 'create new item', 'compose message'],
    props: ['icon', 'label', 'size']
  },
  'icon-button': {
    keywords: ['icon only', 'toolbar', 'action icon', 'small action', 'toggle'],
    variants: ['standard', 'filled', 'outlined', 'tonal'],
    useCases: ['toolbar actions', 'card actions', 'compact controls'],
    props: ['icon', 'toggle', 'disabled']
  },

  // Communication
  badge: {
    keywords: ['notification', 'count', 'indicator', 'badge', 'unread', 'new'],
    useCases: ['notification counts', 'status indicators', 'unread markers'],
    props: ['count', 'variant', 'max']
  },
  snackbar: {
    keywords: ['toast', 'notification', 'feedback', 'message', 'alert', 'temporary'],
    useCases: ['action feedback', 'brief messages', 'undo actions'],
    props: ['message', 'action', 'duration']
  },
  'progress-indicator': {
    keywords: ['loading', 'progress', 'spinner', 'wait', 'processing'],
    variants: ['circular', 'linear'],
    useCases: ['loading states', 'progress tracking', 'async operations'],
    props: ['value', 'indeterminate']
  },

  // Containment
  card: {
    keywords: ['container', 'content', 'item', 'card', 'product', 'article', 'media'],
    variants: ['elevated', 'filled', 'outlined'],
    useCases: ['content containers', 'list items', 'product cards', 'media previews'],
    props: ['elevation', 'clickable', 'media', 'actions']
  },
  list: {
    keywords: ['list', 'items', 'menu', 'options', 'choices', 'collection'],
    variants: ['single-line', 'two-line', 'three-line'],
    useCases: ['item lists', 'settings menus', 'selectable options'],
    props: ['items', 'dividers', 'leading', 'trailing']
  },
  divider: {
    keywords: ['separator', 'divider', 'line', 'break', 'section'],
    useCases: ['content separation', 'visual breaks', 'section dividers'],
    props: ['orientation', 'inset']
  },

  // Navigation
  'navigation-bar': {
    keywords: ['bottom nav', 'tab bar', 'navigation', 'main navigation', 'bottom'],
    useCases: ['primary navigation', 'bottom navigation', 'main sections'],
    props: ['destinations', 'selected', 'icons']
  },
  'navigation-drawer': {
    keywords: ['drawer', 'sidebar', 'menu', 'side nav', 'hamburger'],
    variants: ['standard', 'modal', 'dismissible'],
    useCases: ['app navigation', 'side menu', 'settings access'],
    props: ['items', 'header', 'modal']
  },
  tabs: {
    keywords: ['tabs', 'sections', 'categories', 'horizontal nav', 'tab'],
    variants: ['primary', 'secondary'],
    useCases: ['content switching', 'categorization', 'filtered views'],
    props: ['tabs', 'selected', 'scrollable']
  },
  'top-app-bar': {
    keywords: ['header', 'app bar', 'toolbar', 'title', 'navigation bar', 'top'],
    variants: ['small', 'medium', 'large', 'center-aligned'],
    useCases: ['page title', 'navigation controls', 'contextual actions'],
    props: ['title', 'navigation', 'actions', 'scrollBehavior']
  },

  // Selection
  checkbox: {
    keywords: ['checkbox', 'select', 'multi-select', 'check', 'toggle', 'multiple choice'],
    useCases: ['multiple selection', 'settings toggles', 'bulk actions'],
    props: ['checked', 'indeterminate', 'disabled']
  },
  chip: {
    keywords: ['chip', 'tag', 'filter', 'category', 'label', 'token'],
    variants: ['assist', 'filter', 'input', 'suggestion'],
    useCases: ['filters', 'tags', 'compact choices', 'removable items'],
    props: ['label', 'icon', 'selected', 'removable']
  },
  radio: {
    keywords: ['radio', 'option', 'choice', 'single select', 'exclusive'],
    useCases: ['single selection', 'mutually exclusive options'],
    props: ['value', 'checked', 'group']
  },
  slider: {
    keywords: ['slider', 'range', 'value', 'adjustment', 'volume', 'brightness'],
    variants: ['continuous', 'discrete'],
    useCases: ['value selection', 'range input', 'settings adjustment'],
    props: ['value', 'min', 'max', 'step']
  },
  switch: {
    keywords: ['switch', 'toggle', 'on/off', 'enable', 'disable'],
    useCases: ['binary settings', 'feature toggles', 'on/off states'],
    props: ['checked', 'disabled']
  },

  // Text Input
  'text-field': {
    keywords: ['input', 'text', 'form', 'field', 'enter', 'type', 'search', 'email', 'password'],
    variants: ['filled', 'outlined'],
    useCases: ['text input', 'forms', 'search', 'user data entry'],
    props: ['label', 'placeholder', 'type', 'error', 'helper', 'required']
  },

  // Dialogs
  dialog: {
    keywords: ['dialog', 'modal', 'popup', 'alert', 'confirm', 'prompt'],
    variants: ['basic', 'full-screen'],
    useCases: ['confirmations', 'forms', 'alerts', 'important messages'],
    props: ['title', 'content', 'actions', 'dismissible']
  },
  'date-picker': {
    keywords: ['date', 'calendar', 'picker', 'schedule', 'birthday'],
    useCases: ['date selection', 'scheduling', 'date input'],
    props: ['value', 'min', 'max', 'format']
  },
  'time-picker': {
    keywords: ['time', 'clock', 'hour', 'minute', 'schedule'],
    useCases: ['time selection', 'scheduling', 'time input'],
    props: ['value', 'format', 'min', 'max']
  }
};

export async function suggestComponentsForUseCase(
  args: z.infer<typeof suggestComponentsForUseCaseSchema>
) {
  try {
    logger.info('Suggesting components for use case', { useCase: args.useCase });

    const { useCase, framework = userConfig.getDefaultFramework() } = args;
    const useCaseLower = useCase.toLowerCase();

    // Analyze the use case and match with components
    const suggestions: ComponentSuggestion[] = [];
    const scores: Record<string, number> = {};

    // Score each component based on keyword matches
    Object.entries(COMPONENT_KNOWLEDGE).forEach(([component, info]) => {
      let score = 0;

      // Check keyword matches
      info.keywords.forEach(keyword => {
        if (useCaseLower.includes(keyword)) {
          score += 10;
        }
      });

      // Check use case matches
      info.useCases.forEach(uc => {
        if (useCaseLower.includes(uc.toLowerCase())) {
          score += 5;
        }
      });

      if (score > 0) {
        scores[component] = score;
      }
    });

    // Sort by score and create suggestions
    const sortedComponents = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6); // Top 6 matches

    sortedComponents.forEach(([component, score], index) => {
      const info = COMPONENT_KNOWLEDGE[component as keyof typeof COMPONENT_KNOWLEDGE];
      const priority = index === 0 ? 'primary' : index < 3 ? 'secondary' : 'optional';

      // Suggest best variant based on use case
      let variant: string | undefined;
      if ('variants' in info && info.variants) {
        if (useCaseLower.includes('primary') || useCaseLower.includes('main')) {
          variant = info.variants[0]; // First variant (usually primary)
        } else if (useCaseLower.includes('subtle') || useCaseLower.includes('secondary')) {
          variant = info.variants[1] || info.variants[0];
        }
      }

      suggestions.push({
        component,
        variant,
        rationale: generateRationale(component, useCaseLower, info),
        props: info.props,
        priority
      });
    });

    // Generate composition examples
    const compositions = generateCompositionExamples(suggestions, useCase, framework);

    const result = {
      useCase,
      framework,
      suggestedComponents: suggestions,
      compositionExamples: compositions,
      totalMatches: suggestions.length,
      guidance: generateGuidance(suggestions, useCase)
    };

    logger.info('Component suggestions generated', {
      matchCount: suggestions.length,
      framework
    });

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };

  } catch (error: any) {
    logger.error('Failed to suggest components', error);
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: 'Failed to generate component suggestions',
          message: error.message
        }, null, 2)
      }],
      isError: true
    };
  }
}

function generateRationale(
  component: string,
  useCase: string,
  info: any
): string {
  const reasons: string[] = [];

  // Match specific keywords
  const matchedKeywords = info.keywords.filter((k: string) => useCase.includes(k));
  if (matchedKeywords.length > 0) {
    reasons.push(`Matches keywords: ${matchedKeywords.join(', ')}`);
  }

  // Add use case alignment
  const matchedUseCases = info.useCases.filter((uc: string) =>
    useCase.includes(uc.toLowerCase())
  );
  if (matchedUseCases.length > 0) {
    reasons.push(`Ideal for: ${matchedUseCases[0]}`);
  }

  return reasons.join('. ') || `Commonly used for similar use cases`;
}

function generateCompositionExamples(
  suggestions: ComponentSuggestion[],
  useCase: string,
  framework: string
): CompositionExample[] {
  const examples: CompositionExample[] = [];

  if (suggestions.length === 0) return examples;

  const primary = suggestions.filter(s => s.priority === 'primary');
  const secondary = suggestions.filter(s => s.priority === 'secondary');

  // Example 1: Basic composition
  if (primary.length > 0) {
    const structure = suggestions.slice(0, 3).map(s =>
      `  ├─ ${s.component}${s.variant ? ` (${s.variant})` : ''}`
    ).join('\n');

    examples.push({
      description: 'Basic composition',
      structure: `Root\n${structure}`,
      code: generateCodeExample(suggestions.slice(0, 3), framework)
    });
  }

  // Example 2: Full-featured composition (if enough components)
  if (suggestions.length >= 4) {
    const structure = suggestions.map(s =>
      `  ├─ ${s.component}${s.variant ? ` (${s.variant})` : ''}`
    ).join('\n');

    examples.push({
      description: 'Full-featured composition',
      structure: `Root\n${structure}`,
      code: generateCodeExample(suggestions, framework)
    });
  }

  return examples;
}

function generateCodeExample(
  suggestions: ComponentSuggestion[],
  framework: string
): string {
  switch (framework) {
    case 'web':
      return suggestions.map(s => {
        const tag = s.variant ? `md-${s.variant}-${s.component}` : `md-${s.component}`;
        return `<${tag}></${tag}>`;
      }).join('\n');

    case 'flutter':
      return suggestions.map(s => {
        const className = toPascalCase(s.variant ? `${s.variant}_${s.component}` : s.component);
        return `${className}()`;
      }).join('\n');

    case 'react':
      return suggestions.map(s => {
        const componentName = toPascalCase(s.variant ? `${s.variant}_${s.component}` : s.component);
        return `<${componentName} />`;
      }).join('\n');

    case 'angular':
      return suggestions.map(s => {
        const tag = s.variant ? `mat-${s.variant}-${s.component}` : `mat-${s.component}`;
        return `<${tag}></${tag}>`;
      }).join('\n');

    default:
      return '';
  }
}

function generateGuidance(suggestions: ComponentSuggestion[], useCase: string): string {
  if (suggestions.length === 0) {
    return 'No direct component matches found. Consider breaking down your use case or describing it differently.';
  }

  const primary = suggestions.filter(s => s.priority === 'primary');
  const guidance: string[] = [];

  if (primary.length > 0) {
    guidance.push(`Start with ${primary.map(s => s.component).join(' and ')} as your core components.`);
  }

  if (useCase.toLowerCase().includes('form')) {
    guidance.push('Consider adding validation and error handling for form components.');
  }

  if (useCase.toLowerCase().includes('list') || useCase.toLowerCase().includes('items')) {
    guidance.push('Consider virtualization for long lists to improve performance.');
  }

  if (suggestions.some(s => s.component === 'dialog' || s.component === 'snackbar')) {
    guidance.push('Remember to handle accessibility (focus management, ARIA labels) for overlays.');
  }

  return guidance.join(' ');
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}