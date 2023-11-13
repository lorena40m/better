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
  fr: ' ',
}

// TODO for Ethereum: dust notation when significant digit < e-6
const dustTerm = {
  en: 'dust',
  fr: 'poussière',
}

export function formatToken(quantity: string, decimals: number, locale: string) {
  quantity = quantity.replace(/^0+/, '');
  const biggerSignificantDigit = quantity.length - decimals;
  let firstThreeDigits = quantity.slice(0, 3);
  let term;

  if (biggerSignificantDigit > 6) {
    const magnitude = Math.floor((biggerSignificantDigit - 1) / 3);
    const magnitudeTerm = magnitude - 2 < magnitudes[locale].length ? magnitudes[locale][magnitude - 2] : magnitudes[magnitudes[locale].length - 1];
    if (quantity.length % 3 > 0) {
      firstThreeDigits = firstThreeDigits.slice(0, biggerSignificantDigit % 3)
        + floatSeparator[locale] + firstThreeDigits.slice(quantity.length % 3)
    };
    term = firstThreeDigits + ' ' + magnitudeTerm +
      (firstThreeDigits[0] == '1' && quantity.length % 3 === 1 ? '' : 's');
      console.log("supérieur à 6")
  }
  else {
    let termNumber = +quantity / Math.pow(10, 6);

    term = new Intl.NumberFormat(locale).format(termNumber) ;
  }

  return term
}

// test
// console.log(formatToken("12345", 6, "fr"))
