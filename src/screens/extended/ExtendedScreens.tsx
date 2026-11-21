import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronRight, CircleHelp, CreditCard, FileText, Heart, LockKeyhole, MessageSquare, Search, Settings, ShieldCheck, UserRound } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { GoogleIcon } from '../../components/GoogleIcon';
import { loadContent, loadSavedContent } from '../../lib/content';
import { loadThreads, loadThread, sendMessage } from '../../lib/messages';
import { signIn, signUp, signInWithGoogle, requestPasswordReset } from '../../lib/auth-service';
import { friendlyAuthError } from '../../lib/auth-errors';
import { useAuth } from '../../context/AuthContext';

type Item = { id?: string; title: string; subtitle: string; route?: string; icon?: any };
const contentRoutes: Record<string, string> = {
  Blog: 'article',
  Resources: 'resource',
  Webinars: 'webinar',
  RecordedClasses: 'class',
  Podcast: 'podcast',
};
type Definition = {
  eyebrow: string;
  title: string;
  copy: string;
  items?: Item[];
  cta?: string;
  icon?: any;
};
const screens: Record<string, Definition> = {
  MaureenProfile: {
    eyebrow: 'YOUR DIETITIAN',
    title: 'Meet Maureen.',
    copy: 'A Registered Dietitian with more than 23 years of experience helping people understand nutrition without fear, confusion, or unnecessary restriction.',
    items: [
      { title: 'Credentials & expertise', subtitle: 'Registered Dietitian · Medical Nutrition Therapy' },
      { title: 'My philosophy', subtitle: 'Real Nutrition. Real Science. Real Results.' },
    ],
  },
  Resources: {
    eyebrow: 'RESOURCES',
    title: 'Practical guidance to return to.',
    copy: 'Evidence-based guides, tools, and learning resources for everyday nutrition decisions.',
    items: [
      { title: 'Label Reading Framework', subtitle: 'A calm, step-by-step guide', route: 'ResourceDetail' },
      { title: 'Mindful Eating Guide', subtitle: 'Notice hunger, fullness, and satisfaction', route: 'ResourceDetail' },
      { title: '7-Day Anti-Inflammatory Reset', subtitle: 'Educational, flexible foundations', route: 'ResourceDetail' },
      { title: 'Blog & Articles', subtitle: 'Current evidence-based education', route: 'Blog' },
      { title: 'Webinars & Classes', subtitle: 'Live and recorded lessons', route: 'Webinars' },
      { title: 'True Diet Podcast', subtitle: 'Nutrition conversations with context', route: 'Podcast' },
    ],
  },
  ResourceDetail: {
    eyebrow: 'RESOURCE',
    title: 'A practical nutrition guide.',
    copy: 'Use this evidence-based resource at your own pace. It is designed to help you build understanding, not follow rigid food rules.',
    cta: 'Save Resource',
  },
  Blog: {
    eyebrow: 'BLOG & ARTICLES',
    title: 'Current nutrition, clearly explained.',
    copy: 'Research context, practical education, and thoughtful answers to nutrition questions.',
    items: [
      { title: 'What “healthy” eating actually means', subtitle: 'Evidence-based article · 6 min', route: 'Article' },
      { title: 'How to evaluate a nutrition claim', subtitle: 'Nutrition Truth · 5 min', route: 'Myths' },
      { title: 'Protein: context over hype', subtitle: 'Evidence-based article · 7 min', route: 'Article' },
    ],
  },
  Webinars: {
    eyebrow: 'WEBINARS & CLASSES',
    title: 'Learn with Maureen.',
    copy: 'Join a live class or choose a recorded lesson when it fits your schedule.',
    items: [
      { title: 'Live: Nutrition Labels Without Fear', subtitle: 'Thursday · 6:00 PM', route: 'WebinarDetail' },
      { title: 'Recorded: Building Balanced Meals', subtitle: 'Watch anytime', route: 'RecordedClasses' },
    ],
  },
  WebinarDetail: {
    eyebrow: 'LIVE WEBINAR',
    title: 'Nutrition Labels Without Fear.',
    copy: 'A practical class on reading nutrition labels with context. Includes time for educational questions.',
    cta: 'Register for Webinar',
  },
  RecordedClasses: {
    eyebrow: 'RECORDED CLASSES',
    title: 'Keep learning on your time.',
    copy: 'Replay practical, evidence-based lessons whenever you need them.',
    items: [
      { title: 'Building Balanced Meals', subtitle: '42 min · Recorded class', route: 'WebinarDetail' },
      { title: 'Nutrition Myths: How to Think Clearly', subtitle: '35 min · Recorded class', route: 'WebinarDetail' },
    ],
  },
  Podcast: {
    eyebrow: 'TRUE DIET PODCAST',
    title: 'Nutrition conversations with context.',
    copy: 'Listen to practical, science-informed conversations about food and wellbeing.',
    items: [
      { title: 'Episode 12: Why nutrition trends feel convincing', subtitle: '28 min · Nutrition Truth', route: 'PodcastDetail' },
      { title: 'Episode 11: Finding a flexible meal rhythm', subtitle: '31 min · Practical nutrition', route: 'PodcastDetail' },
    ],
  },
  PodcastDetail: {
    eyebrow: 'PODCAST EPISODE',
    title: 'A calmer way to think about food.',
    copy: 'Episode notes, useful takeaways, related resources, and a link to listen on your preferred podcast platform.',
    cta: 'Open Listen Link',
  },
  Packages: {
    eyebrow: 'SERVICES',
    title: 'Support that meets you where you are.',
    copy: 'Explore nutrition education, one-to-one support, and flexible ways to work with Maureen.',
    items: [
      { title: 'Nutrition Foundations', subtitle: 'Education package', route: 'PackageDetail' },
      { title: 'One-to-One Nutrition Support', subtitle: 'Personalized RD guidance', route: 'PackageDetail' },
      { title: 'True Diet Premium', subtitle: 'Expanded learning and tools', route: 'FreePremium' },
    ],
  },
  PackageDetail: {
    eyebrow: 'SERVICE DETAIL',
    title: 'Nutrition support with context.',
    copy: 'Learn what is included, who this service is for, and how to take the next step.',
    cta: 'View Booking Options',
  },
  FreePremium: {
    eyebrow: 'MEMBERSHIP',
    title: 'Choose your level of support.',
    copy: 'Start with trusted education for free, then upgrade when you want expanded tools and experiences.',
    items: [
      { title: 'Free', subtitle: 'Learning hub, selected resources, basic tracking' },
      { title: 'Premium', subtitle: 'Expanded content, classes, saved libraries, and more' },
    ],
    cta: 'Explore Membership',
  },
  SavedContent: {
    eyebrow: 'SAVED CONTENT',
    title: 'Your library.',
    copy: 'Keep recipes, articles, resources, classes, and episodes you want to revisit.',
    items: [{ title: 'No saved content yet', subtitle: 'Tap the save action on any article, recipe, or resource.' }],
  },
  Notifications: {
    eyebrow: 'NOTIFICATIONS',
    title: 'Stay in the loop.',
    copy: 'Messages, appointments, webinar reminders, and new educational content will appear here.',
    items: [{ title: 'No new notifications', subtitle: 'You are all caught up.' }],
  },
  Profile: {
    eyebrow: 'PROFILE',
    title: 'Your True Diet account.',
    copy: 'Manage your account, personalized nutrition information, saved content, and app preferences.',
    items: [
      { title: 'Nutrition Profile', subtitle: 'Goals, preferences, and allergy considerations', route: 'NutritionProfileSettings' },
      { title: 'Saved Content', subtitle: 'Your saved education and tools', route: 'SavedContent' },
      { title: 'Settings', subtitle: 'Notifications, accessibility, and account', route: 'Settings' },
      { title: 'Privacy & Data Controls', subtitle: 'Consent and personal data options', route: 'Privacy' },
      { title: 'Meet Maureen', subtitle: 'Credentials, expertise, and philosophy', route: 'MaureenProfile' },
      { title: 'Packages & Services', subtitle: 'Explore memberships and nutrition support', route: 'Packages' },
      { title: 'Membership', subtitle: 'Manage your plan, access, and renewals', route: 'Subscription' },
    ],
  },
  NutritionProfileSettings: {
    eyebrow: 'NUTRITION PROFILE',
    title: 'Personalization you control.',
    copy: 'Update goals, dietary preferences, and allergy or intolerance considerations when your needs change.',
    cta: 'Edit Personalization',
  },
  Settings: {
    eyebrow: 'SETTINGS',
    title: 'Make True Diet work for you.',
    copy: 'Manage notification preferences, accessibility options, and account settings.',
    items: [
      { title: 'Notification preferences', subtitle: 'Choose what you want to hear about', route: 'Notifications' },
      { title: 'Help & Support', subtitle: 'Contact True Diet', route: 'Support' },
      { title: 'Legal', subtitle: 'Terms, Privacy Policy, and Disclaimers', route: 'Legal' },
    ],
  },
  Privacy: {
    eyebrow: 'PRIVACY & DATA',
    title: 'Your data, your control.',
    copy: 'Review consent choices, export your data, and manage account deletion.',
    items: [
      { title: 'Export my data', subtitle: 'Download a copy of your account data' },
      { title: 'Delete my account', subtitle: 'Permanently remove your account and its data' },
    ],
  },
  SearchScreen: {
    eyebrow: 'SEARCH',
    title: 'Find what you need.',
    copy: 'Search articles, recipes, resources, classes, and podcast episodes.',
  },
  Support: {
    eyebrow: 'HELP & SUPPORT',
    title: 'How can we help?',
    copy: 'Find answers or contact the True Diet team for account and app support.',
    items: [
      { title: 'Frequently asked questions', subtitle: 'Account, content, membership, and app support' },
      { title: 'Contact True Diet', subtitle: 'Send a non-clinical support request' },
    ],
  },
  Subscription: {
    eyebrow: 'MEMBERSHIP',
    title: 'Manage your membership.',
    copy: 'View your current access, renewal information, and available upgrade options.',
    cta: 'Manage Subscription',
  },
  Checkout: {
    eyebrow: 'CHECKOUT',
    title: 'Complete your membership.',
    copy: 'Payment is handled by our secure checkout provider. True Diet never stores your card details.',
    cta: 'Continue to Secure Checkout',
  },
  AppointmentDetail: {
    eyebrow: 'APPOINTMENT',
    title: 'Your nutrition visit.',
    copy: 'Review your appointment time, visit type, status, and joining details.',
    cta: 'View Telehealth Details',
  },
  MessageDetail: {
    eyebrow: 'SECURE MESSAGE',
    title: 'Conversation with your Dietitian.',
    copy: 'Read and reply to secure messages from your dietitian.',
  },
  WebinarConfirmation: {
    eyebrow: 'REGISTRATION CONFIRMED',
    title: 'You’re registered.',
    copy: 'Your registration is saved to your account. You can review it in Webinars.',
    cta: 'View Webinar Details',
  },
  Legal: {
    eyebrow: 'LEGAL',
    title: 'Terms, privacy, and disclaimers.',
    copy: 'Read True Diet’s Terms of Use, Privacy Policy, educational disclaimer, and data-processing information.',
    items: [
      { title: 'Terms of Use', subtitle: 'Your use of True Diet' },
      { title: 'Privacy Policy', subtitle: 'How information is handled' },
      { title: 'Educational Disclaimer', subtitle: 'True Diet does not replace medical care' },
    ],
  },
};
const authNames = new Set(['Login', 'CreateAccount', 'ForgotPassword', 'ResetConfirmation']);

