/**
 * The library sections that are not articles, myths or recipes: the resource
 * hub, webinars and recorded classes, and podcast episodes.
 *
 * They live here (rather than in a screen) so the database seed and the app
 * always show the same items. `server/scripts/generate-content-seed.ts`
 * reads this module to build the `content` rows.
 */

export interface HubItem {
  title: string;
  subtitle: string;
  route: string;
  icon: 'book' | 'heart' | 'shield' | 'calendar' | 'headphones';
}

export const hubItems: HubItem[] = [
  { title: 'Label Reading Framework', subtitle: 'A calm, step-by-step guide', route: 'ResourceDetail', icon: 'book' },
  { title: 'Mindful Eating Guide', subtitle: 'Notice hunger, fullness, and satisfaction', route: 'ResourceDetail', icon: 'heart' },
  { title: '7-Day Anti-Inflammatory Reset', subtitle: 'Educational, flexible foundations', route: 'ResourceDetail', icon: 'shield' },
  { title: 'Blog & Articles', subtitle: 'Current evidence-based education', route: 'Blog', icon: 'book' },
  { title: 'Webinars & Classes', subtitle: 'Live and recorded lessons', route: 'Webinars', icon: 'calendar' },
  { title: 'True Diet Podcast', subtitle: 'Nutrition conversations with context', route: 'Podcast', icon: 'headphones' },
];

export interface WebinarSession {
  title: string;
  meta: string;
  live: boolean;
  detail: string;
}

export const webinarSessions: WebinarSession[] = [
  { title: 'Nutrition Labels Without Fear', meta: 'Live · Thursday · 6:00 PM', live: true, detail: '60 min · Live class' },
  { title: 'Building Balanced Meals', meta: 'Recorded · Watch anytime', live: false, detail: '42 min · Recorded class' },
  { title: 'Nutrition Myths: How to Think Clearly', meta: 'Recorded · Watch anytime', live: false, detail: '35 min · Recorded class' },
];

export interface PodcastEpisode {
  title: string;
  meta: string;
  id: string;
}

export const podcastEpisodes: PodcastEpisode[] = [
  { title: 'Episode 12: Why nutrition trends feel convincing', meta: '28 min · Nutrition Truth', id: 'ep-12' },
  { title: 'Episode 11: Finding a flexible meal rhythm', meta: '31 min · Practical nutrition', id: 'ep-11' },
  { title: 'Episode 10: Protein, plainly', meta: '24 min · Evidence-based', id: 'ep-10' },
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
