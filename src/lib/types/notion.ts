import type {
	BlockObjectResponse,
	PageObjectResponse,
	PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"

// Notion API Types
export type NotionBlock = BlockObjectResponse
export type NotionPage = PageObjectResponse | PartialPageObjectResponse

export type RichText = {
	type: "text"
	text: {
		content: string
		link: {
			url: string
		} | null
	}
	annotations: {
		bold: boolean
		italic: boolean
		strikethrough: boolean
		underline: boolean
		code: boolean
		color: string
	}
	plain_text: string
	href: string | null
}

export type CoverImage = {
	type: "file"
	file: {
		url: string
		expiry_time: string
	}
}

export interface NotionPageProperties {
	"Cover Image": {
		id: string
		type: "files"
		files: CoverImage[]
	}
	Title: {
		id: "title"
		type: "title"
		title: RichText[]
	}
	"Published Date": {
		id: string
		type: "date"
		date: {
			start: string
			end: string | null
			time_zone: string | null
		}
	}
	Author: {
		id: string
		type: "rich_text"
		rich_text: RichText[]
	}
	"Author Image": {
		id: string
		type: "files"
		files: CoverImage[]
	}
	// Add other properties as needed
}

export interface NotionPageWithProperties extends Omit<PageObjectResponse, "properties"> {
	properties: NotionPageProperties
}
