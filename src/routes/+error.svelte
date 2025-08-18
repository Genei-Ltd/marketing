<script>
	import { page } from "$app/state"
</script>

<div class="flex min-h-screen items-center justify-center relative overflow-hidden">
	<img
		src="/images/base-5.png"
		alt="desert vista"
		class="object-cover w-full h-full rounded absolute top-0 left-0 blur scale-110 opacity-50" />
	<div class="flex flex-col items-center p-4 z-10 overflow-hidden max-w-6xl mx-auto">
		<div class="max-w-6xl text-center">
			<div
				class="flex flex-col items-center relative overflow-hidden aspect-[16/9] w-full h-full justify-center bg-black">
				<img
					src="/images/base-5.png"
					alt="old man"
					class="object-cover aspect-[16/9] w-full h-full rounded bg-black" />
				<div
					class=" lg:text-[200px] text-[100px] font-bold text-white inset-0 absolute z-20 text-center w-full h-full opacity-80 scale-190 flex items-center justify-center">
					<span class="self-center text-center lg:mb-8 mb-4">{page.status}</span>
				</div>
			</div>
			<h1 class="text-foreground font-bold mt-16">Something is not right...</h1>
			<p class="text-muted-foreground py-6 text-lg">
				Page error:

				<span class="text-muted-foreground py-6 text-lg font-semibold">
					{page.status}
					{page?.error?.message}
				</span>
			</p>
			<div class="mt-16">
				<a
					href="/"
					class="text-primary-foreground bg-primary hover:bg-primary/90 inline-block rounded-lg px-8 py-3 font-semibold transition-colors">
					Home
				</a>
			</div>
		</div>
	</div>
</div>
