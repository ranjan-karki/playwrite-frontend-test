export const CREDENTIALS = {
  valid: {
    username: process.env.TEST_USERNAME ?? '',
    password: process.env.TEST_PASSWORD ?? '',
  },
  wrongPassword: {
    username: process.env.TEST_USERNAME ?? '',
    password: process.env.TEST_WRONG_PASSWORD ?? 'wrong-password',
  },
  wrongUsername: {
    username: process.env.TEST_WRONG_USERNAME ?? 'nobody@example.com',
    password: process.env.TEST_PASSWORD ?? '',
  },
};

export const SITE_NAMES = {
  main:      process.env.TEST_SITE_NAME_MAIN      ?? '',
  secondary: process.env.TEST_SITE_NAME_SECONDARY ?? '',
  deleted:   process.env.TEST_SITE_NAME_DELETED   ?? '',
};

export const LIMITS = {
  title: { min: 1, max: 255 },
  slug:  { min: 1, max: 50  },
} as const;

export const LAYOUTS = {
  tile:     'tile',
  tilePlus: 'tile-plus',
} as const;

export type LayoutKey = keyof typeof LAYOUTS;
export type LayoutValue = typeof LAYOUTS[LayoutKey];

export const INVALID_SLUGS = {
  leadingHyphen:       '-invalid',
  trailingHyphen:      'invalid-',
  consecutiveHyphens:  'bad--slug',
  uppercase:           'UPPERCASE',
  withSpaces:          'has space',
  onlyDigits:          '12345',
  singleHyphen:        '-',
} as const;
