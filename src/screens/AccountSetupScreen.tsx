import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeft, CheckCircle2, LockKeyhole } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { authClient } from '../lib/auth-client';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { saveProfile } from '../lib/profile';

export default function AccountSetupScreen({ navigation }: any) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { refetchSession } = useAuth();
  const { data } = useOnboarding();

  const isSignUp = mode === 'signup';
  const ready =
    email.includes('@') &&
    password.length >= 8 &&
    (!isSignUp || name.trim().length > 1);

  const handleSubmit = async () => {
    if (!ready || loading) return;
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
          setErrorMessage(result.error.message || 'Failed to create account.');
          Alert.alert('Sign Up Error', result.error.message || 'Failed to create account.');
          setLoading(false);
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
        });

        if (result.error) {
          setErrorMessage(result.error.message || 'Invalid email or password.');
          Alert.alert('Sign In Error', result.error.message || 'Invalid credentials.');
          setLoading(false);
          return;
        }
      }

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
        setLoading(false);
        return;
      }
      navigation.navigate('NutritionProfile');
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please check your backend connection.';
      setErrorMessage(msg);
      Alert.alert('Connection Error', msg);
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

              <Pressable onPress={() => navigation.navigate('NutritionProfile')} hitSlop={10}>
                <Text style={s.skip}>Skip for now</Text>
              </Pressable>
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
    maxWidth: 412,
    backgroundColor: colors.background,
    minHeight: '100%',
  },
  logo: {
    width: 96,
    height: 42,
    alignSelf: 'center',
    marginTop: 14,
  },
  content: {
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
