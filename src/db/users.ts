import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, firstName?: string, lastName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database user upsert failed:", error);
    throw new Error("Failed to register/sync user profile.", { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database fetch user failed:", error);
    throw new Error("Failed to fetch user.", { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error("Database fetch all users failed:", error);
    throw new Error("Failed to fetch users list.", { cause: error });
  }
}
