import React, { useState, useMemo, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, TextInput, FlatList, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  category: string;
}

const mockRecipes: Recipe[] = [
  { id: '1', title: 'Greek Yogurt Parfait', description: 'High-protein breakfast with berries and granola', image: '/images/parfait.jpg', prepTime: '5 min', cookTime: '0 min', servings: '1', category: 'Breakfast' },
  { id: '2', title: 'Quinoa Salad', description: 'Mediterranean quinoa with vegetables and lemon', image: '/images/quinoa.jpg', prepTime: '15 min', cookTime: '10 min', servings: '4', category: 'Lunch' },
  { id: '3', title: 'Baked Salmon', description: 'Salmon with roasted vegetables and herbs', image: '/images/salmon.jpg', prepTime: '10 min', cookTime: '15 min', servings: '2', category: 'Dinner' },
  { id: '4', title: 'Green Smoothie', description: 'Spinach, banana, protein powder and almond milk', image: '/images/smoothie.jpg', prepTime: '5 min', cookTime: '0 min', servings: '1', category: 'Snacks' },
  { id: '5', title: 'Chickpea Curry', description: 'Spiced chickpeas with coconut milk and vegetables', image: '/images/curry.jpg', prepTime: '10 min', cookTime: '20 min', servings: '4', category: 'Dinner' },
  { id: '6', title: 'Grilled Chicken Bowl', description: 'Grilled chicken over greens with vegetables and dressing', image: '/images/chicken.jpg', prepTime: '10 min', cookTime: '0 min', servings: '1', category: 'Lunch' }
];

export default function RecipeFinderScreen({navigation}: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');

  useEffect(
    () => {
      setTimeout(
        () => {
          setRecipes(mockRecipes);
          setFiltered(mockRecipes);
        },
        500
      );
    },
    []
  );

  const categories = useMemo(() => {
    const catSet = new Set(mockRecipes.map((r) => r.category));
    return Array.from(catSet);
  }, []);

  const filteredRecipes = useMemo(() => {
    if (search.trim() === '') return filtered;
    return mockRecipes.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Recipe Finder</Text>
          <Text style={s.headerSubtitle}>Search and browse recipes</Text>
        </View>

        <View style={s.searchBar}>
          <TextInput
            placeholder="Search recipes or browse categories"
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholderTextColor={colors.muted}
            style={s.input}
          />
        </View>

        <View style={s.categories}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                s.categoryButton,
                search === cat ? s.categoryButtonActive : s.categoryButtonInactive
              ]}
              onPress={() => setSearch(cat)}
            >
              <Text style={s.categoryText}>{cat}</Text>
            </Pressable>
          ))}
        </View>

        {filteredRecipes.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No recipes found. Try different search terms.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={s.recipeItem} onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}>
                <View style={s.recipeImageContainer}>
                  <Image source={{ uri: item.image }} style={s.recipeImage} />
                </View>
                <View style={s.recipeInfo}>
                  <Text style={s.recipeTitle}>{item.title}</Text>
                  <Text style={s.recipeMeta}>
                    {item.prepTime} prep · {item.cookTime} cook · {item.servings} servings
                  </Text>
                </View>
                <Text style={s.recipeDescription}>{item.description}</Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={s.separator} />}
            horizontal={false}
            scrollEventThrottle={30}
          />
        )}

        <View style={s.viewAll}>
          <Pressable style={s.viewAllButton} onPress={() => navigation.navigate('RecipeDetail')}>
            <Text style={s.viewAllText}>View All Recipes</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 24,
    paddingBottom: 40
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 24
  },
  headerTitle: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  headerSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary
  },
  searchBar: {
    marginBottom: 16
  },
  input: {
    fontFamily: 'Roboto',
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    backgroundColor: colors.surface
  },
  categories: {
    marginBottom: 16
  },
  categoryButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.surface
  },
  categoryButtonActive: {
    padding: 8,
    borderColor: colors.deepTeal,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.deepTeal
  },
  categoryButtonInactive: {
    padding: 8,
    borderColor: colors.border,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.surface
  },
  categoryInactive: {
    padding: 8,
    borderColor: colors.border,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.surface,
    color: colors.text
  },
  categoryText: {
    color: colors.text,
    fontFamily: 'Roboto',
    fontSize: 12
  },
  emptyState: {
    padding: 40,
    textAlign: 'center',
    color: colors.textSecondary
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: 'Roboto',
    fontSize: 16
  },
  recipeItem: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12
  },
  recipeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.muted,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10
  },
  recipeInfo: {
    flex: 1
  },
  recipeTitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  recipeMeta: {
    fontFamily: 'Roboto',
    fontSize: 11,
    color: colors.textSecondary
  },
  recipeDescription: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  viewAll: {
    marginTop: 24,
    alignItems: 'center'
  },
  viewAllButton: {
    padding: 8
  },
  viewAllText: {
    color: colors.deepTeal,
    fontFamily: 'Roboto',
    fontSize: 14
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6
  }
});