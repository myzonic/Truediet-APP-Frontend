import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { allArticles, findArticle, findArticleByTitle, LearnArticle } from '../../lib/learnContent';
import { loadArticle } from '../../lib/contentLibrary';
import { saveContent } from '../../lib/content';

const Section = ({ heading, body }: { heading: string; body: string }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{heading}</Text>
    <Text style={s.sectionBody}>{body}</Text>
  </View>
);

export default function ArticleScreen({ navigation, route }: any) {
  const params = route.params || {};
  const [article, setArticle] = useState<LearnArticle | null>(null);
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const fromDb = await loadArticle(params.articleId || params.title || '');
        if (!active) return;
        if (fromDb) {
          setArticle(fromDb);
          setTopicTitle(params.category || 'Nutrition Basics');
          setLoading(false);
          return;
        }
        // Fall back to the embedded copy when the database is unreachable.
        const match =
          findArticle(params.articleId) || findArticleByTitle(params.title) || allArticles()[0];
        if (!active) return;
        setArticle(match.article);
        setTopicTitle(match.topic.title);
      } catch {
        const match = findArticleByTitle(params.title) || allArticles()[0];
        if (!active) return;
        setArticle(match.article);
        setTopicTitle(match.topic.title);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [params.articleId, params.title]);

  const onSave = async () => {
    if (saving || !article) return;
    setSaving(true);
    try {
      await saveContent(`article-${article.id}`, {
        title: article.title,
        subtitle: `${topicTitle} · ${article.readTime} read`,
        route: 'Article',
        type: 'article',
      });
      Alert.alert('Saved', 'This article was added to your saved content.');
    } catch (e: any) {
      Alert.alert('Could not save', e?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !article) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loading}>
          <ActivityIndicator color={colors.deepTeal} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <Pressable style={s.back} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={s.eyebrow}>{topicTitle.toUpperCase()}</Text>
        <Text style={s.title}>{article.title}</Text>
        <Text style={s.meta}>{article.readTime} read</Text>
        <View style={s.summary}>
          <Text style={s.summaryLabel}>IN SHORT</Text>
          <Text style={s.summaryText}>{article.summary}</Text>
        </View>
        {article.sections.map((sec) => (
          <Section key={sec.heading} heading={sec.heading} body={sec.body} />
        ))}
        <Pressable style={s.save} onPress={onSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Bookmark size={18} color="#fff" />
              <Text style={s.saveText}>Save Article</Text>
            </>
          )}
        </Pressable>
        <Text style={s.disclaimer}>
          True Diet content is general nutrition education and is not medical advice. Discuss individual
          needs with a qualified professional.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.softBlue, alignItems: 'center' }, content: { width: '100%', maxWidth:CONTENT_MAX_WIDTH, padding: 24, paddingBottom: 50, backgroundColor: colors.background }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 27 }, eyebrow: { fontFamily: 'Roboto', color: colors.green, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 }, title: { fontFamily: 'Roboto', fontSize: 30, lineHeight: 40, fontWeight: '700', color: colors.text, marginTop: 9 }, meta: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 10 }, summary: { backgroundColor: colors.softGreen, borderRadius: 20, padding: 20, marginTop: 25 }, summaryLabel: { fontFamily: 'Roboto', fontSize: 10, letterSpacing: 1.2, fontWeight: '700', color: colors.green }, summaryText: { fontFamily: 'Roboto', fontSize: 15, lineHeight: 23, color: colors.text, marginTop: 8 }, section: { marginTop: 30 }, sectionTitle: { fontFamily: 'Roboto', fontSize: 21, fontWeight: '700', color: colors.text, marginBottom: 9 }, sectionBody: { fontFamily: 'Roboto', fontSize: 15, lineHeight: 25, color: colors.textSecondary }, save: { height: 56, borderRadius: 17, backgroundColor: colors.deepTeal, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 34 }, saveText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff', marginLeft: 8 }, disclaimer: { fontFamily: 'Roboto', fontSize: 10, lineHeight: 16, color: colors.muted, marginTop: 18 } });
