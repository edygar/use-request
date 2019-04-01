(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (factory((global.EdygarUseRequest = {}),global.React));
}(this, (function (exports,React) { 'use strict';

  React = React && React.hasOwnProperty('default') ? React['default'] : React;

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function dequal(foo, bar) {
    var ctor, len;
    if (foo === bar) return true;

    if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
      if (ctor === Date) return foo.getTime() === bar.getTime();
      if (ctor === RegExp) return foo.toString() === bar.toString();

      if (ctor === Array && (len = foo.length) === bar.length) {
        while (len-- && dequal(foo[len], bar[len])) {}

        return len === -1;
      }

      if (ctor === Object) {
        if (Object.keys(foo).length !== Object.keys(bar).length) return false;

        for (len in foo) {
          if (!(len in bar) || !dequal(foo[len], bar[len])) return false;
        }

        return true;
      }
    }

    return foo !== foo && bar !== bar;
  }

  function checkDeps(deps) {
    if (!deps || !deps.length) {
      throw new Error('useDeepCompareEffect should not be used with no dependencies. Use React.useEffect instead.');
    }

    if (deps.every(isPrimitive)) {
      throw new Error('useDeepCompareEffect should not be used with dependencies that are all primitive values. Use React.useEffect instead.');
    }
  }

  function isPrimitive(val) {
    return val == null || /^[sbn]/.test(typeof val);
  }

  function useDeepCompareMemoize(value) {
    var ref = React.useRef();

    if (!dequal(value, ref.current)) {
      ref.current = value;
    }

    return ref.current;
  }

  function useDeepCompareEffect(callback, dependencies) {
    checkDeps(dependencies);
    React.useEffect(callback, useDeepCompareMemoize(dependencies));
  }

  function requestStateReducer(state, _ref) {
    var type = _ref.type,
        payload = _ref.payload;

    switch (type) {
      case 'init':
        return _extends({}, state, {
          pending: true,
          status: 'pending'
        }, payload);

      case 'params_defined':
        return _extends({}, state, {
          params: payload
        });

      case 'request_succeeded':
        return _extends({}, state, {
          status: 'resolved',
          pending: false
        }, payload);

      case 'request_aborted':
        return _extends({}, state, {
          status: 'aborted',
          pending: false
        }, payload);

      case 'request_failed':
        return _extends({}, state, {
          status: 'rejected',
          pending: false
        }, payload);

      default:
        return _extends({}, state, payload);
    }
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var runtime_1 = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    var runtime = function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined; // More compressible than void 0.

      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.

        generator._invoke = makeInvokeMethod(innerFn, self, context);
        return generator;
      }

      exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.

      function tryCatch(fn, obj, arg) {
        try {
          return {
            type: "normal",
            arg: fn.call(obj, arg)
          };
        } catch (err) {
          return {
            type: "throw",
            arg: err
          };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.

      var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.

      function Generator() {}

      function GeneratorFunction() {}

      function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.


      var IteratorPrototype = {};

      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

      if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.

      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          prototype[method] = function (arg) {
            return this._invoke(method, arg);
          };
        });
      }

      exports.isGeneratorFunction = function (genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
      };

      exports.mark = function (genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;

          if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
          }
        }

        genFun.prototype = Object.create(Gp);
        return genFun;
      }; // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.


      exports.awrap = function (arg) {
        return {
          __await: arg
        };
      };

      function AsyncIterator(generator) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);

          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;

            if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
              return Promise.resolve(value.__await).then(function (value) {
                invoke("next", value, resolve, reject);
              }, function (err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return Promise.resolve(value).then(function (unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function (error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new Promise(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise = // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        } // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).


        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);

      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };

      exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.

      exports.async = function (innerFn, outerFn, self, tryLocsList) {
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
        return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
          return result.done ? result.value : iter.next();
        });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;
        return function (method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            } // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;

            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);

              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;
            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);
            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;
            var record = tryCatch(innerFn, self, context);

            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done ? GenStateCompleted : "suspendedYield";

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };
            } else if (record.type === "throw") {
              state = GenStateCompleted; // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.

              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      } // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.


      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];

        if (method === undefined) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError("The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (!info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

          context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.

          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined;
          }
        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        } // The delegate iterator is finished, so forget it and continue with
        // the outer generator.


        context.delegate = null;
        return ContinueSentinel;
      } // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.


      defineIteratorMethods(Gp);
      Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.

      Gp[iteratorSymbol] = function () {
        return this;
      };

      Gp.toString = function () {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = {
          tryLoc: locs[0]
        };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{
          tryLoc: "root"
        }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function (object) {
        var keys = [];

        for (var key in object) {
          keys.push(key);
        }

        keys.reverse(); // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.

        return function next() {
          while (keys.length) {
            var key = keys.pop();

            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          } // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.


          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];

          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1,
                next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined;
              next.done = true;
              return next;
            };

            return next.next = next;
          }
        } // Return an iterator with no values.


        return {
          next: doneResult
        };
      }

      exports.values = values;

      function doneResult() {
        return {
          value: undefined,
          done: true
        };
      }

      Context.prototype = {
        constructor: Context,
        reset: function reset(skipTempReset) {
          this.prev = 0;
          this.next = 0; // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.

          this.sent = this._sent = undefined;
          this.done = false;
          this.delegate = null;
          this.method = "next";
          this.arg = undefined;
          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                this[name] = undefined;
              }
            }
          }
        },
        stop: function stop() {
          this.done = true;
          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;

          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },
        dispatchException: function dispatchException(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;

          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined;
            }

            return !!caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }
              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },
        abrupt: function abrupt(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },
        complete: function complete(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" || record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },
        finish: function finish(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },
        "catch": function _catch(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;

              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }

              return thrown;
            }
          } // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.


          throw new Error("illegal catch attempt");
        },
        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined;
          }

          return ContinueSentinel;
        }
      }; // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.

      return exports;
    }( // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports);

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  });

  var regenerator = runtime_1;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  /**
   * In order to keep the ref always correctly updated
   * whenever the component is rendered with the value
   * changed, we updated ref as early as possible.
   *
   * Note: Before the component is rendered, we can never
   * know whether the value change is effective or if the
   * render will be bailed out.
   *
   * @param {any} value the value to keep the ref
   * @return {Object} the updated ref
   */

  function useUpdatedRef(value) {
    var ref = React.useRef(value);
    React.useLayoutEffect(function () {
      ref.current = value;
    }, [value]);
    return ref;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  /**
   * Helper Class to produce local spec-compliant abortations
   */
  var AbortError =
  /*#__PURE__*/
  function (_ref) {
    _inheritsLoose(AbortError, _ref);

    function AbortError() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _ref.call.apply(_ref, [this].concat(args)) || this;
      _this.name = 'AbortError';
      return _this;
    }

    return AbortError;
  }('DOMError' in global ? DOMError : Error);

  /**
   * Default function for performing the request at `useRequest`.
   *
   * It uses the native `fetch` with native `AbortController`
   * so polyfill according to your requirements.  Assumes `url`
   * as part of the `fetchParams`
   *
   * It creates its own AbortController so that it can be registered
   * with registerAbort, any signal present on fetchOptions will be
   * overwritten.
   *
   * @param {Object} requestState the current request state
   * @param {Request} requestState.params Definition for the request, including the url and fetch options
   * @param {Function} registerAborter Callback to set the aborter function
   *
   * @return {Promise<Response>} the future response
   */

  function defaultPerformRequest(requestState, registerAborter) {
    if (!requestState.params) {
      throw new Error('useRequest: Invalid request parameters.');
    }

    var _requestState$params$ = requestState.params.params,
        url = _requestState$params$.url,
        fetchOptions = _objectWithoutPropertiesLoose(_requestState$params$, ["url"]);

    var controller = new AbortController();
    registerAborter(function () {
      controller.abort();
    });
    return fetch(url, _extends({}, fetchOptions, {
      signal: controller.signal
    }));
  }
  /**
   * Expects the fetch options, including the URL
   *
   * @param {Object} fetchOptions Options passed to the `fetch` function
   * @return {Object} fetchOptions noop
   */

  function defaultMapRequest(fetchOptions) {
    return fetchOptions;
  }
  /**
   * Expects a fetch response and assumes JSON
   *
   * @param {Object} requestState the current state of the request
   */

  function defaultMapResponse() {
    return _defaultMapResponse.apply(this, arguments);
  }
  /**
   * Produces a callback that makes Requests, returning a Promise with
   * the last state, either a resolvution or rejection.
   *
   * The future object contains all the information around the request
   * from the arguments passed from consumer of the callback, parameters
   * the request, the own request, the own response, the mapped response,
   * also a `status` informing the last status ("resolved", "rejected", "aborted").
   *
   * @param {Boolean} throwOnAbortions whether the promise rejects on abortions.
   * @param {Boolean} throwOnRejections whether the promise rejects at all, it's
   *      usefull when the promises are not being used to control flow.
   * @param {Function} onStateChange called at each request state change
   * @param {Function|Object} request Object representing the parameters to
   *      perform request or a function that produces it from the arguments
   *      of the last call.
   * @param {Function} perform Receives the parameters and the registerAbort
   *      callback and peforms the request, returing a promise of it.
   * @param {Function} response called when request responds in order to map the
   *      request result to a consumable structure.
   * @param {Fuction} stateReducer reducer used to update the request state.
   *
   * @return {Function} request initiator
   */

  function _defaultMapResponse() {
    _defaultMapResponse = _asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee2(requestState) {
      var parsed;
      return regenerator.wrap(function (_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return requestState.responded.json();

            case 2:
              parsed = _context2.sent;

              if (requestState.responded.ok) {
                _context2.next = 5;
                break;
              }

              throw parsed;

            case 5:
              return _context2.abrupt("return", parsed);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _defaultMapResponse.apply(this, arguments);
  }

  function useRequestFactory(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$throwOnAbortions = _ref.throwOnAbortions,
        throwOnAbortions = _ref$throwOnAbortions === void 0 ? false : _ref$throwOnAbortions,
        _ref$throwOnRejection = _ref.throwOnRejections,
        throwOnRejections = _ref$throwOnRejection === void 0 ? false : _ref$throwOnRejection,
        _ref$onStateChange = _ref.onStateChange,
        onStateChange = _ref$onStateChange === void 0 ? function () {} : _ref$onStateChange,
        _ref$request = _ref.request,
        mapRequest = _ref$request === void 0 ? function (payload) {
      return payload;
    } : _ref$request,
        _ref$response = _ref.response,
        mapResponse = _ref$response === void 0 ? defaultMapResponse : _ref$response,
        _ref$perform = _ref.perform,
        performRequest = _ref$perform === void 0 ? defaultPerformRequest : _ref$perform,
        _ref$stateReducer = _ref.stateReducer,
        stateReducer = _ref$stateReducer === void 0 ? requestStateReducer : _ref$stateReducer;

    /* As all of the params will be called during the async
     * function, they should be a ref so at each new render
     * with new values, they are updated and a on going async
     * function uses the latest values.
     */
    var stateReducerRef = useUpdatedRef(stateReducer);
    var mapRequestRef = useUpdatedRef(mapRequest);
    var mapResponseRef = useUpdatedRef(mapResponse);
    var performRequestRef = useUpdatedRef(performRequest);
    var throwOnAbortionsRef = useUpdatedRef(throwOnAbortions);
    var throwOnRejectionsRef = useUpdatedRef(throwOnRejections);
    var onStateChangeRef = useUpdatedRef(onStateChange);
    return React.useCallback(
    /*#__PURE__*/
    function () {
      var _request = _asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee() {
        var aborted,
            interruped,
            unsubscribed,
            state,
            _len,
            args,
            _key,
            requestArgs,
            params,
            _abort,
            requested,
            responded,
            resolved,
            propagateChange,
            _args = arguments;

        return regenerator.wrap(function (_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                propagateChange = function (action) {
                  // Checks for abortions from the last life cycle update
                  if (aborted && !interruped) throw new AbortError('The operation was aborted.');
                  state = stateReducerRef.current(state, action);
                  if (!unsubscribed) onStateChangeRef.current(state); // Checks for abortions from the last onStateChange call

                  if (aborted && !interruped) throw new AbortError('The operation was aborted.');
                };

                aborted = false;
                interruped = false;
                unsubscribed = false;

                for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = _args[_key];
                }

                requestArgs = args;
                _context.prev = 6;
                propagateChange({
                  type: 'init',
                  payload: {
                    unsubscribe: function unsubscribe() {
                      unsubscribed = true;
                    },
                    abort: function abort() {
                      aborted = true;
                    },
                    args: requestArgs
                  }
                });
                _context.next = 10;
                return typeof mapRequestRef.current === 'function' ? mapRequestRef.current.apply(mapRequestRef, args) : mapRequestRef.current;

              case 10:
                params = _context.sent;
                propagateChange({
                  type: 'params_defined',
                  payload: params
                });
                requested = performRequestRef.current(state, function (aborter) {
                  _abort = aborter;
                });
                propagateChange({
                  type: 'request_sent',
                  payload: {
                    requested: requested,
                    abort: function abort() {
                      _abort();

                      aborted = true;
                    }
                  }
                });
                _context.next = 16;
                return requested;

              case 16:
                responded = _context.sent;
                propagateChange({
                  type: 'response_received',
                  payload: {
                    requested: requested,
                    responded: responded,
                    abort: function abort() {
                      aborted = true;
                    }
                  }
                });
                _context.next = 20;
                return mapResponseRef.current(state);

              case 20:
                resolved = _context.sent;
                propagateChange({
                  type: 'request_succeeded',
                  payload: {
                    resolved: resolved,
                    abort: function abort() {}
                  }
                });
                return _context.abrupt("return", state);

              case 25:
                _context.prev = 25;
                _context.t0 = _context["catch"](6);
                interruped = true;

                if (!(_context.t0 instanceof Error && _context.t0.name === 'AbortError')) {
                  _context.next = 33;
                  break;
                }

                propagateChange({
                  type: 'request_aborted',
                  payload: {
                    rejected: _context.t0,
                    abort: function abort() {}
                  }
                });

                if (!throwOnAbortionsRef.current) {
                  _context.next = 32;
                  break;
                }

                throw state;

              case 32:
                return _context.abrupt("return", state);

              case 33:
                propagateChange({
                  type: 'request_failed',
                  payload: {
                    rejected: _context.t0,
                    abort: function abort() {}
                  }
                });

                if (!throwOnRejectionsRef.current) {
                  _context.next = 36;
                  break;
                }

                throw state;

              case 36:
                return _context.abrupt("return", state);

              case 37:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[6, 25]]);
      }));

      return function () {
        return _request.apply(this, arguments);
      };
    }(), // All its dependencies are updated through refs
    [mapRequestRef, mapResponseRef, onStateChangeRef, performRequestRef, stateReducerRef, throwOnAbortionsRef, throwOnRejectionsRef]); // eslint-disable-line
  }

  var idleState = {
    pending: false,
    status: 'idle',
    unsubscribe: function unsubscribe() {},
    abort: function abort() {}
  };
  function useRequestReporter(_ref) {
    var _ref$onStateChange = _ref.onStateChange,
        onStateChange = _ref$onStateChange === void 0 ? function () {} : _ref$onStateChange,
        useRequestParams = _objectWithoutPropertiesLoose(_ref, ["onStateChange"]);

    var _React$useState = React.useState(idleState),
        currentState = _React$useState[0],
        setState = _React$useState[1];

    var onStateChangeRef = useUpdatedRef(onStateChange);
    var request = useRequestFactory(_extends({}, useRequestParams, {
      onStateChange: React.useCallback(function (newState) {
        setState(newState);
        onStateChangeRef.current(newState);
      }, [onStateChangeRef])
    }));
    return [React.useMemo(function () {
      return _extends({}, currentState, {
        reset: function reset() {
          setState(idleState);
          onStateChangeRef.current(idleState);
        }
      });
    }, [currentState, onStateChangeRef]), request];
  }

  var bucket = new Map();
  /**
   * Converts GET Request Params into cache id, otherwise, null
   *
   * @param {Request} params Definition for the request, including the url and fetch options
   *
   * @return {String} the cache id
   */

  function defaultGetCachedIdByParams(params) {
    if (params.method && params.method.toLowerCase() !== 'get') {
      return null;
    }

    return JSON.stringify(params);
  }
  /**
   * Converts arguments given to request initiator into cache id
   *
   * @return {String} the cache id
   */

  function defaultGetCachedId() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return JSON.stringify(args);
  }
  /**
   * Produces a stateReducerFn that caches requests by their params
   *
   * @param {Function} getCacheId retrieves an unique id from params to retrieve later
   * @param {Object} params.bucket The bucket to where the cache is going to be saved
   * @returns {Function} the resulting stateReducerFn
   */

  function byParams(getCacheId, _temp) {
    if (getCacheId === void 0) {
      getCacheId = defaultGetCachedIdByParams;
    }

    var _ref = _temp === void 0 ? {} : _temp,
        _ref$bucket = _ref.bucket,
        localBucket = _ref$bucket === void 0 ? bucket : _ref$bucket;

    return function (state, action) {
      var newState = requestStateReducer(state, action);

      if (action.type === 'params_defined') {
        var cacheId = getCacheId(action.payload);

        if (cacheId !== null && localBucket.has(cacheId)) {
          var fromCache = localBucket.get(cacheId);
          return _extends({}, fromCache, newState);
        }
      }

      if (action.type === 'request_succeeded') {
        var _cacheId = getCacheId(newState.params);

        localBucket.set(_cacheId, newState);
      }

      return newState;
    };
  }
  /**
   * Produces a stateReducerFn that caches requests by their args
   *
   * @param {Function} getCacheId retrieves an unique id from arguments to retrieve later
   * @param {Object} params.bucket The bucket to where the cache is going to be saved
   * @returns {Function} the resulting stateReducerFn
   */

  function byArgs(getCacheId, _temp2) {
    if (getCacheId === void 0) {
      getCacheId = defaultGetCachedId;
    }

    var _ref2 = _temp2 === void 0 ? {} : _temp2,
        _ref2$bucket = _ref2.bucket,
        localBucket = _ref2$bucket === void 0 ? bucket : _ref2$bucket;

    return function (state, action) {
      var newState = requestStateReducer(state, action);

      if (action.type === 'init') {
        var cacheId = getCacheId.apply(void 0, action.payload.args);

        if (cacheId !== null && localBucket.has(cacheId)) {
          // defines already from cache
          return _extends({}, localBucket.get(cacheId), newState);
        }
      }

      if (action.type === 'request_succeeded') {
        localBucket.set(getCacheId.apply(void 0, newState.args), newState);
      }

      return newState;
    };
  }

  var none = function (state) {
    return state;
  };

  function useRequest(_ref) {
    var _ref$auto = _ref.auto,
        auto = _ref$auto === void 0 ? true : _ref$auto,
        _ref$abortOnUnmount = _ref.abortOnUnmount,
        abortOnUnmount = _ref$abortOnUnmount === void 0 ? true : _ref$abortOnUnmount,
        _ref$cache = _ref.cache,
        shouldCache = _ref$cache === void 0 ? false : _ref$cache,
        _ref$getCacheId = _ref.getCacheId,
        getCacheId = _ref$getCacheId === void 0 ? defaultGetCachedId : _ref$getCacheId,
        _ref$cacheBucket = _ref.cacheBucket,
        cacheBucket = _ref$cacheBucket === void 0 ? 'local' : _ref$cacheBucket,
        _ref$cacheBy = _ref.cacheBy,
        cacheBy = _ref$cacheBy === void 0 ? undefined : _ref$cacheBy,
        _ref$stateReducer = _ref.stateReducer,
        _stateReducer = _ref$stateReducer === void 0 ? requestStateReducer : _ref$stateReducer,
        params = _objectWithoutPropertiesLoose(_ref, ["auto", "abortOnUnmount", "cache", "getCacheId", "cacheBucket", "cacheBy", "stateReducer"]);

    var abortOnUnmountRef = useUpdatedRef(abortOnUnmount);

    var _React$useState = React.useState(function () {
      return new Map();
    }, []),
        localBucket = _React$useState[0];

    var bucket$$1 = cacheBucket === 'local' ? localBucket : cacheBucket === 'global' ? undefined : cacheBucket;
    var finalCacheBy = shouldCache === false && !cacheBy ? none : cacheBy === 'params' || shouldCache === true || typeof cacheBy === 'function' ? byParams(typeof cacheBy === 'function' ? cacheBy : getCacheId, {
      bucket: bucket$$1
    }) : byArgs(getCacheId, {
      bucket: bucket$$1
    });

    var _useRequestReporter = useRequestReporter(_extends({}, params, {
      stateReducer: function stateReducer(newState, action) {
        return _stateReducer(finalCacheBy(newState, action), action);
      }
    })),
        state = _useRequestReporter[0],
        performRequest = _useRequestReporter[1];

    var stateRef = useUpdatedRef(state);
    var mapRequest = params.request;
    var requestRef = useUpdatedRef(React.useCallback(function () {
      stateRef.current.unsubscribe();
      performRequest.apply(void 0, arguments);
    }, [performRequest, stateRef]));
    var requestPayload = React.useMemo(function () {
      return {
        payload: auto && typeof mapRequest === 'function' ? mapRequest() : mapRequest
      };
    }, [auto, mapRequest]);
    useDeepCompareEffect(function () {
      if (auto) {
        if (requestPayload.payload) {
          stateRef.current.abort();
          requestRef.current(requestPayload.payload);
        }
      }
    }, [requestPayload, auto]);
    React.useEffect(function () {
      if (!auto) {
        stateRef.current.abort();
      }
    }, [auto, stateRef]);
    React.useEffect(function () {
      return function () {
        if (abortOnUnmountRef.current) {
          stateRef.current.abort();
        }
      };
    }, [abortOnUnmountRef, stateRef]);
    return [state, requestRef.current];
  }

  exports.default = useRequest;
  exports.useRequestFactory = useRequestFactory;
  exports.useRequestReporter = useRequestReporter;
  exports.useUpdatedRef = useUpdatedRef;
  exports.bucket = bucket;
  exports.defaultGetCachedIdByParams = defaultGetCachedIdByParams;
  exports.defaultGetCachedId = defaultGetCachedId;
  exports.byParams = byParams;
  exports.byArgs = byArgs;
  exports.defaultPerformRequest = defaultPerformRequest;
  exports.defaultMapRequest = defaultMapRequest;
  exports.defaultMapResponse = defaultMapResponse;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=use-request.umd.js.map
