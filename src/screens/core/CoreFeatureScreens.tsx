import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronRight, Clock3, Heart, Mic, Phone, Send, ShieldCheck, Video } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { sendMessage } from '../../lib/messages';
import { addMeal, MealType } from '../../lib/track';
import { recipes, findRecipe, Recipe } from '../../lib/recipeContent';
import { loadRecipes } from '../../lib/contentLibrary';
import { saveContent } from '../../lib/content';
import { isSpeechSupported, prepareSpeech, startSpeechRecording, stopSpeechAndTranscribe, cancelSpeech } from '../../lib/speech';
import { createCalBooking, getCalAvailableSlots, getCalConfig, type CalBookingResult, type CalConfig } from '../../lib/cal';
import { createStreamCall, type StreamCallResponse } from '../../lib/stream';
import { saveAppointment } from '../../lib/appointments';


function Shell({children,navigation}:{children:React.ReactNode;navigation:any}){return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><Pressable style={s.back} onPress={()=>navigation.goBack()}><ArrowLeft size={22} color={colors.text}/></Pressable>{children}</ScrollView></SafeAreaView>}
export function RecipesScreen({navigation}:any){const [items,setItems]=useState<Recipe[]>(recipes);useEffect(()=>{let active=true;loadRecipes().then(r=>{if(active&&r.length)setItems(r);}).catch(()=>undefined);return()=>{active=false;};},[]);return <Shell navigation={navigation}><Text style={s.eyebrow}>RECIPES</Text><Text style={s.title}>Food ideas with flexibility.</Text><Text style={s.copy}>Practical recipes built around balance, variety, preferences and real life.</Text><View style={s.list}>{items.map(r=><Pressable key={r.id} style={s.card} onPress={()=>navigation.navigate('RecipeDetail',{recipeId:r.id,title:r.title})}><View style={s.recipeArt}><Heart size={24} color={colors.green}/></View><View style={s.cardCopy}><Text style={s.cardTitle}>{r.title}</Text><Text style={s.meta}>{r.time} Â· {r.category}</Text><Text style={s.desc}>{r.whyItWorks}</Text></View><ChevronRight size={19} color={colors.muted}/></Pressable>)}</View></Shell>}
export function RecipeDetailScreen({navigation,route}:any){const [recipe,setRecipe]=useState<Recipe|null>(null);useEffect(()=>{let active=true;const fallback=()=>{const byId=recipes.find(r=>r.id===route.params?.recipeId);return byId||findRecipe(route.params?.title||route.params?.recipeId);};loadRecipes().then(list=>{if(!active)return;const match=list.find(r=>r.id===route.params?.recipeId)||list.find(r=>r.title===route.params?.title);setRecipe(match||fallback());}).catch(()=>{if(active)setRecipe(fallback());});return()=>{active=false;};},[route.params?.recipeId,route.params?.title]);const [saving,setSaving]=useState(false);if(!recipe)return <Shell navigation={navigation}><ActivityIndicator color={colors.deepTeal} style={{marginTop:40}}/></Shell>;const onSave=async()=>{if(saving)return;setSaving(true);try{await saveContent(`recipe-${recipe.id}`,{title:recipe.title,subtitle:`${recipe.time} Â· ${recipe.category}`,route:'RecipeDetail',type:'recipe'});Alert.alert('Saved','This recipe was added to your saved content.');}catch(e:any){Alert.alert('Could not save',e?.message||'Please try again.');}finally{setSaving(false);}};return <Shell navigation={navigation}><Text style={s.eyebrow}>RECIPE</Text><Text style={s.title}>{recipe.title}</Text><Text style={s.meta}>{recipe.time} Â· {recipe.category}</Text><View style={s.hero}><Heart size={38} color={colors.green}/></View><Text style={s.section}>Why it works</Text><Text style={s.copy}>{recipe.whyItWorks} This is a flexible template - not a prescription. Adapt ingredients to what you enjoy, need, and have available.</Text><Text style={s.section}>Ingredients</Text>{recipe.ingredients.map(x=><View key={x} style={s.step}><Text style={s.stepText}>â€¢ {x}</Text></View>)}<Text style={s.section}>Method</Text>{recipe.steps.map((x,i)=><View key={x} style={s.step}><Text style={s.stepNumber}>{i+1}</Text><Text style={s.stepText}>{x}</Text></View>)}<View style={{backgroundColor:colors.softGreen,borderRadius:16,padding:16,marginTop:20}}><Text style={{fontFamily:'Roboto',fontSize:10,fontWeight:'700',letterSpacing:1.2,color:colors.green}}>TIP</Text><Text style={{fontFamily:'Roboto',fontSize:13,lineHeight:20,color:colors.text,marginTop:6}}>{recipe.tip}</Text></View><Pressable style={s.primary} onPress={onSave} disabled={saving}>{saving?<ActivityIndicator color="#fff"/>:<Text style={s.primaryText}>Save Recipe</Text>}</Pressable></Shell>}
export function VoiceFoodLogScreen({navigation}:any){
  const [status,setStatus]=useState<'idle'|'preparing'|'recording'|'transcribing'>('idle');
  const [transcript,setTranscript]=useState('');
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [progress,setProgress]=useState<{loaded:number;total:number}|null>(null);
  const supported=isSpeechSupported();
  useEffect(()=>()=>{void cancelSpeech();},[]);
  const handleStart=async()=>{
    if(!supported){setError('Voice capture is available in the web app and the native store build. You can type your meal note here instead.');return;}
    setError('');
    setStatus('recording');
    const prep=prepareSpeech((p)=>setProgress({loaded:p.loaded,total:p.total}));
    try{
      await startSpeechRecording();
    }catch(e:any){
      setError(e?.message||'Could not start recording.');
      setStatus('idle');
    }
    prep.then(()=>setProgress(null)).catch((e:any)=>{
      setError(e?.message||'The speech model could not load. You can type your note instead.');
      setProgress(null);
    });
  };
  const handleStop=async()=>{
    setError('');
    try{
      setStatus('transcribing');
      const text=await stopSpeechAndTranscribe();
      if(text) setTranscript(prev=>prev?`${prev} ${text}`:text);
    }catch(e:any){
      setError(e?.message||'Could not transcribe your note.');
    }finally{
      setStatus('idle');
      setProgress(null);
    }
  };
  const handleMic=()=>{
    if(status==='recording'){void handleStop();}
    else if(status==='idle'){void handleStart();}
  };
  const save=async()=>{
    if(!transcript.trim()||saving)return;
    setSaving(true);setError('');
    const hour=new Date().getHours();
    const mealType:MealType=hour<11?'breakfast':hour<15?'lunch':hour<21?'dinner':'snack';
    try{
      await addMeal({mealType,description:transcript.trim(),source:'voice'});
      Alert.alert('Meal note saved','Your voice food log was added to todayâ€™s entries.');
      setTranscript('');
      navigation.goBack();
    }catch(e:any){
      setError(e?.message||'Could not save your meal note. Please try again.');
    }finally{setSaving(false);}
  };
  const micLabel=status==='recording'?'Tap to finish':status==='transcribing'?'Transcribingâ€¦':'Tap to start recording';
  const pct=progress&&progress.total?Math.min(100,Math.round(progress.loaded/progress.total*100)):null;
  return <Shell navigation={navigation}>
    <Text style={s.eyebrow}>VOICE FOOD LOG</Text>
    <Text style={s.title}>Tell us about your meal.</Text>
    <Text style={s.copy}>Speak naturally. True Diet turns your words into a private meal note without scoring or judging food.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={micLabel} accessibilityState={{disabled:status==='transcribing'}} hitSlop={12} disabled={status==='transcribing'} onPress={handleMic} style={({pressed})=>[s.recordTouch,pressed&&s.recordTouchPressed,status==='transcribing'&&s.disabled]}>
      <View style={[s.micWrap,status==='recording'&&s.micWrapOn]}>
        <View style={[s.mic,status==='recording'&&s.micOn]}>
          {status==='transcribing'?<ActivityIndicator color="#fff"/>:<Mic size={32} color="#fff"/>}
        </View>
      </View>
      <Text style={s.micLabel}>{micLabel}</Text>
    </Pressable>
    {pct!==null?<View style={s.progressWrap}><View style={s.progressTrack}><View style={[s.progressFill,{width:`${pct}%`}]}/></View><Text style={s.progressText}>Preparing speech modelâ€¦ {pct}%</Text></View>:null}
    <View style={s.transcript}>
      <Text style={s.transcriptLabel}>MEAL NOTE</Text>
      <TextInput value={transcript} onChangeText={setTranscript} multiline placeholder="Your voice note will appear here â€” you can edit it." placeholderTextColor={colors.muted} style={[s.transcriptText,{minHeight:70,padding:0}]}/>
    </View>
    <View style={s.apiNote}>
      <ShieldCheck size={19} color={colors.deepTeal}/>
      <Text style={s.apiCopy}>{supported?'Voice notes are transcribed on your device with sherpa-onnx (Whisper base.en). Audio never leaves your device. First use downloads the model once.':'Voice capture runs in the web app and in the native store build. You can type your meal note here in the meantime.'}</Text>
    </View>
    {error?<Text style={[s.desc,{color:'#B91C1C',marginTop:10}]}>{error}</Text>:null}
    <Pressable style={[s.primary,(!transcript.trim()||saving)&&s.disabled]} disabled={!transcript.trim()||saving} onPress={save}>
      <Text style={s.primaryText}>{saving?'Savingâ€¦':'Save Meal Note'}</Text>
    </Pressable>
  </Shell>;
}
export function DietitianScreen({navigation}:any){const [message,setMessage]=useState('');const [sent,setSent]=useState(false);const [sending,setSending]=useState(false);const [error,setError]=useState('');const submit=async()=>{const body=message.trim();if(!body||sending)return;setSending(true);setError('');try{await sendMessage(body);setSent(true);setMessage('');}catch(e:any){setError(e?.message||'Could not send your message. Please try again.');}finally{setSending(false);}};return <Shell navigation={navigation}><Text style={s.eyebrow}>ASK THE DIETITIAN</Text><Text style={s.title}>Guidance with context.</Text><Text style={s.copy}>Send a non-urgent nutrition education question to your Registered Dietitian.</Text><View style={s.secure}><ShieldCheck size={22} color={colors.green}/><View><Text style={s.cardTitle}>Secure messaging</Text><Text style={s.desc}>For education and supportâ€”not urgent or emergency care.</Text></View></View><Text style={s.label}>Your question</Text><TextInput value={message} onChangeText={(value)=>{setMessage(value);if(sent)setSent(false);}} multiline placeholder="What would you like to understand?" placeholderTextColor={colors.muted} style={s.textArea}/>{sent&&<Text style={s.sent}>Message saved for secure delivery.</Text>}{error?<Text style={[s.desc,{color:'#B91C1C',marginTop:10}]}>{error}</Text>:null}<Pressable style={[s.primary,(!message.trim()||sending)&&s.disabled]} disabled={!message.trim()||sending} onPress={submit}><Send size={18} color="#fff"/><Text style={s.primaryText}>{sending?'Sendingâ€¦':'Send Secure Message'}</Text></Pressable><Pressable onPress={()=>navigation.navigate('MessageDetail')} hitSlop={8}><Text style={[s.desc,{color:colors.deepTeal,fontWeight:'700',marginTop:14,textAlign:'center'}]}>View my conversation â†’</Text></Pressable></Shell>}
export function TelehealthScreen({navigation}:any){
  const [visitType, setVisitType] = useState<'video'|'phone'>('video');
  const [calConfig, setCalConfig] = useState<CalConfig|null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [slotOptions, setSlotOptions] = useState<{key:string;label:string;iso:string}[]>([]);
  const [choice, setChoice] = useState('');
  const [booking, setBooking] = useState(false);

  // Resolve the configuration once.
  useEffect(()=>{
    let active=true;
    (async()=>{
      const cfg:CalConfig=await getCalConfig().catch(()=>({configured:false}));
      if(active) setCalConfig(cfg);
    })();
    return ()=>{active=false;};
  },[]);

  // Video and phone consultations may be different Cal.com event types, so
  // availability is refetched whenever the format changes.
  useEffect(()=>{
    if(!calConfig) return;
    if(!calConfig.configured){
      setSlotsError('Live availability is unavailable because scheduling is not configured on this server yet.');
      return;
    }
    let active=true;
    (async()=>{
      setLoadingSlots(true);
      setSlotsError('');
      setSlotOptions([]);
      setChoice('');
      try{
        const consultation=calConfig.consultations?.[visitType==='phone'?'phone':'video'];
        const eventTypeId=consultation?.eventTypeId||calConfig.eventTypeId;
        const now=new Date();
        const toDate=new Date();
        toDate.setDate(toDate.getDate()+14);

        const slotData=await getCalAvailableSlots(now.toISOString(),toDate.toISOString(),eventTypeId);
        if(!active) return;

        const flat:{key:string;label:string;iso:string}[]=[];
        const seen=new Set<string>();
        const data=slotData?.slots||{};
        Object.keys(data).forEach((dateKey)=>{
          (data[dateKey]||[]).forEach((slotItem:any)=>{
            const timeStr=slotItem?.time||slotItem;
            if(typeof timeStr!=='string'||seen.has(timeStr)) return;
            const d=new Date(timeStr);
            if(Number.isNaN(d.getTime())) return;
            seen.add(timeStr);
            flat.push({key:timeStr,iso:timeStr,label:d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})});
          });
        });
        flat.sort((a,b)=>a.iso.localeCompare(b.iso));
        if(!flat.length){
          setSlotsError('No consultation times are available in the next 14 days.');
          return;
        }
        setSlotOptions(flat);
        setChoice(flat[0].key);
      }catch{
        if(active) setSlotsError('Could not load availability. Check your connection and try again.');
      }finally{
        if(active) setLoadingSlots(false);
      }
    })();
    return ()=>{active=false;};
  },[calConfig,visitType]);

