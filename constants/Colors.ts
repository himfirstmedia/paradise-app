/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#263B8E';
const tintColorDark = '#263B8E';
const primary= '#263B8E';

const secondary= '#3A86FF';
const success = '#4ADE80eb';
const  warning = '#FACC15eb';
const danger = '#FF3737eb';

export const Colors = {
  light: {
    text: '#11181C',
    placeholder: '#888888',
    input: '#F2F2F2',
    selection: primary,
    button: primary,
    background: '#fff',
    border: primary,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    completed: success,
    pending: warning,
    overdue: danger,
  },
  dark: {
    
    secondary: '',
    text: '#ECEDEE',
    placeholder: '#888888',
    input: '#323232',
    selection: primary,
    button: primary,
    background: '#151718',
    border: primary,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    completed: success,
    pending: warning,
    overdue: danger,
  },
};

