<script lang="ts">
  import { onDestroy, onMount } from "svelte"

  interface Props {
    speed?: number; // pixels per second
    direction?: "vertical" | "horizontal";
    reverse?: boolean; // New prop to reverse scroll direction
    pauseOnHover?: boolean;
    gap?: number; // gap between items in pixels
    fade?: boolean;
    ticker?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    speed = 50,
    direction = "vertical",
    reverse = false,
    pauseOnHover = true,
    gap = 18,
    fade = true,
    ticker = false,
    children
  }: Props = $props();

  let animationDuration: number = $state(10)
  let contentWrapper: HTMLDivElement = $state()
  let content: HTMLDivElement = $state()
  let scrollAmount = $state(0)
  let clones: HTMLElement[] = []

  function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
    let timeoutId: number | undefined
    return function (...args: Parameters<T>) {
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => fn(...args), delay)
    }
  }

  const clearClones = () => {
    clones.forEach((clone) => {
      if (clone.parentNode) {
        clone.parentNode.removeChild(clone)
      }
    })
    clones = []
  }

  const calculateSize = () => {
    if (!content || !contentWrapper) return

    const contentRect = content.getBoundingClientRect()
    const containerRect = contentWrapper.getBoundingClientRect()

    const contentSize =
      direction === "vertical" ? contentRect.height : contentRect.width
    const containerSize =
      direction === "vertical" ? containerRect.height : containerRect.width

    if (contentSize > 0 && containerSize > 0) {
      // Clear existing clones
      clearClones()

      // Calculate how many clones we need to ensure seamless scrolling
      // We need enough content to fill the container plus buffer for smooth animation
      const minTotalSize = containerSize * 2 + contentSize // Extra buffer for smooth transitions
      const clonesNeeded = Math.ceil(minTotalSize / contentSize)

      // Create the necessary clones
      for (let i = 0; i < clonesNeeded; i++) {
        const clone = content.cloneNode(true) as HTMLElement
        contentWrapper.appendChild(clone)
        clones.push(clone)
      }

      // Set scroll amount to just one content block + gap for seamless looping
      const newScrollAmount = contentSize + gap
      if (Math.abs(newScrollAmount - scrollAmount) > 1) {
        scrollAmount = newScrollAmount
        animationDuration = newScrollAmount / speed
      }
    }
  }

  let resizeObserver: ResizeObserver

  onMount(() => {
    if (content && contentWrapper) {
      // Use a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        calculateSize()
      }, 10)

      const debouncedCalculateSize = debounce(calculateSize, 100)
      resizeObserver = new ResizeObserver(debouncedCalculateSize)
      resizeObserver.observe(content)
      resizeObserver.observe(contentWrapper)
    }
  })

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    clearClones()
  })

  // Calculate the actual scroll amount with direction
  let actualScrollAmount = $derived(reverse ? scrollAmount : -scrollAmount)
</script>

<div
  class="looping-scroller-container"
  class:pause-on-hover={pauseOnHover}
  class:fade-vertical={fade && direction === "vertical"}
  class:fade-horizontal={fade && direction === "horizontal"}
  class:ticker
>
  <div
    bind:this={contentWrapper}
    class="scroller-content-wrapper"
    class:vertical={direction === "vertical"}
    class:horizontal={direction === "horizontal"}
    class:reverse
    style="--animation-duration: {animationDuration}s; --gap: {gap}px; --scroll-amount: {actualScrollAmount}px;"
  >
    <div
      bind:this={content}
      class="scroller-content"
      class:content-vertical={direction === "vertical"}
      class:content-horizontal={direction === "horizontal"}
    >
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .looping-scroller-container.ticker {
    font-family: "SF Mono", monospace;
    font-weight: 600;
    letter-spacing: 0.1em;
    @apply text-6xl font-bold;
    text-align: center;
    text-transform: uppercase;
    @apply dark:bg-[yellow] dark:text-black text-[yellow] bg-black;
  }

  .looping-scroller-container {
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  .looping-scroller-container.fade-vertical {
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 2%,
      black 98%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 2%,
      black 98%,
      transparent 100%
    );
  }

  .looping-scroller-container.fade-horizontal {
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 2%,
      black 98%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 2%,
      black 98%,
      transparent 100%
    );
  }

  .scroller-content-wrapper {
    display: flex;
  }

  .scroller-content-wrapper.vertical {
    flex-direction: column;
    gap: var(--gap);
    animation: scroll-y var(--animation-duration) linear infinite;
  }

  .scroller-content-wrapper.horizontal {
    flex-direction: row;
    gap: var(--gap);
    animation: scroll-x var(--animation-duration) linear infinite;
  }

  /* Reverse alignment - start from the end */
  .scroller-content-wrapper.vertical.reverse {
    justify-content: flex-end;
  }

  .scroller-content-wrapper.horizontal.reverse {
    justify-content: flex-end;
  }

  .pause-on-hover:hover .scroller-content-wrapper {
    animation-play-state: paused;
  }

  .scroller-content {
    flex-shrink: 0;
    display: flex;
    gap: var(--gap);
  }

  .scroller-content.content-vertical {
    flex-direction: column;
  }

  .scroller-content.content-horizontal {
    flex-direction: row;
    width: max-content;
  }

  @keyframes scroll-y {
    to {
      transform: translateY(var(--scroll-amount));
    }
  }

  @keyframes scroll-x {
    to {
      transform: translateX(var(--scroll-amount));
    }
  }
</style>
