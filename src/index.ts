import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { GoogleHandler } from "./auth/google-handler";
import { Props } from "./auth/oauth";
import {
	PaymentState,
	experimental_PaidMcpAgent as PaidMcpAgent,
  } from '@stripe/agent-toolkit/cloudflare';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import stripeWebhookHandler from "./webhooks/stripe";
import * as tools from './tools';

type State = PaymentState & {};

type AgentProps = Props & {
	STRIPE_SUBSCRIPTION_PRICE_ID: string;
	BASE_URL: string;
};

// Define our MCP agent with tools
export class BoilerplateMCP extends PaidMcpAgent<Env, State, AgentProps> {
	server = new McpServer({
		name: "Boilerplate MCP",
		version: "1.0.0",
	});

	async init() {
		// Example free tools (that don't require payment but do require a logged in user)
		tools.addTool(this);
		tools.calculateTool(this);
		tools.vibeCoderTool(this);

		// Example of a free tool that checks for active subscriptions and the status of the logged in user's Stripe customer ID
		tools.checkPaymentHistoryTool(this, {
			BASE_URL: this.env.BASE_URL,
			STRIPE_SECRET_KEY: this.env.STRIPE_SECRET_KEY
		});

		// Example of a paid tool that requires a logged in user and a one-time payment
		tools.onetimeAddTool(this, {
			STRIPE_ONE_TIME_PRICE_ID: this.env.STRIPE_ONE_TIME_PRICE_ID,
			BASE_URL: this.env.BASE_URL
		});

		// Example of a paid tool that requires a logged in user and a subscription
		tools.subscriptionTool(this, {
			STRIPE_SUBSCRIPTION_PRICE_ID: this.env.STRIPE_SUBSCRIPTION_PRICE_ID,
			BASE_URL: this.env.BASE_URL
		});

		// Example of a paid tool that requires a logged in user and a subscription with metered usage
		tools.meteredAddTool(this, {
			STRIPE_METERED_PRICE_ID: this.env.STRIPE_METERED_PRICE_ID,
			BASE_URL: this.env.BASE_URL
		});
	}
}

// Create an OAuth provider instance for auth routes
const oauthProvider = new OAuthProvider({
	apiRoute: "/sse",
	apiHandler: BoilerplateMCP.mount("/sse") as any,
	defaultHandler: GoogleHandler as any,
	authorizeEndpoint: "/authorize",
	tokenEndpoint: "/token",
	clientRegistrationEndpoint: "/register",
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		
		// Handle homepage
		if (path === "/" || path === "") {
			// @ts-ignore
			const homePage = await import('./pages/index.html');
			return new Response(homePage.default, {
				headers: { "Content-Type": "text/html" },
			});
		}

		// Handle payment success page
		if (path === "/payment/success") {
			// @ts-ignore
			const successPage = await import('./pages/payment-success.html');
			return new Response(successPage.default, {
				headers: { "Content-Type": "text/html" },
			});
		}
		
		// Handle webhook
		if (path === "/webhooks/stripe") {
			return stripeWebhookHandler.fetch(request, env);
		}
		
		// All other routes go to OAuth provider
		return oauthProvider.fetch(request, env, ctx);
	},
};