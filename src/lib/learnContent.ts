export interface ArticleSection {
  heading: string;
  body: string;
}

export interface LearnArticle {
  id: string;
  title: string;
  readTime: string;
  summary: string;
  sections: ArticleSection[];
}

export interface LearnTopic {
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  articles: LearnArticle[];
}

export const learnTopics: LearnTopic[] = [
  {
    slug: 'nutrition-basics',
    title: 'Nutrition Basics',
    subtitle: 'Build a strong foundation',
    intro:
      'The fundamentals of eating well, explained without rigid rules. These articles help you understand what nutrition is really about.',
    articles: [
      {
        id: 'nb-1',
        title: 'What "healthy" eating actually means',
        readTime: '6 min',
        summary: 'Healthy eating is a pattern, not a single meal or a list of allowed foods.',
        sections: [
          {
            heading: 'A pattern, not a perfect day',
            body: 'Health is built from what you do most of the time, not from any single meal. A balanced overall pattern has room for a wide variety of foods, including the ones you simply enjoy. When you zoom out, occasional indulgences matter far less than your everyday habits.',
          },
          {
            heading: 'Variety and balance',
            body: 'Most people benefit from a mix of vegetables and fruit, sources of protein, satisfying carbohydrates, and fats. No single food needs to carry the whole load. Thinking in terms of addition — what you can include — tends to be more sustainable than thinking in terms of restriction.',
          },
          {
            heading: 'Why flexibility helps',
            body: 'Rigid food rules are hard to keep and often backfire. Flexible guidelines that fit your culture, budget, preferences and schedule are far easier to maintain, and consistency over time is what actually shapes long-term health.',
          },
        ],
      },
      {
        id: 'nb-2',
        title: 'Building a balanced plate',
        readTime: '5 min',
        summary: 'A simple mental template you can adapt to almost any cuisine or situation.',
        sections: [
          {
            heading: 'A flexible template',
            body: 'A helpful starting point is to think of a plate with several components: a protein source, a source of carbohydrates, and vegetables or fruit. This is a template — not a rule — and it can be adapted to soups, bowls, sandwiches, or family-style meals.',
          },
          {
            heading: 'Adapt to your context',
            body: 'Your plate will look different at a restaurant, during travel, or at a celebration. The template is a tool to help you notice balance, not a scorecard. Some meals will be mostly carbohydrates; others mostly protein. That is normal.',
          },
          {
            heading: 'Listening to satisfaction',
            body: 'Balance also includes satisfaction. Meals that are enjoyable and filling tend to keep you more comfortable and make steady habits easier to maintain.',
          },
        ],
      },
      {
        id: 'nb-3',
        title: 'Why no single food defines your diet',
        readTime: '4 min',
        summary: 'Zooming out from individual foods to overall patterns.',
        sections: [
          {
            heading: 'The bigger picture',
            body: 'Nutrition headlines often focus on one food or nutrient at a time. In reality, foods are eaten together, as part of meals and patterns, and those combinations are what matter most.',
          },
          {
            heading: 'Avoiding the good/bad trap',
            body: 'Labelling foods as "good" or "bad" can create guilt and all-or-nothing thinking. Most foods can fit into a healthy pattern in some amount, and the dose and frequency usually matter more than the food itself.',
          },
        ],
      },
    ],
  },
  {
    slug: 'energy-balance',
    title: 'Calories & Energy Balance',
    subtitle: 'Understand energy needs',
    intro:
      'Calories are a useful concept, but they are not the whole story. These articles explain energy balance in a practical, low-stress way.',
    articles: [
      {
        id: 'eb-1',
        title: 'Energy balance, simply explained',
        readTime: '5 min',
        summary: 'The relationship between the energy you take in and the energy you use.',
        sections: [
          {
            heading: 'The basic idea',
            body: 'Your body uses energy for everything from breathing to exercise. Energy balance describes the relationship between energy taken in from food and drink and energy used by the body. When these are roughly matched over time, weight tends to be stable.',
          },
          {
            heading: 'It is dynamic, not static',
            body: 'Energy balance is not a fixed daily equation. Appetite, activity, hormones and metabolism all shift over time, which is why a single day or a single meal rarely decides anything.',
          },
        ],
      },
      {
        id: 'eb-2',
        title: 'Why calories are a range, not a rule',
        readTime: '4 min',
        summary: 'Estimates, averages, and why precision is less important than direction.',
        sections: [
          {
            heading: 'All numbers are estimates',
            body: 'Calorie values on labels and trackers are estimates. Your actual needs vary from day to day. Treating these numbers as precise rules can create unnecessary stress without improving outcomes.',
          },
          {
            heading: 'Direction over precision',
            body: 'Rather than chasing exact numbers, it often helps to focus on steady habits: regular meals, adequate protein, plenty of plants, and enjoyable movement.',
          },
        ],
      },
      {
        id: 'eb-3',
        title: 'Metabolism myths and realities',
        readTime: '6 min',
        summary: 'What metabolism is, and what it is not.',
        sections: [
          {
            heading: 'What metabolism means',
            body: 'Metabolism refers to all the chemical processes your body uses to convert food into energy. A large share of the energy you use each day goes toward basic functions that happen without any deliberate effort.',
          },
          {
            heading: 'What you can influence',
            body: 'While some factors are outside your control, muscle mass, activity, sleep and overall health can all influence how your body uses energy. There is rarely a "broken" metabolism behind stalled progress.',
          },
        ],
      },
    ],
  },
  {
    slug: 'macronutrients',
    title: 'Macronutrients',
    subtitle: 'Protein, carbohydrates & fats',
    intro:
      'Protein, carbohydrates and fats each play useful roles. Understanding them helps you make calm, informed choices.',
    articles: [
      {
        id: 'mn-1',
        title: 'Protein: context over hype',
        readTime: '7 min',
        summary: 'Why protein matters, and how much is usually enough.',
        sections: [
          {
            heading: 'Why protein matters',
            body: 'Protein provides the building blocks for muscles, organs, and many other tissues, and it helps meals feel satisfying. It can come from animal and plant sources alike.',
          },
          {
            heading: 'Spreading it out',
            body: 'Many people find it helpful to include a source of protein at most meals rather than concentrating it in one. This can support fullness and steady energy across the day.',
          },
          {
            heading: 'More is not always better',
            body: 'Very high protein intakes are not necessary for most people and can crowd out other useful foods. A reasonable, varied intake that fits your preferences and activity is a sound approach.',
          },
        ],
      },
      {
        id: 'mn-2',
        title: 'Carbohydrates without fear',
        readTime: '5 min',
        summary: 'The role of carbohydrates in energy and everyday eating.',
        sections: [
          {
            heading: 'A primary energy source',
            body: 'Carbohydrates are a main source of energy for the body and brain. They appear in grains, fruit, vegetables, legumes, and dairy, as well as in more processed foods.',
          },
          {
            heading: 'Quality and context',
            body: 'Fiber-rich, minimally processed carbohydrates tend to be more filling and come with more nutrients. That said, all carbohydrates can fit into a balanced pattern in the right amounts and context.',
          },
        ],
      },
      {
        id: 'mn-3',
        title: 'Fats: the basics',
        readTime: '5 min',
        summary: 'Why fat is essential, and how to include it comfortably.',
        sections: [
          {
            heading: 'Essential and useful',
            body: 'Fat is essential for many body functions and helps carry flavour and important vitamins. Sources include oils, nuts, seeds, avocado, dairy, and fatty fish.',
          },
          {
            heading: 'Types of fat',
            body: 'Unsaturated fats are generally encouraged as part of a balanced pattern, while highly processed sources are worth moderating. Rather than avoiding fat, focus on overall balance and variety.',
          },
        ],
      },
    ],
  },
  {
    slug: 'food-labels',
    title: 'Food Labels',
    subtitle: 'Understand what’s on the package',
    intro:
      'Labels are tools, not verdicts. These articles help you read them with context instead of fear.',
    articles: [
      {
        id: 'fl-1',
        title: 'How to read a nutrition label',
        readTime: '6 min',
        summary: 'A calm, step-by-step approach to the information on a package.',
        sections: [
          {
            heading: 'Start with the serving size',
            body: 'Everything on a label is based on the serving size at the top. Checking it first helps you understand the numbers that follow, and how they relate to what you actually eat.',
          },
          {
            heading: 'Use the numbers, avoid the panic',
            body: 'Labels can highlight what a food offers — like fiber or protein — without turning any number into a judgement. A single higher number is not a reason to avoid a food entirely.',
          },
        ],
      },
      {
        id: 'fl-2',
        title: 'Serving size vs portion',
        readTime: '4 min',
        summary: 'Why the package number and what you eat are not the same thing.',
        sections: [
          {
            heading: 'Two different ideas',
            body: 'A serving size is a reference amount set on the package. A portion is the amount you actually choose to eat. Portions vary from person to person and meal to meal, and that is entirely normal.',
          },
        ],
      },
      {
        id: 'fl-3',
        title: 'Ingredient lists and marketing claims',
        readTime: '5 min',
        summary: 'How to look past front-of-pack wording.',
        sections: [
          {
            heading: 'Front of pack sells',
            body: 'Terms like "natural", "light", or "made with real fruit" are marketing. They are often not strongly regulated and do not necessarily indicate a healthier choice.',
          },
          {
            heading: 'The ingredient list',
            body: 'Ingredients are listed by weight, from most to least. For a quick sense of what a product is mostly made of, the first few ingredients are the most informative.',
          },
        ],
      },
    ],
  },
  {
    slug: 'myths',
    title: 'Myths & Misinformation',
    subtitle: 'Separate claims from evidence',
    intro:
      'Nutrition misinformation spreads easily. These articles show how to think critically about what you hear.',
    articles: [
      {
        id: 'my-1',
        title: 'Why nutrition claims feel convincing',
        readTime: '5 min',
        summary: 'Simple messages travel further than nuanced ones.',
        sections: [
          {
            heading: 'Simple is memorable',
            body: 'Clear, confident claims are easier to repeat than nuanced explanations. That is one reason catchy nutrition messages spread faster than careful evidence.',
          },
          {
            heading: 'Look for the context',
            body: 'Ask whether a claim comes from a single study, a headline, or a body of evidence. Real nutrition conclusions usually come with conditions and caveats.',
          },
        ],
      },
      {
        id: 'my-2',
        title: 'Detoxes: what the evidence says',
        readTime: '5 min',
        summary: 'Why your body does not typically need a detox diet.',
        sections: [
          {
            heading: 'Your body already detoxifies',
            body: 'The liver, kidneys and other systems continuously process and remove waste. Special teas, juices or cleanses are not required for this to happen.',
          },
          {
            heading: 'Focus on fundamentals',
            body: 'Rather than short-term cleanses, ongoing habits — plenty of fluids, fiber, plants, and sleep — support the systems that already do this work.',
          },
        ],
      },
      {
        id: 'my-3',
        title: 'Late-night eating and weight',
        readTime: '4 min',
        summary: 'Timing matters less than overall pattern.',
        sections: [
          {
            heading: 'The clock is not the whole story',
            body: 'Eating late does not automatically cause weight gain. Total intake, overall diet quality, and steady habits matter far more than the time on the clock.',
          },
        ],
      },
    ],
  },
  {
    slug: 'peptides-supplements',
    title: 'Peptides & Supplements',
    subtitle: 'Understand the evidence',
    intro:
      'Supplements and peptides are widely marketed. These articles help you judge what is actually supported by evidence.',
    articles: [
      {
        id: 'ps-1',
        title: 'What are peptides?',
        readTime: '6 min',
        summary: 'A plain-language overview of what peptides are.',
        sections: [
          {
            heading: 'Short chains of amino acids',
            body: 'Peptides are short chains of amino acids, the same building blocks that make up protein. They occur naturally in the body and in foods and play many roles.',
          },
          {
            heading: 'Marketing vs evidence',
            body: 'Many peptide products make broad claims that go beyond the available evidence. It helps to ask what outcome is claimed and what quality of research supports it.',
          },
        ],
      },
      {
        id: 'ps-2',
        title: 'Evaluating supplement claims',
        readTime: '6 min',
        summary: 'Questions to ask before spending money on a supplement.',
        sections: [
          {
            heading: 'What is the claim?',
            body: 'Supplements are not allowed to claim to treat or cure disease. If a product promises dramatic or guaranteed results, that is often a warning sign.',
          },
          {
            heading: 'Who would benefit?',
            body: 'Supplements can be useful in specific situations, but they are rarely necessary for most people eating a varied diet. Discussion with a qualified professional can help clarify whether one is appropriate.',
          },
        ],
      },
      {
        id: 'ps-3',
        title: 'Red flags in supplement marketing',
        readTime: '5 min',
        summary: 'Common warning signs to watch for.',
        sections: [
          {
            heading: 'Common warning signs',
            body: 'Be cautious with products promising rapid or effortless results, relying on testimonials over evidence, or using pressure and countdown offers. Quality and third-party testing matter more than bold claims.',
          },
        ],
      },
    ],
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

export function findTopicByTitle(title?: string): LearnTopic | undefined {
  if (!title) return undefined;
  const key = normalizeKey(title);
  return learnTopics.find((t) => normalizeKey(t.title) === key || t.slug === key);
}

export function findArticle(id?: string): { topic: LearnTopic; article: LearnArticle } | undefined {
  if (!id) return undefined;
  for (const topic of learnTopics) {
    const article = topic.articles.find((a) => a.id === id);
    if (article) return { topic, article };
  }
  return undefined;
}

export function findArticleByTitle(title?: string): { topic: LearnTopic; article: LearnArticle } | undefined {
  if (!title) return undefined;
  const key = normalizeKey(title);
  for (const topic of learnTopics) {
    const article = topic.articles.find((a) => normalizeKey(a.title) === key);
    if (article) return { topic, article };
  }
  return undefined;
}

export function allArticles(): { topic: LearnTopic; article: LearnArticle }[] {
  return learnTopics.flatMap((topic) => topic.articles.map((article) => ({ topic, article })));
}

export function searchArticles(query: string): { topic: LearnTopic; article: LearnArticle }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allArticles().filter(({ topic, article }) =>
    [article.title, article.summary, topic.title, article.sections.map((s) => s.heading).join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
}
