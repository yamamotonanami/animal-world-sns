import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/clerk/utils";
import TimelineClient from "@/components/TimelineClient";
import { SYSTEM_MESSAGES } from "@/lib/mock-data";
import { redirect } from "next/navigation";
import { ensureSupabaseUser } from "@/lib/supabase/auth-helpers";

export default async function Page() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureSupabaseUser();
  if (!user || !user.nickname) {
      redirect("/diagnosis");
  }

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      users (nickname, animal_types(id, name, sub_type), titles(name)),
      reactions (type, user_id)
    `)
    .eq("space_type", "forest")
    .order("created_at", { ascending: false });

  const formattedPosts = posts?.map((post: any) => {
    const myReactions = post.reactions.filter((r: any) => r.user_id === user.id);
    const tailActive = myReactions.some((r: any) => r.type === "tail");
    const groomActive = myReactions.some((r: any) => r.type === "groom");
    const stretchActive = myReactions.some((r: any) => r.type === "stretch");

    const tailCount = post.reactions.filter((r: any) => r.type === "tail").length;
    const groomCount = post.reactions.filter((r: any) => r.type === "groom").length;
    const stretchCount = post.reactions.filter((r: any) => r.type === "stretch").length;

    return {
      id: post.id,
      userId: post.users.id,
      nickname: post.users.nickname,
      title: post.users.titles?.name || "No Title",
      animalType: post.users.animal_types?.id,
      translatedContent: post.translated_content,
      originalContent: post.user_id === user.id ? post.original_content : null,
      spaceType: post.space_type,
      createdAt: post.created_at,
      reactions: {
        tail: { count: tailCount, active: tailActive },
        groom: { count: groomCount, active: groomActive },
        stretch: { count: stretchCount, active: stretchActive },
      },
    };
  }) || [];

  return (
    <TimelineClient
      initialPosts={formattedPosts}
      user={user}
      systemMessages={SYSTEM_MESSAGES.forest}
      spaceType="forest"
      headerTitle="森のタイムライン"
      headerDesc="木々のささやきに耳を澄ませて"
      backgroundStyle={{
        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2)), url('https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=1000&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      postingUI={{
          modalTitle: "木漏れ日の中で、つぶやく",
          inputPlaceholder: "木々に溶け込むような、今の気分は？",
          translatingText: "森のささやきに変えています...",
          submitButton: "風にのせて森へ放つ"
      }}
    />
  );
}
