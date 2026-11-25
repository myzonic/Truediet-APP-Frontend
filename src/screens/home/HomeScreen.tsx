import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import {
  Activity,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronRight,
  Heart,
  MessageCircle,
  Mic,
  ScanLine,
  ShieldCheck,
  Utensils,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/tokens';
import { useLayoutMetrics } from '../../theme/responsive';
import { Pill, PillGroup } from '../../components/Pill';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { BaseCard } from '../../components/BaseCard';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { findArticle } from '../../lib/learnContent';
import { loadProfile } from '../../lib/profile';
import { loadTopics, loadRecipes } from '../../lib/contentLibrary';
import { loadMeals, loadProgress, MealLog, Progress } from '../../lib/track';
import { recipes as defaultRecipes, Recipe } from '../../lib/recipeContent';

interface Insight {
  topicTitle: string;
  title: string;
  summary: string;
  readTime: string;
  articleId: string;
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { data, updateData } = useOnboarding();
  const { innerWidth, columnsFor, gridItemWidth, gutter } = useLayoutMetrics();
  const summaryCols = columnsFor(3, 96);
  const summaryWidth = gridItemWidth(summaryCols);
  const hour = new Date().getHours();
  const baseGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : '';
  const greeting = firstName ? `${baseGreeting}, ${firstName}` : baseGreeting;
  const open = (route: string, params?: any) => navigation.navigate(route, params);

  const [goal, setGoal] = useState<string>(data.goal || '');
  const [prefs, setPrefs] = useState<string[]>(data.dietaryPreferences || []);
  const [allergies, setAllergies] = useState<string[]>(data.allergies || []);
  const [focusLoading, setFocusLoading] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [recentMeals, setRecentMeals] = useState<MealLog[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>(defaultRecipes.slice(0, 3));

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setFocusLoading(true);
      loadProfile()
        .then((res) => {
          if (!active) return;
          const p = res?.profile;
          if (p) {
            if (p.goal) {
              setGoal(p.goal);
              if (!data.goal) updateData({ goal: p.goal });
            }
            if (Array.isArray(p.dietaryPreferences)) setPrefs(p.dietaryPreferences);
            if (Array.isArray(p.allergies)) setAllergies(p.allergies);
          } else if (!data.goal) {
            setGoal('Understand nutrition better');
          }
        })
        .catch(() => {
          if (active && !data.goal) setGoal('Understand nutrition better');
        })
        .finally(() => {
          if (active) setFocusLoading(false);
        });

      Promise.all([loadProgress().catch(() => null), loadMeals().catch(() => [])]).then(([p, m]) => {
        if (!active) return;
        setProgress(p);
        setRecentMeals(m.slice(0, 3));
      });

      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [topics, loadedRecipes] = await Promise.all([
          loadTopics(),
          loadRecipes().catch(() => defaultRecipes),
        ]);
        if (!active) return;
        if (loadedRecipes?.length) setRecommendedRecipes(loadedRecipes.slice(0, 3));
        const articles = topics.find((t) => t.title === 'Nutrition Basics')?.articles || [];
        const match = articles.find((a) => a.id === 'nb-2') || articles[0];
        if (match) {
          setInsight({
            topicTitle: 'Nutrition Basics',
            title: match.title,
            summary: match.summary,
            readTime: match.readTime,
            articleId: match.id,
          });
          setInsightLoading(false);
          return;
        }
      } catch {
        // fall through to embedded copy
      }
      if (!active) return;
      const featured = findArticle('nb-2') || findArticle('nb-1');
      if (featured) {
        setInsight({
          topicTitle: featured.topic.title,
          title: featured.article.title,
          summary: featured.article.summary,
          readTime: featured.article.readTime,
          articleId: featured.article.id,
        });
      }
      setInsightLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const Tool = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    width,
  }: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
    width: number;
  }) => (
    <Pressable style={[s.tool, { width }]} onPress={onPress}>
      <View style={s.toolIcon}>
        <Icon size={21} color={colors.deepTeal} />
      </View>
      <Text style={s.toolTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={s.toolSub} numberOfLines={2}>
        {subtitle}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScreenContainer keyboardShouldPersistTaps="handled">
        <ScreenHeader
          eyebrow="TRUE DIET"
          title={greeting}
          subtitle="Your personalized nutrition hub."
        />

        {/* Personalized Nutrition Overview & Goal */}
        <BaseCard variant="green" style={s.focusCard}>
          <Text style={s.eyebrow}>YOUR NUTRITION FOCUS</Text>
          {focusLoading && !goal ? (
            <ActivityIndicator color={colors.deepTeal} style={{ marginTop: 6 }} />
          ) : (
            <Text style={s.focusTitle}>{goal || 'Understand nutrition better'}</Text>
          )}
          <Text style={s.copy}>
            Your recommendations are personalized around the goals and preferences you selected.
          </Text>
          {(prefs.length > 0 || allergies.length > 0) ? (
            <PillGroup style={{ marginTop: spacing.md }}>
              {prefs.slice(0, 3).map((p) => (
                <Pill key={p} label={p} tone="teal" />
              ))}
              {allergies.slice(0, 2).map((a) => (
                <Pill key={a} label={`Avoid: ${a}`} tone="orange" />
              ))}
            </PillGroup>
          ) : null}
          <Pressable
            onPress={() => open('NutritionProfileSettings')}
            style={s.inlineLink}
            accessibilityRole="button"
          >
            <Text style={s.inlineText}>Edit goal &amp; preferences</Text>
            <ChevronRight size={17} color={colors.deepTeal} />
          </Pressable>
        </BaseCard>

        {/* Daily Summary & Recent Activity */}
        <ScreenHeader
          size="section"
          title="Daily Summary"
          actionText="Open Track"
          onAction={() => navigation.navigate('Track')}
        />
        <View style={[s.summaryRow, { flexWrap: 'wrap', gap: gutter }]}>
          <Pressable style={[s.summaryCard,{ width: summaryWidth, flex: 0, flexBasis: 'auto', flexGrow: 0 }]} onPress={() => open('MealLog')}>
            <Text style={s.summaryValue}>{progress?.today.meals ?? recentMeals.length}</Text>
            <Text style={s.summaryLabel}>Meals today</Text>
          </Pressable>
          <Pressable style={[s.summaryCard,{ width: summaryWidth, flex: 0, flexBasis: 'auto', flexGrow: 0 }]} onPress={() => open('HungerFullness')}>
            <Text style={s.summaryValue}>{progress?.today.checkins ?? 0}</Text>
            <Text style={s.summaryLabel}>Check-ins today</Text>
          </Pressable>
          <Pressable style={[s.summaryCard,{ width: summaryCols === 2 ? innerWidth : summaryWidth, flex: 0, flexBasis: 'auto', flexGrow: 0 }]} onPress={() => open('ProgressPatterns')}>
            <Text style={s.summaryValue}>{progress?.week.meals ?? 0}</Text>
            <Text style={s.summaryLabel}>Meals this week</Text>
          </Pressable>
        </View>

        {recentMeals.length > 0 ? (
          <BaseCard style={s.recentCard}>
            <Text style={s.recentTitle}>Today’s Recent Activity</Text>
            {recentMeals.map((m) => (
              <View key={m.id} style={s.recentItem}>
                <Utensils size={15} color={colors.green} />
                <Text style={s.recentText} numberOfLines={1}>
                  <Text style={{ fontWeight: '700', textTransform: 'capitalize' }}>{m.mealType}: </Text>
                  {m.description}
                </Text>
              </View>
            ))}
          </BaseCard>
        ) : null}

        {/* Today's Insight */}
        <ScreenHeader
          size="section"
          title="Today's Insight"
          actionText="See all"
          onAction={() => navigation.navigate('Learn')}
        />
        {insightLoading && !insight ? (
          <View style={[s.insight, s.insightLoading]}>
            <ActivityIndicator color={colors.deepTeal} />
          </View>
        ) : (
          <Pressable
            style={s.insight}
            onPress={() => open('Article', { articleId: insight?.articleId, title: insight?.title })}
          >
            <View style={s.articleIcon}>
              <BookOpen size={22} color={colors.green} />
            </View>
            <Text style={s.eyebrow}>{(insight?.topicTitle || 'Nutrition Basics').toUpperCase()}</Text>
            <Text style={s.insightTitle}>{insight?.title || 'Building a balanced plate'}</Text>
            <Text style={s.copy}>
              {insight?.summary || 'Learn how foods work together to support energy and wellbeing.'}
            </Text>
            <View style={s.read}>
              <Text style={s.meta}>{insight?.readTime || '5 min'} read</Text>
              <Text style={s.inlineText}>Read →</Text>
            </View>
          </Pressable>
        )}

        {/* Quick Tools & Personalized Actions */}
        <ScreenHeader
          size="section"
          title="Quick Tools & Guidance"
          actionText="All tools"
          onAction={() => navigation.navigate('Tools')}
        />
        <View style={[s.grid, { gap: gutter }]}>
          <Tool width={gridItemWidth(2)} icon={Mic} title="Voice Food Log" subtitle="Speak your meal" onPress={() => open('VoiceFoodLog')} />
          <Tool width={gridItemWidth(2)} icon={Utensils} title="Balanced Meal" subtitle="Build your plate" onPress={() => open('BalancedMeal')} />
          <Tool width={gridItemWidth(2)} icon={ScanLine} title="Label Reading" subtitle="Understand labels" onPress={() => open('LabelReading')} />
          <Tool width={gridItemWidth(2)} icon={ShieldCheck} title="Health Conditions" subtitle="Condition guidance" onPress={() => open('HealthConditions')} />
          <Tool width={gridItemWidth(2)} icon={Activity} title="Hunger Scale" subtitle="Body check-in" onPress={() => open('HungerFullness')} />
          <Tool width={gridItemWidth(2)} icon={Brain} title="Myths & Facts" subtitle="Check evidence" onPress={() => open('Myths')} />
          <Tool width={gridItemWidth(2)} icon={Heart} title="Resources Hub" subtitle="Plans, lists & guides" onPress={() => open('Resources')} />
          <Tool width={gridItemWidth(2)} icon={MessageCircle} title="Ask Dietitian" subtitle="Secure support" onPress={() => open('Dietitian')} />
          <Tool width={gridItemWidth(2)} icon={CalendarDays} title="Telehealth" subtitle="Book a visit" onPress={() => open('Telehealth')} />
        </View>

        {/* Recommended Recipes */}
        <ScreenHeader
          size="section"
          title="Recommended Recipes"
          actionText="Browse all"
          onAction={() => open('Recipes')}
        />
        <View style={s.recipeList}>
          {recommendedRecipes.map((r) => (
            <Pressable
              key={r.id}
              style={s.recipeRow}
              onPress={() => open('RecipeDetail', { recipeId: r.id, title: r.title })}
            >
              <View style={s.recipeIcon}>
                <Utensils size={18} color={colors.green} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.recipeTitle}>{r.title}</Text>
                <Text style={s.recipeMeta}>{r.time} · {r.category}</Text>
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  focusCard: {
    backgroundColor: colors.softGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.softGreen,
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
  },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.1, color: colors.green, marginBottom: 6 },
  focusTitle: { fontFamily: 'Roboto', fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 },
  copy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  inlineLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.md, alignSelf: 'flex-start', paddingVertical: 4 },
  inlineText: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.deepTeal },
  summaryRow: { flexDirection: 'row', marginBottom: spacing.lg },
  summaryCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.cardPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: { fontFamily: 'Roboto', fontSize: 22, fontWeight: '700', color: colors.deepTeal },
  summaryLabel: { fontFamily: 'Roboto', fontSize: 11.5, color: colors.textSecondary, marginTop: 3, textAlign: 'center' },
  recentCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.cardPadding,
    marginBottom: spacing.xl,
    gap: 8,
  },
  recentTitle: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.text },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recentText: { flex: 1, fontFamily: 'Roboto', fontSize: 13, color: colors.textSecondary },
  section: { fontFamily: 'Roboto', fontSize: 19, fontWeight: '700', color: colors.text },
  insight: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.cardPadding, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl },
  insightLoading: { alignItems: 'center', justifyContent: 'center', minHeight: 150 },
  articleIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.softGreen, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  insightTitle: { fontFamily: 'Roboto', fontSize: 19, lineHeight: 26, fontWeight: '700', color: colors.text, marginBottom: 8 },
  read: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  meta: { fontFamily: 'Roboto', fontSize: 12, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xl },
  tool: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolIcon: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  toolTitle: { fontFamily: 'Roboto', fontSize: 14.5, fontWeight: '700', color: colors.text },
  toolSub: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  recipeList: { gap: 10, marginTop: 4 },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.cardPadding,
  },
  recipeIcon: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.softGreen, alignItems: 'center', justifyContent: 'center' },
  recipeTitle: { fontFamily: 'Roboto', fontSize: 14.5, fontWeight: '700', color: colors.text },
  recipeMeta: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
