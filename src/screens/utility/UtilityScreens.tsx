import React,{useEffect,useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Bell, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, CircleHelp, Clock3, CreditCard, LockKeyhole, MessageSquare, Phone, ShieldCheck, Sparkles, Star, Video } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { startCheckout } from '../../lib/subscription';
import { cancelAppointment, clearAppointment, listAppointments, loadAppointment } from '../../lib/appointments';
import { disablePushNotifications, enablePushNotifications, isPushSupported, readStoredPushToken } from '../../lib/notifications';

const Shell=({navigation,children}:{navigation:any;children:React.ReactNode})=><SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}><Pressable style={s.back} onPress={()=>navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}><ArrowLeft size={22} color={colors.text}/></Pressable>{children}</ScrollView></SafeAreaView>;

const Accordion=({q,a}:{q:string;a:string})=>{const [open,setOpen]=useState(false);return <Pressable style={s.faq} onPress={()=>setOpen(!open)}><View style={s.faqHead}><Text style={s.faqQ}>{q}</Text>{open?<ChevronUp size={19} color={colors.muted}/>:<ChevronDown size={19} color={colors.muted}/>}</View>{open?<Text style={s.faqA}>{a}</Text>:null}</Pressable>;};

const faqs:[string,string][]=[
  ['How do I create an account?','Tap Create Account from the welcome screen and enter your details. Your profile and saved content stay linked to that account.'],
  ['Is True Diet medical advice?','No. True Diet provides general nutrition education. It does not diagnose, treat, or replace care from your healthcare team.'],
  ['How do I save content?','Use the Save action on any article, recipe, or resource. Saved items appear under Profile → Saved Content.'],
  ['How do I manage my membership?','Open Profile → Membership to view your access, renewal information, and available options.'],
  ['How do I delete my account?','Go to Profile → Privacy & Data Controls. Account deletion requires identity verification and removes your personal data.'],
];

export function SupportScreen({navigation}:any){
  return <Shell navigation={navigation}><Text style={s.eyebrow}>HELP & SUPPORT</Text><Text style={s.title}>How can we help?</Text><Text style={s.copy}>Find answers or contact the True Diet team for account and app support.</Text><View style={s.infoRow}><View style={s.infoIcon}><CircleHelp size={22} color={colors.deepTeal}/></View><View style={s.infoCopy}><Text style={s.infoTitle}>Frequently asked questions</Text><Text style={s.infoSub}>Account, content, membership, and app support</Text></View></View><View style={s.list}>{faqs.map(([q,a])=><Accordion key={q} q={q} a={a}/>)}</View><Pressable style={s.cta} onPress={()=>navigation.navigate('Dietitian')}><MessageSquare size={18} color="#fff"/><Text style={s.ctaText}>Contact True Diet</Text></Pressable><Text style={s.note}>For medical emergencies, contact your local emergency services. True Diet is not for urgent care.</Text></Shell>;
}

const legal=[['Terms of Use','These terms describe how you may use True Diet, including account responsibilities and acceptable use. Final wording is pending legal review.'],['Privacy Policy','This policy explains what information True Diet collects, how it is used, and the choices you have. Health-related data is processed only through approved secure services.'],['Educational Disclaimer','True Diet provides general nutrition education. It does not provide medical diagnosis, treatment, or a substitute for care from a qualified professional.'],['Data Processing','Personal and health-related information is stored on secure infrastructure, with access limited to those who need it. Data handling terms will be finalized before launch.']];

export function LegalScreen({navigation}:any){
  return <Shell navigation={navigation}><Text style={s.eyebrow}>LEGAL</Text><Text style={s.title}>Terms, privacy, and disclaimers.</Text><Text style={s.copy}>Read True Diet’s Terms of Use, Privacy Policy, educational disclaimer, and data-processing information.</Text><View style={s.banner}><ShieldCheck size={20} color={colors.orange}/><Text style={s.bannerText}>Draft — final legal copy will be supplied by True Diet and reviewed before release.</Text></View><View style={s.list}>{legal.map(([q,a])=><Accordion key={q} q={q} a={a}/>)}</View></Shell>;
}

