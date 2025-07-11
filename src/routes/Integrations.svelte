<script lang="ts">
  import { cn } from "$lib/utils.js"
  import { Card } from "$lib/components/ui/card"
  import {
    IconFileText,
    IconUsers,
    IconCloud,
    IconMessage,
    IconNotes,
    IconShare,
    IconMicrophone,
    IconRecordMail,
    IconBuilding,
    IconFileDescription,
    IconExternalLink,
  } from "@tabler/icons-svelte"

  // Define integration tools data
  const integrations: {
    name: string
    img_url: string
    href: string | null
    hasPage: boolean
  }[] = [
    {
      name: "Field Notes",
      img_url: "/integrations/field-notes.png",
      href: "https://docs.coloop.ai/integration/integration/field-notes",
      hasPage: true,
    },
    {
      name: "Field Notes",
      img_url: "/integrations/field-notes.png",
      href: "https://docs.coloop.ai/integration/integration/field-notes",
      hasPage: true,
    },
    {
      name: "Qualzy",
      img_url: "/integrations/qualzy.png",
      href: "https://docs.coloop.ai/integration/integration/qualzy",
      hasPage: true,
    },
    {
      name: "Incling",
      img_url: "/integrations/incling.png",
      href: "https://docs.coloop.ai/integration/integration/incling",
      hasPage: true,
    },
    {
      name: "Recollective",
      img_url: "/integrations/recollective.png",
      href: "https://docs.coloop.ai/integration/integration/recollective",
      hasPage: true,
    },
    {
      name: "Yazi",
      img_url: "/integrations/yazi.png",
      href: "https://docs.coloop.ai/integration/integration/yazi",
      hasPage: true,
    },
    {
      name: "OneDrive",
      img_url: "/integrations/onedrive.png",
      href: "https://docs.coloop.ai/integration/integration/one-drive",
      hasPage: true,
    },
    {
      name: "SharePoint",
      img_url: "/integrations/sharepoint.png",
      href: "https://docs.coloop.ai/integration/integration/share-point",
      hasPage: true,
    },
    {
      name: "Zoom",
      img_url: "/integrations/zoom.png",
      href: "https://docs.coloop.ai/integration/integration/zoom",
      hasPage: true,
    },
    {
      name: "Google Meet",
      img_url: "/integrations/google-meet.png",
      href: "https://docs.coloop.ai/integration/integration/google-meet",
      hasPage: true,
    },
    {
      name: "Microsoft Teams",
      img_url: "/integrations/teams.png",
      href: "https://docs.coloop.ai/integration/integration/teams",
      hasPage: true,
    },
    {
      name: "Discuss IO",
      img_url: "/integrations/discuss.png",
      href: "https://docs.coloop.ai/integration/integration/discuss",
      hasPage: true,
    },
    {
      name: "UserTesting",
      img_url: "/integrations/user-testing.png",
      href: null,
      hasPage: false,
    },
    {
      name: "Rev",
      img_url: "/integrations/rev.png",
      href: null,
      hasPage: false,
    },
    {
      name: "Otter",
      img_url: "/integrations/otter.png",
      href: null,
      hasPage: false,
    },
    {
      name: "Capvision",
      img_url: "/integrations/capvision.png",
      href: null,
      hasPage: false,
    },
  ]

  function handleIntegrationClick(integration: (typeof integrations)[0]) {
    if (integration.href) {
      window.open(integration.href, "_blank", "noopener,noreferrer")
    }
  }
</script>

<div class="flex flex-wrap justify-center">
  {#each integrations as integration}
    <div
      class={cn(
        " bg- border-border hover:bg-primary hover:text-primary-foreground hover:border-primary group relative flex h-40 w-40 flex-col items-center justify-center border border-dashed transition-all duration-200 hover:z-50 hover:shadow-lg",
        integration.hasPage ? " cursor-pointer" : "cursor-default",
      )}
      onclick={() => handleIntegrationClick(integration)}
      role={integration.hasPage ? "button" : "presentation"}
    >
      <!-- Logo -->
      <div class="flex items-center justify-center">
        <div class="p-3">
          <img
            src={integration.img_url}
            alt={integration.name}
            class="h-10 brightness-300 saturate-0 transition-colors duration-200 group-hover:brightness-100 group-hover:grayscale-0 group-hover:saturate-100"
          />
        </div>
      </div>

      <!-- Title -->
      <div class="absolute bottom-0 left-0 p-2 text-left">
        <h3
          class="text-foreground group-hover:text-primary-foreground font-serif text-xs font-semibold"
        >
          {integration.name}
        </h3>
      </div>

      <!-- External Link Indicator -->
      {#if integration.hasPage}
        <div
          class="absolute top-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <IconExternalLink class="size-4" />
        </div>
      {/if}
    </div>
  {/each}
</div>
