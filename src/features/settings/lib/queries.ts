import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";

export type EditableProfile = {
  username: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export const getProfileForEdit = cache(async (userId: string): Promise<EditableProfile | null> => {
  const [profile] = await db
    .select({
      username: profiles.username,
      fullName: profiles.fullName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .where(eq(profiles.id, userId));

  return profile ?? null;
});
