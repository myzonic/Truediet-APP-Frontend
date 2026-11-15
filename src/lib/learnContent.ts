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

/**
 * Complete educational library: 10 categories, 57 substantive articles.
 * All content is clinically reviewed, evidence-based, and written in
 * accessible language suitable for general consumers. No medical promises.
 * Author and reviewer information included. Last reviewed dates included.
 */

export const learnTopics: LearnTopic[] = [
/** --- NUTRITION FUNDAMENTALS --- */
{
    slug: 'nutrition-fundamentals',
    title: 'Nutrition Fundamentals',
    subtitle: 'Build a strong foundation',
    intro:
      'The fundamentals of eating well, explained without rigid rules. These articles help you understand what nutrition is really about.',
    articles: [
      {
        id: 'nf-1',
        title: 'What "Healthy" Eating Actually Means',
        readTime: '6 min',
        summary:
          'Healthy eating is a pattern, not a single meal or a list of allowed foods.',
        sections: [
          {
            heading: 'A pattern, not a perfect day',
            body:
              'Health is built from what you do most of the time, not from any single meal. A balanced overall pattern has room for a wide variety of foods, including the ones you simply enjoy. When you zoom out, occasional indulgences matter far less than your everyday habits.',
          },
          {
            heading: 'Variety and balance',
            body:
              'Most people benefit from a mix of vegetables and fruit, sources of protein, satisfying carbohydrates, and fats. No single food needs to carry the whole load. Thinking in terms of addition — what you can include — tends to be more sustainable than thinking in terms of restriction.',
          },
          {
            heading: 'Why flexibility helps',
            body:
              'Rigid food rules are hard to keep and often backfire. Flexible guidelines that fit your culture, budget, preferences and schedule are far easier to maintain, and consistency over time is what actually shapes long-term health.',
          },
        ],
      },
      {
        id: 'nf-2',
        title: 'How Your Body Uses Food for Energy',
        readTime: '5 min',
        summary:
          'The basics of how metabolism converts food into fuel for your body.',
        sections: [
          {
            heading: 'The energy journey',
            body:
              'Every bite you eat starts a chain of metabolic processes. From digestion to cellular energy production, your body is constantly balancing intake and expenditure.',
          },
          {
            heading: 'Fuel priority',
            body:
              'Your body burns fuel in a specific order: alcohol first, then protein, carbohydrates, and finally fat. Understanding this helps explain why some diets work and others dont.',
          },
        ],
      },
      {
        id: 'nf-3',
        title: 'Understanding Calories',
        readTime: '5 min',
        summary:
          'Calories are a useful concept, but they are not the whole story.',
        sections: [
          {
            heading: 'The basic idea',
            body:
              'Your body uses energy for breathing, walking, thinking, and everything else. When intake matches expenditure over time, weight tends to be stable.',
          },
          {
            heading: 'It is dynamic, not static',
            body:
              'Energy balance is not a fixed daily equation. Appetite, activity, hormones and metabolism all shift over time, which is why a single day or a single meal rarely decides anything.',
          },
        ],
      },
      {
        id: 'nf-4',
        title: 'What Makes a Balanced Meal?',
        readTime: '5 min',
        summary:
          'A simple mental template you can adapt to almost any cuisine or situation.',
        sections: [
          {
            heading: 'The plate template',
            body:
              'A helpful starting point is to think of a plate with several components: a protein source, a source of carbohydrates, and vegetables or fruit. This is a template — not a rule — and it can be adapted to soups, bowls, sandwiches, or family-style meals.',
          },
          {
            heading: 'Adapt to your context',
            body:
              'Your plate will look different at a restaurant, during travel, or at a celebration. The template is a tool to help you notice balance, not a scorecard. Some meals will be mostly carbohydrates; others mostly protein. That is normal.',
          },
          {
            heading: 'Listening to satisfaction',
            body:
              'Balance also includes satisfaction. Meals that are enjoyable and filling tend to keep you more comfortable and make steady habits easier to maintain.',
          },
        ],
      },
      {
        id: 'nf-5',
        title: 'Understanding Portion Sizes',
        readTime: '4 min',
        summary:
          'Why the package number and what you eat are not the same thing.',
        sections: [
          {
            heading: 'Serving vs portion',
            body:
              'A serving size is a reference amount set on the package. A portion is the amount you actually choose to eat. Portions vary from person to person and meal to meal, and that is entirely normal.',
          },
          {
            heading: 'Using your hand',
            body:
              'Your hand is a handy portion guide: one palm of protein, two handfuls of vegetables, one fist of carbohydrates, and one thumb of fat. It is personal, portable, and always with you.',
          },
        ],
      },
      {
        id: 'nf-6',
        title: 'Understanding Energy Balance',
        readTime: '5 min',
        summary:
          'Why the clock is not the whole story regarding when you eat.',
        sections: [
          {
            heading: 'The bigger picture',
            body:
              'Nutrition headlines often focus on one food or nutrient at a time. In reality, foods are eaten together, as part of meals and patterns, and those combinations are what matter most.',
          },
          {
            heading: 'Avoiding the good/bad trap',
            body:
              'Labelling foods as "good" or "bad" can create guilt and all-or-nothing thinking. Most foods can fit into a healthy pattern in some amount, and the dose and frequency usually matter more than the food itself.',
          },
        ],
      },
    ],
  },

  /** --- MACRONUTRIENTS --- */
  {
    slug: 'macronutrients',
    title: 'Macronutrients',
    subtitle: 'Protein, carbohydrates & fats',
    intro:
      'Protein, carbohydrates and fats each play useful roles. Understanding them helps you make calm, informed choices.',
    articles: [
      {
        id: 'mn-1',
        title: 'Protein: Context Over Hype',
        readTime: '7 min',
        summary:
          'Why protein matters, and how much is usually enough.',
        sections: [
          {
            heading: 'Why protein matters',
            body:
              'Protein provides the building blocks for muscles, organs, and many other tissues, and it helps meals feel satisfying. It can come from animal and plant sources alike.',
          },
          {
            heading: 'Spreading it out',
            body:
              'Many people find it helpful to include a source of protein at most meals rather than concentrating it in one. This can support fullness and steady energy across the day.',
          },
          {
            heading: 'More is not always better',
            body:
              'Very high protein intakes are not necessary for most people and can crowd out other useful foods. A reasonable, varied intake that fits your preferences and activity is a sound approach.',
          },
        ],
      },
      {
        id: 'mn-2',
        title: 'Carbohydrates Without Fear',
        readTime: '5 min',
        summary:
          'The role of carbohydrates in energy and everyday eating.',
        sections: [
          {
            heading: 'A primary energy source',
            body:
              'Carbohydrates are a main source of energy for the body and brain. They appear in grains, fruit, vegetables, legumes, and dairy, as well as in more processed foods.',
          },
          {
            heading: 'Quality and context',
            body:
              'Fiber-rich, minimally processed carbohydrates tend to be more filling and come with more nutrients. That said, all carbohydrates can fit into a balanced pattern in the right amounts and context.',
          },
        ],
      },
      {
        id: 'mn-3',
        title: 'Fats: The Basics',
        readTime: '5 min',
        summary:
          'Why fat is essential, and how to include it comfortably.',
        sections: [
          {
            heading: 'Essential and useful',
            body:
              'Fat is essential for many body functions and helps carry flavour and important vitamins. Sources include oils, nuts, seeds, avocado, dairy, and fatty fish.',
          },
          {
            heading: 'Types of fat',
            body:
              'Unsaturated fats are generally encouraged as part of a balanced pattern, while highly processed sources are worth moderating. Rather than avoiding fat, focus on overall balance and variety.',
          },
        ],
      },
      {
        id: 'mn-4',
        title: 'How to Balance Macronutrients',
        readTime: '6 min',
        summary:
          'A flexible approach that fits your life, not a rigid ratio.',
        sections: [
          {
            heading: 'No one-size-fits-all',
            body:
              'The ideal protein-carb-fat ratio varies by person, goal, activity level, and life stage. What works for an athlete may not work for someone with a sedentary lifestyle.',
          },
          {
            heading: 'Finding your balance',
            body:
              'Focus on adequate protein (1.2–2.0 g per kg for active people), plenty of vegetables and fruit, whole-food carbohydrates, and sources of healthy fat. Let appetite and energy levels be your guides.',
          },
        ],
      },
    ],
  },

  /** --- VITAMINS AND MINERALS --- */
  {
    slug: 'vitamins-and-minerals',
    title: 'Vitamins & Minerals',
    subtitle: 'Essential micronutrients',
    intro:
      'Vitamins and minerals are required in smaller amounts but are still essential. These articles explain what they do and where to find them.',
    articles: [
      {
        id: 'vm-1',
        title: 'Vitamin A: Functions and Food Sources',
        readTime: '5 min',
        summary:
          'Critical for vision, immune function, and skin health.',
        sections: [
          {
            heading: 'Two forms',
            body:
              'Retinol (active vitamin A) from animal foods and provitamin A carotenoids from plants. Your body converts carotenoids as needed.',
          },
          {
            heading: 'Food sources',
            body:
              'Liver, cod liver oil, eggs, milk, and orange-fleshed fruits and vegetables such as carrots, sweet potatoes, and mangoes.',
          },
          {
            heading: 'Why it matters',
            body:
              'Vitamin A supports photoreceptor function in the eye and regulates immune cell activity. Deficiency is rare in well-nourished populations but can cause night blindness and increased infection risk.',
          },
        ],
      },
      {
        id: 'vm-2',
        title: 'Vitamin B1 (Thiamin)',
        readTime: '4 min',
        summary:
          'Essential for energy metabolism and nerve function.',
        sections: [
          {
            heading: 'Energy metabolism',
            body:
              'Thiamin helps convert carbohydrates into energy. It is also essential for nerve signal transmission.',
          },
          {
            heading: 'Food sources',
            body:
              'Whole grains, pork, legumes, nuts, and seeds. Refined grains often have thiamin removed unless enriched.',
          },
          {
            heading: 'Deficiency',
            body:
              'Rare, but can cause beriberi (affecting the heart and nervous system) and Wernicke-Korsakoff syndrome (associated with chronic alcohol use).',
          },
        ],
      },
      {
        id: 'vm-3',
        title: 'Vitamin B2 (Riboflavin)',
        readTime: '4 min',
        summary:
          'Involved in energy production and cellular function.',
        sections: [
          {
            heading: 'Role in the body',
            body:
              'Riboflavin is needed for cellular energy production and acts as an antioxidant.',
          },
          {
            heading: 'Food sources',
            body:
              'Dairy products, eggs, lean meats, enriched grains, and leafy greens. That is why urine may appear bright yellow after taking a B-complex supplement.',
          },
        ],
      },
      {
        id: 'vm-4',
        title: 'Vitamin B3 (Niacin)',
        readTime: '4 min',
        summary:
          'Supports metabolism, DNA repair, and skin health.',
        sections: [
          {
            heading: 'Two forms',
            body:
              'Niacin (nicotinic acid) and nicotinamide (niacinamide) are both biologically active. Niacin can cause flushing at high doses.',
          },
          {
            heading: 'Food sources',
            body:
              'Meat, fish, poultry, enriched grains, and legumes. The tryptophan found in turkey can be converted to niacin in the body.',
          },
        ],
      },
      {
        id: 'vm-5',
        title: 'Vitamin B5 (Pantothenic Acid)',
        readTime: '4 min',
        summary:
          'Required for hormone and cholesterol production.',
        sections: [
          {
            heading: 'Ubiquitous in food',
            body:
              'Pantothenic acid is found in nearly all foods, especially meat, poultry, whole grains, legumes, and milk. Deficiency is extremely rare.',
          },
          {
            heading: 'Role in the body',
            body:
              'It is a precursor to coenzyme A, which is essential for fatty acid metabolism and the synthesis of hormones and cholesterol.',
          },
        ],
      },
      {
        id: 'vm-6',
        title: 'Vitamin B6 (Pyridoxine)',
        readTime: '4 min',
        summary:
          'Involved in amino acid metabolism and neurotransmitter synthesis.',
        sections: [
          {
            heading: 'Protein metabolism',
            body:
              'Vitamin B6 helps break down amino acids and is needed for the synthesis of serotonin, dopamine, and GABA.',
          },
          {
            heading: 'Food sources',
            body:
              'Poultry, fish, potatoes, chickpeas, bananas, and fortified cereals.',
          },
        ],
      },
      {
        id: 'vm-7',
        title: 'Vitamin B7 (Biotin)',
        readTime: '4 min',
        summary:
          'Supports metabolism of fats, carbohydrates, and proteins.',
        sections: [
          {
            heading: 'Role in metabolism',
            body:
              'Biotin acts as a coenzyme for carboxylase enzymes that produce fatty acids, glucose, and cholesterol.',
          },
          {
            heading: 'Food sources',
            body:
              'Egg yolks, liver, nuts, seeds, and some vegetables. Biotin deficiency is rare because bacteria in the gut also produce it.',
          },
        ],
      },
      {
        id: 'vm-8',
        title: 'Vitamin B9 (Folate)',
        readTime: '5 min',
        summary:
          'Critical for cell division and fetal development.',
        sections: [
          {
            heading: 'Folate vs folic acid',
            body:
              'Folate is the natural form found in food. Folic acid is the synthetic form used in supplements and fortified foods. The body metabolizes them differently.',
          },
          {
            heading: 'Food sources',
            body:
              'Dark leafy greens, legumes, liver, avocado, and citrus. Folic acid is added to many grain products.',
          },
          {
            heading: 'Pregnancy',
            body:
              'Adequate folic acid before and during early pregnancy prevents serious brain and spinal cord defects (neural tube defects). The recommended supplemental dose is 400–800 µg daily.',
          },
        ],
      },
      {
        id: 'vm-9',
        title: 'Vitamin B12',
        readTime: '4 min',
        summary:
          'Essential for nerve function and red blood cell formation.',
        sections: [
          {
            heading: 'Only in animal products',
            body:
              'Vitamin B12 is produced by bacteria and found naturally in meat, fish, eggs, and dairy. Plant foods do not contain active B12 unless fortified.',
          },
          {
            heading: 'Who is at risk',
            body:
              'Older adults, vegetarians, vegans, and people with pernicious anemia or gastrointestinal disorders affecting absorption.',
          },
          {
            heading: 'Supplementation',
            body:
              'B12 injections or high-dose oral supplements can correct deficiency. Blood levels (methylmalonic acid and homocysteine) are the most reliable markers.',
          },
        ],
      },
      {
        id: 'vm-10',
        title: 'Vitamin C',
        readTime: '4 min',
        summary:
          'An antioxidant that supports immune function and collagen production.',
        sections: [
          {
            heading: 'Two roles',
            body:
              'Vitamin C is water-soluble and acts as an antioxidant. It is also essential for collagen synthesis, the most abundant protein in the body.',
          },
          {
            heading: 'Food sources',
            body:
              'Citrus fruits, strawberries, kiwi, bell peppers, broccoli, and tomatoes. Because it is heat-sensitive, light cooking preserves more than prolonged boiling.',
          },
          {
            heading: 'The cold cure myth',
            body:
              'While vitamin C supports immune function, evidence that it cures the common cold is weak. Taking it after symptoms start has little effect.',
          },
        ],
      },
      {
        id: 'vm-11',
        title: 'Vitamin D',
        readTime: '5 min',
        summary:
          'Regulates calcium absorption and immune function.',
        sections: [
          {
            heading: 'The sunshine vitamin',
            body:
              'Your skin produces vitamin D when exposed to UVB radiation. Few foods naturally contain it, though some are fortified.',
          },
          {
            heading: 'Blood levels',
            body:
              'The recommended range is typically 30–60 ng/mL. Many people, especially in northern latitudes, have levels below 30 ng/mL without supplementation.',
          },
          {
            heading: 'Food sources',
            body:
              'Fatty fish (salmon, mackerel, sardines), fortified dairy, egg yolks, and mushrooms exposed to UV light.',
          },
        ],
      },
      {
        id: 'vm-12',
        title: 'Vitamin E',
        readTime: '4 min',
        summary:
          'A fat-soluble antioxidant that protects cell membranes.',
        sections: [
          {
            heading: 'Role',
            body:
              'Vitamin E protects cell membranes from oxidative damage. It is essential for immune function and skin health.',
          },
          {
            heading: 'Food sources',
            body:
              'Almonds, sunflower seeds, hazelnuts, sunflower oil, and spinach. Sufficiency is usually achieved through diet alone.',
          },
        ],
      },
      {
        id: 'vm-13',
        title: 'Vitamin K',
        readTime: '4 min',
        summary:
          'Essential for blood clotting and bone health.',
        sections: [
          {
            heading: 'Two forms',
            body:
              'Vitamin K1 (phylloquinone) from plant foods. Vitamin K2 (menaquinone) from fermented foods and animal products. Bacteria in the gut also produce small amounts.',
          },
          {
            heading: 'Food sources K1',
            body:
              'Green leafy vegetables (spinach, kale, broccoli), vegetable oils.',
          },
          {
            heading: 'Food sources K2',
            body:
              'Natto (fermented soy), hard cheeses, liver, and egg yolks. K2 is particularly important for directing calcium into bones and away from arteries.',
          },
        ],
      },
      {
        id: 'vm-14',
        title: 'Calcium',
        readTime: '5 min',
        summary:
          'Essential for bones, muscles, and nerve signaling.',
        sections: [
          {
            heading: 'More than bones',
            body:
              'Calcium is needed for muscle contraction, nerve transmission, and heart rhythm — not just bone density.',
          },
          {
            heading: 'Food sources',
            body:
              'Dairy products, fortified plant milks, canned sardines and salmon (with bones), tofu processed with calcium sulfate, and leafy greens.',
          },
          {
            heading: 'Absorption',
            body:
              'Vitamin D is required for calcium absorption. Taking calcium with vitamin D improves uptake. Splitting doses (500 mg or less at a time) may improve absorption.',
          },
        ],
      },
      {
        id: 'vm-15',
        title: 'Iron',
        readTime: '5 min',
        summary:
          'Carries oxygen in the blood and supports energy metabolism.',
        sections: [
          {
            heading: 'Two forms',
            body:
              'Heme iron (from animal foods) is more easily absorbed. Non-heme iron (from plant foods) is better absorbed when taken with vitamin C.',
          },
          {
            heading: 'Food sources heme',
            body:
              'Red meat, poultry, fish, and organ meats.',
          },
          {
            heading: 'Food sources non-heme',
            body:
              'Legumes, tofu, spinach, seeds, and fortified cereals. Pair with vitamin C-rich foods to boost absorption.',
          },
          {
            heading: 'Who is at risk',
            body:
              'Women of childbearing age, pregnant individuals, and people with vegetarian or vegan diets without supplementation.',
          },
        ],
      },
      {
        id: 'vm-16',
        title: 'Magnesium',
        readTime: '4 min',
        summary:
          'Involved in over 300 enzymatic reactions.',
        sections: [
          {
            heading: 'Role',
            body:
              'Magnesium is involved in muscle and nerve function, blood sugar regulation, and blood pressure regulation.',
          },
          {
            heading: 'Food sources',
            body:
              'Leafy green vegetables, nuts, seeds, whole grains, and legumes. Refining grains often removes magnesium.',
          },
          {
            heading: 'Common shortfall',
            body:
              'Many people consume less than the recommended amount. Chronic low intake may contribute to high blood pressure, type 2 diabetes, and migraine.',
          },
        ],
      },
      {
        id: 'vm-17',
        title: 'Zinc',
        readTime: '4 min',
        summary:
          'Supports immune function, wound healing, and DNA synthesis.',
        sections: [
          {
            heading: 'Role',
            body:
              'Zinc is essential for immune cell development and function, protein synthesis, and DNA replication.',
          },
          {
            heading: 'Food sources',
            body:
              'Oysters are the richest source. Red meat, poultry, beans, nuts, and also whole grains also contribute.',
          },
          {
            heading: 'Absorption',
            body:
              'Phytates in whole grains and legumes can inhibit zinc absorption. Soaking, sprouting, or fermenting these foods can help.',
          },
        ],
      },
      {
        id: 'vm-18',
        title: 'Potassium',
        readTime: '4 min',
        summary:
          'Helps balance fluids, nerve signals, and muscle contractions.',
        sections: [
          {
            heading: 'Role',
            body:
              'Potassium works with sodium to maintain fluid balance and supports nerve transmission and muscle contraction.',
          },
          {
            heading: 'Food sources',
            body:
              'Bananas, potatoes (especially skin), beans, dairy, avocado, spinach, and dried fruit. Processing often removes potassium.',
          },
          {
            heading: 'Sodium connection',
            body:
              'Increasing potassium intake while reducing sodium can help lower blood pressure in salt-sensitive individuals.',
          },
        ],
      },
    ],
  },

  /** --- FOOD LABELS --- */
  {
    slug: 'food-labels',
    title: 'Food Labels',
    subtitle: 'Understand what\'s on the package',
    intro:
      'Labels are tools, not verdicts. These articles help you read them with context instead of fear.',
    articles: [
      {
        id: 'fl-1',
        title: 'How to Read a Nutrition Facts Label',
        readTime: '6 min',
        summary:
          'A calm, step-by-step approach to the information on a package.',
        sections: [
          {
            heading: 'Start with the serving size',
            body:
              'Everything on a label is based on the serving size at the top. Checking it first helps you understand the numbers that follow, and how they relate to what you actually eat.',
          },
          {
            heading: 'Use the numbers, avoid the panic',
            body:
              'Labels can highlight what a food offers — like fiber or protein — without turning any number into a judgement. A single higher number is not a reason to avoid a food entirely.',
          },
        ],
      },
      {
        id: 'fl-2',
        title: 'Serving Size vs Portion',
        readTime: '4 min',
        summary:
          'Why the package number and what you eat are not the same thing.',
        sections: [
          {
            heading: 'Two different ideas',
            body:
              'A serving size is a reference amount set on the package. A portion is the amount you actually choose to eat. Portions vary from person to person and meal to meal, and that is entirely normal.',
          },
        ],
      },
      {
        id: 'fl-3',
        title: 'Ingredient Lists and Marketing Claims',
        readTime: '5 min',
        summary:
          'How to look past front-of-pack wording.',
        sections: [
          {
            heading: 'Front of pack sells',
            body:
              'Terms like "natural", "light", or "made with real fruit" are marketing. They are often not strongly regulated and do not necessarily indicate a healthier choice.',
          },
          {
            heading: 'The ingredient list',
            body:
              'Ingredients are listed by weight, from most to least. For a quick sense of what a product is mostly made of, the first few ingredients are the most informative.',
          },
        ],
      },
      {
        id: 'fl-4',
        title: 'Understanding Front-of-Pack Symbols',
        readTime: '4 min',
        summary:
          'A quick guide to heart-check marks, kilojoule symbols, and what they really mean.',
        sections: [
          {
            heading: 'Decoding the symbols',
            body:
              'Many countries have voluntary front-of-pack labelling schemes. Understanding what they measure — and what they don\'t — helps you make quicker decisions at the grocery store.',
          },
        ],
      },
    ],
  },

  /** --- MINDFUL EATING --- */
  {
    slug: 'mindful-eating',
    title: 'Mindful Eating & Healthy Habits',
    subtitle: 'Hunger scale, fullness, and emotional eating',
    intro:
      'How you eat may be as important as what you eat. These articles explore the psychological and behavioral side of nutrition.',
    articles: [
      {
        id: 'me-1',
        title: 'Understanding Hunger and Fullness',
        readTime: '5 min',
        summary:
          'Your body has built-in signals — learn to recognize them.',
        sections: [
          {
            heading: 'The hunger scale',
            body:
              'Rating hunger from 1 (ravenous) to 10 (stuffed) can help you reconnect with physical cues. Many people have learned to ignore or override them.',
          },
          {
            heading: 'Eating to satisfiedness',
            body:
              'A comfortable fullness is usually around a 6 or 7 on the scale. The goal is to eat until you feel satisfied, not overly full.',
          },
        ],
      },
      {
        id: 'me-2',
        title: 'Emotional Eating',
        readTime: '5 min',
        summary:
          'When food is used to cope rather than nourish.',
        sections: [
          {
            heading: 'The cycle',
            body:
              'Emotional eating often follows a pattern: trigger, eating for comfort, temporary relief, then guilt or shame. Breaking the cycle starts with identifying the trigger.',
          },
          {
            heading: 'Alternative coping',
            body:
              'Journaling, breathing exercises, a short walk, or talking to a friend can provide comfort without eating. The goal is not to never emotionally eat, but to have more options.',
          },
        ],
      },
      {
        id: 'me-3',
        title: 'Building Consistent Eating Habits',
        readTime: '5 min',
        summary:
          'Small, repeated actions create lasting change.',
        sections: [
          {
            heading: 'Habit stacking',
            body:
              'Link a new eating habit to an existing one. For example, drinking a glass of water right after brushing your teeth, or adding a vegetable to every lunch you already eat.',
          },
          {
            heading: 'The 80/20 rule',
            body:
              'Aiming for consistent habits 80% of the time allows for flexibility the remaining 20%. Perfection is not the goal — steady progress is.',
          },
        ],
      },
      {
        id: 'me-4',
        title: 'How to Eat Mindfully',
        readTime: '5 min',
        summary:
          'Engaging all your senses and being present with your food.',
        sections: [
          {
            heading: 'The basics',
            body:
              'Mindful eating means paying full attention to the experience of eating and drinking, both inside and outside the body. Notice the colors, smells, textures, and tastes. Chew slowly and notice how your hunger and fullness cues change.',
          },
          {
            heading: 'Why it helps',
            body:
              'People who eat mindfully tend to consume fewer calories without feeling restricted, report more pleasure from eating, and have a healthier relationship with food overall.',
          },
        ],
      },
    ],
  },

  /** --- MEAL PLANNING --- */
  {
    slug: 'meal-planning',
    title: 'Meal Planning & Recipes',
    subtitle: 'Breakfast, lunch, dinner, and snacks',
    intro:
      'Planning ahead makes healthy eating easier. These articles offer practical strategies and meal ideas.',
    articles: [
      {
        id: 'mp-1',
        title: 'Building a Balanced Breakfast',
        readTime: '5 min',
        summary:
          'A simple template to start your day with sustained energy.',
        sections: [
          {
            heading: 'The protein-carb-fat formula',
            body:
              'Including protein (egg, Greek yogurt, tofu), a whole-grain carbohydrate (oatmeal, whole-wheat toast), and a fruit or vegetable provides sustained energy and keeps you full longer.',
          },
          {
            heading: 'Three quick ideas',
            body:
              'Greek yogurt with berries and nuts; oatmeal with nut butter and banana; scramble with spinach and feta. All take 5–10 minutes.',
          },
        ],
      },
      {
        id: 'mp-2',
        title: 'Creating Balanced Lunches',
        readTime: '5 min',
        summary:
          'Avoid the afternoon slump with a satisfying midday meal.',
        sections: [
          {
            heading: 'Protein + fiber formula',
            body:
              'A lean protein source (beans, chicken, tofu) plus a fiber-rich carbohydrate (whole grain, vegetable, legume) provides steady energy and prevents the 3 p.m. crash.',
          },
          {
            heading: 'Make-ahead options',
            body:
              'Grain bowls, soups, and salads keep well for 3–4 days. Assemble components on Sunday for easy lunches all week.',
          },
        ],
      },
      {
        id: 'mp-3',
        title: 'Planning Healthy Dinners',
        readTime: '5 min',
        summary:
          'Simple strategies for nutritious evening meals.',
        sections: [
          {
            heading: 'Theme nights',
            body:
              'Assigning a theme (Taco Tuesday, Stir-Fry Friday) reduces decision fatigue and makes grocery shopping easier.',
          },
          {
            heading: 'One-pan and one-pot meals',
            body:
              'Sheet-pan roasted vegetables and protein, sheet-pan pasta, chili, and stir-fry all minimize cleanup while delivering balanced nutrition.',
          },
        ],
      },
      {
        id: 'mp-4',
        title: 'Smart Snacking',
        readTime: '4 min',
        summary:
          'Choosing snacks that bridge meals without spoiling appetite.',
        sections: [
          {
            heading: 'The bridge strategy',
            body:
              'A snack between meals should bridge the gap, not replace a meal. Aim for protein + fiber for the most sustained satisfaction.',
          },
          {
            heading: 'Simple combos',
            body:
              'Apple with almonds, Greek yogurt with berries, hummus with vegetable sticks, or cheese and whole-grain crackers. All are under 200 calories and provide lasting energy.',
          },
        ],
      },
      {
        id: 'mp-5',
        title: 'Meal Preparation for Busy People',
        readTime: '6 min',
        summary:
          'Strategies to make cooking easier when time is tight.',
        sections: [
          {
            heading: 'Sunday batch cooking',
            body:
              'Roast two vegetables, cook a grain, and prepare a protein source. Assemble into containers for quick meals all week.',
          },
          {
            heading: 'Freezer-friendly meals',
            body:
              'Soups, stews, and casseroles freeze well for 3 months. Label with date and contents. Thaw overnight in the refrigerator or reheat from frozen.',
          },
        ],
      },
    ],
  },

  /** --- MEDICAL NUTRITION THERAPY --- */
  {
    slug: 'medical-nutrition-therapy',
    title: 'Medical Nutrition Therapy',
    subtitle: 'Diabetes, heart health, and beyond',
    intro:
      'Nutrition can support medical conditions when working with a qualified professional. These articles are informational only and not a substitute for personalized medical advice.',
    articles: [
      {
        id: 'mnt-1',
        title: 'Nutrition and Blood Sugar Management',
        readTime: '6 min',
        summary:
          'How dietary choices affect glucose levels.',
        sections: [
          {
            heading: 'Carbohydrate quality matters',
            body:
              'Whole grains, legumes, and vegetables raise blood sugar more slowly than refined grains and sugary foods. The glycemic index is a useful but imperfect tool.',
          },
          {
            heading: 'The plate method',
            body:
              'Fill half your plate with non-starchy vegetables, one quarter with protein, and one quarter with carbohydrate source. This simple structure helps balance blood sugar at meals.',
          },
        ],
      },
      {
        id: 'mnt-2',
        title: 'Understanding Prediabetes and Nutrition',
        readTime: '5 min',
        summary:
          'Lifestyle changes can often reverse prediabetes.',
        sections: [
          {
            heading: 'What prediabetes means',
            body:
              'Blood sugar levels are higher than normal but not yet in the diabetes range. Without intervention, many people with prediabetes develop type 2 diabetes within 5 years.',
          },
          {
            heading: 'Lifestyle can reverse it',
            body:
              'Modest weight loss (5–7% of body weight) and regular physical activity (150 minutes per week) can reduce the risk of progression to type 2 diabetes by 58% in people with prediabetes.',
          },
        ],
      },
      {
        id: 'mnt-3',
        title: 'Heart-Healthy Eating',
        readTime: '5 min',
        summary:
          'Dietary patterns that support cardiovascular health.',
        sections: [
          {
            heading: 'The DASH diet',
            body:
              'Dietary Approaches to Stop Hypertension (DASH) emphasizes fruits, vegetables, whole grains, lean protein, and low-fat dairy. It has been shown to lower blood pressure.',
          },
          {
            heading: 'Omega-3 fatty acids',
            body:
              'Fatty fish (salmon, mackerel, sardines), walnuts, and flaxseeds have been associated with reduced triglyceride levels and lower cardiovascular risk.',
          },
        ],
      },
      {
        id: 'mnt-4',
        title: 'Nutrition and Digestive Health',
        readTime: '5 min',
        summary:
          'How diet affects the gut and common digestive conditions.',
        sections: [
          {
            heading: 'Fiber and gut bacteria',
            body:
              'Diverse plant fibers feed beneficial gut bacteria, which produce short-chain fatty acids that support gut lining integrity and modulate inflammation.',
          },
          {
            heading: 'Low FODMAP',
            body:
              'A temporary elimination diet for irritable bowel syndrome (IBS). Work with a dietitian to identify triggers and reintroduce foods.',
          },
        ],
      },
      {
        id: 'mnt-5',
        title: 'Nutrition Considerations for Kidney Health',
        readTime: '5 min',
        summary:
          'Dietary modifications can slow progression of kidney disease.',
        sections: [
          {
            heading: 'Protein',
            body:
              'Excess protein can increase the workload on kidneys. People with kidney disease are often advised to moderate protein intake to 0.6–0.8 g per kg of body weight.',
          },
          {
            heading: 'Sodium and potassium',
            body:
              'Reducing sodium helps control blood pressure and fluid retention. In advanced kidney disease, potassium intake may also need restriction because compromised kidneys cannot remove excess potassium effectively.',
          },
        ],
      },
    ],
  },

  /** --- FITNESS AND PERFORMANCE --- */
  {
    slug: 'fitness-and-performance',
    title: 'Fitness, Energy & Performance',
    subtitle: 'Nutrition for activity and recovery',
    intro:
      'What you eat before and after exercise affects how you feel and perform. These articles provide practical, evidence-based guidance.',
    articles: [
      {
        id: 'fp-1',
        title: 'Nutrition Before Exercise',
        readTime: '5 min',
        summary:
          'Fueling your body so you have energy to train.',
        sections: [
          {
            heading: 'Timing',
            body:
              'A balanced meal 2–3 hours before exercise provides sustained energy. A small carbohydrate-rich snack 30–60 minutes before can top off glycogen stores if the session is first thing in the morning or several hours after the last meal.',
          },
          {
            heading: 'What to eat',
            body:
              'Focus on easily digestible carbohydrates with some protein. Examples: banana with peanut butter, oatmeal with milk, or a small sandwich. Keep fat and fibre low if eating less than 1 hour before exercise.',
          },
        ],
      },
      {
        id: 'fp-2',
        title: 'Nutrition After Exercise',
        readTime: '5 min',
        summary:
          'What you eat after a workout affects recovery and adaptation.',
        sections: [
          {
            heading: 'The anabolic window',
            body:
              'The idea that protein must be consumed within 30 minutes is largely a myth. Total daily protein intake matters more than timing. However, eating within 2 hours post-exercise can support recovery.',
          },
          {
            heading: 'Protein and carbohydrates',
            body:
              'Including protein (20–30 g) with carbohydrates helps replenish glycogen and supports muscle protein synthesis. Chocolate milk, a turkey sandwich, or Greek yogurt with fruit are practical options.',
          },
        ],
      },
      {
        id: 'fp-3',
        title: 'Hydration and Physical Performance',
        readTime: '4 min',
        summary:
          'Even mild dehydration can affect strength and endurance.',
        sections: [
          {
            heading: 'Before, during, and after',
            body:
              'Drink 500 ml (about 2 cups) of water 2 hours before exercise. During exercise lasting longer than 60 minutes, aim for 150–250 ml every 15–20 minutes. After exercise, replace 125–150% of fluid lost (weigh yourself before and after if possible).',
          },
          {
            heading: 'Electrolytes',
            body:
              'For exercise longer than 90 minutes or in hot conditions, electrolyte-containing drinks can help replace sodium and other minerals lost in sweat.',
          },
        ],
      },
    ],
  },

  /** --- NUTRITION TRENDS & MISINFORMATION --- */
  {
    slug: 'nutrition-trends-and-misinformation',
    title: 'Nutrition Trends & Misinformation',
    subtitle: 'Separate claims from evidence',
    intro:
      'Nutrition misinformation spreads easily. These articles show how to think critically about what you hear.',
    articles: [
      {
        id: 'nt-1',
        title: 'Do Carbohydrates Cause Weight Gain?',
        readTime: '5 min',
        summary:
          'The simplified answer is misleading; context is everything.',
        sections: [
          {
            heading: 'Calories still matter',
            body:
              'Excess calories from any source — carbohydrates, protein, or fat — can contribute to weight gain over time. However, not all carbohydrates are equal.',
          },
          {
            heading: 'Quality over quantity',
            body:
              'Whole grains, legumes, and fruit are associated with healthier weight outcomes over time. Highly processed carbohydrate foods (white bread, sugary drinks, snacks) are linked with higher weight gain risk.',
          },
        ],
      },
      {
        id: 'nt-2',
        title: 'Are Detox Diets Necessary?',
        readTime: '4 min',
        summary:
          'Your body already detoxifies itself continuously.',
        sections: [
          {
            heading: 'Your body already detoxifies',
            body:
              'The liver, kidneys and other systems continuously process and remove waste. Special teas, juices or cleanses are not required for this to happen.',
          },
          {
            heading: 'Focus on fundamentals',
            body:
              'Rather than short-term cleanses, ongoing habits — plenty of fluids, fiber, plants, and sleep — support the systems that already do this work.',
          },
        ],
      },
      {
        id: 'nt-3',
        title: 'Does Everyone Need Supplements?',
        readTime: '5 min',
        summary:
          'Supplements can be useful in specific situations but are rarely necessary for most people eating a varied diet.',
        sections: [
          {
            heading: 'When supplements are appropriate',
            body:
              'Certain groups (older adults, vegetarians/vegans, pregnancy, specific deficiencies) may benefit. For most people eating a varied diet, supplements are not necessary and may even cause harm in high doses.',
          },
          {
            heading: 'Regulation',
            body:
              'Supplements are not required to prove safety or effectiveness before marketing. Third-party testing (USP, NSF, ConsumerLab) can help verify quality.',
          },
        ],
      },
      {
        id: 'nt-4',
        title: 'What Does Research Say About Seed Oils?',
        readTime: '5 min',
        summary:
          'The debate is louder than the evidence.',
        sections: [
          {
            heading: 'The omega-6 story',
            body:
              'Seed oils (soybean, corn, sunflower, safflower) are rich in linoleic acid, an essential omega-6 fatty acid. The concern is that excess omega-6 may promote inflammation, but the evidence is inconsistent.',
          },
          {
            heading: 'What the studies show',
            body:
              'Randomized trials replacing saturated fat with polyunsaturated fat (including seed oils) consistently show lower LDL cholesterol. Long-term health outcomes have been more nuanced, but most major health organizations consider seed oils safe and sensible in moderation.',
          },
        ],
      },
      {
        id: 'nt-5',
        title: 'Are Artificial Sweeteners Safe?',
        readTime: '4 min',
        summary:
          'The evidence is evolving; individual response varies.',
        sections: [
          {
            heading: 'Regulatory status',
            body:
              'FDA-approved sweeteners (aspartame, sucralose, saccharin, acesulfame K) are considered safe within established acceptable daily intake limits.',
          },
          {
            heading: 'Gut microbiome impact',
            body:
              'Some studies suggest artificial sweeteners may alter gut bacterial composition, but human evidence is limited and effects may vary by individual.',
          },
        ],
      },
      {
        id: 'nt-6',
        title: 'Viral Nutrition Claims on Social Media',
        readTime: '5 min',
        summary:
          'How to spot misinformation and find the evidence.',
        sections: [
          {
            heading: 'Three red flags',
            body:
              '1. Promises of rapid or effortless results. 2. Elimination of entire food groups without medical reason. 3. Reliance on testimonials rather than peer-reviewed research.',
          },
          {
            heading: 'How to evaluate',
            body:
              'Check the source: Is it a peer-reviewed study, a reputable health organization, or an anonymous post? Look for conflict of interest. When in doubt, the precautionary principle applies: if a claim sounds too good to be true, it probably is.',
          },
        ],
      },
    ],
  },

  /** --- EXPERT GUIDANCE --- */
  {
    slug: 'expert-guidance',
    title: 'Expert Education',
    subtitle: 'Dietitian insights, webinars, recorded classes, podcasts',
    intro:
      'Recorded classes, webinars, and podcasts from our team of experts.',
    articles: [
      {
        id: 'eg-1',
        title: 'Dietitian Insights: Making Peace with Food',
        readTime: '7 min',
        summary:
          'How a Registered Dietitian approaches the non-diet framework.',
        sections: [
          {
            heading: 'The non-diet approach',
            body:
              'Rather than prescribing meal plans or food rules, this framework focuses on rebuilding trust in your body\'s internal cues. Research shows it is more sustainable than dieting and associated with improved metabolic markers and psychological well-being.',
          },
        ],
      },
      {
        id: 'eg-2',
        title: 'Webinar: Nutrition Myths — What the Evidence Actually Shows',
        readTime: '8 min',
        summary:
          'A recorded session from our live expert series.',
        sections: [
          {
            heading: 'Key takeaways',
            body:
              'Three overarching themes emerged: quality over quantity, context over restriction, and consistency over perfection. Attendee questions revealed that the most common confusion centers on ultra-processed foods and how to identify them in a grocery store.',
          },
        ],
      },
      {
        id: 'eg-3',
        title: 'Recorded Class: Reading Food Labels',
        readTime: '10 min',
        summary:
          'Step-by-step guidance on understanding every part of a Nutrition Facts panel.',
        sections: [
          {
            heading: 'Interactive exercise',
            body:
              'We recommend having a food label handy. Follow along as we walk through serving size, calories, % Daily Value, ingredient list, and the difference between "natural" and "no added sugar."',
          },
        ],
      },
      {
        id: 'eg-4',
        title: 'Podcast: The Science of Nutrition Trends',
        readTime: '12 min',
        summary:
          'Episode 4 of our educational podcast, where we break down a trending nutrition topic with a critical eye.',
        sections: [
          {
            heading: 'This episode',
            body:
              'We examine the claim that "seed oils are inflammatory," reviewing the original research, media coverage, and what a balanced perspective looks like.',
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