import React,{useState} from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, BookOpen, CalendarDays, ChevronRight, Clock3, Headphones, Heart, Mic, Play, Rss, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { allArticles } from '../../lib/learnContent';
import { saveContent } from '../../lib/content';

const Shell=({navigation,children,hideBack}:{navigation:any;children:React.ReactNode;hideBack?:boolean})=><SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>{hideBack?null:<Pressable style={s.back} onPress={()=>navigation.goBack()} hitSlop={6}><ArrowLeft size={22} color={colors.text}/></Pressable>}{children}</ScrollView></SafeAreaView>;

const Row=({icon:Icon,title,subtitle,onPress}:{icon:any;title:string;subtitle:string;onPress:()=>void})=><Pressable style={s.row} onPress={onPress}><View style={s.rowIcon}><Icon size={21} color={colors.deepTeal}/></View><View style={s.rowText}><Text style={s.rowTitle}>{title}</Text><Text style={s.rowSub}>{subtitle}</Text></View><ChevronRight size={19} color={colors.muted}/></Pressable>;

const hub:[string,string,string,any][]=[
  ['Label Reading Framework','A calm, step-by-step guide','ResourceDetail',BookOpen],
  ['Mindful Eating Guide','Notice hunger, fullness, and satisfaction','ResourceDetail',Heart],
  ['7-Day Anti-Inflammatory Reset','Educational, flexible foundations','ResourceDetail',ShieldCheck],
  ['Blog & Articles','Current evidence-based education','Blog',BookOpen],
  ['Webinars & Classes','Live and recorded lessons','Webinars',CalendarDays],
  ['True Diet Podcast','Nutrition conversations with context','Podcast',Headphones],
];

export function ResourcesHubScreen({navigation}:any){
  return <Shell navigation={navigation} hideBack><Text style={s.eyebrow}>RESOURCES</Text><Text style={s.title}>Practical guidance to return to.</Text><Text style={s.copy}>Evidence-based guides, tools, and learning resources for everyday nutrition decisions.</Text><View style={s.list}>{hub.map(([title,subtitle,route,Icon])=><Row key={title} icon={Icon} title={title} subtitle={subtitle} onPress={()=>navigation.navigate(route,route==='ResourceDetail'?{title}:undefined)}/>)}</View></Shell>;
}

