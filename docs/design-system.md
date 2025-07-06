# RoR Trader Design System & UI Guidelines

## Design Philosophy

Based on the provided design preferences, RoR Trader should embrace a modern, dark-themed interface with sophisticated visual hierarchy and premium user experience.

## Color Palette

### Primary Colors

```scss
// Dark Theme Foundation
$background-primary: #0A0A0B;      // Deep black background
$background-secondary: #141416;     // Elevated surfaces
$background-tertiary: #1C1C1F;     // Cards and containers
$background-elevated: #242428;     // Hover states and elevated elements

// Accent Colors
$accent-primary: #00D4FF;          // Bright cyan for primary actions
$accent-secondary: #00FF88;        // Vibrant green for success states
$accent-warning: #FFB800;          // Amber for warnings
$accent-danger: #FF3366;           // Red for errors/dangers
$accent-purple: #9945FF;           // Purple for special features

// Text Colors
$text-primary: #FFFFFF;            // Primary text
$text-secondary: #B8B8BD;          // Secondary text
$text-tertiary: #6B6B73;           // Muted text
$text-disabled: #3A3A40;           // Disabled state

// Border Colors
$border-default: #2A2A30;          // Default borders
$border-hover: #3A3A40;            // Hover state borders
$border-focus: #00D4FF;            // Focus state borders
```

### Gradients

```scss
// Premium Gradients
$gradient-primary: linear-gradient(135deg, #00D4FF 0%, #00FF88 100%);
$gradient-dark: linear-gradient(180deg, #1C1C1F 0%, #0A0A0B 100%);
$gradient-card: linear-gradient(145deg, #1C1C1F 0%, #141416 100%);
$gradient-glow: radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
```

## Typography

### Font Stack

```scss
// Primary Font
$font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

// Monospace for data
$font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

// Display Font for headings
$font-display: 'Outfit', $font-primary;
```

### Type Scale

```scss
// Headings
$h1: (
  size: 3.5rem,    // 56px
  weight: 700,
  line-height: 1.1,
  letter-spacing: -0.02em
);

$h2: (
  size: 2.5rem,    // 40px
  weight: 600,
  line-height: 1.2,
  letter-spacing: -0.01em
);

$h3: (
  size: 2rem,      // 32px
  weight: 600,
  line-height: 1.3
);

$h4: (
  size: 1.5rem,    // 24px
  weight: 500,
  line-height: 1.4
);

// Body Text
$body-large: 1.125rem;  // 18px
$body-default: 1rem;    // 16px
$body-small: 0.875rem;  // 14px
$caption: 0.75rem;      // 12px
```

## Component Design Patterns

### Cards & Containers

```scss
.card {
  background: $background-secondary;
  border: 1px solid $border-default;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: $border-hover;
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
  }
  
  &.card-elevated {
    background: $background-elevated;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  }
}
```

### Buttons

```scss
// Primary Button
.btn-primary {
  background: $gradient-primary;
  color: $background-primary;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  &:hover::before {
    transform: translateX(0);
  }
}

// Secondary Button
.btn-secondary {
  background: transparent;
  border: 1px solid $border-default;
  color: $text-primary;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: $accent-primary;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
}

// Ghost Button
.btn-ghost {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $text-primary;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}
```

### Form Elements

```scss
// Input Fields
.input {
  background: $background-primary;
  border: 1px solid $border-default;
  border-radius: 12px;
  padding: 14px 16px;
  color: $text-primary;
  font-size: $body-default;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: $accent-primary;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    outline: none;
  }
  
  &::placeholder {
    color: $text-tertiary;
  }
}

// Select Dropdown
.select {
  @extend .input;
  cursor: pointer;
  
  &::after {
    content: '▼';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: $text-secondary;
  }
}
```

### Navigation

```scss
// Sidebar Navigation
.sidebar {
  background: $background-secondary;
  border-right: 1px solid $border-default;
  width: 280px;
  height: 100vh;
  padding: 24px 16px;
  
  .nav-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 12px;
    color: $text-secondary;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: $text-primary;
    }
    
    &.active {
      background: rgba(0, 212, 255, 0.1);
      color: $accent-primary;
      border: 1px solid rgba(0, 212, 255, 0.2);
    }
  }
}

// Top Navigation Bar
.navbar {
  background: rgba($background-secondary, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid $border-default;
  padding: 16px 32px;
  position: sticky;
  top: 0;
  z-index: 100;
}
```