function AuthScreen({
  navigation,
  name,
  route,
}: {
  navigation: any;
  name: string;
  route?: any;
}) {
  const { refetchSession } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const config: any = {
    Login: ['WELCOME BACK', 'Log in to True Diet.'],
    CreateAccount: ['CREATE ACCOUNT', 'Start saving your personalized experience.'],
    ForgotPassword: ['RESET PASSWORD', 'Enter your email and we will send reset instructions.'],
    ResetConfirmation: ['CHECK YOUR EMAIL', 'Your reset or verification confirmation will arrive shortly.'],
  }[name];
  const resetEmail = ((route && route.params && route.params.email) || '').trim();
  const ready =
    name === 'ResetConfirmation' ||
    (email.includes('@') &&
      (name === 'ForgotPassword' || password.length >= 8) &&
      (name !== 'CreateAccount' || (displayName.trim().length > 1 && password === confirmPassword)));
  const submit = async () => {
    if (loading || !ready) return;
    setError('');
    setLoading(true);
    try {
      if (name === 'Login') {
        const r = await signIn(email.trim().toLowerCase(), password);
        if (!r.user) {
          setError('Invalid email or password.');
          return;
        }
        await refetchSession();
        const root = navigation.getParent('Root');
        root ? root.replace('Main') : navigation.goBack();
      } else if (name === 'CreateAccount') {
        const r = await signUp(displayName.trim() || email.split('@')[0], email.trim().toLowerCase(), password);
        if (!r.user) {
          setError('Could not create your account.');
          return;
        }
        await refetchSession();
        const root = navigation.getParent('Root');
        root ? root.replace('Main') : navigation.goBack();
      } else if (name === 'ForgotPassword') {
        await requestPasswordReset(email.trim().toLowerCase());
        navigation.navigate('ResetConfirmation', { email: email.trim().toLowerCase() });
      } else {
        navigation.navigate('Login');
      }
    } catch (e: any) {
      setError(friendlyAuthError(e?.message));
    } finally {
      setLoading(false);
    }
  };
  const onGoogle = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.cancelled) return;
      if (res.user) {
        await refetchSession();
        const root = navigation.getParent('Root');
        root ? root.replace('Main') : navigation.goBack();
      } else {
        setError('Google sign-in did not complete — please try again.');
      }
    } catch (e: any) {
      setError(friendlyAuthError(e?.message));
    } finally {
      setLoading(false);
    }
  };
  const showPassword = name === 'Login' || name === 'CreateAccount';
  const ctaLabel = {
    Login: 'Continue',
    CreateAccount: 'Create Account',
    ForgotPassword: 'Send Reset Link',
    ResetConfirmation: 'Return to Login',
  }[name];
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%', alignItems: 'center' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.scroll} contentContainerStyle={s.auth} keyboardShouldPersistTaps="handled">
          <Pressable style={s.authBack} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Welcome')} hitSlop={6} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          <Text style={s.eyebrow}>{config[0]}</Text>
          <Text style={s.title}>{config[1]}</Text>
          {name === 'ResetConfirmation' ? (
            <View style={s.confirm}>
              <CheckCircle2 size={30} color={colors.green} />
              <Text style={s.copy}>{resetEmail ? `We sent a reset link to ${resetEmail}. Open it in your browser to set a new password.` : 'We sent a reset link. Open it in your browser to set a new password.'}</Text>
              <Text style={[s.copy, { marginTop: 10 }]}>The link is valid for one hour and works once. After that your new password is active on every device, and the old one stops working.</Text>
            </View>
          ) : (
            <>
              {name === 'CreateAccount' && <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Full name" placeholderTextColor={colors.muted} style={s.authInput} />}
              <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="email-address" style={s.authInput} />
              {showPassword && (
                <TextInput value={password} onChangeText={setPassword} placeholder="Password (minimum 8 characters)" placeholderTextColor={colors.muted} secureTextEntry autoCapitalize="none" style={s.authInput} />
              )}
              {name === 'CreateAccount' && (
                <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" placeholderTextColor={colors.muted} secureTextEntry autoCapitalize="none" style={s.authInput} />
              )}
            </>
          )}
          {error ? <View style={s.authErrorBox}><Text style={s.authErrorText}>{error}</Text></View> : null}
          <Pressable style={[s.cta, (loading || !ready) && { opacity: 0.6 }]} disabled={loading || !ready} onPress={submit}>
            <Text style={s.ctaText}>{loading ? 'Please wait...' : ctaLabel}</Text>
          </Pressable>
          {showPassword && (
            <Pressable style={[s.cta, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginTop: 12 }]} disabled={loading} onPress={onGoogle}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <GoogleIcon size={18} />
                <Text style={[s.ctaText, { color: colors.text }]}>{name === 'CreateAccount' ? 'Sign up with Google' : 'Continue with Google'}</Text>
              </View>
            </Pressable>
          )}
          {name === 'Login' && (
            <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8}>
              <Text style={s.link}>Forgot password?</Text>
            </Pressable>
          )}
          {name === 'Login' && (
            <Pressable onPress={() => navigation.navigate('CreateAccount')} hitSlop={8}>
              <Text style={s.link}>Create an account</Text>
            </Pressable>
          )}
          {name === 'CreateAccount' && (
            <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
              <Text style={s.link}>Already have an account? Log in</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ExtendedScreen({ navigation, route }: any) {
  const name = route.name;
  if (authNames.has(name)) return <AuthScreen navigation={navigation} name={name} route={route} />;
  if (name === 'MessageDetail') return <MessageThreadView navigation={navigation} route={route} />;
  // The generic branch owns its own hooks, so it lives in a dedicated
  // component. Calling them inline here would run a different number of hooks
  // depending on which route name rendered (a rules-of-hooks violation).
  return <GenericScreen navigation={navigation} name={name} />;
}

function GenericScreen({ navigation, name }: { navigation: any; name: string }) {
  const d = screens[name] || screens.Resources;
  const [query, setQuery] = useState('');
  const [remoteItems, setRemoteItems] = useState<Item[] | null>(null);
  const [searchResults, setSearchResults] = useState<Item[] | null>(null);
  useEffect(() => {
    if (name !== 'SearchScreen') return;
    const term = query.trim();
    if (term.length < 2) {
      setSearchResults(null);
      return;
    }
    let active = true;
    const t = setTimeout(async () => {
      try {
        const r = await loadContent(undefined, term);
        if (active) setSearchResults(r.map((x) => ({ id: x.id, title: x.title, subtitle: x.subtitle, route: x.route })));
      } catch (e) {
        if (active) setSearchResults([]);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [name, query]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (name === 'SavedContent') {
          const r = await loadSavedContent();
          if (active && r.length) setRemoteItems(r.map((x) => ({ id: x.id, title: x.title, subtitle: x.subtitle, route: x.route })));
          return;
        }
        const type = contentRoutes[name];
        if (!type) return;
        const r = await loadContent(type);
        if (active && r.length) setRemoteItems(r.map((x) => ({ id: x.id, title: x.title, subtitle: x.subtitle, route: x.route })));
      } catch (e) {
        /* fall back to embedded copy */
      }
    })();
    return () => {
      active = false;
    };
  }, [name]);
  // Render remote/search results when present, otherwise the built-in list.
  const listItems =
    name === 'SearchScreen' && searchResults && searchResults.length
      ? searchResults
      : remoteItems && remoteItems.length
        ? remoteItems
        : d.items || [];
  // CTA strings in the definition are labels, not routes. Map them to real
  // destinations so tapping can never call navigate() with an invalid route.
  const ctaRoute: Record<string, string> = {
    'Save Resource': 'SavedContent',
    'Register for Webinar': 'WebinarConfirmation',
    'Open Listen Link': 'PodcastDetail',
    'View Booking Options': 'Telehealth',
    'View Telehealth Details': 'AppointmentDetail',
    'View Webinar Details': 'WebinarDetail',
    'Manage Subscription': 'Subscription',
    'Continue to Secure Checkout': 'Checkout',
    'Edit Personalization': 'NutritionProfileSettings',
    'Explore Membership': 'FreePremium',
  };
  const ctaTarget = d.cta ? ctaRoute[d.cta] : undefined;
  const handleCta = () => {
    if (ctaTarget) navigation.navigate(ctaTarget);
  };
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={s.eyebrow}>{d.eyebrow}</Text>
        <Text style={s.title}>{d.title}</Text>
        <Text style={s.copy}>{d.copy}</Text>
        {listItems && listItems.length > 0 ? (
          <View style={s.list}>
            {listItems.map((item) => {
              const target = item.route;
              const content = (
                <>
                  <View style={s.itemIcon}>{item.icon ? <item.icon size={21} color={colors.deepTeal} /> : <BookOpen size={21} color={colors.deepTeal} />}</View>
                  <View style={s.itemCopy}>
                    <Text style={s.itemTitle}>{item.title}</Text>
                    <Text style={s.itemSub}>{item.subtitle}</Text>
                  </View>
                  {target ? <ChevronRight size={19} color={colors.muted} /> : null}
                </>
              );
              return target ? (
                <Pressable key={item.id || item.title} style={s.item} onPress={() => navigation.navigate(target)} accessibilityRole="button">{content}</Pressable>
              ) : (
                <View key={item.id || item.title} style={s.item}>{content}</View>
              );
            })}
          </View>
        ) : null}
        {ctaTarget ? (
          <Pressable style={[s.cta, { width: '100%' }]} onPress={handleCta}>
            <Text style={s.ctaText}>{d.cta}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MessageThreadView({ navigation, route }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>(route?.params?.threadId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let id = threadId;
        if (!id) {
          const threads = await loadThreads();
          id = threads[0]?.id;
        }
        if (!id) {
          if (active) setLoading(false);
          return;
        }
        const res = await loadThread(id);
        if (active) {
          setThreadId(id);
          setMessages(res.messages || []);
        }
      } catch (e: any) {
        if (active) setError(e?.message || 'Could not load this conversation.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const submit = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    try {
      const m = await sendMessage(body, threadId);
      setMessages((prev) => [...prev, m]);
      if ((m as any).threadId) setThreadId((m as any).threadId);
      setDraft('');
    } catch (e: any) {
      setError(e?.message || 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          <Text style={s.eyebrow}>SECURE MESSAGE</Text>
          <Text style={s.title}>Conversation with your Dietitian.</Text>
          <Text style={s.copy}>For education and support—not urgent or emergency care.</Text>
          {error ? <View style={s.authErrorBox}><Text style={s.authErrorText}>{error}</Text></View> : null}
          {loading ? <Text style={s.copy}>Loading your conversation…</Text> : messages.length === 0 ? (
            <View style={s.list}>
              <Text style={s.copy}>No messages yet. Send your first question below.</Text>
            </View>
          ) : (
            <View style={s.list}>
              {messages.map((m) => (
                <View key={m.id} style={s.item}>
                  <View style={s.itemIcon}><MessageSquare size={21} color={colors.deepTeal} /></View>
                  <View style={s.itemCopy}>
                    <Text style={s.itemTitle}>{m.authorType === 'user' ? 'You' : 'Maureen'}</Text>
                    <Text style={s.itemSub}>{m.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={s.inputRow}>
            <TextInput value={draft} onChangeText={setDraft} placeholder="Type your message…" placeholderTextColor={colors.muted} style={[s.authInput, s.composerInput]} />
            <Pressable style={s.sendBtn} onPress={submit} disabled={sending || !draft.trim()}>
              <Text style={s.sendBtnText}>Send</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  scroll: { width: '100%' },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
    backgroundColor: colors.background,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: 'Roboto',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.green,
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  copy: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 8,
  },
  authErrorBox: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  authErrorText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 19,
    color: '#B91C1C',
  },
  list: {
    marginTop: 16,
    gap: 8,
  },
  item: {
    minHeight: 78,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: { flex: 1, minWidth: 0 },
  itemTitle: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text },
  itemSub: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 3 },
  cta: {
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  ctaText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  search: {
    minHeight: 48,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  auth: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
    backgroundColor: colors.background,
  },
  authBack: {
    width: 42,
    height: 42,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  authInput: {
    minHeight: 48,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text,
  },
  composerInput: {
    flex: 1,
    minWidth: 0,
    marginBottom: 0,
  },
  link: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '700',
    color: colors.deepTeal,
    marginTop: 8,
  },
  sendBtn: {
    minHeight: 46,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  sendBtnText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  confirm: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
});
