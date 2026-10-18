// Recent public commits for the desktop widget, fetched at build time. In CI the workflow
// passes GITHUB_TOKEN to avoid the anonymous rate limit. Any failure returns [] so a GitHub
// hiccup never breaks the build; the widget just doesn't show.
export type Activity = { repo: string; msg: string; date: string; url: string };

type PushEvent = { type: string; repo: { name: string }; created_at: string; payload: { head?: string } };

let memo: { at: number; data: Activity[] } | null = null;

export async function recentActivity(user = 'DecoudJuan', max = 5): Promise<Activity[]> {
  if (memo && Date.now() - memo.at < 10 * 60_000) return memo.data; // dev server: don't hit the API on every reload
  try {
    const token = import.meta.env.GITHUB_TOKEN as string | undefined;
    const headers = { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    const get = async (url: string) => {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    };
    // Push events only carry the head SHA now, so the message comes from the commit itself.
    const events = ((await get(`https://api.github.com/users/${user}/events/public?per_page=50`)) as PushEvent[])
      .filter((e) => e.type === 'PushEvent' && e.payload.head);
    const seen = new Set<string>();
    const picked = events.filter((e) => (seen.has(e.payload.head!) ? false : (seen.add(e.payload.head!), true))).slice(0, max);
    const out = await Promise.all(picked.map(async (e) => {
      const c = (await get(`https://api.github.com/repos/${e.repo.name}/commits/${e.payload.head}`)) as { commit: { message: string }; html_url: string };
      return { repo: e.repo.name.split('/')[1], msg: c.commit.message.split('\n')[0].slice(0, 80), date: e.created_at, url: c.html_url };
    }));
    memo = { at: Date.now(), data: out };
    return out;
  } catch {
    return [];
  }
}
