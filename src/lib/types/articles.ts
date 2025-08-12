export type Article = {
	id?: string
	title: string
	excerpt?: string
	author: string
	slug: string
	company?: string
	companyLogo?: string
	coverImage?: string
	authorImage?: string
	category?: string[]
	tags?: string[]
	group?: string[]
	publishedDate?: string
	readingTime?: number
	seoDescription?: string
	featured?: boolean
	status?: string
	url?: string
	externalUrl?: string
	icon?: {
		type: "external"
		external: { url: string }
	} | null
	blocks?: unknown[]
}

// {
//   'SEO Description': { id: 'EtWT', type: 'rich_text', rich_text: [ [Object] ] },
//   Author: { id: 'Ls%40H', type: 'rich_text', rich_text: [ [Object] ] },
//   Slug: { id: 'SIbv', type: 'rich_text', rich_text: [ [Object] ] },
//   Featured: { id: '%5Ehs%3B', type: 'checkbox', checkbox: true },
//   Category: {
//     id: '%60KG%5C',
//     type: 'multi_select',
//     multi_select: [ [Object], [Object] ]
//   },
//   'Published Date': {
//     id: 'dhtj',
//     type: 'date',
//     date: { start: '2025-07-15', end: null, time_zone: null }
//   },
//   'Author Image': { id: 'peZE', type: 'files', files: [ [Object] ] },
//   Status: {
//     id: 'pzG%3A',
//     type: 'status',
//     status: { id: 'Aw<N', name: 'Published', color: 'green' }
//   },
//   'Cover Image': { id: 'rbnZ', type: 'files', files: [ [Object] ] },
//   Page: { id: 'zjf_', type: 'multi_select', multi_select: [ [Object] ] },
//   Tags: {
//     id: '~uDb',
//     type: 'multi_select',
//     multi_select: [ [Object], [Object] ]
//   },
//   Title: { id: 'title', type: 'title', title: [ [Object] ] }
// }
