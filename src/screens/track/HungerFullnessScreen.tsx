import React,{useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { addCheckin } from '../../lib/track';
const levels=[['1','Very hungry'],['2','Hungry'],['3','A little hungry'],['4','Comfortably satisfied'],['5','Very full']];
export default function HungerFullnessScreen({navigation}:any){
  const [before,setBefore]=useState<string>();
  const [after,setAfter]=useState<string>();
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const canSave=(!!before||!!after)&&!saving;
  const save=async()=>{
    if((!before&&!after)||saving)return;
    setSaving(true);setError('');
    try{
      await addCheckin({hungerBefore:before?Number(before):null,fullnessAfter:after?Number(after):null});
      navigation.goBack();
    }catch(e:any){
      setError(e?.message||'Could not save your check-in. Please try again.');
    }finally{setSaving(false);}
  };
  const choices=(value:string|undefined,set:(v:string)=>void,label:string)=><View><Text style={s.label}>{label}</Text>{levels.map(([n,text])=><Pressable key={n} style={[s.level,value===n&&s.active]} onPress={()=>set(n)}><View style={[s.circle,value===n&&s.circleActive]}>{value===n?<Check size={14} color="#fff"/>:<Text style={s.number}>{n}</Text>}</View><Text style={s.levelText}>{text}</Text></Pressable>)}</View>;
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><Pressable style={s.back} onPress={()=>navigation.goBack()}><ArrowLeft size={22} color={colors.text}/></Pressable><Text style={s.eyebrow}>HUNGER & FULLNESS</Text><Text style={s.title}>Check in with your body.</Text><Text style={s.subtitle}>There is no right number. This is simply a moment to notice how you feel.</Text>{choices(before,setBefore,'Before eating')}{choices(after,setAfter,'After eating')}{error?<Text style={s.error}>{error}</Text>:null}<Pressable style={[s.save,!canSave&&s.saveDisabled]} disabled={!canSave} onPress={save}>{saving?<ActivityIndicator color="#fff"/>:<Text style={s.saveText}>Save Check-In</Text>}</Pressable></ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background,alignItems:'center'},content:{width:'100%',maxWidth:CONTENT_MAX_WIDTH,padding:24,paddingBottom:40},back:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,justifyContent:'center',alignItems:'center',marginTop:8,marginBottom:25},eyebrow:{fontFamily:'Roboto',fontSize:10,fontWeight:'700',letterSpacing:1.4,color:colors.green},title:{fontFamily:'Roboto',fontSize:30,lineHeight:38,fontWeight:'700',color:colors.text,marginTop:8},subtitle:{fontFamily:'Roboto',fontSize:14,lineHeight:22,color:colors.textSecondary,marginTop:8},label:{fontFamily:'Roboto',fontSize:17,fontWeight:'700',color:colors.text,marginTop:27,marginBottom:11},level:{flexDirection:'row',alignItems:'center',minHeight:52,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:16,padding:12,marginBottom:8},active:{backgroundColor:colors.softGreen,borderColor:colors.green},circle:{width:28,height:28,borderRadius:14,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'},circleActive:{backgroundColor:colors.green,borderColor:colors.green},number:{fontFamily:'Roboto',fontSize:12,fontWeight:'700',color:colors.deepTeal},levelText:{fontFamily:'Roboto',fontSize:14,fontWeight:'600',color:colors.text,marginLeft:12},error:{fontFamily:'Roboto',fontSize:12,color:'#B91C1C',marginTop:16},save:{height:56,borderRadius:17,backgroundColor:colors.deepTeal,justifyContent:'center',alignItems:'center',marginTop:25},saveDisabled:{backgroundColor:colors.muted},saveText:{fontFamily:'Roboto',color:'#fff',fontSize:15,fontWeight:'700'}});
