import { mongo } from "$lib/auth/mongo";
import { AUTH_TOKEN_EXPIRY_SECONDS } from "$lib/constants.server";
import { invalid, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

import { verify_email, verify_password, verify_username } from "$lib/auth/mongo";

import { MONGO_URL } from "$env/static/private";
import { invalid_attribute_name_character } from "svelte/internal";

export const actions: Actions = {
	async default(event) {
		const data = await event.request.formData();
		const email = data.get("email") as string;
		const password = data.get("password") as string;
		const password_confirm = data.get("password-confirm") as string;

		const username = data.get("username") as string;

		console.log(username, email, password);

		// return;

		console.log(await verify_username(username));

		const user_res = await verify_username(username);
		const email_res = await verify_email(email);
		const password_res = verify_password(password);

		if (user_res !== "ok") {
			return invalid(422, { username, error: user_res });
		}
		if (email_res !== "ok") {
			return invalid(422, { email, error: email_res });
		}
		if (password_res != "ok") {
			return invalid(422, { password, error: password_res });
		}
		if (password !== password_confirm){
			return invalid(422, {
				password_confirm,
				error: "Your passwords must match.",
			});
		}

		const signup_resp = await mongo.signup({
			username,
			email,
			password,
			password_confirm,
			opts: { cookies: event.cookies },
		});

		if (signup_resp.isErr()) {
			const error = (
				String(signup_resp.error) ??
				"There was an issue creating your account. Please try again."
			).trim();
			return invalid(500, { email, error });
		}

		// return;

		// Sign the user in immediately
		const login_resp = await mongo.login({
			username,
			password,
			opts: { cookies: event.cookies },
		});

		console.log("login_resp:", login_resp);

		// const myUser = { token: ""};
		// console.log("sign up cookied: ", event.cookies.get("session_id"));
		// return;


		if (login_resp.isErr()) {
			const error = (
				String(login_resp.error) ?? "Could not sign you in. Please try again."
			).trim();
			return invalid(500, { email, error });
		}

		const user = { token: login_resp.value};
		return user;


		// const user = login_resp.value;
		// if (user?.id && user?.token) {
		// 	// TODO: duplicated in login page
		// 	event.cookies.set("auth_token", `${user.id}:${user.token}`, {
		// 		path: "/",
		// 		maxAge: AUTH_TOKEN_EXPIRY_SECONDS,
		// 	});
		// }

		// delete user.token;

		// return { user };
	},
};