export function NotificationsScreen({navigation}:any){
  const [busy,setBusy]=useState(false);
  const [token,setToken]=useState<string|undefined>();
  const [error,setError]=useState('');
  const [needsProject,setNeedsProject]=useState(false);
  useEffect(()=>{let active=true;readStoredPushToken().then(t=>{if(active)setToken(t?.token);}).catch(()=>undefined);return()=>{active=false;};},[]);
  const enable=async()=>{if(busy)return;setBusy(true);setError('');setNeedsProject(false);const r=await enablePushNotifications();setBusy(false);if(r.token)setToken(r.token);else{setError(r.error||'Could not enable notifications.');setNeedsProject(!!r.needsProjectId);}};
  const disable=async()=>{if(busy)return;setBusy(true);await disablePushNotifications();setToken(undefined);setError('');setBusy(false);};
  const copy=async()=>{if(!token)return;try{if(Platform.OS==='web'){await (globalThis as any).navigator?.clipboard?.writeText(token);Alert.alert('Push token','Copied to your clipboard.');}else{await Share.share({message:token});}}catch{Alert.alert('Push token',token);}};
  return <Shell navigation={navigation}>
    <Text style={s.eyebrow}>NOTIFICATIONS</Text>
    <Text style={s.title}>Stay in the loop.</Text>
    <Text style={s.copy}>Enable reminders for messages, appointments, webinars, and new education.</Text>
    <View style={s.pushCard}>
      <Text style={s.pushTitle}>{token?'Push notifications enabled':'Enable push notifications'}</Text>
      <Text style={s.pushCopy}>{token?'This device is registered. Paste the token below into Expo’s push notifications tool to send a test.':'Allow True Diet to send reminders to this device.'}</Text>
      {token?<Text selectable style={s.token}>{token}</Text>:null}
      {error?<Text style={s.pushError}>{error}</Text>:null}
      {needsProject?<Text style={s.pushHint}>Run “npx eas init” once, then rebuild the development build.</Text>:null}
      {!isPushSupported()?<Text style={s.pushHint}>Push registration requires the iOS or Android build. This web preview cannot register.</Text>:null}
      {token?<View style={s.pushBtns}><Pressable style={s.secondary} onPress={copy}><Text style={s.secondaryText}>Copy token</Text></Pressable><Pressable style={s.secondary} onPress={disable} disabled={busy}><Text style={[s.secondaryText,{color:colors.red}]}>{busy?'Removing…':'Disable'}</Text></Pressable></View>:<Pressable style={[s.cta,!isPushSupported()&&s.ctaOff]} disabled={busy||!isPushSupported()} onPress={enable}>{busy?<ActivityIndicator color="#fff"/>:<><Bell size={18} color="#fff"/><Text style={s.ctaText}>Enable Push Notifications</Text></>}</Pressable>}
    </View>
    <Text style={s.sectionLabel}>What you’ll get</Text>
    <View style={s.list}>{[['Secure messages','Replies from your dietitian'],['Appointments','Reminders and changes'],['Webinars','Upcoming live sessions'],['New content','Fresh articles and resources']].map(([title,sub])=><View key={title} style={s.infoRow}><View style={s.infoIcon}><Bell size={20} color={colors.deepTeal}/></View><View style={s.infoCopy}><Text style={s.infoTitle}>{title}</Text><Text style={s.infoSub}>{sub}</Text></View></View>)}</View>
  </Shell>;
}

const freeFeatures=['Learning hub and topics','Selected resources and articles','Basic meal and habit tracking','Myths & misinformation library'];
const premiumFeatures=['Everything in Free','Expanded article and resource library','Live and recorded classes','Podcast episodes and notes','Saved-content library'];

