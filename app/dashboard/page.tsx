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

    /* count repos by language */
    const languageCounts: Record<string, number> = {};

    repos.forEach((repo: any) => {
        if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
    });

    const topLangs = Object.entries(languageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([lang, count]) => ({ language: lang, count }));

    const topRepos = repos.sort((a: any, b: any) => b.stargazers_count - a.stargazers_count).slice(0, 6);

    const stats = {
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        accountCreated: accountAge,
        bio: userData.bio,
        location: userData.location,
    };

    /* grab events for activity heatmap */
    const events = await fetch(
        `https://api.github.com/users/${userData.login}/events/public?per_page=100`,
        {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            }
        }
    ).then(res => res.json());

    const activityMap: Record<string, number> = {};
    const today = new Date();

    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        activityMap[dateStr] = 0;
    }

    events.forEach((event: any) => {
        const dateStr = event.created_at.split('T')[0];
        if (activityMap[dateStr] !== undefined) {
            activityMap[dateStr]++;
        }
    });

    const activityDays = Object.entries(activityMap)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, count]) => ({ date, count }));


    return (
        <div className="flex min-h-screen items-center justify-center bg-black font-mono">
            <div className="w-full max-w-2xl space-y-8 p-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-green-500 tracking-wider" style={{textShadow: '0 0 10px #00ff00'}}>
                        [GITHUB_PROFILE_SCANNER.EXE]
                    </h1>
                    <p className="text-green-400 text-sm">
                        &gt; CONNECTION ESTABLISHED // USER: @{userData.login} // FETCHING DATA...
                    </p>
                    <p className="mt-2 text-green-500 animate-pulse">
                        █████████████████████████████
                    </p>
                </div>

                <div className="border-2 border-green-500 rounded-lg p-6 space-y-4" style={{boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'}}>
                    <div className="text-center">
                        <Image
                            src={session.user?.image || "/default-avatar.png"}
                            alt="profile"
                            width={100}
                            height={100}
                            className="border-2 border-green-500 rounded mx-auto mb-4"
                            style={{boxShadow: '0 0 15px rgba(0, 255, 0, 0.3)'}}
                        />
                        <h2 className="text-2xl font-bold text-green-400" style={{textShadow: '0 0 5px #00ff00'}}>
                            {userData.name}
                        </h2>
                        <p className="text-green-500 text-sm">@{userData.login}</p>
                    </div>

                    {stats.bio && (
                        <div className="border border-green-600 p-3 bg-green-950/30">
                            <p className="text-xs font-bold text-green-400 mb-1">&gt; USER_BIO:</p>
                            <p className="text-sm text-green-500">{stats.bio}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-green-500">
                        {stats.location && <p>&gt; LOCATION: {stats.location}</p>}
                        <p>&gt; JOINED: {stats.accountCreated}</p>
                    </div>
                </div>

                <div className="border-2 border-green-500 rounded-lg p-6 space-y-4" style={{boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'}}>
                    <p className="text-sm font-bold text-green-400">&gt; ACCOUNT_STATISTICS:</p>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{stats.publicRepos}</div>
                            <div className="text-xs text-green-500">REPOS</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{stats.followers}</div>
                            <div className="text-xs text-green-500">FOLLOWERS</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{stats.following}</div>
                            <div className="text-xs text-green-500">FOLLOWING</div>
                        </div>
                    </div>
                </div>

                <div className="border-2 border-green-500 rounded-lg p-6 space-y-4" style={{boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'}}>
                    <p className="text-sm font-bold text-green-400">&gt; CODE_LANGUAGE_ANALYSIS:</p>
                    <div className="space-y-2">
                        {topLangs.map(({ language, count }) => (
                            <div key={language} className="flex justify-between items-center text-sm">
                                <span className="text-green-400 font-mono">{language}</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 bg-green-900 rounded-full" style={{width: `${count * 20}px`}}>
                                        <div className="h-full bg-green-500 rounded-full animate-pulse" style={{width: '100%', boxShadow: '0 0 5px rgba(0, 255, 0, 0.5)'}}></div>
                                    </div>
                                    <span className="text-green-500 text-xs">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-2 border-green-500 rounded-lg p-6 space-y-4" style={{boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'}}>
                    <p className="text-sm font-bold text-green-400">&gt; REPOSITORY_SCAN [MOST_POPULAR]:</p>
                    <div className="space-y-3">
                        {topRepos.slice(0, 4).map((repo: any) => (
                            <div key={repo.id} className="border border-green-600 p-3 bg-green-950/30 hover:bg-green-950/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-400 font-bold hover:underline text-sm"
                                        style={{textShadow: '0 0 5px #00ff00'}}
                                    >
                                        &gt; {repo.name}
                                    </a>
                                    <span className="text-yellow-400 text-xs font-bold animate-pulse">★ {repo.stargazers_count}</span>
                                </div>
                                {repo.description && (
                                    <p className="text-xs text-green-500 mb-2">{repo.description.slice(0, 80)}{repo.description.length > 80 ? '...' : ''}</p>
                                )}
                                <div className="flex gap-2 text-xs text-green-600">
                                    {repo.language && <span>[{repo.language}]</span>}
                                    <span>FORKS: {repo.forks_count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-2 border-green-500 rounded-lg p-6 space-y-4" style={{boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'}}>
                    <p className="text-sm font-bold text-green-400">&gt; ACTIVITY_HEATMAP [90_DAY_SCAN]:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {activityDays.map(({ date, count }) => {
                            const getColor = (count: number) => {
                                if (count === 0) return 'bg-gray-900';
                                if (count <= 2) return 'bg-green-900';
                                if (count <= 5) return 'bg-green-700';
                                if (count <= 8) return 'bg-green-500';
                                return 'bg-green-400';
                            };

                            return (
                                <div
                                    key={date}
                                    className={`w-2 h-2 ${getColor(count)} border border-green-950`}
                                    title={`${date}: ${count} events`}
                                    style={count > 0 ? { boxShadow: `0 0 3px rgba(0, 255, 0, ${count * 0.15})` } : {}}
                                />
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-green-500">
                        <span>IDLE</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-900 border border-green-950"></div>
                            <div className="w-2 h-2 bg-green-900 border border-green-950"></div>
                            <div className="w-2 h-2 bg-green-700 border border-green-950"></div>
                            <div className="w-2 h-2 bg-green-500 border border-green-950"></div>
                            <div className="w-2 h-2 bg-green-400 border border-green-950"></div>
                        </div>
                        <span>ACTIVE</span>
                    </div>
                </div>

                <div className="border-2 border-red-600 bg-red-950 p-4 text-center" style={{boxShadow: '0 0 15px rgba(255, 0, 0, 0.4)'}}>
                    <p className="text-xs text-red-400 mb-3">&gt;&gt; TERMINATE_CONNECTION?</p>
                    <form action={async () => {
                        "use server"
                        await signOut()
                    }}>
                        <button
                            type="submit"
                            className="border-2 border-red-600 bg-red-900 px-6 py-3 font-bold text-red-400 hover:bg-red-800 hover:border-red-500 focus:outline-none"
                            style={{textShadow: '0 0 5px #ff0000'}}
                        >
                            [DISCONNECT_SESSION]
                        </button>
                    </form>
                    <p className="text-xs text-red-500 mt-2">STATUS: AWAITING_COMMAND</p>
                </div>

            </div>
        </div>
    );

}