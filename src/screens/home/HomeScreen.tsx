import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Activity, Bell, BookOpen, Brain, CalendarDays, ChevronRight, MessageCircle, ScanLine, Utensils } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useOnboarding } from '../../context/OnboardingContext';
import { findArticle } from '../../lib/learnContent';
import { loadProfile } from '../../lib/profile';
import { loadTopics } from '../../lib/contentLibrary';

interface Insight {
  topicTitle: string;
  title: string;
  summary: string;
  readTime: string;
  articleId: string;
}

export default function HomeScreen({ navigation }: any) {
  const { data, updateData } = useOnboarding();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const open = (route: string, params?: any) => navigation.getParent()?.navigate(route, params);

  // The nutrition focus has to come from the saved profile so it is correct
  // on a returning session and on a different device. The onboarding answer
  // is only a local fallback for a signed-out or offline first run.
  const [goal, setGoal] = useState<string>(data.goal || '');
  const [focusLoading, setFocusLoading] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setFocusLoading(true);
    loadProfile()
      .then((res) => {
        if (!active) return;
        const saved = res?.profile?.goal;
        if (saved) {
          setGoal(saved);
          // Keep the local copy in step so the next cold start is instant.
          if (!data.goal) updateData({ goal: saved });
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
    return () => {
      active = false;
    };
  }, []);

  // Today's Insight is served from the database, falling back to the embedded
  // article when the API is unreachable.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const topics = await loadTopics();
        if (!active) return;
        const articles = topics.find((t) => t.title === 'Nutrition Basics')?.articles || [];
        const match =
          articles.find((a) => a.id === 'nb-2') || articles[0];
        if (match) {
          setInsight({
            topicTitle: 'Nutrition Basics',
            title: match.title,
            summary: match.summary,
            readTime: match.readTime,
            articleId: match.id,
          });
          return;
        }
      } catch {
        // fall through to the embedded copy
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
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
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
          <Pressable style={s.inline} onPress={() => open('NutritionProfileSettings')}>
            <Text style={s.inlineText}>View your plan</Text>
            <ChevronRight size={17} color={colors.deepTeal} />
          </Pressable>
        </View>

        <Header title="Today's Insight" action="See all" onPress={() => navigation.navigate('Learn')} />
        {insightLoading && !insight ? (
          <View style={[s.insight, s.insightLoading]}>
            <ActivityIndicator color={colors.deepTeal} />
          </View>
        ) : (
          <Pressable
            style={s.insight}
            onPress={() =>
              open('Article', { articleId: insight?.articleId, title: insight?.title })
            }
          >
            <View style={s.articleIcon}>
              <BookOpen size={22} color={colors.green} />
            </View>
            <Text style={s.eyebrow}>{(insight?.topicTitle || 'Nutrition Basics').toUpperCase()}</Text>
            <Text style={s.insightTitle}>
              {insight?.title || 'Building a balanced plate'}
            </Text>
            <Text style={s.copy}>
              {insight?.summary ||
                'Learn how foods work together to support energy and wellbeing.'}
            </Text>
            <View style={s.read}>
              <Text style={s.meta}>{insight?.readTime || '5 min'} read</Text>
              <Text style={s.inlineText}>Read →</Text>
            </View>
          </Pressable>
        )}

        <Header title="Quick Tools" />
        <View style={s.grid}>
          <Tool icon={Utensils} title="Balanced Meal" subtitle="Build your plate" onPress={() => open('BalancedMeal')} />
          <Tool icon={ScanLine} title="Label Reading" subtitle="Understand labels" onPress={() => open('LabelReading')} />
          <Tool icon={Activity} title="Hunger Scale" subtitle="Check in" onPress={() => open('HungerFullness')} />
          <Tool icon={Brain} title="Myths & Facts" subtitle="Check evidence" onPress={() => open('Myths')} />
          <Tool icon={Utensils} title="Recipes" subtitle="Flexible meal ideas" onPress={() => open('Recipes')} />
          <Tool icon={MessageCircle} title="Ask Dietitian" subtitle="Secure support" onPress={() => open('Dietitian')} />
          <Tool icon={CalendarDays} title="Telehealth" subtitle="Book a visit" onPress={() => open('Telehealth')} />
        </View>
        <Pressable style={s.allTools} onPress={() => open('Tools')}>
          <Text style={s.allToolsText}>Browse all tools</Text>
          <ChevronRight size={17} color={colors.deepTeal} />
        </Pressable>
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

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.softBlue, alignItems: 'center' }, content: { width: '100%', maxWidth: 412, padding: 24, paddingBottom: 36, backgroundColor: colors.background }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, logo: { width: 92, height: 36, marginBottom: 6 }, greeting: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '700', color: colors.text }, bell: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, focus: { backgroundColor: colors.softGreen, borderRadius: 24, padding: 22, marginBottom: 28 }, eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.1, color: colors.green, marginBottom: 8 }, focusTitle: { fontFamily: 'Roboto', fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 8 }, copy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary }, inline: { flexDirection: 'row', alignItems: 'center', marginTop: 16 }, inlineText: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.deepTeal }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 14 }, section: { fontFamily: 'Roboto', fontSize: 20, fontWeight: '700', color: colors.text }, insight: { backgroundColor: colors.surface, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.border }, insightLoading: { alignItems: 'center', justifyContent: 'center', minHeight: 160 }, articleIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.softGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, insightTitle: { fontFamily: 'Roboto', fontSize: 20, lineHeight: 27, fontWeight: '700', color: colors.text, marginBottom: 9 }, read: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }, meta: { fontFamily: 'Roboto', fontSize: 12, color: colors.muted }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, tool: { width: '48%', minHeight: 134, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, marginBottom: 12 }, toolIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, toolTitle: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text }, toolSub: { fontFamily: 'Roboto', fontSize: 11, color: colors.textSecondary, marginTop: 3 }, allTools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 52, marginTop: 4, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, allToolsText: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.deepTeal } });
