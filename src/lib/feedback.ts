import { Alert, Platform } from 'react-native';

type AlertButton = {
  text?: string;
  onPress?: (() => void) | null;
  style?: 'default' | 'cancel' | 'destructive';
};

export function installWebAlert(): void {
  if (Platform.OS !== 'web') return;
  const win = globalThis as any;
  if (!win || typeof win.alert !== 'function') return;

  (Alert as any).alert = (title?: string, message?: string, buttons?: AlertButton[]) => {
    const body = [title, message].filter(Boolean).join('\n\n');
    if (!buttons || buttons.length === 0) {
      win.alert(body);
      return;
    }
    const cancel = buttons.find((button) => button.style === 'cancel');
    const confirm = buttons.find((button) => button.style !== 'cancel') || buttons[buttons.length - 1];
    if (buttons.length === 1) {
      if (win.confirm(body)) confirm?.onPress?.();
      return;
    }
    if (win.confirm(body)) confirm?.onPress?.();
    else cancel?.onPress?.();
  };
}
