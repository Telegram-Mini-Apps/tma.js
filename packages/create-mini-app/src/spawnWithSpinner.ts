import chalk from 'chalk';
import { spawn } from 'node:child_process';
import ora from 'ora';

import { CustomTheme } from './types.js';

interface SharedOptions {
  message: string;
  messageSuccess?: string;
  messageFail?: string | ((error: string) => string);
  theme: CustomTheme;
}

interface TerminalOptions extends SharedOptions {
  /**
   * Shell command to run.
   */
  command: string;
}

interface OperationOptions extends SharedOptions {
  /**
   * Action to execute.
   */
  command: () => Promise<any>;
}

function formatError(e: unknown): string {
  return e instanceof Error
    ? e.message
    : typeof e === 'string'
      ? e
      : JSON.stringify(e);
}

/**
 * Spawns new process with spinner.
 * @param options - function options.
 */
export function spawnWithSpinner({
  command,
  message,
  messageFail,
  messageSuccess,
  theme: {
    style,
    spinner: themeSpinner,
  },
}: TerminalOptions | OperationOptions): Promise<void> {
  const spinner = ora({
    text: style.message(message, 'loading'),
    hideCursor: false,
    spinner: themeSpinner,
  }).start();

  const success = messageSuccess && style.message(messageSuccess, 'done');

  if (typeof command === 'function') {
    return command()
      .then(() => {
        spinner.succeed(success);
      })
      .catch(e => {
        const errString = formatError(e);
        spinner.fail(
          style.error(
            messageFail
              ? typeof messageFail === 'string'
                ? messageFail
                : messageFail(errString)
              : errString,
          ),
        );

        throw e;
      });
  }

  return new Promise((res, rej) => {
    const proc = spawn(command, { shell: true });

    // Buffer which contains error data.
    let errBuf = Buffer.from([]);

    // When something was received from the error channel, we append it to the final buffer.
    proc.stderr.on('data', (buf: Buffer) => {
      errBuf = Buffer.concat([errBuf, buf]);

      // Update the spinner text to let user know, process is working.
      spinner.suffixText = chalk.bgGray.italic(buf.toString());
    });

    proc.on('exit', code => {
      // Drop process outputs.
      spinner.suffixText = '';

      // If error code was not returned. It means, process completed successfully.
      if (!code) {
        spinner.succeed(success);
        res();
        return;
      }

      const errString = errBuf.length ? errBuf.toString() : `Error code: ${code}`;
      const errorMessage = style.error(
        messageFail
          ? typeof messageFail === 'string'
            ? messageFail
            : messageFail(errString)
          : errString,
      );

      spinner.fail(errorMessage);
      rej(new Error(errorMessage));
    });
  });
}
