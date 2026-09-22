import git from 'isomorphic-git';
import type { GitEngine } from '../git/GitEngine.js';
import type { ValidatorConfig, ValidationResult } from '../../../levels/schema.js';
import { t } from '../../../i18n/index.js';

export class LevelValidator {
  constructor(private engine: GitEngine) {}

  async validate(validators: ValidatorConfig[]): Promise<ValidationResult> {
    const results = [];

    for (const validator of validators) {
      const result = await this.runValidator(validator);
      results.push(result);
    }

    return {
      passed: results.every((r) => r.passed),
      results,
    };
  }

  private async runValidator(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    try {
      switch (validator.type) {
        case 'file-exists':
          return await this.validateFileExists(validator);
        case 'file-content':
          return await this.validateFileContent(validator);
        case 'branch-exists':
          return await this.validateBranchExists(validator);
        case 'head-at':
          return await this.validateHeadAt(validator);
        case 'commit-count':
          return await this.validateCommitCount(validator);
        case 'staging-empty':
          return await this.validateStagingEmpty(validator);
        case 'commit-message-contains':
          return await this.validateCommitMessage(validator);
        case 'merge-commit-exists':
          return await this.validateMergeCommitExists(validator);
        case 'no-conflicts':
          return await this.validateNoConflicts(validator);
        case 'branch-deleted':
          return await this.validateBranchDeleted(validator);
        case 'tag-exists':
          return await this.validateTagExists(validator);
        case 'no-merge-commits':
          return await this.validateNoMergeCommits(validator);
        case 'file-not-exists':
          return await this.validateFileNotExists(validator);
        case 'remote-exists':
          return await this.validateRemoteExists(validator);
        case 'remote-branch-exists':
          return await this.validateRemoteBranchExists(validator);
        case 'pushed-to-remote':
          return await this.validatePushedToRemote(validator);
        default:
          return { validator, passed: false, message: t('ui.validator_unknown', { type: validator.type }) };
      }
    } catch (err) {
      return {
        validator,
        passed: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private async validateFileExists(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const { path, tracked } = validator.params as { path: string; tracked?: boolean };
    const fullPath = `${this.engine.dir}/${path}`;

    try {
      await this.engine.fs.promises.stat(fullPath);
    } catch {
      return { validator, passed: false, message: t('ui.validator_file_missing', { path }) };
    }

    if (tracked === false) {
      // File should exist but NOT be tracked
      try {
        const matrix = await git.statusMatrix({ fs: this.engine.fs, dir: this.engine.dir });
        const entry = matrix.find(([f]) => f === path);
        if (entry && entry[3] !== 0) {
          return { validator, passed: false, message: t('ui.validator_file_untracked', { path }) };
        }
      } catch {
        // statusMatrix fails on repos with no commits — nothing is tracked
      }
    }

    return { validator, passed: true, message: t('ui.validator_file_exists', { path }) };
  }

  private async validateFileContent(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const { path, contains, containsAlso, notContains, equals } = validator.params as {
      path: string;
      contains?: string;
      containsAlso?: string;
      notContains?: string;
      equals?: string;
    };
    const fullPath = `${this.engine.dir}/${path}`;

    try {
      const content = (await this.engine.fs.promises.readFile(fullPath, 'utf8')) as string;

      if (equals !== undefined && content.trim() !== equals.trim()) {
        return { validator, passed: false, message: t('ui.validator_content_mismatch', { path }) };
      }

      if (contains !== undefined && !content.includes(contains)) {
        return { validator, passed: false, message: t('ui.validator_missing_content', { path, text: contains }) };
      }

      if (containsAlso !== undefined && !content.includes(containsAlso)) {
        return { validator, passed: false, message: t('ui.validator_missing_content', { path, text: containsAlso }) };
      }

      if (notContains !== undefined && content.includes(notContains)) {
        return { validator, passed: false, message: t('ui.validator_forbidden_content', { path, text: notContains }) };
      }

      return { validator, passed: true, message: t('ui.validator_content_matches', { path }) };
    } catch {
      return { validator, passed: false, message: t('ui.validator_cannot_read', { path }) };
    }
  }

  private async validateBranchExists(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const { name } = validator.params as { name: string };
    try {
      const branches = await git.listBranches({ fs: this.engine.fs, dir: this.engine.dir });
      const exists = branches.includes(name);
      return {
        validator,
        passed: exists,
        message: exists ? t('ui.validator_branch_exists', { name }) : t('ui.validator_branch_missing', { name }),
      };
    } catch {
      return { validator, passed: false, message: t('ui.validator_branch_missing', { name }) };
    }
  }

  private async validateHeadAt(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const params = validator.params as { branch?: string; ref?: string };
    const target = params.branch || params.ref || 'main';
    try {
      const current = await git.currentBranch({ fs: this.engine.fs, dir: this.engine.dir });
      const match = current === target;
      return {
        validator,
        passed: match,
        message: match ? t('ui.validator_head_at', { name: target }) : t('ui.validator_head_expected', { current: current ?? '—', expected: target }),
      };
    } catch {
      return { validator, passed: false, message: t('ui.validator_head_missing') };
    }
  }

  private async validateCommitCount(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const params = validator.params as { branch?: string; count?: number; min?: number; max?: number };
    const branch = params.branch;

    try {
      const ref = branch || 'HEAD';
      const commits = await git.log({ fs: this.engine.fs, dir: this.engine.dir, ref });

      // Exact count check (when count is provided without min)
      if (params.count !== undefined && params.min === undefined) {
        const match = commits.length === params.count;
        return {
          validator,
          passed: match,
          message: match
            ? t('ui.validator_commit_count_exact', { count: commits.length })
            : t('ui.validator_commit_count_need_exact', { count: commits.length, required: params.count }),
        };
      }

      // Min check
      const required = params.min ?? 0;
      if (commits.length < required) {
        return {
          validator,
          passed: false,
          message: t('ui.validator_only_commits', { count: commits.length, required }),
        };
      }

      // Max check
      if (params.max !== undefined && commits.length > params.max) {
        return {
          validator,
          passed: false,
          message: t('ui.validator_commit_count_max', { count: commits.length, max: params.max }),
        };
      }

      return {
        validator,
        passed: true,
        message: params.max !== undefined
          ? t('ui.validator_commit_count_range', { count: commits.length, min: required, max: params.max })
          : t('ui.validator_commit_count_min_met', { count: commits.length, min: required }),
      };
    } catch {
      const required = params.count ?? params.min ?? 0;
      return { validator, passed: required === 0, message: t('ui.validator_commits_needed', { count: required }) };
    }
  }

  private async validateStagingEmpty(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    try {
      const matrix = await git.statusMatrix({ fs: this.engine.fs, dir: this.engine.dir });
      const staged = matrix.filter(([, head, , stage]) => head !== stage);
      const empty = staged.length === 0;
      return {
        validator,
        passed: empty,
        message: empty ? t('ui.validator_staging_empty') : t('ui.validator_files_staged', { count: staged.length }),
      };
    } catch {
      // No commits yet — check index directly
      try {
        const indexed = await git.listFiles({ fs: this.engine.fs, dir: this.engine.dir });
        const empty = indexed.length === 0;
        return {
          validator,
          passed: empty,
          message: empty ? t('ui.validator_staging_empty') : t('ui.validator_files_staged', { count: indexed.length }),
        };
      } catch {
        return { validator, passed: true, message: t('ui.validator_staging_empty') };
      }
    }
  }

  private async validateCommitMessage(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const params = validator.params as { message?: string; text?: string; notMessage?: string };
    const needle = params.message || params.text || '';
    const forbidden = params.notMessage;

    try {
      const commits = await git.log({ fs: this.engine.fs, dir: this.engine.dir, depth: 50 });
      if (commits.length === 0 && needle) {
        return { validator, passed: false, message: t('ui.validator_commit_needed', { text: needle }) };
      }

      if (needle) {
        const found = commits.some((c) =>
          c.commit.message.toLowerCase().includes(needle.toLowerCase()),
        );
        if (!found) {
          return { validator, passed: false, message: t('ui.validator_no_commit_message', { text: needle }) };
        }
      }

      if (forbidden) {
        const hasForbidden = commits.some((c) =>
          c.commit.message.toLowerCase().includes(forbidden.toLowerCase()),
        );
        if (hasForbidden) {
          return { validator, passed: false, message: t('ui.validator_history_contains', { text: forbidden }) };
        }
      }

      return { validator, passed: true, message: t('ui.validator_commit_messages_match') };
    } catch {
      return { validator, passed: false, message: t('ui.validator_commit_needed', { text: needle }) };
    }
  }

  private async validateMergeCommitExists(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    try {
      const commits = await git.log({ fs: this.engine.fs, dir: this.engine.dir, depth: 20 });
      const mergeCommit = commits.find((c) => c.commit.parent.length >= 2);
      if (mergeCommit) {
        return { validator, passed: true, message: t('ui.validator_merge_found') };
      }
      return { validator, passed: false, message: t('ui.validator_merge_missing') };
    } catch {
      return { validator, passed: false, message: t('ui.validator_merge_missing') };
    }
  }

  private async validateNoConflicts(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    try {
      // Check if any file in working dir still has conflict markers
      const entries = await this.engine.fs.promises.readdir(this.engine.dir) as string[];
      for (const entry of entries) {
        if (entry === '.git') continue;
        try {
          const content = await this.engine.fs.promises.readFile(`${this.engine.dir}/${entry}`, 'utf8') as string;
          if (content.includes('<<<<<<<') || content.includes('>>>>>>>')) {
            return { validator, passed: false, message: t('ui.validator_conflict_markers', { path: entry }) };
          }
        } catch { /* skip non-readable */ }
      }
      return { validator, passed: true, message: t('ui.validator_no_conflicts') };
    } catch {
      return { validator, passed: true, message: t('ui.validator_no_conflicts') };
    }
  }

  private async validateBranchDeleted(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const { name } = validator.params as { name: string };
    try {
      const branches = await git.listBranches({ fs: this.engine.fs, dir: this.engine.dir });
      const exists = branches.includes(name);
      return {
        validator,
        passed: !exists,
        message: exists ? t('ui.validator_branch_still_exists', { name }) : t('ui.validator_branch_deleted', { name }),
      };
    } catch {
      return { validator, passed: true, message: t('ui.validator_branch_deleted', { name }) };
    }
  }

  private async validateNoMergeCommits(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const params = validator.params as { branch?: string };
    try {
      const ref = params.branch || 'HEAD';
      const commits = await git.log({ fs: this.engine.fs, dir: this.engine.dir, ref, depth: 50 });
      const mergeCommit = commits.find((c) => c.commit.parent.length >= 2);
      if (mergeCommit) {
        return { validator, passed: false, message: t('ui.validator_merge_unexpected', { message: mergeCommit.commit.message.trim() }) };
      }
      return { validator, passed: true, message: t('ui.validator_history_linear') };
    } catch {
      return { validator, passed: true, message: t('ui.validator_no_merge_commits') };
    }
  }

  private async validateFileNotExists(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const { path } = validator.params as { path: string };
    const fullPath = `${this.engine.dir}/${path}`;
    try {
      await this.engine.fs.promises.stat(fullPath);
      return { validator, passed: false, message: t('ui.validator_file_should_not_exist', { path }) };
    } catch {
      return { validator, passed: true, message: t('ui.validator_file_absent', { path }) };
    }
  }

  private async validateTagExists(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const { name } = validator.params as { name: string };
    try {
      const tags = await git.listTags({ fs: this.engine.fs, dir: this.engine.dir });
      const exists = tags.includes(name);
      return {
        validator,
        passed: exists,
        message: exists ? t('ui.validator_tag_exists', { name }) : t('ui.validator_tag_missing', { name }),
      };
    } catch {
      return { validator, passed: false, message: t('ui.validator_tag_missing', { name }) };
    }
  }

  private async validateRemoteExists(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const { name } = validator.params as { name: string };
    const exists = this.engine.remotes.has(name);
    return {
      validator,
      passed: exists,
      message: exists ? t('ui.validator_remote_exists', { name }) : t('ui.validator_remote_missing', { name }),
    };
  }

  private async validateRemoteBranchExists(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const { remote, branch } = validator.params as { remote: string; branch: string };
    try {
      await git.resolveRef({
        fs: this.engine.fs,
        dir: this.engine.dir,
        ref: `refs/remotes/${remote}/${branch}`,
      });
      return { validator, passed: true, message: t('ui.validator_tracking_exists', { remote, branch }) };
    } catch {
      return { validator, passed: false, message: t('ui.validator_tracking_missing', { remote, branch }) };
    }
  }

  private async validatePushedToRemote(
    validator: ValidatorConfig,
  ): Promise<{ validator: ValidatorConfig; passed: boolean; message: string }> {
    const { remote, branch } = validator.params as { remote: string; branch: string };
    const remoteInfo = this.engine.remotes.get(remote);
    if (!remoteInfo) {
      return { validator, passed: false, message: t('ui.validator_remote_missing', { name: remote }) };
    }
    try {
      // Check that the remote repo has the branch
      const remoteBranches = await git.listBranches({ fs: this.engine.fs, dir: remoteInfo.dir });
      if (!remoteBranches.includes(branch)) {
        return { validator, passed: false, message: t('ui.validator_branch_not_pushed', { branch, remote }) };
      }
      // Check that local and remote are in sync
      const localOid = await git.resolveRef({ fs: this.engine.fs, dir: this.engine.dir, ref: branch });
      const remoteOid = await git.resolveRef({ fs: this.engine.fs, dir: remoteInfo.dir, ref: branch });
      if (localOid !== remoteOid) {
        return { validator, passed: false, message: t('ui.validator_branch_out_of_sync', { branch, remote }) };
      }
      return { validator, passed: true, message: t('ui.validator_branch_pushed', { branch, remote }) };
    } catch (err) {
      return { validator, passed: false, message: t('ui.validator_push_check_failed', { error: err instanceof Error ? err.message : String(err) }) };
    }
  }
}
