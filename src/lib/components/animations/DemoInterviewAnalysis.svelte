<script lang="ts">
	import { IconMessageQuestion, IconChartBar, IconCheck, IconLoader } from "@tabler/icons-svelte"
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
			{ id: "s1", name: "Sarah Chen", role: "Product Manager", color: "text-primary" },
			{ id: "s2", name: "Interviewer", role: "Researcher", color: "text-secondary" },
		],
		[
			{ id: "s3", name: "Mike Rodriguez", role: "Engineering Lead", color: "text-primary" },
			{ id: "s4", name: "Emma Wilson", role: "Designer", color: "text-primary" },
			{ id: "s5", name: "David Kim", role: "QA Lead", color: "text-primary" },
			{ id: "s6", name: "Moderator", role: "Researcher", color: "text-secondary" },
		],
		[
			{ id: "s7", name: "Mike Johnson", role: "Customer", color: "text-primary" },
			{ id: "s8", name: "Interviewer", role: "Researcher", color: "text-secondary" },
		],
		[
			{ id: "s9", name: "Alex Thompson", role: "Stakeholder", color: "text-primary" },
			{ id: "s10", name: "Lisa Park", role: "Stakeholder", color: "text-primary" },
			{ id: "s11", name: "Facilitator", role: "Researcher", color: "text-secondary" },
		],
		[
			{ id: "s12", name: "Ana Silva", role: "Customer", color: "text-primary" },
			{ id: "s13", name: "Interviewer", role: "Researcher", color: "text-secondary" },
		],
	]

	const analysisQuestion = "What are the main pain points with our current pricing model?"

	const sampleAnswers = [
		{
			text: "The tiered pricing is confusing and doesn't align with how we actually use the product. We end up paying for features we don't need while missing ones that would be valuable.",
			sentiment: "negative" as const,
			keyThemes: [
				"pricing-structure",
				"feature-alignment",
				"value-perception",
			],
		},
		{
			text: "Monthly costs add up quickly with multiple team members. We'd prefer annual discounts or volume pricing for larger teams like ours.",
			sentiment: "negative" as const,
			keyThemes: [
				"cost-concerns",
				"team-scaling",
				"pricing-flexibility",
			],
		},
		{
			text: "It's hard to predict our monthly bill since usage-based pricing fluctuates. We need more transparency and budgeting tools to manage costs effectively.",
			sentiment: "negative" as const,
			keyThemes: [
				"cost-predictability",
				"transparency",
				"budgeting-tools",
			],
		},
		{
			text: "The enterprise tier feels overpriced for mid-size companies. There's a big gap between professional and enterprise that doesn't serve our segment well.",
			sentiment: "negative" as const,
			keyThemes: [
				"pricing-tiers",
				"market-fit",
				"enterprise-gap",
			],
		},
		{
			text: "While the pricing is reasonable, the value becomes clearer once you see ROI. Maybe better onboarding could help justify the cost upfront for new customers.",
			sentiment: "neutral" as const,
			keyThemes: [
				"value-realization",
				"onboarding",
				"roi-demonstration",
			],
		},
	]

	const summaryData: SummaryInsight[] = [
		{
			theme: "Pricing Structure",
			count: 12,
			percentage: 35,
			sentiment: "negative",
			examples: [
				"Tiered pricing confusion",
				"Feature misalignment",
				"Complex billing",
			],
		},
		{
			theme: "Cost Concerns",
			count: 8,
			percentage: 23,
			sentiment: "negative",
			examples: [
				"Monthly costs add up",
				"Team scaling expensive",
				"Budget unpredictability",
			],
		},
		{
			theme: "Transparency",
			count: 7,
			percentage: 20,
			sentiment: "negative",
			examples: [
				"Unclear billing",
				"Hidden costs",
				"Usage tracking",
			],
		},
		{
			theme: "Value Realization",
			count: 5,
			percentage: 15,
			sentiment: "neutral",
			examples: [
				"ROI demonstration",
				"Onboarding improvements",
				"Feature education",
			],
		},
		{
			theme: "Market Fit",
			count: 3,
			percentage: 7,
			sentiment: "negative",
			examples: [
				"Enterprise gap",
				"Mid-market needs",
				"Segment mismatch",
			],
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
			await controller.delay(800)
			animationState.showTable = true

			// Animate question text
			await controller.delay(1000)
			const question = analysisQuestion
			for (let i = 0; i <= question.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.questionText = question.slice(0, i)
				await controller.delay(60)
			}

			animationState.questionComplete = true
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
		setTimeout(() => {
			startAnimation()
		}, 500)
	})
</script>

<!-- ============================================================================ -->
<!-- VISUAL COMPONENTS
<!-- ============================================================================ -->

