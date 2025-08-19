import type { LayoutServerLoad } from "./$types"
import { RAILWAY_GIT_COMMIT_SHA, RAILWAY_GIT_AUTHOR } from "$env/static/private"

export const load: LayoutServerLoad = () => {
	return {
		gitData: {
			RAILWAY_GIT_COMMIT_SHA,
			RAILWAY_GIT_AUTHOR,
		},
	}
}
