// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
/// <reference types="svelte-clerk/env" />

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			clerk: {
				auth: {
					isSignedIn: boolean
					[key: string]: any
				}
				client: ClerkClient
			}
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
