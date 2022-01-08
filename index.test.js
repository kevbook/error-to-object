const assert = require('assert/strict');
const VError = require('verror');
const errorToObject = require('./index');

// Error1
const error1 = new Error('Error1 message');

// Error2
const error2 = new RangeError('Error2 message', { cause: error1 });
error2.meta = { method: 'GET', rpcUser: 123 };

// Error3
const error3 = new VError(error2, 'Error3 message');

// Final error
const error4 = new Error('Error 4 message', { cause: error3 });

// Convert error4 to plain JS object
const output = errorToObject(error4);
console.log(output);
// console.log(JSON.stringify(output));

// Verify error output:
try {
  assert.strictEqual(output.name, 'Error');
  assert.strictEqual(output.message, 'Error 4 message: Error3 message: Error2 message: Error2 message: Error1 message');
  assert.strictEqual(output.cause.name, 'VError');
  console.log('‣ Test passed!');
} catch (err) {
  console.log('‣ Test failed.', err);
}