export function FreePremiumScreen({navigation}:any){
  return <Shell navigation={navigation}><Text style={s.eyebrow}>MEMBERSHIP</Text><Text style={s.title}>Choose your level of support.</Text><Text style={s.copy}>Start with trusted education for free, then upgrade when you want expanded tools and experiences.</Text><View style={s.tier}><View style={s.tierHead}><Text style={s.tierName}>Free</Text><Star size={18} color={colors.muted}/></View>{freeFeatures.map(f=><Text key={f} style={s.feature}>• {f}</Text>)}</View><View style={[s.tier,s.tierPremium]}><View style={s.tierHead}><Text style={s.tierName}>Premium</Text><Sparkles size={18} color={colors.green}/></View>{premiumFeatures.map(f=><Text key={f} style={s.feature}>• {f}</Text>)}<Text style={s.priceNote}>Pricing is shown at checkout once payment options are connected.</Text></View><Pressable style={s.cta} onPress={()=>navigation.navigate('Packages')}><Text style={s.ctaText}>Explore Membership Options</Text></Pressable></Shell>;
}

export function CheckoutScreen({navigation,route}:any){
  const plan=route.params?.plan;
  const [loading,setLoading]=useState(false);
  const begin=async()=>{
    if(loading)return;setLoading(true);
    try{
      const res=await startCheckout(plan?.id||'');
      if(res?.url){await Linking.openURL(res.url);}
      else{Alert.alert('Checkout unavailable','Secure checkout is not available right now. Please try again later.');}
    }catch(e:any){
      Alert.alert('Checkout unavailable',e?.message||'Secure checkout could not be started. Please try again later.');
    }finally{setLoading(false);}
  };
  return <Shell navigation={navigation}><Text style={s.eyebrow}>CHECKOUT</Text><Text style={s.title}>Complete your membership.</Text><Text style={s.copy}>Review your selection and continue to a secure checkout. Payment is handled by our payment provider — True Diet never stores your card details.</Text><View style={s.summary}><View style={s.summaryRow}><Text style={s.summaryLabel}>Plan</Text><Text style={s.summaryValue}>{plan?.name||'True Diet membership'}</Text></View>{plan?.interval?<View style={s.summaryRow}><Text style={s.summaryLabel}>Billing</Text><Text style={s.summaryValue}>{plan.interval}</Text></View>:null}<View style={[s.summaryRow,s.summaryLast]}><Text style={s.summaryLabel}>Payment</Text><Text style={s.summaryValue}>Secure provider checkout</Text></View></View><View style={s.secure}><LockKeyhole size={19} color={colors.deepTeal}/><Text style={s.secureText}>Card details are entered on the provider’s secure page, not inside the app.</Text></View><Pressable style={s.cta} onPress={begin} disabled={loading}>{loading?<ActivityIndicator color="#fff"/>:<><CreditCard size={18} color="#fff"/><Text style={s.ctaText}>Continue to Secure Checkout</Text></>}</Pressable></Shell>;
}

export function WebinarConfirmationScreen({navigation,route}:any){
  const title=route.params?.title||'Your webinar';
  return <Shell navigation={navigation}><View style={s.confirmIcon}><CheckCircle2 size={40} color={colors.green}/></View><Text style={s.eyebrow}>REGISTRATION CONFIRMED</Text><Text style={s.title}>You’re registered.</Text><Text style={s.copy}>We've saved your spot for {title}. We will remind you before it starts.</Text><View style={s.list}><View style={s.infoRow}><View style={s.infoIcon}><CalendarDays size={20} color={colors.deepTeal}/></View><View style={s.infoCopy}><Text style={s.infoTitle}>Add to calendar</Text><Text style={s.infoSub}>Calendar invites will be available soon</Text></View></View><View style={s.infoRow}><View style={s.infoIcon}><Clock3 size={20} color={colors.deepTeal}/></View><View style={s.infoCopy}><Text style={s.infoTitle}>Join link</Text><Text style={s.infoSub}>A secure link will appear before the session</Text></View></View></View><Pressable style={s.cta} onPress={()=>navigation.goBack()}><Text style={s.ctaText}>Done</Text></Pressable></Shell>;
}

