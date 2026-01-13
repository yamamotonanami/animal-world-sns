import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/clerk/utils";
import TimelineClient from "@/components/TimelineClient";
import LandingPage from "@/components/LandingPage";
import { SYSTEM_MESSAGES } from "@/lib/mock-data";
import { redirect } from "next/navigation";
import { ensureSupabaseUser } from "@/lib/supabase/auth-helpers";

export default async function Page() {
  const userId = await getCurrentUserId();
  
  // 1. 未ログインならLPを表示
  if (!userId) {
    return <LandingPage />;
  }

  // 2. ログイン済みならユーザー同期＆住人登録チェック
  const user = await ensureSupabaseUser();
  if (!user) {
      redirect("/diagnosis"); 
  }
  
  if (!user.nickname) {
      redirect("/diagnosis"); // ニックネーム未登録なら登録画面へ
  }

  // 3. 全てOKならタイムラインを表示
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      users (nickname, animal_types(id, name, sub_type), titles(name)),
      reactions (type, user_id)
    `)
    .eq("space_type", "town")
    .order("created_at", { ascending: false });

  // Transform posts for UI
  const formattedPosts = posts?.map((post: any) => {
    // Check if current user reacted
    const myReactions = post.reactions.filter((r: any) => r.user_id === user.id);
    const tailActive = myReactions.some((r: any) => r.type === "tail");
    const groomActive = myReactions.some((r: any) => r.type === "groom");
    const stretchActive = myReactions.some((r: any) => r.type === "stretch");

    // Counts (calculate from all reactions)
    const tailCount = post.reactions.filter((r: any) => r.type === "tail").length;
    const groomCount = post.reactions.filter((r: any) => r.type === "groom").length;
    const stretchCount = post.reactions.filter((r: any) => r.type === "stretch").length;

    return {
      id: post.id,
      userId: post.users.id, // Supabase ID, not Clerk ID
      nickname: post.users.nickname,
      title: post.users.titles?.name || "No Title",
      animalType: post.users.animal_types?.id,
      translatedContent: post.translated_content,
      originalContent: post.original_content, // Should be hidden for others? RLS handles it. But we fetch * assuming RLS filters it?
      // Actually, standard SELECT * with RLS will return null for hidden columns if using column security, OR filter out ROWS.
      // But we are selecting ROWS. RLS filters ROWS.
      // If we want to hide a column for *other* users, we shouldn't select it, or RLS needs to be on a separate table.
      // For now, let's assume we trust the API or RLS.
      // If RLS policy says "Select * using true", then everyone sees everything!
      // My migration policy for posts was "Public can read translated content".
      // I commented: "Application must explicitly exclude 'original_content'".
      // So here: I am selecting *. I SHOULD NOT send original_content to client for others.
      // Logic:
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
      systemMessages={SYSTEM_MESSAGES.town}
      spaceType="town"
      headerTitle="街のタイムライン"
      headerDesc="賑やかな声が聞こえてきます"
      backgroundStyle={{
        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2)), url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      postingUI={{
          modalTitle: "街の広場で、ニュースを届ける",
          inputPlaceholder: "街の住人たちに伝えたいことは？",
          translatingText: "街の喧騒に馴染ませています...",
          submitButton: "街の掲示板にのこす"
      }}
    />
  );
}