<!-- Analysis table with question and answers -->
{#snippet analysisTable(rows: AnalysisRow[], questionText: string, questionComplete: boolean)}
	{#if animationState.showTable || rows.length > 0}
		<div
			class="bg-card/60 backdrop-blur-sm border-border/20 max-w-5xl p-4 border rounded-lg shadow-sm"
			in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<div class="text-card-foreground mb-3 text-xs font-medium tracking-wide uppercase">
				Interview Analysis • {rows.length} Sessions
			</div>

			<!-- Table header -->
			<div class="border-border/20 grid grid-cols-3 gap-6 pb-3 mb-4 border-b">
				<div class="text-card-foreground text-xs font-medium tracking-wide uppercase">Participants</div>
				<div class="flex items-center gap-2">
					<div class="text-card-foreground text-xs font-medium tracking-wide uppercase">
						{#if questionText}
							<span class="text-card-foreground text-xs">{questionText}</span>
							{#if !questionComplete}
								<span class="animate-pulse text-primary">|</span>
							{/if}
						{:else}
							Analysis Question
						{/if}
					</div>
					{#if questionComplete}
						<div class="text-primary" in:scale={{ duration: 200, easing: elasticOut }}>
							<IconCheck class="size-3" />
						</div>
					{/if}
				</div>
				<div class="text-card-foreground text-xs font-medium tracking-wide uppercase">Key Themes</div>
			</div>

			<!-- Table rows -->
			<div class="space-y-4">
				{#each rows as row, i (row.file.id)}
					<div
						class="grid items-start grid-cols-3 gap-6"
						in:fly={{ y: -20, duration: 400, delay: i * 100, easing: quintOut }}>
						<!-- Participants column -->
						<div class="flex flex-wrap gap-2">
							{#each row.speakers as speaker}
								<div class="flex items-center gap-1.5">
									<div
										class="flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full
										{speaker.color === 'text-primary' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}">
										{speaker.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</div>
									<div class="text-card-foreground text-[11px] font-medium">
										{speaker.name}
									</div>
								</div>
							{/each}
						</div>

						<!-- Question response column -->
						<div class="space-y-2">
							{#if row.answer.animatedLength > 0}
								<div class="text-card-foreground text-xs leading-relaxed">
									{row.answer.text.slice(0, row.answer.animatedLength)}
									{#if animationState.answerAnimations[row.file.id]}
										<span class="animate-pulse text-primary">|</span>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Theme tags column -->
						<div class="space-y-2">
							{#if row.answer.animatedLength >= row.answer.text.length}
								<div
									class="flex flex-wrap gap-1.5"
									in:fly={{ y: 10, duration: 300, delay: 200, easing: quintOut }}>
									{#each row.answer.keyThemes as theme}
										<span
											class="px-2 py-0.5 text-[10px] font-medium rounded border
											{row.answer.sentiment === 'negative'
												? 'bg-red-50 text-red-700 border-red-200'
												: row.answer.sentiment === 'positive'
													? 'bg-green-50 text-green-700 border-green-200'
													: 'bg-gray-50 text-gray-700 border-gray-200'}">
											#{theme}
										</span>
									{/each}
								</div>
							{/if}
						</div>
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
				class="bg-card/60 backdrop-blur-sm border-border/20 p-6 border rounded-lg shadow-sm"
				in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
				out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
				<div class="text-card-foreground mb-4 text-xs font-medium tracking-wide uppercase">
					Analysis Summary
				</div>

				<div class="text-card-foreground space-y-2 text-xs leading-relaxed">
					<p>
						Our analysis of {insights.reduce((sum, insight) => sum + insight.count, 0)} customer responses revealed
						significant concerns about our current pricing model.
						<strong class="text-red-600">Pricing Structure issues</strong> dominated the feedback,
						accounting for 35% of all mentions, followed by
						<strong class="text-orange-600">Cost Concerns</strong>
						at 23% and <strong class="text-yellow-600">Transparency</strong> issues at 20%.
					</p>
					<p>
						The most common complaints centered around confusing tiered pricing, unpredictable monthly
						costs, and a significant gap between our professional and enterprise tiers. Customers
						consistently requested better value alignment, annual discount options, and improved budget
						predictability tools.
					</p>
				</div>
			</div>

			<!-- Bar Chart -->
			{#if showChart}
				<div
					class="bg-card/60 backdrop-blur-sm border-border/20 p-6 border rounded-lg shadow-sm"
					in:fly={{ y: 20, duration: 600, delay: 300, easing: elasticOut }}
					out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
					<div class="text-card-foreground mb-6 text-xs font-medium tracking-wide uppercase">
						Theme Distribution
					</div>

					<div class="space-y-3">
						{#each insights as insight, i (insight.theme)}
							<div
								class="flex items-center gap-3"
								in:fly={{ x: -30, duration: 600, delay: 400 + i * 100, easing: elasticOut }}>
								<!-- Theme label -->
								<div class="w-28 text-right">
									<div class="text-card-foreground text-xs font-semibold">{insight.theme}</div>
									<div class="text-card-foreground/50 text-[10px]">{insight.count}</div>
								</div>

								<!-- Bar -->
								<div class="flex-1 max-w-xs">
									<div class="bg-border/20 h-6 overflow-hidden rounded-md shadow-inner">
										<div
											class="h-full rounded-md transition-all duration-1500 ease-out flex items-center px-2 shadow-sm
											{insight.sentiment === 'negative'
												? 'bg-gradient-to-r from-red-500 to-red-400'
												: insight.sentiment === 'positive'
													? 'bg-gradient-to-r from-green-500 to-green-400'
													: 'bg-gradient-to-r from-gray-500 to-gray-400'}"
											style="width: {insight.percentage}%">
											<span class="text-[10px] font-bold text-white/90"
												>{insight.percentage}%</span>
										</div>
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
<!-- MAIN UI
<!-- ============================================================================ -->

<div class="relative flex flex-col w-full pl-12 space-y-4">
	<!-- Fixed icon -->
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
			<!-- Step header -->
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

			<!-- Dynamic content -->
			{#if isLoading || animationState.isComplete}
				<!-- INTERVIEW ANALYSIS STEP -->
				{#if currentStep.id === "interview-analysis"}
					{@render analysisTable(
						animationState.analysisRows,
						animationState.questionText,
						animationState.questionComplete,
					)}
				{/if}

				<!-- RESULTS SUMMARY STEP -->
				{#if currentStep.id === "results-summary"}
					{@render resultsSummary(animationState.summaryInsights, animationState.showChart)}
				{/if}
			{/if}
		</div>
	{/if}
</div>

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
