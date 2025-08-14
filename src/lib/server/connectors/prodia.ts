import { createProdia } from "prodia/v2"

import { PRIVATE_PRODIA_TOKEN } from "$env/static/private"

const Prodia = createProdia({
	token: PRIVATE_PRODIA_TOKEN,
})

export async function generateAdWithLogo(prompt: string, logoUrl: string) {
	const logo = await (await fetch(logoUrl)).arrayBuffer()
	console.log("logo", logo)
	console.log("prompt", prompt)
	console.log("logoUrl", logoUrl)
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

export async function runWorkflow(
	prompt: string,
	baseImageUrl: string,
	maskUrl: string,
	advertImage: string,
	strength: number,
	brandLogo?: string,
) {
	const workflow = await Prodia.job({
		type: "workflow.serial.v1",
		config: {
			jobs: [
				{
					type: "inference.flux.dev.img2img.v2",
					config: {
						prompt: "rainy landscape, 4k",
						strength: 0.8,
					},
					inputs: [brandLogo ? brandLogo : ""],
				},
				{
					type: "inference.flux.dev.img2img.v2",
					config: {
						prompt: prompt,
						strength: strength,
					},
					inputs: [baseImageUrl, maskUrl, advertImage],
				},
			],
		},
	})

	return await workflow.arrayBuffer()
}
