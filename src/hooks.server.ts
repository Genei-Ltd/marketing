import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const { url } = event;
	if (url.pathname.startsWith("/news/") || url.pathname.startsWith("/coloop-blog/")) {
		const newPath = url.pathname.replace("/news/", "/blog/");
		throw redirect(308, newPath);
	}

	if (url.pathname.startsWith("/responsible-disclosure-policy")) {
		const newPath = url.pathname.replace("/responsible-disclosure-policy", "/legal/responsible-disclosure-policy");
		throw redirect(308, newPath);
	}

	if (url.pathname.startsWith("/company") || url.pathname.startsWith("/about")) {
		throw redirect(308, "/blog");
	}

	return resolve(event);
};
