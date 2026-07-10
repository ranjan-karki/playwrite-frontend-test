// @ts-check

export const SLUG_NOTE =
  'Note: The slug powers all analytics tracking for this instance. Once set, it should not be changed without coordinating with your analytics team - editing it will break historical reporting.';

import { randomAlphaNumeric, randomLowerAlpha, randomNumber, randomHexColor } from '../utils/basicUtils.js';
import { securityPayloads } from './securityPayloads.js';

// The slug field truncates typed input at 60 characters, but the implemented
// validation limit is 50 — values of 51-60 characters pass the input but fail on submit.
export const SLUG_INPUT_TRUNCATE_LENGTH = 60;
export const SLUG_MAX_LENGTH = 50;
export const TITLE_MAX_LENGTH = 255;

// Randomized per run so repeated runs don't collide on unique fields like the slug.
export const LONG_TITLE = randomAlphaNumeric(TITLE_MAX_LENGTH + 1);
export const LONG_SLUG = randomLowerAlpha(SLUG_INPUT_TRUNCATE_LENGTH + 1);
export const OVER_LIMIT_SLUG = randomLowerAlpha(SLUG_MAX_LENGTH + 1);
export const MIN_TITLE = randomAlphaNumeric(1);
export const MAX_TITLE = randomAlphaNumeric(TITLE_MAX_LENGTH);
export const MIN_SLUG = randomLowerAlpha(1);
export const MAX_SLUG = randomLowerAlpha(SLUG_MAX_LENGTH);

// The slug field only accepts letters: integers and special characters are rejected
// on input, so only the letter portion of this value should survive.
export const SLUG_VALID_PART = randomLowerAlpha(8);
export const INVALID_CHARS_SLUG = `1${SLUG_VALID_PART.slice(0, 4)}2!@#$%^&*()${SLUG_VALID_PART.slice(4)}3.`;

export const EXTREME_TITLE_LENGTH = 10000;

export const newInstanceInputs = {
  title: `title ${randomAlphaNumeric(8)}`,
  emptyCheckSlug: randomLowerAlpha(8),
  minSlugTitle: `Min slug instance ${randomAlphaNumeric(8)}`,
  maxSlugTitle: `Max slug instance ${randomAlphaNumeric(8)}`,
  invalidCharsSlug: INVALID_CHARS_SLUG,
  slugValidPart: SLUG_VALID_PART,
  longTitle: LONG_TITLE,
  longSlug: LONG_SLUG,
  overLimitSlug: OVER_LIMIT_SLUG,
  minTitle: MIN_TITLE,
  maxTitle: MAX_TITLE,
  minSlug: MIN_SLUG,
  maxSlug: MAX_SLUG,
};

export const updateInstanceInputs = {
  updatedTitle: `Updated instance ${randomAlphaNumeric(8)}`,
  minSlugHolderTitle: `Min slug holder ${randomAlphaNumeric(8)}`,
  maxSlugHolderTitle: `Max slug holder ${randomAlphaNumeric(8)}`,
  longTitle: LONG_TITLE,
  longSlug: LONG_SLUG,
  overLimitSlug: OVER_LIMIT_SLUG,
  minTitle: MIN_TITLE,
  maxTitle: MAX_TITLE,
  minSlug: MIN_SLUG,
  maxSlug: MAX_SLUG,
};

// The color picker may normalize hex casing, so value assertions should compare
// case-insensitively against these.
export const colorInputs = {
  primaryHex: randomHexColor(),
  secondaryHex: randomHexColor(),
};

// The color inputs themselves are readonly — values only get in through the picker
// popover, so these cover what the picker's own hex field accepts or normalizes.
const THREE_CHAR_HEX = randomHexColor(3);
export const pickerColorInputs = {
  threeCharHex: THREE_CHAR_HEX,
  // #abc is equivalent to #aabbcc — the picker may store either form.
  threeCharHexExpanded: `#${[...THREE_CHAR_HEX.slice(1)].map((c) => c + c).join('')}`,
  noPrefixHex: randomHexColor().slice(1),
  // 'z' prefix guarantees the string can never be valid hex, whatever follows.
  invalidColor: `z${randomLowerAlpha(5)}`,
};

const slugPart = () => randomLowerAlpha(4);

// Slug formats the input accepts but the server must reject on submit.
// Unicode/encoded/HTML fragments are fixed by nature; the letter parts are random.
export const invalidSlugCases = Object.entries({
  'containing uppercase letters': `${slugPart().toUpperCase()}${slugPart()}`,
  'containing spaces': `${slugPart()} ${slugPart()}`,
  'starting with a hyphen': `-${slugPart()}`,
  'ending with a hyphen': `${slugPart()}-`,
  'containing consecutive hyphens': `${slugPart()}--${slugPart()}`,
  'containing an underscore': `${slugPart()}_${slugPart()}`,
  'containing a period': `${slugPart()}.${slugPart()}`,
  'containing only numbers': `${randomNumber(5)}`,
  'that is a single hyphen': '-',
  'containing unicode characters': `${slugPart()}é漢`,
  'containing URL-encoded characters': `${slugPart()}%20${slugPart()}`,
  'containing HTML tags': `<b>${slugPart()}</b>`,
}).map(([description, slug]) => ({
  description,
  slug,
  title: `Invalid slug ${description} ${randomAlphaNumeric(6)}`,
}));

export const validSlugCases = [
  { description: 'containing hyphens', slug: `${slugPart()}-${slugPart()}`, title: `Hyphen slug instance ${randomAlphaNumeric(6)}` },
  { description: 'containing numbers and letters', slug: `${slugPart()}${randomNumber(3)}`, title: `Alnum slug instance ${randomAlphaNumeric(6)}` },
];

// Security payloads typed into the title should be stored and rendered as literal
// text (sanitized); typed into the slug they are invalid formats and must be rejected.
export const titleSecurityCases = Object.entries(securityPayloads).map(([key, payload]) => ({
  key,
  title: `${payload} ${randomAlphaNumeric(6)}`,
  slug: randomLowerAlpha(10),
}));

export const slugSecurityCases = Object.entries(securityPayloads).map(([key, payload]) => ({
  key,
  slug: payload,
  title: `Slug security ${key} ${randomAlphaNumeric(6)}`,
}));

export const duplicateSlugInputs = {
  slug: randomLowerAlpha(10),
  holderTitle: `Dup slug holder ${randomAlphaNumeric(6)}`,
  secondTitle: `Dup slug second ${randomAlphaNumeric(6)}`,
};

export const reusedSlugInputs = {
  slug: randomLowerAlpha(10),
  firstTitle: `Reuse slug first ${randomAlphaNumeric(6)}`,
  secondTitle: `Reuse slug second ${randomAlphaNumeric(6)}`,
};

export const extremeInputs = {
  title: randomAlphaNumeric(EXTREME_TITLE_LENGTH),
  slug: randomLowerAlpha(10),
};

export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const defaultThemeColors = {
  primary: '#000000',
  secondary: '#FFFFFF',
};
