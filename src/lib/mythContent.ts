export interface MythSection {
  heading: string;
  body: string;
}

export interface Myth {
  id: string;
  claim: string;
  label: string;
  short: string;
  whatIsTrue: string;
  whyItSpreads: string;
  evidence: string;
  takeaway: string;
}

export const myths: Myth[] = [
  {
    id: 'carbs',
    claim: 'Carbs make you gain weight.',
    label: 'CONTEXT NEEDED',
    short: 'Carbohydrates are one source of energy among several, and weight change depends on the whole pattern, not one nutrient.',
    whatIsTrue:
      'Carbohydrate is the body\u2019s preferred quick energy source, and many carbohydrate-rich foods also provide fiber, vitamins, and minerals. Weight change comes from overall energy balance over time, combined with many other factors. No single nutrient on its own determines body weight.',
    whyItSpreads:
      'Low-carb approaches can lead to fast early water loss, which looks dramatic on a scale. That quick change gets repeated as \u201Ccarbs cause weight gain\u201D even though it does not describe what happens over months.',
    evidence:
      'When calories and protein are matched, controlled studies generally show similar weight outcomes for lower-carb and higher-carb diets. Quality still matters: whole grains, beans, fruit, and vegetables behave differently in the body and in your eating pattern than refined carbohydrates.',
    takeaway:
      'Think about the amount, the type, and the company your carbs keep \u2014 not carbs as a single good-or-bad category.',
  },
  {
    id: 'detox',
    claim: 'You need a detox diet to remove toxins.',
    label: 'LOOK AT THE EVIDENCE',
    short: 'Your liver and kidneys already process and clear waste products continuously. Most \u201Cdetox\u201D products have little supporting evidence.',
    whatIsTrue:
      'The body has sophisticated detoxification systems in the liver, kidneys, lungs, and gut that work every day. Supporting them means eating enough, staying hydrated, and giving the body what it needs \u2014 not buying a special tea or cleanse.',
    whyItSpreads:
      'Detox marketing pairs a vague fear (\u201Ctoxins\u201D) with a quick fix, and short cleanses often produce fast scale changes from water and glycogen, which feel like proof.',
    evidence:
      'Reviews of commercial detox products find little to no evidence for meaningful toxin removal, and some products carry real risks such as laxative dependence, electrolyte problems, or interactions with medications.',
    takeaway:
      'If a product promises to flush \u201Ctoxins,\u201D ask what substance, measured how, and by whom. Clear answers are rare.',
  },
  {
    id: 'late-eating',
    claim: 'Eating after a certain time automatically causes weight gain.',
    label: 'CONTEXT NEEDED',
    short: 'Total intake and overall routine matter more than the clock alone, though late eating can affect sleep and digestion for some people.',
    whatIsTrue:
      'A calorie eaten at 9 p.m. is not stored differently from one eaten at noon. Weight change reflects overall energy balance and long-term patterns. Meal timing is a smaller lever than how much and what you eat across the day.',
    whyItSpreads:
      'Late-night eating is often attached to snacking, larger portions, and disrupted sleep \u2014 so it can correlate with weight gain without being the direct cause.',
    evidence:
      'Some research links eating close to bedtime with poorer sleep quality and less favorable appetite regulation the next day, which can indirectly affect intake. Results vary between people, and timing effects are usually modest compared with total intake.',
    takeaway:
      'If late eating leaves you uncomfortable or disrupts sleep, adjust it for comfort \u2014 not because a clock makes food \u201Cfattening.\u201D',
  },
  {
    id: 'food-cutting',
    claim: 'You need to completely cut out certain foods to eat healthy.',
    label: 'THE BIGGER PICTURE',
    short: 'Healthful eating is about patterns and frequency, not perfect avoidance of individual foods.',
    whatIsTrue:
      'A nourishing pattern leaves room for a wide range of foods, including ones eaten mainly for enjoyment. What tends to matter most is how often and how much, alongside the foods that make up the bulk of your diet.',
    whyItSpreads:
      'All-or-nothing rules are simple to follow and easy to market. They also create a clear villain, which is more memorable than a nuanced pattern.',
    evidence:
      'Research on dietary patterns consistently supports flexibility: Mediterranean, plant-forward, and other balanced patterns include treats and still support health. Restrictive \u201Ccut out this food\u201D rules are harder to sustain and can worsen the relationship with food.',
    takeaway:
      'Ask \u201CHow does this food fit into my overall pattern?\u201D rather than \u201CIs this food banned?\u201D',
  },
  {
    id: 'fat',
    claim: 'Eating fat makes you fat.',
    label: 'CONTEXT NEEDED',
    short: 'Dietary fat is calorie-dense but essential, and it does not automatically become body fat.',
    whatIsTrue:
      'Fat is necessary for hormones, cell membranes, and absorbing vitamins A, D, E, and K. Gram for gram it provides more calories than carbohydrate or protein, which is why portions matter \u2014 but the nutrient itself is not the cause of fat gain.',
    whyItSpreads:
      'Because fat is calorie-dense, large portions add up quickly. Decades of low-fat messaging then turned that practical point into \u201Cfat makes you fat.\u201D',
    evidence:
      'Studies comparing higher- and lower-fat diets with matched calories show similar weight outcomes. Fat quality matters: unsaturated fats from olive oil, nuts, seeds, and fish are associated with better heart health than trans fats.',
    takeaway:
      'Choose mostly unsaturated fats, watch portions of calorie-dense foods, and drop the idea that fat is the enemy.',
  },
  {
    id: 'sugar',
    claim: 'Sugar is the single cause of weight gain.',
    label: 'CONTEXT NEEDED',
    short: 'Added sugar contributes to intake and health risk, but it is one factor among many \u2014 not the sole driver of weight.',
    whatIsTrue:
      'Diets high in added sugar and sugary drinks are associated with worse health outcomes, and reducing them is a reasonable goal for most people. Still, body weight reflects total energy balance, activity, sleep, stress, medications, genetics, and environment.',
    whyItSpreads:
      'Sugar is easy to name, easy to see on labels, and evokes a strong emotional response, which makes it a memorable headline cause.',
    evidence:
      'Large reviews find that reducing sugary drinks supports modest weight loss, and that overall dietary patterns and total intake matter alongside sugar. Focusing on sugar alone while ignoring portions and pattern misses much of the picture.',
    takeaway:
      'Reduce added sugar where it crowds out more nourishing choices \u2014 without treating a single nutrient as the whole story.',
  },
  {
    id: 'metabolism',
    claim: 'You can boost your metabolism to lose weight fast.',
    label: 'LOOK AT THE EVIDENCE',
    short: 'Metabolism is largely determined by body size, genetics, and age. \u201CMetabolism boosters\u201D rarely make a meaningful difference.',
    whatIsTrue:
      'Resting metabolic rate is mostly set by how much tissue you have, plus age and genetics. It can shift modestly with muscle mass, activity, and how much you eat, but it is not a dial you can crank up quickly.',
    whyItSpreads:
      'The word \u201Cmetabolism\u201D sounds mechanical and controllable, which makes a supplement or a spicy-food trick sound plausible.',
    evidence:
      'Most over-the-counter \u201Cmetabolism boosters\u201D produce tiny or temporary effects, if any, and some carry side effects. Muscle-building activity raises resting energy use slightly over time, but the effect is gradual, not fast.',
    takeaway:
      'Sustainable change comes from consistent eating and activity patterns, not from a bottle that promises to speed up your body.',
  },
  {
    id: 'gluten',
    claim: 'Gluten-free is healthier for everyone.',
    label: 'CONTEXT NEEDED',
    short: 'A gluten-free diet is medically necessary for some people and not automatically healthier for everyone else.',
    whatIsTrue:
      'Gluten must be strictly avoided by people with celiac disease and is often avoided by those with non-celiac gluten sensitivity. For everyone else, whole grains containing gluten also provide fiber, B vitamins, and minerals.',
    whyItSpreads:
      'Gluten-free eating became widely popular through celebrity and wellness culture, and \u201Cfree from\u201D labels can sound like an upgrade even without a medical reason.',
    evidence:
      'For people without a gluten-related condition, studies do not show health benefits from going gluten-free. Some gluten-free packaged products are lower in fiber and higher in added sugar and cost, so the swap is not automatically an improvement.',
    takeaway:
      'Choose gluten-free for a medical reason, not because the label sounds healthier.',
  },
  {
    id: 'breakfast',
    claim: 'Skipping breakfast slows your metabolism.',
    label: 'CONTEXT NEEDED',
    short: 'Breakfast habits affect people differently. Skipping it does not \u201Cdamage\u201D metabolism.',
    whatIsTrue:
      'Some people feel better and eat more evenly when they have breakfast; others naturally eat later and do fine. Total daily intake and overall pattern matter more than whether the first meal is at 7 a.m. or noon.',
    whyItSpreads:
      'Old messaging framed breakfast as the most important meal and linked skipping it to slower metabolism and weight gain, a claim that outran the evidence.',
    evidence:
      'Randomized trials that assign people to eat or skip breakfast generally find little or no difference in weight change. Appetite and energy responses vary by person.',
    takeaway:
      'Eat breakfast if it serves you; skip it if you genuinely are not hungry. Consistency and overall intake matter more.',
  },
  {
    id: 'protein',
    claim: 'More protein always means more muscle.',
    label: 'THE BIGGER PICTURE',
    short: 'Muscle growth needs enough protein and resistance training together \u2014 extra protein alone does not build muscle.',
    whatIsTrue:
      'Protein provides the building blocks for muscle, and most active adults meet their needs without extreme intake. Beyond a point, additional protein is used for energy or stored rather than turned into muscle.',
    whyItSpreads:
      'Protein is strongly associated with fitness marketing, and \u201Cmore is better\u201D is an intuitive but incomplete message.',
    evidence:
      'Research shows muscle gains come from progressive resistance training plus adequate \u2014 not maximal \u2014 protein, spread across the day. Total energy and training stimulus usually matter more than pushing protein very high.',
    takeaway:
      'Pair consistent strength training with enough protein from varied foods; more protein alone will not add muscle.',
  },
];

function normalizeKey(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .trim()
    .toLowerCase();
}

export function findMyth(id?: string): Myth {
  if (id) {
    const byId = myths.find((m) => m.id === id);
    if (byId) return byId;
    const key = normalizeKey(id);
    const byClaim = myths.find((m) => normalizeKey(m.claim) === key);
    if (byClaim) return byClaim;
  }
  return myths[0];
}

export function searchMyths(query: string): Myth[] {
  const term = query.trim().toLowerCase();
  if (!term) return myths;
  return myths.filter(
    (m) =>
      m.claim.toLowerCase().includes(term) ||
      m.short.toLowerCase().includes(term) ||
      m.label.toLowerCase().includes(term) ||
      m.takeaway.toLowerCase().includes(term)
  );
}
