<script lang="ts">
	import Community from "./../lib/components/sections/Community.svelte"
	import type { HTMLAttributes } from "svelte/elements"

	import { Button } from "$lib/components/ui/button"
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js"
	import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte"
	import { cn } from "$lib/utils.js"

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

<div
	class="px-4 fixed left-0 right-0 top-0 z-[99] mx-auto w-full bg-card/50 backdrop-blur-sm transition-all duration-300">
	<div class=" max-w-7xl flex items-center justify-between mx-auto font-sans">
		<div class="flex items-center w-full gap-4">
			<a href="/" class="text-2xl font-bold">
				<img src="/logos/black.png" alt="Logo" class="dark:invert h-6" />
			</a>
		</div>

		<div class="flex items-center gap-4">
			{#snippet ListItem({ title, content, href, class: className, ...restProps }: ListItemProps)}
				<li>
					<NavigationMenu.Link>
						{#snippet child()}
							<a
								{href}
								class={cn(
									" hover:text-accent-foreground focus:text-accent-foreground mx-2 flex min-h-[80px] flex-col justify-start space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none",
									className,
								)}
								{...restProps}>
								<div class="text-base font-medium leading-none">{title}</div>
								<span class="text-muted-foreground line-clamp-2 flex-1 font-sans text-sm leading-snug">
									{content}
								</span>
							</a>
						{/snippet}
					</NavigationMenu.Link>
				</li>
			{/snippet}

			<NavigationMenu.Root viewport={false} class="md:block hidden">
				<NavigationMenu.List>
					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="hover:bg-transparent font-medium bg-transparent"
							>Product</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class="grid w-[460px] grid-cols-[200px_240px] grid-rows-3 justify-start gap-2 p-2">
								<li class="max-h-min grow-0 row-span-3">
									<NavigationMenu.Link
										class="focus:shadow-md relative flex flex-col justify-end w-full h-full p-6 bg-transparent rounded-md outline-none select-none">
										{#snippet child({ props })}
											<a
												{...props}
												href="/product"
												class="focus:shadow-md relative flex flex-col justify-end w-full h-full p-6 overflow-hidden no-underline bg-transparent rounded-md outline-none select-none">
												<img
													src="/images/amethyst-2.png"
													alt="Resources"
													aria-hidden="true"
													class="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none" />
												<div
													class="bg-background/50 absolute bottom-0 left-0 z-10 flex flex-col justify-end w-full h-full p-6">
													<div class="mt-4 mb-2 text-lg font-medium">CoLoop Resources</div>
													<span class="text-foreground opacity-80 text-sm leading-tight">
														Everything you need to get started with user research.
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
							<ul
								class="grid w-[240px] auto-cols-[240px] grid-flow-col grid-rows-3 justify-center gap-2 p-2">
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
						<NavigationMenu.Trigger class="hover:bg-transparent font-medium bg-transparent"
							>Use case</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul
								class="grid w-[400px] auto-cols-[240px] grid-flow-col grid-rows-3 justify-center gap-2 p-2 md:w-[500px]">
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
							<ul class="grid w-[460px] grid-cols-[200px_240px] grid-rows-3 justify-start gap-2 p-2">
								<li class="max-h-min grow-0 row-span-3">
									<NavigationMenu.Link
										class="focus:shadow-md relative flex flex-col justify-end w-full h-full p-6 no-underline bg-transparent rounded-md outline-none select-none">
										{#snippet child({ props })}
											<a
												{...props}
												href="https://community.coloop.ai/"
												class="focus:shadow-md relative flex flex-col justify-end w-full h-full p-6 overflow-hidden no-underline bg-transparent rounded-md outline-none select-none">
												<img
													src="/images/wild/super-car.png"
													alt="Resources"
													aria-hidden="true"
													class="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none" />
												<div
													class="from-background bg-gradient-to-t to-background/20 absolute bottom-0 left-0 z-10 flex flex-col justify-end w-full h-full p-6">
													<div class="text-foreground mt-4 mb-2 text-lg font-medium">
														Researcher Community
													</div>
													<span class="text-foreground opacity-80 text-sm leading-tight">
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
									href: "#",
									title: "Blog",
									content: "Read our latest insights and updates",
								})}
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<Button variant="ghost" size="lg" href="https://docs.coloop.ai/docs/" class="font-medium"
							>Docs</Button>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<Button variant="ghost" size="lg" href="/blog" class=" font-medium">Blog</Button>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<Button variant="outline" size="lg" href="/login" class="m-2 font-medium">Login</Button>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<Button variant="default" size="lg" href="/demo" class="font-medium">Get CoLoop</Button>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>
	</div>
</div>
