import { hash, compare } from "bcryptjs";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

async function ensureUsersFile() {
  await mkdir(path.dirname(USERS_PATH), { recursive: true });
  try {
    await readFile(USERS_PATH, "utf-8");
  } catch {
    await writeFile(USERS_PATH, "[]", "utf-8");
  }
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureUsersFile();
  const raw = await readFile(USERS_PATH, "utf-8");
  return JSON.parse(raw) as StoredUser[];
}

async function writeUsers(users: StoredUser[]) {
  await writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}

export async function findUserByEmail(email: string) {
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const users = await readUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("E-mail já cadastrado.");
  }

  const passwordHash = await hash(input.password, 10);
  const user: StoredUser = {
    id: randomUUID(),
    email: input.email.toLowerCase(),
    name: input.name?.trim() || input.email.split("@")[0],
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

export async function verifyUserPassword(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await compare(password, user.passwordHash);
  return ok ? user : null;
}
