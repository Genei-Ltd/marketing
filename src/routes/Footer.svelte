<script lang="ts">
	import { IconBrandTwitter, IconBrandLinkedin, IconShieldCheck, IconSun } from "@tabler/icons-svelte"
	import { Badge } from "$lib/components/ui/badge"
	import { Button } from "$lib/components/ui/button"
	import { toggleMode } from "$lib/utils/theme"
</script>

<footer class="text-muted-foreground mt-36 w-full px-4 py-8 text-sm">
	<div class="max-w-7xl w-full mx-auto">
		<div class="lg:flex-row flex flex-col justify-between w-full">
			<div class="col-span-1">
				<a href="/" class="lg:mb-4 flex items-center gap-2 mb-8">
					<img
						src="/logos/CoLoop_Icon.svg"
						alt="CoLoop Logo"
						class="contrast-100 saturate-0 h-6 rounded-full" />
					<h4 class=" text-foreground font-semibold">CoLoop</h4>
				</a>
			</div>

			<div class="lg:grid-cols-5 lg:text-right grid grid-cols-2 col-span-5 gap-8 text-left">
				<div>
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
				<!-- <div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Sectors</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/sectors/healthcare-and-pharmaceuticals" class="hover:underline transition-colors"
						>Healthcare & <br />Pharmaceuticals</a>
						<a href="/sectors/consumer-goods" class="hover:underline transition-colors">
						Consumer & Retail
						</a>
						<a href="/sectors/experts-and-key-opinion-leaders" class="hover:underline transition-colors">
						Industry Experts
						</a>
						<a href="/sectors/business-stakeholders" class="hover:underline transition-colors"
						>Business Stakeholders</a>
						<a href="/sectors/media-and-entertainment" class="hover:underline transition-colors"
						>Media & Entertainment</a>
						</nav>
						</div> -->
				<div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Comparisons</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/careers" class="hover:underline transition-colors">CoLoop Vs. ChatGPT</a>
						<a href="/mission" class="hover:underline transition-colors">CoLoop Vs. Listenlabs</a>
						<a href="/about" class="hover:underline transition-colors">CoLoop Vs. Claude</a>
						<a href="/blog" class="hover:underline transition-colors">CoLoop Vs. Gemini</a>
						<a href="/values" class="hover:underline transition-colors">CoLoop Vs. Grok</a>
					</nav>
				</div>
				<div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Teams</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/use-cases/pharmaceutical" class="hover:underline transition-colors">In-house Teams</a>
						<a href="/use-cases/biotechnology" class="hover:underline transition-colors">Academics</a>
						<a href="/use-cases/healthcare" class="hover:underline transition-colors">Independents</a>
						<a href="/use-cases/consumer-goods" class="hover:underline transition-colors">Agencies</a>
					</nav>
				</div>
				<div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Resources</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/support" class="hover:underline transition-colors">Help center</a>
						<a href="/support" class="hover:underline transition-colors">Support</a>
						<a href="https://community.coloop.ai" class="hover:underline transition-colors">Community</a>
						<a href="/blog" class="hover:underline transition-colors">Blog</a>
						<a href="https://status.coloop.ai" class="hover:underline transition-colors">Status</a>
						<a href="https://trust.coloop.ai" class="hover:underline transition-colors">Trust</a>
					</nav>
				</div>
				<div>
					<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Company</span>
					<nav class="text-foreground flex flex-col gap-2 mt-4 text-sm">
						<a href="/careers" class="hover:underline transition-colors">Careers</a>
						<a href="/about" class="hover:underline transition-colors">About</a>
						<a href="/blog" class="hover:underline transition-colors">Blog</a>
						<a href="/values" class="hover:underline transition-colors">Values</a>
						<a href="/mission" class="hover:underline transition-colors">Mission</a>
						<a href="/manifesto" class="hover:underline transition-colors">Manifesto</a>
					</nav>
				</div>
			</div>
		</div>

		<div class="md:flex-row lg:mt-36 flex flex-col items-center justify-between gap-4 mt-16">
			<div class="text-muted-foreground text-xs">
				&copy; {new Date().getFullYear()} CoLoop. All rights reserved.
			</div>
			<nav class="flex items-center gap-4 text-xs">
				<a href="/terms" class="hover:text-primary hover:underline transition-colors">Terms of use</a>
				<a href="/privacy" class="hover:text-primary hover:underline transition-colors">Privacy policy</a>
			</nav>
			<div class="text-muted-foreground flex items-center gap-4 text-xs">
				<Badge variant="default" class="opacity-60 flex items-center gap-2" href="https://trust.coloop.ai">
					<IconShieldCheck class="size-4" />
					<span>SOC 2 Certified</span>
				</Badge>
				<a
					href="https://linkedin.com"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="LinkedIn"
					class=" hover:text-primary transition-colors">
					<IconBrandLinkedin class="size-5" />
				</a>
				<a
					href="https://x.com"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Twitter"
					class=" hover:text-primary transition-colors">
					<IconBrandTwitter class="size-5" />
				</a>
				<Button variant="ghost" size="icon" aria-label="Toggle Dark Mode" onclick={toggleMode}>
					<IconSun class="size-5" />
					<!-- <IconMoon class="size-5" /> -->
				</Button>
			</div>
		</div>
	</div>
</footer>
