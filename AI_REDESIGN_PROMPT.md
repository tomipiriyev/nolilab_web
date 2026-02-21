# Nolilab Loko GPS Tracker Website - AI Redesign Specification

## Project Overview

**Project Name:** Nolilab Loko GPS Tracker Website Redesign
**Target Audience:** Tech-savvy consumers, outdoor enthusiasts, equipment/pet/drone owners seeking GPS tracking solutions
**Core Value Proposition:** World's smallest offline GPS tracker using LoRa P2P technology with 20km range, 12-month battery life, no subscription fees, and open-source firmware

**Current Status:** Light theme only (dark theme removed). Two image sliders without borders. Fully responsive design. All typography standardized. Smooth scroll enabled. Interactive animations on buttons and cards.

---

## Design System

### Color Palette (Light Theme Only)
- **Primary Background:** #ffffff (white)
- **Secondary Background:** #f6f8fa (light gray)
- **Primary Text:** #24292e (dark gray/charcoal)
- **Secondary Text:** #57606a (medium gray)
- **Accent Color:** #238636 (green)
- **Accent Hover:** #2ea043 (darker green)
- **Border Color:** #d0d7de (light gray border)

### Typography System
- **Font Family:** Inter (primary), with system font fallbacks (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Monospace Font:** SF Mono, Monaco, Inconsolata, Fira Mono, Droid Sans Mono, Source Code Pro
- **Heading Sizes:**
  - `h1`: All major section headings - **2.5rem, weight 500**
  - `h3` in use-cases: **2rem, weight 500**
  - Feature card titles: **1.1rem, weight 500**
  - Spec card titles: **1.1rem, weight 500**
- **Subtitle/Descriptive Text:** **1.125rem, line-height 1.7, weight 400**
- **Body Text:** **1rem, line-height 1.6, weight 400**
- **Small Text:** **0.875rem** (navigation, labels)
- **Compressed Text:** **0.9rem** (feature descriptions)

### Spacing System
- `--spacing-xs`: 0.5rem
- `--spacing-sm`: 1rem
- `--spacing-md`: 1.5rem
- `--spacing-lg`: 2rem
- `--spacing-xl`: 3rem

### Border Radius
- `--radius-sm`: 0.25rem
- `--radius-md`: 0.5rem
- `--radius-lg`: 0.75rem

### Shadow System
- `--shadow-sm`: 0 1px 2px rgba(0,0,0,0.05) - subtle shadow
- `--shadow-md`: 0 4px 6px rgba(0,0,0,0.08) - standard shadow
- `--shadow-lg`: 0 10px 15px rgba(0,0,0,0.12) - prominent shadow

---

## Page Structure & Sections

### 1. Header Navigation
- **Logo:** "nolilab" in monospace font, 1.25rem, weight 500
- **Navigation Links:** Flex layout with 2rem gap, 0.875rem font size
  - Links: Home, Features, Use Cases, Specifications, FAQ, Blog
  - Active state: Green accent color (#238636)
  - Hover state: Smooth color transition
- **Social Icons:** Flex with 0.5rem gap (GitHub, Twitter, etc.)
- **Sticky Position:** Header remains visible on scroll
- **Border:** 1px bottom border in border color (#d0d7de)

### 2. Hero Section
- **Background:** Linear gradient 135deg with radial overlays
- **Grid Pattern Overlay:** 50px grid, 2% opacity green accent
- **Content Layout:** 
  - Large headline: "World's Smallest Offline GPS Tracker with LoRa P2P"
  - Subtitle: Descriptive text about Loko
  - 2 CTA Buttons: "Get Started" and "Learn More"
  - Button Styling: Green accent background, white text, hover scale(1.05) + lift -2px + enhanced shadow
- **Image Slider:** 
  - Dimensions: 100% width, 660px height
  - Images: 6 slides of product/feature photos
  - Fade transitions: 0.8s opacity animation
  - Auto-advance: 5 seconds per slide
  - Manual Controls: Previous/Next buttons, dot indicators
  - **Border:** NONE (removed)
  - Dots: 12px circles, gray (#8b949e) default, green (#238636) active with scale(1.2)

### 3. Features Section (Compact 4-Column Layout)
- **Background:** Linear gradient 180deg with radial overlays at 20% and 80%
- **Grid:** 4 columns (responsive: 2 cols on tablet, 1 col on mobile)
- **Card Styling:**
  - Gradient background: 135deg linear gradient
  - Radial glow overlay: 5% opacity green at 100% 100%
  - Small padding: Reduced spacing for compact layout
  - Rounded borders: var(--radius-lg)
  - Hover effect: Border color change to accent
- **Card Content:**
  - Icon: 48px (reduced from 64px for compact look)
  - Title: 1.1rem, weight 500
  - Description: 0.9rem, line-height 1.5
  - Features: GPS, Battery Life, Range, Durability, Waterproof, Open Source

### 4. Real-World Applications (Use Cases)
- **Background:** Linear gradient 180deg with corner radial overlays
- **Layout:** 2-column grid with image-text alternating
  - Left: Image (500px)
  - Right: Content (1.5fr width)
- **Typography:**
  - Heading: 2rem, weight 500
  - Paragraph: 1rem
- **Use Cases:**
  1. Pet Tracking - "Never lose your beloved pet"
  2. Equipment Monitoring - "Track valuable gear"
  3. Drone Safety - "Recover lost drones"
  4. Adventure Tracking - "Document outdoor journeys"

### 5. Loko GPS Tracker App Features Section
- **Background:** Linear gradient 180deg with top-center radial overlay (3% opacity)
- **Layout:** 2-column wrapper (image left, features right)
- **Image Slider:**
  - Dimensions: 100% width, 600px height
  - 5 App Feature Screenshots
  - Fade transitions: 0.5s opacity
  - Navigation: Previous/Next buttons, dot indicators
  - **Border:** NONE (removed)
- **Features List:** 5 compact feature cards with icons and descriptions
  - Hover: Scale on hover (feature-to-slide mapping optional)
  - Icons: 2rem size with green accent color
  - Text: Condensed but readable

### 6. Specifications/Technical Details
- **Background:** Linear gradient 180deg with centered radial overlay (2% opacity)
- **Layout:** Horizontal card grid with specs
- **Card Design:**
  - Icon + Label + Value
  - Hover effects: Border accent color change
  - Small rounded corners
  - Padding: var(--spacing-md)
- **Specs:**
  - GPS Range: 20km (LoRa P2P)
  - Battery Life: 12 months
  - Size: World's smallest
  - Connectivity: Offline (LoRa)
  - Open Source: Yes

### 7. Pricing Section
- **Layout:** 3-column card grid
- **Plans:** Starter, Professional, Enterprise
- **Card Styling:**
  - Solid background with border
  - Icon at top
  - Features list with checkmarks
  - CTA Button: Green accent background
  - Most popular plan: Highlighted with accent border, shadow elevation
- **Buttons:** Hover scale(1.05) + lift transform

### 8. FAQ Section (Accordion)
- **Background:** Linear gradient bidirectional with bottom radial overlay (2% opacity)
- **Layout:** Single column, full width
- **Accordion Item Design:**
  - Header: Clickable, color change on hover
  - Icon: Chevron that rotates 180deg on expand
  - Content: Max-height animation for smooth expand/collapse (0.3s ease)
  - Border: Top border only on each item
- **FAQ Items:**
  - How does offline tracking work?
  - What's the difference between Loko and traditional GPS?
  - How long does battery last?
  - Can I use it without internet?
  - What's LoRa P2P technology?

### 9. Technical Glossary (Separate glossary.html page)
- **Design Consistency:** Identical CSS system to main page
- **Navigation:** Identical header/footer to main page
- **Content:** GPS and LoRa technical definitions
- **Glossary Items:** 3+ cards with detailed explanations
- **Styling:** Same gradient overlays, card styling, typography

### 10. Footer
- **Layout:** Flex container with sections (logo, links, copyright)
- **Content:**
  - Logo: "nolilab" monospace
  - Links: Home, Blog, Software, Firmware, Setup Guides, Glossary
  - Footer Links: Privacy, Terms
  - Copyright: "© 2025 nolilab. All rights reserved."
- **Border:** Top border (1px, border color)
- **Background:** Slightly elevated (secondary background)
- **Text Color:** Secondary text color (#57606a)

---

## Interactive Elements & Animations

### Button Interactions
- **Hover State:**
  - Transform: `scale(1.05) translateY(-2px)` to `translateY(-3px)`
  - Shadow: Elevation from shadow-md to shadow-lg
  - Transition: 0.2s ease
- **Active State:** Color change to accent-hover
- **All Buttons:** "Get Started", "Learn More", "Plan CTA", FAQ expand

### Slider Behavior (Hero & App)
- **Auto-Advance:** 5 seconds per slide
- **Transitions:** 0.8s fade (hero), 0.5s fade (app)
- **Dots:** Click to jump to slide
- **Buttons:** Previous/Next navigation
- **No Border:** Both sliders are borderless

### Smooth Scroll
- **Property:** `scroll-behavior: smooth` on html element
- **Applies To:** All anchor link navigation

### Card Hover Effects
- **Feature Cards:** Border color change to accent
- **Spec Cards:** Same border color change
- **App Features:** Optional scale effect

---

## Responsive Design

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Mobile Adjustments (< 768px)
- **Features Grid:** 1 column
- **Use Cases:** Stack vertically, image above text
- **Pricing:** 1 column
- **Header Navigation:** Hamburger menu (if applicable)
- **Font Sizes:** Scaled down proportionally
- **Spacing:** Reduced margins and padding
- **Hero Image Slider:** Full width, reduced height (auto)
- **App Slider:** Full width, reduced height (auto)

### Tablet Adjustments (768px - 1024px)
- **Features Grid:** 2-3 columns
- **Use Cases:** Still 2-column grid
- **Pricing:** 2 columns with one full-width
- **Sliders:** Full width with adjusted height

---

## CSS Variables & Custom Properties

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f6f8fa;
  --text-primary: #24292e;
  --text-secondary: #57606a;
  --accent: #238636;
  --accent-hover: #2ea043;
  --border: #d0d7de;
  --font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace;
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.08);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.12);
}
```

---

## Gradient Overlays & Visual Effects

### Section Backgrounds
- **Hero:** 135deg linear gradient with 50px grid pattern overlay (2% green accent)
- **Features:** 180deg linear gradient with dual radial gradients (20%, 80%)
- **Use Cases:** 180deg linear gradient with corner radials (30%, 70%) at 2-2.5% opacity
- **Specifications:** 180deg linear gradient with centered radial (2% opacity)
- **FAQ:** Bidirectional gradient with bottom radial overlay (2% opacity)
- **Mobile App:** 180deg gradient with top-center radial overlay (3% opacity)

### Card Overlays
- **Feature Cards:** Gradient background with radial glow at 100% 100% (5% accent opacity)
- **Spec Cards:** Similar gradient treatment
- **Radial Gradients:** Positioned at specific coordinates for depth effect

---

## Typography Standardization

### Consistency Across All Sections
- **All h2 (Section Headings):** 2.5rem, weight 500
- **All Subtitles:** 1.125rem, weight 400, line-height 1.7
- **All Body Text:** 1rem, weight 400, line-height 1.6
- **Feature Titles:** 1.1rem, weight 500
- **Feature Descriptions:** 0.9rem, line-height 1.5
- **Use Case Headings:** 2rem, weight 500
- **Navigation:** 0.875rem, weight 500
- **Small Text/Labels:** 0.875rem, weight 400

---

## Functional Requirements

### Navigation
- Active state indication (green accent color)
- Hover effects on all links
- Scroll-to-section functionality with smooth scroll
- Internal links only (no external references)

### Forms
- Input fields with border styling
- Focus states with outline (green accent)
- Placeholder text in secondary text color
- Button styling consistent with design system

### Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Proper heading hierarchy
- Color contrast ratios meet WCAG AA standards
- Tab navigation support
- Keyboard accessible buttons

### Performance
- Optimized images (use image lazy loading if possible)
- CSS custom properties for efficient theming
- Minimal JavaScript dependencies
- Font preconnection to Google Fonts
- CDN-hosted icons (Font Awesome)

---

## External Dependencies

### Fonts
- Google Fonts: Inter (weights 300, 400, 500, 600)
- Local/System Fonts: Fallback chain for monospace

### Icons
- Font Awesome 6.5.1 (CDN)
- Used for social media, navigation, and feature indicators

### JavaScript Libraries
- No major frameworks required (vanilla JavaScript)
- LocalStorage for any preferences
- Event listeners for interactivity

---

## Content Structure

### Main Pages
1. **nolilab-redesigned.html** - Main product page (2885 lines)
2. **glossary.html** - Technical glossary page (sync design)
3. **blog.html** - Blog section (referenced in nav)
4. **software.html** - Software documentation (referenced)
5. **firmware.html** - Firmware downloads (referenced)
6. **setup-guides.html** - Setup instructions (referenced)

### SEO & Meta Data
- **Title:** "Loko GPS Tracker - World's Smallest Offline GPS Tracker with LoRa P2P | Nolilab"
- **Description:** "Loko GPS Tracker - World's smallest offline GPS tracker using LoRa P2P technology. Track pets, equipment & drones without internet. 20km range, 12-month battery life. No subscription fees."
- **Meta Theme Color:** Updated to light theme equivalent (#ffffff or #f6f8fa)

---

## Recent Changes (Latest Updates)

1. **Dark Theme Removed:** Only light theme remains. All dark mode CSS variables, toggle switch, and JavaScript removed.
2. **Theme Toggle Removed:** No more dark/light mode switch in footer. Website is permanently light theme.
3. **Slider Borders Removed:** 
   - Hero slider: Removed `border: 2px solid #444c56`
   - App slider: Removed `border: 1px solid var(--border)`
   - Both sliders are now clean with no visible borders

---

## Design Principles

1. **Simplicity:** Clean, uncluttered layouts
2. **Consistency:** Unified color palette, typography, spacing
3. **Accessibility:** High contrast ratios, keyboard navigation
4. **Performance:** Optimized assets, minimal JavaScript
5. **Responsiveness:** Mobile-first design approach
6. **Interactivity:** Smooth transitions and meaningful animations
7. **Professional:** Green accent (#238636) conveys trust and growth
8. **Minimalism:** Subtle gradients and overlays add depth without distraction

---

## Future Enhancement Opportunities

1. Add newsletter signup section with email validation
2. Implement image lazy loading
3. Add customer testimonials/reviews section
4. Create product comparison table
5. Add video demonstrations
6. Implement blog post template
7. Create product configurator/calculator
8. Add live chat widget
9. Implement advanced analytics tracking
10. Create PWA (Progressive Web App) capabilities

---

## File Locations

- **CSS:** Embedded in HTML `<style>` tag
- **Images:** `/images/` and `/images/optimized/` directories
- **JavaScript:** Embedded in HTML `<script>` tags
- **Fonts:** Google Fonts CDN
- **Icons:** Font Awesome CDN

---

## Notes for Implementation

- Maintain all existing functionality (sliders, accordion, smooth scroll)
- Keep HTML semantic and accessibility-compliant
- Use CSS custom properties for consistency
- Avoid breakpoints below 768px unless specifically required
- Test responsive design across all breakpoints
- Validate color contrast for WCAG compliance
- Ensure all links are functional and internal
- No external Odoo or CRM references
- Keep file size optimization in mind for performance

---

**Last Updated:** February 8, 2026
**Theme:** Light Mode Only
**Status:** Production Ready with Borderless Sliders
