import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronRight, Clock3, Heart, Mic, Pause, Phone, Play, Plus, Send, ShieldCheck, Square, Trash2, Video, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useLayoutMetrics } from '../../theme/responsive';
import { sendMessage } from '../../lib/messages';
import { addMeal, loadVoiceTranscriptions, removeVoiceTranscription, MealType } from '../../lib/track';
import { recipes, findRecipe, Recipe } from '../../lib/recipeContent';
import { loadRecipes } from '../../lib/contentLibrary';
import { saveContent } from '../../lib/content';
import { isSpeechSupported, startSpeechRecording, pauseSpeechRecording, resumeSpeechRecording, stopSpeechAndTranscribeFull, parseFoodTranscript, cancelSpeech, ProposedFoodItem } from '../../lib/speech';
import { createCalBooking, getCalAvailableSlots, getCalConfig, type CalBookingResult, type CalConfig } from '../../lib/cal';
import { cancelAppointment, loadAppointment, saveAppointment } from '../../lib/appointments';


function Shell({children,navigation}:{children:React.ReactNode;navigation:any}){const {contentWidth,horizontalPadding}=useLayoutMetrics();return <SafeAreaView style={s.safe}><ScrollView style={{ width: '100%' }} contentContainerStyle={[s.content,{maxWidth:contentWidth,paddingHorizontal:horizontalPadding}]} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag"><Pressable style={s.back} onPress={()=>navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}><ArrowLeft size={22} color={colors.text}/></Pressable>{children}</ScrollView></SafeAreaView>}
export function RecipesScreen({navigation}:any){const [items,setItems]=useState<Recipe[]>(recipes);useEffect(()=>{let active=true;loadRecipes().then(r=>{if(active&&r.length)setItems(r);}).catch(()=>undefined);return()=>{active=false;};},[]);return <Shell navigation={navigation}><Text style={s.eyebrow}>RECIPES</Text><Text style={s.title}>Food ideas with flexibility.</Text><Text style={s.copy}>Practical recipes built around balance, variety, preferences and real life.</Text><View style={s.list}>{items.map(r=><Pressable key={r.id} style={s.card} onPress={()=>navigation.navigate('RecipeDetail',{recipeId:r.id,title:r.title})}><View style={s.recipeArt}><Heart size={24} color={colors.green}/></View><View style={s.cardCopy}><Text style={s.cardTitle}>{r.title}</Text><Text style={s.meta}>{r.time} · {r.category}</Text><Text style={s.desc}>{r.whyItWorks}</Text></View><ChevronRight size={19} color={colors.muted}/></Pressable>)}</View></Shell>}
export function RecipeDetailScreen({navigation,route}:any){const [recipe,setRecipe]=useState<Recipe|null>(null);useEffect(()=>{let active=true;const fallback=()=>{const byId=recipes.find(r=>r.id===route.params?.recipeId);return byId||findRecipe(route.params?.title||route.params?.recipeId);};loadRecipes().then(list=>{if(!active)return;const match=list.find(r=>r.id===route.params?.recipeId)||list.find(r=>r.title===route.params?.title);setRecipe(match||fallback());}).catch(()=>{if(active)setRecipe(fallback());});return()=>{active=false;};},[route.params?.recipeId,route.params?.title]);const [saving,setSaving]=useState(false);if(!recipe)return <Shell navigation={navigation}><ActivityIndicator color={colors.deepTeal} style={{marginTop:40}}/></Shell>;const onSave=async()=>{if(saving)return;setSaving(true);try{await saveContent(`recipe-${recipe.id}`,{title:recipe.title,subtitle:`${recipe.time} · ${recipe.category}`,route:'RecipeDetail',type:'recipe'});Alert.alert('Saved','This recipe was added to your saved content.');}catch(e:any){Alert.alert('Could not save',e?.message||'Please try again.');}finally{setSaving(false);}};return <Shell navigation={navigation}><Text style={s.eyebrow}>RECIPE</Text><Text style={s.title}>{recipe.title}</Text><Text style={s.meta}>{recipe.time} · {recipe.category}</Text><View style={s.hero}><Heart size={38} color={colors.green}/></View><Text style={s.section}>Why it works</Text><Text style={s.copy}>{recipe.whyItWorks} This is a flexible template - not a prescription. Adapt ingredients to what you enjoy, need, and have available.</Text><Text style={s.section}>Ingredients</Text>{recipe.ingredients.map(x=><View key={x} style={s.step}><Text style={s.stepText}>• {x}</Text></View>)}<Text style={s.section}>Method</Text>{recipe.steps.map((x,i)=><View key={x} style={s.step}><Text style={s.stepNumber}>{i+1}</Text><Text style={s.stepText}>{x}</Text></View>)}<View style={{backgroundColor:colors.softGreen,borderRadius:16,padding:16,marginTop:20}}><Text style={{fontFamily:'Roboto',fontSize:10,fontWeight:'700',letterSpacing:1.2,color:colors.green}}>TIP</Text><Text style={{fontFamily:'Roboto',fontSize:13,lineHeight:20,color:colors.text,marginTop:6}}>{recipe.tip}</Text></View><Pressable style={s.primary} onPress={onSave} disabled={saving}>{saving?<ActivityIndicator color="#fff"/>:<Text style={s.primaryText}>Save Recipe</Text>}</Pressable></Shell>}
export function VoiceFoodLogScreen({navigation}:any){
  const [status,setStatus]=useState<'idle'|'recording'|'paused'|'transcribing'|'reviewing'>('idle');
  const [transcript,setTranscript]=useState('');
  const [mealType,setMealType]=useState<MealType>(()=>{const h=new Date().getHours();return h<11?'breakfast':h<15?'lunch':h<21?'dinner':'snack';});
  const [language,setLanguage]=useState<'en'|'es'|'fr'|'de'|'auto'>('en');
  const [items,setItems]=useState<ProposedFoodItem[]>([]);
  const [newItemText,setNewItemText]=useState('');
  const [history,setHistory]=useState<{id:string;text:string;status:string}[]>([]);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [elapsed,setElapsed]=useState(0);
  const supported=isSpeechSupported();

  useEffect(()=>{
    let active=true;
    loadVoiceTranscriptions().then(h=>{if(active)setHistory(h);}).catch(()=>undefined);
    return ()=>{active=false;void cancelSpeech();};
  },[]);

  useEffect(()=>{
    if(status!=='recording')return;
    const id=setInterval(()=>setElapsed(prev=>prev+1),1000);
    return ()=>clearInterval(id);
  },[status]);

  const handleStart=async()=>{
    if(!supported){
      setError('Microphone recording is not available on this device. You can type your meal below.');
      return;
    }
    setError('');
    setElapsed(0);
    try{
      await startSpeechRecording();
      setStatus('recording');
    }catch(e:any){
      setError(e?.message||'Could not start recording. Check microphone permissions.');
      setStatus('idle');
    }
  };

  const handlePauseResume=async()=>{
    try{
      if(status==='recording'){
        const ok=await pauseSpeechRecording();
        if(ok) setStatus('paused');
      }else if(status==='paused'){
        const ok=await resumeSpeechRecording();
        if(ok) setStatus('recording');
      }
    }catch(e:any){
      setError(e?.message||'Could not pause/resume recording.');
    }
  };

  const handleCancelRecording=async()=>{
    await cancelSpeech();
    setElapsed(0);
    setStatus('idle');
  };

  const handleStop=async()=>{
    setError('');
    setStatus('transcribing');
    try{
      const result=await stopSpeechAndTranscribeFull(language);
      setTranscript(result.text||'');
      if(result.mealType) setMealType(result.mealType);
      setItems(result.items||[]);
      setStatus('reviewing');
    }catch(e:any){
      setError(e?.message||'Could not transcribe your recording. Try again or edit the text below.');
      setStatus('idle');
    }
  };

  const reparseTranscript=async()=>{
    const text=transcript.trim();
    if(!text)return;
    setError('');
    try{
      const parsed=await parseFoodTranscript(text);
      if(parsed.mealType) setMealType(parsed.mealType);
      setItems(parsed.items||[]);
      setStatus('reviewing');
    }catch{
      // local fallback split
      const lines=text.split(/[,;\n]+|\band\b/i).map(x=>x.trim()).filter(Boolean);
      setItems(lines.map((l,i)=>({id:`local-${i}`,name:l,quantity:'1',unit:'serving',rawText:l,uncertain:true})));
      setStatus('reviewing');
    }
  };

  const updateItem=(id:string,patch:Partial<ProposedFoodItem>)=>{
    setItems(prev=>prev.map(it=>it.id===id?{...it,...patch}:it));
  };

  const removeItem=(id:string)=>{
    setItems(prev=>prev.filter(it=>it.id!==id));
  };

  const addManualItem=()=>{
    const t=newItemText.trim();
    if(!t)return;
    setItems(prev=>[...prev,{id:`manual-${Date.now()}`,name:t,quantity:'1',unit:'serving',rawText:t,uncertain:false}]);
    setNewItemText('');
  };

  const save=async()=>{
    const finalDescription=items.length>0
      ? items.map(it=>`${it.quantity&&it.quantity!=='1'?`${it.quantity} ${it.unit} `:''}${it.name}`.trim()).join(', ')
      : transcript.trim();
    if(!finalDescription||saving)return;
    setSaving(true);setError('');
    try{
      const totalCals=items.reduce((sum,it)=>sum+(it.calories||0),0);
      const totalProt=items.reduce((sum,it)=>sum+(it.protein||0),0);
      const totalCarbs=items.reduce((sum,it)=>sum+(it.carbs||0),0);
      const totalFat=items.reduce((sum,it)=>sum+(it.fat||0),0);
      const macroNote=totalCals>0?`Estimated reference nutrition: ${totalCals} kcal (${totalProt.toFixed(0)}g protein, ${totalCarbs.toFixed(0)}g carbs, ${totalFat.toFixed(0)}g fat)`:undefined;
      await addMeal({mealType,description:finalDescription,notes:macroNote,source:'voice'});
      Alert.alert('Saved to Food Diary',`Your ${mealType} entry was saved to your Food Diary.`);
      setTranscript('');
      setItems([]);
      setStatus('idle');
      navigation.goBack();
    }catch(e:any){
      setError(e?.message||'Could not save your food diary entry. Please try again.');
    }finally{setSaving(false);}
  };

  const deleteHistoryItem=async(id:string)=>{
    try{
      await removeVoiceTranscription(id);
      setHistory(prev=>prev.filter(h=>h.id!==id));
    }catch(e:any){
      // Tell the member the row is still there instead of removing it locally
      // while it remains on the server.
      Alert.alert('Could not delete',e?.message||'Please try again.');
    }
  };

  const mealOptions:[MealType,string][]=[['breakfast','Breakfast'],['lunch','Lunch'],['dinner','Dinner'],['snack','Snack']];
  const langOptions:[typeof language,string][]=[['en','English'],['es','Español'],['fr','Français'],['de','Deutsch'],['auto','Auto']];
  const micLabel=status==='recording'?'Tap to finish & transcribe':status==='paused'?'Recording paused':status==='transcribing'?'Transcribing your audio…':'Tap microphone to start recording';

  return <Shell navigation={navigation}>
    <Text style={s.eyebrow}>VOICE FOOD LOG</Text>
    <Text style={s.title}>Tell us about your meal.</Text>
    <Text style={s.copy}>Speak naturally (e.g., “I had two boiled eggs, two slices of whole wheat toast and one cup of milk for breakfast”). Review and edit before saving to your Food Diary.</Text>

    <Text style={[s.label,{marginTop:16,marginBottom:8}]}>Language</Text>
    <View style={s.chips}>
      {langOptions.map(([code,label])=>(
        <Pressable key={code} onPress={()=>setLanguage(code)} style={[s.slot,language===code&&s.slotActive]}>
          <Text style={[s.slotText,language===code&&s.slotTextActive]}>{label}</Text>
        </Pressable>
      ))}
    </View>

    <View style={[s.recordTouch,status==='transcribing'&&s.disabled]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={micLabel}
        disabled={status==='transcribing'}
        onPress={()=>{if(status==='recording'||status==='paused'){void handleStop();}else{void handleStart();}}}
        style={{alignItems:'center'}}
      >
        <View style={[s.micWrap,(status==='recording'||status==='paused')&&s.micWrapOn]}>
          <View style={[s.mic,(status==='recording'||status==='paused')&&s.micOn]}>
            {status==='transcribing'?<ActivityIndicator color="#fff"/>:(status==='recording'||status==='paused')?<Square size={26} color="#fff"/>:<Mic size={32} color="#fff"/>}
          </View>
        </View>
        <Text style={s.micLabel}>{micLabel}</Text>
      </Pressable>

      {(status==='recording'||status==='paused')?(
        <View style={{alignItems:'center',marginTop:10,gap:10}}>
          <Text style={s.recTimer}>● {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')} {status==='paused'?'(Paused)':'recording'}</Text>
          <View style={{flexDirection:'row',gap:10}}>
            <Pressable onPress={handlePauseResume} style={[s.slot,{paddingHorizontal:14,paddingVertical:8}]}>
              {status==='recording'?<Pause size={15} color={colors.deepTeal}/>:<Play size={15} color={colors.deepTeal}/>}
              <Text style={s.slotText}>{status==='recording'?'Pause':'Resume'}</Text>
            </Pressable>
            <Pressable onPress={handleCancelRecording} style={[s.slot,{paddingHorizontal:14,paddingVertical:8,borderColor:colors.red}]}>
              <X size={15} color={colors.red}/>
              <Text style={[s.slotText,{color:colors.red}]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ):null}
    </View>

    <Text style={[s.label,{marginTop:18,marginBottom:8}]}>Select Meal Type</Text>
    <View style={s.chips}>
      {mealOptions.map(([key,label])=>(
        <Pressable key={key} onPress={()=>setMealType(key)} style={[s.slot,mealType===key&&s.slotActive]}>
          <Text style={[s.slotText,mealType===key&&s.slotTextActive]}>{label}</Text>
        </Pressable>
      ))}
    </View>

    <View style={s.transcript}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <Text style={[s.transcriptLabel,{flex:1,minWidth:0,marginRight:8}]}>TRANSCRIPTION REVIEW (EDITABLE)</Text>
        {transcript.trim().length>0?(
          <Pressable onPress={reparseTranscript} hitSlop={8} style={{flexShrink:0}}>
            <Text style={{fontFamily:'Roboto',fontSize:12,fontWeight:'700',color:colors.deepTeal}}>Analyze Items →</Text>
          </Pressable>
        ):null}
      </View>
      <TextInput
        value={transcript}
        onChangeText={setTranscript}
        multiline
        placeholder="Speak above or type what you ate here — then review recognized items before saving."
        placeholderTextColor={colors.muted}
        style={[s.transcriptText,{minHeight:74,padding:0}]}
      />
    </View>

    {items.length>0?(
      <View style={{marginTop:18,borderWidth:1,borderColor:colors.border,borderRadius:18,padding:16,backgroundColor:colors.surface,gap:10}}>
        <Text style={s.transcriptLabel}>PROPOSED FOOD ITEMS (CONFIRM OR EDIT)</Text>
        {items.map((it)=>(
          <View key={it.id} style={{borderBottomWidth:1,borderBottomColor:colors.border,paddingBottom:10,gap:6}}>
            <TextInput
              value={it.name}
              onChangeText={(v)=>updateItem(it.id,{name:v,uncertain:false})}
              placeholder="Food item"
              style={{width:'100%',minHeight:38,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingHorizontal:10,paddingVertical:8,fontSize:13,fontWeight:'600',color:colors.text,backgroundColor:colors.background}}
            />
            <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
              <TextInput
                value={it.quantity}
                onChangeText={(v)=>updateItem(it.id,{quantity:v})}
                placeholder="Qty"
                style={{width:64,minHeight:38,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingHorizontal:8,paddingVertical:8,fontSize:13,color:colors.text,backgroundColor:colors.background}}
              />
              <TextInput
                value={it.unit}
                onChangeText={(v)=>updateItem(it.id,{unit:v})}
                placeholder="Unit"
                style={{flex:1,minWidth:0,minHeight:38,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingHorizontal:8,paddingVertical:8,fontSize:13,color:colors.text,backgroundColor:colors.background}}
              />
              <Pressable onPress={()=>removeItem(it.id)} hitSlop={8} accessibilityLabel={`Remove ${it.name}`}>
                <Trash2 size={17} color={colors.red}/>
              </Pressable>
            </View>
            {it.calories!=null?(
              <Text style={{fontFamily:'Roboto',fontSize:11.5,color:colors.green}}>
                Reference nutrition: {it.calories} kcal · {it.protein}g protein · {it.carbs}g carbs · {it.fat}g fat
              </Text>
            ):(
              <Text style={{fontFamily:'Roboto',fontSize:11.5,color:colors.orange}}>
                Uncertain nutrition match — verify item name & quantity above (no fabricated nutrition values added).
              </Text>
            )}
          </View>
        ))}

        <View style={{flexDirection:'row',gap:8,marginTop:4}}>
          <TextInput
            value={newItemText}
            onChangeText={setNewItemText}
            placeholder="Add missing item (e.g. 1 cup berries)"
            placeholderTextColor={colors.muted}
            onSubmitEditing={addManualItem}
            style={{flex:1,minHeight:42,paddingVertical:8,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingHorizontal:12,fontSize:13,color:colors.text}}
          />
          <Pressable onPress={addManualItem} style={{width:42,height:42,borderRadius:10,backgroundColor:colors.deepTeal,alignItems:'center',justifyContent:'center'}}>
            <Plus size={18} color="#fff"/>
          </Pressable>
        </View>
      </View>
    ):null}

    <View style={s.apiNote}>
      <ShieldCheck size={19} color={colors.deepTeal}/>
      <Text style={s.apiCopy}>Audio is transcribed on the True Diet backend. Nothing is added to your Food Diary until you review and confirm the recognized items.</Text>
    </View>

    {error?<Text style={[s.desc,{color:'#B91C1C',marginTop:10}]}>{error}</Text>:null}

    <Pressable style={[s.primary,(!transcript.trim()&&items.length===0||saving)&&s.disabled]} disabled={(!transcript.trim()&&items.length===0)||saving} onPress={save}>
      <Text style={s.primaryText}>{saving?'Saving to Food Diary…':'Confirm & Save to Food Diary'}</Text>
    </Pressable>

    {history.length>0?(
      <View style={{marginTop:26}}>
        <Text style={s.section}>Recent Voice Food Logs</Text>
        {history.slice(0,5).map((h)=>(
          <View key={h.id} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border}}>
            <Text style={{flex:1,fontFamily:'Roboto',fontSize:13,color:colors.text,marginRight:10}}>{h.text}</Text>
            <Pressable onPress={()=>deleteHistoryItem(h.id)} hitSlop={8}>
              <Trash2 size={16} color={colors.red}/>
            </Pressable>
          </View>
        ))}
      </View>
    ):null}
  </Shell>;
}
export function DietitianScreen({navigation}:any){const [message,setMessage]=useState('');const [sent,setSent]=useState(false);const [sending,setSending]=useState(false);const [error,setError]=useState('');const submit=async()=>{const body=message.trim();if(!body||sending)return;setSending(true);setError('');try{await sendMessage(body);setSent(true);setMessage('');}catch(e:any){setError(e?.message||'Could not send your message. Please try again.');}finally{setSending(false);}};return <Shell navigation={navigation}><Text style={s.eyebrow}>ASK THE DIETITIAN</Text><Text style={s.title}>Guidance with context.</Text><Text style={s.copy}>Send a non-urgent nutrition education question to your Registered Dietitian.</Text><View style={s.secure}><ShieldCheck size={22} color={colors.green}/><View style={s.secureBody}><Text style={s.cardTitle}>Secure messaging</Text><Text style={s.desc}>For education and support—not urgent or emergency care.</Text></View></View><Text style={s.label}>Your question</Text><TextInput value={message} onChangeText={(value)=>{setMessage(value);if(sent)setSent(false);}} multiline placeholder="What would you like to understand?" placeholderTextColor={colors.muted} style={s.textArea}/>{sent&&<Text style={s.sent}>Message saved for secure delivery.</Text>}{error?<Text style={[s.desc,{color:'#B91C1C',marginTop:10}]}>{error}</Text>:null}<Pressable style={[s.primary,(!message.trim()||sending)&&s.disabled]} disabled={!message.trim()||sending} onPress={submit}><Send size={18} color="#fff"/><Text style={s.primaryText}>{sending?'Sending…':'Send Secure Message'}</Text></Pressable><Pressable onPress={()=>navigation.navigate('MessageDetail')} hitSlop={8}><Text style={[s.desc,{color:colors.deepTeal,fontWeight:'700',marginTop:14,textAlign:'center'}]}>View my conversation →</Text></Pressable></Shell>}
export function TelehealthScreen({navigation}:any){
  const [visitType, setVisitType] = useState<'video'|'phone'>('video');
  const [calConfig, setCalConfig] = useState<CalConfig|null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
const [slotOptions, setSlotOptions] = useState<{key:string;label:string;iso:string}[]>([]);
  const [choice, setChoice] = useState('');
  // The booker's IANA time zone (detected from the device). Sent with the
  // booking so Cal.com stores and emails times in the member's own zone.
  const deviceTz=Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [booking, setBooking] = useState(false);
  const { isCompact, columnsFor, gridItemWidth, gutter } = useLayoutMetrics();
  const visitCols = isCompact ? 1 : columnsFor(2, 140);
  const visitWidth = gridItemWidth(visitCols);

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
      setSlotsError('We could not load available times. Please try again.');
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
            timeZone:deviceTz,
            notes:`${visitType==='phone'?'Phone consultation':'HD Video consultation'} via True Diet Telehealth.`,
          });
        }catch(e:any){
          bookingNotice=e?.message||'Unable to schedule via live calendar. Your request has been logged offline.';
        }
      }

      const appointment={
        slot:selected?`${selected.label} · ${new Date(start).toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:choice,
        visitType,
        isoStart:start,
        bookingId:calBooking?.id,
        meetingUrl:calBooking?.meetingUrl,
      };

      // The appointment is stored in the database so it is available on any
      // device the member signs in from.
      // Captured before saving: once the new row exists, loadAppointment would
      // return it instead of the visit being replaced.
      const previous=await loadAppointment().catch(()=>null);
      await saveAppointment(appointment);
      if(previous?.id){await cancelAppointment(previous.id).catch(()=>undefined);}
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
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:gutter,marginTop:8}}>
        <Pressable
          onPress={()=>setVisitType('video')}
          style={{width:visitWidth,flex:0,flexBasis:'auto',flexGrow:0,padding:16,borderRadius:18,borderWidth:1.5,borderColor:visitType==='video'?colors.deepTeal:colors.border,backgroundColor:visitType==='video'?colors.softBlue:colors.surface}}
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
          style={{width:visitWidth,flex:0,flexBasis:'auto',flexGrow:0,padding:16,borderRadius:18,borderWidth:1.5,borderColor:visitType==='phone'?colors.deepTeal:colors.border,backgroundColor:visitType==='phone'?colors.softBlue:colors.surface}}
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
          <Text style={s.desc}>15 minutes · One-on-one with Maureen, Registered Dietitian</Text>
        </View>
      </View>

      <Text style={s.label}>Select an available time</Text>

      {loadingSlots?(
        <View style={{paddingVertical:24,alignItems:'center'}}>
          <ActivityIndicator color={colors.deepTeal}/>
          <Text style={[s.desc,{marginTop:8}]}>Retrieving live availability…</Text>
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
          {slotOptions.length} time{slotOptions.length===1?'':'s'} available over the next 14 days · times shown in your device time zone ({deviceTz}).
        </Text>
      ):null}

      <View style={s.apiNote}>
        <Clock3 size={19} color={colors.deepTeal}/>
        <Text style={s.apiCopy}>
          {calConfig?.configured
            ? 'Times come from your scheduling calendar.'
            : 'To arrange a visit, contact True Diet and we will find a time that works.'}
        </Text>
      </View>

      <Pressable style={[s.primary,(booking||!choice)&&{opacity:0.5}]} disabled={booking||!choice} onPress={request}>
        <Text style={s.primaryText}>{booking?'Confirming Appointment…':'Confirm Appointment'}</Text>
      </Pressable>

      <Pressable onPress={()=>navigation.navigate('AppointmentDetail',{slot:(slotOptions.find((option)=>option.key===choice)?.label)||choice,visitType})}>
        <Text style={[s.desc,{color:colors.deepTeal,fontWeight:'700',marginTop:14,textAlign:'center'}]}>
          View appointment details →
        </Text>
      </Pressable>
    </Shell>
  );
}
const s=StyleSheet.create({dayHeader:{fontFamily:'Roboto',fontSize:13,fontWeight:'700',color:colors.textSecondary,letterSpacing:.3,marginTop:6,marginBottom:8},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},notice:{flexDirection:'row',gap:10,backgroundColor:colors.softBlue,borderRadius:16,padding:16,alignItems:'flex-start'},noticeText:{flex:1,fontFamily:'Roboto',fontSize:13,lineHeight:19,color:colors.textSecondary},safe:{flex:1,backgroundColor:colors.background,alignItems:'center'},content:{width:'100%',maxWidth:CONTENT_MAX_WIDTH,alignSelf:'center',padding:24,paddingBottom:48},back:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center',marginTop:8,marginBottom:25},eyebrow:{fontFamily:'Roboto',fontSize:10,fontWeight:'700',letterSpacing:1.4,color:colors.green},title:{fontFamily:'Roboto',fontSize:30,lineHeight:38,fontWeight:'700',color:colors.text,marginTop:8},copy:{fontFamily:'Roboto',fontSize:14,lineHeight:22,color:colors.textSecondary,marginTop:9},list:{marginTop:26,gap:12},card:{minHeight:116,borderWidth:1,borderColor:colors.border,borderRadius:20,padding:14,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center'},recipeArt:{width:58,height:58,borderRadius:18,alignItems:'center',justifyContent:'center',backgroundColor:colors.softGreen},cardCopy:{flex:1,marginHorizontal:12},cardTitle:{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:colors.text},meta:{fontFamily:'Roboto',fontSize:11,color:colors.green,marginTop:4},desc:{fontFamily:'Roboto',fontSize:11,lineHeight:16,color:colors.textSecondary,marginTop:5},hero:{height:152,borderRadius:22,backgroundColor:colors.softGreen,alignItems:'center',justifyContent:'center',marginTop:23},section:{fontFamily:'Roboto',fontSize:20,fontWeight:'700',color:colors.text,marginTop:28,marginBottom:8},step:{flexDirection:'row',alignItems:'center',marginTop:11},stepNumber:{fontFamily:'Roboto',width:26,minHeight:26,borderRadius:13,textAlign:'center',textAlignVertical:'center',paddingTop:0,fontSize:12,lineHeight:24,backgroundColor:colors.deepTeal,color:'#fff',fontWeight:'700'},stepText:{fontFamily:'Roboto',fontSize:14,color:colors.text,marginLeft:11},primary:{minHeight:56,paddingVertical:12,paddingHorizontal:16,borderRadius:17,backgroundColor:colors.deepTeal,marginTop:28,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8},primaryText:{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:'#fff',flexShrink:1,textAlign:'center'},recordTouch:{alignSelf:'center',alignItems:'center',marginTop:24},recordTouchPressed:{opacity:0.85},micWrap:{alignItems:'center',padding:7,borderRadius:60,borderWidth:2,borderColor:'transparent'},micWrapOn:{borderColor:'#F3B4B4'},mic:{width:84,height:84,borderRadius:42,backgroundColor:colors.deepTeal,alignItems:'center',justifyContent:'center',shadowColor:'#0B3B36',shadowOpacity:0.2,shadowRadius:12,shadowOffset:{width:0,height:6},elevation:4},micOn:{backgroundColor:colors.red},micLabel:{fontFamily:'Roboto',fontSize:13,fontWeight:'700',color:colors.text,marginTop:12,textAlign:'center'},recTimer:{fontFamily:'Roboto',fontSize:12,fontWeight:'700',color:colors.green,marginTop:5,textAlign:'center'},progressWrap:{alignSelf:'stretch',marginTop:14,alignItems:'center'},progressTrack:{width:'70%',height:6,borderRadius:3,backgroundColor:colors.border,overflow:'hidden'},progressFill:{height:6,borderRadius:3,backgroundColor:colors.green},progressText:{fontFamily:'Roboto',fontSize:11,color:colors.textSecondary,marginTop:8,textAlign:'center'},transcript:{minHeight:105,borderWidth:1,borderColor:colors.border,borderRadius:18,padding:17,backgroundColor:colors.surface,marginTop:23},transcriptLabel:{fontFamily:'Roboto',fontSize:9,fontWeight:'700',letterSpacing:1.1,color:colors.green},transcriptText:{fontFamily:'Roboto',fontSize:14,lineHeight:21,color:colors.text,marginTop:8},apiNote:{flexDirection:'row',gap:10,backgroundColor:colors.softBlue,borderRadius:16,padding:14,marginTop:14},apiCopy:{fontFamily:'Roboto',fontSize:12,lineHeight:18,color:colors.deepTeal,flex:1},secure:{flexDirection:'row',gap:12,backgroundColor:colors.softGreen,padding:16,borderRadius:18,marginTop:26},secureBody:{flex:1,minWidth:0},label:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text,marginTop:24,marginBottom:8},textArea:{minHeight:128,borderWidth:1,borderColor:colors.border,borderRadius:17,padding:15,textAlignVertical:'top',fontFamily:'Roboto',fontSize:14,color:colors.text,backgroundColor:colors.surface},sent:{fontFamily:'Roboto',fontSize:12,color:colors.green,marginTop:10},visit:{flexDirection:'row',gap:13,backgroundColor:colors.softBlue,borderRadius:19,padding:17,marginTop:26},slot:{minHeight:54,paddingVertical:10,borderWidth:1,borderColor:colors.border,borderRadius:15,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',paddingHorizontal:16,gap:12,marginBottom:10},slotActive:{backgroundColor:colors.deepTeal,borderColor:colors.deepTeal},slotText:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text},slotTextActive:{color:'#fff'},disabled:{backgroundColor:colors.muted}});

