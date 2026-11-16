import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { Pill, PillGroup } from '../../components/Pill';
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
  const hour = new Date().getHours();
  const baseGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : '';
  const greeting = firstName ? `${baseGreeting}, ${firstName}` : baseGreeting;
  const open = (route: string, params?: any) => navigation.getParent()?.navigate(route, params);

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
  }: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <Pressable style={s.tool} onPress={onPress}>
      <View style={s.toolIcon}>
        <Icon size={21} color={colors.deepTeal} />
      </View>
      <Text style={s.toolTitle}>{title}</Text>
      <Text style={s.toolSub}>{subtitle}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Image
              source={require('../../../assets/truediet-logo.png')}
              style={s.logo}
              resizeMode="contain"
              accessibilityLabel="True Diet logo"
            />
            <Text style={s.greeting}>{greeting}</Text>
          </View>
          <Pressable style={s.bell} onPress={() => open('Notifications')} accessibilityLabel="Notifications">
            <Bell size={21} color={colors.deepTeal} />
          </Pressable>
        </View>

        {/* Personalized Nutrition Overview & Goal */}
        <View style={s.focus}>
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
            <PillGroup style={{ marginTop: 12 }}>
              {prefs.slice(0, 3).map((p) => (
                <Pill key={p} label={p} tone="teal" />
              ))}
              {allergies.slice(0, 2).map((a) => (
                <Pill key={a} label={`Avoid: ${a}`} tone="orange" />
              ))}
            </PillGroup>
          ) : null}
          <Pressable style={s.inline} onPress={() => open('NutritionProfileSettings')}>
            <Text style={s.inlineText}>Edit goal & preferences</Text>
            <ChevronRight size={17} color={colors.deepTeal} />
          </Pressable>
        </View>

        {/* Daily Summary & Recent Activity */}
        <Header title="Daily Summary" action="Open Track" onPress={() => navigation.navigate('Track')} />
        <View style={s.summaryRow}>
          <Pressable style={s.summaryCard} onPress={() => open('MealLog')}>
            <Text style={s.summaryValue}>{progress?.today.meals ?? recentMeals.length}</Text>
            <Text style={s.summaryLabel}>Meals today</Text>
          </Pressable>
          <Pressable style={s.summaryCard} onPress={() => open('HungerFullness')}>
            <Text style={s.summaryValue}>{progress?.today.checkins ?? 0}</Text>
            <Text style={s.summaryLabel}>Check-ins today</Text>
          </Pressable>
          <Pressable style={s.summaryCard} onPress={() => open('ProgressPatterns')}>
            <Text style={s.summaryValue}>{progress?.week.meals ?? 0}</Text>
            <Text style={s.summaryLabel}>Meals this week</Text>
          </Pressable>
        </View>

        {recentMeals.length > 0 ? (
          <View style={s.recentBox}>
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
          </View>
        ) : null}

        {/* Today's Insight */}
        <Header title="Today's Insight" action="See all" onPress={() => navigation.navigate('Learn')} />
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
        <Header title="Quick Tools & Guidance" action="All tools" onPress={() => navigation.navigate('Tools')} />
        <View style={s.grid}>
          <Tool icon={Mic} title="Voice Food Log" subtitle="Speak your meal" onPress={() => open('VoiceFoodLog')} />
          <Tool icon={Utensils} title="Balanced Meal" subtitle="Build your plate" onPress={() => open('BalancedMeal')} />
          <Tool icon={ScanLine} title="Label Reading" subtitle="Understand labels" onPress={() => open('LabelReading')} />
          <Tool icon={ShieldCheck} title="Health Conditions" subtitle="Condition guidance" onPress={() => open('HealthConditions')} />
          <Tool icon={Activity} title="Hunger Scale" subtitle="Body check-in" onPress={() => open('HungerFullness')} />
          <Tool icon={Brain} title="Myths & Facts" subtitle="Check evidence" onPress={() => open('Myths')} />
          <Tool icon={Heart} title="Resources Hub" subtitle="Plans, lists & guides" onPress={() => open('Resources')} />
          <Tool icon={MessageCircle} title="Ask Dietitian" subtitle="Secure support" onPress={() => open('Dietitian')} />
          <Tool icon={CalendarDays} title="Telehealth" subtitle="Book a visit" onPress={() => open('Telehealth')} />
        </View>

        {/* Recommended Recipes */}
        <Header title="Recommended Recipes" action="Browse all" onPress={() => open('Recipes')} />
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
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.section}>{title}</Text>
      {action && (
        <Pressable onPress={onPress} hitSlop={8}>
          <Text style={s.inlineText}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softBlue, alignItems: 'center' },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 48,
    backgroundColor: colors.background,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 },
  logo: { width: 92, height: 36, marginBottom: 6 },
  greeting: { fontFamily: 'Roboto', fontSize: 25, fontWeight: '700', color: colors.text },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focus: { backgroundColor: colors.softGreen, borderRadius: 22, padding: 20, marginBottom: 22 },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.1, color: colors.green, marginBottom: 6 },
  focusTitle: { fontFamily: 'Roboto', fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 },
  copy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  inline: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  inlineText: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.deepTeal },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    minWidth: 92,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
    alignItems: 'center',
  },
  summaryValue: { fontFamily: 'Roboto', fontSize: 22, fontWeight: '700', color: colors.deepTeal },
  summaryLabel: { fontFamily: 'Roboto', fontSize: 11.5, color: colors.textSecondary, marginTop: 3, textAlign: 'center' },
  recentBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  recentTitle: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.text },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recentText: { flex: 1, fontFamily: 'Roboto', fontSize: 13, color: colors.textSecondary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  section: { fontFamily: 'Roboto', fontSize: 19, fontWeight: '700', color: colors.text },
  insight: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  insightLoading: { alignItems: 'center', justifyContent: 'center', minHeight: 150 },
  articleIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.softGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  insightTitle: { fontFamily: 'Roboto', fontSize: 19, lineHeight: 26, fontWeight: '700', color: colors.text, marginBottom: 8 },
  read: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  meta: { fontFamily: 'Roboto', fontSize: 12, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  tool: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  toolTitle: { fontFamily: 'Roboto', fontSize: 14.5, fontWeight: '700', color: colors.text },
  toolSub: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  recipeList: { gap: 10, marginTop: 4 },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
  },
  recipeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.softGreen, alignItems: 'center', justifyContent: 'center' },
  recipeTitle: { fontFamily: 'Roboto', fontSize: 14.5, fontWeight: '700', color: colors.text },
  recipeMeta: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
