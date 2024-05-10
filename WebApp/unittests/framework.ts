/*
  This is a simple, custom testing framework for our needs.

  Easy to use: TestScript(), TestCase() and expect()
  as in testProviders.ts

  Configure command to run as in package.json

  Designed for ts files only, not tsx

  How to log during testing:
    Don't use console.log() that prints in the console
    Use console.warn() that prints in file `errors.log`
    Or logResult() that prints in file `results.log`
*/

// Import .env

import { config } from 'dotenv'
config()

// Define framework functions

import { basename, extname } from 'path'
const filename = p => basename(p, extname(p))

var testCaseCount = 0
var testCaseSuccess = 0
var testCaseWarning = 0
var testCaseFailure = 0
var testAssertionCount = 0
var testAssertionSuccess = 0
var testAssertionWarning = 0
var testAssertionFailure = 0

export function expect(testName: string, cond: boolean, severity: 'failure' | 'warning' = 'failure') {
  const assertionMsg = `Assertion #${testAssertionCount++}: ${testName}`
  if (cond) {
    testAssertionSuccess++
    console.log(`    ✔️  Success on ${assertionMsg}`)
  } else if (severity === 'warning') {
    testAssertionWarning++
    console.log(`    ⚠️  Warning on ${assertionMsg}`)
  } else {
    testAssertionFailure++
    console.log(`    ❌ Failure on ${assertionMsg}`)
  }
}

export async function TestCase(testCaseName: string, fc: Function) {
  if (process.env.TEST_CASE && !testCaseName.startsWith(process.env.TEST_CASE)) return

  const header = `Case #${testCaseCount++}: ${testCaseName}`
  writeLog(`\n\n${header}\n`)
  console.log(`\n\n${header}`)
  const failuresBefore = testAssertionFailure
  const warningsBefore = testAssertionWarning
  try {
    await fc()
  } catch (error) {
    testAssertionCount++
    testAssertionFailure++
    console.log(`    ❌ ${error}`)
  }
  if (testAssertionFailure !== failuresBefore) testCaseFailure++
  else if (testAssertionWarning !== warningsBefore) testCaseWarning++
  else testCaseSuccess++
}

export async function TestScript(fc: Function) {
  const header = generateHeader(` Test Script ${filename(process.argv[1])} `)
  writeLog(header)
  console.log(`\n\n${header}`)
  await fc()
  console.log(`\n\nSummary of ${filename(process.argv[1])}:`)
  console.log(
    `    ✔️  ${testCaseSuccess}/${testCaseCount} Cases complete, ⚠️  ${testCaseWarning} warn, ❌ ${testCaseFailure} incomplete`,
  )
  console.log(
    `    ✔️  ${testAssertionSuccess}/${testAssertionCount} Assertions succeed, ⚠️  ${testAssertionWarning} warn, ❌ ${testAssertionFailure} fail`,
  )
  console.log(`\n`)
}

function generateHeader(body: string) {
  const LENGTH = 99
  const body2 = ` ${body} `
  const halfLength = Math.floor((LENGTH - body2.length) / 2)
  const secondHalf = LENGTH - body2.length - halfLength
  return `${'#'.repeat(LENGTH)}\n${'#'.repeat(halfLength)}${body2}${'#'.repeat(secondHalf)}\n${'#'.repeat(LENGTH)}`
}

// Define log helper

import { writeFileSync } from 'fs'

const LOG_FILE = __dirname + `/../../unittests_logs/${filename(process.argv[1])}.results`

function writeLog(msg: string) {
  writeFileSync(LOG_FILE, msg + '\n', { flag: 'a+' })
}
writeFileSync(LOG_FILE, '') // Empty the file initially

export function logResult(name: string, objct: any) {
  const toLog = JSON.stringify(objct, null, 2)
  writeLog(`Result of ${name}:\n\n${toLog}\n\n\n`)
}
