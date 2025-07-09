import { getApprovedTestimonialsByPage } from "$lib/configs/testimonials"
import { redirect } from "@sveltejs/kit"

export async function load({ locals }) {
  const { userId } = locals.auth()

  if (userId) {
    return redirect(307, "/billing")
  }

  const testimonials = await getApprovedTestimonialsByPage("/sign-in", true)

  return {
    testimonials,
  }
}
