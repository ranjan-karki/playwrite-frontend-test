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

// The slug field accepts letters, numbers, and dashes; special characters are kept
// on input but validation flags them once the field loses focus.
const SLUG_LETTER_PART = randomLowerAlpha(8);
export const INVALID_CHARS_SLUG = `${SLUG_LETTER_PART.slice(0, 4)}!@#$%^&*()${SLUG_LETTER_PART.slice(4)}`;

export const EXTREME_TITLE_LENGTH = 10000;

export const newInstanceInputs = {
  title: `title ${randomAlphaNumeric(8)}`,
  emptyCheckSlug: randomLowerAlpha(10),
  minSlugTitle: `Min slug instance ${randomAlphaNumeric(8)}`,
  maxSlugTitle: `Max slug instance ${randomAlphaNumeric(8)}`,
  invalidCharsSlug: INVALID_CHARS_SLUG,
  longTitle: LONG_TITLE,
  longSlug: LONG_SLUG,
  overLimitSlug: OVER_LIMIT_SLUG,
  minTitle: MIN_TITLE,
  maxTitle: MAX_TITLE,
  minSlug: MIN_SLUG,
  maxSlug: MAX_SLUG,
};

// Specs that edit an existing instance create their own target row with these
// titles instead of relying on an environment-specific instance name.
export const targetInstanceTitles = {
  update: `Update target ${randomAlphaNumeric(6)}`,
  rowActions: `Row actions target ${randomAlphaNumeric(6)}`,
  homepageMessage: `Homepage message target ${randomAlphaNumeric(6)}`,
  homepageVideos: `Homepage videos target ${randomAlphaNumeric(6)}`,
  homepageResources: `Homepage resources target ${randomAlphaNumeric(6)}`,
};

// Filler slugs for tests whose assertions aren't about the slug itself — each
// creation flow gets its own value so rows never collide on the unique slug field.
export const fillerSlugs = {
  enableCheck: randomLowerAlpha(10),
  themeFlow: randomLowerAlpha(10),
  longTitle: randomLowerAlpha(10),
  minTitle: randomLowerAlpha(10),
  maxTitle: randomLowerAlpha(10),
  deletable: randomLowerAlpha(10),
  updateTarget: randomLowerAlpha(10),
  rowActionsTarget: randomLowerAlpha(10),
  homepageMessageTarget: randomLowerAlpha(10),
  homepageVideosTarget: randomLowerAlpha(10),
  homepageResourcesTarget: randomLowerAlpha(10),
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

/**
 * @param {string} description
 * @param {string} slug
 */
const invalidSlugCase = (description, slug) => ({
  slug,
  title: `Invalid slug ${description} ${randomAlphaNumeric(6)}`,
});

// Slug formats the input accepts but Create must reject: the availability check
// only confirms the slug isn't already taken — the format itself is validated
// only once the Create button is clicked. Unicode/encoded/HTML fragments are
// fixed by nature; the letter parts are random.
export const invalidSlugs = {
  uppercase: invalidSlugCase('containing uppercase letters', `${slugPart().toUpperCase()}${slugPart()}`),
  spaces: invalidSlugCase('containing spaces', `${slugPart()} ${slugPart()}`),
  leadingHyphen: invalidSlugCase('starting with a hyphen', `-${slugPart()}`),
  trailingHyphen: invalidSlugCase('ending with a hyphen', `${slugPart()}-`),
  consecutiveHyphens: invalidSlugCase('containing consecutive hyphens', `${slugPart()}--${slugPart()}`),
  underscore: invalidSlugCase('containing an underscore', `${slugPart()}_${slugPart()}`),
  period: invalidSlugCase('containing a period', `${slugPart()}.${slugPart()}`),
  onlyNumbers: invalidSlugCase('containing only numbers', `${randomNumber(5)}`),
  singleHyphen: invalidSlugCase('that is a single hyphen', '-'),
  unicode: invalidSlugCase('containing unicode characters', `${slugPart()}é漢`),
  urlEncoded: invalidSlugCase('containing URL-encoded characters', `${slugPart()}%20${slugPart()}`),
  htmlTags: invalidSlugCase('containing HTML tags', `<b>${slugPart()}</b>`),
};

export const validSlugs = {
  hyphens: { slug: `${slugPart()}-${slugPart()}`, title: `Hyphen slug instance ${randomAlphaNumeric(6)}` },
  alphanumeric: { slug: `${slugPart()}${randomNumber(3)}`, title: `Alnum slug instance ${randomAlphaNumeric(6)}` },
};

/** @param {keyof typeof securityPayloads} key */
const titleSecurityCase = (key) => ({
  title: `${securityPayloads[key]} ${randomAlphaNumeric(6)}`,
  slug: randomLowerAlpha(10),
});

/** @param {keyof typeof securityPayloads} key */
const slugSecurityCase = (key) => ({
  slug: securityPayloads[key],
  title: `Slug security ${key} ${randomAlphaNumeric(6)}`,
});

// Security payloads typed into the title should be stored and rendered as literal
// text (sanitized); typed into the slug they are invalid formats and must be rejected.
export const titleSecurity = {
  xss: titleSecurityCase('xss'),
  htmlInjection: titleSecurityCase('htmlInjection'),
  sqlInjection: titleSecurityCase('sqlInjection'),
  specialCharString: titleSecurityCase('specialCharString'),
  pathTraversal: titleSecurityCase('pathTraversal'),
};

export const slugSecurity = {
  xss: slugSecurityCase('xss'),
  htmlInjection: slugSecurityCase('htmlInjection'),
  sqlInjection: slugSecurityCase('sqlInjection'),
  specialCharString: slugSecurityCase('specialCharString'),
  pathTraversal: slugSecurityCase('pathTraversal'),
};

/** @param {keyof typeof securityPayloads} key */
const updateTitleSecurityCase = (key) => `${securityPayloads[key]} ${randomAlphaNumeric(6)}`;

// Titles used when editing an existing instance; suffixed separately from the
// add-instance payload titles so the two suites never collide on a row name.
export const updateTitleSecurity = {
  xss: updateTitleSecurityCase('xss'),
  htmlInjection: updateTitleSecurityCase('htmlInjection'),
  sqlInjection: updateTitleSecurityCase('sqlInjection'),
  specialCharString: updateTitleSecurityCase('specialCharString'),
  pathTraversal: updateTitleSecurityCase('pathTraversal'),
};

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
