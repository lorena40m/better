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

function _formatNumber(quantity: string, decimals: number, significantDigits = 3, locale: string) {
  quantity = quantity.replace(/^0+/, '')
  const biggerSignificantDigit = quantity.length - decimals
  let firstDigits = quantity.slice(0, significantDigits)

  if (biggerSignificantDigit > 6) {
    const magnitude = Math.floor((biggerSignificantDigit - 1) / 3)
    const magnitudeTerm = magnitude - 2 < magnitudes[locale].length ? magnitudes[locale][magnitude - 2] : magnitudes[magnitudes[locale].length - 1]
    if (biggerSignificantDigit % 3 > 0) {
      firstDigits = firstDigits.slice(0, biggerSignificantDigit % 3)
        + floatSeparator[locale] + firstDigits.slice(quantity.length % 3)
    };
    return firstDigits + thousandSeparator[locale] + magnitudeTerm +
      (firstDigits[0] == '1' && quantity.length % 3 === 1 ? '' : 's')
  }

  if (biggerSignificantDigit >= 3) {
    let number = Math.floor(+quantity / Math.pow(10, decimals))
    return new Intl.NumberFormat(locale).format(number)
  }

  const significance = biggerSignificantDigit + Math.min(significantDigits - biggerSignificantDigit, decimals)

  if (biggerSignificantDigit >= 0) {
    let number = +firstDigits / Math.pow(10, significance - biggerSignificantDigit)
    return number.toFixed(Math.min(significance - biggerSignificantDigit, decimals)).replace('.', floatSeparator[locale])
  }

  return (+quantity / Math.pow(10, decimals)).toFixed(decimals).replace('.', floatSeparator[locale])
}

export function formatNumber(number: number, locale: string) {
  return _formatNumber(BigInt(Math.round(number * 1e18)).toString(), 18, 3, locale)
}

export function formatInteger(number: number, locale: string) {
  return _formatNumber(BigInt(Math.round(number)).toString(), 0, 3, locale)
}

export function formatTokenWithExactAllDecimals(quantity: string, decimals: number, locale: string) {
  return _formatNumber(quantity, decimals, quantity.length, locale)
}

// Note: made for maximum 6 digits (TODO for 18)
export function formatToken(quantity: string, decimals: number, locale: string) {
  return _formatNumber(quantity, decimals, 3, locale)
}

export function formatPrice(price: number, locale: string, rates: object) {
  price = locale === 'en' ? price : price * rates['EUR/USD']

  let number
  if (price < 1e-18) {
    number = '0'
  } else if (price < 0.01) {
    const priceWithDust = BigInt(Math.round(price * 1e18)).toString().replace(/^0+/, '')
    const biggerSignificantDigit = 18 - priceWithDust.length
    const firstDigits = priceWithDust.slice(0, 2)
    number = _formatNumber(firstDigits, biggerSignificantDigit + 2, 2, locale)
  } else if (price < 100) {
    const biggerSignificantDigit = BigInt(Math.round(price)).toString().length
    number = _formatNumber(BigInt(Math.round(price * 100)).toString(), 2, biggerSignificantDigit + 2, locale)
  } else {
    number = _formatNumber(BigInt(Math.round(price)).toString(), 0, 3, locale)
  }

  return locale === 'en' ? `$${number}` : `${number} €`
}

export function formatDate(date: string | number | Date, locale: string) {
  date = new Date(date)
  if (date.toLocaleDateString() === (new Date).toLocaleDateString())
    return date.toLocaleTimeString()
  return date.toLocaleDateString(locale)
}
