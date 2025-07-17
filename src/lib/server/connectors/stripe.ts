import Stripe from "stripe"

import { STRIPE_SECRET_KEY } from "$env/static/private"

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required")
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

/**
 * Cancel a Stripe subscription
 * @param subscriptionId - The ID of the subscription to cancel
 * @returns The canceled subscription object
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error("Error canceling subscription:", error)
    throw error
  }
}

/**
 * Get subscription details
 * @param subscriptionId - The ID of the subscription to retrieve
 * @returns The subscription object
 */
export async function getSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error("Error retrieving subscription:", error)
    throw error
  }
}

/**
 * List customer subscriptions
 * @param customerId - The ID of the customer
 * @returns List of customer subscriptions
 */
export async function listCustomerSubscriptions(
  customerId: string,
): Promise<Stripe.ApiList<Stripe.Subscription>> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    })
    return subscriptions
  } catch (error) {
    console.error("Error listing customer subscriptions:", error)
    throw error
  }
}

/**
 * Create a customer
 * @param params - Customer creation parameters
 * @returns The created customer object
 */
export async function createCustomer(
  params: Stripe.CustomerCreateParams,
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create(params)
    return customer
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

/**
 * Get customer details
 * @param customerId - The ID of the customer to retrieve
 * @returns The customer object
 */
export async function getCustomer(
  customerId: string,
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return customer as Stripe.Customer
  } catch (error) {
    console.error("Error retrieving customer:", error)
    throw error
  }
}

/**
 * Create a checkout session
 * @param params - Checkout session creation parameters
 * @returns The created checkout session object
 */
export async function createCheckoutSession(
  params: Stripe.Checkout.SessionCreateParams,
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create(params)
    return session
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw error
  }
}

/**
 * Create a billing portal session
 * @param params - Billing portal session creation parameters
 * @returns The created billing portal session object
 */
export async function createBillingPortalSession(
  params: Stripe.BillingPortal.SessionCreateParams,
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create(params)
    return session
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    throw error
  }
}

/**
 * Handle Stripe webhook events
 * @param payload - The webhook payload
 * @param signature - The webhook signature
 * @param endpointSecret - The webhook endpoint secret
 * @returns The constructed event object
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  endpointSecret: string,
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret,
    )
    return event
  } catch (error) {
    console.error("Error constructing webhook event:", error)
    throw error
  }
}
