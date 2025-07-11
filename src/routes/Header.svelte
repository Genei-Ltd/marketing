<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js"
  import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte"
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
    title: string
    href: string
    content: string
  }

  const companyTypes = [
    {
      title: "Agency",
      href: "#",
      description: "Solutions for agencies and consultants",
    },
    {
      title: "In-house team",
      href: "#",
      description: "Solutions for internal teams",
    },
    {
      title: "Independent researcher",
      href: "#",
      description: "Solutions for independent researchers",
    },
  ]

  const useCases = [
    {
      title: "Concept testing",
      href: "#",
      description: "Test and validate new concepts",
    },
    {
      title: "Message testing",
      href: "#",
      description: "Test marketing messages and communications",
    },
    {
      title: "Brand positioning",
      href: "#",
      description: "Research and refine brand positioning",
    },
    {
      title: "Customer experience",
      href: "#",
      description: "Understand and improve customer experience",
    },
    {
      title: "Market entry",
      href: "#",
      description: "Research for entering new markets",
    },
    {
      title: "Pricing research",
      href: "#",
      description: "Research pricing strategies and models",
    },
  ]

  const resources = [
    {
      title: "Guides & tutorials",
      href: "https://docs.coloop.ai/docs/getting-started/introduction",
      description: "Learn how to use CoLoop effectively",
    },
    {
      title: "Community videos",
      href: "https://community.coloop.ai/",
      description: "Watch community-created content",
    },
    {
      title: "Blog",
      href: "#",
      description: "Read our latest insights and updates",
    },
    {
      title: "Careers",
      href: "#",
      description: "Join our team and grow with us",
    },
    {
      title: "Security",
      href: "https://trust.coloop.ai/",
      description: "Learn about our security practices",
    },
  ]
</script>

<div
  class="mx-auto my-4 flex w-full max-w-7xl items-center justify-between px-4 font-serif"
>
  <div class="flex items-center gap-4">
    <a href="/" class="text-2xl font-bold">
      <img src="/logos/black.png" alt="Logo" class="h-6 dark:invert" />
    </a>
  </div>

  <div class="flex items-center gap-4">
    {#snippet ListItem({
      title,
      content,
      href,
      class: className,
      ...restProps
    }: ListItemProps)}
      <li>
        <NavigationMenu.Link>
          {#snippet child()}
            <a
              {href}
              class={cn(
                " hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground mx-2 flex min-h-[80px] select-none flex-col justify-start space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                className,
              )}
              {...restProps}
            >
              <div class="text-base font-medium leading-none">{title}</div>
              <span
                class="text-muted-foreground line-clamp-2 flex-1 font-sans text-sm leading-snug"
              >
                {content}
              </span>
            </a>
          {/snippet}
        </NavigationMenu.Link>
      </li>
    {/snippet}

    <NavigationMenu.Root viewport={false} class="hidden md:block">
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link>
            {#snippet child()}
              <a
                href="/product"
                class={navigationMenuTriggerStyle() +
                  " px-4 py-2 text-base font-medium tracking-wide"}>Product</a
              >
            {/snippet}
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger>
            <span class="text-base font-medium tracking-wide">Company type</span
            >
          </NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <ul
              class="grid w-[240px] auto-cols-[240px] grid-flow-col grid-rows-3 justify-center gap-2 p-2"
            >
              {#each companyTypes as item}
                {@render ListItem({
                  href: item.href,
                  title: item.title,
                  content: item.description,
                })}
              {/each}
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Use case</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <ul
              class="grid w-[400px] auto-cols-[240px] grid-flow-col grid-rows-3 justify-center gap-2 p-2 md:w-[500px]"
            >
              {#each useCases as item}
                {@render ListItem({
                  href: item.href,
                  title: item.title,
                  content: item.description,
                })}
              {/each}
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <ul
              class="grid w-[460px] grid-cols-[200px_240px] grid-rows-3 justify-start gap-2 p-2"
            >
              <li class="row-span-3 max-h-min grow-0">
                <NavigationMenu.Link
                  class="relative flex h-full w-full select-none flex-col justify-end rounded-md bg-transparent p-6 no-underline outline-none focus:shadow-md"
                >
                  {#snippet child({ props })}
                    <a
                      {...props}
                      href="/resources"
                      class="relative flex h-full w-full select-none flex-col justify-end overflow-hidden rounded-md bg-transparent p-6 no-underline outline-none focus:shadow-md"
                    >
                      <img
                        src="/images/amethyst-2.png"
                        alt="Resources"
                        aria-hidden="true"
                        class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
                      />
                      <div
                        class="bg-background/50 absolute bottom-0 left-0 z-10 flex h-full w-full flex-col justify-end p-6"
                      >
                        <div class="mb-2 mt-4 text-lg font-medium">
                          CoLoop Resources
                        </div>
                        <span
                          class="text-foreground text-sm leading-tight opacity-80"
                        >
                          Everything you need to get started with user research.
                        </span>
                      </div>
                    </a>
                  {/snippet}
                </NavigationMenu.Link>
              </li>
              {@render ListItem({
                href: "https://docs.coloop.ai/docs/getting-started/introduction",
                title: "Guides & tutorials",
                content: "Learn how to use CoLoop effectively",
              })}
              {@render ListItem({
                href: "https://community.coloop.ai/",
                title: "Community videos",
                content: "Watch community-created content",
              })}
              {@render ListItem({
                href: "#",
                title: "Blog",
                content: "Read our latest insights and updates",
              })}
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link>
            {#snippet child()}
              <a href="/docs" class={navigationMenuTriggerStyle()}>Docs</a>
            {/snippet}
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <Button variant="outline" size="lg" href="/login" class="m-2"
            >Login</Button
          >
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <Button variant="default" size="lg" href="/login">Get CoLoop</Button>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  </div>
</div>
