export function formatPrice(price: string, locale: string, rates: object) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: locale === 'en' ? 'USD' : 'EUR' })
    .format(locale === 'en' ? +price / 100 : +price * (rates['EUR/USD'] / 100) / 100)
}

const magnitudes = {
  en: [
    'million',
    'billion',
    'trillion',
    'quadrillion',
    'quintillion',
    'sextillion',
    'septillion',
    'octillion',
    'nonillion',
    'ziiiiiilion'
  ],
  fr: [
    'million',
    'milliard',
    'billion',
    'billiard',
    'trillion',
    'trilliard',
    'quadrillion',
    'quadrilliard',
    'quintillion',
    'ziiiiiilion',
  ],
};

const floatSeparator = {
  en: '.',
  fr: ',',
}

const thousandSeparator = {
  en: ',',
  fr: ' ',
}

// TODO for Ethereum: dust notation when significant digit < e-6
const dustTerm = {
  en: 'dust',
  fr: 'poussière',
}

// Note: made for maximum 6 digits (TODO)
export function formatToken(quantity: string, decimals: number, locale: string) {
  quantity = quantity.replace(/^0+/, '');
  const biggerSignificantDigit = quantity.length - decimals;
  let firstThreeDigits = quantity.slice(0, 3);

  if (biggerSignificantDigit > 6) {
    const magnitude = Math.floor((biggerSignificantDigit - 1) / 3);
    const magnitudeTerm = magnitude - 2 < magnitudes[locale].length ? magnitudes[locale][magnitude - 2] : magnitudes[magnitudes[locale].length - 1];
    if (quantity.length % 3 > 0) {
      firstThreeDigits = firstThreeDigits.slice(0, biggerSignificantDigit % 3)
        + floatSeparator[locale] + firstThreeDigits.slice(quantity.length % 3)
    };
    return firstThreeDigits + thousandSeparator[locale] + magnitudeTerm +
      (firstThreeDigits[0] == '1' && quantity.length % 3 === 1 ? '' : 's')
  }

  if (biggerSignificantDigit >= 3) {
    let number = Math.floor(+quantity / Math.pow(10, decimals))
    return new Intl.NumberFormat(locale).format(number)
  }

  const significance = biggerSignificantDigit + Math.min(3 - biggerSignificantDigit, decimals)

  if (biggerSignificantDigit >= 0) {
    let number = +firstThreeDigits / Math.pow(10, significance - biggerSignificantDigit);
    return number.toFixed(Math.min(significance - biggerSignificantDigit, decimals)).replace('.', floatSeparator[locale])
  }

  return (+quantity / Math.pow(10, decimals)).toFixed(decimals).replace('.', floatSeparator[locale])
}

// test
// console.log(formatToken("12345", 6, "fr"))
