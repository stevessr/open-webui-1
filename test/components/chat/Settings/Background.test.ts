import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import { i18n } from '../../../mocks/i18n';

import Background from '$lib/components/chat/Settings/Background.svelte';

describe('Background.svelte', () => {
	it('renders the heading', () => {
		render(Background, {
			context: new Map([['i18n', i18n]])
		});
		expect(screen.getByText('Background Type')).toBeInTheDocument();
	});
});