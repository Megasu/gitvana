<script lang="ts">
  import Navbar from '../shared/Navbar.svelte';
  import { locale, translate } from '../../i18n/index.js';

  const tagColors: Record<string, string> = {
    release: '#ffa300',
    engine: '#29adff',
    content: '#00e436',
    feature: '#ff77a8',
    docs: '#83769c',
    milestone: '#ffd700',
    fix: '#ff004d',
  };

  const entriesEn = [
    {
      date: '2026-04-10',
      title: 'The Way of the Terminal \u2014 Shell Basics Tutorial',
      tags: ['feature', 'content'],
      content: 'New optional Act 0 with 3 lessons teaching terminal basics (echo, cat, touch, grep, chaining) before the git levels. New players choose "Learn the Basics" or "Skip to Git" on first visit. Existing progress is automatically migrated (#33).'
    },
    {
      date: '2026-04-10',
      title: 'UX Improvements & Bug Fixes',
      tags: ['fix', 'feature'],
      content: 'Fixed invisible terminal input \u2014 typed characters were processed but never displayed (#37, #39). Bare "git" command now shows usage info instead of "command not found" (#38). Level complete card can now be minimized so you can review your terminal steps before continuing (#30). Contextual tips appear for new players on early levels (#25). Hardcoded level counts replaced with dynamic TOTAL_LEVELS constant (#42).'
    },
    {
      date: '2026-04-06',
      title: 'i18n Infrastructure',
      tags: ['feature'],
      content: 'Internationalization support is here. UI strings are now translatable via JSON locale files. Language picker ready (shows when 2+ locales available). English extracted as source of truth. Community translations welcome \u2014 see CONTRIBUTING_TRANSLATIONS.md.'
    },
    {
      date: '2026-04-06',
      title: 'Bug Fixes \u2014 Terminal, Diff, Levels',
      tags: ['fix'],
      content: 'Fixed: chained nano/edit commands (#36), git diff with commit refs (#29), level 4 star threshold (#31), Ctrl+L clear (#24), long input line wrapping (#34), repo state sync after undo (#27). Added man command (#32) and color-coded git log (#35).'
    },
    {
      date: '2026-04-06',
      title: 'Tablet Support',
      tags: ['feature'],
      content: 'Gitvana now works on tablets in landscape mode. Panels stack vertically on narrower screens. The mobile fallback only triggers on phone-sized viewports now.'
    },
    {
      date: '2026-04-04',
      title: 'Bug Fixes \u2014 Rebase, Diff, Commit',
      tags: ['fix', 'engine'],
      content: 'Fixed rebase conflict handling crashing with a JavaScript error instead of showing conflict markers (#23). Fixed git diff showing entire file as additions instead of just changed lines (#22). git commit with pathspec (e.g. git commit . -m "msg") now auto-stages files before committing.'
    },
    {
      date: '2026-04-03',
      title: 'Simulated Remotes \u2014 Push, Fetch, Pull',
      tags: ['feature', 'engine'],
      content: 'Git push, fetch, and pull now work via simulated remote repositories running entirely in the browser. 3 new levels teaching remote collaboration. Remote tracking branches visible in the commit graph. Dev blog page added.'
    },
    {
      date: '2026-04-02',
      title: 'v1.0 \u2014 The Grand Opening',
      tags: ['release'],
      content: 'Gitvana launches with 35 levels across 6 acts, 21 git commands, pixel art, chiptune sounds, and a monastery full of questionable life choices. The cat is pleased.'
    },
    {
      date: '2026-04-02',
      title: 'Proper 3-Way Merge Engine',
      tags: ['engine'],
      content: 'Replaced file-level conflict detection with line-level diff3 merging. Changes in different regions of the same file now auto-merge correctly. Merge, cherry-pick, rebase, and revert all benefit.'
    },
    {
      date: '2026-04-01',
      title: 'Level Difficulty Rework',
      tags: ['content'],
      content: 'Rewrote levels 15-35 to be genuinely challenging. Later levels now require investigation (blame, bisect, reflog) before acting. Boss levels have cascading problems. Level 35 has zero hints.'
    },
    {
      date: '2026-04-01',
      title: '9 New Git Commands',
      tags: ['feature'],
      content: 'Added tag, cherry-pick, show, revert, stash, reflog, rebase, blame, and bisect. The monastery now teaches real git mastery, not just basics.'
    },
    {
      date: '2026-04-01',
      title: 'Conceptual Guides',
      tags: ['docs'],
      content: '9 in-depth guides explaining how git actually works: content-addressable filesystem, the three areas, merge vs rebase, the reflog safety net, and more. Available in-game and at /docs.'
    },
    {
      date: '2026-03-31',
      title: 'The Monastery Opens Its Gates',
      tags: ['milestone'],
      content: 'First playable version with 6 levels, a terminal, and a judgmental cat. The Head Monk is skeptical but willing to give you a chance.'
    },
  ];

  const entriesZh = [
    { date: '2026-04-10', title: '终端之道——Shell 基础教程', tags: ['feature', 'content'], content: '新增可选的第零幕，用 3 节课讲解 echo、cat、touch、grep 和命令串联。新玩家首次进入时可选择“学习终端基础”或“直接学习 Git”，已有进度会自动迁移（#33）。' },
    { date: '2026-04-10', title: '体验改进与问题修复', tags: ['fix', 'feature'], content: '修复终端输入不可见、单独输入 git 时提示错误等问题。通关卡片现在可以最小化，方便回看操作步骤；早期关卡增加情境提示，关卡总数改为动态读取（#25、#30、#37、#38、#39、#42）。' },
    { date: '2026-04-06', title: '国际化基础设施', tags: ['feature'], content: '界面文案已支持通过 JSON 语言文件翻译，并加入语言选择器。英文作为回退语言，欢迎社区参与翻译，详情见 CONTRIBUTING_TRANSLATIONS.md。' },
    { date: '2026-04-06', title: '终端、差异与关卡问题修复', tags: ['fix'], content: '修复串联 nano/edit 命令、按提交引用查看 git diff、第四关星级阈值、Ctrl+L 清屏、长命令换行以及撤销后仓库状态不同步等问题；新增 man 命令和彩色 git log。' },
    { date: '2026-04-06', title: '平板设备支持', tags: ['feature'], content: 'Gitvana 现已支持横屏平板。较窄屏幕会纵向排列面板，移动端提示只会在手机尺寸的视口上出现。' },
    { date: '2026-04-04', title: '变基、差异与提交问题修复', tags: ['fix', 'engine'], content: '修复变基冲突导致程序崩溃、git diff 把整份文件误显示为新增内容的问题。使用路径参数提交时，现在会先自动暂存对应文件。' },
    { date: '2026-04-03', title: '模拟远程仓库——推送、获取与拉取', tags: ['feature', 'engine'], content: '新增完全运行在浏览器中的模拟远程仓库，支持 git push、fetch 和 pull；增加 3 个远程协作关卡，并在提交图中显示远程跟踪分支。' },
    { date: '2026-04-02', title: 'v1.0——正式开山', tags: ['release'], content: 'Gitvana 正式发布：共 6 幕、35 个关卡、21 条 Git 命令，还有像素画、芯片音乐，以及一座充满可疑人生选择的修道院。那只猫很满意。' },
    { date: '2026-04-02', title: '真正的三方合并引擎', tags: ['engine'], content: '用逐行 diff3 合并替换文件级冲突检测。同一文件不同区域的修改现在可以正确自动合并，merge、cherry-pick、rebase 和 revert 都会受益。' },
    { date: '2026-04-01', title: '关卡难度重做', tags: ['content'], content: '重新设计第 15–35 关，提高真实挑战性。后期关卡要求先用 blame、bisect、reflog 调查再操作；首领关包含连锁问题，第 35 关不提供提示。' },
    { date: '2026-04-01', title: '新增 9 条 Git 命令', tags: ['feature'], content: '新增 tag、cherry-pick、show、revert、stash、reflog、rebase、blame 和 bisect。修道院教授的不再只是入门操作，而是真正的 Git 掌控力。' },
    { date: '2026-04-01', title: '原理指南', tags: ['docs'], content: '新增 9 篇深入指南，讲解内容寻址文件系统、三个区域、合并与变基的区别、reflog 安全网等 Git 原理，可在游戏内和文档页阅读。' },
    { date: '2026-03-31', title: '修道院首次开门', tags: ['milestone'], content: '首个可玩版本上线，包含 6 个关卡、一个终端和一只爱评判人的猫。住持仍然心存怀疑，但愿意给你一次机会。' },
  ];

  const entries = $derived($locale === 'zh' ? entriesZh : entriesEn);

  function getBorderColor(tags: string[]): string {
    return tagColors[tags[0]] ?? '#5f574f';
  }
