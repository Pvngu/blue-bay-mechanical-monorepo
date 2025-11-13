# Blue Bay Mechanical - AI Coding Instructions

## Project Overview
This is an Astro v5 static site for Blue Bay Mechanical, an HVAC service company. The project uses TypeScript, Tailwind CSS v4, and follows a component-based architecture with custom design system components.

## Architecture & Structure

### Component Organization
- **Common components** (`src/components/common/`): Reusable UI primitives with variant-based styling
- **Section components** (`src/components/sections/`): Page-specific content blocks that compose common components
- **Layout components** (`src/layouts/`): Page structure templates with header/footer

### Path Aliases (tsconfig.json)
```typescript
"@components/*": ["src/components/*"]
"@assets/*": ["src/assets/*"]
```
Always use these aliases when importing components and assets.

## Key Patterns

### Component Props System
All common components follow a consistent prop interface pattern:
```typescript
interface Props {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  class?: string;
}
```

### Styling Architecture
- **Tailwind v4** with custom theme in `src/styles/global.css`
- **Custom color palette**: `--color-primary: #024D82`, `--color-secondary: #457CA3`
- **Typography**: Rubik font family defined as `--font-primary`
- **Responsive containers**: Global classes for `header, section` with consistent padding

### Component Composition Pattern
Pages are built by composing sections in layouts:
```astro
<Layout>
    <Hero />
    <Stats />
</Layout>
```

## Development Commands
- `npm run dev` - Local development server (localhost:4321)
- `npm run build` - Production build to `./dist/`
- `npm run preview` - Preview production build locally

## Critical Implementation Details

### Dynamic HTML Tags
The `Heading` component uses dynamic tag rendering:
```astro
const Tag = `h${level}` as any;
<Tag class={headingClasses} {...rest}>
```

### Image Handling
Use Astro's built-in Image component for all images:
```astro
import { Image } from 'astro:assets';
import logo from '../../assets/images/bluebay-logo.svg';
<Image src={logo} alt="Logo" />
```

### Variant-Based Styling
Components use object-based class mapping for variants:
```typescript
const variantClasses = {
  primary: 'bg-primary hover:bg-primary-dark text-white',
  secondary: 'bg-secondary hover:bg-secondary-dark text-white'
};
```

When adding new components, follow the established patterns: TypeScript interfaces for props, variant-based styling with object maps, and consistent use of path aliases for imports.

## Spacing Rules

### Standard Spacing Scale
Use the established Tailwind spacing scale for consistent spacing throughout the project:
- **xs**: `p-2` (8px) - Minimal padding for compact elements
- **sm**: `p-4` (16px) - Standard component internal padding
- **md**: `p-6` (24px) - Default section padding
- **lg**: `p-8` (32px) - Large spacing for emphasis
- **xl**: `p-12` (48px) - Extra large spacing for major sections

### Component Spacing Guidelines
- **Buttons**: Use `px-6 py-3` for standard buttons, `px-4 py-2` for small variants
- **Cards**: Standard padding `p-6`, tight padding `p-4` for compact layouts
- **Form inputs**: Consistent `px-4 py-3` for input fields
- **Icon spacing**: `gap-2` for icon-text combinations, `gap-4` for icon grids

### Layout Spacing Patterns
- **Section margins**: `mb-16` between major page sections
- **Component gaps**: `gap-8` for component grids, `gap-4` for inline elements
- **Content flow**: `space-y-4` for text content, `space-y-6` for mixed content blocks
- **Container padding**: Use responsive padding `px-4 md:px-6 lg:px-8` for main containers

### Responsive Spacing
Apply responsive spacing modifiers consistently: