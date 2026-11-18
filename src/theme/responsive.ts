import { useWindowDimensions } from 'react-native';

/**
 * Responsive layout helpers.
 *
 * The app is portrait-locked, but phones range from ~320pt (small Android /
 * iPhone SE) up to ~480pt wide, and tablets/foldables go much wider. Reading
 * the window size at render time (instead of once at module load) keeps the
 * layout correct after rotation, fold/unfold and split-screen changes.
 *
 * All screens should derive horizontal padding, grid item widths and reading
 * column caps from here so spacing is identical across the app.
 */

/** Hard cap for the reading column on tablets and foldables. */
export const CONTENT_MAX_WIDTH_LIMIT = 560;

/** Horizontal padding applied to every full screen. */
export function horizontalPaddingFor(width: number): number {
  if (width < 340) return 14;
  if (width < 360) return 16;
  if (width >= 430) return 24;
  return 20;
}

/** Gap between cards in a responsive grid. */
export function gridGutterFor(width: number): number {
  if (width < 360) return 8;
  if (width >= 430) return 14;
  return 12;
}

export interface LayoutMetrics {
  width: number;
  height: number;
  /** Width of the app's content column (window width, capped). */
  contentWidth: number;
  /** Content column minus horizontal screen padding. */
  innerWidth: number;
  /** True on very narrow devices (<= 340pt). */
  isCompact: boolean;
  /** True on tablets and unfolded foldables. */
  isTablet: boolean;
  horizontalPadding: number;
  gutter: number;
  /** How many columns fit for a given max count and minimum item width. */
  columnsFor: (maxColumns: number, minItemWidth: number) => number;
  /** Exact width for an item in an evenly spaced grid. */
  gridItemWidth: (columns: number) => number;
}

export function useLayoutMetrics(): LayoutMetrics {
  const { width, height } = useWindowDimensions();
  const contentWidth = Math.min(width, CONTENT_MAX_WIDTH_LIMIT);
  const horizontalPadding = horizontalPaddingFor(width);
  const innerWidth = Math.max(0, contentWidth - horizontalPadding * 2);
  const gutter = gridGutterFor(width);

  const columnsFor = (maxColumns: number, minItemWidth: number) => {
    if (minItemWidth <= 0) return maxColumns;
    const fit = Math.floor((innerWidth + gutter) / (minItemWidth + gutter));
    return Math.max(1, Math.min(maxColumns, fit));
  };

  const gridItemWidth = (columns: number) => {
    const count = Math.max(1, columns);
    return Math.max(0, (innerWidth - gutter * (count - 1)) / count);
  };

  return {
    width,
    height,
    contentWidth,
    innerWidth,
    isCompact: width <= 340,
    isTablet: width >= 768,
    horizontalPadding,
    gutter,
    columnsFor,
    gridItemWidth,
  };
}