</script>

<div class="changelog-page">
  <Navbar currentPage="changelog" />

  <div class="changelog-content">
    <header class="changelog-header">
      <h1 class="changelog-title">{$translate('ui.changelog_title')}</h1>
      <p class="changelog-subtitle">{$translate('ui.changelog_subtitle')}</p>
    </header>

    <div class="entries">
      {#each entries as entry}
        <article class="entry" style="border-left-color: {getBorderColor(entry.tags)}">
          <div class="entry-meta">
            <span class="entry-date">{entry.date}</span>
            <div class="entry-tags">
              {#each entry.tags as tag}
                <span class="tag" style="background: {tagColors[tag] ?? '#5f574f'}22; color: {tagColors[tag] ?? '#5f574f'}; border-color: {tagColors[tag] ?? '#5f574f'}44">{tag}</span>
              {/each}
            </div>
          </div>
          <h2 class="entry-title">{entry.title}</h2>
          <p class="entry-content">{entry.content}</p>
        </article>
      {/each}
    </div>

    <!-- TODO: Add pagination when there are more entries -->

    <footer class="changelog-footer">
      <p>&copy; 2026 Raffaele Pizzari</p>
    </footer>
  </div>
</div>

<style>
  .changelog-page {
    position: fixed;
    inset: 0;
    background: #0a0a0a;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 200;
    color: #c2c3c7;
    font-family: 'JetBrains Mono', monospace;
  }

  .changelog-content {
    max-width: 700px;
    margin: 0 auto;
    padding: 44px 24px 60px;
  }

  .changelog-header {
    text-align: center;
    padding: 60px 0 48px;
  }

  .changelog-title {
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(16px, 4vw, 28px);
    color: #ffa300;
    margin: 0 0 16px;
    letter-spacing: 4px;
    text-shadow: 0 0 20px #ffa30044;
  }

  .changelog-subtitle {
    font-size: 13px;
    color: #5f574f;
    margin: 0;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .entry {
    border-left: 3px solid #5f574f;
    padding: 16px 0 16px 20px;
  }

  .entry-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .entry-date {
    font-size: 11px;
    color: #5f574f;
    letter-spacing: 0.5px;
  }

  .entry-tags {
    display: flex;
    gap: 6px;
  }

  .tag {
    font-size: 9px;
    font-family: 'Press Start 2P', monospace;
    padding: 3px 8px;
    border-radius: 3px;
    border: 1px solid;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .entry-title {
    font-family: 'Press Start 2P', monospace;
    font-size: 12px;
    color: #c2c3c7;
    margin: 0 0 10px;
    line-height: 1.6;
    letter-spacing: 0.5px;
  }

  .entry-content {
    font-size: 13px;
    color: #8a8580;
    line-height: 1.7;
    margin: 0;
  }

  .changelog-footer {
    margin-top: 80px;
    padding: 24px 0;
    text-align: center;
    border-top: 1px solid #1a1a2e22;
  }

  .changelog-footer p {
    font-size: 12px;
    color: #5f574f55;
    margin: 0;
  }
</style>
