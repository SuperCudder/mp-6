import { auth, signIn } from "@/app/components/auth"
import {redirect} from "next/navigation";

export default async function Home() {
    const session = await auth();
    if (session) {
        redirect("/dashboard")
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-mono">
        <div className="w-full max-w-2xl space-y-8 p-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-green-500 tracking-wider" style={{textShadow: '0 0 10px #00ff00'}}>
                    [GITHUB_OAUTH_DASHBOARD.EXE]
                </h1>
                <p className="text-green-400 text-sm">
                    &gt; SYSTEM READY // AUTHENTICATE WITH GITHUB
                </p>
                <p className="mt-2 text-green-500 animate-pulse">
                    █████████████████████████████
                </p>
            </div>

            <div className="border-2 border-green-500 rounded-lg p-6 space-y-6" style={{boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'}}>
                <div>
                    <p className="text-sm text-green-400 mb-4">
                        &gt; AUTHENTICATION_REQUIRED:
                    </p>
                    <p className="text-xs text-green-500">
                        Connect your GitHub account to access your profile dashboard with real-time statistics and activity tracking.
                    </p>
                </div>

                <form action={async () => {
                    "use server"
                    await signIn("github")
                }}>
                    <button
                        type="submit"
                        className="w-full border-2 border-green-500 bg-green-900 px-4 py-4 font-bold text-green-300 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                        style={{textShadow: '0 0 5px #00ff00'}}
                    >
                        [AUTHENTICATE_WITH_GITHUB]
                    </button>
                </form>

                <div className="text-center text-xs text-green-500 space-y-1">
                    <p>&gt; PROTOCOL: OAuth 2.0</p>
                    <p>&gt; PERMISSIONS: READ_ONLY</p>
                    <p>&gt; STATUS: AWAITING_AUTHENTICATION</p>
                </div>
            </div>
        </div>
    </div>
  );
}
