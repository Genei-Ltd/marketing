<script lang="ts">
	import { IconFileText, IconBrain, IconCheck, IconAlertTriangle } from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fade, fly, scale } from "svelte/transition"
	import { quintOut } from "svelte/easing"

	import { Card, CardContent, CardHeader } from "$lib/components/ui/card"

	let show = $state(false)
	let showAnalyzing = $state(false)
	let showProgress = $state(false)
	let showFiles = $state(false)
	let showInsight = $state(false)
	let showComplete = $state(false)
	let progress = $state(0)
	let typedText = $state("")
	let currentFileIndex = $state(0)

	const mainText = "I've analyzed your physician interviews. Here are the findings:"
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
	<div in:fade={{ duration: 600 }} class="w-full max-w-lg mx-auto">
		<Card class="shadow-black/10 overflow-hidden bg-white border-0 shadow-2xl">
			<CardHeader class="border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 border-b">
				<div class="flex items-center gap-4">
					<div class="relative">
						<div
							class="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center w-12 h-12 shadow-lg">
							{#if showAnalyzing}
								<div
									in:scale={{ duration: 400, easing: quintOut }}
									class="absolute inset-0 flex items-center justify-center">
									<IconBrain class="w-6 h-6 text-white" />
								</div>
							{:else}
								<span class="text-lg font-bold text-white">PI</span>
							{/if}
						</div>

						{#if showAnalyzing && !showComplete}
							<div class="-inset-2 animate-pulse rounded-xl bg-blue-500/20 absolute"></div>
						{/if}
					</div>

					<div class="flex-1">
						<h2 class="text-slate-900 text-2xl font-bold">PharmaInsight</h2>
						{#if showAnalyzing && !showComplete}
							<p in:fade class="text-sm font-medium text-blue-600">Analyzing interviews...</p>
						{/if}
					</div>
				</div>

				{#if showProgress && !showComplete}
					<div in:fly={{ y: 10, duration: 400 }} class="mt-6">
						<div class="flex items-center justify-between mb-2">
							<span class="text-slate-600 text-sm font-medium">Processing</span>
							<span class="text-sm font-bold text-blue-600">{progress}%</span>
						</div>
						<div class="bg-slate-200 h-2 overflow-hidden rounded-full">
							<div
								class="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-100 ease-out rounded-full"
								style="width: {progress}%">
							</div>
						</div>
					</div>
				{/if}

				{#if showComplete}
					<div
						in:scale={{ duration: 500, easing: quintOut }}
						class="bg-green-50 flex items-center gap-2 px-3 py-2 mt-4 border border-green-200 rounded-lg">
						<IconCheck class="w-4 h-4 text-green-600" />
						<span class="text-sm font-semibold text-green-700">Analysis Complete</span>
					</div>
				{/if}

				{#if typedText}
					<div in:fade class="mt-6">
						<p class="text-slate-700 text-base leading-relaxed">
							{typedText}
							<span class="animate-pulse text-blue-600">|</span>
						</p>
					</div>
				{/if}
			</CardHeader>

			<CardContent class="p-6">
				{#if showFiles}
					<div in:fly={{ y: 20, duration: 500, easing: quintOut }}>
						<div class="flex items-center justify-between mb-6">
							<h3 class="text-slate-900 text-xl font-bold">142 Interview Files</h3>
							<div
								class="bg-green-50 flex items-center gap-2 px-3 py-1 border border-green-200 rounded-full">
								<div class="w-2 h-2 bg-green-500 rounded-full"></div>
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
										class="group rounded-xl border-slate-200 hover:border-blue-200 hover:shadow-md relative p-4 transition-all duration-300 bg-white border">
										<div class="flex items-center gap-4">
											<div
												class="bg-blue-50 flex items-center justify-center w-10 h-10 border border-blue-100 rounded-lg">
												<IconFileText class="w-5 h-5 text-blue-600" />
											</div>
											<div class="flex-1 min-w-0">
												<h4 class="text-slate-900 font-medium truncate">
													{file}
												</h4>
												<div class="flex items-center gap-2 mt-1">
													<div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
													<span class="text-slate-500 text-xs font-medium">Processed</span>
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
						in:fly={{ y: 30, duration: 800, easing: quintOut }}
						class="rounded-xl border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 relative p-6 mt-8 border-2 shadow-lg">
						<div
							class="rounded-l-xl bg-gradient-to-b from-amber-400 to-orange-500 absolute top-0 bottom-0 left-0 w-1">
						</div>

						<div class="flex items-start gap-4">
							<div
								class="border-amber-200 bg-amber-100 flex items-center justify-center w-10 h-10 border rounded-lg">
								<IconAlertTriangle class="text-amber-600 w-5 h-5" />
							</div>
							<div class="flex-1">
								<h4 class="text-amber-800 mb-3 text-lg font-bold">Key Insight</h4>
								<p class="text-slate-700 leading-relaxed">
									<span class="font-bold text-red-600">3 physicians</span>
									expressed significant
									<span class="font-bold text-red-600">adherence concerns</span>, citing complex
									dosing schedules and potential side effects
								</p>
							</div>
						</div>

						<div class="flex items-center gap-3 mt-5">
							<div class="flex items-center gap-1">
								{#each [1, 2, 3] as dot}
									<div
										in:scale={{ duration: 300, delay: dot * 100 }}
										class="w-2 h-2 bg-red-500 rounded-full">
									</div>
								{/each}
							</div>
							<span class="text-sm font-bold tracking-wide text-red-600 uppercase">High Priority</span>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
{/if}
