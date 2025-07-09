<script lang="ts">
  import { browser } from "$app/environment"
  import { goto } from "$app/navigation"
  import TestimonialFeatured from "$components/TestimonialFeatured.svelte"
  import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "$env/static/public"
  import { Marquee } from "@selemondev/svelte-marquee"
  import { onMount } from "svelte"

  let clerkPubKey = PUBLIC_CLERK_PUBLISHABLE_KEY

  onMount(async () => {
    if (browser) {
      const ClerkJS = await import("@clerk/clerk-js")
      const clerk = new ClerkJS.Clerk(clerkPubKey)

      await clerk.load()

      if (clerk.user) {
        // User is already logged in, redirect to billing
        goto("/billing")
      } else {
        document.getElementById("clerk-container")!.innerHTML = `
    <div id="sign-in"></div>
    `

        const signInDiv: HTMLDivElement = document.getElementById(
          "sign-in",
        ) as HTMLDivElement

        clerk.mountSignIn(signInDiv!, {
          forceRedirectUrl: "/billing",
        })
      }
    }
  })

  let { data } = $props()
</script>

<div
  class="grid grid-cols-1 lg:grid-cols-2 items-center justify-center h-screen bg-background overflow-hidden w-screen max-w-screen"
>
  <div
    class="flex flex-col items-center justify-center h-full w-full bg-background col-span-1"
  >
    <h1 class="text-2xl font-bold mb-2">Sign in to your CoLoop account</h1>
    <p class="text-sm text-muted-foreground mb-8">
      Sign in to your account to continue
    </p>
    <div id="clerk-container"></div>
  </div>
  <div
    class=" flex-col hidden lg:flex items-center justify-between p-8 h-full w-full bg-linear-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground"
  >
    <div class="flex flex-col w-full">
      <img src="/logos/white.png" alt="CoLoop" class="h-12 self-start mb-2" />
      <p class="text-md text-primary-foreground font-semibold">
        Insight to Influence.
      </p>
    </div>

    <div
      class="flex flex-col w-full max-w-3xl h-1/3 mx-auto items-center justify-center"
    >
      <TestimonialFeatured testimonial={data.testimonials[0]} />
    </div>

    <div class="flex flex-col items-center justify-center w-full">
      <p class="text-sm mb-8 font-bold uppercase tracking-wide text-muted/50">
        Trusted by teams at
      </p>
      <Marquee class="w-full " fade>
        <div class="flex flex-row gap-8">
          {#each Array(15) as _, index}
            <img
              src={`/customer-logos/${index + 1}.png`}
              alt={`Customer ${index}`}
              class="h-8 saturate-0 brightness-0 mx-auto"
            />
          {/each}
        </div>
      </Marquee>
      <!-- <div class="grid grid-cols-5 gap-4 items-center justify-center">
        {#each Array(15) as _, index}
          <img
            src={`/customer-logos/${index + 1}.png`}
            alt={`Customer ${index}`}
            class="h-6 saturate-0 brightness-0 mx-auto"
          />
        {/each}
      </div> -->
    </div>
  </div>
</div>

<!-- <script lang="ts">
  import { SignedIn, SignedOut, SignInButton, UserButton } from "svelte-clerk"
</script>

<div
  class="flex flex-col items-center justify-center h-full w-full my-8 flex-1"
>
  <SignedOut>
    <SignInButton />
  </SignedOut>
  <SignedIn>
    <UserButton />
  </SignedIn>
</div> -->
