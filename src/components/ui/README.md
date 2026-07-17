# CarcBlog Component Library & UI Architecture

This folder contains the core design system components built on top of Tailwind CSS v4 and Astro.

## 1. Folder Structure
```text
src/
├── styles/
│   └── tailwind.css     # Core Design Tokens & Easing Curves (@theme directive)
└── components/
    └── ui/
        ├── Button.astro # Base Buttons & spring scale click states
        ├── Card.astro   # Card Elevations & Surface layers
        ├── Input.astro  # Accessible Inputs & text states
        ├── Textarea.astro
        ├── Checkbox.astro
        ├── Radio.astro
        ├── Switch.astro # Toggle Slider transitions
        ├── Badge.astro  # Status indications
        ├── Alert.astro  # Context alerts
        ├── Tooltip.astro
        ├── Tabs.astro   # Script-backed dynamic tabs
        ├── Accordion.astro
        └── Avatar.astro # Fallback text initials & gradients
```

## 2. Token & CSS Variable Strategy
Theme tokens are configured directly inside `src/styles/tailwind.css` using the Tailwind v4 `@theme` directive, which automatically populates all layout, font, color, border, and ease utilities.
Dark mode is activated via `data-theme="dark"` attribute on `<html>`, remapping the semantic base tokens inside the `@layer base` CSS block.

## 3. Motion & Transition System
- **Interface Shifts (Hover states, color transitions)**: Use 150ms-200ms duration, standard `--ease-in-out` curve.
- **Physical Interactions (Button scales, card elevations)**: Use custom spring physics curves:
  - Spring: `cubic-bezier(0.4, 1.3, 0.65, 1)` (`.ease-spring`)
  - Bounce: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (`.ease-bounce`)
- **Accessibility**: Durations are automatically forced to `0.001ms` when `prefers-reduced-motion` is active.

## 4. Reusable Component Guidelines
- **Props**: Every component accepts type-safe properties defined as TypeScript interfaces, fallback defaults, and `...rest` props propagation.
- **Slots**: Components use standard `<slot />` and named slots (`<slot name="left-icon" />`) to encourage composability.
- **Client Hydration**: Interactive elements (like tabs/accordions) are implemented as self-contained Astro components with client script blocks that target scoped query selectors inside an isolated element scope.
