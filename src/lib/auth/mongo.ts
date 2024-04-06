import debug from "debug";
import { err, ok, ResultAsync } from "neverthrow";
import bcrypt from "bcrypt";
import db from "../../db/mongo";


export const mongo: AuthAdapter = {
	async login({ email, password }) {
        return ok(0);
	},

	async signup({ username, email, password, password_confirm }) {
		const salt_rounds = 10;
		const hashed_password = await bcrypt.hash(password, salt_rounds);
		try {
			await put_user(username, email, hashed_password);
			return ok(0);
		}
		catch (err) {
			return err;
		}
	},

	async validate_session({ token }) {
		return ok(0);
	},

	async logout() {
		return ok(0);
	},
};

export async function verify_email(email: string) : Promise<string> {
	if (!email)
		return "email is required.";
	
	const users = db.collection("Users");
	const res = await users.find({}, { projection: {
		email: 1,
	}}).toArray();
	for(let user of res){
		if (user.email === email) {
			return "email is already taken.";
		}
	}
    return "ok";
}


export function verify_password(password: string) : string {
	if (!password)
		return "password is required.";
	if (password.length <= 7)
		return "password must be at least 8 characters long.";
	if (password.length >= 33)
		return "password must be at most 32 characters long.";
    return "ok";
}

export async function verify_username(username: string) : Promise<string> {
	if (!username)
		return "username is required.";
	if (username.length <= 3)
		return "username must be at least 3 characters long.";
    if (username.length >= 16)
        return "username must be less than 17 characters long.";

	const users = db.collection("Users");
	const res = await users.find({}, { projection: {
		username: 1,
	}}).toArray();
	console.log(res.length)
	for(let user of res){
		console.log(user.username)
		if (user.username === username) {
			return "username is already taken.";
		}
	}
	return "ok";
}

// async function put_user(
// 	username: string,
// 	email: string,
// 	password: string
// ): Promise<void> {
//     return;
// }

async function put_user( username: string, email: string, password: string): Promise<void> {
	const users = db.collection("Users");
	try{
		const res = await users.insertOne({
			username: username,
			email: email,
			password: password,
			last_login: new Date(),
		});
	} catch (err) {
		console.log(err);
	}
}