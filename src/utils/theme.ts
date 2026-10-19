/* 全局主题切换：所有页面共享同一 localStorage key（theme） */
import { ref } from 'vue';
import { useDark, useToggle } from '@vueuse/core';

export const useAppTheme = () => {
  const theme = ref('light');
  const isDark = useDark({
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'theme',
    onChanged(dark: boolean) {
      if (dark) {
        theme.value = 'dark';
        document.body.setAttribute('arco-theme', 'dark');
        document.documentElement.classList.add('dark');
      } else {
        theme.value = 'light';
        document.body.removeAttribute('arco-theme');
        document.documentElement.classList.remove('dark');
      }
    },
  });
  const toggleTheme = useToggle(isDark);
  return { theme, isDark, toggleTheme };
};
