// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(
      await _compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

let _isCompileStreamingSupported;
async function _compileStreaming(source, builtins) {
  _isCompileStreamingSupported ??= WebAssembly.compileStreaming(
    new Response(
      new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),
      {headers: {'Content-Type': 'application/wasm'}},
    ),
    builtins,
  ).then(() => false, (e) => e instanceof WebAssembly.CompileError);
  if (await _isCompileStreamingSupported) {
    return WebAssembly.compileStreaming(source, builtins);
  }
  return WebAssembly.compile(await (await source).arrayBuffer(), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: x0 => new Int16Array(x0),
      AC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      AD: x0 => x0.tabIndex,
      AE: x0 => x0.matches,
      AF: x0 => x0.pressure,
      AG: (x0,x1) => x0.requestAnimationFrame(x1),
      AH: x0 => x0.unlock(),
      AI: (a, s, e) => a.slice(s, e),
      AJ: x0 => x0.send(),
      AK: (x0,x1,x2) => new firebase_firestore.FieldPath(x0,x1,x2),
      AL: (x0,x1,x2) => globalThis.firebase_firestore.onSnapshot(x0,x1,x2),
      AM: (x0,x1) => x0.debug(x1),
      B: s => printToConsole(s),
      BB: x0 => new Uint16Array(x0),
      BC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      BD: (x0,x1) => x0.contains(x1),
      BE: (x0,x1) => x0.matchMedia(x1),
      BF: x0 => x0.tiltY,
      BG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BH: (x0,x1) => x0.lock(x1),
      BI: (a, i) => a.splice(i, 1),
      BJ: x0 => x0.status,
      BK: (x0,x1,x2,x3) => new firebase_firestore.FieldPath(x0,x1,x2,x3),
      BL: x0 => x0.metadata,
      BM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: x0 => new Int32Array(x0),
      CC: (x0,x1) => x0.querySelector(x1),
      CD: x0 => x0.activeElement,
      CE: x0 => x0.matches,
      CF: x0 => x0.tiltX,
      CG: x0 => x0.now(),
      CH: x0 => x0.orientation,
      CI: a => a.pop(),
      CJ: x0 => x0.response,
      CK: (x0,x1,x2,x3,x4) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4),
      CL: x0 => x0.doc,
      CM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      DC: (x0,x1) => x0.item(x1),
      DD: x0 => x0.parentNode,
      DE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      DF: x0 => x0.pointerType,
      DG: x0 => x0.performance,
      DH: (x0,x1) => x0.querySelector(x1),
      DI: (o, p) => p in o,
      DJ: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      DK: (x0,x1,x2,x3,x4,x5) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5),
      DL: x0 => x0.newIndex,
      DM: (x0,x1) => ({createScript: x0,createScriptURL: x1}),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: x0 => new Uint32Array(x0),
      EC: x0 => x0.length,
      ED: x0 => x0.tagName,
      EE: f => f.dartFunction,
      EF: x0 => x0.pointerId,
      EG: (d, digits) => d.toFixed(digits),
      EH: (x0,x1) => { x0.title = x1 },
      EI: x0 => x0.groups,
      EJ: (x0,x1) => { x0.responseType = x1 },
      EK: (x0,x1,x2,x3,x4,x5,x6) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6),
      EL: x0 => x0.oldIndex,
      EM: (x0,x1,x2) => x0.createPolicy(x1,x2),
      F: () => new Error().stack,
      FB: x0 => new Float32Array(x0),
      FC: (x0,x1) => x0.querySelectorAll(x1),
      FD: x0 => x0.target,
      FE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FF: x0 => x0.getCoalescedEvents(),
      FG: x0 => x0.maxHeight,
      FH: (x0,x1) => x0.vibrate(x1),
      FI: x0 => x0.pop(),
      FJ: () => new XMLHttpRequest(),
      FK: (x0,x1,x2,x3,x4,x5,x6,x7) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6,x7),
      FL: x0 => x0.type,
      FM: (x0,x1) => x0.createScriptURL(x1),
      G: s => JSON.stringify(s),
      GB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      GC: (x0,x1) => x0.getAttribute(x1),
      GD: x0 => x0.clientY,
      GE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      GF: s => s.trimLeft(),
      GG: x0 => x0.maxWidth,
      GH: x0 => x0.arrayBuffer(),
      GI: x0 => x0.message,
      GJ: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      GK: (x0,x1,x2,x3,x4,x5,x6,x7,x8) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6,x7,x8),
      GL: x0 => x0.docChanges(),
      GM: (x0,x1,x2) => x0.createScript(x1,x2),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: x0 => new Float64Array(x0),
      HC: x0 => x0.remove(),
      HD: x0 => x0.clientX,
      HE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      HF: s => s.toUpperCase(),
      HG: x0 => x0.minHeight,
      HH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      HI: (x0,x1) => x0.getRandomValues(x1),
      HJ: x0 => x0.input,
      HK: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => new firebase_firestore.FieldPath(x0,x1,x2,x3,x4,x5,x6,x7,x8,x9),
      HL: x0 => x0.docs,
      HM: (x0,x1) => x0.appendChild(x1),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      IC: (x0,x1) => x0.appendChild(x1),
      ID: (x0,x1,x2) => x0.addEventListener(x1,x2),
      IE: (o, i) => o[i],
      IF: (x0,x1) => x0.test(x1),
      IG: x0 => x0.minWidth,
      IH: x0 => x0.status,
      II: () => globalThis.crypto,
      IJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      IK: () => globalThis.firebase_firestore.documentId(),
      IL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: x0 => new ArrayBuffer(x0),
      JC: (x0,x1) => x0.append(x1),
      JD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      JE: o => o.length,
      JF: (x0,x1) => x0[x1],
      JG: (x0,x1) => x0.removeProperty(x1),
      JH: (x0,x1) => x0.fetch(x1),
      JI: l => new DataView(new ArrayBuffer(l)),
      JJ: x0 => x0.id,
      JK: (x0,x1) => new firebase_firestore.Timestamp(x0,x1),
      JL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      JM: (o, p) => delete o[p],
      K: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      KB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      KC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      KD: (x0,x1) => x0.closest(x1),
      KE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      KF: x0 => x0.index,
      KG: (x0,x1) => x0.add(x1),
      KH: x0 => x0.content,
      KI: x0 => x0.naturalHeight,
      KJ: x0 => x0.offsetHeight,
      KK: (x0,x1) => new firebase_firestore.GeoPoint(x0,x1),
      KL: (x0,x1,x2) => globalThis.firebase_firestore.where(x0,x1,x2),
      KM: (x0,x1) => { x0.text = x1 },
      L: o => o === undefined,
      LB: (x0,x1,x2) => new DataView(x0,x1,x2),
      LC: x0 => x0.style,
      LD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      LE: x0 => x0.language,
      LF: x0 => x0.flags,
      LG: x0 => x0.data,
      LH: x0 => x0.document,
      LI: x0 => x0.naturalWidth,
      LJ: x0 => x0.offsetWidth,
      LK: x0 => globalThis.firebase_firestore.vector(x0),
      LL: (x0,x1) => globalThis.firebase_firestore.query(x0,x1),
      LM: x0 => x0.head,
      M: o => String(o),
      MB: (o, p) => o[p],
      MC: x0 => x0.debugShowSemanticsNodes,
      MD: (handle) => clearTimeout(handle),
      ME: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      MF: (a, s) => a.join(s),
      MG: (x0,x1) => x0.removeAttribute(x1),
      MH: () => typeof dartUseDateNowForTicks !== "undefined",
      MI: (x0,x1) => x0.createElement(x1),
      MJ: x0 => x0.stopPropagation(),
      MK: x0 => globalThis.firebase_firestore.Bytes.fromUint8Array(x0),
      ML: () => globalThis.firebase_firestore.and,
      MM: (x0,x1) => { x0.text = x1 },
      N: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      NB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      NC: o => o,
      ND: x0 => x0.maxTouchPoints,
      NE: () => globalThis.window.FinalizationRegistry,
      NF: (x0,x1) => x0.error(x1),
      NG: (x0,x1) => { x0.value = x1 },
      NH: () => Date.now(),
      NI: (x0,x1) => { x0.pointerEvents = x1 },
      NJ: x0 => x0.disabled,
      NK: (x0,x1) => globalThis.firebase_firestore.doc(x0,x1),
      NL: () => globalThis.firebase_firestore.or,
      NM: x0 => x0.trustedTypes,
      O: (x0,x1) => x0.didCreateEngineInitializer(x1),
      OB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      OC: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      OD: x0 => x0.platform,
      OE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OF: () => globalThis.console,
      OG: (x0,x1) => { x0.value = x1 },
      OH: () => 1000 * performance.now(),
      OI: (x0,x1) => { x0.height = x1 },
      OJ: (x0,x1) => { x0.min = x1 },
      OK: x0 => x0.code,
      OL: x0 => globalThis.firebase_firestore.limitToLast(x0),
      OM: () => globalThis.console,
      P: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PB: o => o.byteOffset,
      PC: (x0,x1) => x0.warn(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: x0 => new window.FinalizationRegistry(x0),
      PF: s => s.trimRight(),
      PG: x0 => x0.value,
      PH: x0 => new Uint8Array(x0),
      PI: (x0,x1) => { x0.width = x1 },
      PJ: (x0,x1) => { x0.max = x1 },
      PK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PL: x0 => globalThis.firebase_firestore.limit(x0),
      PM: x0 => x0.trustedTypes,
      Q: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QB: o => o.buffer,
      QC: x0 => x0.console,
      QD: Date.now,
      QE: (x0,x1) => x0.unregister(x1),
      QF: x0 => x0.blur(),
      QG: x0 => x0.selectionDirection,
      QH: (x0,x1,x2) => x0.slice(x1,x2),
      QI: x0 => x0.style,
      QJ: (x0,x1) => { x0.disabled = x1 },
      QK: x0 => ({maxAttempts: x0}),
      QL: () => globalThis.firebase_firestore.endBefore,
      QM: (x0,x1) => { x0.crossOrigin = x1 },
      R: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      RB: Function.prototype.call.bind(DataView.prototype.getUint8),
      RC: () => globalThis.window,
      RD: (x0,x1) => x0.contains(x1),
      RE: x0 => x0.preventDefault(),
      RF: x0 => x0.button,
      RG: x0 => x0.selectionStart,
      RH: (x0,x1) => x0.decode(x1),
      RI: (x0,x1) => { x0.src = x1 },
      RJ: (x0,x1) => { x0.scrollLeft = x1 },
      RK: (x0,x1,x2) => globalThis.firebase_firestore.runTransaction(x0,x1,x2),
      RL: () => globalThis.firebase_firestore.endAt,
      RM: (x0,x1) => { x0.type = x1 },
      S: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SB: (b, o) => new DataView(b, o),
      SC: (o, c) => o instanceof c,
      SD: (decoder, codeUnits) => decoder.decode(codeUnits),
      SE: x0 => x0.parent,
      SF: (x0,x1) => x0.prepend(x1),
      SG: x0 => x0.selectionEnd,
      SH: (x0,x1) => x0.adoptText(x1),
      SI: () => globalThis.document,
      SJ: (x0,x1) => { x0.spellcheck = x1 },
      SK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SL: () => globalThis.firebase_firestore.startAfter,
      SM: () => globalThis.document,
      T: x0 => new Promise(x0),
      TB: (b, o, l) => new DataView(b, o, l),
      TC: (x0,x1) => x0.exec(x1),
      TD: () => new TextDecoder("utf-8", {fatal: true}),
      TE: x0 => x0.timeStamp,
      TF: x0 => x0.parentElement,
      TG: x0 => x0.value,
      TH: x0 => x0.first(),
      TI: x0 => x0.src,
      TJ: (x0,x1) => { x0.disabled = x1 },
      TK: (o, p, v) => o[p] = v,
      TL: () => globalThis.firebase_firestore.startAt,
      TM: (o, t) => typeof o === t,
      U: (x0,x1,x2) => x0.call(x1,x2),
      UB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      UC: x0 => x0.length,
      UD: () => new TextDecoder("utf-8", {fatal: false}),
      UE: (x0,x1) => x0.hasAttribute(x1),
      UF: x0 => x0.innerHeight,
      UG: x0 => x0.selectionDirection,
      UH: x0 => x0.next(),
      UI: x0 => x0.close(),
      UJ: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      UK: (o,s,v) => o[s] = v,
      UL: (x0,x1) => globalThis.firebase_firestore.orderBy(x0,x1),
      UM: (o) => Array.isArray(o) || o instanceof Array,
      V: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      VB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      VC: (x0,x1) => { x0.lastIndex = x1 },
      VD: (a, i, v) => a[i] = v,
      VE: x0 => x0.type,
      VF: x0 => x0.innerWidth,
      VG: x0 => x0.selectionStart,
      VH: x0 => x0.current(),
      VI: x0 => x0.height,
      VJ: (x0,x1) => x0.getContext(x1),
      VK: () => Symbol("jsBoxedDartObjectProperty"),
      VL: () => globalThis.firebase_firestore.count(),
      VM: x0 => x0.extraAssets,
      W: x0 => new Array(x0),
      WB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      WC: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      WD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      WE: (x0,x1) => x0.getModifierState(x1),
      WF: x0 => x0.height,
      WG: x0 => x0.selectionEnd,
      WH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      WI: x0 => x0.width,
      WJ: (x0,x1) => { x0.height = x1 },
      WK: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      WL: x0 => globalThis.firebase_firestore.sum(x0),
      WM: x0 => x0.fontManifest,
      X: o => [o],
      XB: (t, s) => t.set(s),
      XC: o => o instanceof RegExp,
      XD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      XE: x0 => x0.buttons,
      XF: x0 => x0.width,
      XG: (x0,x1) => { x0.name = x1 },
      XH: x0 => x0.v8BreakIterator,
      XI: (x0,x1,x2,x3,x4,x5) => x0.createImageBitmap(x1,x2,x3,x4,x5),
      XJ: (x0,x1) => { x0.width = x1 },
      XK: () => globalThis.firebase_firestore.arrayUnion,
      XL: x0 => globalThis.firebase_firestore.average(x0),
      XM: x0 => x0.assetManifest,
      Y: (o0, o1) => [o0, o1],
      YB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      YC: (string, times) => string.repeat(times),
      YD: (s) => +s,
      YE: x0 => x0.ctrlKey,
      YF: x0 => x0.clientHeight,
      YG: (x0,x1) => { x0.placeholder = x1 },
      YH: () => globalThis.Intl,
      YI: (x0,x1) => x0.createImageBitmap(x1),
      YJ: (x0,x1) => x0.transferFromImageBitmap(x1),
      YK: (x0,x1) => x0.delete(x1),
      YL: (x0,x1) => globalThis.firebase_firestore.getAggregateFromServer(x0,x1),
      YM: x0 => x0.buildConfig,
      Z: (o0, o1, o2) => [o0, o1, o2],
      ZB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      ZC: x0 => x0.dotAll,
      ZD: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      ZE: x0 => x0.getBoundingClientRect(),
      ZF: x0 => x0.clientWidth,
      ZG: (x0,x1) => { x0.autocomplete = x1 },
      ZH: (x0,x1) => x0.segment(x1),
      ZI: x0 => new Blob(x0),
      ZJ: x0 => x0.rasterEndMilliseconds,
      ZK: (x0,x1) => globalThis.firebase_firestore.getFirestore(x0,x1),
      ZL: x0 => x0.data(),
      ZM: x0 => x0.length,
      a: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      aB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      aC: x0 => x0.unicode,
      aD: s => s.trim(),
      aE: x0 => x0.y,
      aF: x0 => x0.isConnected,
      aG: (x0,x1) => { x0.type = x1 },
      aH: x0 => x0.index,
      aI: x0 => x0.close(),
      aJ: x0 => x0.rasterStartMilliseconds,
      aK: x0 => globalThis.firebase_core.getApp(x0),
      aL: x0 => globalThis.firebase_firestore.doc(x0),
      aM: x0 => x0.getReader(),
      b: (x0,x1,x2) => { x0[x1] = x2 },
      bB: Function.prototype.call.bind(DataView.prototype.getUint32),
      bC: x0 => x0.ignoreCase,
      bD: x0 => x0.classList,
      bE: x0 => x0.x,
      bF: x0 => x0.head,
      bG: (x0,x1) => { x0.name = x1 },
      bH: x0 => x0.next(),
      bI: x0 => x0.naturalHeight,
      bJ: x0 => x0.imageBitmaps,
      bK: () => globalThis.firebase_core.getApp(),
      bL: x0 => x0.path,
      bM: x0 => x0.value,
      c: o => o,
      cB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      cC: x0 => x0.multiline,
      cD: x0 => x0.relatedTarget,
      cE: x0 => x0.top,
      cF: (x0,x1) => { x0.content = x1 },
      cG: (x0,x1) => { x0.placeholder = x1 },
      cH: x0 => x0.value,
      cI: x0 => x0.naturalWidth,
      cJ: x0 => x0.canvasKitMaximumSurfaces,
      cK: (x0,x1) => globalThis.firebase_firestore.setDoc(x0,x1),
      cL: x0 => globalThis.firebase_firestore.getDocs(x0),
      cM: x0 => x0.done,
      d: (o, p) => o[p],
      dB: Function.prototype.call.bind(DataView.prototype.getInt32),
      dC: (string, token) => string.split(token),
      dD: x0 => x0.hasFocus(),
      dE: x0 => x0.left,
      dF: (x0,x1) => { x0.name = x1 },
      dG: (x0,x1) => { x0.scrollTop = x1 },
      dH: x0 => x0.done,
      dI: (x0,x1) => { x0.src = x1 },
      dJ: x0 => x0.nextSibling,
      dK: x0 => ({serverTimestamps: x0}),
      dL: x0 => globalThis.firebase_firestore.getDocsFromServer(x0),
      dM: x0 => x0.read(),
      e: () => globalThis,
      eB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      eC: o => o instanceof Array,
      eD: x0 => x0.shiftKey,
      eE: x0 => x0.scrollTop,
      eF: (x0,x1) => x0.removeChild(x1),
      eG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      eH: (o, m, a) => o[m].apply(o, a),
      eI: x0 => x0.displayHeight,
      eJ: (x0,x1) => x0.debug(x1),
      eK: x0 => x0.fromCache,
      eL: x0 => globalThis.firebase_firestore.getDocsFromCache(x0),
      eM: x0 => x0.body,
      f: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fB: o => o instanceof Uint16Array,
      fC: (a, i) => a[i],
      fD: x0 => x0.body,
      fE: x0 => x0.offsetTop,
      fF: x0 => x0.firstChild,
      fG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      fH: x0 => x0.iterator,
      fI: x0 => x0.displayWidth,
      fJ: x0 => x0.hostElement,
      fK: x0 => x0.hasPendingWrites,
      fL: x0 => x0.source,
      fM: (x0,x1) => new OffscreenCanvas(x0,x1),
      g: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gB: Function.prototype.call.bind(DataView.prototype.getUint16),
      gC: a => a.length,
      gD: x0 => x0.visibilityState,
      gE: x0 => x0.scrollLeft,
      gF: x0 => x0.viewConstraints,
      gG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      gH: () => globalThis.Symbol,
      gI: x0 => x0.duration,
      gJ: x0 => x0.location,
      gK: x0 => x0.metadata,
      gL: x0 => ({source: x0}),
      gM: x0 => x0.assetBase,
      h: (x0,x1) => ({addView: x0,removeView: x1}),
      hB: o => o instanceof Int16Array,
      hC: x0 => x0.userAgent,
      hD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      hE: x0 => x0.offsetLeft,
      hF: x0 => x0.hostElement,
      hG: x0 => x0.keyCode,
      hH: (x0,x1) => new Intl.Segmenter(x0,x1),
      hI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      hJ: (x0,x1) => x0.getModifierState(x1),
      hK: x0 => x0.toArray(),
      hL: (x0,x1) => globalThis.firebase_firestore.collection(x0,x1),
      hM: x0 => x0.loader,
      i: (l, r) => l === r,
      iB: Function.prototype.call.bind(DataView.prototype.getInt16),
      iC: x0 => x0.navigator,
      iD: x0 => x0.disconnect(),
      iE: x0 => x0.offsetParent,
      iF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iG: (x0,x1) => x0.scrollIntoView(x1),
      iH: x0 => x0.Segmenter,
      iI: (x0,x1) => x0.decode(x1),
      iJ: x0 => x0.metaKey,
      iK: x0 => x0.toUint8Array(),
      iL: (x0,x1,x2) => globalThis.firebase_core.registerVersion(x0,x1,x2),
      iM: () => globalThis._flutter,
      j: x0 => x0.random(),
      jB: o => o instanceof Uint8ClampedArray,
      jC: Function.prototype.call.bind(String.prototype.toLowerCase),
      jD: x0 => new Intl.Locale(x0),
      jE: x0 => x0.offsetY,
      jF: x0 => ({runApp: x0}),
      jG: x0 => x0.multiViewEnabled,
      jH: x0 => x0.buffer,
      jI: x0 => x0.image,
      jJ: x0 => x0.altKey,
      jK: () => globalThis.firebase_firestore.Bytes,
      jL: x0 => x0.sessionStorage,
      k: o => o,
      kB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      kC: Object.is,
      kD: x0 => x0.region,
      kE: x0 => x0.offsetX,
      kF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      kG: (x0,x1) => x0.replaceWith(x1),
      kH: x0 => x0.wasmMemory,
      kI: x0 => x0.close(),
      kJ: x0 => x0.ctrlKey,
      kK: () => globalThis.firebase_firestore.VectorValue,
      kL: x0 => x0.measurementId,
      l: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      lB: Function.prototype.call.bind(DataView.prototype.setInt32),
      lC: x0 => x0.vendor,
      lD: x0 => x0.script,
      lE: (o, p, r) => o.replace(p, () => r),
      lF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      lG: (x0,x1) => { x0.className = x1 },
      lH: () => globalThis.window._flutter_skwasmInstance,
      lI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      lJ: x0 => x0.isComposing,
      lK: x0 => x0.longitude,
      lL: x0 => x0.appId,
      m: () => globalThis.Math,
      mB: Function.prototype.call.bind(DataView.prototype.setUint32),
      mC: (x0,x1) => x0.createTextNode(x1),
      mD: x0 => x0.language,
      mE: (o, p, r) => o.replaceAll(p, () => r),
      mF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      mG: (x0,x1) => { x0.tabIndex = x1 },
      mH: () => new TextDecoder(),
      mI: x0 => new window.ImageDecoder(x0),
      mJ: x0 => x0.code,
      mK: x0 => x0.latitude,
      mL: x0 => x0.messagingSenderId,
      n: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      nB: Function.prototype.call.bind(DataView.prototype.setInt16),
      nC: (x0,x1) => { x0.id = x1 },
      nD: x0 => x0.languages,
      nE: x0 => x0.deltaMode,
      nF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      nG: (x0,x1) => { x0.action = x1 },
      nH: (map, o, v) => map.set(o, v),
      nI: x0 => x0.name,
      nJ: x0 => x0.repeat,
      nK: () => globalThis.firebase_firestore.GeoPoint,
      nL: x0 => x0.authDomain,
      o: b => !!b,
      oB: Function.prototype.call.bind(DataView.prototype.setUint16),
      oC: (x0,x1) => { x0.nonce = x1 },
      oD: (x0,x1) => x0.observe(x1),
      oE: x0 => x0.deltaY,
      oF: x0 => x0.history,
      oG: (x0,x1) => { x0.method = x1 },
      oH: (map, o) => map.get(o),
      oI: x0 => x0.repetitionCount,
      oJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      oK: (x0,x1) => x0.data(x1),
      oL: x0 => x0.projectId,
      p: () => globalThis.document,
      pB: Function.prototype.call.bind(DataView.prototype.setUint8),
      pC: x0 => x0.nonce,
      pD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      pE: x0 => x0.deltaX,
      pF: x0 => x0.search,
      pG: (x0,x1) => { x0.noValidate = x1 },
      pH: () => new WeakMap(),
      pI: x0 => x0.frameCount,
      pJ: x0 => x0.userAgent,
      pK: x0 => x0.nanoseconds,
      pL: x0 => x0.name,
      q: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qB: Function.prototype.call.bind(DataView.prototype.setInt8),
      qC: () => globalThis.window.flutterConfiguration,
      qD: x0 => new ResizeObserver(x0),
      qE: x0 => x0.wheelDeltaY,
      qF: x0 => x0.location,
      qG: x0 => x0.click(),
      qH: x0 => x0.debugSkipFontRetryDelay,
      qI: x0 => x0.selectedTrack,
      qJ: x0 => x0.navigator,
      qK: x0 => x0.seconds,
      qL: x0 => x0.name,
      r: (x0,x1) => x0.focus(x1),
      rB: Function.prototype.call.bind(DataView.prototype.getInt8),
      rC: (x0,x1) => x0.attachShadow(x1),
      rD: (x0,x1) => x0.getPropertyValue(x1),
      rE: x0 => x0.wheelDeltaX,
      rF: x0 => x0.pathname,
      rG: (x0,x1) => x0.getElementsByClassName(x1),
      rH: (x0,x1,x2) => x0.set(x1,x2),
      rI: x0 => x0.completed,
      rJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      rK: () => globalThis.firebase_firestore.Timestamp,
      rL: (x0,x1,x2,x3,x4,x5,x6,x7) => ({apiKey: x0,authDomain: x1,databaseURL: x2,projectId: x3,storageBucket: x4,messagingSenderId: x5,measurementId: x6,appId: x7}),
      s: () => ({}),
      sB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      sC: (x0,x1) => x0.createElement(x1),
      sD: x0 => globalThis.parseFloat(x0),
      sE: x0 => x0.bottom,
      sF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      sG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      sH: x0 => x0.fontFallbackBaseUrl,
      sI: x0 => x0.ready,
      sJ: () => globalThis.window,
      sK: () => globalThis.firebase_firestore.DocumentReference,
      sL: (x0,x1) => globalThis.firebase_core.initializeApp(x0,x1),
      t: (o, p, v) => o[p] = v,
      tB: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      tC: x0 => x0.scale,
      tD: (x0,x1) => x0.getComputedStyle(x1),
      tE: x0 => x0.right,
      tF: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      tG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      tH: (handle) => clearInterval(handle),
      tI: x0 => x0.tracks,
      tJ: (x0,x1) => x0.getItem(x1),
      tK: x0 => x0.path,
      tL: x0 => globalThis.firebase_core.initializeApp(x0),
      u: () => [],
      uB: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      uC: x0 => x0.visualViewport,
      uD: x0 => x0.documentElement,
      uE: x0 => x0.clientY,
      uF: o => Object.keys(o),
      uG: (x0,x1) => x0.dispatchEvent(x1),
      uH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      uI: () => globalThis.window.ImageDecoder,
      uJ: x0 => x0.localStorage,
      uK: x0 => x0.ref,
      uL: x0 => x0.storageBucket,
      v: (a, i) => a.push(i),
      vB: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      vC: x0 => x0.devicePixelRatio,
      vD: x0 => x0.computedStyleMap(),
      vE: x0 => x0.clientX,
      vF: x0 => x0.state,
      vG: (x0,x1) => x0.createEvent(x1),
      vH: () => Date.now(),
      vI: x0 => x0.decode(),
      vJ: (x0,x1) => x0.key(x1),
      vK: (x0,x1) => ({includeMetadataChanges: x0,source: x1}),
      vL: x0 => x0.databaseURL,
      w: x0 => new Int8Array(x0),
      wB: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      wC: x0 => x0.height,
      wD: (x0,x1) => x0.get(x1),
      wE: x0 => x0.changedTouches,
      wF: x0 => x0.hash,
      wG: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      wH: x0 => new WeakRef(x0),
      wI: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      wJ: x0 => x0.length,
      wK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wL: x0 => x0.apiKey,
      x: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      xB: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      xC: x0 => x0.width,
      xD: (o, p) => p in o,
      xE: x0 => x0.key,
      xF: x0 => x0.state,
      xG: x0 => x0.readText(),
      xH: x0 => x0.deref(),
      xI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xJ: (x0,x1,x2) => x0.setItem(x1,x2),
      xK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xL: x0 => x0.options,
      y: x0 => new Uint8Array(x0),
      yB: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      yC: x0 => x0.screen,
      yD: (x0,x1) => { x0.textContent = x1 },
      yE: x0 => x0.identifier,
      yF: (x0,x1) => x0.go(x1),
      yG: x0 => x0.clipboard,
      yH: () => globalThis.WeakRef,
      yI: (x0,x1,x2) => x0.addEventListener(x1,x2),
      yJ: x0 => new firebase_firestore.FieldPath(x0),
      yK: x0 => x0.call(),
      yL: () => globalThis.firebase_core.SDK_VERSION,
      z: x0 => new Uint8ClampedArray(x0),
      zB: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      zC: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      zD: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zE: x0 => x0.touches,
      zF: (x0,x1) => x0.querySelectorAll(x1),
      zG: (x0,x1) => x0.writeText(x1),
      zH: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      zI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zJ: (x0,x1) => new firebase_firestore.FieldPath(x0,x1),
      zK: (x0,x1,x2,x3) => globalThis.firebase_firestore.onSnapshot(x0,x1,x2,x3),
      zL: (x0,x1) => x0.createElement(x1),

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
