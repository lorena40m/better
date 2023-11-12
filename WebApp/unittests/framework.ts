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
var testAssertionCount = 0
var testAssertionSuccess = 0
var testAssertionWarning = 0
var testAssertionFailure = 0

export function expect(testName: string, cond: boolean, severity: 'failure' | 'warning' = 'failure') {
  const assertionMsg = `Test Assertion #${testAssertionCount++}: ${testName}`
  if (cond) {
    testAssertionSuccess++
    console.log(`    ✔️  Success on ${assertionMsg}`)
  }
  else if (severity === 'warning') {
    testAssertionWarning++
    console.log(`    ⚠️  Warning on ${assertionMsg}`)
  }
  else {
    testAssertionFailure++
    console.log(`    ❌ Fail on ${assertionMsg}`)
  }
}

export async function TestCase(testCaseName: string, fc: Function) {
  writeLog(`\n\nTest Case #${testCaseCount}: ${testCaseName}\n`)
  console.log(`\n\nTest Case #${testCaseCount++}: ${testCaseName}`)
  const failuresBefore = testAssertionWarning + testAssertionFailure
  try {
    await fc()
  } catch (error) {
    console.log(`    ❌ Error happened: ${error}`)
  }
  const failuresAfter = testAssertionWarning + testAssertionFailure
  if (failuresAfter === failuresBefore) testCaseSuccess++
}

export async function TestScript(fc: Function) {
  writeLog(`*** Test Script ${basename(process.argv[1])} ***`)
  console.log(`*** Test Script ${basename(process.argv[1])} ***`)
  await fc()
  console.log(`\n\nSummary ${basename(process.argv[1])}:`)
  console.log(`    ✔️  ${testCaseSuccess}/${testCaseCount} Cases complete, ❌ ${testCaseCount - testCaseSuccess} incomplete`)
  console.log(`    ✔️  ${testAssertionSuccess}/${testAssertionCount} Assertions succeed, ⚠️  ${testAssertionWarning} warn, ❌ ${testAssertionFailure} fail`)
  console.log(`\n`)
}

// Define log helper

import { writeFileSync } from 'fs'

const LOG_FILE = __dirname + `/../../unittests_logs/${filename(process.argv[1])}.results`
console.warn(LOG_FILE)

function writeLog(msg: string) {
  writeFileSync(LOG_FILE, msg + '\n', { flag: 'a+' })
}
writeFileSync(LOG_FILE, '') // Empty the file initially

export function logResult(name: string, objct: any) {
  const toLog = JSON.stringify(objct, null, 2)
  writeLog(`Result of ${name}:\n\n ${toLog} \n\n\n`)
}