export function AppointmentDetailScreen({navigation,route}:any){
  const params=route.params||{};
  const [stored,setStored]=useState<any>(null);
  const [history,setHistory]=useState<any[]>([]);
  const [busy,setBusy]=useState(false);
  const refresh=async()=>{
    try{
      const [current,list]=await Promise.all([loadAppointment(),listAppointments()]);
      setStored(current);
      setHistory((list||[]).filter((a:any)=>a.id&&a.id!==current?.id));
    }catch{}
  };
  useEffect(()=>{refresh();},[]);
  const onCancel=()=>{
    const id=stored?.id;
    if(!id||busy)return;
    Alert.alert('Cancel this visit','Your appointment will be cancelled. You can book another time from Telehealth.',[
      {text:'Keep Visit',style:'cancel'},
      {text:'Cancel Visit',style:'destructive',onPress:async()=>{
        setBusy(true);
        try{
          await cancelAppointment(id);
          await clearAppointment();
          await refresh();
          Alert.alert('Visit cancelled','Your appointment has been cancelled.');
        }catch(e:any){
          Alert.alert('Could not cancel',e?.message||'Please try again.');
        }finally{setBusy(false);}
      }},
    ]);
  };
  // Route params win, but any field they omit falls back to the appointment saved
  // at booking time — that is where the video room id lives, so joining from
  // "View appointment details" still lands in the same room.
  const savedStored=(stored&&(!params.slot||params.slot===stored.slot))?stored:null;
  const pick=(key:string)=>params[key]??savedStored?.[key];
  const slot=pick('slot')||'Tue · 10:00 AM';
  const meetingUrl=pick('meetingUrl');
  const bookingId=pick('bookingId');
  const visitType=pick('visitType')||'video';
  const isConfirmed=Boolean(bookingId);

  const join=()=>{
    if(visitType==='phone'){
      Alert.alert(
        'Phone Consultation',
        'Maureen Ashbarry, MS, RD will call you directly at your registered phone number at the scheduled time. Please ensure your device is available.'
      );
      return;
    }
    // Video visits open the Cal.com meeting link in the device browser.
    if(meetingUrl){
      Linking.openURL(meetingUrl).catch(()=>Alert.alert('Unable to Open Link','Could not launch the meeting link on your device.'));
    }else{
      Alert.alert('No meeting link','This visit does not have a meeting link yet. Please contact True Diet.');
    }
  };

  return (
    <Shell navigation={navigation}>
      <Text style={s.eyebrow}>APPOINTMENT CONFIRMATION</Text>
      <Text style={s.title}>Your nutrition visit.</Text>
      <Text style={s.copy}>
        Review your consultation details below. Your session is scheduled directly with Maureen Ashbarry, MS, RD.
      </Text>
      
      {/* Consultation Card */}
      <View style={s.infoRow}>
        <View style={s.infoIcon}>
          {visitType==='phone' ? (
            <Phone size={22} color={colors.deepTeal}/>
          ) : (
            <Video size={22} color={colors.deepTeal}/>
          )}
        </View>
        <View style={s.infoCopy}>
          <Text style={s.infoTitle}>
            {visitType==='phone' ? 'Phone Nutrition Consultation' : 'Virtual Nutrition Consultation'}
          </Text>
          <Text style={s.infoSub}>
            15 minutes · {visitType==='phone' ? 'Direct voice phone call' : 'Secure HD video visit'}
          </Text>
        </View>
      </View>

      {/* Appointment Summary */}
      <View style={s.summary}>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Scheduled Time</Text>
          <Text style={s.summaryValue}>{slot}</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Consultation Format</Text>
          <Text style={s.summaryValue}>{visitType==='phone' ? 'Phone Call' : 'Video Visit'}</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Status</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isConfirmed ? (
              <CheckCircle2 size={16} color={colors.green} />
            ) : (
              <Clock3 size={16} color={colors.muted} />
            )}
            <Text
              style={[
                s.summaryValue,
                { color: isConfirmed ? colors.green : colors.textSecondary },
              ]}
            >
              {isConfirmed ? 'Confirmed' : 'Requested'}
            </Text>
          </View>
        </View>
        <View style={[s.summaryRow,s.summaryLast]}>
          <Text style={s.summaryLabel}>Provider</Text>
          <Text style={s.summaryValue}>Maureen Ashbarry, RD</Text>
        </View>
      </View>

      {/* Preparation checklist card */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18, marginTop: 18 }}>
        <Text style={{ fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
          Before Your Visit
        </Text>
        <Text style={{ fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.textSecondary }}>
          • Have any recent food logs, labels, or questions handy.
        </Text>
        <Text style={{ fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.textSecondary, marginTop: 4 }}>
          • Choose a quiet, comfortable space with good connection.
        </Text>
        <Text style={{ fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.textSecondary, marginTop: 4 }}>
          • Feel free to message Maureen beforehand via Ask the Dietitian.
        </Text>
      </View>

      {/* Primary Action Button */}
      <Pressable style={s.cta} onPress={join}>
        {visitType==='phone' ? <Phone size={18} color="#fff"/> : <Video size={18} color="#fff"/>}
        <Text style={s.ctaText}>
          {visitType==='phone' ? 'Phone Call Instructions' : 'Join Video Consultation'}
        </Text>
      </Pressable>

      {meetingUrl&&visitType!=='phone'?(
        <Pressable style={s.link} onPress={()=>Linking.openURL(meetingUrl).catch(()=>Alert.alert('Unable to Open Link','Could not launch the meeting link on your device.'))}>
          <Text style={s.linkText}>Open calendar meeting link →</Text>
        </Pressable>
      ):null}

      {/* Reschedule Link */}
      <Pressable style={s.link} onPress={()=>navigation.navigate('Telehealth')}>
        <Text style={s.linkText}>Reschedule or change visit →</Text>
      </Pressable>

      {/* Cancel action - only when the visit is persisted server-side */}
      {stored?.id?(
        <Pressable style={s.link} onPress={onCancel} disabled={busy}>
          <Text style={[s.linkText,{color:colors.red}]}>{busy?'Cancelling…':'Cancel this visit →'}</Text>
        </Pressable>
      ):null}

      {/* Visit history - every other appointment row for this account */}
      {history.length>0?(
        <>
          <Text style={s.sectionLabel}>Visit history</Text>
          <View style={s.list}>
            {history.map((h:any)=>(
              <View key={h.id} style={s.infoRow}>
                <View style={s.infoIcon}>
                  <CalendarDays size={20} color={colors.deepTeal}/>
                </View>
                <View style={s.infoCopy}>
                  <Text style={s.infoTitle}>{h.slot}</Text>
                  <Text style={s.infoSub}>{h.visitType==='phone'?'Phone':'Video'} · {h.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ):null}
    </Shell>
  );
}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.softBlue,alignItems:'center'},content:{width:'100%',maxWidth:CONTENT_MAX_WIDTH,padding:24,paddingBottom:45,backgroundColor:colors.background},back:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center',marginBottom:25},eyebrow:{fontFamily:'Roboto',color:colors.green,fontSize:10,fontWeight:'700',letterSpacing:1.4},title:{fontFamily:'Roboto',fontSize:30,lineHeight:38,fontWeight:'700',color:colors.text,marginTop:8},copy:{fontFamily:'Roboto',fontSize:14,lineHeight:22,color:colors.textSecondary,marginTop:9},list:{marginTop:22,gap:11},infoRow:{minHeight:72,flexDirection:'row',alignItems:'center',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:18,padding:14},infoIcon:{width:44,height:44,borderRadius:14,backgroundColor:colors.softGreen,alignItems:'center',justifyContent:'center'},infoCopy:{flex:1,marginLeft:14},infoTitle:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text},infoSub:{fontFamily:'Roboto',fontSize:12,lineHeight:17,color:colors.textSecondary,marginTop:3},faq:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:18,padding:16},faqHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},faqQ:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text,flex:1,paddingRight:12},faqA:{fontFamily:'Roboto',fontSize:13,lineHeight:21,color:colors.textSecondary,marginTop:11},banner:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:colors.softOrange,borderRadius:18,padding:16,marginTop:22},bannerText:{fontFamily:'Roboto',fontSize:12,lineHeight:18,color:colors.text,flex:1},empty:{alignItems:'center',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,padding:26,marginTop:22},emptyIcon:{width:60,height:60,borderRadius:20,backgroundColor:colors.softGreen,alignItems:'center',justifyContent:'center',marginBottom:14},emptyTitle:{fontFamily:'Roboto',fontSize:18,fontWeight:'700',color:colors.text},emptyText:{fontFamily:'Roboto',fontSize:13,lineHeight:20,color:colors.textSecondary,marginTop:8,textAlign:'center'},tier:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,padding:20,marginTop:22},tierPremium:{borderColor:colors.green,backgroundColor:colors.softGreen},tierHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},tierName:{fontFamily:'Roboto',fontSize:20,fontWeight:'700',color:colors.text},feature:{fontFamily:'Roboto',fontSize:14,lineHeight:24,color:colors.text},priceNote:{fontFamily:'Roboto',fontSize:11,lineHeight:17,color:colors.textSecondary,marginTop:12},summary:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,paddingHorizontal:18,marginTop:24},summaryRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',minHeight:58,borderBottomWidth:1,borderBottomColor:colors.border},summaryLast:{borderBottomWidth:0},summaryLabel:{fontFamily:'Roboto',fontSize:14,color:colors.textSecondary},summaryValue:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text},secure:{flexDirection:'row',alignItems:'center',gap:10,marginTop:18},secureText:{fontFamily:'Roboto',fontSize:12,lineHeight:18,color:colors.textSecondary,flex:1},confirmIcon:{width:72,height:72,borderRadius:24,backgroundColor:colors.softGreen,alignItems:'center',justifyContent:'center',marginBottom:20},cta:{height:56,borderRadius:17,backgroundColor:colors.deepTeal,flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:28},ctaText:{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:'#fff',marginLeft:8},link:{marginTop:16,alignItems:'center'},linkText:{fontFamily:'Roboto',color:colors.deepTeal,fontSize:13,fontWeight:'700'},note:{fontFamily:'Roboto',fontSize:11,lineHeight:17,color:colors.muted,marginTop:18,textAlign:'center'},pushCard:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,padding:20,marginTop:22},pushTitle:{fontFamily:'Roboto',fontSize:17,fontWeight:'700',color:colors.text},pushCopy:{fontFamily:'Roboto',fontSize:13,lineHeight:20,color:colors.textSecondary,marginTop:7},token:{fontFamily:'Roboto',fontSize:11,lineHeight:16,color:colors.deepTeal,backgroundColor:colors.softBlue,borderRadius:12,padding:12,marginTop:14},pushError:{fontFamily:'Roboto',fontSize:12,lineHeight:18,color:'#B91C1C',marginTop:10},pushHint:{fontFamily:'Roboto',fontSize:11,lineHeight:17,color:colors.muted,marginTop:10},pushBtns:{flexDirection:'row',gap:10,marginTop:14},secondary:{flex:1,height:46,borderRadius:14,borderWidth:1,borderColor:colors.border,backgroundColor:colors.background,alignItems:'center',justifyContent:'center'},secondaryText:{fontFamily:'Roboto',fontSize:13,fontWeight:'700',color:colors.deepTeal},sectionLabel:{fontFamily:'Roboto',fontSize:17,fontWeight:'700',color:colors.text,marginTop:28},ctaOff:{opacity:0.45}});
