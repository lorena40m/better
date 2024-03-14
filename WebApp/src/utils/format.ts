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

const yesterday = {
  en: 'yesterday',
  fr: 'hier',
}

function _formatNumber(quantity: string | BigInt, decimals: number, significantDigits = 3, locale: string): string {
  quantity = quantity.toString()
  const sign = quantity.startsWith('-') ? '-' : ''
  if (quantity.startsWith('-')) quantity = quantity.substring(1)
  if (/^0*$/.test(quantity)) return '0'

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
    return sign + firstDigits + ' ' + magnitudeTerm +
      (firstDigits[0] == '1' && quantity.length % 3 === 1 ? '' : 's')
  }

  if (biggerSignificantDigit >= 3) {
    let number = Math.floor(+quantity / Math.pow(10, decimals))
    return sign + new Intl.NumberFormat(locale).format(number)
  }

  const significance = biggerSignificantDigit + Math.min(significantDigits - biggerSignificantDigit, decimals)

  let number = +firstDigits / Math.pow(10, significance - biggerSignificantDigit)
  return sign + number.toFixed(Math.min(significance - biggerSignificantDigit, decimals)).replace('.', floatSeparator[locale])
}

export function formatNumber(number: number, locale: string) {
  let returnValue = _formatNumber(BigInt(Math.round(number * 1e18)).toString(), 18, 3, locale);
  while (returnValue.length > 0 && (returnValue.includes('.') || returnValue.includes(','))) {
    if (returnValue[returnValue.length - 1] === '0') {
      returnValue = returnValue.slice(0, -1);
    } else {
      break ;
    }
  }
  if (returnValue[returnValue.length - 1] === ',' || returnValue[returnValue.length - 1] === '.') {
    returnValue = returnValue.slice(0, -1);
  }
  return (returnValue);
}

export function formatInteger(number: number | BigInt, locale: string) {
  return _formatNumber(typeof number === 'bigint' ? number : BigInt(Math.round(number as number)), 0, 3, locale)
}

export function formatTokenWithExactAllDecimals(quantity: string | BigInt, decimals: number, locale: string) {
  return _formatNumber(quantity, decimals, quantity.toString().length, locale)
}

// Note: made for maximum 6 digits (TODO for 18)
export function formatToken(quantity: string | BigInt, decimals: number, locale: string) {
  return _formatNumber(quantity, decimals, 3, locale)
}

export function formatPrice(price: number, locale: string, rates: { EUR: number } | null) {
  if (!rates) return

  price = locale === 'en' ? price : price * rates.EUR

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
  let time = date.toLocaleTimeString(locale, { timeStyle: 'short' })
  time = locale === 'fr' ? time.replace(':', 'h') : time
  if (date.toLocaleDateString() === (new Date).toLocaleDateString()) {
    return time
  }
  const yesterdate = (new Date((new Date).setDate((new Date).getDate()-1)))
  if (date.toLocaleDateString() === yesterdate.toLocaleDateString()) {
    return yesterday[locale] + ' ' + time
  }
  return date.toLocaleDateString(locale, {
    dateStyle: 'full',
  })
}

export function formatDateShort(date: string | number | Date, locale: string) {
  date = new Date(date)
  const jour = date.getDate().toString().padStart(2, '0');
  const mois = (date.getMonth() + 1).toString().padStart(2, '0'); // Les mois sont indexés à partir de 0
  const annee = date.getFullYear();
  if (locale === 'fr') {
    return `${jour}/${mois}/${annee}`;
  } else if (locale === 'en') {
    return `${mois}/${jour}/${annee}`;
  } else {
    return "Error: unknown locale";
  }
}

export function formatEntiereDate(date: string | number | Date, locale: string) {
  return (new Date(date)).toLocaleString(locale)
}

export function addSign(formattedNumber: string) {
  return formattedNumber?.[0] === '-' ? formattedNumber :
    formattedNumber === '0' ? '=' + formattedNumber :
    '+' + formattedNumber
}
