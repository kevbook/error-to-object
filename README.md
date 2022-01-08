# error-to-object

Convert JS Error into a plain object. Useful when sending error data over the network, for example using `JSON.stringify()` for logging.

- Supports [Error Causes](https://github.com/tc39/proposal-error-cause)
- Supports chaining with [VError](https://github.com/joyent/node-verror)/[NError](https://github.com/Netflix/nerror) style causes
- Message output is similar to the standard VError behaviour of appending message with the cause.message, separating the two with a `: `(since `Error Causes` doesn't do this)
- Full stack trace for error & all causes

```js
const errorToObject = require('./index');

// Error1
const error1 = new Error('Error1 message');

// Error2
const error2 = new RangeError('Error2 message', { cause: error1 });
error2.meta = { method: 'GET', rpcUser: 123 };

// Error3
const error3 = new VError(error2, 'Error3 message');

// Final error
const error4 = new Error('Error 4 message', {cause: error3});

/**
 * Convert JS Error into a plain object
 *
 * @public
 * @param {error} value
 * @param {number} options.maxDepth
 */
console.log(errorToObject(error4));
```

---

## See also:

- [Error Cause implementations](https://github.com/tc39/proposal-error-cause#implementations)
- [Pony Cause](https://github.com/voxpelli/pony-cause )
- [serialize-error](https://github.com/sindresorhus/serialize-error)
