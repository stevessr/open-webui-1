import { readable } from 'svelte/store';

export const page = readable({
  url: new URL('http://localhost'),
  params: {},
  route: {
    id: null
  },
  status: 200,
  error: null,
  data: {},
  form: undefined,
});

export const navigating = readable(null);
export const updated = readable(false);