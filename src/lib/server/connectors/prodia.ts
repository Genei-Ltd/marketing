import { createProdia } from "prodia/v2"
// @ts-expect-error - SvelteKit environment import
import { PRIVATE_PRODIA_TOKEN } from "$env/dynamic/private"

const Prodia = createProdia({
	token: PRIVATE_PRODIA_TOKEN,
})

export async function generateAdWithLogo(prompt: string, logoUrl: string) {
	const logo = await (await fetch(logoUrl)).arrayBuffer()
	return await Prodia.job(
		{
			type: "inference.flux.dev.img2img.v2",
			config: {
				prompt: prompt,
				strength: 0.8,
			},
		},
		{
			inputs: [logo],
		},
	)
}

export async function fluxFillComposite(prompt: string, baseImageUrl: string, maskUrl: string, strength: number) {
	// get input image
	const sunnyDay = await (await fetch("https://docs.prodia.com/sunny-day.jpg")).arrayBuffer()

	const job = await Prodia.job(
		{
			type: "inference.flux.dev.img2img.v2",
			config: {
				prompt: "rainy landscape, 4k",
				strength: 0.8,
			},
		},
		{
			inputs: [sunnyDay],
		},
	)

	return await job.arrayBuffer()
}

export async function runWorkflow(prompt: string, baseImageUrl: string, maskUrl: string, strength: number) {
	const workflow = await Prodia.job({
		type: "workflow.serial.v1",
		config: {
			jobs: [
				{
					type: "inference.flux.dev.img2img.v2",
					config: {
						prompt: prompt,
						strength: strength,
					},
					inputs: [baseImageUrl, maskUrl],
				},
			],
		},
	})
}
