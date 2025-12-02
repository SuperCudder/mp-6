import {auth, signIn, signOut} from "@/app/components/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Dashboard() {
    const session = await auth();
    if (!session) {
        redirect("/");
    }

    const userData = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        }
    }).then(res => res.json());

    const repos = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        }
    }).then(res => res.json());

    const accountAge = new Date(userData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const languageCounts: Record<string, number> = {};

    repos.forEach((repo: any) => {
        if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
    });

    const topLangs = Object.entries(languageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Top 5 languages
        .map(([lang, count]) => ({ language: lang, count }));

    const topRepos = repos.sort((a: any, b: any) => b.startgazers_count - a.startgazers_count).slice(0, 6);

    const stats = {
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        accountCreated: accountAge,
        bio: userData.bio,
        location: userData.location,
    };


    return (
        <div className="min-h-screen bg-black text-green-400 p-8 font-mono">
            <div className="max-w-4xl mx-auto">

                {/* Header with Sign Out */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl">GITHUB PROFILE DASHBOARD</h1>
                    <form action={async () => {
                        "use server"
                        await signOut()
                    }}>
                        <button className="border border-green-400 px-4 py-2 hover:bg-green-400 hover:text-black">
                            SIGN OUT
                        </button>
                    </form>
                </div>

                {/* Profile Card */}
                <div className="border border-green-400 p-6 mb-6">
                    <div className="flex items-start gap-6">
                        <Image
                            src={session.user?.image || "/default-avatar.png"}
                            alt="profile"
                            width={120}
                            height={120}
                            className="border border-green-400"
                        />
                        <div className="flex-1">
                            <h2 className="text-2xl mb-2">{userData.name}</h2>
                            <p className="text-green-300">@{userData.login}</p>
                            {stats.bio && <p className="mt-2 text-sm">{stats.bio}</p>}
                            {stats.location && <p className="mt-1 text-sm">📍 {stats.location}</p>}
                            <p className="mt-2 text-xs text-green-500">
                                Account Created: {stats.accountCreated}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="border border-green-400 p-4 text-center">
                        <div className="text-3xl font-bold">{stats.publicRepos}</div>
                        <div className="text-sm text-green-500">PUBLIC REPOS</div>
                    </div>
                    <div className="border border-green-400 p-4 text-center">
                        <div className="text-3xl font-bold">{stats.followers}</div>
                        <div className="text-sm text-green-500">FOLLOWERS</div>
                    </div>
                    <div className="border border-green-400 p-4 text-center">
                        <div className="text-3xl font-bold">{stats.following}</div>
                        <div className="text-sm text-green-500">FOLLOWING</div>
                    </div>
                </div>

                {/* Languages */}
                <div className="border border-green-400 p-6 mb-6">
                    <h3 className="text-xl mb-4">TOP LANGUAGES</h3>
                    <div className="space-y-2">
                        {topLangs.map(({ language, count }) => (
                            <div key={language} className="flex justify-between">
                                <span>{language}</span>
                                <span className="text-green-500">{count} repos</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );

}