import {
  createPrompt,
  isEnterKey,
  makeTheme,
  useEffect,
  useKeypress,
  useState,
} from '@inquirer/core';
import figures from 'figures';

import type { CustomTheme } from '../types.js';
import { lines } from '../utils/lines.js';
import { spaces } from '../utils/spaces.js';

export const input = createPrompt<string, {
  /**
   * Input default value.
   */
  default?: string;
  /**
   * Input-related hint.
   */
  hint?: string;
  /**
   * Message to insert between the prefix and input.
   */
  message?: string;
  required?: boolean;
  theme: CustomTheme;
  /**
   * Validation function.
   * @param value
   */
  validate?: (value: string) => string | undefined | null;
}>(({
  theme,
  default: defaultValue,
  message,
  validate,
  hint,
  required,
}, done) => {
  const { style, prefix } = makeTheme(theme);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  const [completed, setCompleted] = useState(false);

  function confirm(value: string): void {
    setValue(value);
    setError(undefined);
    setCompleted(true);
    done(value);
  }

  useEffect(() => {
    completed && done(value);
  }, [completed, done, value]);

  useKeypress((key, rl) => {
    if (isEnterKey(key)) {
      if (error) {
        return rl.write(value);
      }
      return value
        ? confirm(value)
        : defaultValue
          ? confirm(defaultValue)
          : required
            ? setError('The value must be provided')
            : confirm('');
    }

    if (key.name === 'tab' && !value) {
      // remove tab
      rl.clearLine(0);
      const v = defaultValue || '';
      rl.write(v);
      setValue(v);
      return;
    }

    const input = rl.line;
    setError((input && validate && validate(input)) || undefined);
    setValue(input);
  });

  return [
    spaces(
      prefix[completed ? 'done' : 'idle'],
      message && style.message(message, 'idle'),
      // TODO: We need some specific style for it.
      style.placeholder(completed ? figures.ellipsis : figures.pointerSmall),
      completed
        ? style.answer(value)
        : value || (defaultValue ? style.defaultAnswer(defaultValue) : ''),
    ),
    completed ? undefined : lines(hint && style.help(hint), error && style.error(error)),
  ];
});
