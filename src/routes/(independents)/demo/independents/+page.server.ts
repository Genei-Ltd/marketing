import { notionConnector } from "$lib/server/connectors/notion"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  try {
    // Fetch Notion content
    const pageId = "2166a3daa35a8005a8b7ee3161736494"

    // Fetch the page data and blocks with nested content
    const [page, blocks] = await Promise.all([
      notionConnector.getPage(pageId),
      notionConnector.getPageBlocksWithChildren(pageId),
    ])

    // Extract page title if it exists
    let pageTitle = "CoLoop for Independents"
    if ("properties" in page) {
      const titleProperty = Object.values(page.properties).find(
        (prop: any) => prop.type === "title",
      )
      if (titleProperty) {
        pageTitle =
          notionConnector.getPropertyValue(titleProperty, "title") || pageTitle
      }
    }

    return {
      pageTitle,
      blocks,
      pageId,
    }
  } catch (error) {
    console.error("Error loading independents page:", error)

    // Return demo content if anything fails
    return {
      pageTitle: "CoLoop for Independents",
      blocks: [
        {
          id: "demo-1",
          type: "heading_1",
          heading_1: {
            rich_text: [
              {
                plain_text: "Welcome to CoLoop for Independents",
                type: "text",
              },
            ],
          },
        },
        {
          id: "demo-2",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                plain_text:
                  "The perfect solution for independent consultants and freelancers. To connect to Notion, please set up your NOTION_TOKEN environment variable.",
                type: "text",
              },
            ],
          },
        },
      ],
      pageId: "independents",
      error: "Could not load Notion content. Using demo content instead.",
    }
  }
}
