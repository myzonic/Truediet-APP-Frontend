import React,{useCallback,useEffect,useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, BookOpen, CalendarDays, ChevronRight, Clock3, FileText, Headphones, Heart, ListChecks, Mic, Play, Rss, Search, ShieldCheck, ShoppingCart, Sparkles } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { allArticles } from '../../lib/learnContent';
import { listRegistrations, registerForSession, unregisterFromSession, Registration } from '../../lib/registrations';
import { hubItems, webinarSessions, podcastEpisodes, HubItem, WebinarSession, PodcastEpisode, SAMPLE_PREVIEW_NOTICE } from '../../lib/libraryContent';
import { loadLibrary, LibraryItem, ResourceCategory, loadResourceCategories, loadResourceBySlug, loadResourceFeatured, loadResourceRecommended, loadResourceRecentlyAdded, searchResources } from '../../lib/contentLibrary';
import { loadSavedContent, ContentSummary, saveContent } from '../../lib/content';
import { listProgress, recordResourceView, completeResource, ResourceProgressItem } from '../../lib/resourceHub';

const Shell=({navigation,children,hideBack}:{navigation:any;children:React.ReactNode;hideBack?:boolean})=><SafeAreaView style={s.safe}><ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>{hideBack?null:<Pressable style={s.back} onPress={()=>navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={6}><ArrowLeft size={22} color={colors.text}/></Pressable>}{children}</ScrollView></SafeAreaView>;

const Row=({icon:Icon,title,subtitle,onPress}:{icon:any;title:string;subtitle:string;onPress:()=>void})=><Pressable style={s.row} onPress={onPress}><View style={s.rowIcon}><Icon size={21} color={colors.deepTeal}/></View><View style={s.rowText}><Text style={s.rowTitle}>{title}</Text><Text style={s.rowSub}>{subtitle}</Text></View><ChevronRight size={19} color={colors.muted}/></Pressable>;



export function ResourcesHubScreen({navigation}:any){
  const [items,setItems]=useState<LibraryItem[]>([]);
  const [saved,setSaved]=useState<ContentSummary[]>([]);
  const [categories,setCategories]=useState<ResourceCategory[]>([]);
  const [recommended,setRecommended]=useState<LibraryItem[]>([]);
  const [recently,setRecently]=useState<LibraryItem[]>([]);
  const [continueItems,setContinueItems]=useState<ResourceProgressItem[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;Promise.all([loadLibrary('resource'),loadSavedContent(),loadResourceCategories(),loadResourceRecommended(),loadResourceRecentlyAdded()]).then(([i,s,c,r,rec])=>{if(active){setItems(i);setSaved(s);setCategories(c);setRecommended(r);setRecently(rec);}}).catch(()=>{/* keep whatever loaded*/}).finally(()=>{if(active)setLoading(false);});listProgress().then((p)=>{if(active)setContinueItems(p.continue.slice(0,3));}).catch(()=>{/* anonymous or offline */});return()=>{active=false;};},[]);
  const ICONS:Record<string,any>={book:BookOpen,heart:Heart,shield:ShieldCheck,calendar:CalendarDays,headphones:Headphones};
  const hub=hubItems.map((h:HubItem)=>({...h,icon:ICONS[h.icon]||BookOpen}));
  const CategoryIcon = (icon?: string) => ICONS[icon || 'book'] || BookOpen;
  const featured=items.slice(0,6);
  const quickActions: { title: string; subtitle: string; icon: any; action: () => void }[] = [
    { title:'My Resources', subtitle:'Progress, plans, lists and saved items', icon:Heart, action:()=>navigation.navigate('MyResources') },
    { title:'Plan My Meals', subtitle:'Weekly meal plans and balanced plates', icon:CalendarDays, action:()=>navigation.navigate('MealPlans') },
    { title:'Grocery Lists', subtitle:'Build and tick off your shopping list', icon:ShoppingCart, action:()=>navigation.navigate('GroceryLists') },
    { title:'Nutrition Reference', subtitle:'Macros, micronutrients and food groups', icon:ShieldCheck, action:()=>navigation.navigate('NutritionReference') },
    { title:'Webinars & Classes', subtitle:'Live and recorded nutrition classes', icon:Play, action:()=>navigation.navigate('Webinars') },
    { title:'Podcast', subtitle:'Nutrition conversations with context', icon:Headphones, action:()=>navigation.navigate('Podcast') },
  ];
  const tools: { title: string; subtitle: string; icon: any; action: () => void }[] = [
    { title:'Weekly Meal Planner', subtitle:'Fill a 7-day plan and export it to groceries', icon:CalendarDays, action:()=>navigation.navigate('MealPlans') },
    { title:'Worksheets', subtitle:'Guided exercises you can finish in minutes', icon:FileText, action:()=>navigation.navigate('Worksheets') },
    { title:'Checklists', subtitle:'Repeating routines with saved progress', icon:ListChecks, action:()=>navigation.navigate('Checklists') },
    { title:'Templates', subtitle:'Printable structures for meals and habits', icon:Sparkles, action:()=>navigation.navigate('ResourceTemplates') },
    { title:'Food Label Reader', subtitle:'Read nutrition labels step by step', icon:BookOpen, action:()=>navigation.navigate('LabelReading') },
  ];
  return <Shell navigation={navigation}>
    <Text style={s.eyebrow}>RESOURCES</Text>
    <Text style={s.title}>Practical guidance to return to.</Text>
    <Text style={s.copy}>Evidence-based guides, tools, and learning resources for everyday nutrition decisions.</Text>
    <Pressable style={s.searchBar} onPress={()=>navigation.navigate('ResourceSearch')}><Search size={18} color={colors.muted}/><Text style={s.searchText}>Search resources, guides, tools…</Text></Pressable>
    <Pressable style={s.savedBar} onPress={()=>navigation.navigate('SavedContent')}><Heart size={16} color={colors.deepTeal}/><Text style={s.savedBarText}>Saved resources</Text><Text style={s.savedBarCount}>{saved.length}</Text></Pressable>
    <View style={s.section}>
      <Text style={s.sectionTitle}>Featured Resources</Text>
      <Text style={s.sectionSub}>Hand-picked guides from the True Diet library.</Text>
      {loading ? <Text style={s.hint}>Loading resources…</Text> : featured.length===0 ? <Text style={s.hint}>No resources are published yet.</Text> : featured.map((item:LibraryItem)=><Pressable key={item.slug} style={s.card} onPress={()=>navigation.navigate('ResourceDetail',{slug:item.slug})}><Text style={s.label}>{(item.category||'').toUpperCase()}</Text><Text style={s.cardTitle}>{item.title}</Text><Text style={s.cardSummary}>{item.subtitle}</Text><Text style={s.read}>{item.durationMinutes?`${item.durationMinutes} min read`:'Guide'}</Text></Pressable>)}
    </View>
    <View style={s.section}>
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.quickGrid}>{quickActions.map((q)=>(<Pressable key={q.title} style={s.quickItem} onPress={q.action}><View style={s.quickIcon}><q.icon size={20} color={colors.deepTeal}/></View><View style={s.quickBody}><Text style={s.quickTitle}>{q.title}</Text><Text style={s.quickSub}>{q.subtitle}</Text></View></Pressable>))}</View>
    </View>
    <View style={s.section}>
      <Text style={s.sectionTitle}>Browse Categories</Text>
      {categories.length===0 ? <Text style={s.hint}>Categories are loading.</Text> : <View style={s.categoryGrid}>{categories.map((c:ResourceCategory)=>{ const Icon = ICONS[c.icon || 'book'] || BookOpen; return <Pressable key={c.slug} style={s.categoryCard} onPress={()=>navigation.navigate('ResourceCategory',{category:c.slug})}><View style={s.categoryIcon}><Icon size={20} color={colors.deepTeal}/></View><View style={s.rowText}><Text style={s.categoryTitle}>{c.title}</Text><Text style={s.categorySub}>{c.description}</Text></View><ChevronRight size={18} color={colors.muted}/></Pressable>; })}</View>}
    </View>
    <View style={s.section}>
      <Text style={s.sectionTitle}>Practical Tools</Text>
      {tools.map((t)=>(<Pressable key={t.title} style={s.card} onPress={t.action}><View style={s.cardHead}><View style={s.rowIcon}><t.icon size={20} color={colors.deepTeal}/></View><ChevronRight size={18} color={colors.muted}/></View><Text style={s.cardTitle}>{t.title}</Text><Text style={s.cardSummary}>{t.subtitle}</Text></Pressable>))}
    </View>
    <View style={s.section}>
      <Text style={s.sectionTitle}>Recommended Resources</Text>
      {loading ? <Text style={s.hint}>Loading recommendations…</Text> : recommended.map((item:LibraryItem)=><Pressable key={item.slug} style={s.card} onPress={()=>navigation.navigate('ResourceDetail',{slug:item.slug})}><Text style={s.label}>{(item.category||'').toUpperCase()}</Text><Text style={s.cardTitle}>{item.title}</Text><Text style={s.cardSummary}>{item.subtitle}</Text><Text style={s.read}>{item.durationMinutes?`${item.durationMinutes} min read`:'Guide'}</Text></Pressable>)}
    </View>
    <View style={s.section}>
      <Text style={s.sectionTitle}>Recently Added</Text>
      {loading ? <Text style={s.hint}>Loading recent resources…</Text> : recently.map((item:LibraryItem)=><Pressable key={item.slug} style={s.card} onPress={()=>navigation.navigate('ResourceDetail',{slug:item.slug})}><Text style={s.label}>{(item.category||'').toUpperCase()}</Text><Text style={s.cardTitle}>{item.title}</Text><Text style={s.cardSummary}>{item.subtitle}</Text><Text style={s.read}>{item.durationMinutes?`${item.durationMinutes} min read`:'Guide'}</Text></Pressable>)}
    </View>
    <View style={s.section}>
      <Text style={s.sectionTitle}>My Saved Resources</Text>
      {saved.length===0 ? <Text style={s.hint}>Nothing saved yet. Tap save on any resource to keep it here.</Text> : saved.map((item:ContentSummary)=><Pressable key={item.id} style={s.card} onPress={()=>navigation.navigate(item.route||'ResourceDetail',{title:item.title})}><Text style={s.label}>{(item.type||'').toUpperCase()}</Text><Text style={s.cardTitle}>{item.title}</Text><Text style={s.cardSummary}>{item.subtitle}</Text></Pressable>)}
    </View>
    {continueItems.length>0 && <View style={s.section}>
      <Text style={s.sectionTitle}>Continue Where You Left Off</Text>
      {continueItems.map((p)=><Pressable key={p.slug} style={s.card} onPress={()=>navigation.navigate('ResourceDetail',{slug:p.slug})}><Text style={s.label}>{p.type.toUpperCase()}</Text><Text style={s.cardTitle}>{p.title}</Text><Text style={s.cardSummary}>{p.progress}% explored</Text></Pressable>)}
    </View>}
  </Shell>;
}

