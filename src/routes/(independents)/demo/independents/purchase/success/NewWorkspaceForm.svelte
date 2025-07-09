<!-- @migration-task Error while migrating Svelte code: Cannot subscribe to stores that are not declared at the top level of the component
https://svelte.dev/e/store_invalid_scoped_subscription -->
<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte"
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card"

  import { page } from "$app/stores"
  import type { WorkspaceFormData } from "$lib/schemas/workspace"
  import { workspaceSchema } from "$lib/schemas/workspace"
  import * as Icons from "@tabler/icons-svelte"
  import { createEventDispatcher } from "svelte"
  import { cubicOut } from "svelte/easing"
  import { fade, fly, scale } from "svelte/transition"
  import type { FormResult, SuperValidated } from "sveltekit-superforms"
  import { superForm } from "sveltekit-superforms"
  import { zodClient } from "sveltekit-superforms/adapters"
  import type { ActionData } from "../$types"

  export let data: SuperValidated<WorkspaceFormData>

  const dispatch = createEventDispatcher()

  // Initialize Superforms
  const { form, errors, enhance, submitting, message } = superForm(data, {
    validators: zodClient(workspaceSchema),
    resetForm: false,
    clearOnSubmit: "none",
    onUpdate({ form, result }) {
      const action = result.data as FormResult<ActionData>
      if (form.valid) {
        console.log("ACTION", result)
      }
    },

    onUpdated: ({ form }) => {
      if (form.valid && form.message?.success) {
        dispatch("success", form.message.workspaceId)
      }
      if (!form.valid) {
        console.log("INVALID", message, form, errors)
      }
    },

    onError({ result }) {
      console.log("ERROR", result)
      $message = result.error.message || "Unknown error"
    },
  })

  // Custom enhance function to handle file uploads
  const customEnhance = (form: HTMLFormElement) => {
    return enhance(form, {
      onSubmit: ({ formData }) => {
        // Ensure the logo file is properly attached to the form data
        if (logoFile) {
          formData.set("logo", logoFile)
          console.log(
            "Logo file attached to form:",
            logoFile.name,
            logoFile.size,
          )
        } else {
          console.log("No logo file to attach")
        }
      },
    })
  }

  // File upload state
  let logoFile: File | null = null
  let logoPreview: string | null = null
  let logoError: string | null = null

  // File upload handling
  function handleLogoUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    logoError = null

    if (file) {
      // Validate file
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ]
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!allowedTypes.includes(file.type)) {
        logoError = "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
        logoFile = null
        logoPreview = null
        target.value = ""
        return
      }

      if (file.size > maxSize) {
        logoError = "File size must be less than 10MB"
        logoFile = null
        logoPreview = null
        target.value = ""
        return
      }

      logoFile = file

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        logoPreview = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  function removeLogo() {
    logoFile = null
    logoPreview = null
    logoError = null
    const fileInput = document.getElementById("logo") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  //   // Members management
  //   function addMember() {
  //     $form.members = [
  //       ...$form.members,
  //       { email: "", name: "", role: "basic_member" },
  //     ]
  //   }

  //   function removeMember(index: number) {
  //     $form.members = $form.members.filter((_, i) => i !== index)
  //   }
</script>

<div
  class="max-w-4xl mx-auto h-full flex flex-col justify-center items-center w-full py-8"
>
  <!-- Header -->
  <div
    class="text-center mb-8"
    in:fly={{ y: -20, duration: 600, easing: cubicOut, delay: 100 }}
  >
    <h1 class="text-4xl font-bold text-foreground mb-4">
      Create Your CoLoop Workspace
    </h1>
    <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
      Set up your new workspace where your team can collaborate effectively.
      You'll be added as the admin automatically.
    </p>
  </div>

  <!-- Main Form -->
  <div
    class="w-full"
    in:scale={{ duration: 400, easing: cubicOut, delay: 200 }}
  >
    <Card class="shadow-lg">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Icons.IconBuilding class="w-5 h-5" />
          Workspace Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          method="POST"
          action="?/createWorkspace"
          enctype="multipart/form-data"
          class="space-y-6"
          use:customEnhance
        >
          <input
            type="hidden"
            name="pageData"
            value={JSON.stringify($page.data.sessionData)}
          />
          <!-- <input
            type="hidden"
            name="members"
            value={JSON.stringify($form.members)}
          /> -->

          <!-- Workspace Name -->
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-foreground">
              Workspace Name <span class="text-destructive">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              bind:value={$form.name}
              placeholder="e.g. Acme Research Team"
              class="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors {$errors.name
                ? 'border-destructive'
                : ''}"
              required
            />
            {#if $errors.name}
              <p class="text-sm text-destructive" in:fade={{ duration: 200 }}>
                {$errors.name}
              </p>
            {/if}
            {#if $form.name.length > 0}
              <p class="text-xs text-muted-foreground text-right">
                {$form.name.length}/256
              </p>
            {/if}
          </div>

          <!-- Workspace Slug -->
          <!-- <div class="space-y-2">
            <label for="slug" class="block text-sm font-medium text-foreground">
              Workspace URL (Auto-generated)
            </label>
            <div class="flex items-center">
              <span
                class="pl-3 pr-2 py-3 bg-muted border border-r-0 border-border rounded-l-lg text-sm text-muted-foreground font-mono"
              >
                app.coloop.ai/
              </span>
              <span
                class="flex-1 px-4 py-3 border border-border rounded-r-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm font-mono"
              >
                {generateSlug($form.name) || "acme-research-team"}
              </span>
            </div>
            {#if $errors.workspaceSlug}
              <p class="text-sm text-destructive" in:fade={{ duration: 200 }}>
                {$errors.workspaceSlug}
              </p>
            {:else}
              <p class="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            {/if}
          </div> -->

          <!-- Admin Details -->
          <div class="border-t pt-6">
            <h3
              class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"
            >
              <Icons.IconUserCheck class="w-5 h-5" />
              Admin Details (You)
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="space-y-2">
                <label
                  for="adminEmail"
                  class="block text-sm font-medium text-foreground"
                >
                  Your Email <span class="text-destructive">*</span>
                </label>
                <input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  bind:value={$form.adminEmail}
                  placeholder="your.email@company.com"
                  class="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors {$errors.adminEmail
                    ? 'border-destructive'
                    : ''}"
                  required
                />
                {#if $errors.adminEmail}
                  <p
                    class="text-sm text-destructive"
                    in:fade={{ duration: 200 }}
                  >
                    {$errors.adminEmail}
                  </p>
                {/if}
              </div>

              <div class="space-y-2">
                <label
                  for="adminName"
                  class="block text-sm font-medium text-foreground"
                >
                  Your Name
                </label>
                <input
                  id="adminName"
                  name="adminName"
                  type="text"
                  bind:value={$form.adminName}
                  placeholder="John Doe"
                  class="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
                {#if $errors.adminName}
                  <p
                    class="text-sm text-destructive"
                    in:fade={{ duration: 200 }}
                  >
                    {$errors.adminName}
                  </p>
                {/if}
              </div>
            </div>
            <!-- section on how to add aditional team members -->
            <h3
              class="text-lg font-semibold text-foreground flex items-center gap-2"
            >
              <Icons.IconInfoCircle class="w-5 h-5" />
              How do I add additional team members?
            </h3>
            <p class="text-sm text-muted-foreground gap-2 ml-7">
              You can add additional team members in the admin panel, after your
              workspace is created.
              <a
                href="https://docs.coloop.ai/docs/admins/adding-users"
                target="_blank"
                class="text-primary hover:text-semibold hover:underline"
              >
                find out more here
              </a>
              .
            </p>
          </div>

          <!-- Logo Upload -->
          <div class="border-t pt-6">
            <h3
              class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"
            >
              <Icons.IconPhoto class="w-5 h-5" />
              Workspace Logo (Optional)
            </h3>

            <div class="space-y-4">
              {#if logoPreview}
                <div class="flex items-center gap-4">
                  <div
                    class="w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted"
                  >
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium">{logoFile?.name}</p>
                    <p class="text-xs text-muted-foreground">
                      {logoFile
                        ? (logoFile.size / 1024 / 1024).toFixed(2)
                        : "0"} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    on:click={removeLogo}
                  >
                    <Icons.IconX class="w-4 h-4" />
                  </Button>
                </div>
              {:else}
                <div
                  class="border-2 border-dashed border-border rounded-lg p-6 text-center"
                >
                  <Icons.IconUpload
                    class="w-8 h-8 mx-auto mb-2 text-muted-foreground"
                  />
                  <label for="logo" class="cursor-pointer">
                    <span
                      class="text-sm font-medium text-primary hover:text-primary/80"
                    >
                      Click to upload
                    </span>
                    <span class="text-sm text-muted-foreground">
                      or drag and drop</span
                    >
                    <input
                      id="logo"
                      name="logo"
                      type="file"
                      accept="image/*"
                      on:change={handleLogoUpload}
                      class="sr-only"
                    />
                  </label>
                  <p class="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF, WebP up to 10MB
                  </p>
                </div>
              {/if}

              {#if logoError}
                <p class="text-sm text-destructive" in:fade={{ duration: 200 }}>
                  {logoError}
                </p>
              {/if}
            </div>
          </div>

          <!-- Additional Members -->
          <!-- <div class="border-t pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3
                class="text-lg font-semibold text-foreground flex items-center gap-2"
              >
                <Icons.IconUsers class="w-5 h-5" />
                Team Members (Optional)
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                on:click={addMember}
              >
                <Icons.IconPlus class="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>

            {#if $form.members.length === 0}
              <p
                class="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg"
              >
                No additional members added. You can invite team members later.
              </p>
            {:else}
              <div class="space-y-3">
                {#each $form.members as member, index (index)}
                  <div
                    class="flex items-center gap-3 p-4 border border-border rounded-lg"
                    in:scale={{ duration: 300, easing: cubicOut }}
                  >
                    <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="email"
                        placeholder="email@company.com"
                        bind:value={member.email}
                        class="px-3 py-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Full Name"
                        bind:value={member.name}
                        class="px-3 py-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <select
                        bind:value={member.role}
                        class="px-3 py-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="basic_member">Member</option>
                        <option value="admin">Admin</option>
                      </select>

                      {#if $errors.members?.[index]?.email}
                        <p class="text-sm text-destructive">
                          {$errors.members?.[index]?.email}
                        </p>
                      {/if}
                      {#if $errors.members?.[index]?.name}
                        <p class="text-sm text-destructive">
                          {$errors.members?.[index]?.name}
                        </p>
                      {/if}
                      {#if $errors.members?.[index]?.role}
                        <p class="text-sm text-destructive">
                          {$errors.members?.[index]?.role}
                        </p>
                      {/if}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      on:click={() => removeMember(index)}
                    >
                      <Icons.IconX class="w-4 h-4" />
                    </Button>
                  </div>
                {/each}
              </div>
            {/if}
          </div> -->

          <!-- Submit Button -->
          <div class="pt-6 border-t">
            <Button
              type="submit"
              disabled={$submitting || $message?.error}
              class="w-full h-12 text-lg font-semibold"
            >
              {#if $submitting}
                <Icons.IconLoader class="w-5 h-5 mr-2 animate-spin" />
                Creating Workspace...
              {:else}
                <Icons.IconRocket class="w-5 h-5 mr-2" />
                Create Workspace
              {/if}
            </Button>

            {#if $message}
              <p
                class="text-sm text-destructive text-center mt-3"
                in:fade={{ duration: 200 }}
              >
                {$message}
              </p>
            {/if}
            <!-- {#if $errors}
              <p
                class="text-sm text-destructive text-center mt-3"
                in:fade={{ duration: 200 }}
              >
                {JSON.stringify($errors, null, 2)}
              </p>
            {/if} -->
            <!-- {#if $form.valid === false && $form.message?.error}
              <p
                class="text-sm text-muted-foreground text-center mt-3"
                in:fade={{ duration: 200 }}
              >
                {$form.valid}
              </p>
            {/if} -->
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- <div class="mt-8 text-center" in:fade={{ duration: 400, delay: 600 }}>
      <SuperDebug data={$form} />
    </div> -->
  </div>

  <!-- Progress indicator -->
  <div
    class="mt-8 text-center flex flex-col items-center justify-center gap-2 w-full"
    in:fade={{ duration: 400, delay: 600 }}
  >
    <p class="text-sm text-muted-foreground font-semibold mb-1">Step 3 of 3</p>
    <div class="flex flex-row items-center justify-center gap-2 w-full">
      <div
        class="w-full h-2 bg-primary rounded-full border border-primary"
      ></div>
      <div
        class="w-full h-2 bg-primary rounded-full border border-primary"
      ></div>
      <div
        class="w-full h-2 bg-primary/80 rounded-full animate-pulse border border-primary"
      ></div>
    </div>
  </div>
</div>
