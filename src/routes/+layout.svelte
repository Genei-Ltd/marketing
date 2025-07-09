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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-background border-border rounded-lg border p-6 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div
              class="border-primary/20 border-t-primary h-8 w-8 animate-spin rounded-full border-4"
            ></div>
          </div>
          <div class="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    </div>
  {/if}

  <div class="bg-background flex min-h-screen flex-col">
    {#if $page.url.pathname !== "/"}
      <SignedIn>
        <div class="flex h-screen">
          <!-- Column 1 -->
          <div
            class="bg-muted border-border flex w-16 flex-col items-center justify-between border-r"
          >
            <a href="https://app.coloop.ai">
              <div class="flex flex-col items-center justify-center">
                <img
                  src="/favicon.png"
                  alt="CoLoop Logo"
                  class="mt-4 h-8 w-8 rounded"
                />
              </div>
            </a>
            <div class="flex w-16 flex-col items-center justify-center gap-4">
              <a
                href="https://community.coloop.ai"
                class="hover:bg-card flex h-10 w-10 flex-col items-center justify-center rounded-full"
              >
                <Icon.IconFlame class="h-10 w-10 p-2" />
              </a>
              <a
                href="https://docs.coloop.ai/docs/troubleshooting"
                class="hover:bg-card flex h-10 w-10 flex-col items-center justify-center rounded-full"
              >
                <Icon.IconHelpCircle class="h-10 w-10 p-2" />
              </a>

              <div class="flex w-16 flex-col items-center justify-center">
                <!-- User Section -->
                <div class="p-4">
                  <div
                    class="bg-muted/30 hover:bg-muted flex flex-row items-center gap-3 rounded-sm p-1 transition-colors"
                  >
                    <UserButton />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="bg-card border-border flex w-64 flex-col border-r">
            <!-- Logo -->
            <div class="border-border border-b p-6">
              <a href="/" class="flex flex-col items-start gap-2">
                <img
                  src="/logos/black.png"
                  alt="CoLoop Logo"
                  class="h-6 dark:invert"
                />
                <span
                  class="text-muted-foreground -mt-1 w-full text-xs font-bold tracking-wide uppercase"
                  >Management Console</span
                >
              </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 space-y-1 p-3">
              <div
                class="text-muted-foreground pt-4 text-sm font-bold uppercase"
              >
                <span class="text-sm">Workspaces</span>
              </div>
              <a
                href="/billing"
                class="flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors {$page
                  .url.pathname === '/billing'
                  ? 'text-foreground bg-black/5 font-medium dark:bg-white/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'}"
              >
                <Icon.IconCreditCard class="h-4 w-4" />
                Billing & Workspaces
              </a>

              <a
                href="/self-serve"
                class="flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors {$page.url.pathname.startsWith(
                  '/self-serve',
                )
                  ? 'text-foreground bg-black/5 font-medium dark:bg-white/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'}"
              >
                <Icon.IconShoppingCart class="h-4 w-4" />
                Buy Credits
              </a>

              <div
                class="text-muted-foreground pt-4 text-sm font-bold uppercase"
              >
                <span class="text-sm">Get help</span>
              </div>
              <a
                href="https://docs.coloop.ai/docs/troubleshooting"
                class="text-muted-foreground hover:text-foreground flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                target="_blank"
              >
                <Icon.IconBook class="h-4 w-4" />
                Documentation
              </a>
              <a
                href="https://docs.coloop.ai/docs/how-to-guides"
                class="text-muted-foreground hover:text-foreground flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                target="_blank"
              >
                <Icon.IconStar class="h-4 w-4" />
                How-to Guides
              </a>

              <a
                href="https://community.coloop.ai"
                class="text-muted-foreground hover:text-foreground flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                target="_blank"
              >
                <Icon.IconFlame class="h-4 w-4" />
                Ask our community
              </a>

              <Separator class="my-4" />

              <a
                href="https://app.coloop.ai"
                target="_blank"
                class="text-muted-foreground hover:text-foreground flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Icon.IconExternalLink class="h-4 w-4" />

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
          class="mx-auto flex max-w-5xl flex-row items-center justify-between px-4 py-4"
        >
          <a href="/">
            <img
              src="/logos/black.png"
              alt="CoLoop Logo"
              class="h-8 dark:invert"
            />
          </a>
          <div
            class="text-foreground flex flex-row items-center justify-center gap-6 text-lg font-semibold"
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
                class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >Back to app</a
              >
            {:else if $page.url.pathname.includes("/demo")}
              <div class="hidden"></div>
            {:else}
              <!-- Button will be fixed separately -->
              <a
                href="/demo"
                class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
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
      <div class="border-border mt-12 border-t">
        <div class="mx-auto max-w-4xl px-4 py-6">
          <div class="text-muted-foreground text-center text-sm">
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
