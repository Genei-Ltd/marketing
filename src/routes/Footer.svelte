<script lang="ts">
  import {
    IconBrandTwitter,
    IconBrandLinkedin,
    IconBrandGithub,
  } from "@tabler/icons-svelte"
</script>

<footer class="border-border mb-32 border-t bg-transparent py-16">
  <div class="mx-auto flex max-w-7xl flex-row justify-between px-4">
    <!-- Column 1 -->
    <div class="mb-8 flex flex-col items-start gap-2">
      <img
        src="/logos/white.png"
        alt="CoLoop Logo"
        class="mb-2 h-10 w-fit"
        loading="lazy"
      />
      <p class="text-muted-foreground text-sm">Insight to Influence.</p>
    </div>
    <!-- Column 2 -->
    <div class="flex h-full w-1/2 flex-row items-start justify-end gap-12">
      <nav
        class="text-muted-foreground mb-8 flex flex-col gap-4 text-sm font-medium"
      >
        <a href="/" class="hover:text-primary transition-colors">Home</a>
        <a href="/#features" class="hover:text-primary transition-colors"
          >Features</a
        >
        <a href="/#integrations" class="hover:text-primary transition-colors"
          >Integrations</a
        >
        <a href="/#community" class="hover:text-primary transition-colors"
          >Community</a
        >
        <a
          href="https://docs.coloop.ai"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-primary transition-colors">Docs</a
        >
        <a
          href="mailto:hello@coloop.ai"
          class="hover:text-primary transition-colors">Contact</a
        >
      </nav>
      <nav
        class="text-muted-foreground mb-8 flex flex-col gap-4 text-sm font-medium"
      >
        <a href="/" class="hover:text-primary transition-colors">Home</a>
        <a href="/#features" class="hover:text-primary transition-colors"
          >Features</a
        >
        <a href="/#integrations" class="hover:text-primary transition-colors"
          >Integrations</a
        >
        <a href="/#community" class="hover:text-primary transition-colors"
          >Community</a
        >
        <a
          href="https://docs.coloop.ai"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-primary transition-colors">Docs</a
        >
        <a
          href="mailto:hello@coloop.ai"
          class="hover:text-primary transition-colors">Contact</a
        >
      </nav>
      <nav
        class="text-muted-foreground mb-8 flex flex-col gap-4 text-sm font-medium"
      >
        <a href="/mission" class="hover:text-primary transition-colors"
          >Mission</a
        >
        <a href="/terms" class="hover:text-primary transition-colors"
          >Terms of Use</a
        >
        <a href="/trust" class="hover:text-primary transition-colors">Privacy</a
        >
        <a href="/trust" class="hover:text-primary transition-colors"
          >Data Processing</a
        >
      </nav>
    </div>
  </div>
  <!-- Copyright -->
  <div class="text-muted-foreground mt-16 text-center text-xs">
    &copy; {new Date().getFullYear()} CoLoop, Inc. All rights reserved.
  </div>
</footer>
