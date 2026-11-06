---
name: Anatolian Hearth & Heritage
colors:
  surface: '#f3fcf3'
  surface-dim: '#d3dcd4'
  surface-bright: '#f3fcf3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf6ed'
  surface-container: '#e7f0e7'
  surface-container-high: '#e1ebe2'
  surface-container-highest: '#dce5dc'
  on-surface: '#151d18'
  on-surface-variant: '#40493e'
  inverse-surface: '#2a322d'
  inverse-on-surface: '#eaf3ea'
  outline: '#707a6d'
  outline-variant: '#bfcabb'
  surface-tint: '#0f6d2a'
  primary: '#006423'
  on-primary: '#ffffff'
  primary-container: '#277e39'
  on-primary-container: '#cdffcb'
  inverse-primary: '#83da89'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#405d44'
  on-tertiary: '#ffffff'
  tertiary-container: '#58765b'
  on-tertiary-container: '#dafcda'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ef7a3'
  primary-fixed-dim: '#83da89'
  on-primary-fixed: '#002107'
  on-primary-fixed-variant: '#00531c'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#caebcb'
  tertiary-fixed-dim: '#aecfb0'
  on-tertiary-fixed: '#04210d'
  on-tertiary-fixed-variant: '#314d35'
  background: '#f3fcf3'
  on-background: '#151d18'
  surface-variant: '#dce5dc'
typography:
  display-hero:
    fontFamily: Playfair Display
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4rem
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Playfair Display
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
  headline-md:
    fontFamily: Playfair Display
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.04em
  price-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '800'
    lineHeight: 1.5rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The brand personality bridges timeless culinary tradition with contemporary digital hospitality. It embodies warmth, generational mastery, and authentic Seljuk-inspired hospitality while maintaining the speed and clarity required for high-volume online food ordering. The UI evokes appetite, craftsmanship, and quiet prestige—countering cold, commoditized delivery apps with deep forest greens, sun-baked clay and copper-gold embers, and tactile cream paper textures.

The visual style is **Sensory Warmth & Soft Glassmorphism**:
- Deep, immersive dark forest green grounding for hero sections, headers, and night-mode dining cues.
- Tactile, culinary-forward off-white/cream surfaces for product browsing to keep food imagery fresh and natural.
- Translucent frosted overlays (`backdrop-blur-md`) with muted gold and emerald glowing edge reflections.
- Generous, rounded-2xl containers evoking hand-shaped dough, stone ovens, and artisanal platters.

## Colors
The palette balances the deep, historical identity of Konya with the sensory heat of traditional wood-fired ovens.

- **Primary (`#277E39`)**: Vibrant culinary green. Used for key conversion moments: "Sepete Ekle" (Add to Cart), confirmed state badges, and primary action buttons.
- **Secondary (`#D97706`)**: Warm amber gold / hearth flame. Used for price emphasis, rating stars, gourmet badges, and active checkout flows. Paired with `#B45309` for pressed states and deep borders.
- **Tertiary (`#1A3620`)**: Deep Konya green. Serves as dark canvas backgrounds, navigation banners, hero wrappers, and rich footer surfaces.
- **Neutral (`#6B746D`)**: Muted slate green. Reserved for secondary descriptions, preparation metadata, inactive icons, and structural line dividers.
- **Surface Light (`#F8F5ED`)**: Warm porcelain/cream base for daylight menus, cart drawers, and product dialogs, preventing digital eye fatigue and preserving appetite appeal.
- **Surface White (`#FFFFFF`)**: Pure elevated card surfaces, modal content containers, and crisp input backgrounds.

## Typography
The system employs an intentional pairing: **Playfair Display** provides an artisanal, heritage-rich editorial voice for culinary headers, category titles, and banner statements. **Plus Jakarta Sans** acts as the modern culinary engine, offering high legibility across nutrition tags, ingredient modifications, item counts, prices, and fast touch interactions.

Numeric values and currency units always utilize `Plus Jakarta Sans` with tabular figures (`tnum`) enabled to prevent layout shifting during price recalculations and portion updates.

## Layout & Spacing
A fluid 12-column responsive grid governs the application desktop layout, condensing to a 6-column grid on tablet and a single-column / 2-column card stack on mobile devices.

