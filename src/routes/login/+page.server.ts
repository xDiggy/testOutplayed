import { auth } from "$lib/auth";
import { AUTH_TOKEN_EXPIRY_SECONDS } from "$lib/constants.server";
import { invalid, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import debug from "debug";
import { mongo } from "$lib/auth/mongo";

const log = debug("app:routes:login:page.server");

export const actions: Actions = {
	async default(event) {
		const data = await event.request.formData();
		const email = data.get("email") as string;
		const password = data.get("password") as string;
		const username = data.get("username") as string;

		const resp = await mongo.login({
			username,
			password,
			opts: { cookies: event.cookies },
		});


		if (resp.isErr()) {
			const error = (
				String(resp.error) ??
				"No account with that email or username could be found."
			).trim();
			return invalid(401, { email, error });
		}

		console.log("logged response:", resp);

		// if (resp.isOk()) {
		// 	const token = resp.value;
		// 	// event.cookies.set("auth_token", token, { path: "/", maxAge: AUTH_TOKEN_EXPIRY_SECONDS });
		// 	delete resp.value;
		// }

		// console.log("bullshit", event.cookies.get("session_id"));

	
		// return {resp};
		// return;

		// const user = resp.value;

		// log("user:", user);

		// if (user && user.token) {
		// 	// TODO: duplicated in login page
		// 	event.cookies.set("auth_token", `${user.id}:${user.token}`, {
		// 		path: "/",
		// 		maxAge: AUTH_TOKEN_EXPIRY_SECONDS,
		// 	});
		// }

		// log("redirecting user...");

		// delete user.token;

		// return { user };
		const user = { token: "" };
		user.token = resp.value;
		console.log("user:", user);
		return { user };
	},
};
