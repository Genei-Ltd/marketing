<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements"
	import { IconMenu2, IconX, IconChevronDown } from "@tabler/icons-svelte"

	import { Button } from "$lib/components/ui/button"
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js"
	import { cn } from "$lib/utils.js"
	import { fade, slide } from "svelte/transition"
	import { cubicIn, cubicInOut, elasticOut } from "svelte/easing"
	let mobileMenuOpen = $state(false)
	let openMobileSection = $state<string | null>(null)

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen
	}

	function toggleMobileSection(section: string) {
		openMobileSection = openMobileSection === section ? null : section
	}

	type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
		title: string
		href: string
		content: string
	}

	const companyTypes = [
		{
			title: "Agency",
			href: "#",
			description: "Solutions for agencies and consultants",
		},
		{
			title: "In-house team",
			href: "#",
			description: "Solutions for internal teams",
		},
		{
			title: "Independent researcher",
			href: "#",
			description: "Solutions for independent researchers",
		},
	]

	const useCases = [
		{
			title: "Concept testing",
			href: "#",
			description: "Test and validate new concepts",
		},
		{
			title: "Message testing",
			href: "#",
			description: "Test marketing messages and communications",
		},
		{
			title: "Brand positioning",
			href: "#",
			description: "Research and refine brand positioning",
		},
		{
			title: "Customer experience",
			href: "#",
			description: "Understand and improve customer experience",
		},
		{
			title: "Market entry",
			href: "#",
			description: "Research for entering new markets",
		},
		{
			title: "Pricing research",
			href: "#",
			description: "Research pricing strategies and models",
		},
	]

	const resources = [
		{
			title: "Guides & tutorials",
			href: "https://docs.coloop.ai/docs/getting-started/introduction",
			description: "Learn how to use CoLoop effectively",
		},
		{
			title: "Community videos",
			href: "https://community.coloop.ai/",
			description: "Watch community-created content",
		},
		{
			title: "Blog",
			href: "/blog",
			description: "Read our latest insights and updates",
		},
		{
			title: "Careers",
			href: "#",
			description: "Join our team and grow with us",
		},
		{
			title: "Security",
			href: "https://trust.coloop.ai/",
			description: "Learn about our security practices",
		},
	]
</script>

