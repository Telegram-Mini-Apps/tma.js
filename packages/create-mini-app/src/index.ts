#!/usr/bin/env node
import chalk from 'chalk';
import { program } from 'commander';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

import { cloneTemplate } from './cloneTemplate.js';
import { createCustomTheme } from './createCustomTheme.js';
import { isGitInstalled } from './isGitInstalled.js';
import { input } from './prompts/input.js';
import { spawnWithSpinner } from './spawnWithSpinner.js';
import packageJson from '../package.json' with { type: 'json' };
import { promptTemplate } from './templates/promptTemplate/promptTemplate.js';
import type { TemplateRepository } from './templates/types.js';
import { lines } from './utils/lines.js';

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version)
  .action(async () => {
    const theme = createCustomTheme();

    // Check if git is installed.
    if (!await isGitInstalled()) {
      console.log(
        theme.style.error(
          'To run this CLI tool, you must have git installed. Installation guide: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git',
        ),
      );
      process.exit(1);
    }

    // Step 1: Prompt the project root directory.
    let rootDir: string | null = null;
    try {
      rootDir = await input({
        message: 'Directory name:',
        required: true,
        default: 'mini-app',
        hint: 'This directory will be used as a root directory for the project. It is allowed to use alphanumeric latin letters, dashes and dots.',
        theme,
        validate(value) {
          if (['.', '..'].includes(value)) {
            return 'Value is not a valid directory name';
          }

          if (!value.match(/^[a-zA-Z0-9\-.]+$/)) {
            return 'Value contains invalid symbols';
          }

          if (existsSync(resolve(value))) {
            return `Directory "${value}" already exists`;
          }
        },
      });
    } catch {
      process.exit(0);
    }

    // Step 2: Prompt the target template.
    let repository: TemplateRepository;
    try {
      const { repository: promptRepo } = await promptTemplate({ theme });
      repository = promptRepo;
    } catch {
      process.exit(0);
    }

    // Step 3: Prompt future Git repository information.
    let gitRepo: string | undefined;
    try {
      gitRepo = await input({
        message: 'Git remote repository URL:',
        validate(value) {
          // Check if it is SSH connection string.
          if (value.match(/\w+@[\w\-.]+:[\w-]+\/[\w./]+/)) {
            return;
          }

          // Check if the specified value is URL.
          try {
            new URL(value);
            return '';
          } catch {
            return 'Value is not considered as URL link or SSH connection string.';
          }
        },
        theme,
        hint: lines(
          'This value will be used to connect created project with your remote Git repository. It should either be an HTTPS link or SSH connection string.',
          `Leave value empty and press ${theme.style.key('enter')} to skip this step.`,
          chalk.bold('Examples'),
          'SSH: git@github.com:user/repo.git',
          'URL: https://github.com/user/repo.git',
        ),
      });
    } catch {
      process.exit(0);
    }

    // Step 4: Clone the template.
    try {
      await cloneTemplate(rootDir, repository, theme);
    } catch {
      process.exit(1);
    }

    // Step 5: Remove the .git folder.
    try {
      await spawnWithSpinner({
        message: 'Removing the .git directory.',
        command: () => rm(resolve(rootDir, '.git'), { recursive: true }),
        messageFail: (err: string) => `Failed to remove the .git directory. Error: ${err}`,
        messageSuccess: '.git directory removed.',
        theme,
      });
    } catch {
      process.exit(1);
    }

    // Step 6: Initialize a new .git folder and configure remote.
    if (gitRepo) {
      try {
        await spawnWithSpinner({
          message: `Initializing Git repository: ${gitRepo}`,
          command: [
            `cd "${rootDir}"`,
            'git init',
            `git remote add origin "${gitRepo}"`,
          ].join(' && '),
          messageFail: error => `Failed to initialize Git repository. ${error}`,
          messageSuccess: `Git repository initialized. Remote "origin" was set to "${gitRepo}"`,
          theme,
        });
      } catch {
        // We are not doing anything as long as this step is not really that important.
        // Nevertheless, a developer will be notified about something went wrong.
      }
    }

    console.log(
      lines(
        chalk.green.bold('Your project has been successfully initialized!'),
        `Now, open the "${chalk.bold(rootDir)}" directory and follow the instructions presented in the ${chalk.bold(
          'README.md',
        )} file. ${chalk.bold('Happy coding! 🚀')}`,
      ),
    );
  });

program.parse();
