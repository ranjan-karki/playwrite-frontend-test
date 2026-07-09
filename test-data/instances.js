// @ts-check

export const SLUG_NOTE =
  'Note: The slug powers all analytics tracking for this instance. Once set, it should not be changed without coordinating with your analytics team - editing it will break historical reporting.';

export const LONG_TITLE = 'a'.repeat(256);
export const LONG_SLUG = 'a'.repeat(61);
export const MIN_TITLE = 'a';
export const MAX_TITLE = 'a'.repeat(255);
export const MIN_SLUG = 'a';
export const MAX_SLUG = 'a'.repeat(60);

export const newInstanceInputs = {
  title: 'title',
  longTitle: LONG_TITLE,
  longSlug: LONG_SLUG,
  minTitle: MIN_TITLE,
  maxTitle: MAX_TITLE,
  minSlug: MIN_SLUG,
  maxSlug: MAX_SLUG,
};

export const updateInstanceInputs = {
  updatedTitle: 'Test this it e test',
  longTitle: LONG_TITLE,
  longSlug: LONG_SLUG,
  minTitle: MIN_TITLE,
  maxTitle: MAX_TITLE,
  minSlug: MIN_SLUG,
  maxSlug: MAX_SLUG,
};

export const defaultThemeColors = {
  primary: '#000000',
  secondary: '#FFFFFF',
};
