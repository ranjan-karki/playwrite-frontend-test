// @ts-check
import { expect } from '@playwright/test';
import { messages } from '../test-data/message.js';

export class HomepageMessagePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.navLink = page.getByRole('link', { name: 'Homepage messages' });
    this.heading = page.getByRole('heading', { name: 'Homepage messages' });
    this.formCard = page.locator('.col-md-7 > .card');

    // Info tooltip - a single icon toggles it open and closed (unlike the Settings
    // page, which uses a separate close icon).
    this.infoIcon = page.locator('.fas.fa-info-circle');
    this.tooltip = page.locator('.page-tooltip');
    this.tooltipBody = page.locator('#tooltip-with-id');

    // The Froala rich-text library always renders its editable region with the
    // `fr-element fr-view` classes, so this locator holds even though the library
    // also stamps a random id (e.g. #froala-editor-8736) on the outer wrapper.
    this.messageEditor = page.locator('.fr-element.fr-view[contenteditable="true"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    // Cancel only renders once the message has an unsaved change - it isn't present
    // on a pristine load.
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.requiredError = page.getByText(messages.messageRequired);
  }

  async open() {
    await this.navLink.click();
    await this.messageEditor.waitFor({ state: 'visible' });
  }

  async toggleInfoTooltip() {
    await this.infoIcon.click();
  }

  /**
   * Clicking back into the editor before filling mirrors the recorded flow and
   * ensures Froala has focus before the value is replaced. `fill()` sets the value
   * fast but only dispatches a synthetic input event, which Froala/Angular's
   * dirty-tracking doesn't pick up (Save stays disabled) - a trailing real keystroke
   * (typed then immediately deleted) nudges it into noticing the change without
   * paying the cost of typing very large values character by character.
   *
   * Filling right after a save is inherently racy: a successful save remounts the
   * editor (fresh `#froala-editor-<n>`), and if that remount is still in flight when
   * this runs, the typed change can be silently dropped and Save never re-enables.
   * That race only has room to lose under a full suite run's extra load, which is why
   * it wasn't visible testing this file alone. Rather than guess at a fixed delay,
   * retry the whole sequence until Save is actually confirmed enabled.
   * @param {string} text
   */
  async fillMessage(text) {
    await expect(async () => {
      await this.messageEditor.click();
      // Clearing via real keyboard events first, rather than letting fill() replace
      // existing content in one shot, keeps the whole interaction keyboard-driven -
      // more likely to line up with what Froala/Angular's dirty-tracking expects,
      // especially right after a save when the editor may have just remounted.
      await this.messageEditor.press('ControlOrMeta+A');
      await this.messageEditor.press('Backspace');
      await this.messageEditor.fill(text);
      await this.messageEditor.press('End');
      // A quick tap-and-release can be too fast for Froala/Angular's dirty-check to
      // register before the key is released - holding it briefly (keydown, pause,
      // keyup) via the delay option gives it time to actually notice the keystroke.
      await this.messageEditor.press(' ', { delay: 150 });
      await this.messageEditor.press('Backspace');
      await expect(this.saveButton).toBeEnabled({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });
  }

  async clearMessage() {
    await this.fillMessage('');
  }

  async getMessageText() {
    return (await this.messageEditor.innerText()).trim();
  }

  /**
   * On success, saving re-renders the editor (remounted under a fresh random
   * `#froala-editor-<n>` id), so filling again immediately after can land on a node
   * mid-replacement and silently fail to register as a change. `waitForLoadState('networkidle')`
   * looked like the generic fix but is flaky under a full suite run (background
   * network chatter from other tests/pages keeps it from ever settling), so instead
   * race the two concrete outcomes an app user would actually see: Cancel hides on a
   * successful save (remount complete), or the required-field error appears on a
   * rejected one (no remount, nothing to wait for).
   *
   * Cancel hiding doesn't guarantee the remount itself has finished though - under a
   * full suite run's extra load that gap can widen enough for a following fillMessage
   * to land mid-replacement anyway. On the success path, also wait for messageEditor
   * (which locates by class, not the instance-specific id) to confirm the new editor
   * is actually attached before returning.
   */
  async save() {
    await this.saveButton.click();
    await Promise.race([
      this.cancelButton.waitFor({ state: 'hidden' }),
      this.requiredError.waitFor({ state: 'visible' }),
    ]);

    if (!(await this.requiredError.isVisible())) {
      await this.messageEditor.waitFor({ state: 'visible' });
    }
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