## Layout System

### Grid System

```scss
// Container widths
$container-max-widths: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  2xl: 1536px
);

// Spacing scale
$spacing: (
  0: 0,
  1: 0.25rem,   // 4px
  2: 0.5rem,    // 8px
  3: 0.75rem,   // 12px
  4: 1rem,      // 16px
  5: 1.25rem,   // 20px
  6: 1.5rem,    // 24px
  8: 2rem,      // 32px
  10: 2.5rem,   // 40px
  12: 3rem,     // 48px
  16: 4rem,     // 64px
  20: 5rem,     // 80px
);
```

## Animation & Transitions

### Timing Functions

```scss
$ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
$ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
$spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Common Animations

```scss
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 212, 255, 0.8);
  }
}
```

## Special Effects

### Glassmorphism

```scss
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

### Neon Glow

```scss
.neon-glow {
  text-shadow: 
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 40px currentColor;
}
```

### Gradient Borders

```scss
.gradient-border {
  position: relative;
  background: $background-secondary;
  border-radius: 16px;
  
  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: $gradient-primary;
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
}
```

## Data Visualization

### Chart Colors

```scss
$chart-colors: (
  primary: #00D4FF,
  secondary: #00FF88,
  tertiary: #9945FF,
  quaternary: #FFB800,
  quinary: #FF3366,
);

// For gradients in charts
$chart-gradient-pairs: (
  profit: (#00FF88, #00D4FF),
  loss: (#FF3366, #FFB800),
  neutral: (#9945FF, #00D4FF),
);
```

### Table Design

```scss
.data-table {
  background: $background-secondary;
  border-radius: 16px;
  overflow: hidden;
  
  thead {
    background: $background-elevated;
    border-bottom: 1px solid $border-default;
    
    th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: $text-secondary;
      font-size: $body-small;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
  
  tbody {
    tr {
      border-bottom: 1px solid $border-default;
      transition: background 0.2s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.02);
      }
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    td {
      padding: 16px;
      color: $text-primary;
    }
  }
}
```

## Mobile Responsiveness

### Breakpoints

```scss
$breakpoints: (
  xs: 0,
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  2xl: 1536px
);

// Mobile-first approach
@mixin responsive($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}
```

### Touch-Friendly Elements

```scss
// Minimum touch target size: 44x44px
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Increased padding for mobile
.mobile-padding {
  padding: 16px;
  
  @include responsive(md) {
    padding: 24px;
  }
  
  @include responsive(lg) {
    padding: 32px;
  }
}
```

## Implementation with Tailwind CSS

### Custom Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0A0B',
          secondary: '#141416',
          tertiary: '#1C1C1F',
          elevated: '#242428',
        },
        accent: {
          primary: '#00D4FF',
          secondary: '#00FF88',
          warning: '#FFB800',
          danger: '#FF3366',
          purple: '#9945FF',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B8B8BD',
          tertiary: '#6B6B73',
          disabled: '#3A3A40',
        },
        border: {
          DEFAULT: '#2A2A30',
          hover: '#3A3A40',
          focus: '#00D4FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-glow': 'glow 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
};
```

## Accessibility Guidelines

### Color Contrast

- Ensure all text meets WCAG AA standards
- Primary text on dark backgrounds: minimum 7:1 ratio
- Secondary text on dark backgrounds: minimum 4.5:1 ratio
- Use focus indicators with sufficient contrast

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Visible focus states with clear indicators
- Logical tab order throughout the application
- Skip links for main content areas

### Screen Reader Support

- Proper ARIA labels for all interactive elements
- Meaningful alt text for images
- Proper heading hierarchy
- Live regions for dynamic content updates

This design system provides a modern, sophisticated dark theme that aligns with professional trading platform requirements of RoR Trader.

---

_RoR Trader Design System Version: 1.0_  
_Last Updated: January 2025_  
_Project Location: /Users/brandonarmstrong/Documents/Github/RoRTrader_