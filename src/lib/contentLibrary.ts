import { loadContent, ContentSummary } from './content';
import { learnTopics, LearnArticle, LearnTopic } from './learnContent';
import { myths, Myth } from './mythContent';
import { recipes, Recipe } from './recipeContent';

export type { LearnArticle, LearnTopic, Myth, Recipe };

/**
 * The content library is served by the backend so the database is the source
 * of truth. The embedded copy is kept as an offline fallback so the app still
 * works without a connection - it is never presented as live data.
 */

export interface ContentDetail extends ContentSummary {
  body?: string;
  mediaUrl?: string;
  listenUrl?: string;
  episodeNumber?: number;
  startsAt?: string;
}

let cached: { items: ContentDetail[]; fetchedAt: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

async function fetchAll(): Promise<ContentDetail[]> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return cached.items;
  }
  const items = await loadContent(undefined, undefined);
  const detailed = await Promise.all(
    items.map(async (item) => {
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:3000'}/api/content/${encodeURIComponent(item.slug)}`
        );
        if (!res.ok) return item as ContentDetail;
        const data = await res.json();
        return { ...item, ...(data?.item || {}) } as ContentDetail;
      } catch {
        return item as ContentDetail;
      }
    })
  );
  cached = { items: detailed, fetchedAt: Date.now() };
  return detailed;
}

export function clearContentCache(): void {
  cached = null;
}

// ---------------------------------------------------------------- markdown
function stripTitle(body: string): { title: string; rest: string } {
  const lines = body.split('\n');
  const title = (lines[0] ?? '').replace(/^#\s*/, '').trim();
  return { title, rest: lines.slice(1).join('\n').trim() };
}

function parseSections(body: string): { heading: string; body: string }[] {
  const sections: { heading: string; body: string }[] = [];
  const pattern = /^##\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  const marks: { heading: string; index: number; end: number }[] = [];

  while ((match = pattern.exec(body)) !== null) {
    marks.push({ heading: match[1].trim(), index: match.index, end: match.index + match[0].length });
  }

  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].end;
    const end = i + 1 < marks.length ? marks[i + 1].index : body.length;
    sections.push({ heading: marks[i].heading, body: body.slice(start, end).trim() });
  }
  return sections;
}

function paragraphs(text: string): string[] {
  return text
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);
}

function minutesFrom(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const found = text.match(/(\d+)\s*min/i);
  return found ? Number(found[1]) : undefined;
}

// ---------------------------------------------------------------- topics
export async function loadTopics(): Promise<LearnTopic[]> {
  try {
    const items = await fetchAll();
    const topics = items.filter((item) => item.type === 'topic');
    if (!topics.length) return learnTopics;

    const articles = items.filter((item) => item.type === 'article');
    return topics.map((topic) => {
      const topicBody = topic.body || '';
      const intro = paragraphs(topicBody).filter((p) => !p.startsWith('>'))[0] || '';
      const own = articles.filter((article) => article.category === topic.title);
      return {
        slug: topic.slug.replace(/^topic-/, ''),
        title: topic.title,
        subtitle: topic.subtitle,
        intro,
        articles: own.map(toArticle),
      };
    });
  } catch {
    return learnTopics;
  }
}

function toArticle(item: ContentDetail): LearnArticle {
  const body = item.body || '';
  const { rest } = stripTitle(body);
  const parts = paragraphs(rest);
  const summary = parts.find((p) => !p.startsWith('>') && !p.startsWith('##')) || '';
  const sections = parseSections(rest).map((s) => ({ heading: s.heading, body: s.body }));
  const id = item.slug.replace(/^article-/, '');
  return {
    id,
    title: item.title,
    readTime: `${minutesFrom(item.subtitle) ?? minutesFrom(item.durationMinutes?.toString()) ?? 5} min`,
    summary,
    sections,
  };
}

export async function loadArticle(slugOrId: string): Promise<LearnArticle | null> {
  try {
    const items = await fetchAll();
    const match = items.find(
      (item) =>
        item.type === 'article' &&
        (item.slug === `article-${slugOrId}` || item.slug === slugOrId || item.id === slugOrId)
    );
    if (match) return toArticle(match);
  } catch {
    // fall through to the embedded copy
  }
  return null;
}

// ---------------------------------------------------------------- myths
export async function loadMyths(): Promise<Myth[]> {
  try {
    const items = await fetchAll();
    const dbMyths = items.filter((item) => item.type === 'myth');
    if (!dbMyths.length) return myths;

    return dbMyths.map((item) => {
      const body = item.body || '';
      const { rest } = stripTitle(body);
      const parts = paragraphs(rest);
      const label = item.subtitle || '';
      const short = parts.find((p) => !p.startsWith('>') && !p.startsWith('##') && !p.startsWith('**')) || '';
      const section = (heading: string) =>
        parseSections(rest).find((s) => s.heading.toLowerCase() === heading)?.body || '';
      return {
        id: item.slug.replace(/^myth-/, ''),
        claim: item.title,
        label,
        short,
        whatIsTrue: section('What is true'),
        whyItSpreads: section('Why it spreads'),
        evidence: section('The evidence'),
        takeaway: section('Takeaway'),
      };
    });
  } catch {
    return myths;
  }
}

// ---------------------------------------------------------------- recipes
export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const items = await fetchAll();
    const dbRecipes = items.filter((item) => item.type === 'recipe');
    if (!dbRecipes.length) return recipes;

    return dbRecipes.map((item) => {
      const body = item.body || '';
      const { rest } = stripTitle(body);
      const sections = parseSections(rest);
      const whyItWorks = sections.find((s) => s.heading.toLowerCase() === 'why it works')?.body || '';
      const ingredients = (sections.find((s) => s.heading.toLowerCase() === 'ingredients')?.body || '')
        .split('\n')
        .map((line) => line.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
      const steps = (sections.find((s) => s.heading.toLowerCase() === 'method')?.body || '')
        .split('\n')
        .map((line) => line.replace(/^\d+[.)]\s*/, '').trim())
        .filter(Boolean);
      const tip = sections.find((s) => s.heading.toLowerCase() === 'tip')?.body || '';
      const [time, category] = item.subtitle.split('·').map((part) => part.trim());
      return {
        id: item.slug.replace(/^recipe-/, ''),
        title: item.title,
        time: time || `${minutesFrom(item.subtitle) ?? 20} min`,
        category: category || item.category || 'Recipe',
        whyItWorks,
        ingredients,
        steps,
        tip,
      };
    });
  } catch {
    return recipes;
  }
}

// ---------------------------------------------------------------- library lists
export interface LibraryItem {
  id: string;
  title: string;
  subtitle: string;
  category?: string;
  slug: string;
  durationMinutes?: number;
  isPremium: boolean;
}

export async function loadLibrary(type: string): Promise<LibraryItem[]> {
  try {
    const items = await loadContent(type, undefined);
    if (!items.length) return [];
    return items.map((item) => ({
      id: item.slug,
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      category: item.category,
      durationMinutes: item.durationMinutes,
      isPremium: item.isPremium,
    }));
  } catch {
    return [];
  }
}
