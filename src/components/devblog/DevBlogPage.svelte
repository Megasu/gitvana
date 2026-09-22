<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '../shared/Navbar.svelte';
  import { locale, translate } from '../../i18n/index.js';

  const entriesEn = [
    {
      id: '2026-04-06-i18n',
      date: '06/04/2026',
      text: `Built the i18n infrastructure today. All UI strings (buttons, labels, headers) now go through a t() translation function that reads from JSON locale files. English is extracted as the source of truth, and any missing key in another language falls back to English automatically.

The language picker only shows up when there are 2+ locales available, so right now it's invisible. But the plumbing is there. Someone on GitHub asked for pt-BR support and I want to make it easy for the community to contribute translations.

The hard part isn't the code — it's the content. 38 levels of monastery humor, a judgmental cat, Monkey Island-style dialogue. You can't run that through a translator and expect it to land. This needs people who get the vibe. Wrote a CONTRIBUTING_TRANSLATIONS.md to make it as easy as possible to help out.`,
    },
    {
      id: '2026-04-06-bugfixes',
      date: '06/04/2026',
      text: `Big bug fix day. A user named rorar filed like 8 issues in one sitting — incredible feedback. Fixed most of them: the terminal was breaking on long inputs that wrap past the screen width (cursor math didn't account for line wrapping), chaining nano with && was returning "command not found", git diff with commit hashes wasn't implemented at all, and a level was penalizing you for using git status even though the objective told you to.

Also added color-coded git log output (yellow hashes, green decorations, cyan author) and a man command that aliases to docs. Small things but they make it feel more like a real terminal.`,
    },
    {
      id: '2026-04-03-remotes',
      date: '03/04/2026',
      text: `Added git push, fetch, and pull. Since everything runs in the browser there's no actual remote server, so I fake it — a second git repo living at /remote/origin on the same IndexedDB filesystem. Push copies objects one way, fetch the other. isomorphic-git doesn't care, it just reads and writes content-addressed blobs.

Three new levels that teach the basics of remote collaboration. Brother Guybrush pushes to the remote while you're not looking and you have to deal with it. Also added the remote tracking branches to the commit graph — they show up with a dashed border so you can tell them apart from local branches.

The undo system now handles remotes too. If you push and then undo, the remote goes back to its previous state. That part took longer than the push itself.`,
    },
    {
      id: '2026-04-02-thousand',
      date: '02/04/2026',
      text: `A thousand people played Gitvana in the first day. I don't really know what happened. I shared it on Reddit, went to make coffee, came back and the numbers on the telemetry dashboard looked wrong. They weren't wrong.

I'm genuinely grateful. This is a side project I built at night because I thought git tutorials were boring. The fact that strangers are actually playing it and some of them are learning from it means a lot to me.

If you've made it here — thank you. If you have feedback, ideas, complaints, anything — I'd love to hear it. You can open an issue on GitHub or just reach out. I read everything. This project is small and I want to make it better, and I can't do that without hearing from the people who use it.`,
    },
    {
      id: '2026-03-31-start',
      date: '31/03/2026',
      text: `Started this. The idea: a game that teaches git but doesn't feel like homework. Every tutorial I've seen follows the same pattern. Init, add, commit, branch, merge. Nobody learns git from that.

What if it was an adventure game. A monastery where monks preserve ancient code. A cat that judges your commits. The dialogue style is inspired by Monkey Island — absurd, self-aware, a bit stupid. I figured humor and learning can coexist.

Got a prototype working tonight. Terminal on the left, commit graph on the right, objectives on top. You type real git commands and the graph updates in real time. It's 3am and I should stop but I keep adding things.

I might be onto something or I might lose interest in a week. We'll see.`,
    },
  ];

  const entriesZh = [
    { id: '2026-04-06-i18n', date: '2026/04/06', text: `今天搭好了国际化基础设施。所有界面文案现在都会通过 t() 翻译函数从 JSON 语言文件读取；英文是基准语言，其他语言缺少的键会自动回退到英文。

语言达到两种以上时才会显示选择器。GitHub 上有人希望支持巴西葡萄牙语，我也想让社区贡献翻译尽可能简单。

真正困难的不是代码，而是内容：38 个关卡的修道院式幽默、爱评判人的猫、猴岛小英雄风格的对白。直接丢给翻译器不会保留味道，所以我写了 CONTRIBUTING_TRANSLATIONS.md，希望懂这种气质的人能一起参与。` },
    { id: '2026-04-06-bugfixes', date: '2026/04/06', text: `今天集中修了一批问题。一位叫 rorar 的玩家一次提交了大约 8 个问题，反馈非常有价值。修复内容包括：长命令换行后终端光标错位、nano 与 && 串联时报“找不到命令”、无法按提交哈希执行 git diff，以及目标要求使用 git status 却会因此扣星。

另外，git log 现在会用不同颜色显示哈希、引用和作者；还增加了 man 命令，作为 docs 的别名。都是小改动，但会让它更像真正的终端。` },
    { id: '2026-04-03-remotes', date: '2026/04/03', text: `加入了 git push、fetch 和 pull。因为一切都运行在浏览器里，并没有真正的远程服务器，所以我在同一个 IndexedDB 文件系统的 /remote/origin 下模拟了第二个 Git 仓库。push 向一个方向复制对象，fetch 则反向复制；isomorphic-git 只负责读写内容寻址对象，并不在意它们存在哪里。

新增 3 个远程协作关卡。盖伯拉什师兄会趁你不注意向远程推送，你需要处理随之而来的问题。提交图也会显示远程跟踪分支，并用虚线边框与本地分支区分。

撤销系统现在也能处理远程状态：推送后再撤销，远程仓库会恢复到之前的状态。这部分花的时间比实现 push 本身还久。` },
    { id: '2026-04-02-thousand', date: '2026/04/02', text: `第一天就有一千人玩了 Gitvana，我到现在也不太明白发生了什么。我把它分享到 Reddit，去煮了杯咖啡，回来后以为统计面板的数据坏了——结果并没有。

我真的很感激。这只是我夜里做的一个业余项目，因为我觉得现有 Git 教程太无聊。陌生人真的愿意玩，而且有人从中学到了东西，这对我意义很大。

如果你读到了这里，谢谢你。无论是反馈、想法还是抱怨，我都很想听。可以在 GitHub 提交问题，也可以直接联系我；我会读每一条消息。项目还很小，只有听见使用者的声音，它才会变得更好。` },
    { id: '2026-03-31-start', date: '2026/03/31', text: `项目今天开工。想法很简单：做一款教 Git、但不像作业的游戏。常见教程总是按 init、add、commit、branch、merge 的顺序走，可很少有人真能靠这种方式理解 Git。

如果把它做成冒险游戏呢？一座保存古老代码的修道院，一只会评判你提交记录的猫。对白受《猴岛小英雄》启发——荒诞、自嘲，还有一点傻气。我相信幽默和学习可以共存。

今晚做出了原型：左边是终端，右边是提交图，上方显示目标。玩家输入真正的 Git 命令，提交图会实时更新。已经凌晨三点，我本该停下，但还是不断往里加东西。

也许我真的找到了方向，也许一周后就没兴趣了。走着瞧吧。` },
  ];

  const entries = $derived($locale === 'zh' ? entriesZh : entriesEn);

  // --- Likes ---
  const SESSION_KEY = 'gitvana-session-id';
  function getSessionId(): string {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  const LIKES_STORAGE_KEY = 'gitvana-blog-likes';

  function loadLocalLikes(): Record<string, boolean> {
    try {
      return JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY) || '{}');
    } catch { return {}; }
  }

  function saveLocalLikes(liked: Record<string, boolean>) {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(liked));
  }

  let likeCounts = $state<Record<string, number>>({});
  let likedByMe = $state<Record<string, boolean>>(loadLocalLikes());

  let serverReachable = false;

  async function fetchLikes() {
    try {
      const res = await fetch(`/api/blog/likes?session=${getSessionId()}`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      serverReachable = true;
      likeCounts = data.counts || {};
      // Merge: keep local likes, overlay server truth
      const serverLiked = data.liked || {};
      likedByMe = { ...likedByMe, ...serverLiked };
      saveLocalLikes(likedByMe);
    } catch { /* offline — local state is fine */ }
  }

  async function toggleLike(postId: string) {
    const wasLiked = !!likedByMe[postId];
    // Optimistic update
    likedByMe = { ...likedByMe, [postId]: !wasLiked };
    likeCounts = { ...likeCounts, [postId]: (likeCounts[postId] || 0) + (wasLiked ? -1 : 1) };
    saveLocalLikes(likedByMe);

    try {
      const res = await fetch('/api/blog/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          sessionId: getSessionId(),
          unlike: wasLiked,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        likeCounts = { ...likeCounts, [postId]: data.count };
      }
    } catch {
      // Keep local state — server will sync next time
    }
  }

  onMount(() => {
    fetchLikes();
  });
</script>

<div class="devblog-page">
  <Navbar currentPage="devblog" />

  <div class="devblog-content">
    <header class="devblog-header">
      <h1 class="devblog-title">{$translate('ui.devlog_title')}</h1>
      <p class="devblog-subtitle">Raffaele Pizzari</p>
    </header>

    <div class="entries">
      {#each entries as entry}
        <div class="entry">
          <div class="entry-date">{entry.date}</div>
          <div class="entry-text">{@html entry.text.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')}</div>
          <button
            class="like-btn"
            class:liked={likedByMe[entry.id]}
            onclick={() => toggleLike(entry.id)}
            aria-label={$translate('ui.like_post')}
          >
            <span class="like-heart">{likedByMe[entry.id] ? '\u2665' : '\u2661'}</span>
            {#if likeCounts[entry.id]}
              <span class="like-count">{likeCounts[entry.id]}</span>
            {/if}
          </button>
        </div>
      {/each}
    </div>

    <footer class="devblog-footer">
      <p>&copy; 2026 Raffaele Pizzari &mdash; <a href="https://github.com/pixari/gitvana">github</a></p>
    </footer>
  </div>
</div>

<style>
  .devblog-page {
    position: fixed;
    inset: 0;
    background: #0a0a0a;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 200;
    color: #c2c3c7;
    font-family: 'JetBrains Mono', monospace;
  }

  .devblog-content {
    max-width: 640px;
    margin: 0 auto;
    padding: 44px 24px 60px;
  }

  .devblog-header {
    padding: 56px 0 40px;
    border-bottom: 1px solid #1a1a2e;
    margin-bottom: 32px;
  }

  .devblog-title {
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(12px, 3vw, 16px);
    color: #ffa300;
    margin: 0 0 10px;
    letter-spacing: 3px;
  }

  .devblog-subtitle {
    font-size: 12px;
    color: #5f574f;
    margin: 0;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .entry {
    padding: 24px 0;
    border-bottom: 1px solid #1a1a2e;
  }

  .entry:last-child {
    border-bottom: none;
  }

  .entry-date {
    font-family: 'Press Start 2P', monospace;
    font-size: 9px;
    color: #5f574f;
    margin-bottom: 14px;
    letter-spacing: 1px;
  }

  .entry-text {
    font-size: 13px;
    color: #a09a93;
    line-height: 1.75;
  }

  .entry-text :global(p) {
    margin: 0 0 12px;
  }

  .entry-text :global(p:last-child) {
    margin-bottom: 0;
  }

  .like-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 0 0;
    color: #5f574f;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    transition: color 0.15s;
  }

  .like-btn:hover {
    color: #ff004d;
  }

  .like-btn.liked {
    color: #ff004d;
  }

  .like-heart {
    font-size: 16px;
    line-height: 1;
  }

  .like-count {
    font-size: 11px;
    color: #5f574f;
  }

  .like-btn.liked .like-count {
    color: #ff004d88;
  }

  .devblog-footer {
    margin-top: 48px;
    padding: 24px 0;
    border-top: 1px solid #1a1a2e;
  }

  .devblog-footer p {
    font-size: 11px;
    color: #5f574f55;
    margin: 0;
  }

  .devblog-footer a {
    color: #5f574f88;
    text-decoration: none;
  }

  .devblog-footer a:hover {
    color: #ffa300;
  }

  @media (max-width: 600px) {
    .devblog-content {
      padding: 44px 16px 40px;
    }
  }
</style>