<div class=" px-4 fixed left-0 right-0 top-0 z-[99] w-full bg-card/50 backdrop-blur-sm transition-all duration-300">
	<div class="max-w-7xl h-14 flex items-center justify-between mx-auto font-sans">
		<!-- Logo -->
		<div class="flex items-center justify-start">
			<a href="/" class="flex items-center gap-2">
				<img src="/logos/CoLoop_Icon.svg" alt="CoLoop Logo" class="contrast-100 saturate-0 rounded-xl h-6" />
				<h4 class="text-foreground font-semibold">CoLoop</h4>
			</a>
		</div>

		<!-- Mobile menu button -->
		<div class="lg:hidden flex items-center justify-center h-full">
			<Button
				variant="ghost"
				size="icon"
				onclick={toggleMobileMenu}
				class="relative w-10 h-10 overflow-hidden transition-all duration-300 ease-out">
				{#if mobileMenuOpen}
					<div
						in:fade={{ duration: 100 }}
						out:fade={{ duration: 100 }}
						class="absolute flex items-center justify-center w-full h-full">
						<IconX class="size-5" />
					</div>
				{:else}
					<div
						in:fade={{ duration: 100, delay: 100 }}
						out:fade={{ duration: 100 }}
						class=" absolute flex items-center justify-center w-full h-full">
						<IconMenu2 class="size-5" />
					</div>
				{/if}
			</Button>
		</div>

		<!-- Desktop Navigation -->
		<div class="lg:flex xl:gap-2 hidden gap-0">
			{#snippet ListItem({ title, content, href, class: className, ...restProps }: ListItemProps)}
				<li>
					<NavigationMenu.Link>
						{#snippet child()}
							<a
								{href}
								class={cn(
									" text-card-foreground focus:underline group underline-offset-2 hover:bg-primary/10  flex min-h-[80px] flex-col justify-start space-y-1 rounded p-2 leading-none no-underline transition-all outline-none select-none",
									className,
								)}
								{...restProps}>
								<div class="group-hover:underline text-base font-medium leading-none">{title}</div>
								<span
									class="text-card-foreground opacity-80 line-clamp-2 text-md flex-1 font-sans leading-snug">
									{content}
								</span>
							</a>
						{/snippet}
					</NavigationMenu.Link>
				</li>
			{/snippet}

			<NavigationMenu.Root>
				<NavigationMenu.List>
					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="hover:bg-transparent font-medium bg-transparent"
							>Product</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class=" grid w-fit grid-cols-[200px_240px] grid-rows-3 gap-2 p-4">
								<li class="max-h-min grow-0 row-span-3">
									<NavigationMenu.Link
										class="focus:shadow-md relative flex flex-col justify-end w-full h-full p-6 bg-transparent rounded outline-none select-none">
										{#snippet child({ props })}
											<a
												{...props}
												href="/product"
												class="focus:shadow-md relative flex flex-col justify-end w-full h-full p-6 overflow-hidden no-underline rounded outline-none select-none">
												<img
													src="/wild/vault.png"
													alt="Resources"
													aria-hidden="true"
													class="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none" />
												<div
													class=" bg-gradient-to-t from-primary/50 to-transparent absolute bottom-0 left-0 z-10 flex flex-col justify-end w-full h-full p-6 rounded">
													<div class="mt-4 mb-2 text-lg font-medium">CoLoop Resources</div>
													<span class="text-foreground opacity-80 text-md leading-tight">
														Everything you need to get started with research.
													</span>
												</div>
											</a>
										{/snippet}
									</NavigationMenu.Link>
								</li>
								{@render ListItem({
									href: "/product",
									title: "Product",
									content: "Learn how to use CoLoop effectively",
								})}
								{@render ListItem({
									href: "https://community.coloop.ai/",
									title: "Community videos",
									content: "Watch community-created content",
								})}
								{@render ListItem({
									href: "#",
									title: "Blog",
									content: "Read our latest insights and updates",
								})}
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="hover:bg-transparent font-medium bg-transparent"
							>Company type</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class="grid w-fit auto-cols-[240px] grid-flow-col grid-rows-3 gap-2 p-4">
								{#each companyTypes as item}
									{@render ListItem({
										href: item.href,
										title: item.title,
										content: item.description,
									})}
								{/each}
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="font-medium transition-colors bg-transparent"
							>Use case</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class="grid w-fit auto-cols-[240px] grid-flow-col grid-rows-3 gap-2 p-4">
								{#each useCases as item}
									{@render ListItem({
										href: item.href,
										title: item.title,
										content: item.description,
									})}
								{/each}
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="hover:bg-transparent font-medium bg-transparent"
							>Resources</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class="grid w-fit grid-cols-[200px_240px] grid-rows-3 gap-2 p-4">
								<li class="max-h-min grow-0 row-span-3">
									<NavigationMenu.Link
										class=" relative flex flex-col justify-end w-full h-full p-4 no-underline bg-transparent rounded-md outline-none select-none">
										{#snippet child({ props })}
											<a
												{...props}
												href="https://community.coloop.ai/"
												class="focus:shadow-md relative flex flex-col justify-end w-full h-full p-6 overflow-hidden no-underline bg-transparent rounded-md outline-none select-none">
												<img
													src="/wild/super-car.png"
													alt="Resources"
													aria-hidden="true"
													class="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none" />
												<div
													class="from-background bg-gradient-to-t to-transparent hover:to-background/20 absolute bottom-0 left-0 z-10 flex flex-col justify-end w-full h-full p-6 transition-all duration-300">
													<div class="text-card-foreground mt-4 mb-2 text-lg font-medium">
														Researcher Community
													</div>
													<span class="text-card-foreground opacity-80 text-md leading-tight">
														Join the CoLoop community and get support from other
														researchers.
													</span>
												</div>
											</a>
										{/snippet}
									</NavigationMenu.Link>
								</li>
								{@render ListItem({
									href: "https://docs.coloop.ai/docs/getting-started/introduction",
									title: "Guides & tutorials",
									content: "Learn how to use CoLoop effectively",
								})}
								{@render ListItem({
									href: "https://community.coloop.ai/",
									title: "Community videos",
									content: "Watch community-created content",
								})}
								{@render ListItem({
									href: "/blog",
									title: "Blog",
									content: "Read our latest insights and updates",
								})}
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<Button variant="ghost" size="default" href="https://docs.coloop.ai/docs/" class=" font-medium"
							>Docs</Button>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<Button variant="ghost" size="default" href="/blog" class=" font-medium">Blog</Button>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<Button variant="outline" size="default" href="/login" class=" font-medium">Login</Button>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<Button variant="default" size="default" href="/demo" class="font-medium">Get CoLoop</Button>
					</NavigationMenu.Item>
					<NavigationMenu.Indicator />
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>
	</div>

	<!-- <div class="bg-card/80 backdrop-blur-lg flex flex-col h-full p-8 mt-8">this is a test</div> -->
	<!-- Mobile Menu Overlay -->
	{#if mobileMenuOpen}
		<div
			class="lg:hidden top-14 inset-0 z-50 flex flex-col h-full px-4 py-6 mx-auto space-y-4"
			onclick={toggleMobileMenu}
			onkeydown={(e) => e.key === "Escape" && toggleMobileMenu()}
			role="dialog"
			aria-modal="true"
			aria-label="Mobile navigation menu"
			tabindex="-1"
			in:slide={{ duration: 500, axis: "y", easing: cubicInOut }}
			out:slide={{ duration: 500, axis: "y", easing: cubicInOut }}>
			<div class=" flex flex-col h-full">
				<!-- Product Section -->
				<div class="border-border/50 pb-2 border-b">
					<button
						onclick={(e) => {
							e.stopPropagation()
							toggleMobileSection("product")
						}}
						class="hover:text-primary hover:bg-secondary/20 flex items-center justify-between w-full px-2 py-2 font-medium text-left transition-colors rounded-md">
						Product
						<IconChevronDown
							class={cn(
								"size-4 transition-transform",
								openMobileSection === "product" && "rotate-180",
							)} />
					</button>
					{#if openMobileSection === "product"}
						<div class="pl-4 my-2 space-y-2">
							<a
								href="/product"
								class="hover:text-primary hover:bg-secondary/10 text-md block px-2 py-2 transition-colors rounded">
								<div class="font-medium">Product</div>
								<div class="text-card-foreground opacity-80 text-sm">
									Learn how to use CoLoop effectively
								</div>
							</a>
							<a
								href="https://community.coloop.ai/"
								class="hover:text-primary hover:bg-secondary/10 text-md block px-2 py-2 transition-colors rounded">
								<div class="font-medium">Community videos</div>
								<div class="text-card-foreground opacity-80 text-sm">
									Watch community-created content
								</div>
							</a>
							<a
								href="/blog"
								class="hover:text-primary hover:bg-secondary/10 text-md block px-2 py-2 transition-colors rounded">
								<div class="font-medium">Blog</div>
								<div class="text-card-foreground opacity-80 text-sm">
									Read our latest insights and updates
								</div>
							</a>
						</div>
					{/if}
				</div>

				<!-- Company Type Section -->
				<div class="border-border py-2 border-b">
					<button
						onclick={(e) => {
							e.stopPropagation()
							toggleMobileSection("company")
						}}
						class="hover:text-primary hover:bg-secondary/20 flex items-center justify-between w-full px-2 py-2 font-medium text-left transition-colors rounded-md">
						Company type
						<IconChevronDown
							class={cn(
								"size-4 transition-transform",
								openMobileSection === "company" && "rotate-180",
							)} />
					</button>
					{#if openMobileSection === "company"}
						<div class="pl-4 my-2 space-y-2">
							{#each companyTypes as item}
								<a
									href={item.href}
									class="hover:text-primary hover:bg-secondary/10 text-md block px-2 py-2 transition-colors rounded">
									<div class="font-medium">{item.title}</div>
									<div class="text-card-foreground opacity-80 text-sm">{item.description}</div>
								</a>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Use Case Section -->
				<div class="border-border py-2 border-b">
					<button
						onclick={(e) => {
							e.stopPropagation()
							toggleMobileSection("usecase")
						}}
						class="hover:text-primary hover:bg-secondary/20 flex items-center justify-between w-full px-2 py-2 font-medium text-left transition-colors rounded-md">
						Use case
						<IconChevronDown
							class={cn(
								"size-4 transition-transform",
								openMobileSection === "usecase" && "rotate-180",
							)} />
					</button>
					{#if openMobileSection === "usecase"}
						<div class="pl-4 my-2 space-y-2">
							{#each useCases as item}
								<a
									href={item.href}
									class="hover:text-primary hover:bg-secondary/10 text-md block px-2 py-2 transition-colors rounded">
									<div class="font-medium">{item.title}</div>
									<div class="text-card-foreground opacity-80 text-md">{item.description}</div>
								</a>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Resources Section -->
				<div class="border-border py-2 border-b">
					<button
						onclick={(e) => {
							e.stopPropagation()
							toggleMobileSection("resources")
						}}
						class="hover:text-primary hover:bg-secondary/20 flex items-center justify-between w-full px-2 py-2 font-medium text-left transition-colors rounded-md">
						Resources
						<IconChevronDown
							class={cn(
								"size-4 transition-transform",
								openMobileSection === "resources" && "rotate-180",
							)} />
					</button>
					{#if openMobileSection === "resources"}
						<div class="pl-4 mt-2 space-y-3">
							{#each resources as item}
								<a
									href={item.href}
									class="hover:text-primary hover:bg-secondary/10 text-md block px-2 py-2 transition-colors rounded">
									<div class="font-medium">{item.title}</div>
									<div class="text-card-foreground opacity-80 text-sm">{item.description}</div>
								</a>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Direct Links -->
				<div class="py-2 space-y-2">
					<a
						href="https://docs.coloop.ai/docs/"
						class="hover:text-primary hover:bg-secondary/10 block px-2 py-2 font-medium transition-colors rounded"
						>Docs</a>
					<a
						href="/blog"
						class="hover:text-primary hover:bg-secondary/10 block px-2 py-2 font-medium transition-colors rounded"
						>Blog</a>
				</div>

				<!-- CTA Buttons -->
				<div class="flex flex-col gap-2 pt-4">
					<Button variant="outline" href="/login" class="justify-center w-full">Login</Button>
					<Button variant="default" href="/demo" class="justify-center w-full">Get CoLoop</Button>
				</div>
			</div>
		</div>
	{/if}
</div>

{#if mobileMenuOpen}
	<div
		in:fade={{ duration: 100 }}
		out:fade={{ duration: 100 }}
		class="bg-primary/90 backdrop-blur-sm absolute inset-0 z-[98] h-full"
		onclick={toggleMobileMenu}
		onkeydown={(e) => e.key === "Escape" && toggleMobileMenu()}
		role="dialog"
		aria-modal="true"
		aria-label="Mobile navigation menu"
		tabindex="-1">
	</div>
{/if}
