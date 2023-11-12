import { config } from 'dotenv'
config()

import { basename } from 'path'

var testCaseCount = 0
var testCaseSuccess = 0
var testAssertionCount = 0
var testAssertionSuccess = 0

export function expect(testName: string, cond: boolean) {
  const assertionMsg = `Test Assertion #${testAssertionCount++}: ${testName}`
  if (cond) {
    testAssertionSuccess++
    console.log(`    ✔️  Success on ${assertionMsg}`)
  }
  else {
    console.log(`    ❌ Fail on ${assertionMsg}`)
  }
}

export async function TestCase(testCaseName: string, fc: Function) {
  console.log(`\n\nTest Case #${testCaseCount++}: ${testCaseName}`)
  const failuresBefore = testAssertionCount - testAssertionSuccess
  try {
    await fc()
  } catch (error) {
    console.log(`    ❌ Error happened: ${error}`)
  }
  const failuresAfter = testAssertionCount - testAssertionSuccess
  if (failuresAfter === failuresBefore) testCaseSuccess++
}

export async function TestFramework(fc: Function) {
  console.log(`*** Test Script ${basename(process.argv[1])} ***`)
  await fc()
  console.log(`\n\nSummary ${basename(process.argv[1])}:`)
  console.log(`    ✔️  ${testCaseSuccess}/${testCaseCount} Cases completed, ❌ ${testCaseCount - testCaseSuccess} incomplete`)
  console.log(`    ✔️  ${testAssertionSuccess}/${testAssertionCount} Assertions succeeds, ❌ ${testAssertionCount - testAssertionSuccess} fails`)
}
