import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import {
  Activity,
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  Heart,
  HeartHandshake,
  Info,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  Utensils,
  Video,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Pill, PillGroup } from '../../components/Pill';
import { ScreenContainer } from '../../components/ScreenContainer';
import { dimensions, radius, spacing } from '../../theme/tokens';
import { useLayoutMetrics } from '../../theme/responsive';
import { loadProfile, saveProfile } from '../../lib/profile';
import { loadSavedContent, unsaveContent } from '../../lib/content';
import { loadPlans, loadSubscription, Plan } from '../../lib/subscription';
import { loadPreferences, savePreferences } from '../../lib/preferences';
import { deleteAccount, exportAccountData } from '../../lib/account';
import { updateName } from '../../lib/auth-service';
import { apiFetch } from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';

const GOALS = [
  'Lose weight',
  'Maintain weight',
  'Gain weight',
  'Build muscle',
  'Improve overall health',
  'Manage a health condition',
  'Understand nutrition better',
];
const SEXES = ['Female', 'Male', 'Prefer not to say'];

function Page({ navigation, children }: { navigation: any; children: React.ReactNode }) {
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenContainer keyboardShouldPersistTaps="handled">
          <Pressable
            style={s.back}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          {children}
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Head({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <>
      <Text style={s.eyebrow}>{eyebrow}</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.copy}>{copy}</Text>
    </>
  );
}

