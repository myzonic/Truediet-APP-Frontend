import React,{useCallback,useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Plus, Trash2, TrendingUp } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { addWeight, loadCheckins, loadProgress, loadWeights, removeWeight, HungerCheckin, Progress, WeightEntry } from '../../lib/track';

const dayLetters=['S','M','T','W','T','F','S'];
export default function ProgressPatternsScreen({navigation}:any){
  const [progress,setProgress]=useState<Progress|null>(null);
  const [checkins,setCheckins]=useState<HungerCheckin[]>([]);
  const [weights,setWeights]=useState<WeightEntry[]>([]);
  const [weightInput,setWeightInput]=useState('');
  const [savingWeight,setSavingWeight]=useState(false);
  useFocusEffect(useCallback(()=>{let active=true;(async()=>{try{const [p,c,w]=await Promise.all([loadProgress(),loadCheckins(),loadWeights()]);if(active){setProgress(p);setCheckins(c);setWeights(w);}}catch{}})();return()=>{active=false};},[]));
  const logWeight=async()=>{
    const value=weightInput.trim();
    if(!value||savingWeight)return;
    setSavingWeight(true);
    try{
      await addWeight(value);
      setWeightInput('');
      setWeights(await loadWeights());
    }catch(e:any){
      Alert.alert('Could not save weight',e?.message||'Please try again.');
    }finally{
      setSavingWeight(false);
    }
  };
  const confirmRemoveWeight=(entry:WeightEntry)=>{
    const when=new Date(entry.recordedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'});
    Alert.alert('Remove entry',`Delete the ${entry.weight} entry from ${when}?`,[
      {text:'Keep',style:'cancel'},
      {text:'Delete',style:'destructive',onPress:async()=>{
        try{
          await removeWeight(entry.id);
          setWeights(await loadWeights());
        }catch{
          Alert.alert('Could not delete','Please try again.');
        }
      }},
    ]);
  };
  const days=progress?.week.days??[];
  const max=Math.max(1,...days.map(d=>d.count));
  const activeDays=days.filter(d=>d.count>0).length;
  const stats:[string,string][]=[[String(progress?.week.meals??0),'Meals logged'],[String(progress?.week.checkins??0),'Check-ins'],[String(activeDays),'Active days']];
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><Pressable style={s.back} onPress={()=>navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}><ArrowLeft size={22} color={colors.text}/></Pressable><Text style={s.eyebrow}>YOUR PROGRESS</Text><Text style={s.title}>Notice the patterns.</Text><Text style={s.subtitle}>Progress isn't about perfect days. Look at what is happening across your week.</Text><View style={s.stats}>{stats.map(([value,label])=><View style={s.stat} key={label}><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>)}</View><Text style={s.section}>This Week</Text>{progress?(days.some(d=>d.count>0)?<View style={s.chart}>{days.map((d,i)=>{const dt=new Date(`${d.date}T00:00:00`);const pct=Math.round((d.count/max)*100);return <View style={s.column} key={d.date}><View style={s.barArea}><View style={[s.bar,{height:`${Math.max(pct,d.count>0?8:2)}%` as any}]}/></View><Text style={s.day}>{dayLetters[dt.getDay()]}</Text></View>;})}</View>:<View style={s.empty}><Text style={s.emptyTitle}>No entries yet</Text><Text style={s.emptyText}>Log a meal or a check-in and your week will start to take shape here.</Text></View>):null}<View style={s.insight}><View style={s.insightIcon}><TrendingUp size={22} color={colors.green}/></View><Text style={s.insightLabel}>A PATTERN TO NOTICE</Text><Text style={s.insightTitle}>{(progress?.week.checkins??0)>0?`You have ${progress?.week.checkins} check-in${progress?.week.checkins===1?'':'s'} logged this week.`:"You haven't logged any check-ins yet this week."}</Text><Text style={s.insightText}>Keep observing what helps you feel satisfied and energized.</Text></View>{checkins.length>0?<><Text style={s.section}>Recent Check-ins</Text><View style={s.checkinCard}>{checkins.slice(0,10).map(c=><View key={c.id} style={s.checkinRow}><Text style={s.checkinText}>{c.hungerBefore!=null?`Hunger ${c.hungerBefore}/5`:'Hunger —'} → {c.fullnessAfter!=null?`Fullness ${c.fullnessAfter}/5`:'Fullness —'}</Text><Text style={s.checkinDate}>{new Date(c.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</Text></View>)}</View></>:null}<Text style={s.section}>Weight</Text><View style={s.weightCard}><Text style={s.weightLatest}>{weights.length?weights[0].weight:'—'}</Text><Text style={s.weightSub}>{weights.length?`Latest · ${new Date(weights[0].recordedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:'Log your weigh-ins to see the trend over time.'}</Text><View style={s.weightRow}><TextInput value={weightInput} onChangeText={setWeightInput} placeholder="e.g. 72 kg" placeholderTextColor={colors.muted} style={s.weightInput} autoCapitalize="none"/><Pressable style={[s.weightBtn,(!weightInput.trim()||savingWeight)&&{opacity:.5}]} disabled={!weightInput.trim()||savingWeight} onPress={logWeight}><Plus size={20} color="#fff"/></Pressable></View>{weights.map(w=><View key={w.id} style={s.weightEntry}><Text style={s.weightEntryText}>{w.weight}</Text><Text style={s.weightEntryDate}>{new Date(w.recordedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</Text><Pressable onPress={()=>confirmRemoveWeight(w)} hitSlop={10}><Trash2 size={16} color="#B91C1C"/></Pressable></View>)}</View><Text style={s.disclaimer}>True Diet patterns are educational observations and are not medical diagnoses.</Text></ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({weightCard:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,padding:18,marginTop:14},weightLatest:{fontFamily:'Roboto',fontSize:28,fontWeight:'700',color:colors.deepTeal},weightSub:{fontFamily:'Roboto',fontSize:12,color:colors.textSecondary,marginTop:4},weightRow:{flexDirection:'row',gap:10,marginTop:14},weightInput:{flex:1,borderWidth:1,borderColor:colors.border,borderRadius:12,backgroundColor:colors.background,paddingHorizontal:14,paddingVertical:12,fontFamily:'Roboto',fontSize:15,color:colors.text},weightBtn:{width:48,height:46,borderRadius:12,backgroundColor:colors.deepTeal,alignItems:'center',justifyContent:'center'},weightEntry:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingTop:12,marginTop:12,borderTopWidth:1,borderTopColor:colors.border},weightEntryText:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text,flex:1},weightEntryDate:{fontFamily:'Roboto',fontSize:12,color:colors.textSecondary,marginRight:14},checkinCard:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,paddingHorizontal:16,marginTop:14},checkinRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border},checkinText:{fontFamily:'Roboto',fontSize:13,color:colors.text},checkinDate:{fontFamily:'Roboto',fontSize:11,color:colors.textSecondary},safe:{flex:1,backgroundColor:colors.background,alignItems:'center'},content:{width:'100%',maxWidth:CONTENT_MAX_WIDTH,padding:24,paddingBottom:45},back:{width:42,height:42,borderRadius:21,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center',marginTop:8,marginBottom:25},eyebrow:{fontFamily:'Roboto',fontSize:10,fontWeight:'700',letterSpacing:1.4,color:colors.green},title:{fontFamily:'Roboto',fontSize:30,fontWeight:'700',color:colors.text,marginTop:8},subtitle:{fontFamily:'Roboto',fontSize:14,lineHeight:22,color:colors.textSecondary,marginTop:9},stats:{flexDirection:'row',justifyContent:'space-between',marginTop:27},stat:{width:'31%',backgroundColor:colors.surface,borderRadius:17,borderWidth:1,borderColor:colors.border,paddingVertical:16,paddingHorizontal:11},statValue:{fontFamily:'Roboto',fontSize:21,fontWeight:'700',color:colors.deepTeal},statLabel:{fontFamily:'Roboto',fontSize:10,lineHeight:15,color:colors.textSecondary,marginTop:4},section:{fontFamily:'Roboto',fontSize:19,fontWeight:'700',color:colors.text,marginTop:30},chart:{height:190,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,flexDirection:'row',justifyContent:'space-around',alignItems:'flex-end',padding:18,marginTop:14},column:{height:'100%',alignItems:'center',justifyContent:'flex-end'},barArea:{height:125,width:18,justifyContent:'flex-end'},bar:{width:18,backgroundColor:colors.green,borderRadius:9},day:{fontFamily:'Roboto',fontSize:11,color:colors.textSecondary,marginTop:8},insight:{backgroundColor:colors.softGreen,borderRadius:20,padding:20,marginTop:25},insightIcon:{width:42,height:42,borderRadius:13,backgroundColor:'#fff',justifyContent:'center',alignItems:'center',marginBottom:14},insightLabel:{fontFamily:'Roboto',fontSize:9,fontWeight:'700',letterSpacing:1.1,color:colors.green},insightTitle:{fontFamily:'Roboto',fontSize:17,lineHeight:24,fontWeight:'700',color:colors.text,marginTop:6},insightText:{fontFamily:'Roboto',fontSize:12,lineHeight:19,color:colors.textSecondary,marginTop:6},empty:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,padding:22,marginTop:14},emptyTitle:{fontFamily:'Roboto',fontSize:16,fontWeight:'700',color:colors.text},emptyText:{fontFamily:'Roboto',fontSize:13,lineHeight:20,color:colors.textSecondary,marginTop:7},disclaimer:{fontFamily:'Roboto',fontSize:10,lineHeight:16,color:colors.muted,marginTop:18}});
