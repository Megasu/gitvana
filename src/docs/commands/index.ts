import type { CommandDoc } from '../types.js';

export const commandDocs: Record<string, CommandDoc> = {
  init: {
    name: 'init',
    syntax: 'git init',
    description:
      '"git init" creates the .git directory inside your project, which is where git stores all version history -- every commit, branch, and object. This directory contains objects/ (the content-addressed store), refs/ (branch and tag pointers), HEAD (the current branch pointer), and the index (staging area). Without this directory, git commands have nothing to work with. Running "git init" is declaring that this directory is now a repository.',
    options: [
      { flag: '--bare', description: 'Create a bare repository (no working directory, used for remotes)' },
    ],
    examples: [
      { command: 'git init', output: 'Initialized empty Git repository in /home/you/project/.git/', explanation: 'Initialize a new repository in the current directory' },
      { command: 'git init my-project', explanation: 'Create a new directory "my-project" and initialize a repo inside it, in one step' },
      { command: 'git init', output: 'Reinitialized existing Git repository in /home/you/project/.git/', explanation: 'Running it again on an already-initialized repo is harmless -- git just confirms the directory is still a repo' },
    ],
    tip: 'You almost never need "git init" in practice. Most of the time you\'ll "git clone" an existing repo. But when starting something truly new, this is where it begins.',
    related: ['clone', 'status'],
    seeAlso: ['how-git-stores-data'],
  },

  add: {
    name: 'add',
    syntax: 'git add <pathspec>...',
    description:
      '"git add" copies the current contents of specified files into the staging area (the index). This is not "tracking" a file -- it\'s snapshotting its current state into a preparation zone for the next commit. If you modify a file after running "git add", the staging area still holds the old version. You must add again to update it. This design lets you control exactly what goes into each commit, even staging parts of a file with "git add -p".',
    options: [
      { flag: '-A, --all', description: 'Stage all changes (new, modified, deleted) in the entire working tree' },
      { flag: '-p, --patch', description: 'Interactively choose hunks of changes to stage' },
      { flag: '.', description: 'Stage all changes in the current directory and below' },
    ],
    examples: [
      { command: 'git add README.md', explanation: 'Stage a single file' },
      { command: 'git add .', explanation: 'Stage everything in the current directory' },
      { command: 'git add -A', explanation: 'Stage all changes across the entire repo' },
      { command: 'git add src/*.ts', explanation: 'Stage all TypeScript files in the src directory' },
      {
        command: 'git add -p',
        output: '@@ -1,3 +1,4 @@\n line one\n+line two (new)\n line three\nStage this hunk [y,n,q,a,d,s,e,?]?',
        explanation: 'Review changes one hunk at a time -- say yes to the parts you want in this commit, no to the rest',
      },
    ],
    tip: 'Use "git add -p" to stage parts of a file. It\'s the secret weapon for making clean, focused commits instead of dumping everything in at once.',
    related: ['status', 'commit', 'reset', 'diff'],
    seeAlso: ['the-three-areas'],
  },

  commit: {
    name: 'commit',
    syntax: 'git commit [-m <message>]',
    description:
      '"git commit" takes everything in the staging area and creates a permanent snapshot -- a commit object containing a tree (all files), parent pointer(s), author/committer info, and your message. The commit hash is computed from all of these fields, which is why you can\'t edit a commit -- any change produces a different hash. Each commit forms a link in the history chain, pointing back to its parent.',
    options: [
      { flag: '-m, --message <message>', description: 'Provide the commit message inline' },
      { flag: '-a, --all', description: 'Automatically stage all modified/deleted files before committing (skips untracked)' },
      { flag: '--amend', description: 'Replace the last commit with a new one (rewrite history -- use with care)' },
      { flag: '--allow-empty', description: 'Create a commit even with no staged changes' },
    ],
    examples: [
      {
        command: 'git commit -m "Add user login feature"',
        output: '[main a1b2c3d] Add user login feature\n 1 file changed, 12 insertions(+)',
        explanation: 'Commit staged changes with a message',
      },
      { command: 'git commit -am "Fix typo in README"', explanation: 'Stage all tracked changes and commit in one step' },
      { command: 'git commit --amend -m "Better message"', explanation: 'Replace the last commit message (only if you haven\'t pushed!)' },
      { command: 'git commit --allow-empty -m "Trigger CI rebuild"', explanation: 'Create a commit with no file changes at all -- a real trick for nudging a CI pipeline or marking a point in history' },
    ],
    tip: 'Write commit messages in the imperative mood: "Add feature" not "Added feature". Think of it as completing the sentence: "If applied, this commit will ___."',
    advanced: '## commit --amend\n\nMade a typo in your commit message? Forgot to stage a file? "--amend" lets you rewrite the most recent commit. It replaces the last commit entirely -- same parent, new snapshot.\n\n**Important:** Only amend commits you haven\'t pushed yet. Amending a pushed commit rewrites history and will cause pain for anyone who pulled the original.\n\n```\ngit commit --amend -m "Corrected message"\ngit add forgotten-file.ts && git commit --amend --no-edit\n```\n\nThe second form adds a forgotten file to the last commit without changing the message.',
    related: ['add', 'status', 'log', 'reset'],
    seeAlso: ['what-is-a-commit', 'the-three-areas'],
  },

  status: {
    name: 'status',
    syntax: 'git status',
    description:
      '"git status" compares the three areas of git pairwise and reports the differences. "Changes to be committed" shows what differs between the staging area and the last commit. "Changes not staged for commit" shows what differs between your working directory and the staging area. "Untracked files" shows files that exist on disk but not in the index. It is read-only and completely safe -- it never changes anything.',
    options: [
      { flag: '-s, --short', description: 'Show a compact status output (one line per file)' },
      { flag: '-b, --branch', description: 'Show branch and tracking info even in short mode' },
    ],
    examples: [
      {
        command: 'git status',
        output: 'On branch main\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\tmodified:   app.js\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\tmodified:   readme.md\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\tnotes.txt',
        explanation: 'The full picture: one file staged, one file edited but not staged, one file git has never seen',
      },
      { command: 'git status -s', output: 'M  app.js\n M readme.md\n?? notes.txt', explanation: 'Same information, one line per file -- the left column is staged, the right is unstaged' },
      { command: 'git status -sb', output: '## main...origin/main [ahead 2]', explanation: 'Compact mode plus branch tracking info -- a fast "am I ahead of the remote?" check' },
      { command: 'git status', output: 'On branch main\nnothing to commit, working tree clean', explanation: 'The best possible status: everything committed, nothing to see' },
    ],
    tip: 'When in doubt, "git status". It\'s free, it doesn\'t change anything, and it tells you exactly what git sees. It\'s the most harmless and helpful command you can run.',
    related: ['add', 'diff', 'commit', 'log'],
    seeAlso: ['the-three-areas'],
  },

  log: {
    name: 'log',
    syntax: 'git log [options]',
    description:
      '"git log" traverses the commit graph starting from HEAD, following parent pointers backward through history. Each entry shows the commit hash, author, date, and message. With "--graph", it visualizes the DAG structure of branches and merges as ASCII art. With "--oneline", it condenses each commit to a single line. The log is a read-only view of the commit chain -- your time machine for inspecting what happened and when.',
    options: [
      { flag: '--oneline', description: 'Show each commit as a single line (short hash + message)' },
      { flag: '--graph', description: 'Draw a text-based graph of the branch structure' },
      { flag: '-n, --max-count <number>', description: 'Show only the last n commits' },
      { flag: '--all', description: 'Show commits from all branches, not just the current one' },
    ],
    examples: [
      { command: 'git log --oneline', output: 'a1b2c3d Fix login bug\ne4f5g6h Add user model\n7c8d9e0 Initial commit', explanation: 'Quick overview of recent commits' },
      {
        command: 'git log --oneline --graph --all',
        output: '* a1b2c3d (HEAD -> main) Fix login bug\n| * f1e2d3c (feature) WIP styling\n|/\n* e4f5g6h Add user model',
        explanation: 'The beautiful branch visualization everyone screenshots',
      },
      { command: 'git log -3', explanation: 'Show only the last 3 commits' },
      { command: 'git log --author="Ada"', explanation: 'Only show commits written by a specific person' },
      { command: 'git log --grep="login"', explanation: 'Search commit messages for a keyword -- handy for finding "which commit touched login" months later' },
    ],
    tip: 'Alias "git log --oneline --graph --all" to something short like "git lg". You\'ll use it a hundred times a day.',
    related: ['status', 'diff', 'show'],
    seeAlso: ['what-is-a-commit', 'how-git-stores-data'],
  },

  diff: {
    name: 'diff',
    syntax: 'git diff [options] [<path>...]',
    description:
      '"git diff" computes the line-by-line differences between two states of your files. With no arguments, it compares the working directory to the staging area (unstaged changes). With "--staged", it compares the staging area to the last commit (what will be committed). With "HEAD", it shows all changes vs the last commit. Git computes diffs on the fly from snapshots -- it doesn\'t store diffs as its data model.',
    options: [
      { flag: '--staged', description: 'Show changes that are staged (ready to commit)' },
      { flag: '--stat', description: 'Show a summary of changes (files changed, insertions, deletions)' },
      { flag: 'HEAD', description: 'Compare working directory to the last commit' },
    ],
    examples: [
      {
        command: 'git diff',
        output: 'diff --git a/app.js b/app.js\nindex a1b2c3d..e4f5g6h 100644\n--- a/app.js\n+++ b/app.js\n@@ -1,3 +1,3 @@\n function login() {\n-  return false;\n+  return true;\n }',
        explanation: 'Show unstaged changes -- lines starting with - are what left, + are what arrived',
      },
      { command: 'git diff --staged', explanation: 'Show what\'s staged and about to be committed' },
      { command: 'git diff HEAD', explanation: 'Show all changes (staged + unstaged) vs last commit' },
      { command: 'git diff --stat', output: ' app.js  | 2 +-\n readme.md | 5 +++++\n 2 files changed, 6 insertions(+), 1 deletion(-)', explanation: 'Just the shape of the change -- which files, how much -- without the line-by-line detail' },
      { command: 'git diff main..feature', explanation: 'Compare two branches directly' },
    ],
    tip: 'Always run "git diff --staged" before committing. It\'s your last chance to catch that debug console.log you accidentally left in.',
    related: ['status', 'add', 'commit', 'log'],
    seeAlso: ['the-three-areas'],
  },

  branch: {
    name: 'branch',
    syntax: 'git branch [<name>] [<start-point>] [-d <name>]',
    description:
      'A branch is a 41-byte file in .git/refs/heads/ containing a commit hash -- nothing more. "git branch" lists, creates, or deletes these pointers. Creating a branch is nearly instant because git is just writing a hash to a file. When you commit, the current branch pointer advances to the new commit. Other branches remain unchanged. This is why branches in git are so cheap and why the "branch often" philosophy works.',
    options: [
      { flag: '-a, --all', description: 'List both local and remote branches' },
      { flag: '-d, --delete <name>', description: 'Delete a branch (safe -- won\'t delete unmerged work)' },
      { flag: '-D, --force-delete <name>', description: 'Force-delete a branch (even if unmerged -- dangerous!)' },
      { flag: '<name> <start-point>', description: 'Create a new branch at the specified commit or ref instead of HEAD' },
    ],
    examples: [
      { command: 'git branch', output: '* main\n  feature-login\n  hotfix', explanation: 'List all local branches -- the asterisk marks the one you\'re on' },
      { command: 'git branch feature-login', explanation: 'Create a new branch called "feature-login" at HEAD' },
      { command: 'git branch hotfix abc1234', explanation: 'Create a branch starting at a specific commit' },
      { command: 'git branch -d feature-login', output: 'Deleted branch feature-login (was a1b2c3d).', explanation: 'Delete the branch after merging' },
      { command: 'git branch -d unmerged-work', output: 'error: The branch \'unmerged-work\' is not fully merged.', explanation: 'Git refuses to delete a branch with unmerged commits -- use -D to force it, once you\'re sure you don\'t need that work' },
    ],
    tip: 'Creating a branch doesn\'t switch to it! Use "git switch" or "git checkout" after creating. Or use "git checkout -b <name>" to create and switch in one step.',
    related: ['switch', 'checkout', 'merge', 'log'],
    seeAlso: ['refs-and-head'],
  },

  checkout: {
    name: 'checkout',
    syntax: 'git checkout [-b <name>] <branch|commit> | git checkout <ref> -- <file>',
    description:
      '"git checkout" serves two distinct purposes: switching branches and restoring files. When given a branch name, it moves HEAD to that branch and updates the working directory. When given a commit hash, it puts you in "detached HEAD" state -- HEAD points directly to a commit, not a branch. With the "<ref> -- <file>" form, it restores a specific file from any commit without leaving your current branch. Modern git splits these duties into "switch" (branches) and "restore" (files) for clarity.',
    options: [
      { flag: '-b <name>', description: 'Create a new branch and switch to it' },
      { flag: '<ref> -- <file>', description: 'Restore a file from a specific commit (requires both a ref and a path)' },
      { flag: 'HEAD@{N}', description: 'Checkout the Nth previous HEAD position from the reflog' },
    ],
    examples: [
      { command: 'git checkout main', explanation: 'Switch to the main branch' },
      { command: 'git checkout -b new-feature', explanation: 'Create and switch to a new branch' },
      { command: 'git checkout HEAD -- README.md', explanation: 'Restore README.md from the latest commit (overwrites working copy and stages it)' },
      { command: 'git checkout abc1234 -- config.ts', explanation: 'Restore config.ts as it was at commit abc1234' },
      {
        command: 'git checkout HEAD@{2}',
        output: 'Note: switching to \'HEAD@{2}\'.\n\nYou are in \'detached HEAD\' state...',
        explanation: 'Jump to where HEAD was two moves ago (from the reflog) -- git warns you because you\'re no longer on a branch',
      },
    ],
    tip: 'Prefer "git switch" for changing branches. The "checkout <ref> -- <file>" form is powerful for restoring individual files from any point in history without leaving your current branch.',
    related: ['switch', 'branch', 'reset', 'log'],
    seeAlso: ['refs-and-head', 'the-reflog', 'undoing-changes'],
  },

  switch: {
    name: 'switch',
    syntax: 'git switch [-b <name>] <branch>',
    description:
      '"git switch" does one thing: move HEAD to a different branch and update the working directory to match. It was split out of "checkout" to eliminate confusion between switching branches and restoring files. Use "-b" to create a new branch and switch in one step. Under the hood, it updates the HEAD symref to point to the new branch.',
    options: [
      { flag: '<branch>', description: 'Switch to an existing branch' },
      { flag: '-b <name>', description: 'Create a new branch and switch to it' },
    ],
    examples: [
      { command: 'git switch main', explanation: 'Switch to the main branch' },
      { command: 'git switch -b feature-auth', explanation: 'Create and switch to "feature-auth" in one step' },
      { command: 'git switch -b hotfix main', explanation: 'Branch off a specific starting point ("main") instead of wherever you currently are' },
      {
        command: 'git switch feature-x',
        output: 'branch \'feature-x\' set up to track \'origin/feature-x\'.\nSwitched to a new branch \'feature-x\'',
        explanation: 'If a matching remote-tracking branch exists but you don\'t have a local one yet, git creates and tracks it for you automatically',
      },
    ],
    tip: 'In Gitvana, "git switch" is an alias for "git checkout", so both commands behave identically. Use whichever feels natural.',
    related: ['checkout', 'branch', 'merge'],
    seeAlso: ['refs-and-head'],
  },

  merge: {
    name: 'merge',
    syntax: 'git merge <branch>',
    description:
      '"git merge" integrates changes from another branch into your current branch. If the branches haven\'t diverged, git performs a "fast-forward" -- it simply moves the branch pointer ahead. If they have diverged, git creates a merge commit with two parents, combining both histories. When the same lines were changed on both sides, git cannot auto-resolve and reports a merge conflict for you to fix manually.',
    options: [
      { flag: '--no-ff', description: 'Force a merge commit even if fast-forward is possible (preserves branch history)' },
      { flag: '--abort', description: 'Abort a merge in progress and go back to the pre-merge state' },
      { flag: '--squash', description: 'Squash all commits into one before merging (no merge commit)' },
    ],
    examples: [
      { command: 'git merge feature-login', output: 'Updating a1b2c3d..e4f5g6h\nFast-forward\n 2 files changed, 15 insertions(+)', explanation: 'When nothing has changed on your branch since it diverged, git just fast-forwards -- no merge commit needed' },
      {
        command: 'git merge feature-login',
        output: 'Merge made by the \'ort\' strategy.\n 2 files changed, 15 insertions(+)',
        explanation: 'When both branches have new commits, git creates a real merge commit tying the two histories together',
      },
      { command: 'git merge --no-ff feature-login', explanation: 'Force a merge commit even when a fast-forward is possible, so history still shows the branch existed' },
      {
        command: 'git merge feature-login',
        output: 'Auto-merging config.txt\nCONFLICT (content): Merge conflict in config.txt\nAutomatic merge failed; fix conflicts and then commit the result.',
        explanation: 'Both branches changed the same lines -- git pauses and asks you to resolve it by hand (see the conflict resolution guide)',
      },
      { command: 'git merge --abort', explanation: 'Bail out of a conflicted merge entirely and go back to how things were' },
    ],
    tip: 'Always merge from an up-to-date main branch. Run "git pull" on main first, then merge. Otherwise you\'re merging into a stale version and creating unnecessary conflicts.',
    advanced: '## Merge Strategies\n\nGit picks a strategy automatically based on what it\'s merging, but you can steer it:\n\n**--squash** takes every commit on the other branch and combines them into one set of staged changes -- no merge commit, no two-parent history, just "here\'s all that work, as if you did it yourself." Good for tidying up a messy feature branch into one clean commit on main.\n\n**-X ours** / **-X theirs** tell git how to auto-resolve *line-level* conflicts within a hunk, preferring one side -- useful for things like generated lockfiles where you always want one side to win. This is different from **--strategy=ours**, which is much blunter: it discards the other branch\'s changes entirely and just records that a merge happened.\n\n```\ngit merge --squash feature-login\ngit commit -m "Add login feature (squashed)"\n```\n\nThe squash-then-commit pattern above is a common alternative to interactive rebase for cleaning up a branch\'s history right before it lands on main.',
    related: ['branch', 'switch', 'rebase', 'log'],
    seeAlso: ['merge-vs-rebase', 'conflict-resolution'],
  },

  rm: {
    name: 'rm',
    syntax: 'git rm [options] <file>...',
    description:
      '"git rm" removes a file from both the working directory and the staging area in one step. This is different from just deleting a file with your OS -- if you delete a file manually, git sees it as "deleted but not staged." "git rm" stages the deletion so the next commit will record the file\'s removal. With "--cached", it removes the file from the staging area only, keeping it on disk -- useful for untracking files you committed by mistake.',
    options: [
      { flag: '--cached', description: 'Remove from the staging area / index only -- keep the file on disk (useful for untracking files)' },
      { flag: '-f, --force', description: 'Force removal even if the file has local modifications' },
      { flag: '-r, --recursive', description: 'Recursively remove a directory and all its contents' },
    ],
    examples: [
      { command: 'git rm secret.txt', output: 'rm \'secret.txt\'', explanation: 'Delete the file from disk and stage the removal' },
      { command: 'git rm --cached .env', output: 'rm \'.env\'', explanation: 'Stop tracking .env but keep it on disk (pair with .gitignore)' },
      { command: 'git rm -r old-folder/', explanation: 'Recursively remove a directory from git' },
      { command: 'git rm "*.log"', explanation: 'Remove all .log files (quote the glob so your shell doesn\'t expand it)' },
    ],
    tip: 'The most common use of "git rm --cached" is when you accidentally committed a file that should be in .gitignore (like .env or node_modules). Remove it from tracking with --cached, add it to .gitignore, then commit. The file stays on your machine but git forgets about it.',
    related: ['add', 'status', 'reset', 'commit'],
    seeAlso: ['the-three-areas'],
  },

  reset: {
    name: 'reset',
    syntax: 'git reset [--soft|--mixed|--hard] [<commit>] | git reset [HEAD] <file>',
    description:
      '"git reset" moves the current branch pointer to a different commit. The three modes control what happens to the changes between the old and new positions. "--soft" keeps them staged. "--mixed" (default) unstages them but keeps the files modified. "--hard" discards everything. When used with a file path instead of a commit, it doesn\'t move the branch pointer -- it just copies that file from the specified commit (or HEAD) into the staging area, effectively unstaging it.',
    options: [
      { flag: '--soft', description: 'Move HEAD back but keep changes staged (gentle undo)' },
      { flag: '--mixed', description: 'Move HEAD back and unstage changes (default -- keeps files intact)' },
      { flag: '--hard', description: 'Move HEAD back and DELETE all changes (destructive -- no undo!)' },
      { flag: 'HEAD~N', description: 'Target: N commits before the current HEAD' },
      { flag: '<file>', description: 'Unstage a specific file (without moving HEAD)' },
    ],
    examples: [
      { command: 'git reset', explanation: 'Unstage all staged changes (keep the file modifications)' },
      { command: 'git reset HEAD README.md', output: 'Unstaged changes after reset:\n\tREADME.md', explanation: 'Unstage README.md (keep the file changes)' },
      { command: 'git reset app.ts', explanation: 'Unstage app.ts without the HEAD prefix' },
      { command: 'git reset --soft HEAD~1', output: 'HEAD is now at e4f5g6h', explanation: 'Undo last commit but keep changes staged' },
      { command: 'git reset --mixed HEAD~3', explanation: 'Undo last 3 commits, keep files but unstage them' },
      { command: 'git reset --hard HEAD~1', output: 'HEAD is now at e4f5g6h', explanation: 'Completely undo last commit and discard all changes' },
    ],
    tip: 'If you accidentally "git reset --hard" and lose work, don\'t panic. "git reflog" shows recent HEAD positions, and you can often recover with "git reset --hard <hash>". The reflog keeps entries for about 90 days.',
    related: ['checkout', 'revert', 'log', 'reflog'],
    seeAlso: ['the-three-areas', 'rewriting-history', 'undoing-changes'],
  },

  tag: {
    name: 'tag',
    syntax: 'git tag [<name>] [-a <name> -m <message>] [-d <name>]',
    description:
      'A tag is a named pointer to a specific commit, like a branch that never moves. Lightweight tags are simple pointers -- a file in .git/refs/tags/ containing a commit hash. Annotated tags are full git objects that store the tagger\'s name, email, date, and a message in addition to the commit reference. Tags are typically used to mark release points (v1.0, v2.3.1) so you can easily find important commits without memorizing hashes.',
    options: [
      { flag: '<name>', description: 'Create a lightweight tag at HEAD' },
      { flag: '<name> <commit>', description: 'Create a lightweight tag at a specific commit' },
      { flag: '-a, --annotate <name> -m, --message <msg>', description: 'Create an annotated tag with a message (includes tagger info and date)' },
      { flag: '-d, --delete <name>', description: 'Delete a tag' },
      { flag: '-l, --list', description: 'List all tags' },
    ],
    examples: [
      { command: 'git tag', output: 'v1.0\nv1.1\nv2.0-beta', explanation: 'List all existing tags' },
      { command: 'git tag v1.0', explanation: 'Create a lightweight tag "v1.0" at the current commit' },
      { command: 'git tag v0.9 HEAD~3', explanation: 'Tag the commit three steps back' },
      { command: 'git tag -a v2.0 -m "Major release"', explanation: 'Create an annotated tag with a message' },
      { command: 'git tag -d v1.0-beta', output: 'Deleted tag \'v1.0-beta\'', explanation: 'Delete a tag you no longer need' },
    ],
    tip: 'Use annotated tags (-a) for releases and lightweight tags for temporary or personal bookmarks. Annotated tags store who created them and when, which matters when you\'re shipping software.',
    related: ['log', 'commit', 'branch'],
    seeAlso: ['refs-and-head'],
  },

  'cherry-pick': {
    name: 'cherry-pick',
    syntax: 'git cherry-pick <commit>',
    description:
      '"git cherry-pick" takes a single commit from anywhere in the repository and replays its diff onto your current branch, creating a new commit. The new commit has the same changes but a different hash (different parent, different timestamp). Cherry-picking duplicates rather than moves work, so use it sparingly -- it\'s ideal for grabbing a specific bugfix from another branch without merging the entire branch.',
    options: [
      { flag: '<commit>', description: 'The commit hash (full or short) to apply onto the current branch' },
    ],
    examples: [
      {
        command: 'git cherry-pick abc1234',
        output: '[main f1e2d3c] Fix null pointer in auth check\n Date: Tue Aug 5 14:02:11 2026\n 1 file changed, 3 insertions(+)',
        explanation: 'Apply commit abc1234 onto the current branch as a brand new commit',
      },
      { command: 'git cherry-pick HEAD~2', explanation: 'Cherry-pick the commit two steps before HEAD' },
      { command: 'git checkout main && git cherry-pick hotfix~1', explanation: 'The classic hotfix move: grab one specific fix off a feature branch onto main, without pulling in the rest of that branch\'s unfinished work' },
      {
        command: 'git cherry-pick def5678',
        output: 'error: could not apply def5678...\nCONFLICT (content): Merge conflict in app.js\nAfter resolving the conflicts, use "git add" and "git commit" to complete the cherry-pick.',
        explanation: 'Just like a merge, cherry-pick can conflict if the target branch has diverged too much -- resolve it the same way: edit the file, "git add" it, then "git commit"',
      },
    ],
    tip: 'Cherry-pick is ideal for hotfixes: fix a bug on a feature branch, then cherry-pick that single fix onto main without merging the whole feature. But remember, the cherry-picked commit gets a new hash -- it\'s a copy, not a move.',
    related: ['merge', 'log', 'commit', 'show'],
    seeAlso: ['rewriting-history'],
  },

  show: {
    name: 'show',
    syntax: 'git show [<commit>] [<commit>:<file>]',
    description:
      '"git show" displays the full details of a commit: hash, author, date, message, and the computed diff against its parent. With the "<commit>:<file>" syntax, it displays the contents of a specific file as it existed at that commit -- without checking it out or modifying your working directory. It\'s a read-only inspection tool for examining any point in your repository\'s history.',
    options: [
      { flag: '<commit>', description: 'Show details and diff for a specific commit (defaults to HEAD)' },
      { flag: '<commit>:<file>', description: 'Show the contents of a file at a specific commit' },
    ],
    examples: [
      {
        command: 'git show',
        output: 'commit a1b2c3d\nAuthor: Ada Lovelace <ada@example.com>\nDate:   Tue Aug 5 14:02:11 2026\n\n    Fix login bug\n\ndiff --git a/app.js b/app.js\n--- a/app.js\n+++ b/app.js\n@@ -10,1 +10,1 @@\n-  return false;\n+  return true;',
        explanation: 'Show the latest commit -- full metadata plus its diff against its parent',
      },
      { command: 'git show HEAD~2', explanation: 'Show the commit two steps back' },
      { command: 'git show abc1234', explanation: 'Show a specific commit by hash' },
      { command: 'git show HEAD:README.md', explanation: 'Show README.md as it exists in the latest commit, without checking anything out' },
      { command: 'git show main:config.json', explanation: 'Peek at a file on another branch entirely, without switching to it first' },
    ],
    tip: 'Use "git show <commit>:<file>" when you need to see what a file looked like at a past commit without checking it out. It\'s read-only and completely safe.',
    related: ['log', 'diff', 'cherry-pick'],
    seeAlso: ['what-is-a-commit'],
  },

  revert: {
    name: 'revert',
    syntax: 'git revert <commit>',
    description:
      '"git revert" creates a NEW commit that undoes the changes of a specified previous commit. Unlike "reset", which moves the branch pointer backward (rewriting history), "revert" moves history forward -- the original commit stays in the log. This makes revert safe for commits that have already been pushed and shared, because it doesn\'t rewrite anything others depend on.',
    options: [
      { flag: '<commit>', description: 'The commit hash or ref (e.g., HEAD~1) whose changes should be undone' },
    ],
    examples: [
      { command: 'git revert HEAD', output: '[main f1e2d3c] Revert "Add experimental flag"\n 1 file changed, 1 deletion(-)', explanation: 'Undo the most recent commit by creating a new revert commit' },
      { command: 'git revert HEAD~2', explanation: 'Undo the commit three steps back (only that specific commit, not the ones after it)' },
      { command: 'git revert abc1234', explanation: 'Undo a specific commit by its hash' },
      {
        command: 'git revert HEAD',
        output: 'Auto-merging failed; fix conflicts and then commit the result.\nCONFLICT (content): Merge conflict in app.js',
        explanation: 'A revert can conflict too, if later commits touched the same lines the revert wants to undo -- resolve it like any other conflict',
      },
    ],
    tip: 'Use "revert" instead of "reset" when the commit has already been pushed to a shared repository. Revert adds history; reset erases it.',
    related: ['reset', 'log', 'cherry-pick', 'commit'],
    seeAlso: ['rewriting-history', 'undoing-changes'],
  },

  stash: {
    name: 'stash',
    syntax: 'git stash [push|pop|list|drop]',
    description:
      '"git stash" saves your uncommitted changes (both staged and unstaged) to a temporary storage stack and restores a clean working directory. This lets you switch branches or pull updates without committing half-finished work. "git stash pop" re-applies the most recent stash and removes it from the stack. The stash is a stack (LIFO) -- you can have multiple entries, listed with "git stash list" and referenced as stash@{0}, stash@{1}, etc.',
    options: [
      { flag: 'push', description: 'Save your uncommitted changes to the stash (default when no subcommand given)' },
      { flag: 'pop', description: 'Apply the most recent stash entry and remove it from the stash' },
      { flag: 'list', description: 'Show all stash entries' },
      { flag: 'drop [stash@{N}]', description: 'Remove a stash entry without applying it' },
    ],
    examples: [
      { command: 'git stash', output: 'Saved working directory and index state WIP on main', explanation: 'Stash all uncommitted changes and give you a clean working directory' },
      { command: 'git stash pop', output: 'Applied stash and dropped stash@{0}', explanation: 'Restore the most recently stashed changes' },
      { command: 'git stash list', output: 'stash@{0}: On main: WIP debugging login\nstash@{1}: On feature-x: half-finished styling', explanation: 'See all stashed entries -- yes, you can stash on multiple branches and they all pile up on one stack' },
      { command: 'git stash drop', explanation: 'Discard the most recent stash entry' },
      { command: 'git stash drop stash@{2}', explanation: 'Discard a specific stash entry' },
    ],
    tip: 'Stash is your "quick save" button. Use it before switching branches when you have work in progress. But don\'t let stashes pile up -- they\'re meant to be temporary.',
    related: ['checkout', 'switch', 'status', 'reset'],
    seeAlso: ['the-three-areas', 'undoing-changes'],
  },

  reflog: {
    name: 'reflog',
    syntax: 'git reflog',
    description:
      'The reflog records every time HEAD moves -- every commit, checkout, reset, merge, and rebase. Even if a commit becomes unreachable from any branch (after a hard reset or deleted branch), it still appears in the reflog for about 90 days. This makes the reflog your primary recovery tool: find the hash of a lost commit in the reflog, then create a branch there or reset to it.',
    options: [],
    examples: [
      {
        command: 'git reflog',
        output: 'e4f5g6h HEAD@{0}: commit: Add user auth\na1b2c3d HEAD@{1}: checkout: moving from feature to main\nf1e2d3c HEAD@{2}: commit: WIP save\nb0a1c2d HEAD@{3}: reset: moving to HEAD~2',
        explanation: 'Every place HEAD has been, newest first -- HEAD@{0} is where you are now, HEAD@{1} is one move back',
      },
      { command: 'git branch rescued HEAD@{2}', explanation: 'Found something you want back? Branch it off directly from the reflog entry\'s position' },
      { command: 'git reset --hard HEAD@{1}', explanation: 'Or jump your current branch straight back to a past position' },
    ],
    tip: 'Lost a commit after a hard reset? Run "git reflog", find the hash of the commit you want, and "git reset --hard <hash>" to get it back. The reflog typically keeps entries for 90 days.',
    related: ['reset', 'log', 'checkout', 'revert'],
    seeAlso: ['the-reflog', 'refs-and-head'],
  },

  rebase: {
    name: 'rebase',
    syntax: 'git rebase <branch>',
    description:
      '"git rebase" replays your branch\'s commits on top of another branch, one at a time. Each replayed commit gets a new hash because its parent changed. The result is a linear history -- as if you started your work from the tip of the target branch. This produces cleaner logs than merge but rewrites commit hashes, making it unsafe for shared/pushed commits. Rebase your local feature branch; merge into shared branches.',
    options: [
      { flag: '<branch>', description: 'Replay current branch\'s commits on top of the specified branch' },
      { flag: '--continue', description: 'Continue the rebase after resolving conflicts' },
      { flag: '--abort', description: 'Abort the rebase and return to the original state' },
    ],
    examples: [
      { command: 'git rebase main', output: 'Successfully rebased and updated refs/heads/feature.', explanation: 'Replay current branch\'s commits on top of main' },
      {
        command: 'git rebase main',
        output: 'CONFLICT (content): Merge conflict in config.txt\nResolve conflicts and run "git rebase --continue"',
        explanation: 'Each replayed commit can conflict individually -- fix the file, "git add" it, then continue',
      },
      { command: 'git rebase --continue', output: 'Successfully rebased and updated refs/heads/feature.', explanation: 'Continue after fixing a conflict during rebase' },
      { command: 'git rebase --abort', output: 'Rebase aborted.', explanation: 'Give up and go back to exactly where you started, as if the rebase never happened' },
    ],
    tip: 'The golden rule: never rebase commits that have been pushed to a shared branch. Rebase rewrites commit hashes, which confuses everyone who already has the old ones.',
    advanced: '## Rebase vs Merge\n\nBoth integrate changes, but they tell different stories:\n- **Merge** preserves the full branching history (a merge commit with two parents).\n- **Rebase** rewrites history to be linear (as if you started your work from the tip of the target branch).\n\nRebase is cleaner for feature branches before merging. The workflow: rebase your feature onto main, then fast-forward merge into main. The result is a straight line of commits.',
    related: ['merge', 'branch', 'cherry-pick', 'log'],
    seeAlso: ['merge-vs-rebase', 'rewriting-history'],
  },

  blame: {
    name: 'blame',
    syntax: 'git blame <file>',
    description:
      '"git blame" annotates each line of a file with the commit that last modified it, including the commit hash, author, and date. It\'s a forensic tool for understanding the history behind any line of code -- who wrote it, when, and (via the commit message) why. Despite the name, it\'s for understanding context, not assigning fault.',
    options: [
      { flag: '<file>', description: 'The file to annotate with per-line commit information' },
    ],
    examples: [
      {
        command: 'git blame app.js',
        output: 'a1b2c3d (Ada Lovelace  2026-08-05)   1) function login() {\ne4f5g6h (Grace Hopper  2026-08-02)   2)   return true;\na1b2c3d (Ada Lovelace  2026-08-05)   3) }',
        explanation: 'Every line, annotated with the commit and author who last touched it -- line 2 predates line 1 and 3',
      },
      { command: 'git blame config.ts', explanation: 'Trace the origin of each line in a different file' },
      { command: 'git log --follow app.js', explanation: 'Blame shows who last touched each line right now -- pair it with "git log" on the file for the full history of changes, including ones later overwritten' },
    ],
    tip: 'When "git blame" shows a commit that was just a reformatting change, use "git log" on that file to dig deeper. The real author of a line might be several commits back. In real git, "git blame -w" ignores whitespace changes to help with this.',
    related: ['log', 'show', 'diff'],
  },

  bisect: {
    name: 'bisect',
    syntax: 'git bisect <start|good|bad|reset>',
    description:
      '"git bisect" performs a binary search through commit history to find which commit introduced a bug. You mark one commit as "bad" (has the bug) and one as "good" (doesn\'t), and git checks out the midpoint for you to test. After each test, you report good or bad, and git eliminates half the remaining range. In O(log n) steps -- about 10 for 1000 commits -- the guilty commit is identified. It can also be fully automated with "git bisect run <test-script>".',
    options: [
      { flag: 'start', description: 'Begin a bisect session' },
      { flag: 'bad [<commit>]', description: 'Mark the current (or specified) commit as bad (has the bug)' },
      { flag: 'good [<commit>]', description: 'Mark the current (or specified) commit as good (no bug)' },
      { flag: 'reset', description: 'End the bisect session and return to the original branch' },
    ],
    examples: [
      { command: 'git bisect start', output: 'Bisect started. Mark commits with "git bisect good" and "git bisect bad".', explanation: 'Begin the bisect process' },
      { command: 'git bisect bad', explanation: 'Mark the current commit as having the bug' },
      {
        command: 'git bisect good HEAD~10',
        output: 'Bisecting: 4 revisions left to test (roughly 2 steps)\n[e4f5g6h] Checked out for testing.',
        explanation: 'Mark a known-good commit from the past -- git immediately checks out the midpoint for you to test',
      },
      {
        command: 'git bisect bad',
        output: 'a1b2c3d is the first bad commit\ncommit a1b2c3d\nAuthor: Ada Lovelace\n\n    Optimize render loop\n\nBisect complete. Use "git bisect reset" to return to your branch.',
        explanation: 'Once only one commit remains, git names it directly -- no more guessing which commit introduced the bug',
      },
      { command: 'git bisect reset', output: 'Bisect reset. Returned to branch \'main\'.', explanation: 'Finish bisecting and go back to your branch' },
    ],
    tip: 'The typical bisect workflow: start, mark current as bad, mark an old known-good commit as good, then test each checkout and report good/bad. With 1000 commits, bisect finds the culprit in about 10 steps.',
    related: ['log', 'checkout', 'show'],
    seeAlso: ['bisect-debugging'],
  },

  remote: {
    name: 'remote',
    syntax: 'git remote [add|remove] <name> [<url>]',
    description:
      '"git remote" manages connections to other copies of your repository. A remote is a bookmark -- it stores a name (usually "origin") and a URL so you don\'t have to type the full address every time you push or fetch. The remote itself doesn\'t contain any code; it\'s just a reference. Actual data transfer happens through "push", "fetch", and "pull".',
    options: [
      { flag: '-v, --verbose', description: 'Show remote URLs alongside names' },
      { flag: 'add <name> <url>', description: 'Register a new remote with the given name and URL' },
      { flag: 'remove <name>', description: 'Unregister a remote and clean up its tracking refs' },
    ],
    examples: [
      { command: 'git remote', output: 'origin', explanation: 'List all configured remote names' },
      {
        command: 'git remote -v',
        output: 'origin\thttps://github.com/you/repo.git (fetch)\norigin\thttps://github.com/you/repo.git (push)',
        explanation: 'Show remote names with their URLs -- fetch and push can technically point elsewhere, though they\'re usually the same',
      },
      { command: 'git remote add origin https://github.com/you/repo.git', explanation: 'Add a remote named "origin"' },
      { command: 'git remote add upstream https://github.com/original-author/repo.git', explanation: 'The classic fork workflow: "origin" is your fork, "upstream" is the original repo you forked from' },
      { command: 'git remote remove upstream', explanation: 'Remove a remote named "upstream"' },
    ],
    tip: '"origin" is just a convention -- it\'s the default name for the remote you cloned from. You can name remotes whatever you want and have multiple remotes (e.g., "origin" for your fork and "upstream" for the original repo).',
    related: ['push', 'fetch', 'pull'],
    seeAlso: ['remotes-and-collaboration'],
  },

  push: {
    name: 'push',
    syntax: 'git push [<remote>] [<branch>]',
    description:
      '"git push" uploads your local commits to a remote repository. It sends new commit objects and updates the remote branch ref to point to your latest commit. By default it pushes to "origin" and the current branch. Push only works if the remote branch can be fast-forwarded to your commits -- if someone else pushed first, you need to pull and merge before pushing.',
    options: [
      { flag: '-u, --set-upstream', description: 'Set the upstream tracking branch (so future "git push" works without arguments)' },
      { flag: '-f, --force', description: 'Force-push even if the remote has diverged (DANGER: overwrites remote history)' },
    ],
    examples: [
      { command: 'git push', output: 'To origin\n   a1b2c3d..e4f5g6h  main -> main', explanation: 'Push current branch to its upstream remote' },
      { command: 'git push origin main', explanation: 'Push the "main" branch to the "origin" remote' },
      { command: 'git push -u origin feature', output: 'To origin\n * [new branch]      feature -> feature', explanation: 'Push "feature" and set upstream tracking, in one step' },
      {
        command: 'git push',
        output: 'To origin\n ! [rejected]        main -> main (non-fast-forward)\nerror: failed to push some refs to \'origin\'\nhint: Updates were rejected because the tip of your current branch is behind\nhint: its remote counterpart. Use --force to override.',
        explanation: 'Someone else pushed first -- git refuses to overwrite their commits. Pull (or fetch + merge) their changes in, then push again',
      },
      { command: 'git push --force', explanation: 'Force-push anyway (use with extreme caution -- see the remotes and collaboration guide for why)' },
    ],
    tip: 'Never force-push to a shared branch unless you know what you\'re doing. It rewrites remote history and can destroy other people\'s work. If "git push" is rejected, pull first to integrate remote changes.',
    related: ['fetch', 'pull', 'remote'],
    seeAlso: ['remotes-and-collaboration'],
  },

  fetch: {
    name: 'fetch',
    syntax: 'git fetch [<remote>] [--all]',
    description:
      '"git fetch" downloads new commits from a remote without changing your working directory or current branch. It updates your remote tracking refs (e.g., "origin/main") so you can see what changed on the remote. Fetch is safe -- it only downloads, never modifies your local branches. After fetching, you can inspect the changes with "git log origin/main" and decide whether to merge.',
    options: [
      { flag: '--all', description: 'Fetch from all configured remotes' },
    ],
    examples: [
      { command: 'git fetch', output: 'From origin\n   a1b2c3d..e4f5g6h  main     -> origin/main', explanation: 'Fetch from the default remote (origin) -- only origin/main moved, your local main is untouched' },
      { command: 'git fetch origin', explanation: 'Fetch new commits from "origin" explicitly' },
      { command: 'git fetch --all', explanation: 'Fetch from every configured remote at once' },
      { command: 'git log origin/main', explanation: 'After fetching, inspect what changed before deciding whether to merge it in' },
    ],
    tip: 'Prefer "git fetch" + "git merge" over "git pull" when you want to inspect changes before integrating them. Fetch is always safe; it never changes your local work.',
    related: ['pull', 'push', 'merge', 'remote'],
    seeAlso: ['remotes-and-collaboration'],
  },

  pull: {
    name: 'pull',
    syntax: 'git pull [<remote>] [<branch>]',
    description:
      '"git pull" is shorthand for "git fetch" followed by "git merge". It downloads new commits from the remote and immediately merges them into your current branch. If your branch hasn\'t diverged from the remote, the merge is a fast-forward (just moving the pointer). If both sides have new commits, git creates a merge commit. If both changed the same lines, you\'ll get a merge conflict to resolve.',
    options: [
      { flag: '--rebase', description: 'Rebase instead of merge (replay your commits on top of the remote)' },
    ],
    examples: [
      {
        command: 'git pull',
        output: 'From origin\n   a1b2c3d..e4f5g6h  main     -> origin/main\nUpdating...\nFast-forward',
        explanation: 'Pull from the upstream remote -- here nothing diverged locally, so it\'s just a fast-forward',
      },
      { command: 'git pull origin main', explanation: 'Pull the "main" branch from "origin" explicitly and merge it' },
      { command: 'git pull', output: 'Already up to date.', explanation: 'The most common outcome by far -- there was nothing new to bring in' },
      {
        command: 'git pull',
        output: 'From origin\n   a1b2c3d..e4f5g6h  main     -> origin/main\nMerge made by the \'ort\' strategy.',
        explanation: 'You had local commits too, so pull fetched and then created a real merge commit to combine both histories',
      },
    ],
    tip: 'If you want more control, use "git fetch" + "git merge" separately. "git pull" is convenient but can surprise you with merge conflicts if you\'re not expecting diverged history.',
    related: ['fetch', 'push', 'merge', 'remote'],
    seeAlso: ['remotes-and-collaboration'],
  },

  config: {
    name: 'config',
    syntax: 'git config [--global] <key> <value> | git config --list',
    description:
      '"git config" reads and writes the settings that control how git behaves, at three possible scopes: local (this repo only, stored in .git/config -- the default when you give no scope flag), global (this user, stored in ~/.gitconfig, applies to every repo you touch), and system (every user on the machine, rarely touched). A more specific scope always wins -- a local setting overrides a global one. The two settings you\'ll set almost immediately after creating your very first repo are your name and email: git stamps every single commit with whatever "user.name" and "user.email" are configured at the moment you commit.',
    options: [
      { flag: '--global', description: 'Apply to every repo for the current user (~/.gitconfig)' },
      { flag: '--local', description: 'Apply to this repo only (the default when no scope flag is given)' },
      { flag: '-l, --list', description: 'Show every currently active setting' },
      { flag: '--unset <key>', description: 'Remove a setting' },
    ],
    examples: [
      { command: 'git config --global user.name "Ada Lovelace"', explanation: 'Set the name attached to every commit you make, on every repo on this machine' },
      { command: 'git config --global user.email "ada@example.com"', explanation: 'Set the email attached to every commit -- usually the very first git command anyone runs, right after installing it' },
      { command: 'git config --list', output: 'user.name=Ada Lovelace\nuser.email=ada@example.com\ncore.editor=vim', explanation: 'See every active setting -- handy for confirming what\'s actually in effect before you go digging through config files' },
      { command: 'git config alias.co checkout', explanation: 'Define a shortcut -- "git co" now behaves exactly like "git checkout"' },
    ],
    tip: 'If a teammate ever asks "why do my commits show up under the wrong name," the fix is almost always a missing or stale "git config user.email" -- check it with a bare "git config user.email" before reaching for anything more exotic.',
    related: ['init', 'commit'],
  },

  clean: {
    name: 'clean',
    syntax: 'git clean -n | git clean -f [-d]',
    description:
      '"git clean" deletes untracked files from your working directory -- files git has never seen, not files you\'ve modified or deleted that it already knows about. That distinction is the whole point: "git reset"/"git restore" undo changes to tracked files; "git clean" removes files that were never tracked in the first place (stray build output, scratch notes, editor droppings). Because it only ever touches untracked content, anything it deletes is NOT recoverable through "git reflog" the way commits are -- clean is the one everyday git command that is genuinely, permanently destructive.',
    options: [
      { flag: '-n, --dry-run', description: 'List what would be deleted, without deleting anything' },
      { flag: '-f, --force', description: 'Actually delete the files -- git refuses to run without this' },
      { flag: '-d', description: 'Also remove untracked directories, not just files' },
      { flag: '-x', description: 'Also remove files ignored by .gitignore (e.g. build/, dist/)' },
    ],
    examples: [
      { command: 'git clean -n', output: 'Would remove build/\nWould remove scratch.txt', explanation: 'Always run this first -- see exactly what would go before you commit to deleting it' },
      { command: 'git clean -f', explanation: 'Delete the untracked files the dry run just showed you' },
      { command: 'git clean -fd', explanation: 'Also remove untracked directories, like an entire stray build/ folder left over from a failed build' },
      { command: 'git clean -fx', explanation: 'Also wipe ignored files -- the "get me back to a truly fresh checkout" version, useful before a release build' },
    ],
    tip: 'This is not reflog-protected -- there is no undo. Make "-n" (or a "git status" glance) a habit before every "clean -f", no exceptions, especially the first few times you use it.',
    related: ['status', 'reset', 'rm'],
  },

  mv: {
    name: 'mv',
    syntax: 'git mv <source> <destination>',
    description:
      '"git mv" renames or moves a tracked file and stages the result in one step -- a convenience wrapper around a plain filesystem move plus "git add" of the new path and "git rm" of the old one. Under the hood git doesn\'t actually store a "rename" as its own kind of operation: it just notices the old blob is gone and an identical blob exists at a new path, and infers the rename afterward by comparing content. Which means "git mv old.ts new.ts" and a plain shell "mv old.ts new.ts" followed by "git add -A" produce the exact same result in the end -- "git mv" only saves you the two extra commands.',
    options: [
      { flag: '-f, --force', description: 'Overwrite the destination if it already exists' },
      { flag: '-n, --dry-run', description: 'Show what would happen without doing it' },
    ],
    examples: [
      { command: 'git mv old-name.ts new-name.ts', output: 'old-name.ts -> new-name.ts', explanation: 'Rename a file and stage the rename in one step' },
      { command: 'git mv utils.ts src/lib/utils.ts', output: 'utils.ts -> src/lib/utils.ts', explanation: 'Move a file into a different directory' },
      { command: 'git status', output: 'Changes to be committed:\n  renamed:    old-name.ts -> new-name.ts', explanation: 'Git recognized it as a rename, not a delete-plus-add -- this is the whole reason "git mv" is worth reaching for' },
      { command: 'git mv README.md docs/README.md', output: 'fatal: destination exists, source=README.md, destination=docs/README.md', explanation: 'Git refuses to silently overwrite an existing file -- move the conflicting file first, or use -f if you really mean it' },
    ],
    tip: 'You never strictly need this command -- a plain "mv" plus "git add -A" gets detected as a rename anyway, by content similarity. Use "git mv" when you\'d rather stage the rename deliberately in one step than trust the heuristic.',
    related: ['add', 'rm', 'status'],
    seeAlso: ['how-git-stores-data'],
  },

  restore: {
    name: 'restore',
    syntax: 'git restore [--staged] <file> | git restore --source <commit> <file>',
    description:
      '"git restore" (added in Git 2.23) undoes changes to files, and only to files -- it never touches branches or HEAD. It exists because "git checkout" historically did two unrelated jobs at once (switch branches, AND discard file changes), which has confused nearly everyone who\'s used git long enough. "git restore <file>" discards uncommitted changes in your working directory, replacing the file with the version from HEAD. "git restore --staged <file>" does the opposite end of the pipeline: it un-stages a file without touching your edits, moving it back from the staging area to "modified but not staged."',
    options: [
      { flag: '--staged', description: 'Unstage a file (move it out of the index) without discarding its edits' },
      { flag: '--source <commit>', description: 'Restore from a specific commit instead of HEAD' },
    ],
    examples: [
      { command: 'git restore config.txt', explanation: 'Throw away uncommitted edits to a file, back to how it was at HEAD -- silent on success, like most git undo operations' },
      { command: 'git restore --staged config.txt', explanation: 'Un-stage a file you "git add"ed too early -- the edits stay, they\'re just no longer queued for the next commit' },
      { command: 'git status -s', output: ' M config.txt', explanation: 'Confirm it worked -- the leading space (not "M ") means modified-but-unstaged, exactly what --staged was for' },
      { command: 'git restore --source HEAD~2 report.txt', explanation: 'Pull a file\'s content from two commits ago into your working directory, without touching history' },
    ],
    tip: 'Not sure whether you want "restore", "reset", or "checkout" for undoing something? See the Undoing Changes guide -- it\'s a short decision tree, not a history lecture.',
    related: ['reset', 'checkout', 'status'],
    seeAlso: ['undoing-changes'],
  },
};
