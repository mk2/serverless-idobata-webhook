import * as DateFns from 'date-fns';
import fs from 'fs';
import ip from 'ip';
import git from 'isomorphic-git';
import os from 'os';
import path from 'path';
import pupa from 'pupa';

export async function formatMessage(templateText: string): Promise<string> {
  const hostname = os.hostname();
  const currentTime = DateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const username = os.userInfo().username;
  const ipAddress = ip.address();
  const currentBranch = await git
    .currentBranch({
      fs,
      dir: searchGitDir(process.cwd()),
      fullname: false,
    })
    .catch(() => '[NO CURRENT BRANCH]');

  return pupa(templateText, {
    hostname,
    currentTime,
    username,
    ipAddress,
    currentBranch,
  });
}

function searchGitDir(gitDir: string, maxSearch: number = 0): string {
  if (maxSearch > 2) {
    return '[NO CURRENT BRANCH]';
  }

  try {
    fs.accessSync(path.resolve(gitDir, '.git'), fs.constants.R_OK);
    return gitDir;
  } catch (e) {
    return searchGitDir(path.resolve(gitDir, '..'), ++maxSearch);
  }
}
