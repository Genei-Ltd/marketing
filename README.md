# Commercial Team Demo

This is a commercial demo site built with SvelteKit that showcases CoLoop's qualification and pricing features.

## Features

### Pre-Qualification Flow
The demo now includes a pre-qualification step that collects user information before showing the main qualification questions:

1. **Email Collection**: Validates email and sends webhook on blur
2. **Discovery Source**: Optional field asking where users found CoLoop
3. **Product Interest**: Choice between "Qualification Questions" and "Open-Ended Analysis"
4. **Webhook Integration**: Sends data to external webhook endpoint for lead capture

#### Configuration

Set the webhook URL in your environment variables:

```bash
PUBLIC_PRE_QUALIFICATION_WEBHOOK_URL=https://your-webhook-endpoint.com/api/email-capture
```

#### Webhook Payload

The webhook receives a JSON payload with the following structure:

```json
{
  "email": "user@example.com",
  "discovery_source": "Google search",
  "product_interest": "qualification",
  "timestamp": "2024-01-01T12:00:00Z",
  "source": "demo_page",
  "user_agent": "Mozilla/5.0...",
  "referrer": "https://example.com",
  "url": "https://demo.coloop.ai/demo",
  "step": "pre_qualification",
  "form_completed": true
}
```

#### URL Parameters

You can pre-populate the email field using a URL parameter:

```
https://your-domain.com/demo?email=user@example.com
```

### Multi-Step Flow

The demo now uses a 2-step process:

1. **Step 1**: Pre-qualification (email, discovery source, product interest)
2. **Step 2**: Main qualification (existing qualification form)

Users can navigate back and forth between steps, and their information is preserved.

## Development

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file with:

```bash
# Pre-qualification webhook (required for email capture)
PUBLIC_PRE_QUALIFICATION_WEBHOOK_URL=https://your-webhook-endpoint.com/api/email-capture

# Stripe webhook secret (required for webhook signature verification)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Other environment variables as needed...
```

## License

MIT
