import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../theme/layout';
import { ArrowLeft, CheckCircle2, LockKeyhole } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { authClient } from '../lib/auth-client';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { saveProfile } from '../lib/profile';
import { API_BASE_URL } from '../lib/api-client';

/** Better Auth messages are technical; members see this instead. */
function friendlyAuthError(message?: string): string {
  const m = (message || '').toLowerCase();
  if (!m) return 'Something went wrong — please try again.';
  if (m.includes('invalid email or password') || m.includes('invalid credentials'))
    return 'Email or password is incorrect.';
  if (m.includes('already exists') || m.includes('taken'))
    return 'An account with this email already exists — switch to Sign In.';
  if (m.includes('not verified'))
    return 'Confirm your email first — you can resend the link below.';
  if (m.includes('rate') || m.includes('too many') || m.includes('429'))
    return 'Too many attempts — wait a minute and try again.';
  if (m.includes('fetch') || m.includes('network') || m.includes('load failed'))
    return 'Could not reach the server — check your connection and try again.';
  if (m.includes('disabled')) return 'This sign-in option is not enabled on the server yet.';
  return message as string;
}

export default function AccountSetupScreen({ navigation, route }: any) {
  const [mode, setMode] = useState<'signup' | 'signin'>(
    route?.params?.mode === 'signin' ? 'signin' : 'signup'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Email-verification step shown after sign-up when the server sends the
  // confirmation email (flagged by /health, never guessed locally).
  const [pendingVerify, setPendingVerify] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyCooldown, setVerifyCooldown] = useState(false);
  // Forgot-password acknowledgement with a resend cooldown (the endpoint is
  // rate limited to 3 requests per minute).
  const [resetMsg, setResetMsg] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(false);
  const [serverFlags, setServerFlags] = useState<{ emailVerification: boolean; google: boolean }>({
    emailVerification: false,
    google: false,
  });
  const { refetchSession } = useAuth();
  const { data } = useOnboarding();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const base = API_BASE_URL;
        const res = await fetch(`${base}/health`);
        const j = await res.json();
        if (active) {
          setServerFlags({
            emailVerification: !!j.emailVerificationEnabled,
            google: !!j.googleSignInEnabled,
          });
        }
      } catch {
        // flags stay off - the flows behave exactly as before
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isSignUp = mode === 'signup';
  const ready =
    email.includes('@') &&
    password.length >= 8 &&
    (!isSignUp || name.trim().length > 1);

  /** Shared tail of every successful sign-in path. */
  const finishAccount = async () => {
    await refetchSession();
    try {
      await saveProfile(data);
    } catch (e: any) {
      // The account exists but the nutrition profile did not reach the
      // server. The user has to be told so they can retry rather than
      // believe the assessment was stored.
      setErrorMessage(
        e?.message ||
          'Your account was created, but your nutrition profile could not be saved. Please sign in and save it again.'
      );
      return false;
    }
    navigation.navigate('NutritionProfile');
    return true;
  };

  const handleSubmit = async () => {
    if (!ready || loading || pendingVerify) return;
    setLoading(true);
    setErrorMessage('');

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        if (result.error) {
          setErrorMessage(friendlyAuthError(result.error.message));
          return;
        }

        // Server sends a confirmation email: pause on an explicit
        // "check your inbox" step with resend, then continue on demand.
        if (serverFlags.emailVerification) {
          setPendingVerify(email.trim().toLowerCase());
          return;
        }
        await finishAccount();
      } else {
        const result = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
        });

        if (result.error) {
          setErrorMessage(friendlyAuthError(result.error.message));
          return;
        }
        await finishAccount();
      }
    } catch (err: any) {
      setErrorMessage(friendlyAuthError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async () => {
    const em = email.trim().toLowerCase();
    if (!em.includes('@')) {
      setErrorMessage('Enter your email address above first, then tap Forgot password.');
      return;
    }
    if (resetBusy || resetCooldown) return;
    setResetBusy(true);
    setErrorMessage('');
    setResetMsg('');
    try {
      const res = await authClient.requestPasswordReset({ email: em, redirectTo: '/reset' });
      if (res.error) {
        setErrorMessage(friendlyAuthError(res.error.message));
      } else {
        setResetMsg(
          `If an account exists for ${em}, a reset link is on its way (valid 1 hour). Check your spam folder too.`
        );
        setResetCooldown(true);
        setTimeout(() => setResetCooldown(false), 60000);
      }
    } catch {
      setErrorMessage('Could not reach the server — try again.');
    } finally {
      setResetBusy(false);
    }
  };

  const resendVerification = async () => {
    if (!pendingVerify || verifyBusy || verifyCooldown) return;
    setVerifyBusy(true);
    setVerifyMsg('');
    try {
      const res = await authClient.sendVerificationEmail({
        email: pendingVerify,
        callbackURL: '/verify-email',
      });
      if (res.error) {
        setVerifyMsg(friendlyAuthError(res.error.message));
      } else {
        setVerifyMsg('Sent again — open the link in that email to verify your account.');
        setVerifyCooldown(true);
        setTimeout(() => setVerifyCooldown(false), 60000);
      }
    } catch {
      setVerifyMsg('Could not reach the server — try again.');
    } finally {
      setVerifyBusy(false);
    }
  };

  const continueAfterVerify = async () => {
    setPendingVerify(null);
    setLoading(true);
    try {
      await finishAccount();
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    if (loading) return;
    setErrorMessage('');
    setLoading(true);
    try {
      // The @better-auth/expo client intercepts this call: it opens the
      // browser itself through the backend's expo-authorization-proxy and
      // stores the returned session cookie in SecureStore. Opening a browser
      // here as well would launch a second, proxy-less flow.
      const res: any = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
      if (res?.error) {
        setErrorMessage(friendlyAuthError(res.error.message));
        return;
      }
      // The browser flow has finished by the time the call resolves; pick up
      // whatever session it created. A closed browser simply lands here with
      // no session and no error.
      const after = await (authClient as any).getSession({});
      if (after?.data?.session) {
        await finishAccount();
      }
    } catch {
      setErrorMessage('Google sign-in could not start — try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%', alignItems: 'center' }}
      >
        <ScrollView
          contentContainerStyle={s.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.phone}>
            <Image
              source={require('../../assets/truediet-logo.png')}
              style={s.logo}
              resizeMode="contain"
            />

            <View style={s.content}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={s.backButton}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <ArrowLeft size={20} color={colors.deepTeal} />
                <Text style={s.backText}>Back</Text>
              </Pressable>
              <View style={s.tabContainer}>
                <Pressable
                  onPress={() => {
                    setMode('signup');
                    setErrorMessage('');
                  }}
                  style={[s.tab, isSignUp && s.activeTab]}
                >
                  <Text style={[s.tabText, isSignUp && s.activeTabText]}>Create Account</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setMode('signin');
                    setErrorMessage('');
                  }}
                  style={[s.tab, !isSignUp && s.activeTab]}
                >
                  <Text style={[s.tabText, !isSignUp && s.activeTabText]}>Sign In</Text>
                </Pressable>
              </View>

              <Text style={s.eyebrow}>
                {isSignUp ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
              </Text>
              <Text style={s.title}>
                {isSignUp ? 'Save your personalized plan.' : 'Access your True Diet profile.'}
              </Text>
              <Text style={s.copy}>
                {isSignUp
                  ? 'Create your secure True Diet account to keep your learning, preferences, and progress in one place.'
                  : 'Log in with your existing account to sync your nutrition goals.'}
              </Text>

              {errorMessage ? (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {resetMsg ? (
                <View style={s.successBox}>
                  <Text style={s.successText}>{resetMsg}</Text>
                </View>
              ) : null}

              {pendingVerify ? (
                <View style={s.verifyBox}>
                  <CheckCircle2 size={34} color={colors.green} />
                  <Text style={s.verifyTitle}>Confirm your email</Text>
                  <Text style={s.verifyText}>
                    We sent a verification link to{' '}
                    <Text style={s.verifyEmail}>{pendingVerify}</Text>. Open it to
                    verify your account — check spam if you don't see it.
                  </Text>
                  {verifyMsg ? <Text style={s.verifyMsg}>{verifyMsg}</Text> : null}
                  <Pressable
                    style={[s.button, (verifyBusy || verifyCooldown) && s.disabled]}
                    disabled={verifyBusy || verifyCooldown}
                    onPress={resendVerification}
                  >
                    <Text style={s.buttonText}>
                      {verifyBusy
                        ? 'Sending…'
                        : verifyCooldown
                          ? 'Link sent — try again in a minute'
                          : 'Resend email'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[s.button, s.continueButton]}
                    disabled={loading}
                    onPress={continueAfterVerify}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={s.buttonText}>Continue</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setPendingVerify(null);
                      setVerifyMsg('');
                      setErrorMessage('');
                    }}
                    hitSlop={10}
                  >
                    <Text style={s.skip}>Back to form</Text>
                  </Pressable>
                </View>
              ) : (
                <>
              {isSignUp && (
                <>
                  <Text style={s.label}>Full name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={colors.muted}
                    style={s.input}
                  />
                </>
              )}

              <Text style={s.label}>Email address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                style={s.input}
              />

              <Text style={s.label}>Password (minimum 8 characters)</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                autoCapitalize="none"
                style={s.input}
              />

              {!isSignUp ? (
                <Pressable onPress={onForgotPassword} disabled={resetBusy} hitSlop={8} style={s.forgotRow}>
                  <Text style={[s.forgotText, resetCooldown && s.forgotSent]}>
                    {resetBusy
                      ? 'Sending reset link…'
                      : resetCooldown
                        ? 'Reset link sent ✓'
                        : 'Forgot password?'}
                  </Text>
                </Pressable>
              ) : null}

              <View style={s.trust}>
                <LockKeyhole size={18} color={colors.deepTeal} />
                <Text style={s.trustText}>
                  Your authentication credentials and personal data are safely encrypted and secured.
                </Text>
              </View>

              {isSignUp && (
                <View style={s.benefits}>
                  {[
                    'Save your personalized nutrition profile',
                    'Keep your learning and tools together',
                    'Update your preferences any time',
                  ].map((item) => (
                    <View key={item} style={s.benefit}>
                      <CheckCircle2 size={18} color={colors.green} />
                      <Text style={s.benefitText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Pressable
                disabled={!ready || loading}
                onPress={handleSubmit}
                style={[s.button, (!ready || loading) && s.disabled]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.buttonText}>
                    {isSignUp ? 'Continue to My Profile' : 'Sign In & Continue'}
                  </Text>
                )}
              </Pressable>

              {!isSignUp && serverFlags.google ? (
                <>
                  <View style={s.divider}>
                    <View style={s.dividerLine} />
                    <Text style={s.dividerText}>or</Text>
                    <View style={s.dividerLine} />
                  </View>
                  <Pressable
                    onPress={onGoogleSignIn}
                    disabled={loading}
                    style={[s.button, s.googleButton, loading && s.disabled]}
                  >
                    <Text style={s.googleText}>
                      {loading ? 'Opening Google…' : 'Continue with Google'}
                    </Text>
                  </Pressable>
                </>
              ) : null}

              <Pressable onPress={() => navigation.navigate('NutritionProfile')} hitSlop={10}>
                <Text style={s.skip}>Skip for now</Text>
              </Pressable>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.softBlue,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    width: '100%',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth:CONTENT_MAX_WIDTH,
    backgroundColor: colors.background,
    minHeight: '100%',
  },
  logo: {
    width: 96,
    height: 42,
    alignSelf: 'center',
    marginTop: 14,
  },
  content: {maxWidth:CONTENT_MAX_WIDTH,alignSelf:'center',
    flex: 1,
    padding: 24,
    paddingTop: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    marginBottom: 10,
  },
  backText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '600',
    color: colors.deepTeal,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.softBlue,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: colors.surface,
  },
  tabText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.deepTeal,
    fontWeight: '700',
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
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontFamily: 'Roboto',
  },
  successBox: {
    backgroundColor: '#E7F6EE',
    borderWidth: 1,
    borderColor: '#BFE6CE',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  successText: {
    color: '#136C43',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Roboto',
  },
  verifyBox: {
    alignItems: 'center',
    backgroundColor: colors.softBlue,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  verifyTitle: {
    fontFamily: 'Roboto',
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  verifyText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  verifyEmail: {
    fontWeight: '700',
    color: colors.text,
  },
  verifyMsg: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#136C43',
    marginTop: 10,
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 10,
    backgroundColor: colors.green,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 2,
  },
  forgotText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '700',
    color: colors.deepTeal,
  },
  forgotSent: {
    color: '#136C43',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.muted,
  },
  googleButton: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text,
  },
  trust: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.softBlue,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    alignItems: 'center',
  },
  trustText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 18,
    color: colors.deepTeal,
    flex: 1,
  },
  benefits: {
    marginTop: 16,
    gap: 10,
  },
  benefit: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  benefitText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: colors.text,
  },
  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.deepTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  disabled: {
    backgroundColor: colors.muted,
  },
  buttonText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  skip: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.deepTeal,
    marginTop: 16,
    marginBottom: 20,
  },
});
