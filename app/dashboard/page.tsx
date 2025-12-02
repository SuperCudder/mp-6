import {auth, signIn, signOut} from "@/app/components/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Dashboard() {
    const session = await auth();
    if (!session) {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <header>
                Dashboard
            </header>
            <p className="text-xl font-bold text-white">
                <Image
                    src={session.user?.image || "/default-avatar.png"}
                    alt="user profile image"
                    width={100}
                    height={100}
                    className="rounded-full"
                />
                {session.user?.name},
                {session.user?.email},
            </p>
            <form action={async () => {
                "use server"
                await signOut()
            }}>
                <button type="submit">Sign Out</button>
            </form>
        </div>
    )

}