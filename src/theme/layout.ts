import { Dimensions } from 'react-native';

/**
 * Content width for the app's reading column.
 *
 * Phones render full width; tablets and unfolded/foldable devices cap the
 * column so lines of text stay readable instead of stretching across the
 * screen. The app is portrait-locked, so reading the size once at module load
 * is sufficient.
 */
const { width } = Dimensions.get('window');

export const CONTENT_MAX_WIDTH = Math.min(560, width);

/** Bottom tab bar follows the same column so it lines up with the content. */
export const TAB_BAR_MAX_WIDTH = Math.min(560, width);
