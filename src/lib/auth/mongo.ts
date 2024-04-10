import debug from "debug";
import { err, ok, ResultAsync } from "neverthrow";
import bcrypt from "bcrypt";
import db from "../../db/mongo";


export const mongo: AuthAdapter = {
	async login({ username, password, opts}) {
		if (!opts?.cookies) return err(new Error("must pass cookies in to options"));
		if (!username) return err(new Error("username is required"));
		if (!password) return err(new Error("password is required"));

		const users = db.collection("Users");
		const res = await users.find({ username
		}).toArray();
		if (res.length === 0) {
			return err(new Error("no user found"));
		}
		const user = res[0];
		if (! await bcrypt.compare(password, user.password)) {
			return err(new Error("incorrect password."));
		}

		// create session token
		// add token into db
		const session_id = make_session_id(16);
		const hashedSessionId = await bcrypt.hash(session_id, 10);
		const filter = { username: username };
		const options = { upsert: true };
		const updateDoc = { $set: { session_id: hashedSessionId } };

		const result = await db.collection("Sessions").updateOne(filter, updateDoc, options);

		opts.cookies.set("session_id", session_id, { path: "/" });


		console.log(session_id);
		console.log(hashedSessionId);

        return ok(session_id);
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

function make_session_id(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}