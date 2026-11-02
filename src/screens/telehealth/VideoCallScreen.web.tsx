import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, ShieldCheck, TriangleAlert, Video } from 'lucide-react-native';
import { colors } from '../../theme/colors';

/**
 * Web build of the video visit screen.
 *
 * The native screen renders Stream's CallContent, which depends on
 * @stream-io/react-native-webrtc - a native-only module with no web build.
 * Metro resolves imports for every platform at build time, so importing the
 * native screen here would break the entire web bundle. This `.web.tsx` file
 * keeps the web preview working and explains the limitation instead.
 */
export default function VideoCallScreen({ navigation, route }: any) {
  const slot: string | undefined = route?.params?.slot;
  const meetingUrl: string | undefined = route?.params?.meetingUrl;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>
        <View style={s.header}>
          <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          <View style={s.headerCopy}>
            <Text style={s.eyebrow}>VIDEO VISIT</Text>
            <Text style={s.title}>{slot || 'Your nutrition visit'}</Text>
          </View>
        </View>

        <View style={s.card}>
          <TriangleAlert size={28} color={colors.orange} />
          <Text style={s.cardTitle}>Video calls need the full app build</Text>
          <Text style={s.cardCopy}>
            The in-app video room uses native WebRTC, which the browser preview cannot load. Open True Diet on
            your phone or tablet to join the visit in the app.
          </Text>
          {meetingUrl ? (
            <Pressable
              style={s.secondary}
              onPress={() => {
                try {
                  window.open(meetingUrl, '_blank');
                } catch {
                  /* ignore */
                }
              }}
            >
              <Text style={s.secondaryText}>Open meeting link</Text>
            </Pressable>
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
  secondary: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
