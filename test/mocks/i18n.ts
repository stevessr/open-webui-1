import { readable } from 'svelte/store';

export const i18n = readable({
  t: (key) => key,
});