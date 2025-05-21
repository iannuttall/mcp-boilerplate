# MCP Boilerplate: Simple Setup Guide

This project helps you create your own remote MCP server on Cloudflare with user login and payment options. You don't need to be a technical expert to get it running.

> [!NOTE]
> This project is now free to use and open source. If you want to support me, just follow me on X [@iannuttall](https://x.com/iannuttall) and subscribe to [my newsletter](https://ian.is).


## Quick Start MCP Ideas

Try these MCP server implementations with just one prompt:

- [![](https://b.lmpify.com/UI%20Image%20to%20Prompt%20MCP)](https://www.lmpify.com/implement-a-mcp-for-sfhrdr0)
- [![](https://b.lmpify.com/Prompt%20Improvement%20MCP)](https://www.lmpify.com/implement-a-mcp-for-7ouhhj0) 
- [![](https://b.lmpify.com/Fix%20My%20Mac%20MCP)](https://www.lmpify.com/implement-a-mcp-for-s2nlmi0)
- [![](https://b.lmpify.com/HTML%20Component%20Adder%20MCP)](https://www.lmpify.com/implement-a-mcp-for-jb7vp40)
- [![](https://b.lmpify.com/MCP%20Builder%20MCP)](https://www.lmpify.com/implement-a-mcp-for-xkgdtu0)

Simply click any button above, and lmpify will help you implement the MCP with detailed instructions.

## What You'll Get

- An MCP server that works with Cursor, Claude and other AI assistants
- User login with Google or GitHub
- Payment processing with Stripe
- The ability to create both free and paid MCP tools

## Setup Checklist

Before starting, make sure you have:

- Node.js installed (download from [nodejs.org](https://nodejs.org/))
- A Cloudflare account (sign up at [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up))
- A Google account for setting up login (or GitHub if you prefer)
- A Stripe account for payments (sign up at [dashboard.stripe.com/register](https://dashboard.stripe.com/register))

## Step-by-Step Setup

### Step 1: Get the Code

1. Clone this repository to your computer:
```bash
git clone https://github.com/iannuttall/mcp-boilerplate.git
cd mcp-boilerplate
```

2. Install everything needed:
```bash
npm install
```

### Step 2: Set Up the Database

1. Install Wrangler (Cloudflare's tool) if you haven't already:
```bash
npm install -g wrangler
```

2. Create a database for user login:
```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Note: you can't use a different name for this database. It has to be "OAUTH_KV".

3. After running this command, you'll see some text that includes `id` and `preview_id` values

4. Open the `wrangler.jsonc` file in the project folder

5. Look for the section with `"kv_namespaces": [`

6. Add your database information there:
```json
"kv_namespaces": [
  {
    "binding": "OAUTH_KV",
    "id": "paste-your-id-here",
    "preview_id": "paste-your-preview-id-here"
  }
]
```

### Step 3: Set Up Your Local Settings

1. Create a file for your settings:
```bash
cp .dev.vars.example .dev.vars
```

2. Open the `.dev.vars` file in your code editor

3. You'll need to add several values here (we'll get them in the next steps)

### Step 4a: Setting Up Google Login (Recommended)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project with any name you like
3. Go to "APIs & Services" > "Credentials"
4. Click "+ CREATE CREDENTIALS" and choose "OAuth client ID"
5. If prompted, set up a consent screen:
   - Choose "External" for User Type
   - Add an App name (like "My AI Tool")
   - Add your email address where required
   - You can skip the "Scopes" and "Test users" sections
6. For the OAuth client:
   - Select "Web application" for Application type
   - Give it a name
   - Under "Authorized redirect URIs" add the following:
```
http://localhost:8787/callback/google
```
7. Click "CREATE"
8. You'll now see your Client ID and Client Secret - copy these values
9. Add them to your `.dev.vars` file:
```ini
GOOGLE_CLIENT_ID="paste-your-client-id-here"
GOOGLE_CLIENT_SECRET="paste-your-client-secret-here"
```

Once you've completed this step, you can proceed directly to Step 5 if you don't need GitHub login.

### Step 4b: Setting Up GitHub Login (Optional)

If you prefer to use GitHub for login instead of Google:

1. Go to your GitHub account
2. Click on your profile picture in the top-right corner, then go to "Settings"
3. In the left sidebar, scroll down and click on "Developer settings"
4. Click on "OAuth Apps", then click the "New OAuth App" button
5. Fill in the form:
   - Application name: Give it a name (like "My AI Tool")
   - Homepage URL: `http://localhost:8787`
   - Application description: A brief description of your app (optional)
   - Authorization callback URL: `http://localhost:8787/callback/github`
6. Click "Register application"
7. On the next page, you'll see your Client ID
8. Click "Generate a new client secret"
9. Copy your Client Secret immediately (you won't be able to see it again)
10. Add these values to your `.dev.vars` file:
```ini
GITHUB_CLIENT_ID="paste-your-client-id-here"
GITHUB_CLIENT_SECRET="paste-your-client-secret-here"
```
11.  You'll also need to update the default authentication in your code:
    - Open `src/index.ts`
    - Find the import for Google handler: `import { GoogleHandler } from "./auth/google-handler";`
    - Replace it with: `import { GitHubHandler } from "./auth/github-handler";`
    - Find the line with `defaultHandler: GoogleHandler as any,`
    - Change it to: `defaultHandler: GitHubHandler as any,`

After completing either Step 4a or 4b, proceed to Step 5.

### Step 5: Setting Up Stripe Payments

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your test API key:
   - Go to Developers > API keys
   - Copy your "Secret key" (it starts with `sk_test_`)
3. Create a product and price:
   - Go to Products > Add Product
   - Give it a name and description
   - Add a price (this is what users will pay)
   - Save the product
   - After saving, find and copy the "Price ID" (it starts with `price_`)
4. Add these values to your `.dev.vars` file:
```ini
STRIPE_SECRET_KEY="sk_test_your-key-here"
STRIPE_SUBSCRIPTION_PRICE_ID="price_your-price-id-here"
STRIPE_METERED_PRICE_ID="your-stripe-metered-price-id"
```

### Step 5a: Configuring the Stripe Customer Billing Portal

This boilerplate includes a tool (`check_user_subscription_status`) that can provide your end-users with a link to their Stripe Customer Billing Portal. This portal allows them to manage their subscriptions, such as canceling them or, if you configure it, switching between different plans.

**Initial Setup (Important):**

By default, the Stripe Customer Billing Portal might not be fully configured in your Stripe account, especially in the test environment.

1.  After setting up your Stripe keys and products (Step 5) and running your server, you can test the `check_user_subscription_status` tool (e.g., via MCP Inspector, or by triggering it through an AI assistant).
2.  If the tool returns a JSON response where `billingPortal.message` contains an error like: *"Could not generate a link to the customer billing portal: No configuration provided and your test mode default configuration has not been created. Provide a configuration or create your default by saving your customer portal settings in test mode at https://dashboard.stripe.com/test/settings/billing/portal."*
3.  You **must** visit the URL provided in that error message (usually `https://dashboard.stripe.com/test/settings/billing/portal`) and save your portal settings in Stripe. This activates the portal for your test environment. You'll need to do a similar check and configuration for your live environment.

Once activated, the `check_user_subscription_status` tool will provide a direct link in the `billingPortal.url` field of its JSON response, which your users can use.

**Allowing Users to Switch Plans (Optional):**

By default, the billing portal allows users to cancel their existing subscriptions. If you offer multiple subscription products for your MCP server and want to allow users to switch between them:

1.  In your Stripe Dashboard, navigate to **Settings** (click the gear icon in the top-right) and then find **Customer portal** under "Billing". (Alternatively, use the direct link: `https://dashboard.stripe.com/settings/billing/portal` for live mode, or `https://dashboard.stripe.com/test/settings/billing/portal` for test mode).
2.  Under the "**Products**" section of the Customer Portal settings page, find "**Subscription products**".
3.  Enable the "**Customers can switch plans**" toggle.
4.  In the "Choose the eligible products that customers can update" subsection that appears, click to "**Find a test product...**" (or "Find a product..." in live mode) and add the other subscription products you want to make available for your users to switch to. The image you provided earlier shows this UI in Stripe.
5.  You can also configure other options here, like allowing customers to change the quantity of their plan if applicable.

This configuration empowers your users to manage their subscriptions more flexibly directly through the Stripe-hosted portal.

### Step 6: Complete Your Settings

Make sure your `.dev.vars` file has all these values:

```ini
BASE_URL="http://localhost:8787"
COOKIE_ENCRYPTION_KEY="generate-a-random-string-at-least-32-characters"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_SUBSCRIPTION_PRICE_ID="your-stripe-price-id"
STRIPE_METERED_PRICE_ID="your-stripe-metered-price-id"
```

For the `COOKIE_ENCRYPTION_KEY`, you can generate a random string with this command:

```bash
openssl rand -hex 32
```

### Step 7: Start Your Server Locally

1. Run this command to start your server:
```bash
npx wrangler dev
```

2. Your server will start at `http://localhost:8787`

3. The main endpoint for AI tools will be at `http://localhost:8787/sse`

### Step 8: Try It Out

You can test your server by connecting to it with an AI assistant:

1. Go to [Cloudflare AI Playground](https://playground.ai.cloudflare.com/)
2. Enter your server URL: `http://localhost:8787/sse`
3. You'll be redirected to log in with Google
4. After logging in, you can start testing the tools

Or with Claude Desktop:

1. Open Claude Desktop
2. Go to Settings > Developer > Edit Config
3. Add your server:
```json
{
  "mcpServers": {
    "my_server": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"
      ]
    }
  }
}
```
4. Restart Claude Desktop
5. Your tools should now be available in Claude

Or with MCP Inspector:

1. Run MCP Inspector and connect to your server:
```bash
npx @modelcontextprotocol/inspector@0.11.0 
```

> [!WARNING]
> The latest version of MCP Inspector is 0.12.0 but using npx @modelcontextprotocol/inspector@latest doesn't work right now. Working on it.

2. Enter your server URL: `http://localhost:8787/sse`
3. Use the web interface to test and debug your tools
4. You can directly call your tools, see the request/response data, and quickly iterate during development

### Step 9: Going Live (Deploying)

When you're ready to make your server available online:

1. Deploy to Cloudflare:
```bash
npx wrangler deploy
```

2. After deployment, you'll get a URL like `https://your-worker-name.your-account.workers.dev`

3a. Update your Google OAuth settings:
   - Go back to Google Cloud Console > APIs & Services > Credentials.
   - Edit your OAuth client.
   - Add another redirect URI: `https://your-worker-name.your-account.workers.dev/callback/google`.
   - Next, navigate to the "OAuth consent screen" page (still within "APIs & Services").
   - Under "Publishing status", if it currently shows "Testing", click the "Publish app" button and confirm to move it to "Production". This allows users outside your GSuite organization to use the login if you initially set it up as "External".

3b. Update your GitHub OAuth App settings: (optional)
   - Go to your GitHub Developer settings > OAuth Apps
   - Select your OAuth App
   - Update the "Authorization callback URL" to: `https://your-worker-name.your-account.workers.dev/callback/github`

4. Add your settings to Cloudflare by running these commands (you'll be prompted to enter each value):
```bash
npx wrangler secret put BASE_URL
npx wrangler secret put COOKIE_ENCRYPTION_KEY
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_SUBSCRIPTION_PRICE_ID
npx wrangler secret put STRIPE_METERED_PRICE_ID
```
   
   For the `BASE_URL`, use your Cloudflare URL: `https://your-worker-name.your-account.workers.dev`

## Creating Your Own Tools

You can easily create your own AI tools by adding new files to the `src/tools` folder. The project comes with examples of both free and paid tools.

### Creating a Free Tool

To create a free tool (one that users can access without payment):

1. Create a new file in the `src/tools` folder (for example: `myTool.ts`)
2. Copy this template from the existing `add.ts` example:

```typescript
import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";

export function myTool(agent: PaidMcpAgent<Env, any, any>) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "my_tool_name",                      // The tool name
    "This tool does something cool.",    // Description of what your tool does
    {                                    // Input parameters
      input1: z.string(),                // Parameter definitions using Zod
      input2: z.number()                 // E.g., strings, numbers, booleans
    },
    async ({ input1, input2 }: { input1: string; input2: number }) => ({
      // The function that runs when the tool is called
      content: [{ type: "text", text: `You provided: ${input1} and ${input2}` }],
    })
  );
}
```

3. Modify the code to create your own tool:
   - Change the function name (`myTool`)
   - Change the tool name (`my_tool_name`)
   - Update the description
   - Define the input parameters your tool needs
   - Write the code that runs when the tool is called

4. Add your tool to `src/tools/index.ts`:
```typescript
// Add this line with your other exports
export * from './myTool';
```

5. Register your tool in `src/index.ts`:
```typescript
// Inside the init() method, add:
tools.myTool(this);
```

### Creating Paid Tools: Subscription, Metered, or One-Time Payment

You can create tools that require payment in three ways: recurring subscriptions, metered usage, or one-time payments.

#### Option 1: Creating a Subscription-Based Paid Tool

This option is suitable if you want to charge users a recurring fee (e.g., monthly) for access to a tool or a suite of tools.

**Stripe Setup for Subscription Billing:**

1.  In your Stripe Dashboard, create a new Product.
2.  Give your product a name (e.g., "Pro Access Tier").
3.  Add a Price to this product:
    *   Select "Recurring" for the pricing model.
    *   Set the price amount and billing interval (e.g., $10 per month).
    *   Save the price.
4.  After creating the price, Stripe will show you the Price ID (e.g., `price_xxxxxxxxxxxxxx`). This is the ID you will use for `STRIPE_SUBSCRIPTION_PRICE_ID` in your `.dev.vars` file and when registering the tool.

**Tool Implementation:**

1.  Create a new file in the `src/tools` folder (for example: `mySubscriptionTool.ts`)
2.  Copy this template from the existing `subscriptionAdd.ts` example:

```typescript
import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";
import { REUSABLE_PAYMENT_REASON } from "../helpers/constants";

export function mySubscriptionTool(
  agent: PaidMcpAgent<Env, any, any>,
  env?: { STRIPE_SUBSCRIPTION_PRICE_ID: string; BASE_URL: string }
) {
  const priceId = env?.STRIPE_SUBSCRIPTION_PRICE_ID || null;
  const baseUrl = env?.BASE_URL || null;

  if (!priceId || !baseUrl) {
    throw new Error("Stripe Price ID and Base URL must be provided for paid tools");
  }

  agent.paidTool(
    "my_subscription_tool_name", // The tool name
    {
      // Input parameters
      input1: z.string(), // Parameter definitions using Zod
      input2: z.number(), // E.g., strings, numbers, booleans
    },
    async ({ input1, input2 }: { input1: string; input2: number }) => ({
      // The function that runs when the tool is called
      content: [
        { type: "text", text: `You provided: ${input1} and ${input2}` },
      ],
    }),
    {
      priceId, // Uses the Stripe price ID for a subscription product
      successUrl: `${baseUrl}/payment/success`,
      paymentReason: REUSABLE_PAYMENT_REASON, // General reason shown to user
    }
  );
}
```

3.  Modify the code:
    *   Change the function name (`mySubscriptionTool`)
    *   Change the tool name (`my_subscription_tool_name`)
    *   Update the input parameters and the tool's logic.
4.  Add your tool to `src/tools/index.ts`:
```typescript
// Add this line with your other exports
export * from './mySubscriptionTool';
```

5.  Register your tool in `src/index.ts`:
```typescript
// Inside the init() method, add:
tools.mySubscriptionTool(this, {
  STRIPE_SUBSCRIPTION_PRICE_ID: this.env.STRIPE_SUBSCRIPTION_PRICE_ID, // Ensure this matches a subscription Price ID
  BASE_URL: this.env.BASE_URL
});
```

#### Option 2: Creating a Metered-Usage Paid Tool

This option is suitable if you want to charge users based on how much they use an MCP tool.

**Stripe Setup for Metered Billing:**

1.  In your Stripe Dashboard, create a new Product.
2.  Add a Price to this product.
    *   Choose "Standard pricing" or "Package pricing" as appropriate for your model.
    *   **Under "Price options", check "Usage is metered".**
    *   You can then define how usage is reported (e.g., "per unit").
    *   If you want to offer a free tier (like the first 3 uses are free), you can set up "Graduated pricing". For example:
        *   First 3 units: $0.00 per unit
        *   Next units (4 and up): $0.10 per unit
3.  After creating the price, Stripe will show you the Price ID (e.g., `price_xxxxxxxxxxxxxx`).
4.  You will also need to define a "meter" in Stripe for this product/price if you haven't already. This meter will have an event name (e.g., `metered_add_usage`) that you'll use in your tool's code. You can usually set this up under the "Usage" tab of your product or when defining the metered price.

**Tool Implementation:**

1.  Create a new file in the `src/tools` folder (e.g., `myMeteredTool.ts`).
2.  Use this template, inspired by the `meteredAdd.ts` example:

```typescript
import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";
import { METERED_TOOL_PAYMENT_REASON } from "../helpers/constants"; // You might want a specific constant

export function myMeteredTool(
  agent: PaidMcpAgent<Env, any, any>,
  env?: { STRIPE_METERED_PRICE_ID: string; BASE_URL: string }
) {
  const priceId = env?.STRIPE_METERED_PRICE_ID || null;
  const baseUrl = env?.BASE_URL || null;

  if (!priceId || !baseUrl) {
    throw new Error("Stripe Metered Price ID and Base URL must be provided for metered tools");
  }

  agent.paidTool(
    "my_metered_tool_name", // The tool name
    {
      // Input parameters
      a: z.number(),
      b: z.number(),
    },
    async ({ a, b }: { a: number; b: number }) => {
      // The function that runs when the tool is called
      // IMPORTANT: Business logic for your tool
      const result = a + b; // Example logic
      return {
        content: [{ type: "text", text: String(result) }],
      };
    },
    {
      checkout: {
        success_url: `${baseUrl}/payment/success`,
        line_items: [
          {
            price: priceId, // Uses the Stripe Price ID for a metered product
          },
        ],
        mode: 'subscription', // Metered plans are usually set up as subscriptions
      },
      paymentReason:
        "METER INFO: Details about your metered usage. E.g., Your first X uses are free, then $Y per use. " +
        METERED_TOOL_PAYMENT_REASON, // Customize this message
      meterEvent: "your_meter_event_name_from_stripe", // ** IMPORTANT: Use the event name from your Stripe meter setup **
                                                     // e.g., "metered_add_usage"
    }
  );
}
```

3.  Modify the code:
    *   Change the function name (`myMeteredTool`).
    *   Change the tool name (`my_metered_tool_name`).
    *   Update the input parameters and the tool's core logic.
    *   **Crucially, update `meterEvent`** to match the event name you configured in your Stripe meter.
    *   Customize the `paymentReason` to clearly explain the metered billing to the user.
4.  Add your tool to `src/tools/index.ts`:
```typescript
// Add this line with your other exports
export * from './myMeteredTool';
```

5.  Register your tool in `src/index.ts`:
```typescript
// Inside the init() method, add:
tools.myMeteredTool(this, {
  STRIPE_METERED_PRICE_ID: this.env.STRIPE_METERED_PRICE_ID, // Ensure this matches your metered Price ID
  BASE_URL: this.env.BASE_URL
});
```

#### Option 3: Creating a One-Time Payment Tool

This option is suitable if you want to charge users a single fee for access to a tool, rather than a recurring subscription or usage-based metering.

**Stripe Setup for One-Time Payments:**

1.  In your Stripe Dashboard, create a new Product.
2.  Give your product a name (e.g., "Single Report Generation").
3.  Add a Price to this product:
    *   Select "One time" for the pricing model.
    *   Set the price amount.
    *   Save the price.
4.  After creating the price, Stripe will show you the Price ID (e.g., `price_xxxxxxxxxxxxxx`). This is the ID you will use for a new environment variable, for example, `STRIPE_ONE_TIME_PRICE_ID`.

**Tool Implementation:**

1.  Create a new file in the `src/tools` folder (for example: `myOnetimeTool.ts`).
2.  Use this template, inspired by the `onetimeAdd.ts` example:

```typescript
import { z } from "zod";
import { experimental_PaidMcpAgent as PaidMcpAgent } from "@stripe/agent-toolkit/cloudflare";
import { REUSABLE_PAYMENT_REASON } from "../helpers/constants"; // Or a more specific reason

export function myOnetimeTool(
  agent: PaidMcpAgent<Env, any, any>, // Adjust AgentProps if needed
  env?: { STRIPE_ONE_TIME_PRICE_ID: string; BASE_URL: string }
) {
  const priceId = env?.STRIPE_ONE_TIME_PRICE_ID || null;
  const baseUrl = env?.BASE_URL || null;

  if (!priceId || !baseUrl) {
    throw new Error("Stripe One-Time Price ID and Base URL must be provided for this tool");
  }

  agent.paidTool(
    "my_onetime_tool_name", // The tool name
    {
      // Input parameters
      input1: z.string(), // Parameter definitions using Zod
    },
    async ({ input1 }: { input1: string }) => ({
      // The function that runs when the tool is called
      content: [
        { type: "text", text: `You processed: ${input1}` },
      ],
    }),
    {
      checkout: { // Defines a one-time payment checkout session
        success_url: `${baseUrl}/payment/success`,
        line_items: [
          {
            price: priceId, // Uses the Stripe Price ID for a one-time payment product
            quantity: 1,
          },
        ],
        mode: 'payment', // Specifies this is a one-time payment, not a subscription
      },
      paymentReason: "Enter a clear reason for this one-time charge. E.g., 'Unlock premium feature X for a single use.'", // Customize this message
    }
  );
}
```

3.  Modify the code:
    *   Change the function name (`myOnetimeTool`).
    *   Change the tool name (`my_onetime_tool_name`).
    *   Update the input parameters and the tool's core logic.
    *   Ensure the `checkout.mode` is set to `'payment'`.
    *   Customize the `paymentReason` to clearly explain the one-time charge to the user.
4.  Add your tool to `src/tools/index.ts`:
```typescript
// Add this line with your other exports
export * from './myOnetimeTool';
```

5.  Register your tool in `src/index.ts`:
```typescript
// Inside the init() method, add:
tools.myOnetimeTool(this, {
  STRIPE_ONE_TIME_PRICE_ID: this.env.STRIPE_ONE_TIME_PRICE_ID, // Ensure this matches your one-time payment Price ID
  BASE_URL: this.env.BASE_URL
});
```
6. Remember to add `STRIPE_ONE_TIME_PRICE_ID` to your `.dev.vars` file and Cloudflare secrets:
   In `.dev.vars`:
```ini
STRIPE_ONE_TIME_PRICE_ID="price_your-onetime-price-id-here"
```
   And for production:
```bash
npx wrangler secret put STRIPE_ONE_TIME_PRICE_ID
```

You can create different paid tools with different Stripe products (subscription or metered) by creating additional price IDs in your Stripe dashboard and passing them as environment variables.

### What Happens When a Free User Tries a Paid Tool

When a user tries to access a paid tool without having purchased it:

1. The server checks if they've already paid
2. If not, the AI assistant will automatically prompt them with a checkout link
3. After completing payment on Stripe they should be able to use the tool immediately

## Future Enhancements (Optional)

### Setting Up Stripe Webhooks

The basic setup above is all you need to get started. The built-in Stripe integration verifies payments directly when users try to access paid tools - it checks both one-time payments and subscriptions automatically.

Webhooks are completely optional but could be useful for more complex payment scenarios in the future, like:

- Building a customer dashboard to display subscription status
- Implementing usage-based billing with metering
- Creating custom workflows when subscriptions are created or canceled
- Handling refunds and disputes with special logic

If you ever want to add webhook support:

1. Go to your Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. For the endpoint URL:
   - For local development: `http://localhost:8787/webhooks/stripe`
   - For production: `https://your-worker-name.your-account.workers.dev/webhooks/stripe`
4. For "Events to send", select events relevant to your needs, such as:
   - checkout.session.completed
   - invoice.payment_succeeded
   - customer.subscription.updated
5. After creating the webhook, copy the "Signing secret"
6. Add this value to your settings:
   - For local development, add to `.dev.vars`:
```ini
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret-here"
```
   - For production, set it using Wrangler:
```bash
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

## Need Help?

If you encounter any bugs or have issues with the boilerplate, please submit an issue on the GitHub repository. Please note that this project is provided as-is and does not include direct support.
