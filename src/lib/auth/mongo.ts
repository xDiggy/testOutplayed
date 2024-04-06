import debug from "debug";
import { err, ok, ResultAsync } from "neverthrow";
import bcrypt from "bcrypt";


export const pocketbase: AuthAdapter = {
	async login({ email, password }) {
        return ok(0);
	},

	async signup({ email, password, password_confirm }) {
        return ok(0);
	},

	async validate_session({ token }) {
		return ok(0);
	},

	async logout() {
		// This is a non-op because PocketBase doesn't have a logout endpoint.
		// since it uses JWTs.
		return ok(0);
	},
};

export async function verify_email(email: string) : Promise<boolean> {
    return true;
}


export async function verify_password(password: string) : Promise<boolean> {
    return true;
}

export async function verify_username(username: string) : Promise<boolean> {
    return true;
}

async function put_user(
	username: string,
	email: string,
	password: string
): Promise<void> {
    return;
}