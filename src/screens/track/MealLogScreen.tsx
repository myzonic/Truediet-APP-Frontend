import React,{useState} from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { addMeal, MealType } from '../../lib/track';
const mealTypes:Record<string,MealType>={Breakfast:'breakfast',Lunch:'lunch',Dinner:'dinner',Snack:'snack'};
const meals=Object.keys(mealTypes);
export default function MealLogScreen({navigation}:any){
  const [meal,setMeal]=useState('Breakfast');
  const [food,setFood]=useState('');
  const [notes,setNotes]=useState('');
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const canSave=food.trim().length>0&&!saving;
  const save=async()=>{
    const description=food.trim();
    if(!description||saving)return;
    setSaving(true);setError('');
    try{
      await addMeal({mealType:mealTypes[meal],description,notes:notes.trim()||undefined});
      Alert.alert('Meal saved',`${meal} has been added to today's log.`);
      navigation.goBack();
    }catch(e:any){
      setError(e?.message||'Could not save your meal. Please try again.');
    }finally{setSaving(false);}
  };
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={{flex:1,width:'100%'}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><Pressable style={s.back} onPress={()=>navigation.goBack()}><ArrowLeft size={22} color={colors.text}/></Pressable><Text style={s.eyebrow}>MEAL LOG</Text><Text style={s.title}>What did you eat?</Text><Text style={s.subtitle}>Record what you ate without assigning foods a good or bad label.</Text><Text style={s.label}>Meal</Text><View style={s.options}>{meals.map(item=><Pressable key={item} style={[s.option,item===meal&&s.active]} onPress={()=>setMeal(item)}><Text style={[s.optionText,item===meal&&s.activeText]}>{item}</Text></Pressable>)}</View><Text style={s.label}>Food / Meal</Text><TextInput value={food} onChangeText={setFood} multiline placeholder="Example: eggs, whole grain toast and fruit" placeholderTextColor={colors.muted} style={s.area}/><Text style={s.label}>Notes</Text><TextInput value={notes} onChangeText={setNotes} multiline placeholder="Anything you noticed about the meal?" placeholderTextColor={colors.muted} style={s.notes}/><Pressable style={s.checkin} onPress={()=>navigation.navigate('HungerFullness')}><Text style={s.checkinTitle}>Add Hunger & Fullness Check-In</Text><Text style={s.small}>Optional — notice how you felt before and after eating.</Text></Pressable>{error?<Text style={s.error}>{error}</Text>:null}<Pressable style={[s.save,!canSave&&s.saveDisabled]} disabled={!canSave} onPress={save}>{saving?<ActivityIndicator color="#fff"/>:<Text style={s.saveText}>Save Meal</Text>}</Pressable></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background,alignItems:'center'},content:{width:'100%',maxWidth:412,padding:24,paddingBottom:40},back:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center',marginTop:8,marginBottom:25},eyebrow:{fontFamily:'Roboto',fontSize:10,fontWeight:'700',letterSpacing:1.4,color:colors.green},title:{fontFamily:'Roboto',fontSize:30,fontWeight:'700',color:colors.text,marginTop:8},subtitle:{fontFamily:'Roboto',fontSize:14,lineHeight:22,color:colors.textSecondary,marginTop:8},label:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text,marginBottom:10,marginTop:20},options:{flexDirection:'row',flexWrap:'wrap',gap:8},option:{paddingHorizontal:15,paddingVertical:11,borderRadius:20,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border},active:{backgroundColor:colors.deepTeal,borderColor:colors.deepTeal},optionText:{fontFamily:'Roboto',fontSize:13,fontWeight:'600',color:colors.text},activeText:{color:'#fff'},area:{minHeight:110,backgroundColor:colors.surface,borderRadius:17,borderWidth:1,borderColor:colors.border,padding:15,textAlignVertical:'top',fontFamily:'Roboto',fontSize:14,color:colors.text},photo:{minHeight:72,borderRadius:17,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',paddingHorizontal:17,gap:13,marginTop:13},photoTitle:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text},small:{fontFamily:'Roboto',fontSize:11,lineHeight:18,color:colors.textSecondary,marginTop:2},notes:{minHeight:90,borderRadius:17,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,padding:15,textAlignVertical:'top',fontFamily:'Roboto',color:colors.text},checkin:{backgroundColor:colors.softGreen,borderRadius:18,padding:18,marginTop:22},checkinTitle:{fontFamily:'Roboto',fontSize:14,fontWeight:'700',color:colors.text},error:{fontFamily:'Roboto',fontSize:12,color:'#B91C1C',marginTop:14},save:{height:56,borderRadius:17,backgroundColor:colors.deepTeal,justifyContent:'center',alignItems:'center',marginTop:24},saveDisabled:{backgroundColor:colors.muted},saveText:{fontFamily:'Roboto',color:'#fff',fontWeight:'700',fontSize:15}});
