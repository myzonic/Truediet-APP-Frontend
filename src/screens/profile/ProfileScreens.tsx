import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { ArrowLeft, ChevronRight, Download, FileText, GraduationCap, HeartHandshake, LogOut, LockKeyhole, Plus, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { loadProfile, saveProfile } from '../../lib/profile';
import { loadSavedContent, unsaveContent } from '../../lib/content';
import { loadPlans, loadSubscription, Plan } from '../../lib/subscription';
import { loadPreferences, savePreferences } from '../../lib/preferences';
import { deleteAccount, exportAccountData } from '../../lib/account';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';

const GOALS = ['Lose weight', 'Maintain weight', 'Gain weight', 'Build muscle', 'Improve overall health', 'Manage a health condition', 'Understand nutrition better'];
const SEXES = ['Female', 'Male', 'Prefer not to say'];

function Page({ navigation, children }: { navigation: any; children: React.ReactNode }) {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        {children}
      </ScrollView>
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

function Row({ title, subtitle, onPress, danger }: { title: string; subtitle?: string; onPress?: () => void; danger?: boolean }) {
  const body = (
    <>
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

function Toggle({ label, subtitle, value, onChange }: { label: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.toggleRow}>
      <View style={s.itemCopy}>
        <Text style={s.itemTitle}>{label}</Text>
        {subtitle ? <Text style={s.itemSub}>{subtitle}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.lime }} thumbColor={colors.surface} ios_backgroundColor={colors.border} />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[s.chip, active && s.chipActive]} onPress={onPress}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Tags({ items, onRemove }: { items: string[]; onRemove: (v: string) => void }) {
  if (!items.length) return <Text style={s.hint}>None added yet.</Text>;
  return (
    <View style={s.tagRow}>
      {items.map((x) => (
        <View key={x} style={s.tag}>
          <Text style={s.tagText}>{x}</Text>
          <Pressable onPress={() => onRemove(x)} hitSlop={8} accessibilityLabel={`Remove ${x}`}>
            <X size={14} color={colors.deepTeal} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

export function NutritionProfileSettingsScreen({ navigation }: any) {
  const { data, updateData } = useOnboarding();
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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await loadProfile();
        const p = r?.profile;
        if (active && p) {
          setGoal(p.goal || '');
          setSex(p.sex || '');
          setAge(p.age || '');
          setHeight(p.height || '');
          setWeight(p.weight || '');
          setAllergies(Array.isArray(p.allergies) ? p.allergies : []);
          setPrefs(Array.isArray(p.dietaryPreferences) ? p.dietaryPreferences : []);
        }
      } catch (e) {
        /* offline: fall back to onboarding data already in state */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const add = (value: string, list: string[], setList: (x: string[]) => void, clear: () => void) => {
    const t = value.trim();
    if (!t || list.includes(t)) { clear(); return; }
    setList([...list, t]);
    clear();
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setStatus('');
    const payload = { goal, sex, age, height, weight, allergies, dietaryPreferences: prefs };
    updateData(payload);
    try {
      await saveProfile(payload);
      setStatus('Your profile has been updated.');
    } catch (e) {
      setStatus('Saved on this device. It will sync to your account when you are connected.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page navigation={navigation}>
      <Head eyebrow="NUTRITION PROFILE" title="Personalization you control." copy="Update goals, dietary preferences, and allergy or intolerance considerations when your needs change." />
      {loading ? <Text style={s.hint}>Loading your profile…</Text> : null}

      <Text style={s.section}>Your focus</Text>
      <View style={s.wrapRow}>{GOALS.map((g) => <Chip key={g} label={g} active={goal === g} onPress={() => setGoal(g)} />)}</View>

      <Text style={s.section}>About you</Text>
      <View style={s.wrapRow}>{SEXES.map((x) => <Chip key={x} label={x} active={sex === x} onPress={() => setSex(x)} />)}</View>
      <View style={s.fieldRow}>
        <View style={s.field}><Text style={s.label}>Age</Text><TextInput value={age} onChangeText={setAge} placeholder="e.g. 34" placeholderTextColor={colors.muted} keyboardType="number-pad" style={s.input} /></View>
        <View style={s.field}><Text style={s.label}>Height</Text><TextInput value={height} onChangeText={setHeight} placeholder="e.g. 168 cm" placeholderTextColor={colors.muted} style={s.input} /></View>
        <View style={s.field}><Text style={s.label}>Weight</Text><TextInput value={weight} onChangeText={setWeight} placeholder="e.g. 72 kg" placeholderTextColor={colors.muted} style={s.input} /></View>
      </View>

      <Text style={s.section}>Allergies & intolerances</Text>
      <Tags items={allergies} onRemove={(v) => setAllergies(allergies.filter((x) => x !== v))} />
      <View style={s.addRow}>
        <TextInput value={newAllergy} onChangeText={setNewAllergy} placeholder="Add an allergy or intolerance" placeholderTextColor={colors.muted} style={[s.input, s.addInput]} onSubmitEditing={() => add(newAllergy, allergies, setAllergies, () => setNewAllergy(''))} />
        <Pressable style={s.addBtn} onPress={() => add(newAllergy, allergies, setAllergies, () => setNewAllergy(''))} accessibilityLabel="Add allergy"><Plus size={20} color="#fff" /></Pressable>
      </View>

      <Text style={s.section}>Dietary preferences</Text>
      <Tags items={prefs} onRemove={(v) => setPrefs(prefs.filter((x) => x !== v))} />
      <View style={s.addRow}>
        <TextInput value={newPref} onChangeText={setNewPref} placeholder="Add a dietary preference" placeholderTextColor={colors.muted} style={[s.input, s.addInput]} onSubmitEditing={() => add(newPref, prefs, setPrefs, () => setNewPref(''))} />
        <Pressable style={s.addBtn} onPress={() => add(newPref, prefs, setPrefs, () => setNewPref(''))} accessibilityLabel="Add preference"><Plus size={20} color="#fff" /></Pressable>
      </View>

      <View style={s.notice}><ShieldCheck size={18} color={colors.deepTeal} /><Text style={s.noticeText}>True Diet provides education, not diagnosis or medical nutrition therapy.</Text></View>
      {status ? <Text style={s.saved}>{status}</Text> : null}
      <Pressable style={[s.cta, saving && s.ctaDisabled]} disabled={saving} onPress={save}>
        <Text style={s.ctaText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
      </Pressable>
    </Page>
  );
}

const DEFAULT_NOTIF: Record<string, boolean> = { push: true, messages: true, appointments: true, webinars: true, content: false };
const DEFAULT_ACCESS: Record<string, boolean> = { largerText: false, reduceMotion: false };

export function SettingsScreen({ navigation }: any) {
  const { user, signOutUser } = useAuth();
  const [notif, setNotif] = useState<Record<string, boolean>>(DEFAULT_NOTIF);
  const [access, setAccess] = useState<Record<string, boolean>>(DEFAULT_ACCESS);
  const [note, setNote] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p = await loadPreferences();
        if (!active) return;
        setNotif({ ...DEFAULT_NOTIF, ...p.notifications });
        setAccess({ ...DEFAULT_ACCESS, ...p.accessibility });
      } catch (e) { /* offline: keep defaults */ }
    })();
    return () => { active = false; };
  }, []);

  const persist = async (nextNotif: Record<string, boolean>, nextAccess: Record<string, boolean>) => {
    try {
      await savePreferences({ notifications: nextNotif, accessibility: nextAccess });
      setNote('Preferences saved.');
    } catch (e) {
      setNote('Saved on this device. It will sync when you are connected.');
    }
  };
  const setN = (k: string) => (v: boolean) => { const next = { ...notif, [k]: v }; setNotif(next); persist(next, access); };
  const setA = (k: string) => (v: boolean) => { const next = { ...access, [k]: v }; setAccess(next); persist(notif, next); };

  const signOut = () => {
    Alert.alert('Sign out', 'Sign out of True Diet on this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOutUser(); navigation.getParent('Root')?.replace('Onboarding'); } },
    ]);
  };
  return (
    <Page navigation={navigation}>
      <Head eyebrow="SETTINGS" title="Make True Diet work for you." copy="Manage notification preferences, accessibility options, and account settings." />

      <Text style={s.section}>Notifications</Text>
      <View style={s.card}>
        <Toggle label="Push notifications" subtitle="Allow True Diet to send alerts" value={!!notif.push} onChange={setN('push')} />
        <Toggle label="Messages" subtitle="Replies from your dietitian" value={!!notif.messages} onChange={setN('messages')} />
        <Toggle label="Appointments" subtitle="Visit reminders and confirmations" value={!!notif.appointments} onChange={setN('appointments')} />
        <Toggle label="Webinars & classes" subtitle="Live sessions you register for" value={!!notif.webinars} onChange={setN('webinars')} />
        <Toggle label="New content" subtitle="Fresh articles and resources" value={!!notif.content} onChange={setN('content')} />
      </View>

      <Text style={s.section}>Accessibility</Text>
      <View style={s.card}>
        <Toggle label="Larger text" subtitle="Increase base text size" value={!!access.largerText} onChange={setA('largerText')} />
        <Toggle label="Reduce motion" subtitle="Minimize animations" value={!!access.reduceMotion} onChange={setA('reduceMotion')} />
      </View>
      {note ? <Text style={s.saved}>{note}</Text> : null}

      <Text style={s.section}>Account</Text>
      <View style={s.list}>
        {user?.email ? <Row title={user.name || 'Your account'} subtitle={user.email} /> : <Row title="Not signed in" subtitle="You can browse as a guest" />}
        <Row title="Help & Support" subtitle="Contact True Diet" onPress={() => navigation.navigate('Support')} />
        <Row title="Legal" subtitle="Terms, Privacy Policy, and Disclaimers" onPress={() => navigation.navigate('Legal')} />
        <Pressable style={[s.item, s.signOut]} onPress={signOut}>
          <LogOut size={19} color={colors.red} />
          <View style={[s.itemCopy, { marginLeft: 12 }]}><Text style={[s.itemTitle, { color: colors.red }]}>Sign Out</Text></View>
        </Pressable>
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
      } catch (e) { /* offline: keep defaults */ }
    })();
    return () => { active = false; };
  }, []);

  const persist = async (next: Record<string, boolean>) => {
    try {
      await savePreferences({ consents: next });
      setNote('Consent preferences updated.');
    } catch (e) {
      setNote('Saved on this device. It will sync when you are connected.');
    }
  };
  const setC = (k: string) => (v: boolean) => { const next = { ...consent, [k]: v }; setConsent(next); persist(next); };

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

  const deleteAccountConfirm = () => Alert.alert('Delete my account', 'This permanently removes your account and all personal data. This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteAccount();
          await signOutUser();
          navigation.getParent('Root')?.replace('Onboarding');
        } catch (e: any) {
          Alert.alert('Could not delete', e?.message || 'Please try again.');
        }
      },
    },
  ]);

  return (
    <Page navigation={navigation}>
      <Head eyebrow="PRIVACY & DATA" title="Your data, your control." copy="Review consent choices, request your data, and manage account deletion. Health-related data is only processed through approved secure services." />

      <Text style={s.section}>Consent</Text>
      <View style={s.card}>
        <Toggle label="Personalized recommendations" subtitle="Use my profile to tailor education" value={!!consent.personalization} onChange={setC('personalization')} />
        <Toggle label="Anonymous analytics" subtitle="Help improve True Diet" value={!!consent.analytics} onChange={setC('analytics')} />
      </View>
      {note ? <Text style={s.saved}>{note}</Text> : null}

      <Text style={s.section}>Your data</Text>
      <View style={s.list}>
        <Pressable style={s.item} onPress={exportData} disabled={busy}>
          <Download size={19} color={colors.deepTeal} />
          <View style={[s.itemCopy, { marginLeft: 12 }]}><Text style={s.itemTitle}>{busy ? 'Preparing…' : 'Export my data'}</Text><Text style={s.itemSub}>Receive a copy of your account data</Text></View>
          <ChevronRight size={19} color={colors.muted} />
        </Pressable>
        <Pressable style={s.item} onPress={deleteAccountConfirm}>
          <Trash2 size={19} color={colors.red} />
          <View style={[s.itemCopy, { marginLeft: 12 }]}><Text style={[s.itemTitle, { color: colors.red }]}>Delete my account</Text><Text style={s.itemSub}>Permanently remove your account and data</Text></View>
          <ChevronRight size={19} color={colors.muted} />
        </Pressable>
      </View>

      <View style={s.notice}><LockKeyhole size={18} color={colors.deepTeal} /><Text style={s.noticeText}>Your nutrition information is sensitive. It is access-controlled and never used for advertising.</Text></View>
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
      } catch (e) { if (active) setOffline(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  const fallback: Plan[] = [
    { id: 'foundations', code: 'foundations', name: 'Nutrition Foundations', interval: '', priceCents: null, currency: 'USD', features: ['Education package', 'Core learning hub', 'Selected resources'] },
    { id: 'one-to-one', code: 'one-to-one', name: 'One-to-One Nutrition Support', interval: '', priceCents: null, currency: 'USD', features: ['Personalized RD guidance', 'Secure messaging', 'Video consultations'] },
    { id: 'premium', code: 'premium', name: 'True Diet Premium', interval: 'month', priceCents: null, currency: 'USD', features: ['Expanded content', 'Live classes', 'Saved libraries'] },
  ];
  const list = plans.length ? plans : fallback;
  return (
    <Page navigation={navigation}>
      <Head eyebrow="SERVICES" title="Support that meets you where you are." copy="Explore nutrition education, one-to-one support, and flexible ways to work with Maureen." />
      {loading ? <Text style={s.hint}>Loading packages…</Text> : null}
      <View style={s.list}>
        {list.map((plan) => (
          <Pressable key={plan.id} style={s.package} onPress={() => navigation.navigate('PackageDetail', { plan })}>
            <View style={s.packageTop}>
              <Text style={s.packageName}>{plan.name}</Text>
              <Text style={s.packagePrice}>{money(plan)}</Text>
            </View>
            {plan.features.slice(0, 3).map((f) => <Text key={f} style={s.packageFeature}>• {f}</Text>)}
            <Text style={s.packageLink}>View details →</Text>
          </Pressable>
        ))}
      </View>
      {offline ? <Text style={s.hint}>Showing standard packages. Live pricing will appear once payments are connected.</Text> : null}
    </Page>
  );
}

export function PackageDetailScreen({ navigation, route }: any) {
  const plan: Plan | undefined = route?.params?.plan;
  const name = plan?.name || 'Nutrition support with context.';
  return (
    <Page navigation={navigation}>
      <Head eyebrow="SERVICE DETAIL" title={name} copy="Learn what is included, who this service is for, and how to take the next step." />
      {plan ? (
        <>
          <View style={s.priceCard}><Text style={s.packagePrice}>{money(plan)}</Text></View>
          <Text style={s.section}>What's included</Text>
          <View style={s.list}>{plan.features.map((f) => <Row key={f} title={f} />)}</View>
        </>
      ) : (
        <Text style={s.hint}>Select a package to see what's included.</Text>
      )}
      {plan ? <Pressable style={s.cta} onPress={() => navigation.navigate('Checkout', { plan })}><Text style={s.ctaText}>Continue with this plan</Text></Pressable> : null}
      <Pressable style={s.ctaGhost} onPress={() => navigation.navigate('Telehealth')}><Text style={s.ctaGhostText}>Book a Consultation</Text></Pressable>
      <Pressable style={s.ctaGhost} onPress={() => navigation.navigate('Subscription')}><Text style={s.ctaGhostText}>Manage Membership</Text></Pressable>
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
      } catch (e) { if (active) setOffline(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  const status = state?.subscription?.status || 'inactive';
  const active = status === 'active' || status === 'trialing';
  const friendly = active ? 'Active' : status === 'canceled' ? 'Canceled' : 'Free';
  return (
    <Page navigation={navigation}>
      <Head eyebrow="MEMBERSHIP" title="Manage your membership." copy="View your current access, renewal information, and available upgrade options." />
      {loading ? <Text style={s.hint}>Loading membership…</Text> : null}
      <View style={s.card}>
        <View style={s.packageTop}>
          <Text style={s.itemTitle}>Current plan</Text>
          <View style={[s.pill, active && s.pillActive]}><Text style={[s.pillText, active && s.pillTextActive]}>{friendly}</Text></View>
        </View>
        {state?.subscription?.currentPeriodEnd ? <Text style={s.itemSub}>Renews {new Date(state.subscription.currentPeriodEnd).toLocaleDateString()}</Text> : <Text style={s.itemSub}>{active ? 'Your membership is active.' : 'You are on the free experience.'}</Text>}
      </View>

      <Text style={s.section}>What you have access to</Text>
      <View style={s.list}>
        {(state?.entitlements?.length ? state.entitlements : ['learning_hub', 'selected_resources', 'basic_tracking']).map((e: string) => (
          <Row key={e} title={e.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} />
        ))}
      </View>

      {offline ? <Text style={s.hint}>Live membership status will appear once the account backend is connected.</Text> : null}
      {state && state.paymentsConfigured === false ? <View style={s.notice}><ShieldCheck size={18} color={colors.deepTeal} /><Text style={s.noticeText}>Secure checkout opens as soon as payment processing is connected.</Text></View> : null}
      <Pressable style={s.cta} onPress={() => navigation.navigate(active ? 'Packages' : 'FreePremium')}><Text style={s.ctaText}>{active ? 'Compare Packages' : 'Upgrade Membership'}</Text></Pressable>
    </Page>
  );
}

export function MaureenProfileScreen({ navigation }: any) {
  const credentials = ['Registered Dietitian (RD)', 'Medical Nutrition Therapy', '23+ years of clinical experience', 'Evidence-based, non-restrictive approach'];
  const philosophy = [
    'Food is information, not a moral test.',
    'Context matters more than rules.',
    'Small, consistent changes beat perfect plans.',
    'Education builds confidence that lasts.',
  ];
  return (
    <Page navigation={navigation}>
      <Head eyebrow="YOUR DIETITIAN" title="Meet Maureen." copy="A Registered Dietitian with more than 23 years of experience helping people understand nutrition without fear, confusion, or unnecessary restriction." />

      <View style={s.card}>
        <Sparkles size={22} color={colors.green} />
        <Text style={[s.itemSub, { marginTop: 10 }]}>Maureen has guided thousands of people through real nutrition decisions — from everyday meals to complex health conditions — always grounded in evidence and respect for the person in front of her.</Text>
      </View>

      <Text style={s.section}>Credentials & expertise</Text>
      <View style={s.list}>{credentials.map((c) => <View key={c} style={s.checkRow}><GraduationCap size={18} color={colors.green} /><Text style={s.checkText}>{c}</Text></View>)}</View>

      <Text style={s.section}>My philosophy</Text>
      <View style={s.list}>{philosophy.map((p) => <View key={p} style={s.checkRow}><HeartHandshake size={18} color={colors.deepTeal} /><Text style={s.checkText}>{p}</Text></View>)}</View>

      <Pressable style={s.cta} onPress={() => navigation.navigate('Dietitian')}><Text style={s.ctaText}>Ask the Dietitian</Text></Pressable>
    </Page>
  );
}

export function SavedContentScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await loadSavedContent();
        if (active) setItems(r);
      } catch (e) { if (active) setOffline(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  const paramsFor = (item: any) => {
    switch (item.route) {
      case 'Article': return { articleId: item.id, title: item.title };
      case 'MythDetail': return { mythId: String(item.id).replace(/^myth-/, ''), claim: item.title };
      case 'RecipeDetail': return { recipeId: String(item.id).replace(/^recipe-/, ''), title: item.title };
      case 'ResourceDetail': return { title: item.title };
      case 'WebinarDetail': return { title: item.title };
      case 'PodcastDetail': return { title: item.title };
      default: return undefined;
    }
  };
  const remove = async (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    try { await unsaveContent(id); } catch (e) { /* keep optimistic removal */ }
  };
  return (
    <Page navigation={navigation}>
      <Head eyebrow="SAVED CONTENT" title="Your library." copy="Keep recipes, articles, resources, classes, and episodes you want to revisit." />
      {loading ? <Text style={s.hint}>Loading your library…</Text> : null}
      {!loading && items.length === 0 ? (
        <View style={s.empty}><FileText size={30} color={colors.muted} /><Text style={s.emptyTitle}>Nothing saved yet</Text><Text style={s.emptyCopy}>Tap the save action on any article, recipe, or resource and it will appear here.</Text></View>
      ) : (
        <View style={s.list}>
          {items.map((item) => (
            <View key={item.id} style={s.item}>
              <Pressable style={s.itemCopy} onPress={() => item.route && navigation.navigate(item.route, paramsFor(item))}>
                <Text style={s.itemTitle}>{item.title}</Text>
                <Text style={s.itemSub}>{item.subtitle}</Text>
              </Pressable>
              <Pressable onPress={() => remove(item.id)} hitSlop={8} accessibilityLabel={`Remove ${item.title}`}><Trash2 size={18} color={colors.red} /></Pressable>
            </View>
          ))}
        </View>
      )}
      {offline ? <Text style={s.hint}>Connect your account to sync saved content across devices.</Text> : null}
    </Page>
  );
}

export function ProfileHubScreen({ navigation }: any) {
  const { user, signOutUser } = useAuth();
  const name = user?.name || 'Guest';
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
  const go = (route: string) => navigation.navigate(route);
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
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.profileHeader}>
          <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
          <Text style={s.name}>{name}</Text>
          <Text style={s.email}>{email}</Text>
        </View>
        {!user ? (
          <>
            <Pressable style={s.cta} onPress={() => go('Login')}><Text style={s.ctaText}>Sign In</Text></Pressable>
            <Pressable style={s.ctaGhost} onPress={() => go('CreateAccount')}><Text style={s.ctaGhostText}>Create Account</Text></Pressable>
          </>
        ) : null}
        <Text style={s.section}>Your account</Text>
        <View style={s.list}>
          <Row title="Nutrition Profile" subtitle="Goals, preferences, and allergy considerations" onPress={() => go('NutritionProfileSettings')} />
          <Row title="Saved Content" subtitle="Your saved education and tools" onPress={() => go('SavedContent')} />
          <Row title="Membership" subtitle="Manage your plan, access, and renewals" onPress={() => go('Subscription')} />
        </View>
        <Text style={s.section}>Support & learning</Text>
        <View style={s.list}>
          <Row title="Meet Maureen" subtitle="Credentials, expertise, and philosophy" onPress={() => go('MaureenProfile')} />
          <Row title="Packages & Services" subtitle="Explore memberships and nutrition support" onPress={() => go('Packages')} />
          <Row title="Help & Support" subtitle="Contact True Diet" onPress={() => go('Support')} />
        </View>
        <Text style={s.section}>Privacy & settings</Text>
        <View style={s.list}>
          <Row title="Settings" subtitle="Notifications, accessibility, and account" onPress={() => go('Settings')} />
          <Row title="Privacy & Data Controls" subtitle="Consent and personal data options" onPress={() => go('Privacy')} />
          <Row title="Legal" subtitle="Terms, Privacy Policy, and Disclaimers" onPress={() => go('Legal')} />
        </View>
        {user ? (
          <Pressable style={s.signOutBtn} onPress={signOut}><LogOut size={18} color={colors.red} /><Text style={s.signOutText}>Sign Out</Text></Pressable>
        ) : null}
        <Text style={s.version}>True Diet · Education, not medical advice</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },  content: { width: '100%', maxWidth: 412, padding: 24, paddingBottom: 48, backgroundColor: colors.background },
  back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 25 },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 30, lineHeight: 38, fontWeight: '700', color: colors.text, marginTop: 8 },
  copy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginTop: 9 },
  section: { fontFamily: 'Roboto', fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 26, marginBottom: 12 },
  hint: { fontFamily: 'Roboto', fontSize: 13, color: colors.muted, marginTop: 14 },
  list: { marginTop: 4, gap: 11 },
  item: { minHeight: 78, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, padding: 14, flexDirection: 'row', alignItems: 'center' },
  itemCopy: { flex: 1 },
  itemTitle: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text },
  itemSub: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 4 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, padding: 16, marginTop: 6, gap: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.deepTeal, borderColor: colors.deepTeal },
  chipText: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  fieldRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  field: { flex: 1 },
  label: { fontFamily: 'Roboto', fontSize: 11, fontWeight: '700', color: colors.muted, marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, paddingHorizontal: 12, fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  addRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  addInput: { flex: 1 },
  addBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.softGreen },
  tagText: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '600', color: colors.deepTeal },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.softBlue, borderRadius: 16, padding: 14, marginTop: 22 },
  noticeText: { flex: 1, fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.deepTeal },
  saved: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.green, marginTop: 14, textAlign: 'center' },
  cta: { height: 56, borderRadius: 17, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff' },
  ctaGhost: { height: 52, borderRadius: 17, borderWidth: 1, borderColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  ctaGhostText: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.deepTeal },
  signOut: { gap: 0 },
  package: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, padding: 16 },
  packageTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  packageName: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text, flex: 1, marginRight: 10 },
  packagePrice: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.deepTeal },
  packageFeature: { fontFamily: 'Roboto', fontSize: 12.5, color: colors.textSecondary, marginTop: 6 },
  packageLink: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.deepTeal, marginTop: 12 },
  priceCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.softBlue, padding: 18, marginTop: 8, alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: colors.softBlue },
  pillActive: { backgroundColor: colors.softGreen },
  pillText: { fontFamily: 'Roboto', fontSize: 11, fontWeight: '700', color: colors.deepTeal },
  pillTextActive: { color: colors.green },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 4 },
  checkText: { flex: 1, fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 6 },
  emptyCopy: { fontFamily: 'Roboto', fontSize: 13, lineHeight: 19, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 },
  profileHeader: { alignItems: 'center', marginTop: 8, marginBottom: 4 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.softGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { fontFamily: 'Roboto', fontSize: 30, fontWeight: '700', color: colors.deepTeal },
  name: { fontFamily: 'Roboto', fontSize: 24, fontWeight: '700', color: colors.text },
  email: { fontFamily: 'Roboto', fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  signOutBtn: { height: 52, borderRadius: 17, borderWidth: 1, borderColor: colors.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  signOutText: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.red },
  version: { fontFamily: 'Roboto', fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 24 },
});
