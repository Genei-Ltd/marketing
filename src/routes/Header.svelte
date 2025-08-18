<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements"
	import { IconMenu2, IconX, IconChevronDown } from "@tabler/icons-svelte"

	import { Button } from "$lib/components/ui/button"
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js"
	import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte"
	import { cn } from "$lib/utils.js"
	import { fade, slide } from "svelte/transition"
	import { cubicInOut } from "svelte/easing"
	let mobileMenuOpen = $state(false)
	let openMobileSection = $state<string | null>(null)

	import { page } from "$app/state"

	let isBookDemoPage = $derived(page.url.pathname === "/book-a-demo")
	let isScrollDown = $state(false)

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen
		isScrollDown = false
	}

	function handleScroll() {
		isScrollDown = window.scrollY > 500
	}

	$effect(() => {
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	})

	function toggleMobileSection(section: string) {
		openMobileSection = openMobileSection === section ? null : section
		isScrollDown = false
	}

	type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
		title: string
		href: string
		content: string
	}

	const companyTypes = [
		{
			title: "Agency",
			href: "#research-agencies",
			description: "Solutions for agencies and consultants",
		},
		{
			title: "In-house team",
			href: "#in-house-strategy-teams",
			description: "Solutions for internal teams",
		},
		{
			title: "Independent researcher",
			href: "#independent-researchers",
			description: "Solutions for independent researchers",
		},
	]

	const useCases = [
		{
			title: "Concept testing",
			href: "#concept-testing",
			description: "Test and validate new concepts",
		},
		{
			title: "Message testing",
			href: "#concept-testing",
			description: "Test marketing messages and communications",
		},
		{
			title: "Brand positioning",
			href: "#concept-testing",
			description: "Research and refine brand positioning",
		},
		{
			title: "Customer experience",
			href: "#concept-testing",
			description: "Understand and improve customer experience",
		},
		{
			title: "Market entry",
			href: "#concept-testing",
			description: "Research for entering new markets",
		},
		{
			title: "Pricing research",
			href: "#concept-testing",
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
			href: "/careers",
			description: "Join our team and grow with us",
		},
		{
			title: "Security",
			href: "https://trust.coloop.ai/",
			description: "Learn about our security practices",
		},
	]
</script>

<div
	class="  fixed left-0 right-0 top-0 z-[99] bg-secondary/50 shadow-sm w-full border-b border-border/50 backdrop-blur-md transition-all duration-300">
	<div
		class="h-14 lg:px-10 flex items-center justify-between px-6 mx-auto font-sans transition-all duration-300 cubic-bezier(0.165, 0.84, 0.44, 1)
		{isBookDemoPage || isScrollDown ? 'max-w-full' : 'max-w-6xl'}">
		<!-- Logo -->
		<div class="flex items-center justify-start">
			<a href="/" class="flex items-center gap-2">
				<img src="/logos/CoLoop_Icon.svg" alt="CoLoop Logo" class="contrast-100 saturate-0 rounded-xl h-6" />
				<span class="text-foreground text-[20px] font-semibold">CoLoop</span>
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

		{#snippet ListItem({ title, content, href, class: className, ...restProps }: ListItemProps)}
			<li>
				<NavigationMenu.Link class="">
					{#snippet child()}
						<a
							{href}
							class={cn(
								" group/item hover:bg-primary/10 hover:text-primary-foreground focus:bg-primary/10 focus:text-primary-foreground block select-none space-y-1 rounded-md p-2 leading-none  outline-none transition-colors",
								className,
							)}
							{...restProps}>
							<div class="text-sm font-medium leading-none text-primary group-hover/item:underline">
								{title}
							</div>
							<p
								class="text-primary line-clamp-2 text-sm leading-snug opacity-80 group-hover:opacity-100">
								{content}
							</p>
						</a>
					{/snippet}
				</NavigationMenu.Link>
			</li>
		{/snippet}
		<!-- Desktop Navigation -->
		<div class="lg:flex hidden">
			<NavigationMenu.Root viewport={false}>
				<NavigationMenu.List>
					<NavigationMenu.Item>
						<NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class="grid gap-2 p-2 w-[400px] md:w-[500px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
								<li class="row-span-3">
									<NavigationMenu.Link
										class="relative flex flex-col justify-end w-full h-full p-6 overflow-hidden no-underline bg-transparent rounded-md outline-none select-none focus:shadow-md">
										{#snippet child({ props })}
											<a {...props} href="https://docs.coloop.ai/docs/">
												<img
													src="/images/base-5.png"
													alt="Resources"
													aria-hidden="true"
													class="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none" />
												<div
													class="from-primary/80 bg-gradient-to-t to-transparent absolute bottom-0 left-0 z-10 flex flex-col justify-end w-full h-full p-4 transition-all duration-300 ease-out">
													<div class="text-primary-foreground mb-2 mt-4 text-lg font-medium">
														Resources
													</div>
													<p class="text-primary-foreground/90 text-sm leading-tight">
														Learn how to use CoLoop effectively
													</p>
												</div>
											</a>
										{/snippet}
									</NavigationMenu.Link>
								</li>
								{@render ListItem({
									href: "https://docs.coloop.ai/docs/",
									title: "Documentation",
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
						<NavigationMenu.Trigger>Company</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class="grid w-[300px] gap-2 p-2">
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
						<NavigationMenu.Trigger>Use case</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class="grid w-[400px] gap-2 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
						<NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class="grid gap-2 p-2 w-[400px] md:w-[500px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
								<li class="row-span-3">
									<NavigationMenu.Link
										class="relative flex flex-col justify-end w-full h-full p-6 overflow-hidden no-underline bg-transparent rounded-md outline-none select-none focus:shadow-md">
										{#snippet child({ props })}
											<a {...props} href="https://community.coloop.ai/">
												<img
													src="/wild/super-car.png"
													alt="CoLoop Community"
													aria-hidden="true"
													class="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none" />
												<div
													class="from-primary/80 bg-gradient-to-t to-transparent absolute bottom-0 left-0 z-10 flex flex-col justify-end w-full h-full p-4 transition-all duration-300 ease-out">
													<div class="text-primary-foreground mb-2 mt-4 text-lg font-medium">
														CoLoop Community
													</div>
													<p class="text-primary-foreground/90 text-sm leading-tight">
														Join researchers worldwide and get expert support.
													</p>
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
						<NavigationMenu.Link>
							{#snippet child()}
								<a href="https://docs.coloop.ai/docs/" class={navigationMenuTriggerStyle()}>Docs</a>
							{/snippet}
						</NavigationMenu.Link>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<NavigationMenu.Link>
							{#snippet child()}
								<a href="/blog" class={navigationMenuTriggerStyle()}>Blog</a>
							{/snippet}
						</NavigationMenu.Link>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<Button variant="outline" size="default" href="https://app.coloop.ai" class="mr-2"
							>Login</Button>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<Button variant="default" size="default" href="/book-a-demo" class="">Get CoLoop</Button>
					</NavigationMenu.Item>
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
								href="https://docs.coloop.ai/docs/"
								class="hover:text-primary hover:bg-secondary/10 text-md block px-2 py-2 transition-colors rounded">
								<div class="font-medium">Documentation</div>
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
						Company
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
					<Button variant="outline" href="https://app.coloop.ai" class="justify-center w-full">Login</Button>
					<Button variant="default" href="/book-a-demo" class="justify-center w-full">Get CoLoop</Button>
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
