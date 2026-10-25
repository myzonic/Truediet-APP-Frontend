import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { TriangleAlert, ArrowLeft, ShieldCheck, Video } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { createStreamCall } from '../../lib/stream';

type StreamSdk = typeof import('@stream-io/video-react-native-sdk');

/**
 * The Stream SDK ships native WebRTC modules, so importing it eagerly would
 * crash the whole app inside Expo Go (where the native module is absent).
 * Loading it lazily lets the rest of the app run and this screen degrade to a
 * clear "needs a development build" message instead.
 */
async function loadStreamSdk(): Promise<StreamSdk | null> {
  try {
    return await import('@stream-io/video-react-native-sdk');
  } catch {
    return null;
  }
}

type Phase = 'connecting' | 'live' | 'error' | 'unsupported';

type Session = {
  client: any;
  call: any;
  StreamVideo: any;
  StreamCall: any;
  CallContent: any;
};

export default function VideoCallScreen({ navigation, route }: any) {
  const callId: string | undefined = route?.params?.callId;
  const slot: string | undefined = route?.params?.slot;
  const meetingUrl: string | undefined = route?.params?.meetingUrl;

  const [phase, setPhase] = useState<Phase>('connecting');
  const [error, setError] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const callRef = useRef<any>(null);
  const aliveRef = useRef(true);

  const release = useCallback(() => {
    const call = callRef.current;
    callRef.current = null;
    if (call) {
      Promise.resolve(call.leave()).catch(() => undefined);
    }
  }, []);

  const connect = useCallback(async () => {
    setPhase('connecting');
    setError('');

    const sdk = await loadStreamSdk();
    if (!aliveRef.current) return;
    if (!sdk) {
      setPhase('unsupported');
      return;
    }

    try {
      const res = await createStreamCall({ callId, callType: 'default', callMode: 'video' });
      if (!aliveRef.current) return;
      if (!res?.apiKey || !res?.token || !res?.callId) {
        throw new Error('The video service is not configured on the server yet.');
      }

      const client = sdk.StreamVideoClient.getOrCreateInstance({
        apiKey: res.apiKey,
        user: { id: res.userId },
        token: res.token,
      });
      // Re-joining with the same callId rejoins the same room, so an existing
      // appointment always lands back in the scheduled visit.
      const call = client.call(res.callType || 'default', res.callId);
      await call.join({ create: true });

      if (!aliveRef.current) {
        Promise.resolve(call.leave()).catch(() => undefined);
        return;
      }

      callRef.current = call;
      setSession({
        client,
        call,
        StreamVideo: sdk.StreamVideo,
        StreamCall: sdk.StreamCall,
        CallContent: sdk.CallContent,
      });
      setPhase('live');
    } catch (e: any) {
      if (!aliveRef.current) return;
      setError(e?.message || 'Could not connect to the video visit. Please try again.');
      setPhase('error');
    }
  }, [callId]);

  useEffect(() => {
    aliveRef.current = true;
    void connect();
    return () => {
      aliveRef.current = false;
      release();
    };
  }, [connect, release]);

  const openMeetingUrl = () => {
    if (!meetingUrl) return;
    Linking.openURL(meetingUrl).catch(() =>
      Alert.alert('Unable to Open Link', 'Could not launch the meeting link on this device.'),
    );
  };

  const handleHangup = () => {
    // Content's hangup button already leaves the call; avoid leaving twice.
    callRef.current = null;
    navigation.goBack();
  };

  const close = () => {
    release();
    navigation.goBack();
  };

  if (phase === 'live' && session) {
    const { StreamVideo, StreamCall, CallContent, client, call } = session;
    return (
      <View style={s.live}>
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent onHangupCallHandler={handleHangup} />
          </StreamCall>
        </StreamVideo>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>
        <View style={s.header}>
          <Pressable style={s.back} onPress={close} accessibilityLabel="Leave video visit">
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          <View style={s.headerCopy}>
            <Text style={s.eyebrow}>VIDEO VISIT</Text>
            <Text style={s.title}>{slot || 'Your nutrition visit'}</Text>
          </View>
        </View>

        <View style={s.card}>
          {phase === 'connecting' ? (
            <>
              <Video size={26} color={colors.deepTeal} />
              <ActivityIndicator color={colors.deepTeal} style={s.spinner} />
              <Text style={s.cardTitle}>Connecting to your visit…</Text>
              <Text style={s.cardCopy}>Setting up a secure video room with Maureen, RD.</Text>
            </>
          ) : null}

          {phase === 'unsupported' ? (
            <>
              <TriangleAlert size={28} color={colors.orange} />
              <Text style={s.cardTitle}>Video needs the full app build</Text>
              <Text style={s.cardCopy}>
                The live room uses native WebRTC, which Expo Go cannot load. Open True Diet in a development
                build to join in the app.
              </Text>
              {meetingUrl ? (
                <Pressable style={s.secondary} onPress={openMeetingUrl}>
                  <Text style={s.secondaryText}>Open meeting link</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}

          {phase === 'error' ? (
            <>
              <TriangleAlert size={28} color={colors.red} />
              <Text style={s.cardTitle}>Could not join the video visit</Text>
              <Text style={s.cardCopy}>{error}</Text>
              <Pressable style={s.primary} onPress={() => void connect()}>
                <Text style={s.primaryText}>Try again</Text>
              </Pressable>
              {meetingUrl ? (
                <Pressable style={s.secondary} onPress={openMeetingUrl}>
                  <Text style={s.secondaryText}>Open meeting link</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>

        <View style={s.note}>
          <ShieldCheck size={18} color={colors.deepTeal} />
          <Text style={s.noteText}>This room is private to you and your dietitian.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  live: { flex: 1, backgroundColor: '#000000' },
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  content: { width: '100%', maxWidth: 412, flex: 1, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, marginLeft: 14 },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 4 },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 24,
    marginTop: 24,
  },
  spinner: { marginTop: 14 },
  cardTitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 14,
    textAlign: 'center',
  },
  cardCopy: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  primary: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 28,
    backgroundColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff' },
  secondary: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryText: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.deepTeal },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.softBlue,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },
  noteText: { flex: 1, fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.textSecondary },
});