export function ResourceDetailScreen({navigation,route}:any){
  const slug=route?.params?.slug as string|undefined;
  const fallbackTitle=route?.params?.title||'A practical nutrition guide';
  const [resource,setResource]=useState<(LibraryItem & { body?: string }) | null>(null);
  const [saving,setSaving]=useState(false);
  const [finishing,setFinishing]=useState(false);
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(Boolean(slug));
  useEffect(()=>{let active=true;if(!slug){setLoading(false);return()=>{active=false;};}setLoading(true);setDone(false);loadResourceBySlug(slug).then((r)=>{if(active)setResource(r);}).catch(()=>{if(active)setResource(null);}).finally(()=>{if(active)setLoading(false);});recordResourceView(slug);return()=>{active=false;};},[slug]);
  const onFinish=async()=>{if(!slug||finishing)return;setFinishing(true);try{await completeResource(slug);setDone(true);Alert.alert('Nice work','Marked as complete. Find it under My Resources > Completed.');}catch(e:any){Alert.alert('Could not update',e?.message||'Please sign in and try again.');}finally{setFinishing(false);}};
  const title=resource?.title || fallbackTitle;
  const onSave=async()=>{if(saving)return;setSaving(true);const id=`resource-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;try{await saveContent(id,{title,subtitle:'Guide',route:'ResourceDetail',type:'resource'});Alert.alert('Saved','This resource was added to your saved content.');}catch(e:any){Alert.alert('Could not save',e?.message||'Please try again.');}finally{setSaving(false);}};
  return <Shell navigation={navigation}><Text style={s.eyebrow}>RESOURCE</Text><Text style={s.title}>{title}</Text>{resource?.category?<Text style={s.meta}>{resource.category}</Text>:null}{loading?<Text style={s.hint}>Loading this resource…</Text>:<><Text style={s.copy}>{resource?.subtitle||'Use this evidence-based resource at your own pace. It is designed to help you build understanding, not follow rigid food rules.'}</Text><View style={s.callout}><Text style={s.calloutLabel}>HOW TO USE THIS</Text><Text style={s.calloutText}>Read a section at a time. Notice what feels realistic for your life, and start there — small, steady steps are easier to keep.</Text></View>{(resource?.body?[{h:'Overview',b:resource.body}]:[['Start with understanding','Before changing anything, get curious about what you already do and why. Awareness is the foundation of change.'],['Make it flexible','Adapt every suggestion to your culture, budget, preferences and schedule. There is no single correct way.'],['Focus on addition','Think about what you can include — more plants, protein, fluids and sleep — rather than what to remove.'],['Return often','This guide is meant to be revisited. Understanding builds gradually, and reminders help.']]).map((item:any,i:number)=>{const h=item.h||item[0];const b=item.b||item[1];return <View key={h||i} style={s.section}><Text style={s.sectionTitle}>{h}</Text><Text style={s.sectionText}>{b}</Text></View>;})}</>}<Pressable style={[s.cta,saving&&{opacity:.6}]} disabled={saving} onPress={onSave}><Text style={s.ctaText}>{saving?'Saving...':'Save Resource'}</Text></Pressable>{slug?<><Pressable style={[s.cta,s.doneStyle,finishing&&{opacity:.6}]} disabled={finishing||done} onPress={onFinish}><Text style={[s.ctaText,done&&{color:colors.deepTeal}]}>{done?'Completed ✓':finishing?'Saving...':'Mark Complete'}</Text></Pressable></>:null}</Shell>;
}

export function ResourceSearchScreen({navigation}:any){
  const [query,setQuery]=useState('');
  const [debounced,setDebounced]=useState('');
  const [type,setType]=useState('all');
  const [category,setCategory]=useState('all');
  const [results,setResults]=useState<LibraryItem[]>([]);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>{setDebounced(query.trim());},300);return()=>{clearTimeout(t);};},[query]);
  useEffect(()=>{let active=true;setLoading(true);searchResources(debounced||'resource',type==='all'?'resource':type,category==='all'?undefined:category).then((r)=>{if(active)setResults(r);}).catch(()=>{if(active)setResults([]);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[debounced,type,category]);
  const TYPE_OPTIONS=[{value:'all',label:'All'},{value:'resource',label:'Guides'},{value:'article',label:'Articles'},{value:'myth',label:'Myths'},{value:'podcast',label:'Podcasts'},{value:'webinar',label:'Webinars'},{value:'class',label:'Classes'}];
  return <SafeAreaView style={s.safe}><ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><Pressable style={s.back} onPress={()=>navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={6}><ArrowLeft size={22} color={colors.text}/></Pressable><Text style={s.eyebrow}>SEARCH</Text><Text style={s.title}>Find what you need.</Text><Text style={s.copy}>Search True Diet guides, articles, myths, podcasts, and classes.</Text><View style={s.searchBar}><Search size={18} color={colors.muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search resources…" placeholderTextColor={colors.muted} style={s.searchInput}/></View><View style={s.chipRow}>{TYPE_OPTIONS.map((o)=><Pressable key={o.value} style={type===o.value?s.chipActive:s.chip} onPress={()=>setType(o.value)}><Text style={type===o.value?s.chipTextActive:s.chipText}>{o.label}</Text></Pressable>)}</View>{loading?<Text style={s.hint}>Searching…</Text>:<><Text style={s.resultCount}>{results.length} result{results.length===1?'':'s'}</Text>{results.length===0?<Text style={s.hint}>No results found. Try a different search.</Text>:results.map((r:LibraryItem)=><Pressable key={r.slug} style={s.card} onPress={()=>navigation.navigate('ResourceDetail',{slug:r.slug})}><Text style={s.label}>{(r.category||'').toUpperCase()}</Text><Text style={s.cardTitle}>{r.title}</Text><Text style={s.cardSummary}>{r.subtitle}</Text><Text style={s.read}>{r.durationMinutes?`${r.durationMinutes} min read`:'Guide'}</Text></Pressable>)}</>}</ScrollView></SafeAreaView>;
}

export function ResourceCategoryScreen({navigation,route}:any){
  const category=(route?.params?.category || 'general').toLowerCase();
  const [items,setItems]=useState<LibraryItem[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;setLoading(true);loadLibrary('resource').then((all)=>{if(!active)return;const filtered=all.filter((i)=>Boolean(i.category)&&i.category!.toLowerCase()===category);setItems(filtered);}).catch(()=>{if(active)setItems([]);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[category]);
  const title=(route?.params?.title as string) || category.split('-').map((w)=>w[0].toUpperCase()+w.slice(1)).join(' ');
  return <SafeAreaView style={s.safe}><ScrollView style={{ width: '100%' }} contentContainerStyle={s.content}><Pressable style={s.back} onPress={()=>navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={6}><ArrowLeft size={22} color={colors.text}/></Pressable><Text style={s.eyebrow}>CATEGORY</Text><Text style={s.title}>{title}</Text><Text style={s.copy}>Resources in this category.</Text>{loading?<Text style={s.hint}>Loading resources…</Text>:<><Text style={s.resultCount}>{items.length} resource{items.length===1?'':'s'}</Text>{items.length===0?<Text style={s.hint}>No resources in this category yet.</Text>:items.map((item:LibraryItem)=><Pressable key={item.slug} style={s.card} onPress={()=>navigation.navigate('ResourceDetail',{slug:item.slug})}><Text style={s.label}>{(item.category||'').toUpperCase()}</Text><Text style={s.cardTitle}>{item.title}</Text><Text style={s.cardSummary}>{item.subtitle}</Text><Text style={s.read}>{item.durationMinutes?`${item.durationMinutes} min read`:'Guide'}</Text></Pressable>)}</>}</ScrollView></SafeAreaView>;
}

export function NutritionReferenceScreen({navigation}:any){
  const [categories,setCategories]=useState<ResourceCategory[]>([]);
  const [items,setItems]=useState<LibraryItem[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;Promise.all([loadResourceCategories(),loadLibrary('resource')]).then(([c,i])=>{if(active){setCategories(c);setItems(i);}}).catch(()=>{/* offline keeps the static copy below */}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
  const ICONS:Record<string,any>={book:BookOpen,heart:Heart,shield:ShieldCheck,calendar:CalendarDays,headphones:Headphones,cart:ShoppingCart};
  return <Shell navigation={navigation}><Text style={s.eyebrow}>REFERENCE</Text><Text style={s.title}>Nutrition answers, at a glance.</Text><Text style={s.copy}>Quick-reference guides for the questions that come up at the supermarket, the dinner table and the gym.</Text>{loading?<Text style={s.hint}>Loading reference topics…</Text>:<><View style={s.categoryGrid}>{categories.map((c)=>{const Icon=ICONS[c.icon||'book']||BookOpen;return <Pressable key={c.slug} style={s.categoryCard} onPress={()=>navigation.navigate('ResourceCategory',{category:c.slug})}><View style={s.categoryIcon}><Icon size={20} color={colors.deepTeal}/></View><View style={s.rowText}><Text style={s.categoryTitle}>{c.title}</Text><Text style={s.categorySub}>{c.description}</Text></View></Pressable>;})}</View><View style={s.section}><Text style={s.sectionTitle}>Reference Guides</Text>{items.length===0?<Text style={s.hint}>Reference guides are being added. Check back soon.</Text>:items.slice(0,10).map((i)=><Pressable key={i.slug} style={s.card} onPress={()=>navigation.navigate('ResourceDetail',{slug:i.slug})}><Text style={s.label}>{(i.category||'').toUpperCase()}</Text><Text style={s.cardTitle}>{i.title}</Text><Text style={s.cardSummary}>{i.subtitle}</Text></Pressable>)}</View></>}</Shell>;
}

export function BlogScreen({navigation}:any){
  const articles=allArticles().slice(0,9);
  return <Shell navigation={navigation}><Text style={s.eyebrow}>BLOG & ARTICLES</Text><Text style={s.title}>Current nutrition, clearly explained.</Text><Text style={s.copy}>Research context, practical education, and thoughtful answers to nutrition questions.</Text><View style={s.list}>{articles.map(({topic,article})=><Pressable key={article.id} style={s.card} onPress={()=>navigation.navigate('Article',{articleId:article.id,title:article.title})}><Text style={s.label}>{topic.title.toUpperCase()}</Text><Text style={s.cardTitle}>{article.title}</Text><Text style={s.cardSummary}>{article.summary}</Text><Text style={s.read}>{article.readTime} read</Text></Pressable>)}</View></Shell>;
}



export function WebinarsScreen({navigation}:any){
  const [items,setItems]=useState<LibraryItem[]>([]);
  const [regs,setRegs]=useState<Registration[]>([]);
  useEffect(()=>{let active=true;Promise.all([loadLibrary('webinar'),loadLibrary('class')]).then(([a,b])=>{if(active)setItems([...a,...b]);}).catch(()=>undefined);return()=>{active=false;};},[]);
  useFocusEffect(useCallback(()=>{let active=true;listRegistrations().then(r=>{if(active)setRegs(r);}).catch(()=>undefined);return()=>{active=false;};},[]));
  const onUnregister=(reg:Registration)=>{
    Alert.alert('Cancel registration',`Remove your spot for ${reg.title}?`,[
      {text:'Keep',style:'cancel'},
      {text:'Remove',style:'destructive',onPress:async()=>{
        try{
          await unregisterFromSession(reg.slug);
          setRegs(prev=>prev.filter(r=>r.slug!==reg.slug));
        }catch(e:any){
          Alert.alert('Could not update',e?.message||'Please try again.');
        }
      }},
    ]);
  };
  const sessions=items.length?items.map((i:LibraryItem)=>({title:i.title,meta:i.subtitle,live:i.slug.startsWith('webinar-'),detail:i.durationMinutes?i.durationMinutes+' min · '+i.category:(i.subtitle||'')})):webinarSessions;
  return <Shell navigation={navigation}><Text style={s.eyebrow}>WEBINARS & CLASSES</Text><Text style={s.title}>Learn with Maureen.</Text><Text style={s.copy}>Live sessions and recorded classes on practical, evidence-based nutrition topics.</Text>{items.length?null:<Text style={s.hint}>{SAMPLE_PREVIEW_NOTICE}</Text>}{regs.length>0?<><Text style={s.label}>YOUR REGISTRATIONS</Text><View style={s.list}>{regs.map(r=><View key={r.id} style={s.row}><View style={s.rowIcon}><CalendarDays size={21} color={colors.deepTeal}/></View><View style={s.rowText}><Text style={s.rowTitle}>{r.title}</Text><Text style={s.rowSub}>Registered · {new Date(r.registeredAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</Text></View><Pressable onPress={()=>onUnregister(r)} hitSlop={10}><Text style={s.regRemove}>Remove</Text></Pressable></View>)}</View></>:null}<View style={s.list}>{sessions.map((w:any)=><Pressable key={w.title} style={s.card} onPress={()=>navigation.navigate('WebinarDetail',{title:w.title,meta:w.meta,live:w.live})}><View style={s.cardHead}><View style={[s.badge,w.live?s.badgeLive:s.badgeRec]}><Text style={[s.badgeText,w.live?s.badgeTextLive:s.badgeTextRec]}>{w.live?'LIVE':'RECORDED'}</Text></View><CalendarDays size={16} color={colors.muted}/></View><Text style={s.cardTitle}>{w.title}</Text><Text style={s.cardSummary}>{w.meta}</Text><Text style={s.read}>{w.detail}</Text></Pressable>)}</View></Shell>;
}

export function WebinarDetailScreen({navigation,route}:any){
  const title=route.params?.title||'A True Diet class';
  const meta=route.params?.meta||'Live class';
  const live=route.params?.live!==false;
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const onRegister=async()=>{
    if(busy)return;
    setBusy(true);setError('');
    try{
      // The registration is stored in the database, so it can be listed on
      // any device the member signs in from.
      await registerForSession({
        title,
        slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
        kind:live?'webinar':'class',
      });
      navigation.navigate('WebinarConfirmation',{title});
    }catch(e:any){
      setError(e?.message||'Could not register for this session.');
    }finally{setBusy(false);}
  };
  return <Shell navigation={navigation}><Text style={s.eyebrow}>{live?'LIVE WEBINAR':'RECORDED CLASS'}</Text><Text style={s.title}>{title}</Text><Text style={s.meta}>{meta}</Text><View style={s.callout}><Text style={s.calloutLabel}>WHAT YOU'LL LEARN</Text><Text style={s.calloutText}>A practical, evidence-based walkthrough with time for educational questions. No rigid food rules - just context you can apply.</Text></View>{[['Format','45-60 minutes, presentation plus Q&A.'],['Who it is for','Anyone who wants clearer, calmer nutrition understanding.'],['What to bring','A question you have been wondering about - and curiosity.']].map(([h,b])=><View key={h} style={s.section}><Text style={s.sectionTitle}>{h}</Text><Text style={s.sectionText}>{b}</Text></View>)}{error?<Text style={s.error}>{error}</Text>:null}<Pressable style={[s.cta,busy&&{opacity:.6}]} disabled={busy} onPress={()=>live?onRegister():Alert.alert('Recording not ready','This recording is not available to play yet. Please check back soon.')}><Text style={s.ctaText}>{busy?'Registering...':(live?'Register for Webinar':'Watch Recording')}</Text></Pressable></Shell>;
}

export function RecordedClassesScreen({navigation}:any){
  const [items,setItems]=useState<LibraryItem[]>([]);
  useEffect(()=>{let active=true;loadLibrary('class').then(r=>{if(active)setItems(r);}).catch(()=>undefined);return()=>{active=false;};},[]);
  const source=items.length?items.map((i:LibraryItem)=>({title:i.title,meta:i.subtitle,live:false,detail:i.durationMinutes?i.durationMinutes+' min · '+i.category:(i.subtitle||'')})):webinarSessions.map((w:WebinarSession)=>({title:w.title,meta:w.meta,live:false,detail:w.detail}));
  const recorded=source.filter((w:any)=>!w.live);
  return <Shell navigation={navigation}><Text style={s.eyebrow}>RECORDED CLASSES</Text><Text style={s.title}>Keep learning on your time.</Text><Text style={s.copy}>Replay practical, evidence-based lessons whenever you need them.</Text>{items.length?null:<Text style={s.hint}>{SAMPLE_PREVIEW_NOTICE}</Text>}<View style={s.list}>{recorded.map((w:any)=><Pressable key={w.title} style={s.card} onPress={()=>navigation.navigate('WebinarDetail',{title:w.title,meta:w.meta,live:false})}><View style={s.cardHead}><View style={[s.badge,s.badgeRec]}><Text style={[s.badgeText,s.badgeTextRec]}>RECORDED</Text></View><Play size={16} color={colors.muted}/></View><Text style={s.cardTitle}>{w.title}</Text><Text style={s.read}>{w.detail}</Text></Pressable>)}</View></Shell>;
}



export function PodcastScreen({navigation}:any){
  const [items,setItems]=useState<LibraryItem[]>([]);
  useEffect(()=>{let active=true;loadLibrary('podcast').then(r=>{if(active)setItems(r);}).catch(()=>undefined);return()=>{active=false;};},[]);
  const episodes=items.length?items.map((i:LibraryItem)=>({title:i.title,meta:i.subtitle,id:i.slug.replace(/^podcast-/,'')})):podcastEpisodes;
  return <Shell navigation={navigation}><Text style={s.eyebrow}>TRUE DIET PODCAST</Text><Text style={s.title}>Nutrition conversations with context.</Text><Text style={s.copy}>Practical discussions about how nutrition information reaches us and how to think about food with more context.</Text>{items.length?null:<Text style={s.hint}>{SAMPLE_PREVIEW_NOTICE}</Text>}<View style={s.list}>{episodes.map((e:any)=><Pressable key={e.title} style={s.card} onPress={()=>navigation.navigate('PodcastDetail',{title:e.title,meta:e.meta,id:e.id})}><View style={s.cardHead}><View style={[s.badge,s.badgeRec]}><Text style={[s.badgeText,s.badgeTextRec]}>EPISODE</Text></View><Headphones size={16} color={colors.muted}/></View><Text style={s.cardTitle}>{e.title}</Text><Text style={s.cardSummary}>{e.meta}</Text></Pressable>)}</View></Shell>;
}

export function PodcastDetailScreen({navigation,route}:any){
  const title=route.params?.title||'A True Diet episode';
  const meta=route.params?.meta||'Episode';
  return <Shell navigation={navigation}><Text style={s.eyebrow}>PODCAST EPISODE</Text><Text style={s.title}>{title}</Text><Text style={s.meta}>{meta}</Text><View style={s.callout}><Text style={s.calloutLabel}>EPISODE NOTES</Text><Text style={s.calloutText}>A calm, practical conversation about how nutrition information reaches us, why simple messages spread, and how to think about food with more context.</Text></View>{[['Key takeaways','Nutrition claims are easier to repeat than to verify. Look for the broader evidence, not a single headline.'],['Related resources','Pair this episode with the Myths & Misinformation topic in the Learn library.'],['Listen','Available from this page when the episode is published.']].map(([h,b])=><View key={h} style={s.section}><Text style={s.sectionTitle}>{h}</Text><Text style={s.sectionText}>{b}</Text></View>)}<Pressable style={s.cta} onPress={()=>Alert.alert('Episode not ready','This episode is not available to stream yet. Please check back soon.')}><Text style={s.ctaText}>Open Listen Link</Text></Pressable></Shell>;
}

const s=StyleSheet.create({regRemove:{fontFamily:'Roboto',fontSize:12,fontWeight:'700',color:'#B91C1C'},hint:{fontFamily:'Roboto',fontSize:12,color:colors.muted,marginTop:12},error:{fontFamily:'Roboto',fontSize:13,color:'#B91C1C',marginTop:16},safe:{flex:1,backgroundColor:colors.softBlue,alignItems:'center'},content:{width:'100%',maxWidth:CONTENT_MAX_WIDTH,padding:24,paddingBottom:45,backgroundColor:colors.background},back:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center',marginBottom:25},eyebrow:{fontFamily:'Roboto',color:colors.green,fontSize:10,fontWeight:'700',letterSpacing:1.4},title:{fontFamily:'Roboto',fontSize:30,lineHeight:38,fontWeight:'700',color:colors.text,marginTop:8},copy:{fontFamily:'Roboto',fontSize:14,lineHeight:22,color:colors.textSecondary,marginTop:9},meta:{fontFamily:'Roboto',fontSize:12,color:colors.textSecondary,marginTop:10},list:{marginTop:26,gap:11},row:{minHeight:76,flexDirection:'row',alignItems:'center',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:18,padding:14},rowIcon:{width:44,height:44,borderRadius:14,backgroundColor:colors.softGreen,alignItems:'center',justifyContent:'center'},rowText:{flex:1,marginHorizontal:14},rowTitle:{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:colors.text},rowSub:{fontFamily:'Roboto',fontSize:12,color:colors.textSecondary,marginTop:3},card:{backgroundColor:colors.surface,borderRadius:20,borderWidth:1,borderColor:colors.border,padding:18,marginBottom:11},cardHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},label:{fontFamily:'Roboto',color:colors.green,fontSize:9,letterSpacing:1.1,fontWeight:'700'},cardTitle:{fontFamily:'Roboto',fontSize:17,lineHeight:24,fontWeight:'700',color:colors.text,marginTop:10},cardSummary:{fontFamily:'Roboto',fontSize:13,lineHeight:20,color:colors.textSecondary,marginTop:7},read:{fontFamily:'Roboto',color:colors.deepTeal,fontSize:12,fontWeight:'700',marginTop:12},badge:{paddingHorizontal:10,paddingVertical:5,borderRadius:10},badgeLive:{backgroundColor:colors.softOrange},badgeRec:{backgroundColor:colors.softBlue},badgeText:{fontFamily:'Roboto',fontSize:10,letterSpacing:1,fontWeight:'700'},badgeTextLive:{color:colors.orange},badgeTextRec:{color:colors.deepTeal},play:{width:38,height:38,borderRadius:13,backgroundColor:colors.deepTeal,alignItems:'center',justifyContent:'center'},callout:{backgroundColor:colors.softGreen,borderRadius:20,padding:20,marginTop:25},calloutLabel:{fontFamily:'Roboto',color:colors.green,fontSize:10,fontWeight:'700',letterSpacing:1.2},calloutText:{fontFamily:'Roboto',color:colors.text,fontSize:15,lineHeight:23,marginTop:8},section:{marginTop:30},sectionTitle:{fontFamily:'Roboto',fontSize:21,fontWeight:'700',color:colors.text,marginBottom:9},sectionText:{fontFamily:'Roboto',fontSize:15,lineHeight:25,color:colors.textSecondary},cta:{minHeight:56,paddingVertical:14,paddingHorizontal:16,borderRadius:17,backgroundColor:colors.deepTeal,alignItems:'center',justifyContent:'center',marginTop:30},doneStyle:{backgroundColor:colors.softGreen,borderWidth:1,borderColor:colors.green},ctaText:{fontFamily:'Roboto',fontSize:15,fontWeight:'700',color:'#fff',flexShrink:1,textAlign:'center'},link:{marginTop:16,alignItems:'center'},linkText:{fontFamily:'Roboto',color:colors.deepTeal,fontSize:13,fontWeight:'700'},searchBar:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:16,paddingHorizontal:16,paddingVertical:13},searchText:{fontFamily:'Roboto',fontSize:14,color:colors.muted,flex:1},searchInput:{flex:1,fontSize:14,color:colors.text,fontFamily:'Roboto'},savedBar:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:14,paddingHorizontal:14,paddingVertical:12},savedBarText:{fontFamily:'Roboto',fontSize:13,fontWeight:'700',color:colors.deepTeal},savedBarCount:{fontFamily:'Roboto',fontSize:12,color:colors.muted,marginLeft:'auto'},sectionSub:{fontFamily:'Roboto',fontSize:13,color:colors.textSecondary,marginTop:4},quickGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},quickItem:{flexBasis:'48%',flexGrow:0,minWidth:0,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:16,padding:14,minHeight:92,flexDirection:'column',alignItems:'flex-start'},quickIcon:{width:40,height:40,borderRadius:12,backgroundColor:colors.softGreen,alignItems:'center',justifyContent:'center'},quickBody:{marginTop:10,alignSelf:'stretch'},quickTitle:{fontFamily:'Roboto',fontSize:13,fontWeight:'700',color:colors.text},quickSub:{fontFamily:'Roboto',fontSize:11,lineHeight:16,color:colors.textSecondary,marginTop:3},categoryGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},categoryCard:{flexBasis:'100%',flexGrow:0,minWidth:0,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:16,padding:14,minHeight:76,flexDirection:'row',alignItems:'center'},categoryIcon:{width:40,height:40,borderRadius:12,backgroundColor:colors.softGreen,alignItems:'center',justifyContent:'center'},categoryTitle:{fontFamily:'Roboto',fontSize:13,fontWeight:'700',color:colors.text},categorySub:{fontFamily:'Roboto',fontSize:11,lineHeight:16,color:colors.textSecondary,marginTop:3},resultCount:{fontFamily:'Roboto',fontSize:13,color:colors.textSecondary,marginTop:14},chipRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:14},chip:{borderWidth:1,borderColor:colors.border,borderRadius:999,paddingHorizontal:12,paddingVertical:7,backgroundColor:colors.surface},chipActive:{backgroundColor:colors.deepTeal,borderColor:colors.deepTeal},chipText:{fontFamily:'Roboto',fontSize:12,fontWeight:'700',color:colors.textSecondary},chipTextActive:{fontFamily:'Roboto',fontSize:12,fontWeight:'700',color:'#fff'}});
