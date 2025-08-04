<script lang="ts">
	import {
		IconMessageQuestion,
		IconChartBar,
		IconCheck,
		IconLoader,
		IconTags,
		IconMicrophone,
		IconMovie,
	} from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"

	// ============================================================================
	// ANIMATION CONTROLLER (unchanged)
	// ============================================================================

	type AnimationState = "idle" | "running" | "completed" | "cancelled" | "error"

	class AnimationController {
		private abortController = new AbortController()
		private cleanupFunctions: Array<() => void> = []
		public state: AnimationState = "idle"

		get signal() {
			return this.abortController.signal
		}

		get isActive() {
			return this.state === "running"
		}

		addCleanup(cleanup: () => void) {
			this.cleanupFunctions.push(cleanup)
		}

		cancel() {
			this.state = "cancelled"
			this.abortController.abort()
			this.cleanup()
		}

		private cleanup() {
			this.cleanupFunctions.forEach((fn) => {
				try {
					fn()
				} catch (err) {
					console.warn("Cleanup function failed:", err)
				}
			})
			this.cleanupFunctions = []
		}

		async execute<T>(animationFn: (controller: this) => Promise<T>): Promise<T> {
			if (this.state === "running") {
				throw new Error("Animation already running")
			}

			this.state = "running"

			try {
				const result = await animationFn(this)
				this.state = "completed"
				return result
			} catch (err) {
				if (this.signal.aborted) {
					this.state = "cancelled"
				} else {
					this.state = "error"
				}
				throw err
			} finally {
				this.cleanup()
			}
		}

		delay(ms: number): Promise<void> {
			return new Promise((resolve, reject) => {
				if (this.signal.aborted) {
					reject(new Error("Animation cancelled"))
					return
				}

				const timeoutId = setTimeout(resolve, ms)
				this.addCleanup(() => clearTimeout(timeoutId))
				this.signal.addEventListener("abort", () => {
					clearTimeout(timeoutId)
					reject(new Error("Animation cancelled"))
				})
			})
		}
	}

	// ============================================================================
	// INTERVIEW ANALYSIS DATA MODELS
	// ============================================================================

	type InterviewFile = {
		id: string
		name: string
		duration: string
		type: "video" | "audio"
		icon: string
	}

	type Speaker = {
		id: string
		name: string
		role: string
		color: string
	}

	type AnalysisRow = {
		file: InterviewFile
		speakers: Speaker[]
		answer: {
			text: string
			animatedLength: number
			sentiment: "positive" | "negative" | "neutral"
			keyThemes: string[]
		}
	}

	type SummaryInsight = {
		theme: string
		count: number
		percentage: number
		sentiment: "positive" | "negative" | "neutral"
		examples: string[]
	}

	// Animation state
	let animationState = $state({
		// Table setup
		analysisRows: <AnalysisRow[]>[],
		showTable: false,

		// Question animation
		questionText: "",
		questionComplete: false,

		// Answer animations
		answerAnimations: <{ [key: string]: boolean }>{},

		// Summary step
		summaryInsights: <SummaryInsight[]>[],
		chartData: <{ theme: string; value: number; color: string }[]>[],
		showChart: false,

		currentStepId: "",
		isComplete: false,
	})

	function resetAnimationState(stepId?: string) {
		// Only reset what's needed for each specific step
		if (stepId === "table-setup") {
			// Full reset for first step
			animationState.analysisRows = []
			animationState.showTable = false
			animationState.questionText = ""
			animationState.questionComplete = false
			animationState.answerAnimations = {}
			animationState.summaryInsights = []
			animationState.chartData = []
			animationState.showChart = false
		} else if (stepId === "parallel-answers") {
			// Keep table data, reset only answer animations
			animationState.answerAnimations = {}
			animationState.summaryInsights = []
			animationState.chartData = []
			animationState.showChart = false
			// Reset answer lengths for re-animation
			animationState.analysisRows = animationState.analysisRows.map((row) => ({
				...row,
				answer: {
					...row.answer,
					animatedLength: 0,
				},
			}))
		} else if (stepId === "summary-visualization") {
			// Keep everything, reset only summary data
			animationState.summaryInsights = []
			animationState.chartData = []
			animationState.showChart = false
		}

		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const interviewFiles: InterviewFile[] = [
		{
			id: "int1",
			name: "customer-interview-sarah.mp4",
			duration: "15:34",
			type: "video",
			icon: "/icons/mp4.png",
		},
		{
			id: "int2",
			name: "focus-group-session.wav",
			duration: "28:12",
			type: "audio",
			icon: "/icons/wav.png",
		},
		{
			id: "int3",
			name: "user-feedback-mike.mp4",
			duration: "12:45",
			type: "video",
			icon: "/icons/mp4.png",
		},
		{
			id: "int4",
			name: "stakeholder-call.m4a",
			duration: "22:18",
			type: "audio",
			icon: "/icons/mp3.png",
		},
		{
			id: "int5",
			name: "product-demo-feedback.mov",
			duration: "18:56",
			type: "video",
			icon: "/icons/mov.png",
		},
	]

	const speakerGroups: Speaker[][] = [
		[
			{ id: "s2", name: "Researcher", role: "Researcher", color: "text-secondary" },
			{ id: "s1", name: "Sarah Chen", role: "Product Manager", color: "text-primary" },
		],
		[
			{ id: "s6", name: "Researcher", role: "Researcher", color: "text-secondary" },
			{ id: "s3", name: "Mike Rodriguez", role: "Engineering Lead", color: "text-primary" },
			{ id: "s4", name: "Emma Wilson", role: "Designer", color: "text-primary" },
			{ id: "s5", name: "David Kim", role: "QA Lead", color: "text-primary" },
		],
		[
			{ id: "s8", name: "Researcher", role: "Researcher", color: "text-secondary" },
			{ id: "s7", name: "Mike Johnson", role: "Customer", color: "text-primary" },
		],
		[
			{ id: "s11", name: "Researcher", role: "Researcher", color: "text-secondary" },
			{ id: "s9", name: "Alex Thompson", role: "Stakeholder", color: "text-primary" },
			{ id: "s10", name: "Lisa Park", role: "Stakeholder", color: "text-primary" },
		],
		[
			{ id: "s13", name: "Researcher", role: "Researcher", color: "text-secondary" },
			{ id: "s12", name: "Ana Silva", role: "Customer", color: "text-primary" },
		],
	]

	const analysisQuestion = "What are the main pain points with our current pricing model?"

	const sampleAnswers = [
		{
			text: "The tiered pricing is confusing and doesn't align with how we actually use the product. We end up paying for features we don't need while missing ones that would be valuable.",
			sentiment: "negative" as const,
			keyThemes: ["pricing-structure", "feature-alignment", "value-perception"],
		},
		{
			text: "Monthly costs add up quickly with multiple team members. We'd prefer annual discounts or volume pricing for larger teams like ours.",
			sentiment: "neutral" as const,
			keyThemes: ["cost-concerns", "team-scaling", "pricing-flexibility"],
		},
		{
			text: "It's hard to predict our monthly bill since usage-based pricing fluctuates. We need more transparency and budgeting tools to manage costs effectively.",
			sentiment: "positive" as const,
			keyThemes: ["cost-predictability", "transparency", "budgeting-tools"],
		},
		{
			text: "The enterprise tier feels overpriced for mid-size companies. There's a big gap between professional and enterprise that doesn't serve our segment well.",
			sentiment: "negative" as const,
			keyThemes: ["pricing-tiers", "market-fit", "enterprise-gap"],
		},
		{
			text: "While the pricing is reasonable, the value becomes clearer once you see ROI. Maybe better onboarding could help justify the cost upfront for new customers.",
			sentiment: "neutral" as const,
			keyThemes: ["value-realization", "onboarding", "roi-demonstration"],
		},
	]

	const summaryData: SummaryInsight[] = [
		{
			theme: "Pricing Structure",
			count: 12,
			percentage: 35,
			sentiment: "negative",
			examples: ["Tiered pricing confusion", "Feature misalignment", "Complex billing"],
		},
		{
			theme: "Cost Concerns",
			count: 8,
			percentage: 23,
			sentiment: "negative",
			examples: ["Monthly costs add up", "Team scaling expensive", "Budget unpredictability"],
		},
		{
			theme: "Transparency",
			count: 7,
			percentage: 20,
			sentiment: "negative",
			examples: ["Unclear billing", "Hidden costs", "Usage tracking"],
		},
		{
			theme: "Value Realization",
			count: 5,
			percentage: 15,
			sentiment: "neutral",
			examples: ["ROI demonstration", "Onboarding improvements", "Feature education"],
		},
		{
			theme: "Market Fit",
			count: 3,
			percentage: 7,
			sentiment: "negative",
			examples: ["Enterprise gap", "Mid-market needs", "Segment mismatch"],
		},
	]

	// ============================================================================
	// STEP ANIMATIONS
	// ============================================================================

	async function animateInterviewAnalysis(controller: AnimationController): Promise<void> {
		try {
			// Initialize rows data
			const initialRows: AnalysisRow[] = interviewFiles.map((file, index) => ({
				file,
				speakers: speakerGroups[index],
				answer: {
					text: sampleAnswers[index].text,
					animatedLength: 0,
					sentiment: sampleAnswers[index].sentiment,
					keyThemes: sampleAnswers[index].keyThemes,
				},
			}))

			animationState.analysisRows = initialRows

			// Sub-step 1a: Show table with initial delay
			// await controller.delay(800)

			// Animate question text
			// await controller.delay(1000)
			const question = analysisQuestion
			for (let i = 0; i <= question.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.questionText = question.slice(0, i)
				await controller.delay(60)
			}

			animationState.questionComplete = true
			animationState.showTable = true
			await controller.delay(500)

			// Sub-step 1b: Animate answers in parallel
			const answerPromises = animationState.analysisRows.map(async (row, index) => {
				const answer = row.answer.text
				animationState.answerAnimations[row.file.id] = true

				// Animate text character by character
				for (let i = 0; i <= answer.length; i += 2) {
					if (controller.signal.aborted) throw new Error("Animation cancelled")
					animationState.analysisRows[index].answer.animatedLength = Math.min(i, answer.length)
					await controller.delay(40)
				}

				animationState.answerAnimations[row.file.id] = false
			})

			await Promise.all(answerPromises)
			await controller.delay(1000)

			// Sub-step 1c: Theme tags appear after answers complete (they're already triggered by the template)
		} catch (err) {
			// Fallback
			const fallbackRows: AnalysisRow[] = interviewFiles.map((file, index) => ({
				file,
				speakers: speakerGroups[index],
				answer: {
					text: sampleAnswers[index].text,
					animatedLength: sampleAnswers[index].text.length,
					sentiment: sampleAnswers[index].sentiment,
					keyThemes: sampleAnswers[index].keyThemes,
				},
			}))
			animationState.analysisRows = fallbackRows
			animationState.showTable = true
			animationState.questionText = analysisQuestion
			animationState.questionComplete = true
			animationState.answerAnimations = {}
			throw err
		}
	}

	async function animateResultsSummary(controller: AnimationController): Promise<void> {
		try {
			// Sub-step 2a: Show text summary
			await controller.delay(500)
			animationState.summaryInsights = summaryData

			await controller.delay(1000)

			// Sub-step 2b: Show bar chart
			const chartData = summaryData.map((insight, index) => ({
				theme: insight.theme,
				value: insight.percentage,
				color:
					index === 0
						? "#ef4444"
						: index === 1
							? "#f97316"
							: index === 2
								? "#eab308"
								: index === 3
									? "#6b7280"
									: "#64748b",
			}))

			animationState.chartData = chartData
			animationState.showChart = true

			await controller.delay(2000)
		} catch (err) {
			// Fallback
			animationState.summaryInsights = summaryData
			animationState.chartData = summaryData.map((insight, index) => ({
				theme: insight.theme,
				value: insight.percentage,
				color:
					index === 0
						? "#ef4444"
						: index === 1
							? "#f97316"
							: index === 2
								? "#eab308"
								: index === 3
									? "#6b7280"
									: "#64748b",
			}))
			animationState.showChart = true
			throw err
		}
	}

	// ============================================================================
	// STEP DEFINITIONS
	// ============================================================================

	type StepDefinition = {
		id: string
		icon: ComponentType
		title: string
		subtitle: string
		loadingText: string
		completeText: string
		execute: (controller: AnimationController) => Promise<void>
	}

	const steps: StepDefinition[] = [
		{
			id: "interview-analysis",
			icon: IconMessageQuestion,
			title: "Interview Analysis",
			subtitle: "Processing interview data and extracting insights...",
			loadingText: "Analyzing interview responses",
			completeText: "Interview analysis completed",
			execute: animateInterviewAnalysis,
		},
		{
			id: "results-summary",
			icon: IconChartBar,
			title: "Results Summary",
			subtitle: "Generating insights summary and data visualization...",
			loadingText: "Creating results summary",
			completeText: "Analysis complete with actionable insights",
			execute: animateResultsSummary,
		},
	]

	// ============================================================================
	// EXECUTION ENGINE (same as other demos)
	// ============================================================================

	let currentStepIndex = $state(0)
	let isLoading = $state(false)
	let isComplete = $state(false)
	let restart = $state(false)
	let showCard = $state(true)
	let currentController: AnimationController | null = $state(null)
	let isAnimationStarted = $state(false)

	// STATIC DESIGN MODE - Set to true to disable animations and show all steps
	// Perfect for design work: shows question box, analysis table with responses, and results summary
	// all at once without any animations or delays
	let staticDesignMode = $state(false) // Set to true for design work

	let currentStep = $derived(steps[currentStepIndex])

	async function executeStep(stepIndex: number): Promise<void> {
		const step = steps[stepIndex]
		if (!step) return

		if (currentController) {
			currentController.cancel()
		}

		resetAnimationState(step.id)
		animationState.currentStepId = step.id

		const controller = new AnimationController()
		currentController = controller

		isLoading = true
		isComplete = false

		try {
			await controller.execute(step.execute)

			if (!controller.signal.aborted) {
				animationState.isComplete = true
				isLoading = false
				isComplete = true

				await controller.delay(3000)

				if (!controller.signal.aborted) {
					if (stepIndex < steps.length - 1) {
						transitionToNextStep()
					} else {
						setTimeout(() => {
							restart = true
						}, 4000)
					}
				}
			}
		} catch (err) {
			if (!controller.signal.aborted) {
				console.warn("Animation failed:", err)
				animationState.isComplete = true
				isLoading = false
				isComplete = true
			}
		}
	}

	function transitionToNextStep() {
		showCard = false
		setTimeout(() => {
			currentStepIndex += 1
			setTimeout(() => {
				showCard = true
				executeStep(currentStepIndex)
			}, 100)
		}, 500)
	}

	function resetAnimation() {
		if (currentController) {
			currentController.cancel()
		}

		showCard = false

		setTimeout(() => {
			currentStepIndex = 0
			isLoading = false
			isComplete = false
			isAnimationStarted = false

			setTimeout(() => {
				showCard = true
				restart = false
				startAnimation()
			}, 100)
		}, 500)
	}

	function startAnimation() {
		if (!isAnimationStarted) {
			isAnimationStarted = true
			executeStep(currentStepIndex)
		}
	}

	$effect(() => {
		if (restart) {
			resetAnimation()
		}
	})

	onMount(() => {
		if (!staticDesignMode) {
			setTimeout(() => {
				startAnimation()
			}, 500)
		}
	})
</script>

<!-- ============================================================================ -->
<!-- VISUAL COMPONENTS
<!-- ============================================================================ -->

<!-- Prominent question box -->
{#snippet questionBox(questionText: string, questionComplete: boolean)}
	{#if questionText}
		<div
			class="card max-w-2xl p-4 mb-6"
			in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<div class="text-card-foreground text-md mb-3 font-semibold tracking-wide text-left uppercase">
				Question
			</div>
			<div class="flex items-start gap-3">
				<!-- <div class="bg-primary/20 text-primary flex-shrink-0 p-2 rounded-md">
					<IconMessageQuestion class="size-6" />
				</div> -->
				<div class="flex-1">
					<div class="text-card-foreground opacity-70 text-md font-medium leading-relaxed">
						"{questionText}"
						{#if !questionComplete}
							<span class="animate-pulse text-primary ml-1">●</span>
						{/if}
					</div>
					<!-- {#if questionComplete}
						<div class="flex items-center gap-2 mt-2">
							<div class="text-primary" in:scale={{ duration: 200, easing: elasticOut }}>
								<IconCheck class="size-3" />
							</div>
							<span class="text-primary text-xs font-medium">Query processed</span>
						</div>
					{/if} -->
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<!-- Analysis table with compact styling -->
{#snippet analysisTable(rows: AnalysisRow[])}
	{#if animationState.showTable && rows.length > 0}
		<div
			class="card max-w-2xl overflow-hidden"
			in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<!-- Header -->
			<!-- <div class="bg-card/85 backdrop-blur-sm border-border/10 px-4 py-2.5 border-b">
				<div class="text-foreground/90 text-xs font-semibold tracking-wide uppercase">
					Participant Interviews • {rows.length}
				</div>
			</div> -->

			<!-- Column headers -->
			<div class="bg-card/20 grid grid-cols-3 gap-4 px-4 py-2 border-b">
				<div class="text-foreground/80 text-sm font-bold tracking-wider uppercase">Interview</div>
				<div class="text-foreground/80 col-span-2 text-sm font-bold tracking-wider uppercase">Answer</div>
				<!-- <div class="text-foreground/80 text-sm font-bold tracking-wider uppercase">Coded Themes</div> -->
			</div>

			<!-- Rows -->
			<div class="divide-border/20 divide-y">
				{#each rows as row, i (row.file.id)}
					<div
						class=" grid grid-cols-3 gap-4 px-4 py-3"
						in:fly={{ y: -20, duration: 400, delay: i * 100, easing: quintOut }}>
						<!-- Participants column -->
						<div class="space-y-2">
							<!-- File info -->
							<!-- <div class="flex items-center gap-2">
								{#if row.file.type === "video"}
									<IconMovie class="size-4 text-foreground/50" />
								{:else}
									<IconMicrophone class="size-4 text-foreground/50" />
								{/if}
								<div class="text-foreground/60 font-mono text-xs font-medium">
									{row.file.name.replace(/\.(mp4|wav|m4a|mov)$/, "")}
								</div>
							</div> -->
							<!-- Overlapped avatars -->
							<div class="flex items-center -space-x-1">
								{#each row.speakers as speaker, speakerIndex}
									<div
										class="flex items-center justify-center size-6 text-[9px] font-bold rounded-full border-2 border-background relative z-[{10 -
											speakerIndex}]
										{speaker.color === 'text-primary' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-background'}"
										title={speaker.name}>
										{speaker.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</div>
								{/each}
							</div>
						</div>

						<!-- Response column -->
						<div class="col-span-2 pr-2">
							{#if row.answer.animatedLength > 0}
								<div class="text-foreground text-xs leading-relaxed">
									{row.answer.text.slice(0, row.answer.animatedLength)}
									{#if animationState.answerAnimations[row.file.id]}
										<span class="animate-pulse text-primary ml-1">●</span>
									{/if}
								</div>
								<!-- {#if row.answer.animatedLength >= row.answer.text.length}
									<div class="flex items-center gap-1.5 mt-2">
										<div class="size-1.5 bg-green-500 rounded-full"></div>
										<span class="text-foreground/60 text-[10px] font-medium">Captured</span>
									</div>
								{/if} -->
							{/if}
						</div>

						<!-- Theme tags column -->
						<!-- <div>
							{#if row.answer.animatedLength >= row.answer.text.length}
								<div
									class="flex flex-wrap gap-1"
									in:fly={{ y: 10, duration: 300, delay: 200, easing: quintOut }}>
									{#each row.answer.keyThemes as theme}
										<span
											class="px-2 py-1 text-[9px] font-medium rounded-full
											{row.answer.sentiment === 'negative'
												? 'bg-secondary text-secondary-foreground border border-secondary'
												: row.answer.sentiment === 'positive'
													? 'bg-primary text-primary-foreground border border-primary'
													: 'bg-muted text-muted-foreground border border-muted'}">
											{theme.replace(/-/g, " ")}
										</span>
									{/each}
								</div>
								<div class="flex items-center gap-1 mt-1.5">
									<IconTags class="size-3 text-foreground/50" />
									<span class="text-foreground/50 text-[9px] font-medium">
										{row.answer.keyThemes.length} themes
									</span>
								</div>
							{/if}
						</div> -->
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<!-- Results summary with text and bar chart -->
{#snippet resultsSummary(insights: SummaryInsight[], showChart: boolean)}
	{#if insights.length > 0}
		<div class="max-w-4xl space-y-6">
			<!-- Text Summary -->
			<div
				class="card p-4"
				in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
				out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
				<div class="text-card-foreground text-md mb-4 font-semibold tracking-wide uppercase">
					Analysis Summary
				</div>

				<div class="text-card-foreground space-y-4 text-xs leading-relaxed">
					<!-- <div class="pb-1">
						Our analysis of <strong class="text-primary"
							>{insights.reduce((sum, insight) => sum + insight.count, 0)} customer responses</strong> revealed
						significant concerns about our current pricing model.
					</div> -->
					<div class="border-primary/20 pl-2 space-y-1 border-l-2">
						<div>
							<strong class="text-primary font-semibold">Pricing Structure issues</strong> dominated the
							feedback at <strong class="text-primary opacity-70">35%</strong> of all mentions, with customers
							struggling with confusing tiered pricing
						</div>
						<div>
							<strong class="text-primary font-semibold">Cost Concerns</strong> at
							<strong class="text-primary opacity-70">23%</strong> focused on unpredictable monthly costs and
							significant gaps between professional and enterprise tiers
						</div>
						<div>
							<strong class="text-primary font-semibold">Transparency</strong> issues at
							<strong class="text-primary opacity-70">20%</strong> highlighted customer requests for better
							value alignment and improved budget predictability tools
						</div>
					</div>
				</div>
			</div>

			<!-- Vertical Bar Chart -->
			{#if showChart}
				<div
					class="card p-4"
					in:fly={{ y: 20, duration: 600, delay: 300, easing: elasticOut }}
					out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
					<!-- Chart Header -->
					<!-- <div class="flex items-center gap-3 mb-6">
						<div class="bg-primary text-primary-foreground p-2 rounded-md">
							<IconChartBar class="size-4" />
						</div>
						<div>
							<div class="text-card-foreground text-xs font-semibold">Theme Distribution</div>
							<div class="text-card-foreground/60 text-xs">Customer feedback analysis breakdown</div>
						</div>
					</div> -->

					<!-- Chart Area -->
					<div class="flex items-start justify-start h-full gap-4">
						{#each insights as insight, i (insight.theme)}
							<div
								class="flex flex-col items-center flex-1 w-full gap-3"
								in:fly={{ y: 30, duration: 600, delay: 400 + i * 100, easing: elasticOut }}>
								<!-- Bar -->
								<div class="bg-muted/30 rounded-t-md relative w-full h-24 overflow-hidden">
									<div
										class="absolute bottom-0 w-full transition-all duration-1500 ease-out
										{insight.sentiment === 'negative' ? 'bg-primary' : insight.sentiment === 'positive' ? 'bg-secondary' : 'bg-muted'}"
										style="height: {(insight.percentage / 40) * 100}%">
									</div>
									<!-- Percentage label on bar -->
									<div class="top-1 absolute left-0 right-0 text-center">
										<span class="text-card-foreground text-xs font-bold">
											{insight.percentage}%
										</span>
									</div>
								</div>

								<!-- Theme label -->
								<div class="text-center">
									<div class="text-card-foreground mb-1 text-xs font-medium leading-tight">
										{insight.theme}
									</div>
									<div class="text-card-foreground/60 text-xs">
										{insight.count} mentions
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

<!-- ============================================================================ -->
<!-- MAIN UI - SIMPLIFIED STATIC/ANIMATED MODE -->
<!-- ============================================================================ -->

<!-- 
SIMPLE TOGGLE: Change 'staticDesignMode' to 'true' on line ~536 to see all steps without animations
Perfect for design work - shows question box, analysis table, and results summary
-->

{#if staticDesignMode}
	<!-- STATIC DESIGN MODE - All steps visible with full data -->
	<div class="relative flex flex-col w-full pl-12 space-y-12">
		<!-- STEP 1: Interview Analysis -->
		<div class="space-y-4">
			<div class="absolute top-0 left-0 z-10">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconMessageQuestion class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Interview Analysis</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 mb-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Interview analysis completed
					</span>
				</div>
			</div>

			{@render questionBox(analysisQuestion, true)}
			{@render analysisTable(
				interviewFiles.map((file, index) => ({
					file,
					speakers: speakerGroups[index],
					answer: {
						text: sampleAnswers[index].text,
						animatedLength: sampleAnswers[index].text.length,
						sentiment: sampleAnswers[index].sentiment,
						keyThemes: sampleAnswers[index].keyThemes,
					},
				})),
			)}
		</div>

		<!-- STEP 2: Results Summary -->
		<div class="space-y-4">
			<div class="absolute left-0 z-10" style="top: 60rem;">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconChartBar class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Results Summary</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 mb-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Analysis complete with actionable insights
					</span>
				</div>
			</div>

			{@render resultsSummary(summaryData, true)}
		</div>
	</div>
{:else}
	<!-- ANIMATED MODE - Standard step-by-step animation -->
	<div class="relative flex flex-col w-full pl-12 space-y-4">
		<div class="absolute top-0 left-0 z-10">
			<div
				class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 relative flex items-center justify-center w-8 h-8 transition-all duration-300 rounded-full shadow-lg">
				{#key currentStepIndex}
					<div
						in:scale={{ duration: 300, easing: elasticOut, start: 0.5, delay: 150 }}
						out:scale={{ duration: 150, easing: cubicInOut, start: 0.5 }}
						class="transform-gpu absolute inset-0 flex items-center justify-center">
						{#if currentStep.icon}
							{@const IconComponent = currentStep.icon}
							<IconComponent class="size-4" />
						{:else}
							<IconLoader class="size-4" />
						{/if}
					</div>
				{/key}
			</div>
		</div>

		{#if showCard}
			<div
				class="transition-all duration-500"
				in:fly={{ y: 30, duration: 600, easing: quintOut }}
				out:fly={{ y: -30, duration: 500, easing: cubicInOut }}>
				<div class="mb-4 space-y-3">
					<div in:fly={{ x: -30, duration: 500, easing: quintOut }}>
						<h3 class="text-foreground text-lg font-semibold tracking-tight">{currentStep.title}</h3>
					</div>

					<div class="relative min-h-[1.25rem]">
						{#key `${currentStep.id}-${isLoading}-${isComplete}`}
							<div
								class="absolute inset-0"
								in:fly={{ x: -30, duration: 400, delay: 100, easing: quintOut }}
								out:fly={{ x: 30, duration: 300, easing: cubicInOut }}>
								<div class="text-foreground text-sm leading-relaxed">
									{#if animationState.isComplete}
										<span class="text-primary flex items-center gap-2 font-medium">
											<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
											{currentStep.completeText}
										</span>
									{:else if isLoading}
										<span class="text-foreground opacity-80 flex items-center gap-2 font-semibold">
											<div class="animate-spin flex-shrink-0">
												<IconLoader class="size-4 text-foreground" />
											</div>
											<span class="animate-shimmer-once text-foreground bg-foreground">
												{currentStep.loadingText}...
											</span>
										</span>
									{:else}
										<span>{currentStep.subtitle}</span>
									{/if}
								</div>
							</div>
						{/key}
					</div>
				</div>

				{#if isLoading || animationState.isComplete}
					{#if currentStep.id === "interview-analysis"}
						{@render questionBox(animationState.questionText, animationState.questionComplete)}
						{@render analysisTable(animationState.analysisRows)}
					{/if}

					{#if currentStep.id === "results-summary"}
						{@render resultsSummary(animationState.summaryInsights, animationState.showChart)}
					{/if}
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.animate-shimmer-once {
		background:
			linear-gradient(-45deg, #0000 40%, #fff5, #0000 60%) right/300% 100%,
			linear-gradient(45deg, var(--foreground), var(--foreground));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: #000;
		animation: shine 1.5s infinite;
	}

	@keyframes shine {
		to {
			background-position: left;
		}
	}
</style>
