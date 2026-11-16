import React from 'react';
import { MealPlansScreen } from '../resources/InteractiveResourceScreens';

/**
 * MealPlanner tool route.
 *
 * Uses the same backend-persisted `MealPlansScreen` implementation (`GET/POST
 * /api/resource/meal-plans`) so plans created in Tools or in ResourceHub are
 * stored in one place in PostgreSQL.
 */
export default function MealPlannerScreen({ navigation }: any) {
  return <MealPlansScreen navigation={navigation} />;
}
