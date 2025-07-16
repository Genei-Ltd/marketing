<script lang="ts">
  import { onMount } from "svelte"
  import { fade, fly, scale } from "svelte/transition"
  import { quintOut, backOut, elasticOut } from "svelte/easing"
  import { Card, CardContent, CardHeader } from "$lib/components/ui/card"
  import {
    IconFileText,
    IconBrain,
    IconCheck,
    IconAlertTriangle,
  } from "@tabler/icons-svelte"

  let show = $state(false)
  let showAnalyzing = $state(false)
  let showProgress = $state(false)
  let showFiles = $state(false)
  let showInsight = $state(false)
  let showComplete = $state(false)
  let progress = $state(0)
  let typedText = $state("")
  let currentFileIndex = $state(0)

  const mainText =
    "I've analyzed your physician interviews. Here are the findings:"
  const files = [
    "Oncologist Interview - Dr. Sarah Chen.pdf",
    "Cardiologist Interview - Dr. Michael Rodriguez.pdf",
    "Neurologist Interview - Dr. Emily Watson.pdf",
  ]

  // Typing animation function
  function typeText(text: string, callback?: () => void) {
    typedText = ""
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        typedText += text[i]
        i++
      } else {
        clearInterval(timer)
        if (callback) callback()
      }
    }, 30)
  }

  // Progress animation
  function animateProgress() {
    const duration = 2000
    const steps = 100
    const stepDuration = duration / steps
    let currentProgress = 0

    const timer = setInterval(() => {
      currentProgress += 1
      progress = currentProgress

      if (currentProgress >= 100) {
        clearInterval(timer)
        setTimeout(() => {
          showComplete = true
          setTimeout(() => (showFiles = true), 300)
        }, 200)
      }
    }, stepDuration)
  }

  onMount(() => {
    const sequence = setTimeout(() => {
      show = true

      setTimeout(() => {
        showAnalyzing = true
        setTimeout(() => {
          showProgress = true
          animateProgress()
        }, 800)
      }, 500)

      setTimeout(() => {
        typeText(mainText, () => {
          setTimeout(() => (showInsight = true), 800)
        })
      }, 4000)
    }, 300)

    return () => clearTimeout(sequence)
  })

  // File animation with staggered effect
  $effect(() => {
    if (showFiles) {
      files.forEach((_, index) => {
        setTimeout(() => {
          currentFileIndex = index + 1
        }, index * 400)
      })
    }
  })
</script>

{#if show}
  <div in:fade={{ duration: 600 }} class="mx-auto w-full max-w-lg">
    <Card class="overflow-hidden border-0 bg-white shadow-2xl shadow-black/10">
      <CardHeader
        class="border-b border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50"
      >
        <div class="flex items-center gap-4">
          <div class="relative">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg"
            >
              {#if showAnalyzing}
                <div
                  in:scale={{ duration: 400, easing: backOut }}
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <IconBrain class="h-6 w-6 text-white" />
                </div>
              {:else}
                <span class="text-lg font-bold text-white">PI</span>
              {/if}
            </div>

            {#if showAnalyzing && !showComplete}
              <div
                class="absolute -inset-2 animate-pulse rounded-xl bg-blue-500/20"
              ></div>
            {/if}
          </div>

          <div class="flex-1">
            <h2 class="text-2xl font-bold text-slate-900">PharmaInsight</h2>
            {#if showAnalyzing && !showComplete}
              <p in:fade class="text-sm font-medium text-blue-600">
                Analyzing interviews...
              </p>
            {/if}
          </div>
        </div>

        {#if showProgress && !showComplete}
          <div in:fly={{ y: 10, duration: 400 }} class="mt-6">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium text-slate-600">Processing</span>
              <span class="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-100 ease-out"
                style="width: {progress}%"
              ></div>
            </div>
          </div>
        {/if}

        {#if showComplete}
          <div
            in:scale={{ duration: 500, easing: elasticOut }}
            class="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2"
          >
            <IconCheck class="h-4 w-4 text-green-600" />
            <span class="text-sm font-semibold text-green-700"
              >Analysis Complete</span
            >
          </div>
        {/if}

        {#if typedText}
          <div in:fade class="mt-6">
            <p class="text-base leading-relaxed text-slate-700">
              {typedText}
              <span class="animate-pulse text-blue-600">|</span>
            </p>
          </div>
        {/if}
      </CardHeader>

      <CardContent class="p-6">
        {#if showFiles}
          <div in:fly={{ y: 20, duration: 500, easing: quintOut }}>
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-xl font-bold text-slate-900">
                142 Interview Files
              </h3>
              <div
                class="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1"
              >
                <div class="h-2 w-2 rounded-full bg-green-500"></div>
                <span class="text-sm font-medium text-green-700">Active</span>
              </div>
            </div>

            <div class="space-y-3">
              {#each files as file, i}
                {#if i < currentFileIndex}
                  <div
                    in:fly={{
                      x: -20,
                      duration: 600,
                      delay: i * 200,
                      easing: quintOut,
                    }}
                    class="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-200 hover:shadow-md"
                  >
                    <div class="flex items-center gap-4">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50"
                      >
                        <IconFileText class="h-5 w-5 text-blue-600" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <h4 class="truncate font-medium text-slate-900">
                          {file}
                        </h4>
                        <div class="mt-1 flex items-center gap-2">
                          <div
                            class="h-1.5 w-1.5 rounded-full bg-green-500"
                          ></div>
                          <span class="text-xs font-medium text-slate-500"
                            >Processed</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}

        {#if showInsight}
          <div
            in:fly={{ y: 30, duration: 800, easing: backOut }}
            class="relative mt-8 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg"
          >
            <div
              class="absolute top-0 bottom-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-amber-400 to-orange-500"
            ></div>

            <div class="flex items-start gap-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-200 bg-amber-100"
              >
                <IconAlertTriangle class="h-5 w-5 text-amber-600" />
              </div>
              <div class="flex-1">
                <h4 class="mb-3 text-lg font-bold text-amber-800">
                  Key Insight
                </h4>
                <p class="leading-relaxed text-slate-700">
                  <span class="font-bold text-red-600">3 physicians</span>
                  expressed significant
                  <span class="font-bold text-red-600">adherence concerns</span
                  >, citing complex dosing schedules and potential side effects
                </p>
              </div>
            </div>

            <div class="mt-5 flex items-center gap-3">
              <div class="flex items-center gap-1">
                {#each [1, 2, 3] as dot}
                  <div
                    in:scale={{ duration: 300, delay: dot * 100 }}
                    class="h-2 w-2 rounded-full bg-red-500"
                  ></div>
                {/each}
              </div>
              <span
                class="text-sm font-bold tracking-wide text-red-600 uppercase"
                >High Priority</span
              >
            </div>
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
{/if}
