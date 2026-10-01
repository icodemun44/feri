import { CURRENCY_SYMBOL, ORDER_NUMBER_PREFIX, PAISA_PER_RUPEE } from "./constants";

const GROUPING_LOCALE = "en-IN";
const MAX_FRACTION_DIGITS = 2;

export const rupeesToPaisa = (rupees: number): number => Math.round(rupees * PAISA_PER_RUPEE);

export const paisaToRupees = (paisa: number): number => paisa / PAISA_PER_RUPEE;

export const formatOrderNumber = (orderNumber: number): string =>
  `${ORDER_NUMBER_PREFIX}${orderNumber}`;

export const formatPaisa = (paisa: number): string => {
  const hasFraction = paisa % PAISA_PER_RUPEE !== 0;
  const formattedRupees = paisaToRupees(paisa).toLocaleString(GROUPING_LOCALE, {
    minimumFractionDigits: hasFraction ? MAX_FRACTION_DIGITS : 0,
    maximumFractionDigits: MAX_FRACTION_DIGITS,
  });
  return `${CURRENCY_SYMBOL} ${formattedRupees}`;
};
