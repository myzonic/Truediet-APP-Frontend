export interface Recipe {
  id: string;
  title: string;
  time: string;
  category: string;
  whyItWorks: string;
  ingredients: string[];
  steps: string[];
  tip: string;
}

export const recipes: Recipe[] = [
  {
    id: 'mediterranean-grain-bowl',
    title: 'Mediterranean Grain Bowl',
    time: '25 min',
    category: 'Plant-forward',
    whyItWorks:
      'Whole grains, beans, and colorful vegetables bring fiber and plant protein together, while a lemon-herb dressing adds flavor and healthy fats.',
    ingredients: [
      '1 cup cooked quinoa or brown rice',
      '1/2 cup chickpeas, rinsed',
      '1 cup mixed vegetables (cucumber, tomato, bell pepper)',
      '1 handful baby spinach',
      '2 tbsp olive oil',
      '1 tbsp lemon juice',
      '1 clove garlic, minced',
      'Pinch of dried oregano, salt, and pepper',
    ],
    steps: [
      'Warm the grains and place them in a bowl as the base.',
      'Add the spinach, chickpeas, and chopped vegetables.',
      'Whisk olive oil, lemon juice, garlic, and oregano into a dressing.',
      'Drizzle the dressing over the bowl and toss gently.',
      'Finish with a pinch of salt and pepper to taste.',
    ],
    tip: 'Swap the beans, grains, or vegetables for whatever you have on hand — the structure stays the same.',
  },
  {
    id: 'salmon-veg-plate',
    title: 'Salmon & Colorful Veg Plate',
    time: '30 min',
    category: 'High protein',
    whyItWorks:
      'Salmon provides protein and omega-3 fats, roasted vegetables add fiber and antioxidants, and a grain or potato rounds out the plate with steady energy.',
    ingredients: [
      '1 salmon fillet (about 140 g)',
      '1 cup broccoli and bell pepper, chopped',
      '1/2 cup cooked farro, rice, or roasted potato',
      '1 tbsp olive oil',
      '1/2 lemon',
      'Salt, pepper, and dried herbs',
    ],
    steps: [
      'Heat the oven to 200°C (400°F).',
      'Toss the vegetables with olive oil, salt, and pepper; roast for 15 minutes.',
      'Add the salmon to the tray, season, and roast 10–12 minutes more.',
      'Plate the salmon with the vegetables and your chosen grain or potato.',
      'Squeeze lemon over the top before serving.',
    ],
    tip: 'Salmon can be swapped for any fish or for chicken, tofu, or tempeh.',
  },
  {
    id: 'overnight-oats',
    title: 'Overnight Oats with Fruit',
    time: '5 min + overnight',
    category: 'Breakfast',
    whyItWorks:
      'Oats bring fiber, yogurt adds protein and live cultures, and fruit adds natural sweetness — a practical breakfast that holds up well on busy mornings.',
    ingredients: [
      '1/2 cup rolled oats',
      '1/2 cup milk or fortified plant milk',
      '1/3 cup plain yogurt',
      '1 tsp chia seeds (optional)',
      '1/2 cup fresh or frozen berries',
      '1 tsp honey or maple syrup (optional)',
    ],
    steps: [
      'Combine oats, milk, yogurt, and chia seeds in a jar.',
      'Stir well, cover, and refrigerate overnight.',
      'In the morning, top with berries and a little honey if you like.',
      'Stir and enjoy cold, or warm briefly if you prefer.',
    ],
    tip: 'Make two or three jars at once so breakfast is ready for the next few days.',
  },
  {
    id: 'lentil-veg-soup',
    title: 'Lentil & Vegetable Soup',
    time: '40 min',
    category: 'Plant-forward',
    whyItWorks:
      'Lentils deliver plant protein and fiber, while a base of vegetables and herbs makes a filling, freezer-friendly meal.',
    ingredients: [
      '1 cup dried red lentils, rinsed',
      '1 onion, diced',
      '2 carrots, diced',
      '2 celery stalks, diced',
      '2 cloves garlic, minced',
      '1 can (400 g) chopped tomatoes',
      '4 cups low-sodium stock',
      '1 tsp cumin, salt, and pepper',
    ],
    steps: [
      'Soften the onion, carrot, and celery in a little olive oil.',
      'Add the garlic and cumin and cook for one minute.',
      'Add the lentils, tomatoes, and stock; bring to a simmer.',
      'Cook 25–30 minutes until the lentils are tender.',
      'Season to taste and serve, or blend half for a creamier texture.',
    ],
    tip: 'Freezes well in portions — a good back-up for days you do not want to cook.',
  },
  {
    id: 'yogurt-parfait',
    title: 'Greek Yogurt Berry Parfait',
    time: '5 min',
    category: 'Snack',
    whyItWorks:
      'Greek yogurt adds protein, fruit adds fiber and color, and nuts or seeds add satisfying fats and crunch.',
    ingredients: [
      '1 cup plain Greek yogurt',
      '1/2 cup berries',
      '1 tbsp chopped nuts or seeds',
      '1 tsp honey (optional)',
      'Pinch of cinnamon (optional)',
    ],
    steps: [
      'Spoon the yogurt into a glass or bowl.',
      'Layer with berries.',
      'Top with nuts or seeds, honey, and cinnamon.',
    ],
    tip: 'Also works as a light breakfast or dessert when you want something simple.',
  },
  {
    id: 'chicken-veg-stirfry',
    title: 'Chicken & Veg Stir-Fry with Brown Rice',
    time: '25 min',
    category: 'High protein',
    whyItWorks:
      'Lean protein, a mix of vegetables, and whole grains make an easy balanced plate that comes together quickly in one pan.',
    ingredients: [
      '1 chicken breast, sliced',
      '2 cups mixed stir-fry vegetables',
      '1 cup cooked brown rice',
      '1 tbsp olive or sesame oil',
      '1 tbsp low-sodium soy sauce',
      '1 tsp ginger, grated',
      '1 clove garlic, minced',
    ],
    steps: [
      'Heat the oil in a pan over medium-high heat.',
      'Cook the chicken until golden and cooked through; set aside.',
      'Stir-fry the vegetables with garlic and ginger for 3–4 minutes.',
      'Return the chicken, add the soy sauce, and toss together.',
      'Serve over the brown rice.',
    ],
    tip: 'Swap chicken for tofu, shrimp, or chickpeas to change it up.',
  },
  {
    id: 'chickpea-cucumber-salad',
    title: 'Chickpea & Cucumber Salad',
    time: '10 min',
    category: 'Plant-forward',
    whyItWorks:
      'Chickpeas add plant protein and fiber, and fresh vegetables keep it light and refreshing — a good make-ahead lunch.',
    ingredients: [
      '1 can (400 g) chickpeas, rinsed',
      '1 cucumber, diced',
      '1 cup cherry tomatoes, halved',
      '1/4 red onion, finely sliced',
      '2 tbsp olive oil',
      '1 tbsp lemon juice',
      'Fresh parsley, salt, and pepper',
    ],
    steps: [
      'Combine the chickpeas, cucumber, tomatoes, and onion in a bowl.',
      'Whisk the olive oil and lemon juice together.',
      'Pour over the salad and toss with parsley, salt, and pepper.',
      'Chill for 10 minutes before serving for the best flavor.',
    ],
    tip: 'Add crumbled feta or a handful of grains to make it a fuller meal.',
  },
  {
    id: 'sheetpan-tofu-veg',
    title: 'Sheet-Pan Tofu & Vegetables',
    time: '35 min',
    category: 'Plant-forward',
    whyItWorks:
      'Tofu brings plant protein and roasted vegetables caramelize into deep flavor with very little hands-on work.',
    ingredients: [
      '1 block firm tofu, cubed and patted dry',
      '2 cups mixed vegetables (broccoli, peppers, carrots)',
      '1 tbsp cornstarch',
      '2 tbsp olive oil',
      '1 tbsp low-sodium soy sauce',
      '1 tsp smoked paprika',
      '1 cup cooked rice, to serve',
    ],
    steps: [
      'Heat the oven to 200°C (400°F).',
      'Toss the tofu with cornstarch and half the oil.',
      'Spread the tofu and vegetables on a lined tray; drizzle with the rest of the oil.',
      'Sprinkle with paprika and roast 25–30 minutes, turning once.',
      'Drizzle with soy sauce and serve over rice.',
    ],
    tip: 'Pressing the tofu dry is the key step for a crispier result.',
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

export function findRecipe(id?: string): Recipe {
  if (id) {
    const byId = recipes.find((r) => r.id === id);
    if (byId) return byId;
    const key = normalizeKey(id);
    const byTitle = recipes.find((r) => normalizeKey(r.title) === key);
    if (byTitle) return byTitle;
  }
  return recipes[0];
}
