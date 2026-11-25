import { CONTENT_MAX_WIDTH_LIMIT } from './responsive';

/**
 * Reading-column caps.
 *
 * These are upper bounds, not fixed widths. Screens combine them with
 * `width: '100%'` so phones always fill the viewport while tablets and
 * unfolded foldables stay at a readable maximum. Unlike the old module-load
 * `Dimensions.get()` values, these constants remain correct after rotation,
 * split-screen and fold/unfold changes.
 */
export const CONTENT_MAX_WIDTH = CONTENT_MAX_WIDTH_LIMIT;

/** Bottom tab bar follows the same column so it lines up with the content. */
export const TAB_BAR_MAX_WIDTH = CONTENT_MAX_WIDTH_LIMIT;
