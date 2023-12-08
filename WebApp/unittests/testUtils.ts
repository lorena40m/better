import { expect, TestCase, TestScript, logResult } from './framework'
import { formatPrice, formatToken } from '../src/utils/format'

const formatPrice_CASES = [
  { quantity: 10000000000, locale: 'fr', expect: '9,00 milliards €', },
  { quantity: 1000000000, locale: 'fr', expect: '900 millions €', },
  { quantity: 100000000, locale: 'fr', expect: '90,0 millions €', },
  { quantity: 10000000, locale: 'fr', expect: '9,00 millions €', },
  { quantity: 1000000, locale: 'fr', expect: '900 000 €', },
  { quantity: 100000, locale: 'fr', expect: '90 000 €', },
  { quantity: 10000, locale: 'fr', expect: '9 000 €', },
  { quantity: 1000, locale: 'fr', expect: '900 €', },
  { quantity: 100, locale: 'fr', expect: '90,00 €', },
  { quantity: 10, locale: 'fr', expect: '9,00 €', },
  { quantity: 1, locale: 'fr', expect: '0,90 €', },
  { quantity: 0.1, locale: 'fr', expect: '0,09 €', },
  { quantity: 0.01, locale: 'fr', expect: '0,0090 €', },
  { quantity: 0.001, locale: 'fr', expect: '0,00090 €', },
  { quantity: 0.0001, locale: 'fr', expect: '0,000090 €', },
  { quantity: 0, locale: 'fr', expect: '0 €', },
]
const formatToken_CASES = [
  { quantity: '1234567890000000000000', decimals: 6, locale: 'fr', expect: '1,23 billiard', },
  { quantity: '123456789000000000000', decimals: 6, locale: 'fr', expect: '123 billions', },
  { quantity: '12345678900000000000', decimals: 6, locale: 'fr', expect: '12,3 billions', },
  { quantity: '1234567890000000000', decimals: 6, locale: 'fr', expect: '1,23 billion', },
  { quantity: '123456789000000000', decimals: 6, locale: 'fr', expect: '123 milliards', },
  { quantity: '12345678900000000', decimals: 6, locale: 'fr', expect: '12,3 milliards', },
  { quantity: '1234567890000000', decimals: 6, locale: 'fr', expect: '1,23 milliard', },
  { quantity: '123456789000000', decimals: 6, locale: 'fr', expect: '123 millions', },
  { quantity: '12345678900000', decimals: 6, locale: 'fr', expect: '12,3 millions', },
  { quantity: '1234567890000', decimals: 6, locale: 'fr', expect: '1,23 million', },
  { quantity: '123456789000', decimals: 6, locale: 'fr', expect: '123 456', },
  { quantity: '12345678900', decimals: 6, locale: 'fr', expect: '12 345', },
  { quantity: '1234567890', decimals: 6, locale: 'fr', expect: '1 234', },
  { quantity: '123456789', decimals: 6, locale: 'fr', expect: '123', },
  { quantity: '12345678', decimals: 6, locale: 'fr', expect: '12,3', },
  { quantity: '1234567', decimals: 6, locale: 'fr', expect: '1,23', },
  { quantity: '123456', decimals: 6, locale: 'fr', expect: '0,123', },
  { quantity: '12345', decimals: 6, locale: 'fr', expect: '0,012345', },
  { quantity: '1234', decimals: 6, locale: 'fr', expect: '0,001234', },
  { quantity: '123', decimals: 6, locale: 'fr', expect: '0,000123', },
  { quantity: '12', decimals: 6, locale: 'fr', expect: '0,000012', },
  { quantity: '10000000', decimals: 6, locale: 'fr', expect: '10,0', },
  { quantity: '1000000', decimals: 6, locale: 'fr', expect: '1,00', },
  { quantity: '100000', decimals: 6, locale: 'fr', expect: '0,100', },
  { quantity: '1', decimals: 0, locale: 'fr', expect: '1', },
  { quantity: '10', decimals: 1, locale: 'fr', expect: '1,0', },
  { quantity: '1', decimals: 1, locale: 'fr', expect: '0,1', },
  { quantity: '585515', decimals: 0, locale: 'fr', expect: '585 515', },
  { quantity: '1010987', decimals: 0, locale: 'en', expect: '1.01 million', },
  { quantity: '0', decimals: 6, locale: 'en', expect: '0', },
]

TestScript(async function () {
  await TestCase('formatPrice', async function () {
    for (const CASE of formatPrice_CASES) {
      const result = formatPrice(CASE.quantity, CASE.locale, { 'EUR/USD': 0.90 })
      expect(`formatPrice("${CASE.quantity}", "${CASE.locale}", { 'EUR/USD': 0.90 }) should return "${CASE.expect}" ; got: "${result}"`, result === CASE.expect)
    }
  })
  await TestCase('formatToken', async function () {
    for (const CASE of formatToken_CASES) {
      const result = formatToken(CASE.quantity, CASE.decimals, CASE.locale)
      expect(`formatToken("${CASE.quantity}", ${CASE.decimals}, "${CASE.locale}") should return "${CASE.expect}" ; got: "${result}"`, result === CASE.expect)
    }
  })
})
