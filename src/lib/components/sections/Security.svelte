<script lang="ts">
  import {
    IconShield,
    IconLock,
    IconUserCheck,
    IconDatabase,
    IconExternalLink,
    IconShieldCheck,
    IconShieldLock,
    IconClockShield,
    IconLockAccess,
    IconPlus,
  } from "@tabler/icons-svelte"

  import { cn } from "$lib/utils.js"

  // Security certifications with logos
  const certifications = [
    {
      name: "SOC2",
      image: "/security/soc-2.png",
      link: "https://trust.coloop.ai/doc?s=9u0fwagr3r3hvjfcypwus2",
    },
    {
      name: "SOC1",
      image: "/security/soc-1.png",
      link: "https://trust.coloop.ai/doc?s=l6qlmwfk06wjebs23sp8qx",
    },
    {
      name: "OTHER",
      image: "/security/soc-1.png",
      link: "https://trust.coloop.ai/",
    },
    {
      name: "GDPR",
      image: "/security/gdpr.svg",
      link: "https://trust.coloop.ai/",
    },
  ]

  // Security features with icons
  const features = [
    {
      icon: IconShield,
      title: "No training on your data",
    },
    {
      icon: IconLock,
      title: "Modern & secure data practices",
    },
    {
      icon: IconDatabase,
      title: "End to end encryption",
    },
    {
      icon: IconUserCheck,
      title: "Audited & tested",
    },
  ]
</script>

<div class="relative mx-auto max-w-7xl border border-dashed">
  <!-- Section Header -->
  <div class="absolute -translate-x-1/2 -translate-y-1/2 opacity-80">
    <IconPlus class="text-foreground h-5 w-5" />
  </div>
  <div
    class="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 opacity-80"
  >
    <IconPlus class="text-foreground h-5 w-5" />
  </div>
  <div
    class="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 opacity-80"
  >
    <IconPlus class="text-foreground h-5 w-5" />
  </div>
  <div
    class="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 opacity-80"
  >
    <IconPlus class="text-foreground h-5 w-5" />
  </div>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
    <!-- Left Column - Content -->
    <div
      class=" flex h-full flex-col items-start justify-between space-y-8 p-8"
    >
      <div class="mb-12 flex w-full flex-row items-center justify-start gap-4">
        <div class="bg-primary p-2">
          <IconLock class="text-primary-foreground h-6 w-6" />
        </div>
        <h2 class="text-foreground font-serif text-lg">Security</h2>
      </div>
      <div class="space-y-6">
        <div>
          <h3
            class="text-foreground mb-4 font-serif text-4xl font-medium leading-tight"
          >
            Enterprise Grade Security
          </h3>
          <span class="text-foreground text-lg"
            >Trusted by the largest global brands and agencies</span
          >
        </div>

        <!-- Features List -->
        {#each features as feature}
          <div class="flex h-3 items-center space-x-2 opacity-70">
            <div class="flex h-4 w-4 items-center justify-center">
              <svelte:component
                this={feature.icon}
                class="text-foreground h-4 w-4"
              />
            </div>
            <span class="text-foreground text-sm">{feature.title}</span>
          </div>
        {/each}
      </div>

      <!-- Call to Action -->
      <div class="pt-4">
        <a
          href="https://trust.coloop.ai/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-card-foreground hover:text-primary bg-card inline-flex items-center p-2 px-4 text-sm transition-colors duration-200 hover:underline"
        >
          Trust Center
          <IconExternalLink class="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>

    <!-- Right Column - Certifications Grid -->
    <div class="flex items-center justify-end">
      <div
        class="grid grid-cols-2 divide-x divide-y divide-dashed border-l border-dashed"
      >
        {#each certifications as cert}
          <a
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            class=""
          >
            <div
              class="hover:bg-primary/5 group relative flex h-64 w-64 items-center justify-center border-r-0 p-4 transition-all duration-200 hover:shadow-lg"
            >
              <img
                src={cert.image}
                alt={cert.name}
                class="h-32 w-fit object-contain grayscale transition-opacity duration-200 group-hover:grayscale-0"
              />
              <span
                class="text-foreground absolute bottom-0 left-0 p-2 font-mono text-sm font-semibold"
              >
                {cert.name}
              </span>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </div>
</div>
