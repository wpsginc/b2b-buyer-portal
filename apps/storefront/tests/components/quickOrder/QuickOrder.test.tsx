import { renderWithProviders, screen } from 'tests/test-utils';

import Quickorder from '@/pages/QuickOrder';

import { mockActiveCurrency, mockCurrencies } from './mock';

vi.mock('date-fns', () => ({
  format: vi.fn(),
  subDays: vi.fn(),
}));

describe('Quickorder component', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('sf-activeCurrency', mockActiveCurrency);
    window.sessionStorage.setItem('sf-currencies', mockCurrencies);
  });

  it('renders correctly', async () => {
    renderWithProviders(<Quickorder />);

    const title = await screen.findByText('0 products');

    expect(title).toBeInTheDocument();
  });
});
