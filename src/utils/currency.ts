import { APP_CONFIG } from '@config/app.config';

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `${APP_CONFIG.currencySymbol} ${rounded.toLocaleString('en-IN')}`;
}

export function formatCurrencyDecimal(amount: number): string {
  return `${APP_CONFIG.currencySymbol} ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