function Row({
  icon: Icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon?: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const body = (
    <>
      {Icon ? (
        <View style={[s.itemIcon, danger && { backgroundColor: '#FEE2E2' }]}>
          <Icon size={19} color={danger ? colors.red : colors.deepTeal} />
        </View>
      ) : null}
      <View style={s.itemCopy}>
        <Text style={[s.itemTitle, danger && { color: colors.red }]}>{title}</Text>
        {subtitle ? <Text style={s.itemSub}>{subtitle}</Text> : null}
      </View>
      {onPress ? <ChevronRight size={19} color={colors.muted} /> : null}
    </>
  );
  if (!onPress) return <View style={s.item}>{body}</View>;
  return (
    <Pressable style={s.item} onPress={onPress}>
      {body}
    </Pressable>
  );
}

function Toggle({
  label,
  subtitle,
  value,
  onChange,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.toggleRow}>
      <View style={s.itemCopy}>
        <Text style={s.itemTitle}>{label}</Text>
        {subtitle ? <Text style={s.itemSub}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.lime }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

function Tags({ items, onRemove }: { items: string[]; onRemove: (v: string) => void }) {
  if (!items.length) return <Text style={s.hint}>None added yet.</Text>;
  return (
    <PillGroup style={{ marginTop: 8 }}>
      {items.map((x) => (
        <Pill key={x} label={x} tone="green" onRemove={() => onRemove(x)} />
      ))}
    </PillGroup>
  );
}

export function NutritionProfileSettingsScreen({ navigation }: any) {
  const { user, refetchSession } = useAuth();
  const { data, updateData } = useOnboarding();
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [goal, setGoal] = useState(data.goal);
  const [sex, setSex] = useState(data.sex);
  const [age, setAge] = useState(data.age);
  const [height, setHeight] = useState(data.height);
  const [weight, setWeight] = useState(data.weight);
  const [allergies, setAllergies] = useState<string[]>(data.allergies || []);
  const [prefs, setPrefs] = useState<string[]>(data.dietaryPreferences || []);
  const [newAllergy, setNewAllergy] = useState('');
  const [newPref, setNewPref] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [errorStatus, setErrorStatus] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await loadProfile();
        const p = r?.profile;
        if (active && p) {
          if (p.displayName) setDisplayName(p.displayName);
          setGoal(p.goal || '');
          setSex(p.sex || '');
          setAge(p.age || '');
          setHeight(p.height || '');
          setWeight(p.weight || '');
          setAllergies(Array.isArray(p.allergies) ? p.allergies : []);
          setPrefs(Array.isArray(p.dietaryPreferences) ? p.dietaryPreferences : []);
        }
      } catch {
        /* offline: fall back to onboarding data already in state */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const add = (value: string, list: string[], setList: (x: string[]) => void, clear: () => void) => {
    const t = value.trim();
    if (!t || list.includes(t)) {
      clear();
      return;
    }
    setList([...list, t]);
    clear();
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setStatus('');
    setErrorStatus('');
    const payload = {
      displayName: displayName.trim() || undefined,
      goal,
      sex,
      age,
      height,
      weight,
      allergies,
      dietaryPreferences: prefs,
      isAssessmentComplete: true,
    };
    updateData(payload);
    try {
      await saveProfile(payload);
      if (displayName.trim() && displayName.trim() !== user?.name) {
        await updateName(displayName.trim()).catch(() => undefined);
        await refetchSession();
      }
      setStatus('Your profile and nutrition preferences have been saved.');
    } catch (e: any) {
      setErrorStatus(e?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page navigation={navigation}>
      <Head
        eyebrow="NUTRITION PROFILE & PERSONAL INFO"
        title="Personalization you control."
        copy="Update your personal details, nutrition goals, dietary preferences, and allergy considerations whenever your needs change."
      />
      {loading ? <Text style={s.hint}>Loading your profile…</Text> : null}

      <Text style={s.section}>Personal Information</Text>
      <View style={s.fieldBlock}>
        <Text style={s.label}>Full Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your full name"
          placeholderTextColor={colors.muted}
          style={s.input}
        />
      </View>

      <Text style={s.section}>Your Nutrition Goals</Text>
      <PillGroup>
        {GOALS.map((g) => (
          <Pill key={g} label={g} selected={goal === g} onPress={() => setGoal(g)} />
        ))}
      </PillGroup>

      <Text style={s.section}>Biological Sex</Text>
      <PillGroup>
        {SEXES.map((x) => (
          <Pill key={x} label={x} selected={sex === x} onPress={() => setSex(x)} />
        ))}
      </PillGroup>

      <View style={s.fieldRow}>
        <View style={s.fieldCol}>
          <Text style={s.label}>Age</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 34"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            style={s.input}
          />
        </View>
        <View style={s.fieldCol}>
          <Text style={s.label}>Height</Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 168 cm"
            placeholderTextColor={colors.muted}
            style={s.input}
          />
        </View>
        <View style={s.fieldCol}>
          <Text style={s.label}>Weight</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 72 kg"
            placeholderTextColor={colors.muted}
            style={s.input}
          />
        </View>
      </View>

      <Text style={s.section}>Allergies & Intolerances</Text>
      <Tags items={allergies} onRemove={(v) => setAllergies(allergies.filter((x) => x !== v))} />
      <View style={s.addRow}>
        <TextInput
          value={newAllergy}
          onChangeText={setNewAllergy}
          placeholder="Add an allergy or intolerance"
          placeholderTextColor={colors.muted}
          style={[s.input, s.addInput]}
          onSubmitEditing={() => add(newAllergy, allergies, setAllergies, () => setNewAllergy(''))}
        />
        <Pressable
          style={s.addBtn}
          onPress={() => add(newAllergy, allergies, setAllergies, () => setNewAllergy(''))}
          accessibilityRole="button"
          accessibilityLabel="Add allergy"
        >
          <Plus size={20} color="#fff" />
        </Pressable>
      </View>

      <Text style={s.section}>Dietary Preferences</Text>
      <Tags items={prefs} onRemove={(v) => setPrefs(prefs.filter((x) => x !== v))} />
      <View style={s.addRow}>
        <TextInput
          value={newPref}
          onChangeText={setNewPref}
          placeholder="Add a dietary preference (e.g. Mediterranean)"
          placeholderTextColor={colors.muted}
          style={[s.input, s.addInput]}
          onSubmitEditing={() => add(newPref, prefs, setPrefs, () => setNewPref(''))}
        />
        <Pressable
          style={s.addBtn}
          onPress={() => add(newPref, prefs, setPrefs, () => setNewPref(''))}
          accessibilityRole="button"
          accessibilityLabel="Add preference"
        >
          <Plus size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={s.notice}>
        <ShieldCheck size={18} color={colors.deepTeal} />
        <Text style={s.noticeText}>
          True Diet provides general nutrition education, not medical diagnosis or medical nutrition therapy.
        </Text>
      </View>

      {status ? <Text style={s.saved}>{status}</Text> : null}
      {errorStatus ? <Text style={s.error}>{errorStatus}</Text> : null}

      <Pressable style={[s.cta, saving && s.ctaDisabled]} disabled={saving} onPress={save}>
        <Text style={s.ctaText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
      </Pressable>
    </Page>
  );
}

const DEFAULT_NOTIF: Record<string, boolean> = {
  push: true,
  messages: true,
  appointments: true,
  webinars: true,
  content: false,
  tracking: false,
  media: false,
  security: true,
};
const DEFAULT_ACCESS: Record<string, boolean> = { largerText: false, reduceMotion: false };

export function SettingsScreen({ navigation, route }: any) {
  const { user, signOutUser, refetchSession } = useAuth();
  const [notif, setNotif] = useState<Record<string, boolean>>(DEFAULT_NOTIF);
  const [access, setAccess] = useState<Record<string, boolean>>(DEFAULT_ACCESS);
  const [note, setNote] = useState('');
  const [pwOpen, setPwOpen] = useState(Boolean(route?.params?.openPassword));
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [nameBusy, setNameBusy] = useState(false);

  const saveDisplayName = async () => {
    const trimmed = newName.trim();
    if (trimmed.length < 2 || nameBusy) return;
    setNameBusy(true);
    try {
      await updateName(trimmed);
      await refetchSession();
      setEditNameOpen(false);
      setNote('Account name updated.');
    } catch (e: any) {
      setNote(e?.message || 'Could not update name.');
    } finally {
      setNameBusy(false);
    }
  };

  const changePassword = async () => {
    if (pwBusy) return;
    setPwError('');
    setPwMsg('');
    if (newPw.length < 8) {
      setPwError('Choose a new password with at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('The new passwords do not match.');
      return;
    }
    setPwBusy(true);
    try {
      const res: any = await apiFetch<{ success: boolean }>('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword: currentPw, newPassword: newPw },
      });
      if (!res?.success) {
        setPwError('Could not change your password. Please try again.');
        return;
      }
      setPwMsg('Password updated. Other devices have been signed out.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwOpen(false);
      await refetchSession();
    } catch (e: any) {
      setPwError(e?.message || 'Could not reach the server. Please try again.');
    } finally {
      setPwBusy(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p = await loadPreferences();
        if (!active) return;
        setNotif({ ...DEFAULT_NOTIF, ...p.notifications });
        setAccess({ ...DEFAULT_ACCESS, ...p.accessibility });
      } catch {
        /* offline: keep defaults */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = async (nextNotif: Record<string, boolean>, nextAccess: Record<string, boolean>) => {
    try {
      await savePreferences({ notifications: nextNotif, accessibility: nextAccess });
      setNote('Preferences saved.');
    } catch (e: any) {
      setNote(e?.message || 'Could not save your preferences. Please try again.');
    }
  };
  const setN = (k: string) => (v: boolean) => {
    const next = { ...notif, [k]: v };
    setNotif(next);
    persist(next, access);
  };
  const setA = (k: string) => (v: boolean) => {
    const next = { ...access, [k]: v };
    setAccess(next);
    persist(notif, next);
  };

  const signOut = () => {
    Alert.alert('Sign out', 'Sign out of True Diet on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOutUser();
          navigation.getParent('Root')?.replace('Onboarding');
        },
      },
    ]);
  };

  return (
    <Page navigation={navigation}>
      <Head
        eyebrow="ACCOUNT SETTINGS"
        title="Make True Diet work for you."
        copy="Manage notification preferences, accessibility options, password, and account settings."
      />

      <Text style={s.section}>Account</Text>
      <View style={s.list}>
        {user?.email ? (
          <Row
            icon={UserCheck}
            title={user.name || 'Your account'}
            subtitle={user.email}
            onPress={() => {
              setNewName(user.name || '');
              setEditNameOpen((v) => !v);
            }}
          />
        ) : (
          <Row title="Not signed in" subtitle="Tap to sign in or create an account" onPress={() => navigation.navigate('Login')} />
        )}
        {editNameOpen && user ? (
          <View style={s.pwPanel}>
            <Text style={s.label}>Update full name</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Your full name"
              placeholderTextColor={colors.muted}
              style={s.input}
            />
            <Pressable
              style={[s.cta, (nameBusy || newName.trim().length < 2) && s.ctaDisabled]}
              disabled={nameBusy || newName.trim().length < 2}
              onPress={saveDisplayName}
            >
              <Text style={s.ctaText}>{nameBusy ? 'Saving…' : 'Save Name'}</Text>
            </Pressable>
          </View>
        ) : null}

        {user?.email ? (
          <Row
            icon={LockKeyhole}
            title="Change Password"
            subtitle="Update the password for this account"
            onPress={() => {
              setPwOpen((v) => !v);
              setPwError('');
              setPwMsg('');
            }}
          />
        ) : null}
        {pwOpen ? (
          <View style={s.pwPanel}>
            <Text style={s.label}>Current password</Text>
            <TextInput
              value={currentPw}
              onChangeText={setCurrentPw}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Current password"
              placeholderTextColor={colors.muted}
              style={s.input}
            />
            <Text style={s.label}>New password (minimum 8 characters)</Text>
            <TextInput
              value={newPw}
              onChangeText={setNewPw}
              secureTextEntry
              autoCapitalize="none"
              placeholder="New password"
              placeholderTextColor={colors.muted}
              style={s.input}
            />
            <Text style={s.label}>Confirm new password</Text>
            <TextInput
              value={confirmPw}
              onChangeText={setConfirmPw}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Repeat new password"
              placeholderTextColor={colors.muted}
              style={s.input}
            />
            {pwError ? <Text style={s.error}>{pwError}</Text> : null}
            <Pressable
              style={[s.cta, (pwBusy || !currentPw || !newPw) && s.ctaDisabled]}
              disabled={pwBusy || !currentPw || !newPw}
              onPress={changePassword}
            >
              <Text style={s.ctaText}>{pwBusy ? 'Updating…' : 'Update Password'}</Text>
            </Pressable>
          </View>
        ) : null}
        {pwMsg ? <Text style={s.saved}>{pwMsg}</Text> : null}
      </View>

      <Text style={s.section}>Notifications</Text>
      <View style={s.card}>
        <Toggle label="Push notifications" subtitle="Allow True Diet to send alerts" value={!!notif.push} onChange={setN('push')} />
        <Toggle label="Messages" subtitle="Replies from your dietitian" value={!!notif.messages} onChange={setN('messages')} />
        <Toggle label="Appointments" subtitle="Visit reminders and confirmations" value={!!notif.appointments} onChange={setN('appointments')} />
        <Toggle label="Webinars & classes" subtitle="Live sessions you register for" value={!!notif.webinars} onChange={setN('webinars')} />
        <Toggle label="New content" subtitle="Fresh articles and resources" value={!!notif.content} onChange={setN('content')} />
        <Toggle label="Recipes & podcast" subtitle="New recipes and episodes" value={!!notif.media} onChange={setN('media')} />
        <Toggle label="Tracking reminders" subtitle="Optional nudges to log meals" value={!!notif.tracking} onChange={setN('tracking')} />
        <Toggle label="Account & security" subtitle="Always on for account protection" value onChange={() => undefined} />
      </View>

      <View style={s.list}>
        <Row
          icon={Bell}
          title="Device notifications"
          subtitle="Permission and registered devices"
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      <Text style={s.section}>Accessibility</Text>
      <View style={s.card}>
        <Toggle label="Larger text" subtitle="Increase base text size" value={!!access.largerText} onChange={setA('largerText')} />
        <Toggle label="Reduce motion" subtitle="Minimize animations" value={!!access.reduceMotion} onChange={setA('reduceMotion')} />
      </View>
      {note ? <Text style={s.saved}>{note}</Text> : null}

      <Text style={s.section}>Privacy & Support</Text>
      <View style={s.list}>
        <Row icon={ShieldCheck} title="Privacy & Security" subtitle="Consent, data export, and account deletion" onPress={() => navigation.navigate('Privacy')} />
        <Row icon={CircleHelp} title="Help & Support" subtitle="FAQs and contact True Diet" onPress={() => navigation.navigate('Support')} />
        <Row icon={FileText} title="Terms & Privacy Policy" subtitle="Legal information and disclaimers" onPress={() => navigation.navigate('Legal')} />
        {user ? <Row icon={LogOut} title="Sign Out" onPress={signOut} danger /> : null}
      </View>
    </Page>
  );
}

const DEFAULT_CONSENT: Record<string, boolean> = { personalization: true, analytics: false };
export function PrivacyScreen({ navigation }: any) {
  const { signOutUser } = useAuth();
  const [consent, setConsent] = useState<Record<string, boolean>>(DEFAULT_CONSENT);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p = await loadPreferences();
        if (active) setConsent({ ...DEFAULT_CONSENT, ...p.consents });
      } catch {
        /* offline: keep defaults */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = async (next: Record<string, boolean>) => {
    try {
      await savePreferences({ consents: next });
      setNote('Consent preferences updated.');
    } catch (e: any) {
      setNote(e?.message || 'Could not save your consent preferences. Please try again.');
    }
  };
  const setC = (k: string) => (v: boolean) => {
    const next = { ...consent, [k]: v };
    setConsent(next);
    persist(next);
  };

  const exportData = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const data = await exportAccountData();
      const json = JSON.stringify(data, null, 2);
      if (Platform.OS === 'web') {
        const doc = (globalThis as any).document;
        if (doc) {
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = doc.createElement('a');
          link.href = url;
          link.download = 'true-diet-export.json';
          doc.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          Alert.alert('Export downloaded', 'Your data export was saved as true-diet-export.json.');
          return;
        }
      }
      await Share.share({ title: 'True Diet data export', message: json });
    } catch (e: any) {
      Alert.alert('Could not export', e?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const deleteAccountConfirm = () =>
    Alert.alert(
      'Delete my account',
      'This permanently removes your account and all personal data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await signOutUser();
              navigation.getParent('Root')?.replace('Onboarding');
            } catch (e: any) {
              Alert.alert('Could not delete', e?.message || 'Please try again.');
            }
          },
        },
      ]
    );

  return (
    <Page navigation={navigation}>
      <Head
        eyebrow="PRIVACY & SECURITY"
        title="Your data, your control."
        copy="Review consent choices, export a copy of your account data, or permanently delete your account."
      />

      <Text style={s.section}>Consent</Text>
      <View style={s.card}>
        <Toggle
          label="Personalized recommendations"
          subtitle="Use my profile to tailor education"
          value={!!consent.personalization}
          onChange={setC('personalization')}
        />
        <Toggle
          label="Anonymous analytics"
          subtitle="Help improve True Diet"
          value={!!consent.analytics}
          onChange={setC('analytics')}
        />
      </View>
      {note ? <Text style={s.saved}>{note}</Text> : null}

      <Text style={s.section}>Your Data & Account</Text>
      <View style={s.list}>
        <Row
          icon={Download}
          title={busy ? 'Preparing export…' : 'Export my data'}
          subtitle="Download a JSON copy of your profile, logs, and saved items"
          onPress={exportData}
        />
        <Row
          icon={Trash2}
          title="Delete my account"
          subtitle="Permanently remove your account and all associated data"
          onPress={deleteAccountConfirm}
          danger
        />
      </View>

      <View style={s.notice}>
        <LockKeyhole size={18} color={colors.deepTeal} />
        <Text style={s.noticeText}>
          Your nutrition information is sensitive. It is access-controlled and never sold or used for advertising.
        </Text>
      </View>
    </Page>
  );
}

function money(plan: Plan) {
  if (plan.priceCents == null) return 'Contact for pricing';
  const amount = (plan.priceCents / 100).toFixed(2).replace(/\.00$/, '');
  return `$${amount}${plan.interval ? ` / ${plan.interval}` : ''}`;
}

export function PackagesScreen({ navigation }: any) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await loadPlans();
        if (active && r?.plans?.length) setPlans(r.plans);
      } catch {
        if (active) setOffline(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const fallback: Plan[] = [
    {
      id: 'foundations',
      code: 'foundations',
      name: 'Nutrition Foundations',
      interval: '',
      priceCents: null,
      currency: 'USD',
      features: ['Education package', 'Core learning hub', 'Selected resources'],
    },
    {
      id: 'one-to-one',
      code: 'one-to-one',
      name: 'One-to-One Nutrition Support',
      interval: '',
      priceCents: null,
      currency: 'USD',
      features: ['Personalized RD guidance', 'Secure messaging', 'Video consultations'],
    },
    {
      id: 'premium',
      code: 'premium',
      name: 'True Diet Premium',
      interval: 'month',
      priceCents: null,
      currency: 'USD',
      features: ['Expanded content', 'Live classes', 'Saved libraries'],
    },
  ];
  const list = plans.length ? plans : fallback;
  return (
    <Page navigation={navigation}>
      <Head
        eyebrow="SERVICES"
        title="Support that meets you where you are."
        copy="Explore nutrition education, one-to-one support, and flexible ways to work with Maureen."
      />
      {loading ? <Text style={s.hint}>Loading packages…</Text> : null}
      <View style={s.list}>
        {list.map((plan) => (
          <Pressable key={plan.id} style={s.package} onPress={() => navigation.navigate('PackageDetail', { plan })}>
            <View style={s.packageTop}>
              <Text style={s.packageName}>{plan.name}</Text>
              <Pill label={money(plan)} tone="teal" />
            </View>
            {plan.features.slice(0, 3).map((f) => (
              <Text key={f} style={s.packageFeature}>
                • {f}
              </Text>
            ))}
            <Text style={s.packageLink}>View details →</Text>
          </Pressable>
        ))}
      </View>
      {offline ? (
        <Text style={s.hint}>
          Showing the standard packages. Pricing is confirmed with your dietitian before enrolment.
        </Text>
      ) : null}
    </Page>
  );
}

export function PackageDetailScreen({ navigation, route }: any) {
  const plan: Plan | undefined = route?.params?.plan;
  const name = plan?.name || 'Nutrition support with context.';
  return (
    <Page navigation={navigation}>
      <Head
        eyebrow="SERVICE DETAIL"
        title={name}
        copy="Learn what is included, who this service is for, and how to take the next step."
      />
      {plan ? (
        <>
          <View style={s.priceCard}>
            <Text style={s.packagePrice}>{money(plan)}</Text>
          </View>
          <Text style={s.section}>What's included</Text>
          <View style={s.list}>
            {plan.features.map((f) => (
              <Row key={f} icon={Check} title={f} />
            ))}
          </View>
        </>
      ) : (
        <Text style={s.hint}>Select a package to see what's included.</Text>
      )}
      {plan ? (
        <Pressable style={s.cta} onPress={() => navigation.navigate('Checkout', { plan })}>
          <Text style={s.ctaText}>Continue with this plan</Text>
        </Pressable>
      ) : null}
      <Pressable style={s.ctaGhost} onPress={() => navigation.navigate('Telehealth')}>
        <Text style={s.ctaGhostText}>Book a Consultation</Text>
      </Pressable>
      <Pressable style={s.ctaGhost} onPress={() => navigation.navigate('Subscription')}>
        <Text style={s.ctaGhostText}>Manage Membership</Text>
      </Pressable>
    </Page>
  );
}

export function SubscriptionScreen({ navigation }: any) {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await loadSubscription();
        if (active) setState(r);
      } catch {
        if (active) setOffline(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const status = state?.subscription?.status || 'inactive';
  const active = status === 'active' || status === 'trialing';
  const friendly = active ? 'Active' : status === 'canceled' ? 'Canceled' : 'Free Plan';
  return (
    <Page navigation={navigation}>
      <Head
        eyebrow="SUBSCRIPTION & BILLING"
        title="Manage your membership."
        copy="View your current access, renewal information, and available upgrade options."
      />
      {loading ? <Text style={s.hint}>Loading membership…</Text> : null}
      <View style={s.card}>
        <View style={s.packageTop}>
          <Text style={s.itemTitle}>Current plan</Text>
          <Pill label={friendly} tone={active ? 'green' : 'teal'} />
        </View>
        {state?.subscription?.currentPeriodEnd ? (
          <Text style={s.itemSub}>
            Renews {new Date(state.subscription.currentPeriodEnd).toLocaleDateString()}
          </Text>
        ) : (
          <Text style={s.itemSub}>
            {active ? 'Your membership is active.' : 'You are on the free True Diet experience.'}
          </Text>
        )}
      </View>

      <Text style={s.section}>What you have access to</Text>
      <View style={s.list}>
        {(state?.entitlements?.length
          ? state.entitlements
          : ['learning_hub', 'selected_resources', 'basic_tracking']
        ).map((e: string) => (
          <Row
            key={e}
            icon={Check}
            title={e.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          />
        ))}
      </View>

      {offline ? (
        <Text style={s.hint}>Your membership status could not be loaded just now. Please try again shortly.</Text>
      ) : null}
      {state && state.paymentsConfigured === false ? (
        <View style={s.notice}>
          <ShieldCheck size={18} color={colors.deepTeal} />
          <Text style={s.noticeText}>
            Membership changes are arranged with your dietitian while online checkout is unavailable.
          </Text>
        </View>
      ) : null}
      <Pressable
        style={s.cta}
        onPress={() => navigation.navigate(active ? 'Packages' : 'FreePremium')}
      >
        <Text style={s.ctaText}>{active ? 'Compare Packages' : 'Upgrade Membership'}</Text>
      </Pressable>
    </Page>
  );
}

export function MaureenProfileScreen({ navigation }: any) {
  const credentials = [
    'Registered Dietitian (MS, RD)',
    'Medical Nutrition Therapy Specialist',
    '23+ years of clinical experience',
    'Evidence-based, non-restrictive approach',
  ];
  const philosophy = [
    'Food is information, not a moral test.',
    'Context matters more than rigid food rules.',
    'Small, consistent changes beat perfect plans.',
    'Education builds confidence that lasts.',
  ];
  return (
    <Page navigation={navigation}>
      <Head
        eyebrow="ABOUT TRUEDIET & YOUR DIETITIAN"
        title="Meet Maureen."
        copy="True Diet is founded on Registered Dietitian Maureen Ashbarry’s 23+ years of clinical experience helping people understand nutrition without fear, confusion, or unnecessary restriction."
      />

      <View style={s.card}>
        <Sparkles size={22} color={colors.green} />
        <Text style={[s.itemSub, { marginTop: 10 }]}>
          Maureen has guided thousands of people through real nutrition decisions — from everyday meals to complex health conditions — always grounded in scientific evidence and respect for the person in front of her.
        </Text>
      </View>

      <Text style={s.section}>Credentials & expertise</Text>
      <View style={s.list}>
        {credentials.map((c) => (
          <View key={c} style={s.checkRow}>
            <GraduationCap size={18} color={colors.green} />
            <Text style={s.checkText}>{c}</Text>
          </View>
        ))}
      </View>

      <Text style={s.section}>True Diet Philosophy</Text>
      <View style={s.list}>
        {philosophy.map((p) => (
          <View key={p} style={s.checkRow}>
            <HeartHandshake size={18} color={colors.deepTeal} />
            <Text style={s.checkText}>{p}</Text>
          </View>
        ))}
      </View>

      <Pressable style={s.cta} onPress={() => navigation.navigate('Dietitian')}>
        <Text style={s.ctaText}>Ask the Dietitian</Text>
      </Pressable>
    </Page>
  );
}

export function SavedContentScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await loadSavedContent();
        if (active) setItems(r);
      } catch {
        if (active) setOffline(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const paramsFor = (item: any) => {
    switch (item.route) {
      case 'Article':
        return { articleId: item.id, title: item.title };
      case 'MythDetail':
        return { mythId: String(item.id).replace(/^myth-/, ''), claim: item.title };
      case 'RecipeDetail':
        return { recipeId: String(item.id).replace(/^recipe-/, ''), title: item.title };
      case 'ResourceDetail':
        return { title: item.title, slug: item.slug || item.id };
      case 'WebinarDetail':
        return { title: item.title };
      case 'PodcastDetail':
        return { title: item.title };
      default:
        return undefined;
    }
  };
  const remove = async (id: string) => {
    try {
      await unsaveContent(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Could not remove this item from your library.');
    }
  };
  return (
    <Page navigation={navigation}>
      <Head
        eyebrow="SAVED RESOURCES"
        title="Your saved library."
        copy="Keep recipes, articles, resources, classes, and episodes you want to revisit."
      />
      {loading ? <Text style={s.hint}>Loading your library…</Text> : null}
      {!loading && items.length === 0 ? (
        <View style={s.empty}>
          <FileText size={30} color={colors.muted} />
          <Text style={s.emptyTitle}>Nothing saved yet</Text>
          <Text style={s.emptyCopy}>
            Tap the save action on any article, recipe, or resource and it will appear here.
          </Text>
        </View>
      ) : (
        <View style={s.list}>
          {items.map((item) => (
            <View key={item.id} style={s.item}>
              <Pressable
                style={s.itemCopy}
                onPress={() => item.route && navigation.navigate(item.route, paramsFor(item))}
              >
                <Text style={s.itemTitle}>{item.title}</Text>
                <Text style={s.itemSub}>{item.subtitle}</Text>
              </Pressable>
              <Pressable
                onPress={() => remove(item.id)}
                hitSlop={8}
                accessibilityLabel={`Remove ${item.title}`}
              >
                <Trash2 size={18} color={colors.red} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {error ? <Text style={s.error}>{error}</Text> : null}
      {offline ? <Text style={s.hint}>Sign in to sync your saved content across devices.</Text> : null}
    </Page>
  );
}

export function ProfileHubScreen({ navigation }: any) {
  const { user, signOutUser } = useAuth();
  const { horizontalPadding, gutter, gridItemWidth } = useLayoutMetrics();
  const [goal, setGoal] = useState<string>('');
  const name = user?.name || 'Guest Member';
  const email = user?.email || 'Not signed in';
  const initials =
    (user?.name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || (user?.email?.[0]?.toUpperCase() ?? 'TD');

  useEffect(() => {
    let active = true;
    loadProfile()
      .then((r) => {
        if (active && r?.profile?.goal) setGoal(r.profile.goal);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user?.id]);

  const go = (route: string, params?: any) => {
    // React Navigation bubbles unhandled actions to the parent navigator, so
    // this works whether Profile is mounted as a tab or as a stack screen.
    navigation.navigate(route, params);
  };

  const signOut = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOutUser();
          navigation.getParent('Root')?.replace('Onboarding');
        },
      },
    ]);

  const deleteAccountConfirm = () =>
    Alert.alert(
      'Delete Account',
      'This permanently deletes your True Diet account and all saved records. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await signOutUser();
              navigation.getParent('Root')?.replace('Onboarding');
            } catch (e: any) {
              Alert.alert('Could not delete account', e?.message || 'Please try again.');
            }
          },
        },
      ]
    );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.profileContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Header */}
        <View style={s.profileHeader}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.name}>{name}</Text>
          <Text style={s.email}>{email}</Text>
          <PillGroup style={{ justifyContent: 'center', marginTop: 12 }}>
            <Pill
              label={user ? 'Active Member' : 'Guest Mode'}
              tone={user ? 'green' : 'teal'}
            />
            {goal ? <Pill label={`Focus: ${goal}`} tone="teal" /> : null}
            <Pill
              label="Edit Profile"
              icon={<Edit3 size={14} color={colors.deepTeal} />}
              onPress={() => go('NutritionProfileSettings')}
            />
          </PillGroup>
        </View>

        {!user ? (
          <View style={s.authActions}>
            <Pressable style={[s.cta, { flex: 1, marginTop: 0 }]} onPress={() => go('Login')}>
              <Text style={s.ctaText}>Sign In</Text>
            </Pressable>
            <Pressable style={[s.ctaGhost, { flex: 1, marginTop: 0 }]} onPress={() => go('CreateAccount')}>
              <Text style={s.ctaGhostText}>Create Account</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Quick Stats / Shortcuts */}
        <View style={[s.quickGrid, { gap: gutter }]}>
          <Pressable style={[s.quickCard, { width: gridItemWidth(2) }]} onPress={() => go('ProgressPatterns')}>
            <TrendingUp size={20} color={colors.deepTeal} />
            <Text style={s.quickCardTitle}>My Progress</Text>
            <Text style={s.quickCardSub}>Weekly patterns & weight</Text>
          </Pressable>
          <Pressable style={[s.quickCard, { width: gridItemWidth(2) }]} onPress={() => go('SavedContent')}>
            <Heart size={20} color={colors.green} />
            <Text style={s.quickCardTitle}>Saved Library</Text>
            <Text style={s.quickCardSub}>Articles, recipes & guides</Text>
          </Pressable>
          <Pressable style={[s.quickCard, { width: gridItemWidth(2) }]} onPress={() => go('MealPlans')}>
            <CalendarDays size={20} color={colors.deepTeal} />
            <Text style={s.quickCardTitle}>My Meal Plans</Text>
            <Text style={s.quickCardSub}>Weekly plans & groceries</Text>
          </Pressable>
          <Pressable style={[s.quickCard, { width: gridItemWidth(2) }]} onPress={() => go('MealLog')}>
            <Utensils size={20} color={colors.orange} />
            <Text style={s.quickCardTitle}>My Food Diary</Text>
            <Text style={s.quickCardSub}>Log meals & check-ins</Text>
          </Pressable>
        </View>

        <Text style={s.section}>Personal & Nutrition Profile</Text>
        <View style={s.list}>
          <Row
            icon={UserCheck}
            title="Personal Information & Edit Profile"
            subtitle="Full name, age, height, weight, and profile settings"
            onPress={() => go('NutritionProfileSettings')}
          />
          <Row
            icon={Sparkles}
            title="My Nutrition Goals"
            subtitle={goal || 'Set or update your primary nutrition focus'}
            onPress={() => go('NutritionProfileSettings')}
          />
          <Row
            icon={ShieldCheck}
            title="Health Conditions"
            subtitle="Evidence-based nutrition notes for specific conditions"
            onPress={() => go('HealthConditions')}
          />
          <Row
            icon={Heart}
            title="Allergies & Food Preferences"
            subtitle="Manage food allergies, intolerances, and dietary patterns"
            onPress={() => go('NutritionProfileSettings')}
          />
          <Row
            icon={Activity}
            title="Nutrition Assessment"
            subtitle="Complete or update your comprehensive evaluation"
            onPress={() => go('NutritionAssessment')}
          />
        </View>

        <Text style={s.section}>Tracking, Plans & Resources</Text>
        <View style={s.list}>
          <Row
            icon={TrendingUp}
            title="My Progress"
            subtitle="Weekly check-in patterns, meal consistency, and weight log"
            onPress={() => go('ProgressPatterns')}
          />
          <Row
            icon={BookOpen}
            title="Saved Resources & Library"
            subtitle="Saved articles, recipes, guides, and ResourceHub"
            onPress={() => go('SavedContent')}
          />
          <Row
            icon={CalendarDays}
            title="My Meal Plans & Grocery Lists"
            subtitle="Build 7-day meal plans and shopping lists"
            onPress={() => go('MealPlans')}
          />
          <Row
            icon={Utensils}
            title="My Food Diary"
            subtitle="Log a meal or use Voice Food Log"
            onPress={() => go('MealLog')}
          />
        </View>

        <Text style={s.section}>Dietitian Support & Care</Text>
        <View style={s.list}>
          <Row
            icon={MessageSquare}
            title="Ask Dietitian"
            subtitle="Secure messaging with Maureen Ashbarry, MS, RD"
            onPress={() => go('Dietitian')}
          />
          <Row
            icon={Video}
            title="Telehealth Consultations"
            subtitle="Schedule a 1-on-1 video or phone visit"
            onPress={() => go('Telehealth')}
          />
          <Row
            icon={GraduationCap}
            title="About TrueDiet & Meet Maureen"
            subtitle="Credentials, clinical philosophy, and approach"
            onPress={() => go('MaureenProfile')}
          />
        </View>

        <Text style={s.section}>Account, Billing & Settings</Text>
        <View style={s.list}>
          <Row
            icon={Bell}
            title="Notifications"
            subtitle="Push permissions and reminder categories"
            onPress={() => go('Notifications')}
          />
          <Row
            icon={CreditCard}
            title="Subscription & Billing"
            subtitle="Manage your plan, access, and service packages"
            onPress={() => go('Subscription')}
          />
          <Row
            icon={LockKeyhole}
            title="Privacy & Security"
            subtitle="Consent controls, data export, and account security"
            onPress={() => go('Privacy')}
          />
          <Row
            icon={Edit3}
            title="Account Settings & Change Password"
            subtitle="Accessibility, notifications, and password management"
            onPress={() => go('Settings')}
          />
          <Row
            icon={CircleHelp}
            title="Help & Support"
            subtitle="Frequently asked questions and support contact"
            onPress={() => go('Support')}
          />
          <Row
            icon={Info}
            title="Terms & Privacy Policy"
            subtitle="Terms of Use, Privacy Policy, and educational disclaimer"
            onPress={() => go('Legal')}
          />
          {user ? (
            <>
              <Row icon={LogOut} title="Sign Out" subtitle="Sign out on this device" onPress={signOut} danger />
              <Row
                icon={Trash2}
                title="Delete Account"
                subtitle="Permanently delete your account and personal data"
                onPress={deleteAccountConfirm}
                danger
              />
            </>
          ) : null}
        </View>

        <Text style={s.version}>True Diet · Real Nutrition. Real Science. Real Results.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  error: { fontFamily: 'Roboto', fontSize: 13, color: colors.red, marginTop: spacing.sm },
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  kav: { flex: 1, width: '100%' },
  scroll: { width: '100%' },
  profileContent: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  back: {
    width: dimensions.backButtonSize,
    height: dimensions.backButtonSize,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 26, lineHeight: 34, fontWeight: '700', color: colors.text, marginTop: 6 },
  copy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 8 },
  section: { fontFamily: 'Roboto', fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  hint: { fontFamily: 'Roboto', fontSize: 13, color: colors.muted, marginTop: spacing.sm },
  list: { marginTop: spacing.sm, gap: 10 },
  item: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: { flex: 1, minWidth: 0 },
  itemTitle: { fontFamily: 'Roboto', fontSize: 14.5, fontWeight: '700', color: colors.text },
  itemSub: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 3 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.cardPadding,
    marginTop: spacing.sm,
    gap: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  fieldBlock: { marginTop: spacing.sm, marginBottom: spacing.xs },
  fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.md },
  fieldCol: { flex: 1, minWidth: 96 },
  label: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  input: {
    minHeight: dimensions.inputHeight,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text,
  },
  addRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md, alignItems: 'center' },
  addInput: { flex: 1 },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.softBlue,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    marginTop: spacing.xl,
  },
  noticeText: { flex: 1, fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.deepTeal },
  saved: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.green, marginTop: spacing.sm, textAlign: 'center' },
  pwPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    marginTop: spacing.sm,
    gap: 8,
  },
  cta: {
    minHeight: dimensions.buttonHeight,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: 16,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff' },
  ctaGhost: {
    minHeight: dimensions.buttonHeightSmall,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: 16,
  },
  ctaGhostText: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.deepTeal },
  authActions: { flexDirection: 'row', gap: 10, marginTop: spacing.md, width: '100%' },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
    width: '100%',
  },
  quickCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.cardPadding,
    gap: 4,
  },
  quickCardTitle: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 4 },
  quickCardSub: { fontFamily: 'Roboto', fontSize: 11.5, lineHeight: 16, color: colors.textSecondary },
  package: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.cardPadding,
  },
  packageTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  packageName: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text, flex: 1, minWidth: 150 },
  packagePrice: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.deepTeal },
  packageFeature: { fontFamily: 'Roboto', fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },
  packageLink: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.deepTeal, marginTop: spacing.sm },
  priceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.softBlue,
    padding: spacing.cardPadding,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: spacing.xs },
  checkText: { flex: 1, fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: 8 },
  emptyTitle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  emptyCopy: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.softBlue,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontFamily: 'Roboto', fontSize: 26, fontWeight: '700', color: colors.deepTeal },
  name: { fontFamily: 'Roboto', fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
  email: { fontFamily: 'Roboto', fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  version: { fontFamily: 'Roboto', fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: spacing.xxl },
});
