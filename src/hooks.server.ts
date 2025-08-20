import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const { url } = event;
	if (url.pathname.startsWith("/news/") || url.pathname.startsWith("/coloop-blog/")) {
		const newPath = url.pathname.replace("/news/", "/blog/");
		throw redirect(308, newPath);
	}

	return resolve(event);
};
