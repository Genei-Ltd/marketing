<script lang="ts">
  import { onMount } from "svelte"
  import { fly, scale, fade } from "svelte/transition"
  import {
    IconPlus,
    IconUser,
    IconMail,
    IconCheck,
    IconLoader,
  } from "@tabler/icons-svelte"
  import { quintOut, backOut } from "svelte/easing"

  // Demo avatars for existing guests
  const existingGuests = [
    {
      name: "Sarah Chen",
      email: "sarah@example.com",
      avatar: "/images/avatars/guest1.png",
    },
    {
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "/images/avatars/guest2.png",
    },
  ]

  let showInitialGuests = $state(false)
  let showAddButton = $state(false)
  let showAddForm = $state(false)
  let typingEmail = $state("")
  let isProcessing = $state(false)
  let showSuccess = $state(false)
  let restart = $state(false)
  let addButtonHover = $state(false)

  const targetEmail = "alex@company.com"
  const newGuest = {
    name: "Alex Rodriguez",
    email: targetEmail,
    avatar: "/images/avatars/guest3.png",
  }

  let currentGuests = $state([...existingGuests])

  // Animation sequence
  $effect(() => {
    if (!restart) {
      // Initial sequence
      setTimeout(() => (showInitialGuests = true), 500)
      setTimeout(() => (showAddButton = true), 1500)

      // Add button hover effect
      setTimeout(() => (addButtonHover = true), 2200)
      setTimeout(() => (addButtonHover = false), 2400)
      setTimeout(() => (showAddForm = true), 2500)

      // Typing animation with variable speed
      setTimeout(() => {
        let i = 0
        const typeInterval = setInterval(
          () => {
            if (i < targetEmail.length) {
              typingEmail = targetEmail.substring(0, i + 1)
              i++
            } else {
              clearInterval(typeInterval)

              // Processing state
              setTimeout(() => {
                isProcessing = true
              }, 600)

              // Success and add guest
              setTimeout(() => {
                isProcessing = false
                showSuccess = true
                currentGuests = [...existingGuests, newGuest]
                showAddForm = false
              }, 1400)

              // Reset success state
              setTimeout(() => {
                showSuccess = false
              }, 2200)

              // Restart the animation
              setTimeout(() => {
                restart = true
              }, 4000)
            }
          },
          Math.random() * 150 + 80,
        ) // Variable typing speed
      }, 3200)
    } else {
      // Reset for restart
      showInitialGuests = false
      showAddButton = false
      showAddForm = false
      typingEmail = ""
      isProcessing = false
      showSuccess = false
      addButtonHover = false
      currentGuests = [...existingGuests]

      setTimeout(() => {
        restart = false
      }, 800)
    }
  })

  onMount(() => {
    // Start animation on mount
  })
</script>

<div
  class="bg-card border-border mx-auto max-w-md rounded-lg border p-6 shadow-lg"
>
  <div class="mb-6">
    <h3 class="text-foreground text-lg font-semibold">Guest Access</h3>
    <p class="text-muted-foreground text-sm">
      Share with external collaborators
    </p>
  </div>

  <!-- Success notification -->
  {#if showSuccess}
    <div
      class="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800"
      in:fly={{ y: -20, duration: 300, easing: backOut }}
      out:fade={{ duration: 200 }}
    >
      <IconCheck class="size-4 text-green-600" />
      <span class="text-sm font-medium">Guest added successfully!</span>
    </div>
  {/if}

  <!-- Existing guests -->
  <div class="space-y-3">
    {#if showInitialGuests}
      {#each currentGuests as guest, i (guest.email)}
        <div
          class="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 rounded-lg p-3 transition-colors"
          in:fly={{ y: -20, duration: 400, delay: i * 150, easing: quintOut }}
        >
          <div class="relative">
            <img
              src={guest.avatar}
              alt={guest.name}
              class="bg-background size-10 rounded-full border-2 border-green-400 shadow-sm"
            />
            {#if i === currentGuests.length - 1 && guest.email === targetEmail}
              <div
                class="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-green-500"
                in:scale={{ duration: 300, easing: backOut }}
              ></div>
            {/if}
          </div>
          <div class="flex-1">
            <div class="text-foreground text-sm font-medium">{guest.name}</div>
            <div class="text-muted-foreground text-xs">{guest.email}</div>
          </div>
          <div
            class="flex items-center gap-1 text-xs font-medium text-green-600"
          >
            <IconUser class="size-3" />
            Guest
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Add new guest animation -->
  <div class="mt-6">
    {#if showAddButton && !showAddForm}
      <div
        class="border-border text-muted-foreground flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-all duration-300 {addButtonHover
          ? 'border-primary text-primary bg-primary/5 scale-[1.02]'
          : ''}"
        in:fade={{ duration: 400 }}
      >
        <IconPlus class="size-4" />
        Add guest
      </div>
    {/if}

    {#if showAddForm}
      <div
        class="border-border bg-background/50 space-y-4 rounded-lg border p-4 backdrop-blur-sm"
        in:scale={{ duration: 300, easing: backOut }}
      >
        <div class="flex items-center gap-3">
          <IconMail class="text-muted-foreground size-4" />
          <div
            class="bg-background border-border text-foreground focus-within:ring-primary/20 relative flex-1 rounded border px-3 py-2 text-sm focus-within:ring-2"
          >
            <span class="font-mono">{typingEmail}</span>
            <span class="text-primary animate-pulse">|</span>
            {#if typingEmail.length > 0}
              <div class="absolute top-2 right-2">
                <div
                  class="flex size-4 items-center justify-center rounded-full bg-green-100 text-green-600"
                >
                  <IconCheck class="size-3" />
                </div>
              </div>
            {/if}
          </div>
        </div>

        <div class="flex gap-3">
          <div
            class="bg-primary text-primary-foreground hover:bg-primary/90 relative flex-1 overflow-hidden rounded px-4 py-2 text-center text-sm font-medium transition-colors"
          >
            {#if isProcessing}
              <div class="flex items-center justify-center gap-2">
                <IconLoader class="size-4 animate-spin" />
                Processing...
              </div>
            {:else}
              Add Guest
            {/if}
          </div>
          <div
            class="border-border text-muted-foreground hover:bg-muted/50 rounded border px-4 py-2 text-center text-sm transition-colors"
          >
            Cancel
          </div>
        </div>

        {#if typingEmail.length > 0 && !isProcessing}
          <div class="text-muted-foreground flex items-center gap-2 text-xs">
            <div class="size-2 rounded-full bg-green-100"></div>
            Valid email format
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