- **Breakpoints**: Mobile (`< 640px`), Tablet (`640px – 1024px`), Desktop (`> 1024px`), Wide (`> 1440px`).
- **Menu Catalog Grids**: 1 column on mobile, 2 columns on tablet, 3 to 4 columns on desktop to showcase landscape dishes like Etli Ekmek and Bıçakarası comfortably.
- **Side Drawer Constraints**: Mobile cart slides up as a bottom sheet (`max-h-[85vh]`). Desktop cart anchors as a 420px sliding sidebar with fixed bottom checkout controls.

## Elevation & Depth
Depth is realized through ambient culinary lighting and soft glass layering rather than stark dropped shadows.

- **Level 0 (Flat)**: Floor backgrounds (`#F8F5ED` for light layout, `#1A3620` for dark themes).
- **Level 1 (Card Rest)**: `box-shadow: 0 4px 20px -2px rgba(26, 54, 32, 0.06), 0 2px 6px -1px rgba(217, 119, 6, 0.04);` with a hairline border `rgba(107, 116, 109, 0.12)`.
- **Level 2 (Hover & Active Product)**: `box-shadow: 0 12px 32px -4px rgba(26, 54, 32, 0.12), 0 4px 12px -2px rgba(39, 126, 57, 0.10);` with `-translate-y-1` smooth spring transform.
- **Level 3 (Sticky Nav & Modals)**: `backdrop-filter: blur(12px); background: rgba(26, 54, 32, 0.88)` (Dark Nav) or `rgba(248, 245, 237, 0.92)` (Light Sticky), bordered by `rgba(217, 119, 6, 0.2)`.
- **Level 4 (Floating Basket / Overlay Drawer)**: `box-shadow: 0 -8px 36px 0 rgba(26, 54, 32, 0.24);`.

## Shapes
A roundedness factor of `2` provides an organic, inviting contour echoing traditional stone baking and bread-crafting.

- Standard cards, order tickets, and dietary modals use `1rem` (`rounded-2xl`).
- Category navigation buttons and nutritional tags use full pill contours (`rounded-full`) to allow fast finger tapping and swipe carousels.
- Subtle inner image containers inherit `0.75rem` (`rounded-xl`) to establish harmonic concentric radius with the parent card.

## Components

### Buttons
- **Primary Order Button**: Solid `#277E39` background, white text (`label-md`), `rounded-full` or `rounded-xl`, with a soft emerald glow on hover (`0 4px 14px rgba(39, 126, 57, 0.35)`). Active state darkens to `#1E652D`.
- **Secondary / Action Button (Hearth Accent)**: Solid `#D97706` or outline with gold border, ideal for checkout CTAs, catering requests, and re-order triggers.
- **Ghost / Stepper Controls**: Quantity counters (`+` / `-`) encased in `#F8F5ED` rounded pills with `#1A3620` icons, giving tactile physical feedback.

### Category Pills (Pill Tabs)
- Horizontal scroll container with hidden scrollbars.
- **Inactive**: Cream background `#FFFFFF`, subtle border `rgba(107, 116, 109, 0.2)`, text `#6B746D`.
- **Active**: Deep Konya Green `#1A3620` background, pure white text, accompanied by an amber accent dot or subtle gold bottom indicator.

### Food Product Cards
- Aspect ratio optimized for long regional specialties (such as 180cm Etli Ekmek presentation slices).
- Crisp top photography container with soft gradient fade (`linear-gradient(to top, rgba(0,0,0,0.4), transparent)`).
- Content zone: Playfair Display title, muted ingredients preview (max 2 lines), bold price badge in amber (`#B45309`), and floating "+" order pill button.

### Cart Drawer & Modals
- **Drawer**: Mobile bottom sheet with pull bar; Desktop right-pinned sheet with glass header. Includes clear itemized notes (e.g., "Acılı", "Limon Ekstra") and fixed bottom summary with delivery fee status progress bar.
- **Product Customization Modal**: Two-column layout on desktop: large dish viewport on left with ingredient selectors, extra portion toggles, and note inputs on the right.

### Admin & Operations Cards
- Dark/Light mode duality: Operations screen allows rapid toggling between `#1A3620` (Kitchen display mode with high-contrast amber alerts) and `#FFFFFF` (Daylight financial/reporting views).