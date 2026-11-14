import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Navigation handle usable outside React components (for example when an API
 * call discovers that the session has expired, or when a notification is
 * tapped while the app is in the background).
 */
export const navigationRef = createNavigationContainerRef<Record<string, object | undefined>>();
