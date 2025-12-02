import { auth, signIn } from "@/app/components/auth"
import {redirect} from "next/navigation";

export default async function Home() {
    const session = await auth();
    if (session) {
        redirect("/dashboard")
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <form action={async () => {
            "use server"
            await signIn("github")
        }}>
            <button type="submit">Sign in with Github</button>
        </form>
    </div>
  );
}
