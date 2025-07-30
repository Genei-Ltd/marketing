<script lang="ts">
	import { IconCheck } from "@tabler/icons-svelte"

	// ============================================================================
	// DATA CONFIGURATION - STATIC CONNECTED INTEGRATIONS
	// ============================================================================

	type Integration = {
		id: string
		name: string
		logo: string
	}

	// All integrations - all shown as connected
	const integrations: Integration[] = [
		// Video & Meeting Platforms
		{ id: "zoom", name: "Zoom", logo: "/integrations/zoom.png" },
		{ id: "teams", name: "Microsoft Teams", logo: "/integrations/teams.png" },
		{ id: "google-meet", name: "Google Meet", logo: "/integrations/google-meet.png" },
		{ id: "discuss", name: "Discuss.io", logo: "/integrations/discuss.png" },

		// Transcription & Translation Services
		{ id: "otter", name: "Otter.ai", logo: "/integrations/otter.png" },
		{ id: "rev", name: "Rev.com", logo: "/integrations/rev.png" },
		{ id: "yazi", name: "Yazi", logo: "/integrations/yazi.png" },

		// Research & Storage Tools
		{ id: "user-testing", name: "UserTesting", logo: "/integrations/user-testing.png" },
		{ id: "qualzy", name: "Qualzy", logo: "/integrations/qualzy.png" },
		{ id: "recollective", name: "Recollective", logo: "/integrations/recollective.png" },
		{ id: "onedrive", name: "OneDrive", logo: "/integrations/onedrive.png" },
		{ id: "sharepoint", name: "SharePoint", logo: "/integrations/sharepoint.png" },
		{ id: "field-notes", name: "Field Notes", logo: "/integrations/field-notes.png" },
		{ id: "capvision", name: "Capvision", logo: "/integrations/capvision.png" },
		{ id: "incling", name: "Incling", logo: "/integrations/incling.png" },
	]
</script>

<!-- ============================================================================ -->
<!-- STATIC INTEGRATION GRID
<!-- ============================================================================ -->

<div class="grid h-full max-w-4xl grid-cols-3 gap-4">
	{#each integrations as integration (integration.id)}
		<div class="hover:scale-105 relative transition-all duration-300">
			<div
				class="group backdrop-blur-sm bg-secondary/20 border-secondary/40 max-h-24 relative flex flex-col items-center justify-between w-full h-full p-2 transition-all duration-300 border rounded-lg shadow-md">
				<!-- Connected status indicator -->
				<div class="-top-2 -right-2 absolute">
					<div
						class="size-4 ring-2 ring-background bg-secondary flex items-center justify-center rounded-full shadow-lg">
						<IconCheck class="size-3.5 text-secondary-foreground" />
					</div>
				</div>

				<!-- Logo -->
				<img src={integration.logo} alt={integration.name} class="max-h-12 object-contain w-24 h-12" />

				<!-- Name -->
				<div class="text-secondary-foreground text-sm font-medium leading-tight text-center">
					{integration.name}
				</div>
			</div>
		</div>
	{/each}
</div>
<div class="flex flex-row items-center justify-center w-full mt-4">
	<div class="text-secondary-foreground text-sm font-semibold leading-tight text-center">+ More</div>
</div>
