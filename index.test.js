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
const error4 = new Error('Error 4 message');
error4.cause = error3;

// Declare output from the method
let output;

// Verify error output:
try {
  // Convert error4 to plain JS object
  output = errorToObject(error4);
  // console.log(output);
  // console.log(JSON.stringify(output));

  assert.strictEqual(output.name, 'Error');
  assert.strictEqual(output.message, 'Error 4 message: Error3 message: Error2 message: Error1 message');
  assert.strictEqual(typeof output.stack, 'string');

  assert.strictEqual(output.cause.name, 'VError');
  assert.strictEqual(output.cause.message, 'Error3 message');
  assert.deepEqual(output.cause.jse_info, {});

  assert.strictEqual(output.cause.cause.name, 'RangeError');
  assert.strictEqual(output.cause.cause.message, 'Error2 message');
  assert.deepEqual(output.cause.cause.meta, { method: 'GET', rpcUser: 123 });

  assert.strictEqual(output.cause.cause.cause.name, 'Error');
  assert.strictEqual(output.cause.cause.cause.message, 'Error1 message');

  console.log('‣ Test #1 passed!');
} catch (err) {
  console.log('‣ Test #1 failed.', err);
}

// Verify error output:
try {
  // Convert error4 to plain JS object
  output = errorToObject(error4, { openTelemetry: true });
  // console.log(output);
  // console.log(JSON.stringify(output));

  assert.strictEqual(output.type, 'Error');
  assert.strictEqual(output.message, 'Error 4 message: Error3 message: Error2 message: Error1 message');
  assert.strictEqual(typeof output.stacktrace, 'string');

  assert.strictEqual(output.cause.name, 'VError');
  assert.strictEqual(output.cause.message, 'Error3 message');
  assert.deepEqual(output.cause.jse_info, {});

  assert.strictEqual(output.cause.cause.name, 'RangeError');
  assert.strictEqual(output.cause.cause.message, 'Error2 message');
  assert.deepEqual(output.cause.cause.meta, { method: 'GET', rpcUser: 123 });

  assert.strictEqual(output.cause.cause.cause.name, 'Error');
  assert.strictEqual(output.cause.cause.cause.message, 'Error1 message');

  console.log('‣ Test #2 passed!');
} catch (err) {
  console.log('‣ Test #2 failed.', err);
}
