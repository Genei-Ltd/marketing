# Animation guidelines

General rules of animating:

=== VISUAL DESIGN PRINCIPLES ===

- Visual abstraction that represents UI elements conceptually rather than literally
- GIF-like smooth looping animation with seamless transitions using magic-move style between phases
- Concept testing metaphor showing product evaluation and scoring methodology
- Clean, modern interface with proper visual hierarchy following established patterns
- Scalable design that works in any square container (aspect-square with proper inset padding)
- Minimal borders, flat design aesthetic with subtle depth through shadows and blur effects
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
Architecture:

- Uses Svelte 5 runes: $state() for reactive state management
- AnimationController class with AbortController for clean cancellation
- Proper cleanup and timeout management via controller.addCleanup()
- Error handling with graceful fallbacks and signal.aborted checks

Styling System:

- Semantic design tokens: bg-background, text-foreground, bg-card, text-muted-foreground
- Accent colors: bg-primary, text-primary-foreground, bg-secondary, text-secondary-foreground for visual hierarchy
- Consistent typography: text-lg font-semibold for headers, text-md for content
- Tailwind transitions: transition-all duration-300/500 for smooth state changes
- emphasis: ring-2 ring-primary for active highlighting or scale-105 depending on whats needed you can also change the bg to primary or scondary etc.

Icons & Assets:

- images live in /static/images/
- Consistent icon sizing: size={20} for headers, size={48} for celebration
- Generated avatars and thumbnails following established patterns

Animation Techniques:

- word-by-word typing with configurable delays (40ms default)
- Staggered reveals with Svelte transitions: scale, fly effects, fade, etc.
- Progress bar animations using CSS width transitions
- Score counting animations with incremental updates
- Highlight effects with transform and color changes
- Magic-move style transitions between phases for smooth flow, this is important and vital for the smooth looping.

Performance Optimizations:

- Efficient DOM updates through reactive state batching
- CSS-based animations for smooth performance
- Proper animation cleanup to prevent memory leaks
- AbortController pattern for cancellable async operations
- Minimal re-renders through careful state management

=== ACCESSIBILITY & POLISH ===

- Respects prefers-reduced-motion for accessibility compliance
- Proper semantic HTML structure with meaningful headings
- Sufficient color contrast using design system tokens
- Loading states with visual feedback (animate-pulse, animate-spin)
- Clean error handling with fallback states
- Professional animation timing and easing curves (quintOut, cubicInOut)

=== INTEGRATION PATTERNS ===

- Follows established AnimationController pattern from other demo components
- Consistent with visual design system used across animation suite
- Compatible with marketing presentation contexts and business demos
- Responsive within square container constraints
- Clean component lifecycle with onMount and cleanup handlers

=== MICRO-INTERACTION PATTERN — WORKSPACE CARD (from GIF) ===

Purpose:

- Translate the GIF’s interaction into a reusable "hover/press/focus" card pattern for demos and product metaphors.

Motion spec:

- Idle: scale-100, shadow-md, ring-0
- Hover: scale-[1.015] (max 1.02), translate-y-[-1px], shadow-lg, ring-2 ring-primary/15
- Active/press: scale-[0.985] and shadow-md; restore to hover quickly on pointerup
- Focus-visible: ring-[3px] ring-ring; never rely on hover only
- Durations: 150–200ms for hover/press, 250–350ms for returning to idle; use ease-out for enter, ease-in for exit
- Easing tokens: prefer Tailwind’s default bezier; for snappier taps use `[transition-timing-function:var(--default-transition-timing-function)]`

Layout & density:

- Container: `relative w-full aspect-square bg-background border border-border rounded-lg overflow-hidden`
- Content inset: `absolute inset-4`
- Card surface: `rounded p-6` with `gap-4` vertical rhythm
- Title: `text-lg font-semibold`
- Meta: `text-sm text-muted-foreground`
- Stats row: `mt-6 flex items-center gap-4 text-sm text-muted-foreground`

Color & depth:

- Background surface: `bg-card/70 backdrop-blur-sm`
- Shadow steps: `shadow-md hover:shadow-lg` only; avoid `shadow-2xl` in this scale to keep it professional
- Interactive highlight: use subtle ring plus background tint: `hover:bg-card/80`

Do:

- Keep the lift subtle (≤ 1.02 scale) and consistent across cards
- Ensure ring tokens use semantic colors: `ring-ring`, `ring-primary/15`
- Respect `prefers-reduced-motion` (already enforced in `app.css`)

Don’t:

- Don’t overshoot scale or add bounce easing on hover
- Don’t change layout on hover (avoid margin/size jumps); only transform and shadow

Tailwind recipe:

```svelte
<!-- Square stage -->
<div class="relative w-full aspect-square bg-background border border-border rounded-lg overflow-hidden">
  <!-- Inset canvas -->
  <div class="absolute inset-4">
    <button
      type="button"
      class="card group relative h-full w-full rounded-lg p-5 md:p-6 text-left transition-all duration-200 ease-out
             shadow-md hover:shadow-lg
             ring-0 hover:ring-2 hover:ring-primary/15
             hover:scale-[1.015] active:scale-[0.985]
             focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      aria-label="Open workspace"
    >
      <div class="space-y-1">
        <h3 class="text-lg font-semibold">Commercial Contracts</h3>
        <p class="text-sm text-muted-foreground">Updated Jul 20</p>
      </div>
      <div class="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
        <!-- Example stat items; swap with Tabler icons in real usage -->
        <span class="inline-flex items-center gap-2"><span class="size-4 rounded-sm bg-muted" />102 Files</span>
        <span class="inline-flex items-center gap-2"><span class="size-4 rounded-sm bg-muted" />25 Queries</span>
      </div>
    </button>
  </div>
  <!-- Optional dark surround (as in GIF) is handled by parent layout -->
  <!-- Reduced motion handled globally in app.css -->
  <!-- Radius uses --radius system automatically via .card and rounded utilities -->
  <!-- Replace placeholder squares with Tabler icons: import { IconFolder, IconAsterisk } from '@tabler/icons-svelte' -->
```

Optional cursor glow (tasteful):

- Use a radial highlight that follows the pointer inside the card. Keep it ≤ 15% alpha and clip to the card.

```svelte
<script lang="ts">
	let pos = $state({ x: 0, y: 0 })
	function onMove(e: MouseEvent) {
		const el = e.currentTarget as HTMLElement
		const r = el.getBoundingClientRect()
		pos = { x: e.clientX - r.left, y: e.clientY - r.top }
	}
	const style = $derived(() => `--x:${pos.x}px; --y:${pos.y}px`)
</script>

<div on:mousemove={onMove} {style} class="relative rounded-lg [--x:0px] [--y:0px] [--r:200px] overflow-hidden">
	<div
		class="pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-200 opacity-0 group-hover:opacity-100"
		style="background: radial-gradient(var(--r) var(--r) at var(--x) var(--y), hsl(var(--ring)/0.15), transparent 70%);" />
	<!-- card content here -->
	<!-- Keep alpha subtle; this should enhance, not distract. -->
	<!-- Respect reduced-motion: the gradient is static, only opacity changes. -->
	<!-- No layout shifts; transforms only. -->
</div>
```

Test checklist:

- Hover feels immediate but not jumpy (≤ 200ms). Release restores within 250–350ms.
- No layout shift when hovering; only transform/shadow/ring change.
- Focus-visible is clearly visible on keyboard tab and does not depend on hover.
- Works inside any `aspect-square` stage with `absolute inset-4` content.
