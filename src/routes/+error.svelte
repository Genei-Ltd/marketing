<script>
  import { page } from "$app/state"
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="flex flex-col items-center p-4">
    <div class="max-w-7xl text-center">
      <h1 class="text-foreground font-bold">Something is not right...</h1>
      <p class="text-muted-foreground py-6 text-2xl">
        There was an error: {page?.error?.message}
      </p>
      <div>
        <a
          href="/"
          class="text-primary-foreground bg-primary hover:bg-primary/90 inline-block rounded-lg px-8 py-3 font-semibold transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  </div>
</div>
