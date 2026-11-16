import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../theme/layout';
import { ArrowLeft, Check, CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { signIn, signUp, signInWithGoogle, requestPasswordReset, sendVerificationEmail } from '../lib/auth-service';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { saveProfile } from '../lib/profile';
import { API_BASE_URL } from '../lib/api-client';

function friendlyAuthError(message?: string): string {
  const m = (message || '').toLowerCase();
  if (!m) return 'Something went wrong — please try again.';
  if (m.includes('invalid email or password') || m.includes('invalid_credentials'))
    return 'Email or password is incorrect.';
  if (m.includes('already exists') || m.includes('user_exists'))
    return 'An account with this email already exists — switch to Sign In.';
  if (m.includes('not verified'))
    return 'Confirm your email first — you can resend the link below.';
  if (m.includes('rate') || m.includes('too many') || m.includes('429'))
    return 'Too many attempts — wait a minute and try again.';
  if (m.includes('fetch') || m.includes('network') || m.includes('load failed'))
    return 'Could not reach the server — check your connection and try again.';
  return message as string;
}

export default function AccountSetupScreen({ navigation, route }: any) {
  const [mode, setMode] = useState<'signup' | 'signin'>(
    route?.params?.mode === 'signin' ? 'signin' : 'signup'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingVerify, setPendingVerify] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyCooldown, setVerifyCooldown] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(false);
  const [serverFlags, setServerFlags] = useState<{ emailVerification: boolean; google: boolean }>({
    emailVerification: false,
    google: true,
  });
  const { refetchSession } = useAuth();
  const { data } = useOnboarding();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        const j = await res.json();
        if (active) {
          setServerFlags({
            emailVerification: !!j.emailVerificationEnabled,
            google: j.googleSignInEnabled !== undefined ? !!j.googleSignInEnabled : true,
          });
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isSignUp = mode === 'signup';
  const passwordsMatch = !isSignUp || !confirmPassword || password === confirmPassword;
  const ready =
    email.trim().includes('@') &&
    password.length >= 8 &&
    (!isSignUp || (name.trim().length > 1 && password === confirmPassword && acceptedTerms));

  /** Shared tail of every successful sign-in path. */
  const finishAccount = async () => {
    await refetchSession();
    const hasAssessment =
      Boolean(data.goal) ||
      Boolean(data.age) ||
      Boolean(data.sex) ||
      Boolean(data.height) ||
      Boolean(data.weight) ||
      (data.allergies?.length ?? 0) > 0 ||
      (data.dietaryPreferences?.length ?? 0) > 0;
    if (!hasAssessment) {
      const root = navigation.getParent?.('Root') || navigation.getParent?.();
      if (root?.replace) {
        root.replace('Main');
      } else {
        navigation.navigate('NutritionProfile');
      }
      return true;
    }
    try {
      await saveProfile(data);
    } catch (e: any) {
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
    if (loading || pendingVerify) return;
    if (isSignUp && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!ready) return;
    setLoading(true);
    setErrorMessage('');

    try {
      if (isSignUp) {
        const res = await signUp(name.trim(), email.trim().toLowerCase(), password);
        if (serverFlags.emailVerification || res.verificationEmailSent) {
          setPendingVerify(email.trim().toLowerCase());
          return;
        }
        await finishAccount();
      } else {
        await signIn(email.trim().toLowerCase(), password);
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
      const res = await requestPasswordReset(em);
      if (!res?.success && !res?.status) {
        setErrorMessage('Could not reach the server — try again.');
      } else {
        setResetMsg(
          `If an account exists for ${em}, a reset link is on its way (valid 1 hour). Check your spam folder too.`
        );
        setResetCooldown(true);
        setTimeout(() => setResetCooldown(false), 60000);
      }
    } catch (e: any) {
      setErrorMessage(friendlyAuthError(e?.message) || 'Could not reach the server — try again.');
    } finally {
      setResetBusy(false);
    }
  };

  const resendVerification = async () => {
    if (!pendingVerify || verifyBusy || verifyCooldown) return;
    setVerifyBusy(true);
    setVerifyMsg('');
    try {
      const res = await sendVerificationEmail(pendingVerify, '/verify-email');
      if (res?.alreadyVerified) {
        setVerifyMsg('This email is already verified! Tap Continue below.');
      } else if (res?.success || res?.status) {
        setVerifyMsg('Sent again — open the link in that email to verify your account.');
        setVerifyCooldown(true);
        setTimeout(() => setVerifyCooldown(false), 60000);
      } else {
        setVerifyMsg('Could not send verification email — try again.');
      }
    } catch (e: any) {
      setVerifyMsg(friendlyAuthError(e?.message));
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
      const result = await signInWithGoogle();
      if (result.cancelled) return;
      if (result.user) {
        await finishAccount();
      } else {
        setErrorMessage('Google sign-in did not complete — please try again.');
      }
    } catch (e: any) {
      setErrorMessage(friendlyAuthError(e?.message));
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
          <View style={s.content}>
            <Image
              source={require('../../assets/truediet-logo.png')}
              style={s.logo}
              resizeMode="contain"
            />

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
                  style={[s.verifyPrimaryButton, loading && s.disabled]}
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
                  style={[s.verifySecondaryButton, (verifyBusy || verifyCooldown) && s.verifySecondaryDisabled]}
                  disabled={verifyBusy || verifyCooldown}
                  onPress={resendVerification}
                >
                  <Text style={s.verifySecondaryText}>
                    {verifyBusy
                      ? 'Sending…'
                      : verifyCooldown
                        ? 'Resend available in a minute'
                        : 'Resend confirmation email'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setPendingVerify(null);
                    setVerifyMsg('');
                    setErrorMessage('');
                  }}
                  hitSlop={10}
                  style={s.verifyBackLink}
                >
                  <Text style={s.skip}>Back to form</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.formSection}>
                {isSignUp && (
                  <View style={s.nameField}>
                    <Text style={s.label}>Full name</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Your name"
                      placeholderTextColor={colors.muted}
                      style={s.input}
                    />
                  </View>
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
                <View style={s.passwordRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                    style={s.passwordInput}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    style={s.eyeButton}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={19} color={colors.muted} />
                    ) : (
                      <Eye size={19} color={colors.muted} />
                    )}
                  </Pressable>
                </View>

                {isSignUp ? (
                  <>
                    <Text style={s.label}>Confirm password</Text>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Repeat password"
                      placeholderTextColor={colors.muted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={[s.input, !passwordsMatch && { borderColor: colors.red }]}
                    />
                    {!passwordsMatch ? (
                      <Text style={s.mismatchText}>Passwords do not match.</Text>
                    ) : null}

                    <Pressable
                      style={s.termsRow}
                      onPress={() => setAcceptedTerms((v) => !v)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: acceptedTerms }}
                    >
                      <View style={[s.checkbox, acceptedTerms && s.checkboxOn]}>
                        {acceptedTerms ? <Check size={14} color="#fff" /> : null}
                      </View>
                      <Text style={s.termsText}>
                        I agree to True Diet’s Terms of Use and Privacy Policy (educational guidance, not medical advice).
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable onPress={onForgotPassword} disabled={resetBusy} hitSlop={8} style={s.forgotRow}>
                    <Text style={[s.forgotText, resetCooldown && s.forgotSent]}>
                      {resetBusy
                        ? 'Sending reset…'
                        : resetCooldown
                          ? 'Reset link sent ✓'
                          : 'Forgot password?'}
                    </Text>
                  </Pressable>
                )}

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

                {serverFlags.google ? (
                  <View style={s.googleContainer}>
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
                        {loading
                          ? 'Opening Google…'
                          : isSignUp
                            ? 'Sign up with Google'
                            : 'Continue with Google'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                <Pressable onPress={() => navigation.navigate('NutritionProfile')} hitSlop={10}>
                  <Text style={s.skip}>Skip for now</Text>
                </Pressable>
              </View>
            )}
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
  content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', flex: 1, padding: 24, paddingTop: 16 },
  logo: { width: 92, height: 92, marginBottom: 6, resizeMode: 'contain' },
  formSection: { width: '100%', alignSelf: 'stretch' },
  nameField: { width: '100%', marginBottom: 2 },
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
  verifyPrimaryButton: {
    height: 54,
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.deepTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  verifySecondaryButton: {
    height: 50,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.deepTeal,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  verifySecondaryDisabled: {
    opacity: 0.55,
  },
  verifySecondaryText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '700',
    color: colors.deepTeal,
  },
  verifyBackLink: {
    marginTop: 4,
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
  mismatchText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.red,
    marginTop: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: colors.deepTeal,
  },
  termsText: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
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
  passwordRow: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingLeft: 15,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text,
  },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  googleContainer: {
    marginTop: 14,
  },
});
