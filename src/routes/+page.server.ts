import { redirect } from "@sveltejs/kit"

export const load = async ({ locals }) => {
  const { userId } = locals.auth()
  if (userId) {
    redirect(302, "/billing")
  } else {
    redirect(302, "/sign-in")
  }
}
