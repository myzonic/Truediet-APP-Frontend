import React from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, Image, Dimensions, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const portionData = {
  protein: {
    title: 'Protein Portions',
    items: [
      { name: 'Chicken/Fish', description: 'Palm-sized', measurement: 'approx 3 oz / 85 g' },
      { name: 'Beef', description: 'Palm-sized (thicker)', measurement: 'approx 3-4 oz / 85-115 g' },
      { name: 'Tofu', description: 'Fist-sized', measurement: 'approx 1/2 cup / 125 g' }
    ]
  },
  grains: {
    title: 'Grain Portions',
    items: [
      { name: 'Rice/Pasta', description: 'Hand scoop', measurement: 'approx 1/2 cup cooked' },
      { name: 'Bread', description: 'One slice', measurement: 'approx 1 slice (30-40 g)' },
      { name: 'Oats', description: 'Fist-sized', measurement: 'approx 1/2 cup dry' }
    ]
  },
  vegetables: {
    title: 'Vegetable Portions',
    items: [
      { name: 'Leafy Greens', description: 'Handful', measurement: 'approx 1 cup raw' },
      { name: 'Non-starchy veg', description: 'Handful', measurement: 'approx 1/2 cup cooked' },
      { name: 'Starchy veg', description: 'Fist-sized', measurement: 'approx 1/2 cup cooked' }
    ]
  },
  fruits: {
    title: 'Fruit Portions',
    items: [
      { name: 'Fresh fruit', description: 'Tennis ball-sized', measurement: 'approx 1 medium piece' },
      { name: 'Berries', description: 'Handful', measurement: 'approx 1/2 cup' },
      { name: 'Dried fruit', description: 'Thumb-sized', measurement: 'approx 2-3 pieces' }
    ]
  },
  fats: {
    title: 'Fat Portions',
    items: [
      { name: 'Oil/Butter', description: 'Thumb tip', measurement: 'approx 1 tsp / 5 ml' },
      { name: 'Nuts/Seeds', description: 'Thumb-sized', measurement: 'approx 1/4 cup' },
      { name: 'Avocado', description: 'Half fruit', measurement: 'approx 1/2 medium avocado' }
    ]
  },
  beverages: {
    title: 'Beverage Portions',
    items: [
      { name: 'Water/Milk', description: 'Standard glass', measurement: 'approx 8 oz / 240 ml' },
      { name: 'Juice', description: 'Small glass', measurement: 'approx 4-6 oz / 120-180 ml' },
      { name: 'Alcohol', description: 'Small serving', measurement: 'approx 1.5 oz / 45 ml spirits' }
    ]
  }
};

export default function PortionGuideScreen({navigation}: any) {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Portion Guide</Text>
          <Text style={s.headerSubtitle}>Hand-based portion sizes</Text>
        </View>

        <View style={s.intro}>
          <Text style={s.introText}>
            Estimated portion sizes using your hand as a guide. Individual needs vary.
          </Text>
        </View>

        {Object.entries(portionData).map(([category, data]) => (
          <View key={category} style={s.categorySection}>
            <Text style={s.categoryTitle}>{data.title}</Text>
            <View style={s.categoryContent}>
              {data.items.map((item) => (
                <View key={item.name} style={s.portionItem}>
                  <Text style={s.portionName}>{item.name}</Text>
                  <Text style={s.portionDescription}>{item.description}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={s.visualGuide}>
          <Text style={s.visualTitle}>Visual Guide</Text>
          <View style={s.visualContainer}>
            <View style={s.visualProtein} />
            <View style={s.visualGrains} />
            <View style={s.visualVeg} />
            <View style={s.visualFruit} />
            <View style={s.visualFat} />
            <View style={s.visualBeverage} />
          </View>
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
  intro: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12
  },
  introText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary
  },
  categorySection: {
    marginBottom: 24
  },
  categoryTitle: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  categoryContent: {},
  portionItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  portionName: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text
  },
  portionDescription: {
    color: colors.textSecondary,
    fontFamily: 'Roboto',
    fontSize: 12
  },
  visualGuide: {
    marginTop: 24
  },
  visualTitle: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16
  },
  visualContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  visualProtein: {
    width: 60,
    height: 60,
    backgroundColor: colors.deepTeal,
    borderRadius: 50
  },
  visualGrains: {
    width: 50,
    height: 50,
    backgroundColor: colors.green,
    borderRadius: 50
  },
  visualVeg: {
    width: 40,
    height: 40,
    backgroundColor: colors.textSecondary,
    borderRadius: 50
  },
  visualFruit: {
    width: 30,
    height: 30,
    backgroundColor: colors.muted,
    borderRadius: 50
  },
  visualFat: {
    width: 35,
    height: 35,
    backgroundColor: colors.deepTeal,
    borderRadius: 50
  },
  visualBeverage: {
    width: 25,
    height: 25,
    backgroundColor: colors.muted,
    borderRadius: 50
  }
});