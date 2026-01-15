import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/clerk/utils";
import ProfileClient from "@/components/ProfileClient";
import { redirect } from "next/navigation";

export default async function Page() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();
  
  const { data: user, error } = await supabase
    .from("users")
    .select(`
      *,
      animal_types (id, name, sub_type),
      titles (id, name, code),
      user_titles (
        titles (id, name, code)
      )
    `)
    .eq("clerk_id", userId)
    .maybeSingle();

  if (error || !user || !user.nickname) {
    redirect("/diagnosis");
  }

  const formattedUser = {
    name: user.nickname,
    animal: user.animal_types?.sub_type || "dog",
    title: user.titles?.name || "ふわふわの新参者",
    // 修正：DBの 'code' を使ってフロントエンドと紐付ける
    unlockedTitles: user.user_titles?.map((ut: any) => ut.titles?.code).filter(Boolean) || [],
    postCount: user.post_count || 0,
    forestPostCount: user.forest_post_count || 0,
    lakePostCount: user.lake_post_count || 0,
    reactionTailCount: user.reaction_tail_count || 0,
    reactionGroomCount: user.reaction_groom_count || 0,
    reactionStretchCount: user.reaction_stretch_count || 0,
    lastArea: user.last_area || 'town',
  };

  return <ProfileClient initialUser={formattedUser} />;
}
