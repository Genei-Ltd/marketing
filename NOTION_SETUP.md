# Notion Integration Setup

This guide will help you set up the Notion integration for your demo page.

## 🚀 Quick Setup

### 1. Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Give it a name (e.g., "CoLoop Demo")
4. Select your workspace
5. Click **"Submit"**
6. Copy the **"Internal Integration Token"** (starts with `secret_`)

### 2. Set Up Environment Variable

Add the token to your `.env` file:

```bash
# Add this to your .env file
NOTION_TOKEN=secret_your_notion_integration_token_here
```

### 3. Create a Demo Page in Notion

1. Create a new page in your Notion workspace
2. Add some content:
   - Headings (H1, H2, H3)
   - Paragraphs with **bold**, *italic*, and `code` text
   - Bullet points and numbered lists
   - Images
   - Videos (YouTube, Vimeo, Loom embeds)
   - Quotes and callouts
3. Copy the page ID from the URL:
   - URL: `https://notion.so/Your-Page-Title-abc123def456...`
   - Page ID: `abc123def456...` (the part after the last dash)

### 4. Update the Demo Page

Edit `src/routes/(independents)/demo/+page.server.ts` and replace:

```typescript
const pageId = 'your-notion-page-id-here';
```

With your actual page ID:

```typescript
const pageId = 'abc123def456...'; // Your actual page ID
```

### 5. Share the Page with Your Integration

1. Go to your Notion page
2. Click **"Share"** in the top right
3. Click **"Invite"**
4. Search for your integration name
5. Select it and click **"Invite"**

## 🎉 Test It Out

1. Start your development server: `npm run dev`
2. Visit: `http://localhost:5173/demo`
3. You should see your Notion content rendered beautifully!

## 📝 Supported Content Types

The NotionContent component supports:

- **Text**: Paragraphs with rich formatting (bold, italic, code, links)
- **Headings**: H1, H2, H3
- **Lists**: Bullet points and numbered lists
- **Media**: Images and videos (YouTube, Vimeo, Loom)
- **Interactive**: To-do lists, toggles
- **Special**: Quotes, callouts, code blocks, dividers
- **Embeds**: General embed support

## 🔧 Customization

### Styling
The component uses Tailwind CSS classes. You can customize the styling by editing `src/lib/components/NotionContent.svelte`.

### Adding More Block Types
To support additional Notion block types, add new conditions in the `{#if block.type === '...'}` chain in the component.

### Custom Functions
Use the helper functions in `src/lib/server/connectors/notion-example.ts` for more advanced data processing.

## 🐛 Troubleshooting

### "NOTION_TOKEN environment variable is required"
- Make sure you've added `NOTION_TOKEN=...` to your `.env` file
- Restart your development server after adding the environment variable

### "Failed to fetch page"
- Check that the page ID is correct
- Make sure you've shared the page with your integration
- Verify the integration has access to the workspace

### Demo content showing instead of Notion content
- This means the Notion API call failed
- Check the server console for error messages
- Verify your token and page ID are correct

## 📚 Learn More

- [Notion API Documentation](https://developers.notion.com/)
- [Notion Block Types](https://developers.notion.com/reference/block)
- [SvelteKit Server-side Loading](https://kit.svelte.dev/docs/loading)

---

Happy coding! 🚀 