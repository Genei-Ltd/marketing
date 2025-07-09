<script lang="ts">
  import { navigating, page } from "$app/stores"
  import { Separator } from "$components/ui/separator"
  import * as Icon from "@tabler/icons-svelte"
  import { ModeWatcher } from "mode-watcher"
  import type { Snippet } from "svelte"
  import { ClerkProvider, SignedIn, SignedOut, UserButton } from "svelte-clerk"
  import "../app.css"
  interface Props {
    children?: Snippet
    data?: any
  }

  let { children, data }: Props = $props()
</script>

<ClerkProvider {...data}>
  <ModeWatcher />

  <!-- Loading Animation -->
  {#if $navigating}
    <div
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-background rounded-lg p-6 shadow-lg border border-border">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div
              class="w-8 h-8 border-4 border-primary/20 rounded-full animate-spin border-t-primary"
            ></div>
          </div>
          <div class="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    </div>
  {/if}

  <div class="bg-background min-h-screen flex flex-col">
    {#if $page.url.pathname !== "/"}
      <SignedIn>
        <div class="flex h-screen">
          <!-- Column 1 -->
          <div
            class="w-16 bg-muted border-r border-border flex flex-col items-center justify-between"
          >
            <a href="https://app.coloop.ai">
              <div class="flex flex-col items-center justify-center">
                <img
                  src="/favicon.png"
                  alt="CoLoop Logo"
                  class="h-8 w-8 rounded mt-4"
                />
              </div>
            </a>
            <div class="flex flex-col items-center justify-center w-16 gap-4">
              <a
                href="https://community.coloop.ai"
                class="flex flex-col items-center justify-center hover:bg-card rounded-full w-10 h-10"
              >
                <Icon.IconFlame class="w-10 h-10 p-2" />
              </a>
              <a
                href="https://docs.coloop.ai/docs/troubleshooting"
                class="flex flex-col items-center justify-center hover:bg-card rounded-full w-10 h-10"
              >
                <Icon.IconHelpCircle class="w-10 h-10 p-2" />
              </a>

              <div class="flex flex-col items-center justify-center w-16">
                <!-- User Section -->
                <div class="p-4">
                  <div
                    class="bg-muted/30 rounded-sm p-1 gap-3 flex flex-row items-center hover:bg-muted transition-colors"
                  >
                    <UserButton />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="w-64 bg-card border-r border-border flex flex-col">
            <!-- Logo -->
            <div class="p-6 border-b border-border">
              <a href="/" class="flex items-start gap-2 flex-col">
                <img
                  src="/logos/black.png"
                  alt="CoLoop Logo"
                  class="h-6 dark:invert"
                />
                <span
                  class="text-xs -mt-1 w-full text-muted-foreground font-bold tracking-wide uppercase"
                  >Management Console</span
                >
              </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 p-3 space-y-1">
              <div
                class="pt-4 text-sm font-bold text-muted-foreground uppercase"
              >
                <span class="text-sm">Workspaces</span>
              </div>
              <a
                href="/billing"
                class="flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors {$page
                  .url.pathname === '/billing'
                  ? 'bg-black/5 dark:bg-white/5 font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'}"
              >
                <Icon.IconCreditCard class="w-4 h-4" />
                Billing & Workspaces
              </a>

              <a
                href="/self-serve"
                class="flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors {$page.url.pathname.startsWith(
                  '/self-serve',
                )
                  ? 'bg-black/5 dark:bg-white/5 font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'}"
              >
                <Icon.IconShoppingCart class="w-4 h-4" />
                Buy Credits
              </a>

              <div
                class="pt-4 text-sm font-bold text-muted-foreground uppercase"
              >
                <span class="text-sm">Get help</span>
              </div>
              <a
                href="https://docs.coloop.ai/docs/troubleshooting"
                class="flex items-center gap-3 px-3 py-2 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                target="_blank"
              >
                <Icon.IconBook class="w-4 h-4" />
                Documentation
              </a>
              <a
                href="https://docs.coloop.ai/docs/how-to-guides"
                class="flex items-center gap-3 px-3 py-2 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                target="_blank"
              >
                <Icon.IconStar class="w-4 h-4" />
                How-to Guides
              </a>

              <a
                href="https://community.coloop.ai"
                class="flex items-center gap-3 px-3 py-2 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                target="_blank"
              >
                <Icon.IconFlame class="w-4 h-4" />
                Ask our community
              </a>

              <Separator class="my-4" />

              <a
                href="https://app.coloop.ai"
                target="_blank"
                class="flex items-center gap-3 px-3 py-2 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Icon.IconExternalLink class="w-4 h-4" />

                Open CoLoop
              </a>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="flex-1 overflow-auto">
            {#if children}
              {@render children()}
            {/if}
          </main>
        </div>
      </SignedIn>

      <SignedOut>
        <!-- No sidebar for non-authenticated users -->
        <main class="min-h-screen">
          {#if children}
            {@render children()}
          {/if}
        </main>
      </SignedOut>
    {:else}
      <div class="bg-background">
        <div
          class="flex flex-row items-center justify-between py-4 max-w-5xl mx-auto px-4"
        >
          <a href="/">
            <img
              src="/logos/black.png"
              alt="CoLoop Logo"
              class="h-8 dark:invert"
            />
          </a>
          <div
            class="flex flex-row items-center justify-center gap-6 text-lg text-foreground font-semibold"
          >
            <a href="/company">Company</a>
            <a href="/pricing">Pricing</a>
            <a href="/careers">Careers</a>
            <a href="/blog">Blog</a>
            <a href="/support">Support</a>
            {#if $page.url.pathname.includes("/self-serve")}
              <!-- Button will be fixed separately -->
              <a
                href="https://app.coloop.ai"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >Back to app</a
              >
            {:else if $page.url.pathname.includes("/demo")}
              <div class="hidden"></div>
            {:else}
              <!-- Button will be fixed separately -->
              <a
                href="/demo"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >Get Started</a
              >
            {/if}
          </div>
        </div>
      </div>

      <main class="flex-1">
        {#if children}
          {@render children()}
        {/if}
      </main>

      <!-- Footer - Naturally at bottom -->
      <div class="border-t border-border mt-12">
        <div class="max-w-4xl mx-auto px-4 py-6">
          <div class="text-center text-muted-foreground text-sm">
            <p>© CoLoop {new Date().getFullYear()}</p>
            <p class="mt-1">
              AI analysis copilot for Insights & Strategy Teams
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</ClerkProvider>
