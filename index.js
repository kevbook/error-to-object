'use strict';

/**
 * Error common properties
 * @private
 */
const commonProperties = [
  {
    property: 'name',
    enumerable: false
  },
  {
    property: 'message',
    enumerable: false
  },
  {
    property: 'stack',
    enumerable: false
  },
  {
    property: 'code',
    enumerable: true
  }
];

/**
 * Symbol used to keep a track of circular references
 * @private
 */
const toJsonWasCalled = Symbol('.toJSON was called');

/**
 * Check for circular references
 * @private
 */
function toJSON (from) {
  from[toJsonWasCalled] = true;
  const json = from.toJSON();
  delete from[toJsonWasCalled];
  return json;
}

/**
 * Convert JS Error into a plain object
 * @public
 *
 * @param {error} value
 * @param {number} options.maxDepth
 */
function errorToObject (value, options = {}) {
  const { maxDepth = Number.POSITIVE_INFINITY } = options;

  if (typeof value === 'object' && value !== null) {
    const message = [];
    const stack = [];

    function destroyCircular ({
      from,
      seen,
      to_,
      forceEnumerable,
      maxDepth,
      depth
    }) {
      const to = to_ || (Array.isArray(from) ? [] : {});

      seen.push(from);

      if (depth >= maxDepth) {
        return to;
      }

      if (typeof from.toJSON === 'function' && from[toJsonWasCalled] !== true) {
        return toJSON(from);
      }

      // If "cause" key exists make sure its enumerable
      if (from.hasOwnProperty('cause')) {
        Object.defineProperty(from, 'cause', { enumerable: true });
      }

      for (const [key, value] of Object.entries(from)) {
        // eslint-disable-next-line node/prefer-global/buffer
        if (typeof Buffer === 'function' && Buffer.isBuffer(value)) {
          to[key] = '[object Buffer]';
          continue;
        }

        if (typeof value === 'function') {
          // Handle error causes (including VError/NError style causes)
          // https://github.com/voxpelli/pony-cause/blob/main/index.js#L64
          if (key === 'cause') {
            value = value();
          } else {
            continue;
          }
        }

        if (!value || typeof value !== 'object') {
          to[key] = value;
          continue;
        }

        if (!seen.includes(from[key])) {
          depth++;

          to[key] = destroyCircular({
            from: from[key],
            seen: [...seen],
            forceEnumerable,
            maxDepth,
            depth
          });
          continue;
        }

        to[key] = '[Circular]';
      }

      for (const { property, enumerable } of commonProperties) {
        if (typeof from[property] === 'string') {
          // Build full stack trace for error + all causes
          if (property === 'stack') {
            stack.push(from[property]);
          } else {
            if (property === 'message') {
              message.push(from[property]);
            }
            Object.defineProperty(to, property, {
              value: from[property],
              enumerable: forceEnumerable ? true : enumerable,
              configurable: true,
              writable: true
            });
          }
        }
      }

      return to;
    }

    // Begin traversal
    const result = destroyCircular({
      from: value,
      seen: [],
      forceEnumerable: true,
      maxDepth,
      depth: 0
    });

    result.message = message.reverse().join(': ');
    result.stack = stack.reverse().join('\ncaused by: ');
    return result;
  }

  // People sometimes throw things besides Error objects…
  if (typeof value === 'function') {
    // `JSON.stringify()` discards functions. We do too, unless a function is thrown directly.
    return `[Function: ${(value.name || 'anonymous')}]`;
  }

  return value;
}

module.exports = errorToObject;