const request=async()=>{
    if(booking||!choice) return;
    setBooking(true);

    const selected=slotOptions.find((option)=>option.key===choice);
    const start=selected?.iso||new Date(Date.now()+86400000).toISOString();
    let bookingNotice='';

    try{
      // 1. Reserve the calendar slot first, so the video room can be named after it.
      let calBooking:CalBookingResult|null=null;
      if(calConfig?.configured){
        try{
          const consultation=calConfig.consultations?.[visitType==='phone'?'phone':'video'];
          calBooking=await createCalBooking({
            eventTypeId:consultation?.eventTypeId||calConfig.eventTypeId,
            start,
            notes:`${visitType==='phone'?'Phone consultation':'HD Video consultation'} via True Diet Telehealth.`,
          });
        }catch(e:any){
          bookingNotice=e?.message||'Unable to schedule via live calendar. Your request has been logged offline.';
        }
      }

      // 2. Create the video room. Reusing the booking id keeps one stable room
      //    per appointment, so the visit can be rejoined later.
      const fallbackCallId=calBooking?.id?`visit-${calBooking.id}`:undefined;
      let streamData:StreamCallResponse|null=null;
      try{
        streamData=await createStreamCall({callId:fallbackCallId,callMode:visitType,callType:'default'});
      }catch{
        // The appointment still stands; the call screen can retry on join.
      }

      const appointment={
        slot:selected?`${selected.label} Â· ${new Date(start).toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:choice,
        visitType,
        isoStart:start,
        bookingId:calBooking?.id,
        meetingUrl:calBooking?.meetingUrl,
        callId:streamData?.callId||fallbackCallId,
      };

      // The appointment is stored in the database so it is available on any
      // device the member signs in from.
      await saveAppointment(appointment);
      navigation.navigate('AppointmentDetail', appointment);

      if(bookingNotice){
        Alert.alert('Booking Notice',bookingNotice);
      }
    }catch(e:any){
      Alert.alert('Booking Notice',e?.message||'Unable to complete the booking. Please try again.');
    }finally{
      setBooking(false);
    }
  };

  // Group the slots by calendar day so a full working week stays readable
  // instead of one unbroken list of hundreds of chips.
  const dayGroups:{day:string;label:string;slots:{key:string;label:string;iso:string}[]}[]=[];
  slotOptions.forEach((option)=>{
    const day=option.iso.slice(0,10);
    let group=dayGroups.find((g)=>g.day===day);
    if(!group){
      group={day,label:new Date(option.iso).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}),slots:[]};
      dayGroups.push(group);
    }
    group.slots.push(option);
  });

  return (
    <Shell navigation={navigation}>
      <Text style={s.eyebrow}>TELEHEALTH CONSULTATION</Text>
      <Text style={s.title}>Schedule your visit.</Text>
      <Text style={s.copy}>
        Connect directly with Maureen Ashbarry, MS, RD for one-on-one nutrition therapy and tailored dietary planning.
      </Text>

      <Text style={[s.label,{marginTop:22}]}>Consultation format</Text>
      <View style={{flexDirection:'row',gap:12,marginTop:8}}>
        <Pressable
          onPress={()=>setVisitType('video')}
          style={{flex:1,padding:16,borderRadius:18,borderWidth:1.5,borderColor:visitType==='video'?colors.deepTeal:colors.border,backgroundColor:visitType==='video'?colors.softBlue:colors.surface}}
        >
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <Video size={24} color={visitType==='video'?colors.deepTeal:colors.muted}/>
            {visitType==='video'&&<CheckCircle2 size={18} color={colors.green}/>}
          </View>
          <Text style={{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:colors.text,marginTop:10}}>Video Visit</Text>
          <Text style={{fontFamily:'Roboto',fontSize:12,color:colors.textSecondary,marginTop:3}}>Face-to-face consultation via secure video</Text>
        </Pressable>

        <Pressable
          onPress={()=>setVisitType('phone')}
          style={{flex:1,padding:16,borderRadius:18,borderWidth:1.5,borderColor:visitType==='phone'?colors.deepTeal:colors.border,backgroundColor:visitType==='phone'?colors.softBlue:colors.surface}}
        >
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <Phone size={22} color={visitType==='phone'?colors.deepTeal:colors.muted}/>
            {visitType==='phone'&&<CheckCircle2 size={18} color={colors.green}/>}
          </View>
          <Text style={{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:colors.text,marginTop:10}}>Phone Call</Text>
          <Text style={{fontFamily:'Roboto',fontSize:12,color:colors.textSecondary,marginTop:3}}>Direct voice consultation to your phone</Text>
        </Pressable>
      </View>

      <View style={[s.visit,{marginTop:18}]}>
        {visitType==='video'?<Video size={24} color={colors.deepTeal}/>:<Phone size={24} color={colors.deepTeal}/>}
        <View style={{flex:1}}>
          <Text style={s.cardTitle}>{visitType==='video'?'Virtual Nutrition Consultation':'Phone Nutrition Consultation'}</Text>
          <Text style={s.desc}>15 minutes Â· One-on-one with Maureen, Registered Dietitian</Text>
        </View>
      </View>

      <Text style={s.label}>Select an available time</Text>

      {loadingSlots?(
        <View style={{paddingVertical:24,alignItems:'center'}}>
          <ActivityIndicator color={colors.deepTeal}/>
          <Text style={[s.desc,{marginTop:8}]}>Retrieving live availabilityâ€¦</Text>
        </View>
      ):slotsError?(
        <View style={s.notice}>
          <Clock3 size={18} color={colors.deepTeal}/>
          <Text style={s.noticeText}>{slotsError}</Text>
        </View>
      ):(
        dayGroups.map((group)=>(
          <View key={group.day} style={{marginTop:14}}>
            <Text style={s.dayHeader}>{group.label}</Text>
            <View style={s.chips}>
              {group.slots.map((option)=>(
                <Pressable
                  key={option.key}
                  onPress={()=>setChoice(option.key)}
                  style={[s.slot,choice===option.key&&s.slotActive]}
                >
                  <CalendarDays size={16} color={choice===option.key?'#fff':colors.deepTeal}/>
                  <Text style={[s.slotText,choice===option.key&&s.slotTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))
      )}

      {slotOptions.length>0?(
        <Text style={[s.desc,{marginTop:12}]}>
          {slotOptions.length} time{slotOptions.length===1?'':'s'} available over the next 14 days Â· times shown in your device time zone.
        </Text>
      ):null}

      <View style={s.apiNote}>
        <Clock3 size={19} color={colors.deepTeal}/>
        <Text style={s.apiCopy}>
          {calConfig?.configured
            ? 'Times come from your scheduling calendar.'
            : 'Live availability will appear here once scheduling is connected to this server.'}
        </Text>
      </View>

      <Pressable style={[s.primary,(booking||!choice)&&{opacity:0.5}]} disabled={booking||!choice} onPress={request}>
        <Text style={s.primaryText}>{booking?'Confirming Appointmentâ€¦':'Confirm Appointment'}</Text>
      </Pressable>

      <Pressable onPress={()=>navigation.navigate('AppointmentDetail',{slot:(slotOptions.find((option)=>option.key===choice)?.label)||choice,visitType})}>
        <Text style={[s.desc,{color:colors.deepTeal,fontWeight:'700',marginTop:14,textAlign:'center'}]}>
          View appointment details â†’
        </Text>
      </Pressable>
    </Shell>
  );
}
const s=StyleSheet.create({dayHeader:{fontFamily:'Roboto',fontSize:13,fontWeight:'700',color:colors.textSecondary,letterSpacing:.3,marginTop:6,marginBottom:8},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},notice:{flexDirection:'row',gap:10,backgroundColor:colors.softBlue,borderRadius:16,padding:16,alignItems:'flex-start'},noticeText:{flex:1,fontFamily:'Roboto',fontSize:13,lineHeight:19,color:colors.textSecondary},safe:{flex:1,backgroundColor:colors.background,alignItems:'center'},content:{width:'100%',maxWidth:412,padding:24,paddingBottom:42},back:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center',marginTop:8,marginBottom:25},eyebrow:{fontFamily:'Roboto',fontSize:10,fontWeight:'700',letterSpacing:1.4,color:colors.green},title:{fontFamily:'Roboto',fontSize:30,lineHeight:38,fontWeight:'700',color:colors.text,marginTop:8},copy:{fontFamily:'Roboto',fontSize:14,lineHeight:22,color:colors.textSecondary,marginTop:9},list:{marginTop:26,gap:12},card:{minHeight:116,borderWidth:1,borderColor:colors.border,borderRadius:20,padding:14,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center'},recipeArt:{width:58,height:58,borderRadius:18,alignItems:'center',justifyContent:'center',backgroundColor:colors.softGreen},cardCopy:{flex:1,marginHorizontal:12},cardTitle:{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:colors.text},meta:{fontFamily:'Roboto',fontSize:11,color:colors.green,marginTop:4},desc:{fontFamily:'Roboto',fontSize:11,lineHeight:16,color:colors.textSecondary,marginTop:5},hero:{height:152,borderRadius:22,backgroundColor:colors.softGreen,alignItems:'center',justifyContent:'center',marginTop:23},section:{fontFamily:'Roboto',fontSize:20,fontWeight:'700',color:colors.text,marginTop:28,marginBottom:8},step:{flexDirection:'row',alignItems:'center',marginTop:11},stepNumber:{fontFamily:'Roboto',width:26,height:26,borderRadius:13,overflow:'hidden',textAlign:'center',paddingTop:4,backgroundColor:colors.deepTeal,color:'#fff',fontWeight:'700'},stepText:{fontFamily:'Roboto',fontSize:14,color:colors.text,marginLeft:11},primary:{height:56,borderRadius:17,backgroundColor:colors.deepTeal,marginTop:28,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8},primaryText:{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:'#fff'},recordTouch:{alignSelf:'center',alignItems:'center',marginTop:24},recordTouchPressed:{opacity:0.85},micWrap:{alignItems:'center',padding:7,borderRadius:60,borderWidth:2,borderColor:'transparent'},micWrapOn:{borderColor:'#F3B4B4'},mic:{width:84,height:84,borderRadius:42,backgroundColor:colors.deepTeal,alignItems:'center',justifyContent:'center',shadowColor:'#0B3B36',shadowOpacity:0.2,shadowRadius:12,shadowOffset:{width:0,height:6},elevation:4},micOn:{backgroundColor:colors.red},micLabel:{fontFamily:'Roboto',fontSize:13,fontWeight:'700',color:colors.text,marginTop:12,textAlign:'center'},progressWrap:{alignSelf:'stretch',marginTop:14,alignItems:'center'},progressTrack:{width:'70%',height:6,borderRadius:3,backgroundColor:colors.border,overflow:'hidden'},progressFill:{height:6,borderRadius:3,backgroundColor:colors.green},progressText:{fontFamily:'Roboto',fontSize:11,color:colors.textSecondary,marginTop:8,textAlign:'center'},transcript:{minHeight:105,borderWidth:1,borderColor:colors.border,borderRadius:18,padding:17,backgroundColor:colors.surface,marginTop:23},transcriptLabel:{fontFamily:'Roboto',fontSize:9,fontWeight:'700',letterSpacing:1.1,color:colors.green},transcriptText:{fontFamily:'Roboto',fontSize:14,lineHeight:21,color:colors.text,marginTop:8},apiNote:{flexDirection:'row',gap:10,backgroundColor:colors.softBlue,borderRadius:16,padding:14,marginTop:14},apiCopy:{fontFamily:'Roboto',fontSize:12,lineHeight:18,color:colors.deepTeal,flex:1},secure:{flexDirection:'row',gap:12,backgroundColor:colors.softGreen,padding:16,borderRadius:18,marginTop:26},label:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text,marginTop:24,marginBottom:8},textArea:{minHeight:128,borderWidth:1,borderColor:colors.border,borderRadius:17,padding:15,textAlignVertical:'top',fontFamily:'Roboto',fontSize:14,color:colors.text,backgroundColor:colors.surface},sent:{fontFamily:'Roboto',fontSize:12,color:colors.green,marginTop:10},visit:{flexDirection:'row',gap:13,backgroundColor:colors.softBlue,borderRadius:19,padding:17,marginTop:26},slot:{height:54,borderWidth:1,borderColor:colors.border,borderRadius:15,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',paddingHorizontal:16,gap:12,marginBottom:10},slotActive:{backgroundColor:colors.deepTeal,borderColor:colors.deepTeal},slotText:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text},slotTextActive:{color:'#fff'},disabled:{backgroundColor:colors.muted}});

