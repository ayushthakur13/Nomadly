---
name: Nomadly Design System
description: Vibrant, modern, and inspiring visual design system for Nomadly.
colors:
  primary: "#10b981"
  primary-deep: "#047857"
  neutral-bg: "#ffffff"
  neutral-ink: "#111827"
  border: "#e5e7eb"
rounded:
  sm: "6px"
  md: "8px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-secondary:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
---

# Design System: Nomadly

## 1. Overview

**Creative North Star: "The Modern Explorer"**

Nomadly's design system delivers a visual space that inspires wanderlust while remaining highly practical, reliable, and functional. It utilizes rich card imagery, bold typographic headings, and high-contrast status overlays to make planning and scheduling feel clean and delightful.

This design system explicitly rejects the bland gray admin patterns of traditional SaaS dashboards. It uses vibrant emerald primary actions, clean rounded card components, and smooth micro-animations.

**Key Characteristics:**
- Emerald-centric brand strategy.
- High-contrast visual overlay badges on travel images.
- Full responsive padding and layout transitions.

## 2. Colors

The Nomadly color palette uses rich emerald and teal shades to invoke outdoor planning, paired with crisp grays for high scannability.

### Primary
- **Emerald Main** (#10b981): Main brand signature color, used for primary action buttons, status indicator accents, and workspace selections.

### Secondary
- **Teal Accent** (#0d9488): Secondary action accents, bookmarks, and active tabs.

### Neutral
- **Ink Dark** (#111827): Primary headers and body typography.
- **Cool Gray** (#4b5563): Secondary descriptions and supporting labels.
- **Soft Border** (#e5e7eb): Divider lines and boundaries.
- **Clean White** (#ffffff): Main card and container backgrounds.

### Named Rules
**The One Color Strategy Rule.** Keep color accents purposeful. Primary emerald actions should occupy ≤15% of any individual layout view, ensuring user focus is immediately guided to key CTAs.

## 3. Typography

**Display Font:** Inter (with system-ui, sans-serif)
**Body Font:** Inter (with system-ui, sans-serif)

**Character:** Standard geometric humanist sans-serif pairing ensuring ultimate scannability of schedules, budgets, and member lists across screen sizes.

### Hierarchy
- **Display** (bold, 3rem, 1.1): Used for large hero text and greetings.
- **Headline** (semibold, 1.875rem, 1.25): Section headings.
- **Title** (semibold, 1.125rem, 1.5): Card and stop names.
- **Body** (normal, 0.875rem, 1.5): Standard descriptions and text blocks. Line lengths are constrained to ≤75ch for optimal reading.
- **Label** (medium, 0.75rem, tracking-wider, uppercase): Eyebrows, stats, and overlays.

## 4. Elevation

Nomadly uses layered surfaces to indicate hierarchy. Primary workspace views use thin borders for clean structure, while floating elements (modals, dropdowns) use diffuse ambient drop shadows.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1)`): Standard card surfaces.
- **Card Hover** (`box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)`): Active hovered states.
- **Modal Overlay** (`box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)`): Floating overlay modules.

### Named Rules
**The Shadow-First Rule.** Rely on border grids for content segmentation instead of deep shadows. Save shadows exclusively for floating elements or interactive elements in their hovered state.

## 5. Components

### Buttons
- **Shape:** Softly curved corners (16px / rounded-2xl).
- **Primary:** Emerald background (#10b981), white text (#ffffff), padding 16px 32px.
- **Hover / Focus:** Scale-up micro-transition (scale-105) on hover with background shifting to emerald-700 (#047857).

### Cards
- **Corner Style:** Rounded (16px / rounded-2xl).
- **Background:** White (#ffffff) with a thin gray border (#e5e7eb) and light shadow.
- **Hover:** TranslateY(-2px) elevation shift on cursor enter.

### Input Fields
- **Style:** Light gray border (#e5e7eb) with 8px radius (rounded-lg).
- **Focus:** Emerald outline border glow (#10b981) to match active indicators.

## 6. Do's and Don'ts

### Do:
- **Do** use shared `formatDateRange` for displaying trip schedules in card views.
- **Do** overlay status tags using high-contrast borders and semi-transparent backdrops (`bg-white/80` or `bg-blue-50/90` with thin matching borders).
- **Do** keep action overlays (bookmark/like) circular (`rounded-full`) and centered.

### Don't:
- **Don't** use thick colored borders (side-stripe borders > 1px) to indicate cards or items' priority.
- **Don't** use text gradients or glassmorphic backgrounds for core content blocks.
- **Don't** render empty workspace sections without primary CTA buttons guiding the user's action.
