<script lang="ts">
	import { IconBrandTwitter, IconBrandLinkedin, IconShieldCheck, IconSquareLetterY } from "@tabler/icons-svelte"
	import { Badge } from "$lib/components/ui/badge"
	import ThemeModeToggle from "$lib/components/ui/ThemeModeToggle.svelte"
	import type { LayoutData } from "./$types"
	export let data: LayoutData
</script>

<footer class="text-muted-foreground mt-36 w-full py-8 text-sm">
	<div class="lg:px-10 w-full max-w-6xl px-6 mx-auto">
		<div
			class="lg:flex-row flex flex-col justify-between w-full border-t border-border/50 pt-8 lg:mb-32 mb-16 gap-8">
			<div class="col-span-1 flex flex-col gap-2 justify-between lg:gap-8 lg:w-1/2 w-full">
				<div>
					<a href="/" class="lg:mb-4 flex items-center gap-2 mb-8">
						<img
							src="/logos/CoLoop_Icon.svg"
							alt="CoLoop Logo"
							class="contrast-100 saturate-0 h-6 rounded-full" />
						<h3 class=" text-foreground font-semibold">CoLoop</h3>
					</a>
					<p class="text-foreground text-sm font-serif italic font-semibold mb-1 opacity-60">
						Research Reimagined.
					</p>
					<p class="text-foreground text-xs text-balance mb-8 w-1/2">
						CoLoop is a platform for qualitative research. We help you collect, analyze, and share insights
						to influence your decisions.
					</p>
				</div>
				<div>
					<p class="text-muted-foreground text-xs text-balance">
						85 Great Portland Street, <br /> London, United Kingdom, <br /> W1W 7LT
					</p>
				</div>
			</div>

			<div
				class="lg:grid-cols-3 lg:text-right grid grid-cols-2 col-span-6 lg:gap-16 lg:w-1/2 w-full gap-8 text-left mb-16">
				<!-- <div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Product</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/products/qualitative" class="hover:underline transition-colors">Qualitative</a>
						<a href="/products/quantitative" class="hover:underline transition-colors">Open Ends</a>
						<a href="/products/agentic-ai-chat" class="hover:underline transition-colors"
							>Agentic AI Chat
						</a>
						<a href="https://status.coloop.ai" class="hover:underline transition-colors">Concept Testing</a>
					</nav>
				</div>

				<div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Industries</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/use-cases/pharmaceuticals" class="hover:underline transition-colors"
							>Healthcare & Pharmaceuticals</a>
						<a href="/use-cases/consumer-goods" class="hover:underline transition-colors">Consumer Goods</a>
						<a href="/use-cases/media-and-entertainment" class="hover:underline transition-colors"
							>Media & Entertainment</a>
						<a href="/use-cases/industry-experts" class="hover:underline transition-colors"
							>Industry Experts</a>
						<a href="/use-cases/business-stakeholders" class="hover:underline transition-colors"
							>Business Stakeholders</a>
					</nav>
				</div>
				<div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Teams</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/use-cases/in-house-teams" class="hover:underline transition-colors">In-house Teams</a>
						<a href="/use-cases/academics" class="hover:underline transition-colors">Academics</a>
						<a href="/use-cases/independents" class="hover:underline transition-colors">Independents</a>
						<a href="/use-cases/agencies" class="hover:underline transition-colors">Agencies</a>
					</nav>
				</div> -->
				<div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Comparisons</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/comparison/notebooklm" class="hover:underline transition-colors"
							>CoLoop Vs. NotebookLM</a>
						<a href="/comparison/chatgpt" class="hover:underline transition-colors">CoLoop Vs. ChatGPT</a>
						<a href="/comparison/microsoft-copilot" class="hover:underline transition-colors"
							>CoLoop Vs. Microsoft Copilot</a>
					</nav>
				</div>
				<div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Company</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/careers" class="hover:underline transition-colors">Careers</a>
						<!-- <a href="/about" class="hover:underline transition-colors">About</a> -->
						<a href="/blog" class="hover:underline transition-colors">Blog</a>
						<!-- <a href="/values" class="hover:underline transition-colors">Values</a>
						<a href="/mission" class="hover:underline transition-colors">Mission</a>
						<a href="/manifesto" class="hover:underline transition-colors">Manifesto</a> -->
					</nav>
				</div>
				<div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Resources</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="https://docs.coloop.ai/docs" class="hover:underline transition-colors">Help center</a>
						<a href="https://docs.coloop.ai/docs" class="hover:underline transition-colors">Support</a>
						<a href="/blog" class="hover:underline transition-colors">Blog</a>
						<a href="https://community.coloop.ai" class="hover:underline transition-colors">Community</a>
						<a href="https://status.coloop.ai" class="hover:underline transition-colors">Status</a>
						<a href="https://trust.coloop.ai" class="hover:underline transition-colors">Trust</a>
					</nav>
				</div>
			</div>
		</div>

		<div
			class="lg:flex-row grid grid-cols-1 lg:grid-cols-3 items-center justify-between gap-4 mt-16 text-center lg:text-left">
			<div class="text-muted-foreground flex flex-col gap-1 text-xs lg:justify-start justify-center">
				<div>&copy; {new Date().getFullYear()} CoLoop. All rights reserved.</div>
			</div>
			<nav class="flex items-center gap-4 text-xs justify-center">
				<a href="/legal/terms-of-service" class="hover:text-primary hover:underline transition-colors"
					>Terms of service</a>
				<a href="/legal/privacy-policy" class="hover:text-primary hover:underline transition-colors"
					>Privacy policy</a>
			</nav>
			<div class="text-muted-foreground flex items-center gap-4 text-xs lg:justify-end justify-center">
				<Badge
					variant="blank"
					class=" [a&]:hover:bg-[#F1621D] [a&]:hover:text-white [a&]:hover:border-[#F1621D] opacity-60"
					href="https://www.ycombinator.com/companies/coloop">
					<!-- <IconSquareLetterY class="size-4" /> -->
					<!-- <img
						src="/images/yc-logo-wordmark.webp"
						alt="Backed by Y Combinator"
						class="h-4 contrast-2000 rounded drop-shadow-[0_0_0_white] group-hover:brightness-200 group-hover:invert-0 saturate-0 brightness-100 transition-all duration-300 ease-in-out" /> -->
					<IconSquareLetterY class="size-4" />
					<span class="">Y Combinator</span>
				</Badge>
				<Badge variant="default" class="opacity-60 flex items-center gap-2" href="https://trust.coloop.ai">
					<IconShieldCheck class="size-4" />
					<span>SOC 2 Certified</span>
				</Badge>
				<a
					href="https://www.linkedin.com/company/coloopai"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="LinkedIn"
					class=" hover:text-primary transition-colors">
					<IconBrandLinkedin class="size-5" />
				</a>
				<!-- <a
					href="https://x.com"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Twitter"
					class=" hover:text-primary transition-colors">
					<IconBrandTwitter class="size-5" />
				</a> -->
				<ThemeModeToggle />
			</div>
		</div>
		<div class="opacity-30 text-center w-full lg:mt-4 mt-8 text-xs">
			{data.gitData.RAILWAY_GIT_COMMIT_SHA} | {data.gitData.RAILWAY_GIT_AUTHOR}
		</div>
	</div>
</footer>
