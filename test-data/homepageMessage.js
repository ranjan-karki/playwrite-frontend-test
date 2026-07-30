// @ts-check

import { randomAlphaNumeric, getRandomSubstring } from '../utils/basicUtils.js';

// The message field is a Froala rich-text (contenteditable) box, not a bounded
// input, so these sizes probe how much text it actually accepts rather than
// hitting a documented character limit.
export const LARGE_MESSAGE_LENGTH = 5000;
export const EXTREME_MESSAGE_LENGTH = 20000;

export const homepageMessageInputs = {
  standard: `Homepage message ${randomAlphaNumeric(8)}`,
  updated: `Updated homepage message ${randomAlphaNumeric(8)}`,
  // Realistic prose, sliced from a shared long paragraph so it reads like genuine content.
  large: getRandomSubstring(LARGE_MESSAGE_LENGTH),
  // Random characters are fine here - this is a raw volume/stress case, not a readability one.
  extreme: randomAlphaNumeric(EXTREME_MESSAGE_LENGTH),
};
