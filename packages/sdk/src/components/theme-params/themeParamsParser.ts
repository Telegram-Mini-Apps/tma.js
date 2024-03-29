import { keyToLocal } from './keys.js';
import type { ThemeParamsParsed } from './types.js';
import type { ValueParserGenerator } from '../../parsing/createValueParserGenerator.js';
import {
  createValueParserGenerator,
} from '../../parsing/createValueParserGenerator.js';
import { rgb } from '../../parsing/parsers/rgb.js';
import { toRecord } from '../../parsing/toRecord.js';

// eslint-disable-next-line max-len
export const themeParamsParser: ValueParserGenerator<ThemeParamsParsed> = createValueParserGenerator(
  (value) => {
    const rgbOptional = rgb().optional();

    return Object
      .entries(toRecord(value))
      .reduce<ThemeParamsParsed>((acc, [k, v]) => {
        acc[keyToLocal(k)] = rgbOptional.parse(v);
        return acc;
      }, {});
  },
  'ThemeParams',
);
