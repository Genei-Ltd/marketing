# Animation guidelines

General rules of animating:

=== VISUAL DESIGN PRINCIPLES ===

- Visual abstraction that represents UI elements conceptually rather than literally
- GIF-like smooth looping animation with seamless transitions using magic-move style between phases
- Concept testing metaphor showing product evaluation and scoring methodology
- Clean, modern interface with proper visual hierarchy following established patterns
- Scalable design that works in any square container (aspect-square with proper inset padding)
- borders if needed, flat design aesthetic
- Professional appearance suitable for business presentations and marketing demos
- Accessible color scheme using semantic design tokens from app.css (background, foreground, card, muted, accent variants)
- Uses established AnimationController pattern for smooth, cancellable animations with proper cleanup

=== LAYOUT & CONTAINER CONSTRAINTS ===

- CRITICAL: Everything MUST always fit inside the square container (aspect-square)
- Container uses "relative w-full aspect-square bg-background border border-border rounded-lg overflow-hidden"
- All phases use "absolute inset-4" positioning for consistent padding and containment
- Size, spacing, layout and positioning carefully tuned for smooth, clean, clear animation
- Information should be abstract representations, not actual UI mockups
- No scrolling or overflow - all content designed to fit within visible viewport bounds

=== TECHNICAL IMPLEMENTATION DETAILS ===

- Uses Svelte 5 runes: $state() for reactive state management
- Magic-move style transitions between phases for smooth flow, this is important and vital for the smooth looping.
