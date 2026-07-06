// @ts-check

export const SLUG_NOTE =
  'Note: The slug powers all analytics tracking for this instance. Once set, it should not be changed without coordinating with your analytics team - editing it will break historical reporting.';

export const LONG_TITLE = 'a'.repeat(256);
export const LONG_SLUG = 'a'.repeat(51);

export const newInstanceInputs = {
  title: 'title',
  longTitle: LONG_TITLE,
  longSlug: LONG_SLUG,
};

export const updateInstanceInputs = {
  updatedTitle: 'Test this it e test',
  longTitle: LONG_TITLE,
  longSlug: LONG_SLUG,
};

export const defaultThemeColors = {
  primary: '#000000',
  secondary: '#FFFFFF',
};
