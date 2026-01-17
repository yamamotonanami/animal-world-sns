import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/clerk/utils";
import TimelineClient from "@/components/TimelineClient";
import { SYSTEM_MESSAGES } from "@/lib/mock-data";
import { redirect } from "next/navigation";
import { ensureSupabaseUser } from "@/lib/supabase/auth-helpers";
import { AREAS_CONFIG } from "@/lib/constants";

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
      animalType: post.users.animal_types?.sub_type || "dog",
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

  const systemMsgs = SYSTEM_MESSAGES.forest || [];
  const postsWithSystem = [...formattedPosts];
  if (systemMsgs.length > 0) {
    const randomMsg = systemMsgs[Math.floor(Math.random() * systemMsgs.length)];
    const index = Math.floor(Math.random() * (postsWithSystem.length + 1));
    postsWithSystem.splice(index, 0, {
      id: `sys-forest-${Date.now()}`,
      isSystem: true,
      content: randomMsg,
      createdAt: new Date().toISOString(),
    } as any);
  }

  const config = AREAS_CONFIG.forest;

  return (
    <TimelineClient
      initialPosts={postsWithSystem}
      user={user}
      systemMessages={[]} // サーバー側で混ぜたので空にする
      spaceType={config.id}
      headerTitle={config.headerTitle}
      headerDesc={config.headerDesc}
      backgroundStyle={{
        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)), url('${config.bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
      postingUI={config.postingUI}
    />
  );
}