export function ResourceDetailScreen({navigation,route}:any){
  const title=route.params?.title||'A practical nutrition guide';
  const [saving,setSaving]=useState(false);
  const onSave=async()=>{if(saving)return;setSaving(true);const id=`resource-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;try{await saveContent(id,{title,subtitle:'Guide',route:'ResourceDetail',type:'resource'});Alert.alert('Saved','This resource was added to your saved content.');}catch(e:any){Alert.alert('Could not save',e?.message||'Please try again.');}finally{setSaving(false);}};
  return <Shell navigation={navigation}><Text style={s.eyebrow}>RESOURCE</Text><Text style={s.title}>{title}</Text><Text style={s.copy}>Use this evidence-based resource at your own pace. It is designed to help you build understanding, not follow rigid food rules.</Text><View style={s.callout}><Text style={s.calloutLabel}>HOW TO USE THIS</Text><Text style={s.calloutText}>Read a section at a time. Notice what feels realistic for your life, and start there — small, steady steps are easier to keep.</Text></View>{[['Start with understanding','Before changing anything, get curious about what you already do and why. Awareness is the foundation of change.'],['Make it flexible','Adapt every suggestion to your culture, budget, preferences and schedule. There is no single correct way.'],['Focus on addition','Think about what you can include — more plants, protein, fluids and sleep — rather than what to remove.'],['Return often','This guide is meant to be revisited. Understanding builds gradually, and reminders help.']].map(([h,b])=><View key={h} style={s.section}><Text style={s.sectionTitle}>{h}</Text><Text style={s.sectionText}>{b}</Text></View>)}<Pressable style={[s.cta,saving&&{opacity:.6}]} disabled={saving} onPress={onSave}><Text style={s.ctaText}>{saving?'Saving...':'Save Resource'}</Text></Pressable></Shell>;
}

export function BlogScreen({navigation}:any){
  const articles=allArticles().slice(0,9);
  return <Shell navigation={navigation}><Text style={s.eyebrow}>BLOG & ARTICLES</Text><Text style={s.title}>Current nutrition, clearly explained.</Text><Text style={s.copy}>Research context, practical education, and thoughtful answers to nutrition questions.</Text><View style={s.list}>{articles.map(({topic,article})=><Pressable key={article.id} style={s.card} onPress={()=>navigation.navigate('Article',{articleId:article.id,title:article.title})}><Text style={s.label}>{topic.title.toUpperCase()}</Text><Text style={s.cardTitle}>{article.title}</Text><Text style={s.cardSummary}>{article.summary}</Text><Text style={s.read}>{article.readTime} read</Text></Pressable>)}</View></Shell>;
}

const webinars:[string,string,boolean,string][]=[
  ['Nutrition Labels Without Fear','Live · Thursday · 6:00 PM',true,'60 min · Live class'],
  ['Building Balanced Meals','Recorded · Watch anytime',false,'42 min · Recorded class'],
  ['Nutrition Myths: How to Think Clearly','Recorded · Watch anytime',false,'35 min · Recorded class'],
];

export function WebinarsScreen({navigation}:any){
  return <Shell navigation={navigation}><Text style={s.eyebrow}>WEBINARS & CLASSES</Text><Text style={s.title}>Learn with Maureen.</Text><Text style={s.copy}>Join a live class or choose a recorded lesson when it fits your schedule.</Text><View style={s.list}>{webinars.map(([title,meta,live,detail])=><Pressable key={title} style={s.card} onPress={()=>navigation.navigate('WebinarDetail',{title,meta,live})}><View style={s.cardHead}><View style={[s.badge,live?s.badgeLive:s.badgeRec]}><Text style={[s.badgeText,live?s.badgeTextLive:s.badgeTextRec]}>{live?'LIVE':'RECORDED'}</Text></View><Clock3 size={16} color={colors.muted}/></View><Text style={s.cardTitle}>{title}</Text><Text style={s.cardSummary}>{detail}</Text></Pressable>)}</View><Pressable style={s.link} onPress={()=>navigation.navigate('RecordedClasses')} hitSlop={8}><Text style={s.linkText}>Browse all recorded classes →</Text></Pressable></Shell>;
}

export function WebinarDetailScreen({navigation,route}:any){
  const title=route.params?.title||'A True Diet class';
  const meta=route.params?.meta||'Live class';
  const live=route.params?.live!==false;
  return <Shell navigation={navigation}><Text style={s.eyebrow}>{live?'LIVE WEBINAR':'RECORDED CLASS'}</Text><Text style={s.title}>{title}</Text><Text style={s.meta}>{meta}</Text><View style={s.callout}><Text style={s.calloutLabel}>WHAT YOU’LL LEARN</Text><Text style={s.calloutText}>A practical, evidence-based walkthrough with time for educational questions. No rigid food rules — just context you can apply.</Text></View>{[['Format','45–60 minutes, presentation plus Q&A.'],['Who it’s for','Anyone who wants clearer, calmer nutrition understanding.'],['What to bring','A question you’ve been wondering about — and curiosity.']].map(([h,b])=><View key={h} style={s.section}><Text style={s.sectionTitle}>{h}</Text><Text style={s.sectionText}>{b}</Text></View>)}<Pressable style={s.cta} onPress={()=>live?navigation.navigate('WebinarConfirmation',{title}):Alert.alert('Listen link','A playback link will be available once media hosting is connected.')}><Text style={s.ctaText}>{live?'Register for Webinar':'Watch Recording'}</Text></Pressable></Shell>;
}

export function RecordedClassesScreen({navigation}:any){
  const recorded=webinars.filter(w=>!w[2]);
  return <Shell navigation={navigation}><Text style={s.eyebrow}>RECORDED CLASSES</Text><Text style={s.title}>Keep learning on your time.</Text><Text style={s.copy}>Replay practical, evidence-based lessons whenever you need them.</Text><View style={s.list}>{recorded.map(([title,meta,live,detail])=><Pressable key={title} style={s.card} onPress={()=>navigation.navigate('WebinarDetail',{title,meta,live:false})}><View style={s.cardHead}><View style={[s.badge,s.badgeRec]}><Text style={[s.badgeText,s.badgeTextRec]}>RECORDED</Text></View><Play size={16} color={colors.muted}/></View><Text style={s.cardTitle}>{title}</Text><Text style={s.cardSummary}>{detail}</Text></Pressable>)}</View></Shell>;
}

const episodes:[string,string,string][]=[
  ['Episode 12: Why nutrition trends feel convincing','28 min · Nutrition Truth','ep-12'],
  ['Episode 11: Finding a flexible meal rhythm','31 min · Practical nutrition','ep-11'],
  ['Episode 10: Protein, plainly','24 min · Evidence-based','ep-10'],
];

export function PodcastScreen({navigation}:any){
  return <Shell navigation={navigation}><Text style={s.eyebrow}>TRUE DIET PODCAST</Text><Text style={s.title}>Nutrition conversations with context.</Text><Text style={s.copy}>Listen to practical, science-informed conversations about food and wellbeing.</Text><View style={s.list}>{episodes.map(([title,meta,id])=><Pressable key={id} style={s.card} onPress={()=>navigation.navigate('PodcastDetail',{id,title,meta})}><View style={s.cardHead}><View style={s.play}><Mic size={18} color="#fff"/></View><Rss size={16} color={colors.muted}/></View><Text style={s.cardTitle}>{title}</Text><Text style={s.cardSummary}>{meta}</Text></Pressable>)}</View></Shell>;
}

export function PodcastDetailScreen({navigation,route}:any){
  const title=route.params?.title||'A True Diet episode';
  const meta=route.params?.meta||'Episode';
  return <Shell navigation={navigation}><Text style={s.eyebrow}>PODCAST EPISODE</Text><Text style={s.title}>{title}</Text><Text style={s.meta}>{meta}</Text><View style={s.callout}><Text style={s.calloutLabel}>EPISODE NOTES</Text><Text style={s.calloutText}>A calm, practical conversation about how nutrition information reaches us, why simple messages spread, and how to think about food with more context.</Text></View>{[['Key takeaways','Nutrition claims are easier to repeat than to verify. Look for the broader evidence, not a single headline.'],['Related resources','Pair this episode with the Myths & Misinformation topic in the Learn library.'],['Listen','Streaming links will be available once media hosting is connected.']].map(([h,b])=><View key={h} style={s.section}><Text style={s.sectionTitle}>{h}</Text><Text style={s.sectionText}>{b}</Text></View>)}<Pressable style={s.cta} onPress={()=>Alert.alert('Listen link','A streaming link will be available once podcast hosting is connected.')}><Text style={s.ctaText}>Open Listen Link</Text></Pressable></Shell>;
}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.softBlue,alignItems:'center'},content:{width:'100%',maxWidth:412,padding:24,paddingBottom:45,backgroundColor:colors.background},back:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center',marginBottom:25},eyebrow:{fontFamily:'Roboto',color:colors.green,fontSize:10,fontWeight:'700',letterSpacing:1.4},title:{fontFamily:'Roboto',fontSize:30,lineHeight:38,fontWeight:'700',color:colors.text,marginTop:8},copy:{fontFamily:'Roboto',fontSize:14,lineHeight:22,color:colors.textSecondary,marginTop:9},meta:{fontFamily:'Roboto',fontSize:12,color:colors.textSecondary,marginTop:10},list:{marginTop:26,gap:11},row:{minHeight:76,flexDirection:'row',alignItems:'center',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:18,padding:14},rowIcon:{width:44,height:44,borderRadius:14,backgroundColor:colors.softGreen,alignItems:'center',justifyContent:'center'},rowText:{flex:1,marginHorizontal:14},rowTitle:{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:colors.text},rowSub:{fontFamily:'Roboto',fontSize:12,color:colors.textSecondary,marginTop:3},card:{backgroundColor:colors.surface,borderRadius:20,borderWidth:1,borderColor:colors.border,padding:18},cardHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},label:{fontFamily:'Roboto',color:colors.green,fontSize:9,letterSpacing:1.1,fontWeight:'700'},cardTitle:{fontFamily:'Roboto',fontSize:17,lineHeight:24,fontWeight:'700',color:colors.text,marginTop:10},cardSummary:{fontFamily:'Roboto',fontSize:13,lineHeight:20,color:colors.textSecondary,marginTop:7},read:{fontFamily:'Roboto',color:colors.deepTeal,fontSize:12,fontWeight:'700',marginTop:12},badge:{paddingHorizontal:10,paddingVertical:5,borderRadius:10},badgeLive:{backgroundColor:colors.softOrange},badgeRec:{backgroundColor:colors.softBlue},badgeText:{fontFamily:'Roboto',fontSize:10,letterSpacing:1,fontWeight:'700'},badgeTextLive:{color:colors.orange},badgeTextRec:{color:colors.deepTeal},play:{width:38,height:38,borderRadius:13,backgroundColor:colors.deepTeal,alignItems:'center',justifyContent:'center'},callout:{backgroundColor:colors.softGreen,borderRadius:20,padding:20,marginTop:25},calloutLabel:{fontFamily:'Roboto',color:colors.green,fontSize:10,fontWeight:'700',letterSpacing:1.2},calloutText:{fontFamily:'Roboto',color:colors.text,fontSize:15,lineHeight:23,marginTop:8},section:{marginTop:30},sectionTitle:{fontFamily:'Roboto',fontSize:21,fontWeight:'700',color:colors.text,marginBottom:9},sectionText:{fontFamily:'Roboto',fontSize:15,lineHeight:25,color:colors.textSecondary},cta:{height:56,borderRadius:17,backgroundColor:colors.deepTeal,alignItems:'center',justifyContent:'center',marginTop:30},ctaText:{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:'#fff'},link:{marginTop:16,alignItems:'center'},linkText:{fontFamily:'Roboto',color:colors.deepTeal,fontSize:13,fontWeight:'700'}});
