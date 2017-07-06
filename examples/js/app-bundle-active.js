(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})({
    1: [ function(require, module, exports) {
        "use strict";
        exports.byteLength = byteLength;
        exports.toByteArray = toByteArray;
        exports.fromByteArray = fromByteArray;
        var lookup = [];
        var revLookup = [];
        var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
        var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for (var i = 0, len = code.length; i < len; ++i) {
            lookup[i] = code[i];
            revLookup[code.charCodeAt(i)] = i;
        }
        revLookup["-".charCodeAt(0)] = 62;
        revLookup["_".charCodeAt(0)] = 63;
        function placeHoldersCount(b64) {
            var len = b64.length;
            if (len % 4 > 0) {
                throw new Error("Invalid string. Length must be a multiple of 4");
            }
            return b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
        }
        function byteLength(b64) {
            return b64.length * 3 / 4 - placeHoldersCount(b64);
        }
        function toByteArray(b64) {
            var i, j, l, tmp, placeHolders, arr;
            var len = b64.length;
            placeHolders = placeHoldersCount(b64);
            arr = new Arr(len * 3 / 4 - placeHolders);
            l = placeHolders > 0 ? len - 4 : len;
            var L = 0;
            for (i = 0, j = 0; i < l; i += 4, j += 3) {
                tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
                arr[L++] = tmp >> 16 & 255;
                arr[L++] = tmp >> 8 & 255;
                arr[L++] = tmp & 255;
            }
            if (placeHolders === 2) {
                tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
                arr[L++] = tmp & 255;
            } else if (placeHolders === 1) {
                tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
                arr[L++] = tmp >> 8 & 255;
                arr[L++] = tmp & 255;
            }
            return arr;
        }
        function tripletToBase64(num) {
            return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
        }
        function encodeChunk(uint8, start, end) {
            var tmp;
            var output = [];
            for (var i = start; i < end; i += 3) {
                tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                output.push(tripletToBase64(tmp));
            }
            return output.join("");
        }
        function fromByteArray(uint8) {
            var tmp;
            var len = uint8.length;
            var extraBytes = len % 3;
            var output = "";
            var parts = [];
            var maxChunkLength = 16383;
            for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
            }
            if (extraBytes === 1) {
                tmp = uint8[len - 1];
                output += lookup[tmp >> 2];
                output += lookup[tmp << 4 & 63];
                output += "==";
            } else if (extraBytes === 2) {
                tmp = (uint8[len - 2] << 8) + uint8[len - 1];
                output += lookup[tmp >> 10];
                output += lookup[tmp >> 4 & 63];
                output += lookup[tmp << 2 & 63];
                output += "=";
            }
            parts.push(output);
            return parts.join("");
        }
    }, {} ],
    2: [ function(require, module, exports) {}, {} ],
    3: [ function(require, module, exports) {
        "use strict";
        var base64 = require("base64-js");
        var ieee754 = require("ieee754");
        exports.Buffer = Buffer;
        exports.SlowBuffer = SlowBuffer;
        exports.INSPECT_MAX_BYTES = 50;
        var K_MAX_LENGTH = 2147483647;
        exports.kMaxLength = K_MAX_LENGTH;
        Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
        if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
            console.error("This browser lacks typed array (Uint8Array) support which is required by " + "`buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
        }
        function typedArraySupport() {
            try {
                var arr = new Uint8Array(1);
                arr.__proto__ = {
                    __proto__: Uint8Array.prototype,
                    foo: function() {
                        return 42;
                    }
                };
                return arr.foo() === 42;
            } catch (e) {
                return false;
            }
        }
        function createBuffer(length) {
            if (length > K_MAX_LENGTH) {
                throw new RangeError("Invalid typed array length");
            }
            var buf = new Uint8Array(length);
            buf.__proto__ = Buffer.prototype;
            return buf;
        }
        function Buffer(arg, encodingOrOffset, length) {
            if (typeof arg === "number") {
                if (typeof encodingOrOffset === "string") {
                    throw new Error("If encoding is specified then the first argument must be a string");
                }
                return allocUnsafe(arg);
            }
            return from(arg, encodingOrOffset, length);
        }
        if (typeof Symbol !== "undefined" && Symbol.species && Buffer[Symbol.species] === Buffer) {
            Object.defineProperty(Buffer, Symbol.species, {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false
            });
        }
        Buffer.poolSize = 8192;
        function from(value, encodingOrOffset, length) {
            if (typeof value === "number") {
                throw new TypeError('"value" argument must not be a number');
            }
            if (value instanceof ArrayBuffer) {
                return fromArrayBuffer(value, encodingOrOffset, length);
            }
            if (typeof value === "string") {
                return fromString(value, encodingOrOffset);
            }
            return fromObject(value);
        }
        Buffer.from = function(value, encodingOrOffset, length) {
            return from(value, encodingOrOffset, length);
        };
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        function assertSize(size) {
            if (typeof size !== "number") {
                throw new TypeError('"size" argument must be a number');
            } else if (size < 0) {
                throw new RangeError('"size" argument must not be negative');
            }
        }
        function alloc(size, fill, encoding) {
            assertSize(size);
            if (size <= 0) {
                return createBuffer(size);
            }
            if (fill !== undefined) {
                return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
            }
            return createBuffer(size);
        }
        Buffer.alloc = function(size, fill, encoding) {
            return alloc(size, fill, encoding);
        };
        function allocUnsafe(size) {
            assertSize(size);
            return createBuffer(size < 0 ? 0 : checked(size) | 0);
        }
        Buffer.allocUnsafe = function(size) {
            return allocUnsafe(size);
        };
        Buffer.allocUnsafeSlow = function(size) {
            return allocUnsafe(size);
        };
        function fromString(string, encoding) {
            if (typeof encoding !== "string" || encoding === "") {
                encoding = "utf8";
            }
            if (!Buffer.isEncoding(encoding)) {
                throw new TypeError('"encoding" must be a valid string encoding');
            }
            var length = byteLength(string, encoding) | 0;
            var buf = createBuffer(length);
            var actual = buf.write(string, encoding);
            if (actual !== length) {
                buf = buf.slice(0, actual);
            }
            return buf;
        }
        function fromArrayLike(array) {
            var length = array.length < 0 ? 0 : checked(array.length) | 0;
            var buf = createBuffer(length);
            for (var i = 0; i < length; i += 1) {
                buf[i] = array[i] & 255;
            }
            return buf;
        }
        function fromArrayBuffer(array, byteOffset, length) {
            if (byteOffset < 0 || array.byteLength < byteOffset) {
                throw new RangeError("'offset' is out of bounds");
            }
            if (array.byteLength < byteOffset + (length || 0)) {
                throw new RangeError("'length' is out of bounds");
            }
            var buf;
            if (byteOffset === undefined && length === undefined) {
                buf = new Uint8Array(array);
            } else if (length === undefined) {
                buf = new Uint8Array(array, byteOffset);
            } else {
                buf = new Uint8Array(array, byteOffset, length);
            }
            buf.__proto__ = Buffer.prototype;
            return buf;
        }
        function fromObject(obj) {
            if (Buffer.isBuffer(obj)) {
                var len = checked(obj.length) | 0;
                var buf = createBuffer(len);
                if (buf.length === 0) {
                    return buf;
                }
                obj.copy(buf, 0, 0, len);
                return buf;
            }
            if (obj) {
                if (isArrayBufferView(obj) || "length" in obj) {
                    if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
                        return createBuffer(0);
                    }
                    return fromArrayLike(obj);
                }
                if (obj.type === "Buffer" && Array.isArray(obj.data)) {
                    return fromArrayLike(obj.data);
                }
            }
            throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
        }
        function checked(length) {
            if (length >= K_MAX_LENGTH) {
                throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
            }
            return length | 0;
        }
        function SlowBuffer(length) {
            if (+length != length) {
                length = 0;
            }
            return Buffer.alloc(+length);
        }
        Buffer.isBuffer = function isBuffer(b) {
            return b != null && b._isBuffer === true;
        };
        Buffer.compare = function compare(a, b) {
            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                throw new TypeError("Arguments must be Buffers");
            }
            if (a === b) return 0;
            var x = a.length;
            var y = b.length;
            for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                if (a[i] !== b[i]) {
                    x = a[i];
                    y = b[i];
                    break;
                }
            }
            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
        };
        Buffer.isEncoding = function isEncoding(encoding) {
            switch (String(encoding).toLowerCase()) {
              case "hex":
              case "utf8":
              case "utf-8":
              case "ascii":
              case "latin1":
              case "binary":
              case "base64":
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return true;

              default:
                return false;
            }
        };
        Buffer.concat = function concat(list, length) {
            if (!Array.isArray(list)) {
                throw new TypeError('"list" argument must be an Array of Buffers');
            }
            if (list.length === 0) {
                return Buffer.alloc(0);
            }
            var i;
            if (length === undefined) {
                length = 0;
                for (i = 0; i < list.length; ++i) {
                    length += list[i].length;
                }
            }
            var buffer = Buffer.allocUnsafe(length);
            var pos = 0;
            for (i = 0; i < list.length; ++i) {
                var buf = list[i];
                if (!Buffer.isBuffer(buf)) {
                    throw new TypeError('"list" argument must be an Array of Buffers');
                }
                buf.copy(buffer, pos);
                pos += buf.length;
            }
            return buffer;
        };
        function byteLength(string, encoding) {
            if (Buffer.isBuffer(string)) {
                return string.length;
            }
            if (isArrayBufferView(string) || string instanceof ArrayBuffer) {
                return string.byteLength;
            }
            if (typeof string !== "string") {
                string = "" + string;
            }
            var len = string.length;
            if (len === 0) return 0;
            var loweredCase = false;
            for (;;) {
                switch (encoding) {
                  case "ascii":
                  case "latin1":
                  case "binary":
                    return len;

                  case "utf8":
                  case "utf-8":
                  case undefined:
                    return utf8ToBytes(string).length;

                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return len * 2;

                  case "hex":
                    return len >>> 1;

                  case "base64":
                    return base64ToBytes(string).length;

                  default:
                    if (loweredCase) return utf8ToBytes(string).length;
                    encoding = ("" + encoding).toLowerCase();
                    loweredCase = true;
                }
            }
        }
        Buffer.byteLength = byteLength;
        function slowToString(encoding, start, end) {
            var loweredCase = false;
            if (start === undefined || start < 0) {
                start = 0;
            }
            if (start > this.length) {
                return "";
            }
            if (end === undefined || end > this.length) {
                end = this.length;
            }
            if (end <= 0) {
                return "";
            }
            end >>>= 0;
            start >>>= 0;
            if (end <= start) {
                return "";
            }
            if (!encoding) encoding = "utf8";
            while (true) {
                switch (encoding) {
                  case "hex":
                    return hexSlice(this, start, end);

                  case "utf8":
                  case "utf-8":
                    return utf8Slice(this, start, end);

                  case "ascii":
                    return asciiSlice(this, start, end);

                  case "latin1":
                  case "binary":
                    return latin1Slice(this, start, end);

                  case "base64":
                    return base64Slice(this, start, end);

                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return utf16leSlice(this, start, end);

                  default:
                    if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                    encoding = (encoding + "").toLowerCase();
                    loweredCase = true;
                }
            }
        }
        Buffer.prototype._isBuffer = true;
        function swap(b, n, m) {
            var i = b[n];
            b[n] = b[m];
            b[m] = i;
        }
        Buffer.prototype.swap16 = function swap16() {
            var len = this.length;
            if (len % 2 !== 0) {
                throw new RangeError("Buffer size must be a multiple of 16-bits");
            }
            for (var i = 0; i < len; i += 2) {
                swap(this, i, i + 1);
            }
            return this;
        };
        Buffer.prototype.swap32 = function swap32() {
            var len = this.length;
            if (len % 4 !== 0) {
                throw new RangeError("Buffer size must be a multiple of 32-bits");
            }
            for (var i = 0; i < len; i += 4) {
                swap(this, i, i + 3);
                swap(this, i + 1, i + 2);
            }
            return this;
        };
        Buffer.prototype.swap64 = function swap64() {
            var len = this.length;
            if (len % 8 !== 0) {
                throw new RangeError("Buffer size must be a multiple of 64-bits");
            }
            for (var i = 0; i < len; i += 8) {
                swap(this, i, i + 7);
                swap(this, i + 1, i + 6);
                swap(this, i + 2, i + 5);
                swap(this, i + 3, i + 4);
            }
            return this;
        };
        Buffer.prototype.toString = function toString() {
            var length = this.length;
            if (length === 0) return "";
            if (arguments.length === 0) return utf8Slice(this, 0, length);
            return slowToString.apply(this, arguments);
        };
        Buffer.prototype.equals = function equals(b) {
            if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
            if (this === b) return true;
            return Buffer.compare(this, b) === 0;
        };
        Buffer.prototype.inspect = function inspect() {
            var str = "";
            var max = exports.INSPECT_MAX_BYTES;
            if (this.length > 0) {
                str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
                if (this.length > max) str += " ... ";
            }
            return "<Buffer " + str + ">";
        };
        Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
            if (!Buffer.isBuffer(target)) {
                throw new TypeError("Argument must be a Buffer");
            }
            if (start === undefined) {
                start = 0;
            }
            if (end === undefined) {
                end = target ? target.length : 0;
            }
            if (thisStart === undefined) {
                thisStart = 0;
            }
            if (thisEnd === undefined) {
                thisEnd = this.length;
            }
            if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                throw new RangeError("out of range index");
            }
            if (thisStart >= thisEnd && start >= end) {
                return 0;
            }
            if (thisStart >= thisEnd) {
                return -1;
            }
            if (start >= end) {
                return 1;
            }
            start >>>= 0;
            end >>>= 0;
            thisStart >>>= 0;
            thisEnd >>>= 0;
            if (this === target) return 0;
            var x = thisEnd - thisStart;
            var y = end - start;
            var len = Math.min(x, y);
            var thisCopy = this.slice(thisStart, thisEnd);
            var targetCopy = target.slice(start, end);
            for (var i = 0; i < len; ++i) {
                if (thisCopy[i] !== targetCopy[i]) {
                    x = thisCopy[i];
                    y = targetCopy[i];
                    break;
                }
            }
            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
        };
        function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
            if (buffer.length === 0) return -1;
            if (typeof byteOffset === "string") {
                encoding = byteOffset;
                byteOffset = 0;
            } else if (byteOffset > 2147483647) {
                byteOffset = 2147483647;
            } else if (byteOffset < -2147483648) {
                byteOffset = -2147483648;
            }
            byteOffset = +byteOffset;
            if (numberIsNaN(byteOffset)) {
                byteOffset = dir ? 0 : buffer.length - 1;
            }
            if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
            if (byteOffset >= buffer.length) {
                if (dir) return -1; else byteOffset = buffer.length - 1;
            } else if (byteOffset < 0) {
                if (dir) byteOffset = 0; else return -1;
            }
            if (typeof val === "string") {
                val = Buffer.from(val, encoding);
            }
            if (Buffer.isBuffer(val)) {
                if (val.length === 0) {
                    return -1;
                }
                return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
            } else if (typeof val === "number") {
                val = val & 255;
                if (typeof Uint8Array.prototype.indexOf === "function") {
                    if (dir) {
                        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
                    } else {
                        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
                    }
                }
                return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
            }
            throw new TypeError("val must be string, number or Buffer");
        }
        function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
            var indexSize = 1;
            var arrLength = arr.length;
            var valLength = val.length;
            if (encoding !== undefined) {
                encoding = String(encoding).toLowerCase();
                if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
                    if (arr.length < 2 || val.length < 2) {
                        return -1;
                    }
                    indexSize = 2;
                    arrLength /= 2;
                    valLength /= 2;
                    byteOffset /= 2;
                }
            }
            function read(buf, i) {
                if (indexSize === 1) {
                    return buf[i];
                } else {
                    return buf.readUInt16BE(i * indexSize);
                }
            }
            var i;
            if (dir) {
                var foundIndex = -1;
                for (i = byteOffset; i < arrLength; i++) {
                    if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                        if (foundIndex === -1) foundIndex = i;
                        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
                    } else {
                        if (foundIndex !== -1) i -= i - foundIndex;
                        foundIndex = -1;
                    }
                }
            } else {
                if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
                for (i = byteOffset; i >= 0; i--) {
                    var found = true;
                    for (var j = 0; j < valLength; j++) {
                        if (read(arr, i + j) !== read(val, j)) {
                            found = false;
                            break;
                        }
                    }
                    if (found) return i;
                }
            }
            return -1;
        }
        Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
            return this.indexOf(val, byteOffset, encoding) !== -1;
        };
        Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
        };
        Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
        };
        function hexWrite(buf, string, offset, length) {
            offset = Number(offset) || 0;
            var remaining = buf.length - offset;
            if (!length) {
                length = remaining;
            } else {
                length = Number(length);
                if (length > remaining) {
                    length = remaining;
                }
            }
            var strLen = string.length;
            if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
            if (length > strLen / 2) {
                length = strLen / 2;
            }
            for (var i = 0; i < length; ++i) {
                var parsed = parseInt(string.substr(i * 2, 2), 16);
                if (numberIsNaN(parsed)) return i;
                buf[offset + i] = parsed;
            }
            return i;
        }
        function utf8Write(buf, string, offset, length) {
            return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
        }
        function asciiWrite(buf, string, offset, length) {
            return blitBuffer(asciiToBytes(string), buf, offset, length);
        }
        function latin1Write(buf, string, offset, length) {
            return asciiWrite(buf, string, offset, length);
        }
        function base64Write(buf, string, offset, length) {
            return blitBuffer(base64ToBytes(string), buf, offset, length);
        }
        function ucs2Write(buf, string, offset, length) {
            return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
        }
        Buffer.prototype.write = function write(string, offset, length, encoding) {
            if (offset === undefined) {
                encoding = "utf8";
                length = this.length;
                offset = 0;
            } else if (length === undefined && typeof offset === "string") {
                encoding = offset;
                length = this.length;
                offset = 0;
            } else if (isFinite(offset)) {
                offset = offset >>> 0;
                if (isFinite(length)) {
                    length = length >>> 0;
                    if (encoding === undefined) encoding = "utf8";
                } else {
                    encoding = length;
                    length = undefined;
                }
            } else {
                throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
            }
            var remaining = this.length - offset;
            if (length === undefined || length > remaining) length = remaining;
            if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
                throw new RangeError("Attempt to write outside buffer bounds");
            }
            if (!encoding) encoding = "utf8";
            var loweredCase = false;
            for (;;) {
                switch (encoding) {
                  case "hex":
                    return hexWrite(this, string, offset, length);

                  case "utf8":
                  case "utf-8":
                    return utf8Write(this, string, offset, length);

                  case "ascii":
                    return asciiWrite(this, string, offset, length);

                  case "latin1":
                  case "binary":
                    return latin1Write(this, string, offset, length);

                  case "base64":
                    return base64Write(this, string, offset, length);

                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return ucs2Write(this, string, offset, length);

                  default:
                    if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                    encoding = ("" + encoding).toLowerCase();
                    loweredCase = true;
                }
            }
        };
        Buffer.prototype.toJSON = function toJSON() {
            return {
                type: "Buffer",
                data: Array.prototype.slice.call(this._arr || this, 0)
            };
        };
        function base64Slice(buf, start, end) {
            if (start === 0 && end === buf.length) {
                return base64.fromByteArray(buf);
            } else {
                return base64.fromByteArray(buf.slice(start, end));
            }
        }
        function utf8Slice(buf, start, end) {
            end = Math.min(buf.length, end);
            var res = [];
            var i = start;
            while (i < end) {
                var firstByte = buf[i];
                var codePoint = null;
                var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
                if (i + bytesPerSequence <= end) {
                    var secondByte, thirdByte, fourthByte, tempCodePoint;
                    switch (bytesPerSequence) {
                      case 1:
                        if (firstByte < 128) {
                            codePoint = firstByte;
                        }
                        break;

                      case 2:
                        secondByte = buf[i + 1];
                        if ((secondByte & 192) === 128) {
                            tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                            if (tempCodePoint > 127) {
                                codePoint = tempCodePoint;
                            }
                        }
                        break;

                      case 3:
                        secondByte = buf[i + 1];
                        thirdByte = buf[i + 2];
                        if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                            tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                            if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                                codePoint = tempCodePoint;
                            }
                        }
                        break;

                      case 4:
                        secondByte = buf[i + 1];
                        thirdByte = buf[i + 2];
                        fourthByte = buf[i + 3];
                        if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                            tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                            if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                                codePoint = tempCodePoint;
                            }
                        }
                    }
                }
                if (codePoint === null) {
                    codePoint = 65533;
                    bytesPerSequence = 1;
                } else if (codePoint > 65535) {
                    codePoint -= 65536;
                    res.push(codePoint >>> 10 & 1023 | 55296);
                    codePoint = 56320 | codePoint & 1023;
                }
                res.push(codePoint);
                i += bytesPerSequence;
            }
            return decodeCodePointsArray(res);
        }
        var MAX_ARGUMENTS_LENGTH = 4096;
        function decodeCodePointsArray(codePoints) {
            var len = codePoints.length;
            if (len <= MAX_ARGUMENTS_LENGTH) {
                return String.fromCharCode.apply(String, codePoints);
            }
            var res = "";
            var i = 0;
            while (i < len) {
                res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
            }
            return res;
        }
        function asciiSlice(buf, start, end) {
            var ret = "";
            end = Math.min(buf.length, end);
            for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i] & 127);
            }
            return ret;
        }
        function latin1Slice(buf, start, end) {
            var ret = "";
            end = Math.min(buf.length, end);
            for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i]);
            }
            return ret;
        }
        function hexSlice(buf, start, end) {
            var len = buf.length;
            if (!start || start < 0) start = 0;
            if (!end || end < 0 || end > len) end = len;
            var out = "";
            for (var i = start; i < end; ++i) {
                out += toHex(buf[i]);
            }
            return out;
        }
        function utf16leSlice(buf, start, end) {
            var bytes = buf.slice(start, end);
            var res = "";
            for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
            }
            return res;
        }
        Buffer.prototype.slice = function slice(start, end) {
            var len = this.length;
            start = ~~start;
            end = end === undefined ? len : ~~end;
            if (start < 0) {
                start += len;
                if (start < 0) start = 0;
            } else if (start > len) {
                start = len;
            }
            if (end < 0) {
                end += len;
                if (end < 0) end = 0;
            } else if (end > len) {
                end = len;
            }
            if (end < start) end = start;
            var newBuf = this.subarray(start, end);
            newBuf.__proto__ = Buffer.prototype;
            return newBuf;
        };
        function checkOffset(offset, ext, length) {
            if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
            if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
        }
        Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 256)) {
                val += this[offset + i] * mul;
            }
            return val;
        };
        Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
                checkOffset(offset, byteLength, this.length);
            }
            var val = this[offset + --byteLength];
            var mul = 1;
            while (byteLength > 0 && (mul *= 256)) {
                val += this[offset + --byteLength] * mul;
            }
            return val;
        };
        Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            return this[offset];
        };
        Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] | this[offset + 1] << 8;
        };
        Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] << 8 | this[offset + 1];
        };
        Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
        };
        Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
        };
        Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 256)) {
                val += this[offset + i] * mul;
            }
            mul *= 128;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
        };
        Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var i = byteLength;
            var mul = 1;
            var val = this[offset + --i];
            while (i > 0 && (mul *= 256)) {
                val += this[offset + --i] * mul;
            }
            mul *= 128;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
        };
        Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            if (!(this[offset] & 128)) return this[offset];
            return (255 - this[offset] + 1) * -1;
        };
        Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset] | this[offset + 1] << 8;
            return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset + 1] | this[offset] << 8;
            return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
        };
        Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
        };
        Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, true, 23, 4);
        };
        Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, false, 23, 4);
        };
        Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, true, 52, 8);
        };
        Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, false, 52, 8);
        };
        function checkInt(buf, value, offset, ext, max, min) {
            if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
            if (offset + ext > buf.length) throw new RangeError("Index out of range");
        }
        Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
            }
            var mul = 1;
            var i = 0;
            this[offset] = value & 255;
            while (++i < byteLength && (mul *= 256)) {
                this[offset + i] = value / mul & 255;
            }
            return offset + byteLength;
        };
        Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
            }
            var i = byteLength - 1;
            var mul = 1;
            this[offset + i] = value & 255;
            while (--i >= 0 && (mul *= 256)) {
                this[offset + i] = value / mul & 255;
            }
            return offset + byteLength;
        };
        Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
            this[offset] = value & 255;
            return offset + 1;
        };
        Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
            this[offset] = value & 255;
            this[offset + 1] = value >>> 8;
            return offset + 2;
        };
        Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 255;
            return offset + 2;
        };
        Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
            this[offset + 3] = value >>> 24;
            this[offset + 2] = value >>> 16;
            this[offset + 1] = value >>> 8;
            this[offset] = value & 255;
            return offset + 4;
        };
        Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 255;
            return offset + 4;
        };
        Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);
                checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }
            var i = 0;
            var mul = 1;
            var sub = 0;
            this[offset] = value & 255;
            while (++i < byteLength && (mul *= 256)) {
                if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                    sub = 1;
                }
                this[offset + i] = (value / mul >> 0) - sub & 255;
            }
            return offset + byteLength;
        };
        Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);
                checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }
            var i = byteLength - 1;
            var mul = 1;
            var sub = 0;
            this[offset + i] = value & 255;
            while (--i >= 0 && (mul *= 256)) {
                if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                    sub = 1;
                }
                this[offset + i] = (value / mul >> 0) - sub & 255;
            }
            return offset + byteLength;
        };
        Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
            if (value < 0) value = 255 + value + 1;
            this[offset] = value & 255;
            return offset + 1;
        };
        Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
            this[offset] = value & 255;
            this[offset + 1] = value >>> 8;
            return offset + 2;
        };
        Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 255;
            return offset + 2;
        };
        Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
            this[offset] = value & 255;
            this[offset + 1] = value >>> 8;
            this[offset + 2] = value >>> 16;
            this[offset + 3] = value >>> 24;
            return offset + 4;
        };
        Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
            if (value < 0) value = 4294967295 + value + 1;
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 255;
            return offset + 4;
        };
        function checkIEEE754(buf, value, offset, ext, max, min) {
            if (offset + ext > buf.length) throw new RangeError("Index out of range");
            if (offset < 0) throw new RangeError("Index out of range");
        }
        function writeFloat(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
                checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
            }
            ieee754.write(buf, value, offset, littleEndian, 23, 4);
            return offset + 4;
        }
        Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
            return writeFloat(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
            return writeFloat(this, value, offset, false, noAssert);
        };
        function writeDouble(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
                checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
            }
            ieee754.write(buf, value, offset, littleEndian, 52, 8);
            return offset + 8;
        }
        Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
            return writeDouble(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
            return writeDouble(this, value, offset, false, noAssert);
        };
        Buffer.prototype.copy = function copy(target, targetStart, start, end) {
            if (!start) start = 0;
            if (!end && end !== 0) end = this.length;
            if (targetStart >= target.length) targetStart = target.length;
            if (!targetStart) targetStart = 0;
            if (end > 0 && end < start) end = start;
            if (end === start) return 0;
            if (target.length === 0 || this.length === 0) return 0;
            if (targetStart < 0) {
                throw new RangeError("targetStart out of bounds");
            }
            if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
            if (end < 0) throw new RangeError("sourceEnd out of bounds");
            if (end > this.length) end = this.length;
            if (target.length - targetStart < end - start) {
                end = target.length - targetStart + start;
            }
            var len = end - start;
            var i;
            if (this === target && start < targetStart && targetStart < end) {
                for (i = len - 1; i >= 0; --i) {
                    target[i + targetStart] = this[i + start];
                }
            } else if (len < 1e3) {
                for (i = 0; i < len; ++i) {
                    target[i + targetStart] = this[i + start];
                }
            } else {
                Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
            }
            return len;
        };
        Buffer.prototype.fill = function fill(val, start, end, encoding) {
            if (typeof val === "string") {
                if (typeof start === "string") {
                    encoding = start;
                    start = 0;
                    end = this.length;
                } else if (typeof end === "string") {
                    encoding = end;
                    end = this.length;
                }
                if (val.length === 1) {
                    var code = val.charCodeAt(0);
                    if (code < 256) {
                        val = code;
                    }
                }
                if (encoding !== undefined && typeof encoding !== "string") {
                    throw new TypeError("encoding must be a string");
                }
                if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
                    throw new TypeError("Unknown encoding: " + encoding);
                }
            } else if (typeof val === "number") {
                val = val & 255;
            }
            if (start < 0 || this.length < start || this.length < end) {
                throw new RangeError("Out of range index");
            }
            if (end <= start) {
                return this;
            }
            start = start >>> 0;
            end = end === undefined ? this.length : end >>> 0;
            if (!val) val = 0;
            var i;
            if (typeof val === "number") {
                for (i = start; i < end; ++i) {
                    this[i] = val;
                }
            } else {
                var bytes = Buffer.isBuffer(val) ? val : new Buffer(val, encoding);
                var len = bytes.length;
                for (i = 0; i < end - start; ++i) {
                    this[i + start] = bytes[i % len];
                }
            }
            return this;
        };
        var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
        function base64clean(str) {
            str = str.trim().replace(INVALID_BASE64_RE, "");
            if (str.length < 2) return "";
            while (str.length % 4 !== 0) {
                str = str + "=";
            }
            return str;
        }
        function toHex(n) {
            if (n < 16) return "0" + n.toString(16);
            return n.toString(16);
        }
        function utf8ToBytes(string, units) {
            units = units || Infinity;
            var codePoint;
            var length = string.length;
            var leadSurrogate = null;
            var bytes = [];
            for (var i = 0; i < length; ++i) {
                codePoint = string.charCodeAt(i);
                if (codePoint > 55295 && codePoint < 57344) {
                    if (!leadSurrogate) {
                        if (codePoint > 56319) {
                            if ((units -= 3) > -1) bytes.push(239, 191, 189);
                            continue;
                        } else if (i + 1 === length) {
                            if ((units -= 3) > -1) bytes.push(239, 191, 189);
                            continue;
                        }
                        leadSurrogate = codePoint;
                        continue;
                    }
                    if (codePoint < 56320) {
                        if ((units -= 3) > -1) bytes.push(239, 191, 189);
                        leadSurrogate = codePoint;
                        continue;
                    }
                    codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
                } else if (leadSurrogate) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                }
                leadSurrogate = null;
                if (codePoint < 128) {
                    if ((units -= 1) < 0) break;
                    bytes.push(codePoint);
                } else if (codePoint < 2048) {
                    if ((units -= 2) < 0) break;
                    bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
                } else if (codePoint < 65536) {
                    if ((units -= 3) < 0) break;
                    bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
                } else if (codePoint < 1114112) {
                    if ((units -= 4) < 0) break;
                    bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
                } else {
                    throw new Error("Invalid code point");
                }
            }
            return bytes;
        }
        function asciiToBytes(str) {
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
                byteArray.push(str.charCodeAt(i) & 255);
            }
            return byteArray;
        }
        function utf16leToBytes(str, units) {
            var c, hi, lo;
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
                if ((units -= 2) < 0) break;
                c = str.charCodeAt(i);
                hi = c >> 8;
                lo = c % 256;
                byteArray.push(lo);
                byteArray.push(hi);
            }
            return byteArray;
        }
        function base64ToBytes(str) {
            return base64.toByteArray(base64clean(str));
        }
        function blitBuffer(src, dst, offset, length) {
            for (var i = 0; i < length; ++i) {
                if (i + offset >= dst.length || i >= src.length) break;
                dst[i + offset] = src[i];
            }
            return i;
        }
        function isArrayBufferView(obj) {
            return typeof ArrayBuffer.isView === "function" && ArrayBuffer.isView(obj);
        }
        function numberIsNaN(obj) {
            return obj !== obj;
        }
    }, {
        "base64-js": 1,
        ieee754: 6
    } ],
    4: [ function(require, module, exports) {
        (function(Buffer) {
            function isArray(arg) {
                if (Array.isArray) {
                    return Array.isArray(arg);
                }
                return objectToString(arg) === "[object Array]";
            }
            exports.isArray = isArray;
            function isBoolean(arg) {
                return typeof arg === "boolean";
            }
            exports.isBoolean = isBoolean;
            function isNull(arg) {
                return arg === null;
            }
            exports.isNull = isNull;
            function isNullOrUndefined(arg) {
                return arg == null;
            }
            exports.isNullOrUndefined = isNullOrUndefined;
            function isNumber(arg) {
                return typeof arg === "number";
            }
            exports.isNumber = isNumber;
            function isString(arg) {
                return typeof arg === "string";
            }
            exports.isString = isString;
            function isSymbol(arg) {
                return typeof arg === "symbol";
            }
            exports.isSymbol = isSymbol;
            function isUndefined(arg) {
                return arg === void 0;
            }
            exports.isUndefined = isUndefined;
            function isRegExp(re) {
                return objectToString(re) === "[object RegExp]";
            }
            exports.isRegExp = isRegExp;
            function isObject(arg) {
                return typeof arg === "object" && arg !== null;
            }
            exports.isObject = isObject;
            function isDate(d) {
                return objectToString(d) === "[object Date]";
            }
            exports.isDate = isDate;
            function isError(e) {
                return objectToString(e) === "[object Error]" || e instanceof Error;
            }
            exports.isError = isError;
            function isFunction(arg) {
                return typeof arg === "function";
            }
            exports.isFunction = isFunction;
            function isPrimitive(arg) {
                return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined";
            }
            exports.isPrimitive = isPrimitive;
            exports.isBuffer = Buffer.isBuffer;
            function objectToString(o) {
                return Object.prototype.toString.call(o);
            }
        }).call(this, {
            isBuffer: require("../../is-buffer/index.js")
        });
    }, {
        "../../is-buffer/index.js": 8
    } ],
    5: [ function(require, module, exports) {
        function EventEmitter() {
            this._events = this._events || {};
            this._maxListeners = this._maxListeners || undefined;
        }
        module.exports = EventEmitter;
        EventEmitter.EventEmitter = EventEmitter;
        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._maxListeners = undefined;
        EventEmitter.defaultMaxListeners = 10;
        EventEmitter.prototype.setMaxListeners = function(n) {
            if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
            this._maxListeners = n;
            return this;
        };
        EventEmitter.prototype.emit = function(type) {
            var er, handler, len, args, i, listeners;
            if (!this._events) this._events = {};
            if (type === "error") {
                if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
                    er = arguments[1];
                    if (er instanceof Error) {
                        throw er;
                    } else {
                        var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
                        err.context = er;
                        throw err;
                    }
                }
            }
            handler = this._events[type];
            if (isUndefined(handler)) return false;
            if (isFunction(handler)) {
                switch (arguments.length) {
                  case 1:
                    handler.call(this);
                    break;

                  case 2:
                    handler.call(this, arguments[1]);
                    break;

                  case 3:
                    handler.call(this, arguments[1], arguments[2]);
                    break;

                  default:
                    args = Array.prototype.slice.call(arguments, 1);
                    handler.apply(this, args);
                }
            } else if (isObject(handler)) {
                args = Array.prototype.slice.call(arguments, 1);
                listeners = handler.slice();
                len = listeners.length;
                for (i = 0; i < len; i++) listeners[i].apply(this, args);
            }
            return true;
        };
        EventEmitter.prototype.addListener = function(type, listener) {
            var m;
            if (!isFunction(listener)) throw TypeError("listener must be a function");
            if (!this._events) this._events = {};
            if (this._events.newListener) this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);
            if (!this._events[type]) this._events[type] = listener; else if (isObject(this._events[type])) this._events[type].push(listener); else this._events[type] = [ this._events[type], listener ];
            if (isObject(this._events[type]) && !this._events[type].warned) {
                if (!isUndefined(this._maxListeners)) {
                    m = this._maxListeners;
                } else {
                    m = EventEmitter.defaultMaxListeners;
                }
                if (m && m > 0 && this._events[type].length > m) {
                    this._events[type].warned = true;
                    console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                    if (typeof console.trace === "function") {
                        console.trace();
                    }
                }
            }
            return this;
        };
        EventEmitter.prototype.on = EventEmitter.prototype.addListener;
        EventEmitter.prototype.once = function(type, listener) {
            if (!isFunction(listener)) throw TypeError("listener must be a function");
            var fired = false;
            function g() {
                this.removeListener(type, g);
                if (!fired) {
                    fired = true;
                    listener.apply(this, arguments);
                }
            }
            g.listener = listener;
            this.on(type, g);
            return this;
        };
        EventEmitter.prototype.removeListener = function(type, listener) {
            var list, position, length, i;
            if (!isFunction(listener)) throw TypeError("listener must be a function");
            if (!this._events || !this._events[type]) return this;
            list = this._events[type];
            length = list.length;
            position = -1;
            if (list === listener || isFunction(list.listener) && list.listener === listener) {
                delete this._events[type];
                if (this._events.removeListener) this.emit("removeListener", type, listener);
            } else if (isObject(list)) {
                for (i = length; i-- > 0; ) {
                    if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                        position = i;
                        break;
                    }
                }
                if (position < 0) return this;
                if (list.length === 1) {
                    list.length = 0;
                    delete this._events[type];
                } else {
                    list.splice(position, 1);
                }
                if (this._events.removeListener) this.emit("removeListener", type, listener);
            }
            return this;
        };
        EventEmitter.prototype.removeAllListeners = function(type) {
            var key, listeners;
            if (!this._events) return this;
            if (!this._events.removeListener) {
                if (arguments.length === 0) this._events = {}; else if (this._events[type]) delete this._events[type];
                return this;
            }
            if (arguments.length === 0) {
                for (key in this._events) {
                    if (key === "removeListener") continue;
                    this.removeAllListeners(key);
                }
                this.removeAllListeners("removeListener");
                this._events = {};
                return this;
            }
            listeners = this._events[type];
            if (isFunction(listeners)) {
                this.removeListener(type, listeners);
            } else if (listeners) {
                while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
            }
            delete this._events[type];
            return this;
        };
        EventEmitter.prototype.listeners = function(type) {
            var ret;
            if (!this._events || !this._events[type]) ret = []; else if (isFunction(this._events[type])) ret = [ this._events[type] ]; else ret = this._events[type].slice();
            return ret;
        };
        EventEmitter.prototype.listenerCount = function(type) {
            if (this._events) {
                var evlistener = this._events[type];
                if (isFunction(evlistener)) return 1; else if (evlistener) return evlistener.length;
            }
            return 0;
        };
        EventEmitter.listenerCount = function(emitter, type) {
            return emitter.listenerCount(type);
        };
        function isFunction(arg) {
            return typeof arg === "function";
        }
        function isNumber(arg) {
            return typeof arg === "number";
        }
        function isObject(arg) {
            return typeof arg === "object" && arg !== null;
        }
        function isUndefined(arg) {
            return arg === void 0;
        }
    }, {} ],
    6: [ function(require, module, exports) {
        exports.read = function(buffer, offset, isLE, mLen, nBytes) {
            var e, m;
            var eLen = nBytes * 8 - mLen - 1;
            var eMax = (1 << eLen) - 1;
            var eBias = eMax >> 1;
            var nBits = -7;
            var i = isLE ? nBytes - 1 : 0;
            var d = isLE ? -1 : 1;
            var s = buffer[offset + i];
            i += d;
            e = s & (1 << -nBits) - 1;
            s >>= -nBits;
            nBits += eLen;
            for (;nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
            m = e & (1 << -nBits) - 1;
            e >>= -nBits;
            nBits += mLen;
            for (;nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
            if (e === 0) {
                e = 1 - eBias;
            } else if (e === eMax) {
                return m ? NaN : (s ? -1 : 1) * Infinity;
            } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias;
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
        };
        exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
            var e, m, c;
            var eLen = nBytes * 8 - mLen - 1;
            var eMax = (1 << eLen) - 1;
            var eBias = eMax >> 1;
            var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
            var i = isLE ? 0 : nBytes - 1;
            var d = isLE ? 1 : -1;
            var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
            value = Math.abs(value);
            if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax;
            } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                    e--;
                    c *= 2;
                }
                if (e + eBias >= 1) {
                    value += rt / c;
                } else {
                    value += rt * Math.pow(2, 1 - eBias);
                }
                if (value * c >= 2) {
                    e++;
                    c /= 2;
                }
                if (e + eBias >= eMax) {
                    m = 0;
                    e = eMax;
                } else if (e + eBias >= 1) {
                    m = (value * c - 1) * Math.pow(2, mLen);
                    e = e + eBias;
                } else {
                    m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                    e = 0;
                }
            }
            for (;mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {}
            e = e << mLen | m;
            eLen += mLen;
            for (;eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {}
            buffer[offset + i - d] |= s * 128;
        };
    }, {} ],
    7: [ function(require, module, exports) {
        if (typeof Object.create === "function") {
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            };
        } else {
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                var TempCtor = function() {};
                TempCtor.prototype = superCtor.prototype;
                ctor.prototype = new TempCtor();
                ctor.prototype.constructor = ctor;
            };
        }
    }, {} ],
    8: [ function(require, module, exports) {
        module.exports = function(obj) {
            return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
        };
        function isBuffer(obj) {
            return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
        }
        function isSlowBuffer(obj) {
            return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0));
        }
    }, {} ],
    9: [ function(require, module, exports) {
        var toString = {}.toString;
        module.exports = Array.isArray || function(arr) {
            return toString.call(arr) == "[object Array]";
        };
    }, {} ],
    10: [ function(require, module, exports) {
        (function(process) {
            "use strict";
            if (!process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
                module.exports = nextTick;
            } else {
                module.exports = process.nextTick;
            }
            function nextTick(fn, arg1, arg2, arg3) {
                if (typeof fn !== "function") {
                    throw new TypeError('"callback" argument must be a function');
                }
                var len = arguments.length;
                var args, i;
                switch (len) {
                  case 0:
                  case 1:
                    return process.nextTick(fn);

                  case 2:
                    return process.nextTick(function afterTickOne() {
                        fn.call(null, arg1);
                    });

                  case 3:
                    return process.nextTick(function afterTickTwo() {
                        fn.call(null, arg1, arg2);
                    });

                  case 4:
                    return process.nextTick(function afterTickThree() {
                        fn.call(null, arg1, arg2, arg3);
                    });

                  default:
                    args = new Array(len - 1);
                    i = 0;
                    while (i < args.length) {
                        args[i++] = arguments[i];
                    }
                    return process.nextTick(function afterTick() {
                        fn.apply(null, args);
                    });
                }
            }
        }).call(this, require("_process"));
    }, {
        _process: 11
    } ],
    11: [ function(require, module, exports) {
        var process = module.exports = {};
        var cachedSetTimeout;
        var cachedClearTimeout;
        function defaultSetTimout() {
            throw new Error("setTimeout has not been defined");
        }
        function defaultClearTimeout() {
            throw new Error("clearTimeout has not been defined");
        }
        (function() {
            try {
                if (typeof setTimeout === "function") {
                    cachedSetTimeout = setTimeout;
                } else {
                    cachedSetTimeout = defaultSetTimout;
                }
            } catch (e) {
                cachedSetTimeout = defaultSetTimout;
            }
            try {
                if (typeof clearTimeout === "function") {
                    cachedClearTimeout = clearTimeout;
                } else {
                    cachedClearTimeout = defaultClearTimeout;
                }
            } catch (e) {
                cachedClearTimeout = defaultClearTimeout;
            }
        })();
        function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) {
                return setTimeout(fun, 0);
            }
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                cachedSetTimeout = setTimeout;
                return setTimeout(fun, 0);
            }
            try {
                return cachedSetTimeout(fun, 0);
            } catch (e) {
                try {
                    return cachedSetTimeout.call(null, fun, 0);
                } catch (e) {
                    return cachedSetTimeout.call(this, fun, 0);
                }
            }
        }
        function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) {
                return clearTimeout(marker);
            }
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                cachedClearTimeout = clearTimeout;
                return clearTimeout(marker);
            }
            try {
                return cachedClearTimeout(marker);
            } catch (e) {
                try {
                    return cachedClearTimeout.call(null, marker);
                } catch (e) {
                    return cachedClearTimeout.call(this, marker);
                }
            }
        }
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;
        function cleanUpNextTick() {
            if (!draining || !currentQueue) {
                return;
            }
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue);
            } else {
                queueIndex = -1;
            }
            if (queue.length) {
                drainQueue();
            }
        }
        function drainQueue() {
            if (draining) {
                return;
            }
            var timeout = runTimeout(cleanUpNextTick);
            draining = true;
            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    if (currentQueue) {
                        currentQueue[queueIndex].run();
                    }
                }
                queueIndex = -1;
                len = queue.length;
            }
            currentQueue = null;
            draining = false;
            runClearTimeout(timeout);
        }
        process.nextTick = function(fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                runTimeout(drainQueue);
            }
        };
        function Item(fun, array) {
            this.fun = fun;
            this.array = array;
        }
        Item.prototype.run = function() {
            this.fun.apply(null, this.array);
        };
        process.title = "browser";
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = "";
        process.versions = {};
        function noop() {}
        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.prependListener = noop;
        process.prependOnceListener = noop;
        process.listeners = function(name) {
            return [];
        };
        process.binding = function(name) {
            throw new Error("process.binding is not supported");
        };
        process.cwd = function() {
            return "/";
        };
        process.chdir = function(dir) {
            throw new Error("process.chdir is not supported");
        };
        process.umask = function() {
            return 0;
        };
    }, {} ],
    12: [ function(require, module, exports) {
        module.exports = require("./lib/_stream_duplex.js");
    }, {
        "./lib/_stream_duplex.js": 13
    } ],
    13: [ function(require, module, exports) {
        "use strict";
        var objectKeys = Object.keys || function(obj) {
            var keys = [];
            for (var key in obj) {
                keys.push(key);
            }
            return keys;
        };
        module.exports = Duplex;
        var processNextTick = require("process-nextick-args");
        var util = require("core-util-is");
        util.inherits = require("inherits");
        var Readable = require("./_stream_readable");
        var Writable = require("./_stream_writable");
        util.inherits(Duplex, Readable);
        var keys = objectKeys(Writable.prototype);
        for (var v = 0; v < keys.length; v++) {
            var method = keys[v];
            if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
        }
        function Duplex(options) {
            if (!(this instanceof Duplex)) return new Duplex(options);
            Readable.call(this, options);
            Writable.call(this, options);
            if (options && options.readable === false) this.readable = false;
            if (options && options.writable === false) this.writable = false;
            this.allowHalfOpen = true;
            if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
            this.once("end", onend);
        }
        function onend() {
            if (this.allowHalfOpen || this._writableState.ended) return;
            processNextTick(onEndNT, this);
        }
        function onEndNT(self) {
            self.end();
        }
        function forEach(xs, f) {
            for (var i = 0, l = xs.length; i < l; i++) {
                f(xs[i], i);
            }
        }
    }, {
        "./_stream_readable": 15,
        "./_stream_writable": 17,
        "core-util-is": 4,
        inherits: 7,
        "process-nextick-args": 10
    } ],
    14: [ function(require, module, exports) {
        "use strict";
        module.exports = PassThrough;
        var Transform = require("./_stream_transform");
        var util = require("core-util-is");
        util.inherits = require("inherits");
        util.inherits(PassThrough, Transform);
        function PassThrough(options) {
            if (!(this instanceof PassThrough)) return new PassThrough(options);
            Transform.call(this, options);
        }
        PassThrough.prototype._transform = function(chunk, encoding, cb) {
            cb(null, chunk);
        };
    }, {
        "./_stream_transform": 16,
        "core-util-is": 4,
        inherits: 7
    } ],
    15: [ function(require, module, exports) {
        (function(process) {
            "use strict";
            module.exports = Readable;
            var processNextTick = require("process-nextick-args");
            var isArray = require("isarray");
            var Duplex;
            Readable.ReadableState = ReadableState;
            var EE = require("events").EventEmitter;
            var EElistenerCount = function(emitter, type) {
                return emitter.listeners(type).length;
            };
            var Stream = require("./internal/streams/stream");
            var Buffer = require("safe-buffer").Buffer;
            var util = require("core-util-is");
            util.inherits = require("inherits");
            var debugUtil = require("util");
            var debug = void 0;
            if (debugUtil && debugUtil.debuglog) {
                debug = debugUtil.debuglog("stream");
            } else {
                debug = function() {};
            }
            var BufferList = require("./internal/streams/BufferList");
            var StringDecoder;
            util.inherits(Readable, Stream);
            var kProxyEvents = [ "error", "close", "destroy", "pause", "resume" ];
            function prependListener(emitter, event, fn) {
                if (typeof emitter.prependListener === "function") {
                    return emitter.prependListener(event, fn);
                } else {
                    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn); else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn); else emitter._events[event] = [ fn, emitter._events[event] ];
                }
            }
            function ReadableState(options, stream) {
                Duplex = Duplex || require("./_stream_duplex");
                options = options || {};
                this.objectMode = !!options.objectMode;
                if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
                var hwm = options.highWaterMark;
                var defaultHwm = this.objectMode ? 16 : 16 * 1024;
                this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
                this.highWaterMark = ~~this.highWaterMark;
                this.buffer = new BufferList();
                this.length = 0;
                this.pipes = null;
                this.pipesCount = 0;
                this.flowing = null;
                this.ended = false;
                this.endEmitted = false;
                this.reading = false;
                this.sync = true;
                this.needReadable = false;
                this.emittedReadable = false;
                this.readableListening = false;
                this.resumeScheduled = false;
                this.defaultEncoding = options.defaultEncoding || "utf8";
                this.ranOut = false;
                this.awaitDrain = 0;
                this.readingMore = false;
                this.decoder = null;
                this.encoding = null;
                if (options.encoding) {
                    if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                    this.decoder = new StringDecoder(options.encoding);
                    this.encoding = options.encoding;
                }
            }
            function Readable(options) {
                Duplex = Duplex || require("./_stream_duplex");
                if (!(this instanceof Readable)) return new Readable(options);
                this._readableState = new ReadableState(options, this);
                this.readable = true;
                if (options && typeof options.read === "function") this._read = options.read;
                Stream.call(this);
            }
            Readable.prototype.push = function(chunk, encoding) {
                var state = this._readableState;
                if (!state.objectMode && typeof chunk === "string") {
                    encoding = encoding || state.defaultEncoding;
                    if (encoding !== state.encoding) {
                        chunk = Buffer.from(chunk, encoding);
                        encoding = "";
                    }
                }
                return readableAddChunk(this, state, chunk, encoding, false);
            };
            Readable.prototype.unshift = function(chunk) {
                var state = this._readableState;
                return readableAddChunk(this, state, chunk, "", true);
            };
            Readable.prototype.isPaused = function() {
                return this._readableState.flowing === false;
            };
            function readableAddChunk(stream, state, chunk, encoding, addToFront) {
                var er = chunkInvalid(state, chunk);
                if (er) {
                    stream.emit("error", er);
                } else if (chunk === null) {
                    state.reading = false;
                    onEofChunk(stream, state);
                } else if (state.objectMode || chunk && chunk.length > 0) {
                    if (state.ended && !addToFront) {
                        var e = new Error("stream.push() after EOF");
                        stream.emit("error", e);
                    } else if (state.endEmitted && addToFront) {
                        var _e = new Error("stream.unshift() after end event");
                        stream.emit("error", _e);
                    } else {
                        var skipAdd;
                        if (state.decoder && !addToFront && !encoding) {
                            chunk = state.decoder.write(chunk);
                            skipAdd = !state.objectMode && chunk.length === 0;
                        }
                        if (!addToFront) state.reading = false;
                        if (!skipAdd) {
                            if (state.flowing && state.length === 0 && !state.sync) {
                                stream.emit("data", chunk);
                                stream.read(0);
                            } else {
                                state.length += state.objectMode ? 1 : chunk.length;
                                if (addToFront) state.buffer.unshift(chunk); else state.buffer.push(chunk);
                                if (state.needReadable) emitReadable(stream);
                            }
                        }
                        maybeReadMore(stream, state);
                    }
                } else if (!addToFront) {
                    state.reading = false;
                }
                return needMoreData(state);
            }
            function needMoreData(state) {
                return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
            }
            Readable.prototype.setEncoding = function(enc) {
                if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                this._readableState.decoder = new StringDecoder(enc);
                this._readableState.encoding = enc;
                return this;
            };
            var MAX_HWM = 8388608;
            function computeNewHighWaterMark(n) {
                if (n >= MAX_HWM) {
                    n = MAX_HWM;
                } else {
                    n--;
                    n |= n >>> 1;
                    n |= n >>> 2;
                    n |= n >>> 4;
                    n |= n >>> 8;
                    n |= n >>> 16;
                    n++;
                }
                return n;
            }
            function howMuchToRead(n, state) {
                if (n <= 0 || state.length === 0 && state.ended) return 0;
                if (state.objectMode) return 1;
                if (n !== n) {
                    if (state.flowing && state.length) return state.buffer.head.data.length; else return state.length;
                }
                if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
                if (n <= state.length) return n;
                if (!state.ended) {
                    state.needReadable = true;
                    return 0;
                }
                return state.length;
            }
            Readable.prototype.read = function(n) {
                debug("read", n);
                n = parseInt(n, 10);
                var state = this._readableState;
                var nOrig = n;
                if (n !== 0) state.emittedReadable = false;
                if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
                    debug("read: emitReadable", state.length, state.ended);
                    if (state.length === 0 && state.ended) endReadable(this); else emitReadable(this);
                    return null;
                }
                n = howMuchToRead(n, state);
                if (n === 0 && state.ended) {
                    if (state.length === 0) endReadable(this);
                    return null;
                }
                var doRead = state.needReadable;
                debug("need readable", doRead);
                if (state.length === 0 || state.length - n < state.highWaterMark) {
                    doRead = true;
                    debug("length less than watermark", doRead);
                }
                if (state.ended || state.reading) {
                    doRead = false;
                    debug("reading or ended", doRead);
                } else if (doRead) {
                    debug("do read");
                    state.reading = true;
                    state.sync = true;
                    if (state.length === 0) state.needReadable = true;
                    this._read(state.highWaterMark);
                    state.sync = false;
                    if (!state.reading) n = howMuchToRead(nOrig, state);
                }
                var ret;
                if (n > 0) ret = fromList(n, state); else ret = null;
                if (ret === null) {
                    state.needReadable = true;
                    n = 0;
                } else {
                    state.length -= n;
                }
                if (state.length === 0) {
                    if (!state.ended) state.needReadable = true;
                    if (nOrig !== n && state.ended) endReadable(this);
                }
                if (ret !== null) this.emit("data", ret);
                return ret;
            };
            function chunkInvalid(state, chunk) {
                var er = null;
                if (!Buffer.isBuffer(chunk) && typeof chunk !== "string" && chunk !== null && chunk !== undefined && !state.objectMode) {
                    er = new TypeError("Invalid non-string/buffer chunk");
                }
                return er;
            }
            function onEofChunk(stream, state) {
                if (state.ended) return;
                if (state.decoder) {
                    var chunk = state.decoder.end();
                    if (chunk && chunk.length) {
                        state.buffer.push(chunk);
                        state.length += state.objectMode ? 1 : chunk.length;
                    }
                }
                state.ended = true;
                emitReadable(stream);
            }
            function emitReadable(stream) {
                var state = stream._readableState;
                state.needReadable = false;
                if (!state.emittedReadable) {
                    debug("emitReadable", state.flowing);
                    state.emittedReadable = true;
                    if (state.sync) processNextTick(emitReadable_, stream); else emitReadable_(stream);
                }
            }
            function emitReadable_(stream) {
                debug("emit readable");
                stream.emit("readable");
                flow(stream);
            }
            function maybeReadMore(stream, state) {
                if (!state.readingMore) {
                    state.readingMore = true;
                    processNextTick(maybeReadMore_, stream, state);
                }
            }
            function maybeReadMore_(stream, state) {
                var len = state.length;
                while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
                    debug("maybeReadMore read 0");
                    stream.read(0);
                    if (len === state.length) break; else len = state.length;
                }
                state.readingMore = false;
            }
            Readable.prototype._read = function(n) {
                this.emit("error", new Error("_read() is not implemented"));
            };
            Readable.prototype.pipe = function(dest, pipeOpts) {
                var src = this;
                var state = this._readableState;
                switch (state.pipesCount) {
                  case 0:
                    state.pipes = dest;
                    break;

                  case 1:
                    state.pipes = [ state.pipes, dest ];
                    break;

                  default:
                    state.pipes.push(dest);
                    break;
                }
                state.pipesCount += 1;
                debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
                var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
                var endFn = doEnd ? onend : unpipe;
                if (state.endEmitted) processNextTick(endFn); else src.once("end", endFn);
                dest.on("unpipe", onunpipe);
                function onunpipe(readable) {
                    debug("onunpipe");
                    if (readable === src) {
                        cleanup();
                    }
                }
                function onend() {
                    debug("onend");
                    dest.end();
                }
                var ondrain = pipeOnDrain(src);
                dest.on("drain", ondrain);
                var cleanedUp = false;
                function cleanup() {
                    debug("cleanup");
                    dest.removeListener("close", onclose);
                    dest.removeListener("finish", onfinish);
                    dest.removeListener("drain", ondrain);
                    dest.removeListener("error", onerror);
                    dest.removeListener("unpipe", onunpipe);
                    src.removeListener("end", onend);
                    src.removeListener("end", unpipe);
                    src.removeListener("data", ondata);
                    cleanedUp = true;
                    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
                }
                var increasedAwaitDrain = false;
                src.on("data", ondata);
                function ondata(chunk) {
                    debug("ondata");
                    increasedAwaitDrain = false;
                    var ret = dest.write(chunk);
                    if (false === ret && !increasedAwaitDrain) {
                        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
                            debug("false write response, pause", src._readableState.awaitDrain);
                            src._readableState.awaitDrain++;
                            increasedAwaitDrain = true;
                        }
                        src.pause();
                    }
                }
                function onerror(er) {
                    debug("onerror", er);
                    unpipe();
                    dest.removeListener("error", onerror);
                    if (EElistenerCount(dest, "error") === 0) dest.emit("error", er);
                }
                prependListener(dest, "error", onerror);
                function onclose() {
                    dest.removeListener("finish", onfinish);
                    unpipe();
                }
                dest.once("close", onclose);
                function onfinish() {
                    debug("onfinish");
                    dest.removeListener("close", onclose);
                    unpipe();
                }
                dest.once("finish", onfinish);
                function unpipe() {
                    debug("unpipe");
                    src.unpipe(dest);
                }
                dest.emit("pipe", src);
                if (!state.flowing) {
                    debug("pipe resume");
                    src.resume();
                }
                return dest;
            };
            function pipeOnDrain(src) {
                return function() {
                    var state = src._readableState;
                    debug("pipeOnDrain", state.awaitDrain);
                    if (state.awaitDrain) state.awaitDrain--;
                    if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
                        state.flowing = true;
                        flow(src);
                    }
                };
            }
            Readable.prototype.unpipe = function(dest) {
                var state = this._readableState;
                if (state.pipesCount === 0) return this;
                if (state.pipesCount === 1) {
                    if (dest && dest !== state.pipes) return this;
                    if (!dest) dest = state.pipes;
                    state.pipes = null;
                    state.pipesCount = 0;
                    state.flowing = false;
                    if (dest) dest.emit("unpipe", this);
                    return this;
                }
                if (!dest) {
                    var dests = state.pipes;
                    var len = state.pipesCount;
                    state.pipes = null;
                    state.pipesCount = 0;
                    state.flowing = false;
                    for (var i = 0; i < len; i++) {
                        dests[i].emit("unpipe", this);
                    }
                    return this;
                }
                var index = indexOf(state.pipes, dest);
                if (index === -1) return this;
                state.pipes.splice(index, 1);
                state.pipesCount -= 1;
                if (state.pipesCount === 1) state.pipes = state.pipes[0];
                dest.emit("unpipe", this);
                return this;
            };
            Readable.prototype.on = function(ev, fn) {
                var res = Stream.prototype.on.call(this, ev, fn);
                if (ev === "data") {
                    if (this._readableState.flowing !== false) this.resume();
                } else if (ev === "readable") {
                    var state = this._readableState;
                    if (!state.endEmitted && !state.readableListening) {
                        state.readableListening = state.needReadable = true;
                        state.emittedReadable = false;
                        if (!state.reading) {
                            processNextTick(nReadingNextTick, this);
                        } else if (state.length) {
                            emitReadable(this, state);
                        }
                    }
                }
                return res;
            };
            Readable.prototype.addListener = Readable.prototype.on;
            function nReadingNextTick(self) {
                debug("readable nexttick read 0");
                self.read(0);
            }
            Readable.prototype.resume = function() {
                var state = this._readableState;
                if (!state.flowing) {
                    debug("resume");
                    state.flowing = true;
                    resume(this, state);
                }
                return this;
            };
            function resume(stream, state) {
                if (!state.resumeScheduled) {
                    state.resumeScheduled = true;
                    processNextTick(resume_, stream, state);
                }
            }
            function resume_(stream, state) {
                if (!state.reading) {
                    debug("resume read 0");
                    stream.read(0);
                }
                state.resumeScheduled = false;
                state.awaitDrain = 0;
                stream.emit("resume");
                flow(stream);
                if (state.flowing && !state.reading) stream.read(0);
            }
            Readable.prototype.pause = function() {
                debug("call pause flowing=%j", this._readableState.flowing);
                if (false !== this._readableState.flowing) {
                    debug("pause");
                    this._readableState.flowing = false;
                    this.emit("pause");
                }
                return this;
            };
            function flow(stream) {
                var state = stream._readableState;
                debug("flow", state.flowing);
                while (state.flowing && stream.read() !== null) {}
            }
            Readable.prototype.wrap = function(stream) {
                var state = this._readableState;
                var paused = false;
                var self = this;
                stream.on("end", function() {
                    debug("wrapped end");
                    if (state.decoder && !state.ended) {
                        var chunk = state.decoder.end();
                        if (chunk && chunk.length) self.push(chunk);
                    }
                    self.push(null);
                });
                stream.on("data", function(chunk) {
                    debug("wrapped data");
                    if (state.decoder) chunk = state.decoder.write(chunk);
                    if (state.objectMode && (chunk === null || chunk === undefined)) return; else if (!state.objectMode && (!chunk || !chunk.length)) return;
                    var ret = self.push(chunk);
                    if (!ret) {
                        paused = true;
                        stream.pause();
                    }
                });
                for (var i in stream) {
                    if (this[i] === undefined && typeof stream[i] === "function") {
                        this[i] = function(method) {
                            return function() {
                                return stream[method].apply(stream, arguments);
                            };
                        }(i);
                    }
                }
                for (var n = 0; n < kProxyEvents.length; n++) {
                    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
                }
                self._read = function(n) {
                    debug("wrapped _read", n);
                    if (paused) {
                        paused = false;
                        stream.resume();
                    }
                };
                return self;
            };
            Readable._fromList = fromList;
            function fromList(n, state) {
                if (state.length === 0) return null;
                var ret;
                if (state.objectMode) ret = state.buffer.shift(); else if (!n || n >= state.length) {
                    if (state.decoder) ret = state.buffer.join(""); else if (state.buffer.length === 1) ret = state.buffer.head.data; else ret = state.buffer.concat(state.length);
                    state.buffer.clear();
                } else {
                    ret = fromListPartial(n, state.buffer, state.decoder);
                }
                return ret;
            }
            function fromListPartial(n, list, hasStrings) {
                var ret;
                if (n < list.head.data.length) {
                    ret = list.head.data.slice(0, n);
                    list.head.data = list.head.data.slice(n);
                } else if (n === list.head.data.length) {
                    ret = list.shift();
                } else {
                    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
                }
                return ret;
            }
            function copyFromBufferString(n, list) {
                var p = list.head;
                var c = 1;
                var ret = p.data;
                n -= ret.length;
                while (p = p.next) {
                    var str = p.data;
                    var nb = n > str.length ? str.length : n;
                    if (nb === str.length) ret += str; else ret += str.slice(0, n);
                    n -= nb;
                    if (n === 0) {
                        if (nb === str.length) {
                            ++c;
                            if (p.next) list.head = p.next; else list.head = list.tail = null;
                        } else {
                            list.head = p;
                            p.data = str.slice(nb);
                        }
                        break;
                    }
                    ++c;
                }
                list.length -= c;
                return ret;
            }
            function copyFromBuffer(n, list) {
                var ret = Buffer.allocUnsafe(n);
                var p = list.head;
                var c = 1;
                p.data.copy(ret);
                n -= p.data.length;
                while (p = p.next) {
                    var buf = p.data;
                    var nb = n > buf.length ? buf.length : n;
                    buf.copy(ret, ret.length - n, 0, nb);
                    n -= nb;
                    if (n === 0) {
                        if (nb === buf.length) {
                            ++c;
                            if (p.next) list.head = p.next; else list.head = list.tail = null;
                        } else {
                            list.head = p;
                            p.data = buf.slice(nb);
                        }
                        break;
                    }
                    ++c;
                }
                list.length -= c;
                return ret;
            }
            function endReadable(stream) {
                var state = stream._readableState;
                if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');
                if (!state.endEmitted) {
                    state.ended = true;
                    processNextTick(endReadableNT, state, stream);
                }
            }
            function endReadableNT(state, stream) {
                if (!state.endEmitted && state.length === 0) {
                    state.endEmitted = true;
                    stream.readable = false;
                    stream.emit("end");
                }
            }
            function forEach(xs, f) {
                for (var i = 0, l = xs.length; i < l; i++) {
                    f(xs[i], i);
                }
            }
            function indexOf(xs, x) {
                for (var i = 0, l = xs.length; i < l; i++) {
                    if (xs[i] === x) return i;
                }
                return -1;
            }
        }).call(this, require("_process"));
    }, {
        "./_stream_duplex": 13,
        "./internal/streams/BufferList": 18,
        "./internal/streams/stream": 19,
        _process: 11,
        "core-util-is": 4,
        events: 5,
        inherits: 7,
        isarray: 9,
        "process-nextick-args": 10,
        "safe-buffer": 24,
        "string_decoder/": 26,
        util: 2
    } ],
    16: [ function(require, module, exports) {
        "use strict";
        module.exports = Transform;
        var Duplex = require("./_stream_duplex");
        var util = require("core-util-is");
        util.inherits = require("inherits");
        util.inherits(Transform, Duplex);
        function TransformState(stream) {
            this.afterTransform = function(er, data) {
                return afterTransform(stream, er, data);
            };
            this.needTransform = false;
            this.transforming = false;
            this.writecb = null;
            this.writechunk = null;
            this.writeencoding = null;
        }
        function afterTransform(stream, er, data) {
            var ts = stream._transformState;
            ts.transforming = false;
            var cb = ts.writecb;
            if (!cb) return stream.emit("error", new Error("no writecb in Transform class"));
            ts.writechunk = null;
            ts.writecb = null;
            if (data !== null && data !== undefined) stream.push(data);
            cb(er);
            var rs = stream._readableState;
            rs.reading = false;
            if (rs.needReadable || rs.length < rs.highWaterMark) {
                stream._read(rs.highWaterMark);
            }
        }
        function Transform(options) {
            if (!(this instanceof Transform)) return new Transform(options);
            Duplex.call(this, options);
            this._transformState = new TransformState(this);
            var stream = this;
            this._readableState.needReadable = true;
            this._readableState.sync = false;
            if (options) {
                if (typeof options.transform === "function") this._transform = options.transform;
                if (typeof options.flush === "function") this._flush = options.flush;
            }
            this.once("prefinish", function() {
                if (typeof this._flush === "function") this._flush(function(er, data) {
                    done(stream, er, data);
                }); else done(stream);
            });
        }
        Transform.prototype.push = function(chunk, encoding) {
            this._transformState.needTransform = false;
            return Duplex.prototype.push.call(this, chunk, encoding);
        };
        Transform.prototype._transform = function(chunk, encoding, cb) {
            throw new Error("_transform() is not implemented");
        };
        Transform.prototype._write = function(chunk, encoding, cb) {
            var ts = this._transformState;
            ts.writecb = cb;
            ts.writechunk = chunk;
            ts.writeencoding = encoding;
            if (!ts.transforming) {
                var rs = this._readableState;
                if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
            }
        };
        Transform.prototype._read = function(n) {
            var ts = this._transformState;
            if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
                ts.transforming = true;
                this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
            } else {
                ts.needTransform = true;
            }
        };
        function done(stream, er, data) {
            if (er) return stream.emit("error", er);
            if (data !== null && data !== undefined) stream.push(data);
            var ws = stream._writableState;
            var ts = stream._transformState;
            if (ws.length) throw new Error("Calling transform done when ws.length != 0");
            if (ts.transforming) throw new Error("Calling transform done when still transforming");
            return stream.push(null);
        }
    }, {
        "./_stream_duplex": 13,
        "core-util-is": 4,
        inherits: 7
    } ],
    17: [ function(require, module, exports) {
        (function(process) {
            "use strict";
            module.exports = Writable;
            var processNextTick = require("process-nextick-args");
            var asyncWrite = !process.browser && [ "v0.10", "v0.9." ].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
            var Duplex;
            Writable.WritableState = WritableState;
            var util = require("core-util-is");
            util.inherits = require("inherits");
            var internalUtil = {
                deprecate: require("util-deprecate")
            };
            var Stream = require("./internal/streams/stream");
            var Buffer = require("safe-buffer").Buffer;
            util.inherits(Writable, Stream);
            function nop() {}
            function WriteReq(chunk, encoding, cb) {
                this.chunk = chunk;
                this.encoding = encoding;
                this.callback = cb;
                this.next = null;
            }
            function WritableState(options, stream) {
                Duplex = Duplex || require("./_stream_duplex");
                options = options || {};
                this.objectMode = !!options.objectMode;
                if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
                var hwm = options.highWaterMark;
                var defaultHwm = this.objectMode ? 16 : 16 * 1024;
                this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
                this.highWaterMark = ~~this.highWaterMark;
                this.needDrain = false;
                this.ending = false;
                this.ended = false;
                this.finished = false;
                var noDecode = options.decodeStrings === false;
                this.decodeStrings = !noDecode;
                this.defaultEncoding = options.defaultEncoding || "utf8";
                this.length = 0;
                this.writing = false;
                this.corked = 0;
                this.sync = true;
                this.bufferProcessing = false;
                this.onwrite = function(er) {
                    onwrite(stream, er);
                };
                this.writecb = null;
                this.writelen = 0;
                this.bufferedRequest = null;
                this.lastBufferedRequest = null;
                this.pendingcb = 0;
                this.prefinished = false;
                this.errorEmitted = false;
                this.bufferedRequestCount = 0;
                this.corkedRequestsFree = new CorkedRequest(this);
            }
            WritableState.prototype.getBuffer = function getBuffer() {
                var current = this.bufferedRequest;
                var out = [];
                while (current) {
                    out.push(current);
                    current = current.next;
                }
                return out;
            };
            (function() {
                try {
                    Object.defineProperty(WritableState.prototype, "buffer", {
                        get: internalUtil.deprecate(function() {
                            return this.getBuffer();
                        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer " + "instead.")
                    });
                } catch (_) {}
            })();
            var realHasInstance;
            if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
                realHasInstance = Function.prototype[Symbol.hasInstance];
                Object.defineProperty(Writable, Symbol.hasInstance, {
                    value: function(object) {
                        if (realHasInstance.call(this, object)) return true;
                        return object && object._writableState instanceof WritableState;
                    }
                });
            } else {
                realHasInstance = function(object) {
                    return object instanceof this;
                };
            }
            function Writable(options) {
                Duplex = Duplex || require("./_stream_duplex");
                if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
                    return new Writable(options);
                }
                this._writableState = new WritableState(options, this);
                this.writable = true;
                if (options) {
                    if (typeof options.write === "function") this._write = options.write;
                    if (typeof options.writev === "function") this._writev = options.writev;
                }
                Stream.call(this);
            }
            Writable.prototype.pipe = function() {
                this.emit("error", new Error("Cannot pipe, not readable"));
            };
            function writeAfterEnd(stream, cb) {
                var er = new Error("write after end");
                stream.emit("error", er);
                processNextTick(cb, er);
            }
            function validChunk(stream, state, chunk, cb) {
                var valid = true;
                var er = false;
                if (chunk === null) {
                    er = new TypeError("May not write null values to stream");
                } else if (typeof chunk !== "string" && chunk !== undefined && !state.objectMode) {
                    er = new TypeError("Invalid non-string/buffer chunk");
                }
                if (er) {
                    stream.emit("error", er);
                    processNextTick(cb, er);
                    valid = false;
                }
                return valid;
            }
            Writable.prototype.write = function(chunk, encoding, cb) {
                var state = this._writableState;
                var ret = false;
                var isBuf = Buffer.isBuffer(chunk);
                if (typeof encoding === "function") {
                    cb = encoding;
                    encoding = null;
                }
                if (isBuf) encoding = "buffer"; else if (!encoding) encoding = state.defaultEncoding;
                if (typeof cb !== "function") cb = nop;
                if (state.ended) writeAfterEnd(this, cb); else if (isBuf || validChunk(this, state, chunk, cb)) {
                    state.pendingcb++;
                    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
                }
                return ret;
            };
            Writable.prototype.cork = function() {
                var state = this._writableState;
                state.corked++;
            };
            Writable.prototype.uncork = function() {
                var state = this._writableState;
                if (state.corked) {
                    state.corked--;
                    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
                }
            };
            Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
                if (typeof encoding === "string") encoding = encoding.toLowerCase();
                if (!([ "hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw" ].indexOf((encoding + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + encoding);
                this._writableState.defaultEncoding = encoding;
                return this;
            };
            function decodeChunk(state, chunk, encoding) {
                if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
                    chunk = Buffer.from(chunk, encoding);
                }
                return chunk;
            }
            function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
                if (!isBuf) {
                    chunk = decodeChunk(state, chunk, encoding);
                    if (Buffer.isBuffer(chunk)) encoding = "buffer";
                }
                var len = state.objectMode ? 1 : chunk.length;
                state.length += len;
                var ret = state.length < state.highWaterMark;
                if (!ret) state.needDrain = true;
                if (state.writing || state.corked) {
                    var last = state.lastBufferedRequest;
                    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
                    if (last) {
                        last.next = state.lastBufferedRequest;
                    } else {
                        state.bufferedRequest = state.lastBufferedRequest;
                    }
                    state.bufferedRequestCount += 1;
                } else {
                    doWrite(stream, state, false, len, chunk, encoding, cb);
                }
                return ret;
            }
            function doWrite(stream, state, writev, len, chunk, encoding, cb) {
                state.writelen = len;
                state.writecb = cb;
                state.writing = true;
                state.sync = true;
                if (writev) stream._writev(chunk, state.onwrite); else stream._write(chunk, encoding, state.onwrite);
                state.sync = false;
            }
            function onwriteError(stream, state, sync, er, cb) {
                --state.pendingcb;
                if (sync) processNextTick(cb, er); else cb(er);
                stream._writableState.errorEmitted = true;
                stream.emit("error", er);
            }
            function onwriteStateUpdate(state) {
                state.writing = false;
                state.writecb = null;
                state.length -= state.writelen;
                state.writelen = 0;
            }
            function onwrite(stream, er) {
                var state = stream._writableState;
                var sync = state.sync;
                var cb = state.writecb;
                onwriteStateUpdate(state);
                if (er) onwriteError(stream, state, sync, er, cb); else {
                    var finished = needFinish(state);
                    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
                        clearBuffer(stream, state);
                    }
                    if (sync) {
                        asyncWrite(afterWrite, stream, state, finished, cb);
                    } else {
                        afterWrite(stream, state, finished, cb);
                    }
                }
            }
            function afterWrite(stream, state, finished, cb) {
                if (!finished) onwriteDrain(stream, state);
                state.pendingcb--;
                cb();
                finishMaybe(stream, state);
            }
            function onwriteDrain(stream, state) {
                if (state.length === 0 && state.needDrain) {
                    state.needDrain = false;
                    stream.emit("drain");
                }
            }
            function clearBuffer(stream, state) {
                state.bufferProcessing = true;
                var entry = state.bufferedRequest;
                if (stream._writev && entry && entry.next) {
                    var l = state.bufferedRequestCount;
                    var buffer = new Array(l);
                    var holder = state.corkedRequestsFree;
                    holder.entry = entry;
                    var count = 0;
                    while (entry) {
                        buffer[count] = entry;
                        entry = entry.next;
                        count += 1;
                    }
                    doWrite(stream, state, true, state.length, buffer, "", holder.finish);
                    state.pendingcb++;
                    state.lastBufferedRequest = null;
                    if (holder.next) {
                        state.corkedRequestsFree = holder.next;
                        holder.next = null;
                    } else {
                        state.corkedRequestsFree = new CorkedRequest(state);
                    }
                } else {
                    while (entry) {
                        var chunk = entry.chunk;
                        var encoding = entry.encoding;
                        var cb = entry.callback;
                        var len = state.objectMode ? 1 : chunk.length;
                        doWrite(stream, state, false, len, chunk, encoding, cb);
                        entry = entry.next;
                        if (state.writing) {
                            break;
                        }
                    }
                    if (entry === null) state.lastBufferedRequest = null;
                }
                state.bufferedRequestCount = 0;
                state.bufferedRequest = entry;
                state.bufferProcessing = false;
            }
            Writable.prototype._write = function(chunk, encoding, cb) {
                cb(new Error("_write() is not implemented"));
            };
            Writable.prototype._writev = null;
            Writable.prototype.end = function(chunk, encoding, cb) {
                var state = this._writableState;
                if (typeof chunk === "function") {
                    cb = chunk;
                    chunk = null;
                    encoding = null;
                } else if (typeof encoding === "function") {
                    cb = encoding;
                    encoding = null;
                }
                if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);
                if (state.corked) {
                    state.corked = 1;
                    this.uncork();
                }
                if (!state.ending && !state.finished) endWritable(this, state, cb);
            };
            function needFinish(state) {
                return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
            }
            function prefinish(stream, state) {
                if (!state.prefinished) {
                    state.prefinished = true;
                    stream.emit("prefinish");
                }
            }
            function finishMaybe(stream, state) {
                var need = needFinish(state);
                if (need) {
                    if (state.pendingcb === 0) {
                        prefinish(stream, state);
                        state.finished = true;
                        stream.emit("finish");
                    } else {
                        prefinish(stream, state);
                    }
                }
                return need;
            }
            function endWritable(stream, state, cb) {
                state.ending = true;
                finishMaybe(stream, state);
                if (cb) {
                    if (state.finished) processNextTick(cb); else stream.once("finish", cb);
                }
                state.ended = true;
                stream.writable = false;
            }
            function CorkedRequest(state) {
                var _this = this;
                this.next = null;
                this.entry = null;
                this.finish = function(err) {
                    var entry = _this.entry;
                    _this.entry = null;
                    while (entry) {
                        var cb = entry.callback;
                        state.pendingcb--;
                        cb(err);
                        entry = entry.next;
                    }
                    if (state.corkedRequestsFree) {
                        state.corkedRequestsFree.next = _this;
                    } else {
                        state.corkedRequestsFree = _this;
                    }
                };
            }
        }).call(this, require("_process"));
    }, {
        "./_stream_duplex": 13,
        "./internal/streams/stream": 19,
        _process: 11,
        "core-util-is": 4,
        inherits: 7,
        "process-nextick-args": 10,
        "safe-buffer": 24,
        "util-deprecate": 27
    } ],
    18: [ function(require, module, exports) {
        "use strict";
        var Buffer = require("safe-buffer").Buffer;
        module.exports = BufferList;
        function BufferList() {
            this.head = null;
            this.tail = null;
            this.length = 0;
        }
        BufferList.prototype.push = function(v) {
            var entry = {
                data: v,
                next: null
            };
            if (this.length > 0) this.tail.next = entry; else this.head = entry;
            this.tail = entry;
            ++this.length;
        };
        BufferList.prototype.unshift = function(v) {
            var entry = {
                data: v,
                next: this.head
            };
            if (this.length === 0) this.tail = entry;
            this.head = entry;
            ++this.length;
        };
        BufferList.prototype.shift = function() {
            if (this.length === 0) return;
            var ret = this.head.data;
            if (this.length === 1) this.head = this.tail = null; else this.head = this.head.next;
            --this.length;
            return ret;
        };
        BufferList.prototype.clear = function() {
            this.head = this.tail = null;
            this.length = 0;
        };
        BufferList.prototype.join = function(s) {
            if (this.length === 0) return "";
            var p = this.head;
            var ret = "" + p.data;
            while (p = p.next) {
                ret += s + p.data;
            }
            return ret;
        };
        BufferList.prototype.concat = function(n) {
            if (this.length === 0) return Buffer.alloc(0);
            if (this.length === 1) return this.head.data;
            var ret = Buffer.allocUnsafe(n >>> 0);
            var p = this.head;
            var i = 0;
            while (p) {
                p.data.copy(ret, i);
                i += p.data.length;
                p = p.next;
            }
            return ret;
        };
    }, {
        "safe-buffer": 24
    } ],
    19: [ function(require, module, exports) {
        module.exports = require("events").EventEmitter;
    }, {
        events: 5
    } ],
    20: [ function(require, module, exports) {
        module.exports = require("./readable").PassThrough;
    }, {
        "./readable": 21
    } ],
    21: [ function(require, module, exports) {
        exports = module.exports = require("./lib/_stream_readable.js");
        exports.Stream = exports;
        exports.Readable = exports;
        exports.Writable = require("./lib/_stream_writable.js");
        exports.Duplex = require("./lib/_stream_duplex.js");
        exports.Transform = require("./lib/_stream_transform.js");
        exports.PassThrough = require("./lib/_stream_passthrough.js");
    }, {
        "./lib/_stream_duplex.js": 13,
        "./lib/_stream_passthrough.js": 14,
        "./lib/_stream_readable.js": 15,
        "./lib/_stream_transform.js": 16,
        "./lib/_stream_writable.js": 17
    } ],
    22: [ function(require, module, exports) {
        module.exports = require("./readable").Transform;
    }, {
        "./readable": 21
    } ],
    23: [ function(require, module, exports) {
        module.exports = require("./lib/_stream_writable.js");
    }, {
        "./lib/_stream_writable.js": 17
    } ],
    24: [ function(require, module, exports) {
        module.exports = require("buffer");
    }, {
        buffer: 3
    } ],
    25: [ function(require, module, exports) {
        module.exports = Stream;
        var EE = require("events").EventEmitter;
        var inherits = require("inherits");
        inherits(Stream, EE);
        Stream.Readable = require("readable-stream/readable.js");
        Stream.Writable = require("readable-stream/writable.js");
        Stream.Duplex = require("readable-stream/duplex.js");
        Stream.Transform = require("readable-stream/transform.js");
        Stream.PassThrough = require("readable-stream/passthrough.js");
        Stream.Stream = Stream;
        function Stream() {
            EE.call(this);
        }
        Stream.prototype.pipe = function(dest, options) {
            var source = this;
            function ondata(chunk) {
                if (dest.writable) {
                    if (false === dest.write(chunk) && source.pause) {
                        source.pause();
                    }
                }
            }
            source.on("data", ondata);
            function ondrain() {
                if (source.readable && source.resume) {
                    source.resume();
                }
            }
            dest.on("drain", ondrain);
            if (!dest._isStdio && (!options || options.end !== false)) {
                source.on("end", onend);
                source.on("close", onclose);
            }
            var didOnEnd = false;
            function onend() {
                if (didOnEnd) return;
                didOnEnd = true;
                dest.end();
            }
            function onclose() {
                if (didOnEnd) return;
                didOnEnd = true;
                if (typeof dest.destroy === "function") dest.destroy();
            }
            function onerror(er) {
                cleanup();
                if (EE.listenerCount(this, "error") === 0) {
                    throw er;
                }
            }
            source.on("error", onerror);
            dest.on("error", onerror);
            function cleanup() {
                source.removeListener("data", ondata);
                dest.removeListener("drain", ondrain);
                source.removeListener("end", onend);
                source.removeListener("close", onclose);
                source.removeListener("error", onerror);
                dest.removeListener("error", onerror);
                source.removeListener("end", cleanup);
                source.removeListener("close", cleanup);
                dest.removeListener("close", cleanup);
            }
            source.on("end", cleanup);
            source.on("close", cleanup);
            dest.on("close", cleanup);
            dest.emit("pipe", source);
            return dest;
        };
    }, {
        events: 5,
        inherits: 7,
        "readable-stream/duplex.js": 12,
        "readable-stream/passthrough.js": 20,
        "readable-stream/readable.js": 21,
        "readable-stream/transform.js": 22,
        "readable-stream/writable.js": 23
    } ],
    26: [ function(require, module, exports) {
        "use strict";
        var Buffer = require("safe-buffer").Buffer;
        var isEncoding = Buffer.isEncoding || function(encoding) {
            encoding = "" + encoding;
            switch (encoding && encoding.toLowerCase()) {
              case "hex":
              case "utf8":
              case "utf-8":
              case "ascii":
              case "binary":
              case "base64":
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
              case "raw":
                return true;

              default:
                return false;
            }
        };
        function _normalizeEncoding(enc) {
            if (!enc) return "utf8";
            var retried;
            while (true) {
                switch (enc) {
                  case "utf8":
                  case "utf-8":
                    return "utf8";

                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return "utf16le";

                  case "latin1":
                  case "binary":
                    return "latin1";

                  case "base64":
                  case "ascii":
                  case "hex":
                    return enc;

                  default:
                    if (retried) return;
                    enc = ("" + enc).toLowerCase();
                    retried = true;
                }
            }
        }
        function normalizeEncoding(enc) {
            var nenc = _normalizeEncoding(enc);
            if (typeof nenc !== "string" && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
            return nenc || enc;
        }
        exports.StringDecoder = StringDecoder;
        function StringDecoder(encoding) {
            this.encoding = normalizeEncoding(encoding);
            var nb;
            switch (this.encoding) {
              case "utf16le":
                this.text = utf16Text;
                this.end = utf16End;
                nb = 4;
                break;

              case "utf8":
                this.fillLast = utf8FillLast;
                nb = 4;
                break;

              case "base64":
                this.text = base64Text;
                this.end = base64End;
                nb = 3;
                break;

              default:
                this.write = simpleWrite;
                this.end = simpleEnd;
                return;
            }
            this.lastNeed = 0;
            this.lastTotal = 0;
            this.lastChar = Buffer.allocUnsafe(nb);
        }
        StringDecoder.prototype.write = function(buf) {
            if (buf.length === 0) return "";
            var r;
            var i;
            if (this.lastNeed) {
                r = this.fillLast(buf);
                if (r === undefined) return "";
                i = this.lastNeed;
                this.lastNeed = 0;
            } else {
                i = 0;
            }
            if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
            return r || "";
        };
        StringDecoder.prototype.end = utf8End;
        StringDecoder.prototype.text = utf8Text;
        StringDecoder.prototype.fillLast = function(buf) {
            if (this.lastNeed <= buf.length) {
                buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
                return this.lastChar.toString(this.encoding, 0, this.lastTotal);
            }
            buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
            this.lastNeed -= buf.length;
        };
        function utf8CheckByte(byte) {
            if (byte <= 127) return 0; else if (byte >> 5 === 6) return 2; else if (byte >> 4 === 14) return 3; else if (byte >> 3 === 30) return 4;
            return -1;
        }
        function utf8CheckIncomplete(self, buf, i) {
            var j = buf.length - 1;
            if (j < i) return 0;
            var nb = utf8CheckByte(buf[j]);
            if (nb >= 0) {
                if (nb > 0) self.lastNeed = nb - 1;
                return nb;
            }
            if (--j < i) return 0;
            nb = utf8CheckByte(buf[j]);
            if (nb >= 0) {
                if (nb > 0) self.lastNeed = nb - 2;
                return nb;
            }
            if (--j < i) return 0;
            nb = utf8CheckByte(buf[j]);
            if (nb >= 0) {
                if (nb > 0) {
                    if (nb === 2) nb = 0; else self.lastNeed = nb - 3;
                }
                return nb;
            }
            return 0;
        }
        function utf8CheckExtraBytes(self, buf, p) {
            if ((buf[0] & 192) !== 128) {
                self.lastNeed = 0;
                return "�".repeat(p);
            }
            if (self.lastNeed > 1 && buf.length > 1) {
                if ((buf[1] & 192) !== 128) {
                    self.lastNeed = 1;
                    return "�".repeat(p + 1);
                }
                if (self.lastNeed > 2 && buf.length > 2) {
                    if ((buf[2] & 192) !== 128) {
                        self.lastNeed = 2;
                        return "�".repeat(p + 2);
                    }
                }
            }
        }
        function utf8FillLast(buf) {
            var p = this.lastTotal - this.lastNeed;
            var r = utf8CheckExtraBytes(this, buf, p);
            if (r !== undefined) return r;
            if (this.lastNeed <= buf.length) {
                buf.copy(this.lastChar, p, 0, this.lastNeed);
                return this.lastChar.toString(this.encoding, 0, this.lastTotal);
            }
            buf.copy(this.lastChar, p, 0, buf.length);
            this.lastNeed -= buf.length;
        }
        function utf8Text(buf, i) {
            var total = utf8CheckIncomplete(this, buf, i);
            if (!this.lastNeed) return buf.toString("utf8", i);
            this.lastTotal = total;
            var end = buf.length - (total - this.lastNeed);
            buf.copy(this.lastChar, 0, end);
            return buf.toString("utf8", i, end);
        }
        function utf8End(buf) {
            var r = buf && buf.length ? this.write(buf) : "";
            if (this.lastNeed) return r + "�".repeat(this.lastTotal - this.lastNeed);
            return r;
        }
        function utf16Text(buf, i) {
            if ((buf.length - i) % 2 === 0) {
                var r = buf.toString("utf16le", i);
                if (r) {
                    var c = r.charCodeAt(r.length - 1);
                    if (c >= 55296 && c <= 56319) {
                        this.lastNeed = 2;
                        this.lastTotal = 4;
                        this.lastChar[0] = buf[buf.length - 2];
                        this.lastChar[1] = buf[buf.length - 1];
                        return r.slice(0, -1);
                    }
                }
                return r;
            }
            this.lastNeed = 1;
            this.lastTotal = 2;
            this.lastChar[0] = buf[buf.length - 1];
            return buf.toString("utf16le", i, buf.length - 1);
        }
        function utf16End(buf) {
            var r = buf && buf.length ? this.write(buf) : "";
            if (this.lastNeed) {
                var end = this.lastTotal - this.lastNeed;
                return r + this.lastChar.toString("utf16le", 0, end);
            }
            return r;
        }
        function base64Text(buf, i) {
            var n = (buf.length - i) % 3;
            if (n === 0) return buf.toString("base64", i);
            this.lastNeed = 3 - n;
            this.lastTotal = 3;
            if (n === 1) {
                this.lastChar[0] = buf[buf.length - 1];
            } else {
                this.lastChar[0] = buf[buf.length - 2];
                this.lastChar[1] = buf[buf.length - 1];
            }
            return buf.toString("base64", i, buf.length - n);
        }
        function base64End(buf) {
            var r = buf && buf.length ? this.write(buf) : "";
            if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
            return r;
        }
        function simpleWrite(buf) {
            return buf.toString(this.encoding);
        }
        function simpleEnd(buf) {
            return buf && buf.length ? this.write(buf) : "";
        }
    }, {
        "safe-buffer": 24
    } ],
    27: [ function(require, module, exports) {
        (function(global) {
            module.exports = deprecate;
            function deprecate(fn, msg) {
                if (config("noDeprecation")) {
                    return fn;
                }
                var warned = false;
                function deprecated() {
                    if (!warned) {
                        if (config("throwDeprecation")) {
                            throw new Error(msg);
                        } else if (config("traceDeprecation")) {
                            console.trace(msg);
                        } else {
                            console.warn(msg);
                        }
                        warned = true;
                    }
                    return fn.apply(this, arguments);
                }
                return deprecated;
            }
            function config(name) {
                try {
                    if (!global.localStorage) return false;
                } catch (_) {
                    return false;
                }
                var val = global.localStorage[name];
                if (null == val) return false;
                return String(val).toLowerCase() === "true";
            }
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    28: [ function(require, module, exports) {
        var jsgui = require("../html/html");
        var Resource_Pool = require("../resource/pool");
        var stringify = jsgui.stringify, each = jsgui.each, arrayify = jsgui.arrayify, tof = jsgui.tof;
        var filter_map_by_regex = jsgui.filter_map_by_regex;
        var Class = jsgui.Class, Data_Object = jsgui.Data_Object;
        var fp = jsgui.fp, is_defined = jsgui.is_defined;
        var Collection = jsgui.Collection;
        var fields = {
            url: String
        };
        class Client_Resource_Pool extends Resource_Pool {
            constructor(spec) {
                super(spec);
            }
            start(callback) {
                callback(null, true);
            }
        }
        module.exports = Client_Resource_Pool;
    }, {
        "../html/html": 85,
        "../resource/pool": 102
    } ],
    29: [ function(require, module, exports) {
        var jsgui = require("../html/html");
        jsgui.Resource_Pool = require("./client-resource-pool");
        jsgui.Client_Page_Context = require("./page-context");
        jsgui.Selection_Scope = require("./selection-scope");
        module.exports = jsgui;
    }, {
        "../html/html": 85,
        "./client-resource-pool": 28,
        "./page-context": 30,
        "./selection-scope": 31
    } ],
    30: [ function(require, module, exports) {
        var jsgui = require("../html/html");
        var stringify = jsgui.stringify, each = jsgui.each, arrayify = jsgui.arrayify, tof = jsgui.tof;
        var filter_map_by_regex = jsgui.filter_map_by_regex;
        var Class = jsgui.Class, Data_Object = jsgui.Data_Object, Enhanced_Data_Object = jsgui.Enhanced_Data_Object;
        var fp = jsgui.fp, is_defined = jsgui.is_defined;
        var Collection = jsgui.Collection;
        var Client_Resource_Pool = require("./client-resource-pool");
        var Selection_Scope = require("./selection-scope");
        class Client_Page_Context extends jsgui.Page_Context {
            constructor(spec) {
                spec = spec || {};
                super(spec);
                this.document = spec.document || document;
                this.resource_pool = new Client_Resource_Pool({});
                this.map_els = {};
                this.selection_scopes = {};
                this.selection_scope_id_counter = 0;
            }
            new_selection_scope() {
                var res = new Selection_Scope({
                    context: this,
                    id: this.selection_scope_id_counter++
                });
                return res;
            }
            get_selection_scope_by_id(id) {
                if (!this.selection_scopes[id]) {
                    this.selection_scopes[id] = new Selection_Scope({
                        context: this,
                        id: id
                    });
                }
                return this.selection_scopes[id];
            }
            body() {
                var doc = this.document;
                var bod = doc.childNodes[0].childNodes[1];
                var bod_id = bod.getAttribute("data-jsgui-id");
                var res = this.map_controls[bod_id];
                return res;
            }
        }
        module.exports = Client_Page_Context;
    }, {
        "../html/html": 85,
        "./client-resource-pool": 28,
        "./selection-scope": 31
    } ],
    31: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var each = jsgui.eac;
        var tof = jsgui.tof;
        class Selection_Scope extends jsgui.Data_Object {
            constructor(spec) {
                if (spec.context) this.context = spec.context;
                if (typeof spec.id !== "undefined") this.is = spec.id;
                if (spec.control) this.control = spec.control;
                this.map_selected_controls = {};
            }
            select_only(ctrl) {
                var currently_selected;
                var count_deselected = 0;
                var selected;
                each(this.map_selected_controls, function(v, i) {
                    if (v && v !== ctrl) {
                        selected = v.get("selected").value();
                        if (selected) {
                            v.set("selected", false);
                            v.remove_class("selected");
                            v.trigger("deselect");
                            count_deselected++;
                        }
                    }
                    if (v === ctrl) {
                        currently_selected = v.get("selected").value();
                    }
                });
                this.map_selected_controls = {};
                this.map_selected_controls[ctrl._id()] = ctrl;
                if (!currently_selected) {
                    ctrl.set("selected", true);
                    ctrl.trigger("select");
                    ctrl.add_class("selected");
                }
                if (count_deselected > 0 & !currently_selected) {
                    this.trigger("change");
                }
            }
            deselect_ctrl_content(ctrl) {
                var cs = ctrl.get("selection_scope");
                var msc = this.map_selected_controls;
                var that = this;
                ctrl.get("content").each(function(i, v) {
                    var tv = tof(v);
                    if (tv == "control") {
                        v.remove_class("selected");
                        v.set("selected", false);
                        var id = v._id();
                        if (msc[id]) msc[id] = false;
                        that.deselect_ctrl_content(v);
                    }
                });
                this.trigger("change");
            }
            select_toggle(ctrl) {
                var sel = ctrl.get("selected").value();
                var msc = this.map_selected_controls;
                var id = ctrl._id();
                if (!sel) {
                    var sel_anc = ctrl.find_selected_ancestor_in_scope();
                    if (sel_anc) {
                        console.log("1) not selecting because a selected ancestor in the selection scope has been found.");
                    } else {
                        ctrl.set("selected", true);
                        this.deselect_ctrl_content(ctrl);
                        ctrl.add_class("selected");
                        msc[id] = ctrl;
                    }
                } else {
                    var tsel = tof(sel);
                    if (tsel == "data_value") {
                        var val = sel.get();
                        if (val) {
                            ctrl.remove_class("selected");
                            ctrl.set("selected", false);
                            msc[id] = false;
                        } else {
                            var sel_anc = ctrl.find_selected_ancestor_in_scope();
                            if (sel_anc) {
                                console.log("2) not selecting because a selected ancestor in the selection scope has been found.");
                            } else {
                                ctrl.set("selected", true);
                                this.deselect_ctrl_content(ctrl);
                                ctrl.add_class("selected");
                                msc[id] = ctrl;
                            }
                        }
                    }
                    if (tsel == "boolean") {
                        if (sel) {
                            ctrl.remove_class("selected");
                            ctrl.set("selected", false);
                            msc[id] = false;
                        } else {
                            var sel_anc = ctrl.find_selected_ancestor_in_scope();
                            if (sel_anc) {
                                console.log("2) not selecting because a selected ancestor in the selection scope has been found.");
                            } else {
                                this.deselect_ctrl_content(ctrl);
                                ctrl.set("selected", true);
                                ctrl.add_class("selected");
                                msc[id] = ctrl;
                            }
                        }
                    }
                }
                this.trigger("change");
            }
        }
        module.exports = Selection_Scope;
    }, {
        "../html-core/html-core": 83
    } ],
    32: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Audio_Volume = require("./audio-volume");
        var Media_Scrubber = require("./media-scrubber");
        var Control = jsgui.Control;
        class Audio_Player extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "audio_player";
                this.add_class("audio-player");
                var rp = this.context.resource_pool;
                var site_audio = rp.get_resource("Site Audio");
                console.log("site_audio", site_audio);
                var that = this;
                if (!spec.abstract && !spec.el) {
                    var albums = site_audio.meta.get("albums");
                    console.log("albums", albums);
                    var div_relative = add(Control({
                        class: "relative"
                    }));
                    var titlebar = make(Control({
                        class: "titlebar"
                    }));
                    var h1 = make(jsgui.h1({}));
                    titlebar.add(h1);
                    h1.add(albums[0].artist);
                    var h2 = make(jsgui.h2({}));
                    titlebar.add(h2);
                    h2.add(albums[0].name);
                    div_relative.add(titlebar);
                    var ctrl_tracks = make(Control({
                        class: "tracks"
                    }));
                    this.set("ctrl_tracks", ctrl_tracks);
                    div_relative.add(ctrl_tracks);
                    var tracks = albums[0].tracks;
                    console.log("tracks", tracks);
                    each(tracks, function(track, i) {
                        console.log("track", track);
                        var div_track = make(Control({
                            class: "track"
                        }));
                        ctrl_tracks.add(div_track);
                        var div_number = make(Control({
                            class: "number"
                        }));
                        div_track.add(div_number);
                        var str_number = "" + (i + 1);
                        div_number.add(str_number);
                        var div_name = make(Control({
                            class: "name"
                        }));
                        div_track.add(div_name);
                        div_name.add(track.name);
                        var div_length = make(Control({
                            class: "length"
                        }));
                        div_track.add(div_length);
                        var ms_duration = track.ms_duration;
                        console.log("ms_duration", ms_duration);
                        var s_duration = ms_duration / 1e3;
                        var mins = Math.floor(s_duration / 60);
                        var secs = Math.floor(s_duration % 60);
                        var str_secs = secs.toString();
                        if (str_secs.length == 1) {
                            str_secs = "0" + str_secs;
                        }
                        var str_time = mins + ":" + str_secs;
                        div_length.add(str_time);
                        var dca = make(Control({
                            class: "clearall"
                        }));
                        div_track.add(dca);
                    });
                    var ctrl_audio = make(jsgui.audio({}));
                    div_relative.add(ctrl_audio);
                    var ctrl_source_mp3 = make(Control({
                        tagName: "source"
                    }));
                    var ctrl_source_ogg = make(Control({
                        tagName: "source"
                    }));
                    ctrl_source_mp3.dom.attributes.type = "audio/mp3";
                    ctrl_source_ogg.dom.attributes.type = "audio/ogg";
                    ctrl_audio.add(ctrl_source_mp3);
                    ctrl_audio.add(ctrl_source_ogg);
                    var controls = make(Control({
                        class: "controls"
                    }));
                    div_relative.add(controls);
                    var buttons = make(Control({
                        class: "buttons"
                    }));
                    controls.add(buttons);
                    var btn_previous = make(Control({
                        class: "previous button"
                    }));
                    var btn_play_stop = make(Control({
                        class: "play button"
                    }));
                    var btn_next = make(Control({
                        class: "next button"
                    }));
                    buttons.add(btn_previous);
                    buttons.add(btn_play_stop);
                    buttons.add(btn_next);
                    var volume = make(Audio_Volume({}));
                    controls.add(volume);
                    var scrubber = make(Media_Scrubber({
                        ms_duration: tracks[0].ms_duration
                    }));
                    controls.add(scrubber);
                    var ctrl_fields = {
                        ctrl_relative: div_relative._id(),
                        ctrl_audio: ctrl_audio._id(),
                        btn_previous: btn_previous._id(),
                        btn_play_stop: btn_play_stop._id(),
                        btn_next: btn_next._id(),
                        scrubber: scrubber._id(),
                        ctrl_volume: volume._id(),
                        ctrl_tracks: ctrl_tracks._id(),
                        ctrl_source_mp3: ctrl_source_mp3._id(),
                        ctrl_source_ogg: ctrl_source_ogg._id()
                    };
                    this.set("dom.attributes.data-jsgui-ctrl-fields", stringify(ctrl_fields).replace(/"/g, "'"));
                    var c_albums = jsgui.clone(albums);
                    c_albums[0].path = "/audio/albums/01/";
                    this.set("dom.attributes.data-jsgui-fields", stringify({
                        albums: c_albums
                    }).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));
                }
            }
            resizable() {
                this.set("resizable", "right-bottom");
                this.set("dom.attributes.data-jsgui-fields", "{'resizable': 'right-bottom'}");
            }
            activate() {
                super.activate();
                var ctrl_relative = this.ctrl_relative;
                var ctrl_audio = this.ctrl_audio;
                var ctrl_source_mp3 = this.ctrl_source_mp3;
                var ctrl_source_ogg = this.ctrl_source_ogg;
                var btn_previous = this.btn_previous;
                var btn_play_stop = this.btn_play_stop;
                var btn_next = this.btn_next;
                var scrubber = this.scrubber;
                var ctrl_volume = this.ctrl_volume;
                var ctrl_tracks = this.ctrl_tracks;
                var el_audio = ctrl_audio.dom.el;
                var tracks_content = ctrl_tracks.content;
                ctrl_tracks.set_i_track = function(i_track) {
                    tracks_content.each(function(ctrl_track, i) {
                        var track = tracks[i];
                        if (i_track == i) {
                            ctrl_track.add_class("current");
                        } else {
                            ctrl_track.remove_class("current");
                        }
                    });
                };
                var albums = this.albums;
                var that = this;
                var tracks = albums[0].tracks;
                var album_path = albums[0].path;
                ctrl_relative.on("touchstart", function(e_touchstart) {
                    console.log("e_touchstart", e_touchstart);
                });
                var i_track = 0;
                tracks_content.each(function(ctrl_track, i) {
                    var track = tracks[i];
                    ctrl_track.set("track", track);
                    ctrl_track.on("click", function(e_click) {
                        i_track = i;
                        var track_num_str = i + 1 + "";
                        if (track_num_str.length == 1) track_num_str = "0" + track_num_str;
                        var mp3_path = album_path + track_num_str + ".mp3";
                        var ogg_path = album_path + track_num_str + ".ogg";
                        ctrl_source_mp3.dom.attributes.src = mp3_path;
                        ctrl_source_ogg.dom.attributes.src = ogg_path;
                        scrubber.ms_duration = track.ms_duration;
                        ctrl_tracks.set_i_track(i);
                        el_audio.load();
                    });
                });
                el_audio.load();
                var initial = true;
                var state = "loading";
                ctrl_audio.on("canplaythrough", function(e_canplaythrough) {
                    if (initial) {
                        el_audio.play();
                        state = "playing";
                        initial = false;
                        console.log("el_audio.duration", el_audio.duration);
                        console.log("el_audio.duration mins", Math.floor(el_audio.duration / 60));
                        console.log("el_audio.duration seconds", Math.floor(el_audio.duration % 60));
                    } else {
                        el_audio.play();
                        state = "playing";
                    }
                });
                ctrl_audio.on("timeupdate", function(e_timeupdate) {
                    var current_time = el_audio.currentTime;
                    var ms_time = current_time * 1e3;
                    scrubber.ms_time = ms_time;
                });
                var play_track_by_index = function(i) {
                    var track = tracks[i_track];
                    var track_num_str = i + 1 + "";
                    if (track_num_str.length == 1) track_num_str = "0" + track_num_str;
                    var mp3_path = album_path + track_num_str + ".mp3";
                    var ogg_path = album_path + track_num_str + ".ogg";
                    ctrl_source_mp3.dom.attributes.src = mp3_path;
                    ctrl_source_ogg.dom.attributes.src = ogg_path;
                    scrubber.ms_duration = track.ms_duration;
                    el_audio.load();
                    ctrl_tracks.set_i_track(i);
                };
                ctrl_audio.on("ended", function(e_ended) {
                    console.log("e_ended", e_ended);
                    if (i_track < tracks.length) {
                        i_track++;
                        play_track_by_index(i_track);
                    }
                });
                scrubber.on("change", function(e_change) {
                    var name = e_change.name, value = e_change.value, source = e_change.source;
                    if (source != that) {
                        var val;
                        if (value.value) {
                            val = value.value();
                        } else {
                            val = value;
                        }
                        var nct = val / 1e3;
                        console.log("nct", nct);
                        el_audio.currentTime = nct;
                    }
                });
                btn_previous.on("click", function(e_click) {
                    i_track--;
                    play_track_by_index(i_track);
                    if (state == "playing") {} else {}
                });
                btn_next.on("click", function(e_click) {
                    i_track++;
                    play_track_by_index(i_track);
                    ctrl_tracks.set_i_track(i_track);
                    if (state == "playing") {
                        state = "paused";
                    } else {
                        if (state == "paused") {}
                    }
                });
                btn_play_stop.on("click", function(e_click) {
                    if (state == "playing") {
                        el_audio.pause();
                        state = "paused";
                    } else {
                        if (state == "paused") {
                            el_audio.play();
                            state = "playing";
                        }
                    }
                });
            }
        }
        module.exports = Audio_Player;
    }, {
        "../html-core/html-core": 83,
        "./audio-volume": 33,
        "./media-scrubber": 52
    } ],
    33: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Horizontal_Slider = require("./horizontal-slider");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var v_subtract = jsgui.v_subtract;
        class Audio_Volume extends jsgui.Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "audio_volume";
                if (!spec.abstract && !spec.el) {
                    this.add_class("audio-volume");
                    var h_slider = add(Horizontal_Slider({
                        min: 0,
                        max: 100,
                        value: 100
                    }));
                    var ctrl_fields = {
                        h_slider: h_slider._id()
                    };
                    this.active();
                }
            }
            activate() {
                super.activate();
                console.log("Audio Volume activate");
                var h_slider = this.h_slider;
            }
        }
        module.exports = Audio_Volume;
    }, {
        "../html-core/html-core": 83,
        "./horizontal-slider": 46
    } ],
    34: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Control = jsgui.Control;
        class Button extends Control {
            constructor(spec, add, make) {
                super(spec);
                var that = this;
                this.__type_name = "button";
                this.add_class("button");
                if (spec.text) {
                    this.text = spec.text;
                }
                if (!spec.no_compose) {
                    if (!this._abstract && !spec.el) {
                        if (spec.text) {
                            this.add(spec.text);
                        }
                    }
                }
            }
            activate() {
                super.activate();
            }
        }
        module.exports = Button;
    }, {
        "../html-core/html-core": 83
    } ],
    35: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Menu_Node = require("./menu-node");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        class Context_Menu extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "context_menu";
                this.add_class("context menu");
                console.log("Context_Menu init spec.el", spec.el);
                if (!spec.abstract) {
                    var obj = spec.value;
                    console.log("menu obj", obj);
                    var that = this;
                    var tobj = tof(obj);
                    if (tobj == "object") {
                        each(obj, function(v, key) {
                            var menu_node = make(Menu_Node({
                                text: key,
                                value: v,
                                menu: that
                            }));
                            that.add(menu_node);
                        });
                    }
                    if (tobj == "array") {
                        each(obj, function(v, index) {
                            var tv = tof(v);
                            var vsig = jsgui.get_item_sig(v, 1);
                            if (vsig == "[s,f]") {
                                var text = v[0];
                                var item_callback = v[1];
                                var menu_node = make(Menu_Node({
                                    text: text,
                                    value: text,
                                    menu: that
                                }));
                                that.add(menu_node);
                            }
                        });
                    }
                }
            }
            activate() {
                super.activate();
            }
            close_all() {
                console.log("menu close_all");
                this.content.each(function(v, i) {
                    v.close_all();
                });
            }
        }
        module.exports = Context_Menu;
    }, {
        "../html-core/html-core": 83,
        "./menu-node": 53
    } ],
    36: [ function(require, module, exports) {
        var controls = {
            Audio_Player: require("./audio-player"),
            Audio_Volume: require("./audio-volume"),
            Button: require("./button"),
            Context_Menu: require("./context-menu"),
            File_Upload: require("./file-upload"),
            Grid: require("./grid"),
            Horizontal_Menu: require("./horizontal-menu"),
            Horizontal_Slider: require("./horizontal-slider"),
            Item: require("./item"),
            Item_View: require("./item-view"),
            Line_Chart: require("./line-chart"),
            List: require("./list"),
            Login: require("./login"),
            Media_Scrubber: require("./media-scrubber"),
            Menu_Node: require("./menu-node"),
            Multi_Layout_Mode: require("./multi-layout-mode"),
            Object_Editor: require("./editor/object"),
            Panel: require("./panel"),
            Plus_Minus_Toggle_Button: require("./plus-minus-toggle-button"),
            Popup_Menu_Button: require("./popup-menu-button"),
            Radio_Button: require("./radio-button"),
            Radio_Button_Group: require("./radio-button-group"),
            Scroll_View: require("./scroll-view"),
            Scrollbar: require("./scrollbar"),
            Single_Line: require("./single-line"),
            Start_Stop_Toggle_Button: require("./start-stop-toggle-button"),
            Tabs: require("./tabs"),
            Text_Field: require("./text-field"),
            Title_Bar: require("./title-bar"),
            Titled_Panel: require("./titled-panel"),
            Toggle_Button: require("./toggle-button"),
            Tree_Node: require("./tree-node"),
            Vertical_Expander: require("./vertical-expander"),
            Window: require("./window")
        };
        module.exports = controls;
    }, {
        "./audio-player": 32,
        "./audio-volume": 33,
        "./button": 34,
        "./context-menu": 35,
        "./editor/object": 41,
        "./file-upload": 43,
        "./grid": 44,
        "./horizontal-menu": 45,
        "./horizontal-slider": 46,
        "./item": 48,
        "./item-view": 47,
        "./line-chart": 49,
        "./list": 50,
        "./login": 51,
        "./media-scrubber": 52,
        "./menu-node": 53,
        "./multi-layout-mode": 54,
        "./panel": 55,
        "./plus-minus-toggle-button": 56,
        "./popup-menu-button": 57,
        "./radio-button": 59,
        "./radio-button-group": 58,
        "./scroll-view": 60,
        "./scrollbar": 61,
        "./single-line": 62,
        "./start-stop-toggle-button": 63,
        "./tabs": 64,
        "./text-field": 65,
        "./title-bar": 67,
        "./titled-panel": 68,
        "./toggle-button": 69,
        "./tree-node": 70,
        "./vertical-expander": 72,
        "./window": 79
    } ],
    37: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var Array_Viewer = require("../viewer/array");
        var factory = require("./factory");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        class Array_Editor extends Array_Viewer {
            constructor(spec) {
                super();
                var make = this.make;
                this.factory = factory;
                this.add_class("array-editor");
                this.__type_name = "array_editor";
            }
            refresh_internal() {
                this.super.refresh_internal();
            }
        }
        module.exports = Array_Editor;
    }, {
        "../../html-core/html-core": 83,
        "../viewer/array": 73,
        "./factory": 38
    } ],
    38: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var Object_Editor = require("./object");
        var Array_Editor = require("./array");
        var String_Editor = require("./string");
        var Number_Editor = require("./number");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        var map_modules = {};
        var that = this;
        var create = function(obj, context) {
            var tobj = tof(obj);
            if (tobj == "object") {
                var res = new Object_Editor({
                    context: context,
                    value: obj
                });
                return res;
            }
            if (tobj == "array") {
                var res = new Array_Editor({
                    context: context,
                    value: obj
                });
                return res;
            }
            if (tobj == "string") {
                var res = new String_Editor({
                    context: context,
                    value: obj
                });
                return res;
            }
            if (tobj == "number") {
                var res = new Number_Editor({
                    context: context,
                    value: obj
                });
                return res;
            }
            if (tobj == "data_value") {
                var val = obj.value();
                var tval = tof(val);
                if (tval == "string") {
                    var res = new String_Editor({
                        context: context,
                        value: obj
                    });
                }
                if (tval == "array") {
                    var res = new Array_Editor({
                        context: context,
                        value: obj
                    });
                }
                return res;
            }
        };
        module.exports = create;
    }, {
        "../../html-core/html-core": 83,
        "./array": 37,
        "./number": 39,
        "./object": 41,
        "./string": 42
    } ],
    39: [ function(require, module, exports) {
        var jsgui = require("../../lang/lang");
        var Number_Viewer = require("../viewer/number");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var Up_Down_Arrow_Buttons = require("../up-down-arrow-buttons");
        class Number_Editor extends Number_Viewer {
            constructor(spec) {
                var make = this.make;
                this._super(spec);
                this.add_class("number-editor");
                this.__type_name = "number_editor";
                var udab = new Up_Down_Arrow_Buttons({
                    context: this._context
                });
                this.add(udab);
                this.set("up_down_arrow_buttons", udab);
            }
            activate() {
                this._super();
                var udab = this.get("up_down_arrow_buttons");
                var that = this;
                udab.on("up", function() {
                    var val = that.get("value");
                    that.set("value", val + 1);
                });
                udab.on("down", function() {
                    var val = that.get("value");
                    that.set("value", val - 1);
                });
            }
        }
        module.exports = Number_Editor;
    }, {
        "../../lang/lang": 94,
        "../up-down-arrow-buttons": 71,
        "../viewer/number": 75
    } ],
    40: [ function(require, module, exports) {
        var jsgui = require("../../lang/lang");
        var Object_KVP_Viewer = require("../viewer/object-kvp");
        var factory = require("./factory");
        var String_Editor = require("./string");
        var Number_Editor = require("./number");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        class Object_KVP_Editor extends Object_KVP_Viewer {
            constructor(spec) {
                this.factory = factory;
                this.String = String_Editor;
                this.Number = Number_Editor;
                this._super(spec);
                this.add_class("object-kvp-editor");
                this.add_class(this.mode);
                this.__type_name = "object_kvp_editor";
            }
            refresh_internal() {
                this._super();
            }
            activate() {
                this._super();
            }
        }
        module.exports = Object_KVP_Editor;
    }, {
        "../../lang/lang": 94,
        "../viewer/object-kvp": 76,
        "./factory": 38,
        "./number": 39,
        "./string": 42
    } ],
    41: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var Object_Viewer = require("../viewer/object");
        var Object_KVP_Editor = require("./object-kvp");
        var factory = require("./factory");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        class Object_Editor extends Object_Viewer {
            constructor(spec) {
                super(spec);
                var make = this.make;
                this.factory = factory;
                this.Object_KVP = Object_KVP_Editor;
                this.add_class("object-editor");
                this.__type_name = "object_editor";
            }
            refresh_internal() {
                super.refresh_internal();
            }
        }
        module.exports = Object_Editor;
    }, {
        "../../html-core/html-core": 83,
        "../viewer/object": 77,
        "./factory": 38,
        "./object-kvp": 40
    } ],
    42: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var String_Viewer = require("../viewer/string");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        class String_Editor extends String_Viewer {
            constructor(spec) {
                super(spec);
                var make = this.make;
                var that = this;
                this.add_class("string-editor");
                this.__type_name = "string_editor";
                var that = this;
            }
            refresh_internal() {
                this.super.refresh_internal();
            }
            _edit() {
                var input = this.get("input");
                if (!input) {
                    var content = this.content;
                    var span = this.get("span");
                    var el = this.dom.el;
                    var span_bcr = span.dom.el.getBoundingClientRect();
                    var this_bcr = el.getBoundingClientRect();
                    var span_x_offset = span_bcr.left - this_bcr.left;
                    var w = span_bcr.width;
                    var value = this.get("value");
                    input = new jsgui.input({
                        context: this._context
                    });
                    input.set("dom.attributes.value", value);
                    var font_size = span.style("font-size");
                    var font = span.style("font");
                    input.style({
                        position: "absolute",
                        "margin-left": span_x_offset + "px",
                        width: w + "px",
                        outline: "0",
                        border: "0px solid",
                        font: font
                    });
                    content.insert(input, 0);
                    var iel = input.dom.el;
                    var spanel = span.dom.el;
                    iel.focus();
                    var sync_size = function(e) {
                        console.log("e", e);
                        setTimeout(function() {
                            var scrollWidth = iel.scrollWidth;
                            console.log("scrollWidth", scrollWidth);
                            input.style({
                                width: scrollWidth + "px"
                            });
                        }, 0);
                    };
                    input.on("keypress", function(e_keydown) {
                        sync_size();
                    });
                    console.log("has inserted input.");
                    this.set("editing", true);
                }
            }
            activate() {
                this._super();
                var that = this;
                var span = this.get("span");
                span.on("blur", function(e_blur) {
                    console.log("e_blur", e_blur);
                });
                var selected_on_mousedown;
                this.on("mousedown", function(e_down) {
                    console.log("mousedown");
                    var span_selected = this.get("span.selected");
                    console.log("md span_selected", span_selected);
                    selected_on_mousedown = span_selected;
                });
                this.on("click", function(e_click) {
                    var selected = that.get("selected");
                    var editing = that.get("editing");
                    if (selected & !editing) {
                        console.log("selected and not editing");
                    }
                    var span_selected = this.get("span.selected");
                    console.log("span_selected", span_selected);
                    span.dom.el.setAttribute("contenteditable", true);
                });
                var elSpan = span.dom.el;
                span.on("keyup", function(e_keyup) {
                    console.log("span keyup");
                    var cns = elSpan.childNodes;
                    console.log("cns.length " + cns.length);
                    if (cns.length > 1) {
                        for (var i = 0; i < cns.length; i++) {
                            var cn = cns[i];
                            if (cn.nodeType == 3) {} else {
                                elSpan.removeChild(cn);
                                i--;
                            }
                        }
                    }
                });
            }
        }
        module.exports = String_Editor;
    }, {
        "../../html-core/html-core": 83,
        "../viewer/string": 78
    } ],
    43: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Text_Field = require("./text-field");
        var Button = require("./button");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        class File_Upload extends Control {
            constructor(spec) {
                var make = this.make;
                var autosubmit = spec.autosubmit || false;
                super(spec);
                var mode = "medium";
                if (spec.mode) mode = spec.mode;
                if (mode == "icon" || mode == "mini" || mode == "compact") autosubmit = true;
                this.__type_name = "file_upload";
                var req = this.context.req;
                var frm = new jsgui.form({
                    context: this.context
                });
                if (spec.action) {
                    this.action = spec.action;
                } else {
                    this.action = "/upload/";
                }
                var da = this.dom.attrs;
                da.action = this.action;
                da.method = "POST";
                da.enctype = "multipart/form-data";
                this.add(frm);
                var input_file = new jsgui.input({
                    context: this.context
                });
                input_file.set("dom.attributes.type", "file");
                input_file.set("dom.attributes.name", "file");
                frm.add(input_file);
                if (mode === "normal" || mode === "large") {
                    var btn = new Button({
                        context: this.context
                    });
                    var bda = btn.dom.attrs;
                    bda.type = "submit";
                    bda.value = "submit";
                    bda.class = "upload";
                    btn.add("Upload");
                    frm.add(btn);
                }
                var ctrl_fields = {
                    input_file: input_file._id(),
                    form: frm._id()
                };
            }
            activate() {
                super.activate();
                console.log("activate File_Upload");
                var mode = this.mode;
                var autosubmit = this.autosubmit;
                var input_file = this.input_file;
                var form = this.form;
                if (autosubmit) {
                    input_file.add_event_listener("change", function(e_change) {
                        console.log("e_change", e_change);
                        form.dom.el.submit();
                    });
                }
            }
        }
        module.exports = File_Upload;
    }, {
        "../html-core/html-core": 83,
        "./button": 34,
        "./text-field": 65
    } ],
    44: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        class Grid extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "grid";
                this.add_class("grid");
                var spec_data = spec.data;
                if (!spec.abstract && !spec.el) {
                    var data;
                    this.full_compose_as_table();
                }
            }
            full_compose_as_table() {
                this.dom.tagName = table;
                var data = this.data;
                var range = data.range;
                var value;
                if (tof(data) === "data_grid") {
                    var x, y, max_x = range[0], max_y = range[1];
                    var ctrl_cell, ctrl_row;
                    var size = this.size().value();
                    var tbody_params = {
                        context: this.context,
                        tagName: "tbody"
                    };
                    if (size) {
                        tbody_params.size = [ size[0][0], size[1][0] ];
                    }
                    var tbody = new Control(tbody_params);
                    this.add(tbody);
                    for (y = 0; y <= max_y; y++) {
                        ctrl_row = new jsgui.tr({
                            context: this.context
                        });
                        tbody.add(ctrl_row);
                        for (x = 0; x <= max_x; x++) {
                            ctrl_cell = new jsgui.td({
                                context: this.context
                            });
                            ctrl_row.add(ctrl_cell);
                            value = data.get(x, y);
                            ctrl_cell.add_text(value);
                        }
                    }
                } else {
                    throw "Unexpected data type. Expected data_grid, got " + tof(data);
                }
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                }
            }
        }
        module.exports = Grid;
    }, {
        "../html-core/html-core": 83
    } ],
    45: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Menu_Node = require("./menu-node");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        class Horizontal_Menu extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "horizontal_menu";
                this.dom.attrs.class = "horizontal menu";
                if (!spec.abstract && !spec.el) {
                    var obj = spec.value;
                    var that = this;
                    var tobj = tof(obj);
                    if (tobj == "object") {
                        each(obj, function(v, key) {
                            var menu_node = make(Menu_Node({
                                text: key,
                                value: v,
                                menu: that
                            }));
                            that.add(menu_node);
                        });
                    }
                }
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var last_clicked;
                    this.content.each(function(v, i) {
                        v.on("click", function(e_click) {
                            var v_state = v.get("state");
                            v.open();
                            v.one_mousedown_anywhere(function(e_mousedown) {
                                if (!e_mousedown.within_this) {
                                    v.close();
                                } else {}
                            });
                        });
                        v.on("mouseup", function(e_mouseup) {});
                    });
                }
            }
            close_all() {
                console.log("menu close_all");
                this.content.each(function(v, i) {
                    v.close_all();
                });
            }
        }
        module.exports = Horizontal_Menu;
    }, {
        "../html-core/html-core": 83,
        "./menu-node": 53
    } ],
    46: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var v_subtract = jsgui.v_subtract;
        class Horizontal_Slider extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "horizontal_slider";
                if (!spec.abstract && !spec.el) {
                    var div_relative = add(Control({
                        class: "relative"
                    }));
                    this.add_class("horizontal slider");
                    var h_bar = make(Control({
                        class: "h-bar"
                    }));
                    var v_bar = make(Control({
                        class: "v-bar"
                    }));
                    div_relative.add(h_bar);
                    div_relative.add(v_bar);
                    var ctrl_fields = {
                        div_relative: div_relative._id(),
                        h_bar: h_bar._id(),
                        v_bar: v_bar._id()
                    };
                    this.set("dom.attributes.data-jsgui-ctrl-fields", stringify(ctrl_fields).replace(/"/g, "'"));
                    var min = this.get("min").value();
                    var max = this.get("max").value();
                    var value = this.value;
                    var obj_fields = {
                        min: min,
                        max: max,
                        value: value
                    };
                    var drag_mode = this.get("drag_mode");
                    if (drag_mode) {
                        obj_fields.drag_mode = drag_mode.value();
                    }
                    this.set("dom.attributes.data-jsgui-fields", stringify(obj_fields).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));
                    this.active();
                }
            }
            activate() {
                super.activate();
                console.log("Horizontal Slider activate");
                var that = this;
                var h_bar = this.h_bar;
                var v_bar = this.v_bar;
                var ghost_v_bar;
                var size = this.size();
                var size_v_bar = this.v_bar.size();
                var w_v_bar = size_v_bar[0];
                var h_w_v_bar = w_v_bar / 2;
                var h_padding = 5;
                var h_bar_width = size[0] - h_padding * 2;
                this.h_bar.style({
                    width: h_bar_width + "px"
                });
                var ctrl_html_root = this.context.ctrl_document;
                var pos_down, pos_current, pos_offset;
                var orig_v_bar_l = parseInt(this.v_bar.style("left"), 10);
                var new_v_bar_l;
                var drag_mode;
                var prop;
                var ctrl_ghost_v_bar;
                var context = this.context;
                var v_bar_center_pos;
                var v_bar_center_pos_when_pressed;
                var ensure_ctrl_ghost_v_bar = function() {
                    if (!ctrl_ghost_v_bar) {
                        ctrl_ghost_v_bar = new Control({
                            context: this.context,
                            class: "ghost v-bar"
                        });
                        div_relative.add(ctrl_ghost_v_bar);
                        ctrl_ghost_v_bar.activate();
                    } else {
                        div_relative.add(ctrl_ghost_v_bar);
                    }
                };
                var fn_mousemove = function(e_mousemove) {
                    var bcr_h_bar = h_bar.bcr();
                    var bcr_h_bar_x = bcr_h_bar[0][0];
                    var bcr_h_bar_w = bcr_h_bar[2][0];
                    var up_offset_from_bcr_h_bar_x = e_mousemove.pageX - bcr_h_bar_x;
                    if (up_offset_from_bcr_h_bar_x < 0) up_offset_from_bcr_h_bar_x = 0;
                    if (up_offset_from_bcr_h_bar_x > bcr_h_bar_w) up_offset_from_bcr_h_bar_x = bcr_h_bar_w;
                    if (drag_mode == "ghost") {
                        ensure_ctrl_ghost_v_bar();
                        ctrl_ghost_v_bar.style("left", up_offset_from_bcr_h_bar_x + "px");
                    } else {
                        v_bar.style("left", up_offset_from_bcr_h_bar_x + "px");
                    }
                };
                var fn_mouseup = function(e_mouseup) {
                    console.log("e_mouseup", e_mouseup);
                    ctrl_html_root.off("mousemove", fn_mousemove);
                    ctrl_html_root.off("mouseup", fn_mouseup);
                    var bcr_h_bar = h_bar.bcr();
                    console.log("bcr_h_bar", bcr_h_bar);
                    var bcr_h_bar_x = bcr_h_bar[0][0];
                    var bcr_h_bar_w = bcr_h_bar[2][0];
                    var up_offset_from_bcr_h_bar_x = e_mouseup.pageX - bcr_h_bar_x;
                    console.log("up_offset_from_bcr_h_bar_x", up_offset_from_bcr_h_bar_x);
                    if (up_offset_from_bcr_h_bar_x < 0) up_offset_from_bcr_h_bar_x = 0;
                    if (up_offset_from_bcr_h_bar_x > bcr_h_bar_w) up_offset_from_bcr_h_bar_x = bcr_h_bar_w;
                    var prop = up_offset_from_bcr_h_bar_x / bcr_h_bar_w;
                    console.log("prop", prop);
                    if (drag_mode == "ghost") {
                        ctrl_ghost_v_bar.remove();
                        var min = that.min;
                        if (min.value) min = min.value();
                        var max = that.max;
                        if (max.value) max = max.value();
                        console.log("pos_down", pos_down);
                        var new_val = prop * max;
                        console.log("new_val", new_val);
                        that.value = new_val;
                    } else {
                        orig_v_bar_l = new_v_bar_l;
                    }
                };
                v_bar.on("mousedown", function(e_mousedown) {
                    var dm = that.drag_mode;
                    if (dm) {
                        drag_mode = dm.value();
                    }
                    v_bar_center_pos_when_pressed = v_bar_center_pos;
                    ctrl_html_root.on("mousemove", fn_mousemove);
                    ctrl_html_root.on("mouseup", fn_mouseup);
                    ctrl_html_root.add_class("dragging");
                    pos_down = [ e_mousedown.pageX, e_mousedown.pageY ];
                });
                this.on("change", function(e_change) {
                    var name = e_change.name, value = e_change.value;
                    if (name == "value") {
                        var min = that.min;
                        var max = that.max;
                        prop = value / max;
                        var size_h_bar = h_bar.size;
                        v_bar_center_pos = Math.round(size_h_bar[0] * prop + h_padding - h_w_v_bar);
                        v_bar.style("left", v_bar_center_pos + "px");
                    }
                });
            }
        }
        module.exports = Horizontal_Slider;
    }, {
        "../html-core/html-core": 83
    } ],
    47: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Plus_Minus_Toggle_Button = require("./plus-minus-toggle-button");
        var Vertical_Expander = require("./vertical-expander");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        class Item_View extends Control {
            constructor(spec) {
                super(spec);
                var that = this;
                this.__type_name = "item_view";
                this.add_class("item item-view");
                var ctrl_expand_contract = new Plus_Minus_Toggle_Button({
                    context: this.context,
                    state: "+"
                });
                ctrl_expand_contract.active();
                this.set("expand_contract", ctrl_expand_contract);
                this.add(ctrl_expand_contract);
                var ctrl_icon = new Control({
                    context: this.context
                });
                ctrl_icon.add_class("icon");
                this.add(ctrl_icon);
                var ctrl_item_info = new Control({
                    context: this.context
                });
                ctrl_item_info.add_class("info");
                this.add(ctrl_item_info);
                var ctrl_name = new Control({
                    context: this.context
                });
                ctrl_name.add_class("name");
                var name = this.get("name");
                var ctrl_tn_name = new jsgui.textNode({
                    text: name,
                    context: this.context
                });
                ctrl_name.add(ctrl_tn_name);
                var ctrl_clearall_0 = new Control({
                    context: this.context
                });
                ctrl_clearall_0.add_class("clearall");
                this.add(ctrl_clearall_0);
                var ctrl_subitems = new Control({
                    context: this.context
                });
                ctrl_subitems.add_class("subitems");
                this.add(ctrl_subitems);
                ctrl_subitems.active();
                this.set("ctrl_subitems", ctrl_subitems);
                var ctrl_clearall = new Control({
                    context: this.context
                });
                ctrl_clearall.add_class("clearall");
                this.add(ctrl_clearall);
                this.ctrl_subitems = ctrl_subitems;
                ctrl_item_info.add(ctrl_name);
                if (typeof document === "undefined") {
                    that._fields = that._fields || {};
                    that._fields["name"] = name;
                    if (spec.path) that._fields["path"] = spec.path;
                }
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var that = this;
                    var expand_contract = this.expand_contract;
                    expand_contract.on("change", function(e_change) {
                        if (e_change.name === "state") {
                            if (e_change.value === "-") {
                                that.trigger("expand");
                            }
                            if (e_change.value === "+") {
                                that.trigger("contract");
                            }
                        }
                    });
                }
            }
        }
        module.exports = Item_View;
    }, {
        "../html-core/html-core": 83,
        "./plus-minus-toggle-button": 56,
        "./vertical-expander": 72
    } ],
    48: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var Data_Value = jsgui.Data_Value;
        class Item extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "item";
                this.add_class("item");
                var value = this.value = spec.value || spec.item;
                this.states = [ "closed", "open" ];
                this.state = new Data_Value("closed");
                this.i_state = 0;
                var active_fields = this.active_fields = {};
                active_fields.states = this.states;
                active_fields.state = this.state;
                active_fields.i_state = this.i_state;
                var that = this;
                if (!spec.abstract && !spec.el) {
                    var ctrl_primary = new Control({
                        context: this.context
                    });
                    this.add(ctrl_primary);
                    var set_value = function(value) {
                        var t_value = tof(value);
                        if (t_value === "collection") {
                            set_value(value._arr[0]);
                            if (tof(value._arr[1]) === "function") {
                                that.on("click", value._arr[1]);
                            }
                        } else if (t_value === "data_value") {
                            ctrl_primary.add(value.value());
                        } else if (t_value === "string" || t_value === "number") {
                            ctrl_primary.add(value);
                        } else if (value.keys) {
                            var value_keys = value.keys();
                            var map_keys = mapify(value_keys);
                            var has_id = map_keys["id"];
                            var has_name = map_keys["name"];
                            var has_key = map_keys["key"];
                            var id, name, key;
                            if (has_id && has_key && !has_name) {
                                id = value.id;
                                key = value.key;
                                var ctrl_id = new Control({
                                    context: this.context
                                });
                                ctrl_id.add_class("id");
                                var ctrl_key = new Control({
                                    context: this.context
                                });
                                ctrl_id.add_class("key");
                                ctrl_id.add(id.value);
                                ctrl_key.add(key.value);
                                ctrl_primary.add(ctrl_id);
                                ctrl_primary.add(ctrl_key);
                            }
                        }
                    };
                    set_value(value);
                    this.inner = new Control({
                        context: this.context,
                        class: "inner hidden"
                    });
                    this.add(this.inner);
                    var ctrl_fields = {
                        inner: this.inner._id()
                    };
                    this.dom.attrs["data-jsgui-fields"] = stringify(active_fields).replace(/"/g, "'");
                    this.dom.attrs["data-jsgui-ctrl-fields"] = stringify(ctrl_fields).replace(/"/g, "'");
                }
            }
            iterate_sub_items(cb_item, depth) {
                depth = depth || 0;
                var path;
                each(this.inner.content, sub_item => {
                    cb_item(sub_item, depth);
                    sub_item.iterate_sub_items(cb_item, depth + 1);
                });
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var ui_open = () => {
                        this.inner.show();
                    };
                    var ui_close = () => {
                        this.inner.hide();
                    };
                    this.state.on("change", e_change => {
                        var val = e_change.value;
                        if (val === "open") {
                            ui_open();
                        }
                        if (val === "closed") {
                            ui_close();
                        }
                    });
                    this.iterate_sub_items((sub_item, depth) => {});
                }
            }
            open() {
                this.state.set("open");
            }
            close() {
                this.state.set("closed");
            }
        }
        module.exports = Item;
    }, {
        "../html-core/html-core": 83
    } ],
    49: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, extend = jsgui.extend;
        var Control = jsgui.Control;
        var Collection = jsgui.Collection;
        class Line_Chart extends Control {
            constructor(spec) {
                super(spec);
                this.__type_name = "line_chart";
                if (!spec.abstract && !spec.el) {
                    this.add_class("line-chart no-select");
                    var vert_margin = 10;
                    var left_margin = 80;
                    var right_margin = 24;
                    var axis_thickness = 2;
                    var x_major_notch_spacing = spec.x_major_notch_spacing || spec.major_notch_spacing || 50;
                    var y_major_notch_spacing = spec.y_major_notch_spacing || spec.major_notch_spacing || 50;
                    var x_minor_notch_spacing = spec.x_minor_notch_spacing || spec.major_minor_spacing || 10;
                    var y_minor_notch_spacing = spec.y_minor_notch_spacing || spec.major_minor_spacing || 10;
                    var suppress_0_axes_labels = true;
                    this.set({
                        vert_margin: vert_margin,
                        left_margin: left_margin,
                        right_margin: right_margin,
                        axis_thickness: axis_thickness,
                        x_major_notch_spacing: x_major_notch_spacing,
                        y_major_notch_spacing: y_major_notch_spacing,
                        x_minor_notch_spacing: x_minor_notch_spacing,
                        y_minor_notch_spacing: y_minor_notch_spacing,
                        suppress_0_axes_labels: suppress_0_axes_labels
                    });
                    this.add_full_axes();
                }
                var num_days = this.get("num_days");
                if (typeof window == "undefined") {
                    extend(this._fields = this._fields || {}, {
                        vert_margin: vert_margin,
                        left_margin: left_margin,
                        right_margin: right_margin,
                        axis_thickness: axis_thickness,
                        x_major_notch_spacing: x_major_notch_spacing,
                        y_major_notch_spacing: y_major_notch_spacing,
                        x_minor_notch_spacing: x_minor_notch_spacing,
                        y_minor_notch_spacing: y_minor_notch_spacing,
                        suppress_0_axes_labels: suppress_0_axes_labels,
                        range: this.get("range").value(),
                        x_origin: this.get("x_origin").value(),
                        y_origin: this.get("y_origin").value()
                    });
                }
            }
            add_full_axes() {
                var vert_margin = this.get("vert_margin");
                var left_margin = this.get("left_margin");
                var right_margin = this.get("right_margin");
                var axis_thickness = this.get("axis_thickness");
                var x_major_notch_spacing = this.get("x_major_notch_spacing");
                var y_major_notch_spacing = this.get("y_major_notch_spacing");
                var x_minor_notch_spacing = this.get("x_minor_notch_spacing");
                var y_minor_notch_spacing = this.get("y_minor_notch_spacing");
                var suppress_0_axes_labels = this.get("suppress_0_axes_labels");
                var size = this.get("size").value();
                var w = size[0][0];
                var h = size[1][0];
                var range = this.get("range").value();
                console.log("range", range);
                var y_axis_x, x_axis_y;
                var x_min = range[0][0], y_min = range[0][1], x_max = range[1][0], y_max = range[1][1];
                var x_range = x_max - x_min, y_range = y_max - y_min;
                var y_axis_is_at_origin = x_min <= 0 && x_max >= 0;
                var x_axis_is_at_origin = y_min <= 0 && y_max >= 0;
                var x_axis_left = left_margin;
                var x_axis_right = w - right_margin;
                var y_axis_top = vert_margin;
                var y_axis_bottom = h - vert_margin;
                var x_chart_distance = x_axis_right - x_axis_left;
                var y_chart_distance = y_axis_bottom - y_axis_top;
                var x_axis_length = w - left_margin - right_margin;
                var y_axis_length = h - 2 * vert_margin;
                var x_scale = x_range / x_axis_length;
                var y_scale = y_range / y_axis_length;
                var x_origin, y_origin;
                var values_from_pixel_location = function(px_loc) {
                    var vect_from_origin = [ px_loc[0] - x_origin, px_loc[1] - y_origin ];
                    var res = [ Math.round(vect_from_origin[0] * x_scale), Math.round(vect_from_origin[1] * y_scale * -1) ];
                    return res;
                };
                var pixel_location_from_values = function(values) {
                    var res = [ Math.round(origin[0] + values[0] * 1 / x_scale), Math.round(origin[1] + values[1] * -1 / y_scale) ];
                    return res;
                };
                var x_location_from_value = function(x_value) {
                    return Math.round(x_origin + x_value * 1 / x_scale);
                };
                var y_location_from_value = function(y_value) {
                    return Math.round(y_origin + y_value * -1 / y_scale);
                };
                var svg = new Control({
                    context: this.context,
                    tag_name: "svg"
                });
                svg.set("dom.attributes", {
                    width: w,
                    height: h,
                    viewPort: "0 0 " + w + " " + h,
                    version: "1.1",
                    xmlns: "http://www.w3.org/2000/svg"
                });
                this.add(svg);
                this.set("svg", svg);
                if (y_axis_is_at_origin) {
                    var prop_through = -1 * x_min / x_range;
                    var distance_through = x_chart_distance * prop_through;
                    x_origin = x_axis_left + distance_through;
                    y_axis_x = x_origin;
                } else {
                    throw "stop";
                }
                if (x_axis_is_at_origin) {
                    var prop_through = -1 * y_min / y_range;
                    var distance_through = y_chart_distance * prop_through;
                    y_origin = y_axis_bottom - distance_through;
                    x_axis_y = y_origin;
                } else {
                    throw "stop";
                }
                this.x_origin = x_origin;
                this.y_origin = y_origin;
                var y_axis_top = vert_margin;
                var y_axis_bottom = h - vert_margin;
                var add_y_axis_line = function() {
                    var y_axis = new Control({
                        context: this.context,
                        tag_name: "line"
                    });
                    y_axis.set("dom.attributes", {
                        width: 10,
                        height: h,
                        x1: y_axis_x,
                        y1: y_axis_top,
                        x2: y_axis_x,
                        y2: y_axis_bottom,
                        stroke: "#000000",
                        "stroke-width": 2
                    });
                    svg.add(y_axis);
                };
                var add_x_axis_line = function() {
                    var x_axis = new Control({
                        context: this.context,
                        tag_name: "line"
                    });
                    x_axis.set("dom.attributes", {
                        width: 10,
                        height: h,
                        x1: x_axis_left,
                        y1: x_axis_y,
                        x2: x_axis_right,
                        y2: x_axis_y,
                        stroke: "#000000",
                        "stroke-width": 2
                    });
                    svg.add(x_axis);
                };
                var add_x_notch_group = function(spacing, height) {
                    var num_notches_left_of_origin = Math.floor(x_min * -1 / spacing);
                    var num_notches_right_of_origin = Math.floor(x_max / spacing);
                    var first_notch_x_value = num_notches_left_of_origin * spacing * -1;
                    var notch_x_value = first_notch_x_value;
                    while (notch_x_value <= x_max) {
                        var x_notch = new Control({
                            context: this.context,
                            tag_name: "line"
                        });
                        var x_location = x_location_from_value(notch_x_value);
                        x_notch.set("dom.attributes", {
                            width: 2,
                            height: height,
                            x1: x_location,
                            y1: y_origin,
                            x2: x_location,
                            y2: y_origin + height,
                            stroke: "#AAAAAA",
                            "stroke-width": 2
                        });
                        svg.add(x_notch);
                        notch_x_value += spacing;
                    }
                };
                var add_x_label_group = function(spacing) {
                    var num_notches_left_of_origin = Math.floor(x_min * -1 / spacing);
                    var num_notches_right_of_origin = Math.floor(x_max / spacing);
                    var first_notch_x_value = num_notches_left_of_origin * spacing * -1;
                    var notch_x_value = first_notch_x_value;
                    while (notch_x_value <= x_max) {
                        if (!(suppress_0_axes_labels && notch_x_value === 0)) {
                            var x_location = x_location_from_value(notch_x_value);
                            var x_notch_label = new Control({
                                context: this.context,
                                tag_name: "text"
                            });
                            x_notch_label.set("dom.attributes", {
                                x: x_location - 4,
                                y: y_origin + 28,
                                "font-family": "Verdana",
                                "font-size": 14
                            });
                            x_notch_label.add(notch_x_value + "");
                            svg.add(x_notch_label);
                        }
                        notch_x_value += spacing;
                    }
                };
                var add_y_label_group = function(spacing) {
                    var num_notches_below_origin = Math.floor(y_min * -1 / spacing);
                    var num_notches_above_origin = Math.floor(y_max / spacing);
                    var first_notch_y_value = num_notches_below_origin * spacing * -1;
                    var notch_y_value = first_notch_y_value;
                    while (notch_y_value <= y_max) {
                        if (!(suppress_0_axes_labels && notch_y_value === 0)) {
                            var y_notch = new Control({
                                context: this.context,
                                tag_name: "line"
                            });
                            var y_location = y_location_from_value(notch_y_value);
                            var y_notch_label = new Control({
                                context: this.context,
                                tag_name: "text"
                            });
                            y_notch_label.set("dom.attributes", {
                                x: x_origin - 48,
                                y: y_location + 6,
                                "font-family": "Verdana",
                                "font-size": 14
                            });
                            y_notch_label.add(notch_y_value + "");
                            svg.add(y_notch_label);
                        }
                        notch_y_value += spacing;
                    }
                };
                var add_y_notch_group = function(spacing, length) {
                    var num_notches_below_origin = Math.floor(y_min * -1 / spacing);
                    var num_notches_above_origin = Math.floor(y_max / spacing);
                    var first_notch_y_value = num_notches_below_origin * spacing * -1;
                    var notch_y_value = first_notch_y_value;
                    while (notch_y_value <= y_max) {
                        var y_notch = new Control({
                            context: this.context,
                            tag_name: "line"
                        });
                        var y_location = y_location_from_value(notch_y_value);
                        y_notch.set("dom.attributes", {
                            width: length,
                            height: 2,
                            x1: x_origin - length,
                            y1: y_location,
                            x2: x_origin,
                            y2: y_location,
                            stroke: "#AAAAAA",
                            "stroke-width": 2
                        });
                        svg.add(y_notch);
                        notch_y_value += spacing;
                    }
                };
                var add_x_axis_major_notches = function() {
                    add_x_notch_group(x_major_notch_spacing, 20);
                };
                var add_x_axis_minor_notches = function() {
                    add_x_notch_group(x_minor_notch_spacing, 10);
                };
                var add_origin_label = function() {
                    var origin_label = new Control({
                        context: this.context,
                        tag_name: "text"
                    });
                    origin_label.set("dom.attributes", {
                        x: x_origin - 14,
                        y: y_origin + 14,
                        "font-family": "Verdana",
                        "font-size": 14
                    });
                    origin_label.add("0");
                    svg.add(origin_label);
                };
                var add_y_axis_major_notches = function() {
                    add_y_notch_group(y_major_notch_spacing, 20);
                };
                var add_y_axis_minor_notches = function() {
                    console.log("x_minor_notch_spacing", y_minor_notch_spacing);
                    add_y_notch_group(y_minor_notch_spacing, 10);
                };
                var add_major_x_axis_labels = function() {
                    add_x_label_group(x_major_notch_spacing);
                };
                var add_major_y_axis_labels = function() {
                    add_y_label_group(y_major_notch_spacing);
                };
                var add_major_axes_labels = function() {
                    add_major_x_axis_labels();
                    add_major_y_axis_labels();
                };
                add_x_axis_minor_notches();
                add_x_axis_major_notches();
                add_y_axis_minor_notches();
                add_y_axis_major_notches();
                add_x_axis_line();
                add_y_axis_line();
                add_major_axes_labels();
                add_origin_label();
            }
            render_axes() {}
            values_from_pixel_location(px_loc) {
                var el = this.dom.el;
                var w = el.clientWidth;
                var h = el.clientHeight;
                var x_origin = this.x_origin;
                var y_origin = this.y_origin;
                var vert_margin = this.vert_margin;
                var left_margin = this.left_margin;
                var right_margin = this.right_margin;
                var x_axis_length = w - left_margin - right_margin;
                var y_axis_length = h - 2 * vert_margin;
                var range = this.range;
                var x_min = range[0][0], y_min = range[0][1], x_max = range[1][0], y_max = range[1][1];
                var x_range = x_max - x_min, y_range = y_max - y_min;
                var x_scale = x_range / x_axis_length;
                var y_scale = y_range / y_axis_length;
                var vect_from_origin = [ px_loc[0] - x_origin, px_loc[1] - y_origin ];
                var res = [ Math.round(vect_from_origin[0] * x_scale), Math.round(vect_from_origin[1] * y_scale * -1) ];
                return res;
            }
            pixel_location_from_values(values) {
                var el = this.dom.el;
                var w, h;
                if (el) {
                    w = el.clientWidth;
                    h = el.clientHeight;
                } else {
                    var size = this.size();
                    w = size._[0][0];
                    h = size._[1][0];
                }
                var x_origin = this.x_origin;
                var y_origin = this.y_origin;
                var vert_margin = this.vert_margin;
                var left_margin = this.left_margin;
                var right_margin = this.right_margin;
                var x_axis_length = w - left_margin - right_margin;
                var y_axis_length = h - 2 * vert_margin;
                var range = this.range;
                var x_min = range[0][0], y_min = range[0][1], x_max = range[1][0], y_max = range[1][1];
                var x_range = x_max - x_min, y_range = y_max - y_min;
                var x_scale = x_range / x_axis_length;
                var y_scale = y_range / y_axis_length;
                var res = [ Math.round(x_origin + values[0] * 1 / x_scale), Math.round(y_origin + values[1] * -1 / y_scale) ];
                return res;
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var that = this;
                    var el = this.dom.el;
                    var w = el.clientWidth;
                    var h = el.clientHeight;
                    var size = [ w, h ];
                    var vert_margin = this.vert_margin;
                    var left_margin = this.left_margin;
                    var right_margin = this.right_margin;
                    var axis_thickness = this.axis_thickness;
                    var x_major_notch_spacing = this.x_major_notch_spacing;
                    var y_major_notch_spacing = this.y_major_notch_spacing;
                    var x_minor_notch_spacing = this.x_minor_notch_spacing;
                    var y_minor_notch_spacing = this.y_minor_notch_spacing;
                    var suppress_0_axes_labels = this.suppress_0_axes_labels;
                    var x_origin = this.x_origin;
                    var y_origin = this.y_origin;
                    var range = this.range;
                    var x_min = range[0][0], y_min = range[0][1], x_max = range[1][0], y_max = range[1][1];
                    var y_axis_is_at_origin = x_min <= 0 && x_max >= 0;
                    var x_axis_is_at_origin = y_min <= 0 && y_max >= 0;
                    var x_axis_left = left_margin;
                    var x_axis_right = w - right_margin;
                    var y_axis_top = vert_margin;
                    var y_axis_bottom = h - vert_margin;
                    var x_axis_length = w - left_margin - right_margin;
                    var y_axis_length = h - 2 * vert_margin;
                    var x_range = x_max - x_min, y_range = y_max - y_min;
                    var x_scale = x_range / x_axis_length;
                    var y_scale = y_range / y_axis_length;
                    var log_values = function() {
                        console.log("x_range", x_range);
                        console.log("y_range", y_range);
                        console.log("x_scale", x_scale);
                        console.log("y_scale", y_scale);
                        console.log("left_margin", left_margin);
                        console.log("right_margin", right_margin);
                        console.log("range", range);
                        console.log("tof range", tof(range));
                    };
                    var context = this.context;
                    var values_from_pixel_location = function(px_loc) {
                        var vect_from_origin = [ px_loc[0] - x_origin, px_loc[1] - y_origin ];
                        var res = [ Math.round(vect_from_origin[0] * x_scale), Math.round(vect_from_origin[1] * y_scale * -1) ];
                        return res;
                    };
                    var pixel_location_from_values = function(values) {
                        var res = [ Math.round(origin[0] + values[0] * 1 / x_scale), Math.round(origin[1] + values[1] * -1 / y_scale) ];
                        return res;
                    };
                    var x_location_from_value = function(x_value) {
                        return Math.round(x_origin + x_value * 1 / x_scale);
                    };
                    var y_location_from_value = function(y_value) {
                        return Math.round(y_origin + y_value * -1 / y_scale);
                    };
                    var findPos = function(obj) {
                        var curleft = curtop = 0;
                        if (obj.offsetParent) {
                            do {
                                curleft += obj.offsetLeft;
                                curtop += obj.offsetTop;
                            } while (obj = obj.offsetParent);
                        }
                        return [ curleft, curtop ];
                    };
                    this.add_event_listener("mousemove", function(e_mousemove) {
                        var pos = findPos(el);
                        var click_x, click_y;
                        if (e_mousemove.pageX || e_mousemove.pageY) {
                            click_x = e_mousemove.pageX;
                            click_y = e_mousemove.pageY;
                        }
                        var click_pos = [ click_x, click_y ];
                        var pos_within_this = jsgui.v_subtract(click_pos, pos);
                        var values = values_from_pixel_location(pos_within_this);
                        e_mousemove.chart_position = values;
                    });
                    this.add_event_listener("click", function(e_click) {
                        var pos = findPos(el);
                        var click_x, click_y;
                        if (e_click.pageX || e_click.pageY) {
                            click_x = e_click.pageX;
                            click_y = e_click.pageY;
                        }
                        var click_pos = [ click_x, click_y ];
                        var pos_within_this = jsgui.v_subtract(click_pos, pos);
                        var values = values_from_pixel_location(pos_within_this);
                        e_click.chart_position = values;
                    });
                }
            }
        }
        module.exports = Line_Chart;
    }, {
        "../html-core/html-core": 83
    } ],
    50: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Item = require("./item");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var Collection = jsgui.Collection;
        class List extends Control {
            constructor(spec, add, make) {
                console.log("init list");
                super(spec);
                var that = this;
                this.__type_name = "list";
                this.add_class("list");
                this.items = new Collection();
                if (spec.items) {
                    this.items.set(spec.items);
                }
                this.items.each(function(item) {
                    var ctrl_item = new Item({
                        context: that.context,
                        value: item
                    });
                    that.add(ctrl_item);
                });
                this.items.on("change", evt_change => {
                    if (evt_change.type === "insert") {
                        var ctrl_item = new Item({
                            context: that.context,
                            value: evt_change.item
                        });
                        that.add(ctrl_item);
                    }
                });
                if (!this._abstract && !spec.el) {}
            }
            activate() {
                super.activate();
                this.context_menu({
                    Delete: function() {
                        console.log("context_menu Delete");
                    },
                    Edit: function() {
                        console.log("context_menu Edit");
                    }
                });
            }
        }
        module.exports = List;
    }, {
        "../html-core/html-core": 83,
        "./item": 48
    } ],
    51: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core"), Text_Field = require("./text-field");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        class Login extends Control {
            constructor(spec) {
                var make = this.make;
                super(spec);
                this.add_class("login-control");
                var req = this.context.req;
                console.log("--- Within Login Control ---");
                var headers = req.headers;
                console.log("headers " + stringify(headers));
                var auth = this.context.auth;
                console.log("auth " + stringify(auth));
                if (auth && auth.verified) {
                    var div_logged_in = new jsgui.div({
                        context: this.context
                    });
                    var span_logged_in = new jsgui.span({
                        context: this.context
                    });
                    span_logged_in.add("Logged in as: " + auth.username);
                    div_logged_in.add(span_logged_in);
                    var frm = new jsgui.form({
                        context: this.context
                    });
                    frm.dom.attrs.set({
                        action: "/logout/?returnurl=%2F",
                        method: "POST"
                    });
                    div_logged_in.add(frm);
                    var btn = new jsgui.button({
                        context: this.context
                    });
                    btn.dom.attrs.set({
                        type: "submit",
                        value: "submit",
                        class: "logout"
                    });
                    btn.add("Logout");
                    frm.add(btn);
                    this.add(div_logged_in);
                } else {
                    var frm = new jsgui.form({
                        context: this.context
                    });
                    frm.dom.attrs.set({
                        action: "/logout/?returnurl=%2F",
                        method: "POST"
                    });
                    this.add(frm);
                    var tf_username = new Text_Field({
                        text: "Username",
                        name: "username",
                        value: "",
                        type: "text",
                        context: this.context
                    });
                    frm.add(tf_username);
                    var tf_password = new Text_Field({
                        text: "Password",
                        name: "password",
                        value: "",
                        type: "password",
                        context: this.context
                    });
                    frm.add(tf_password);
                    var btn = new jsgui.button({
                        context: this.context
                    });
                    btn.dom.attrs.set({
                        type: "submit",
                        value: "submit",
                        class: "login"
                    });
                    btn.add("Login");
                    frm.add(btn);
                }
            }
        }
        module.exports = Login;
    }, {
        "../html-core/html-core": 83,
        "./text-field": 65
    } ],
    52: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Horizontal_Slider = require("./horizontal-slider");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var v_subtract = jsgui.v_subtract;
        class Media_Scrubber extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "media_scrubber";
                if (spec.ms_duration) {
                    this.set("ms_duration", spec.ms_duration);
                }
                if (!spec.abstract && !spec.el) {
                    this.add_class("scrubber");
                    var time_display = add(Control({}));
                    time_display.add_class("time-display");
                    var ms_duration = this.get("ms_duration");
                    var s_duration = Math.round(ms_duration / 1e3);
                    var mins = Math.floor(s_duration / 60);
                    var secs = s_duration % 60;
                    var str_secs = secs.toString();
                    if (str_secs.length == 1) {
                        str_secs = str_secs + "0";
                    }
                    var str_time = mins + ":" + str_secs;
                    var str_time_display = "0:00 / " + str_time;
                    time_display.add(str_time_display);
                    var h_slider = add(Horizontal_Slider({
                        min: 0,
                        max: ms_duration,
                        value: 0,
                        drag_mode: "ghost"
                    }));
                    var ctrl_fields = {
                        h_slider: h_slider._id(),
                        time_display: time_display._id()
                    };
                    this.set("dom.attributes.data-jsgui-ctrl-fields", stringify(ctrl_fields).replace(/"/g, "'"));
                    this.set("dom.attributes.data-jsgui-fields", stringify({
                        ms_duration: ms_duration
                    }).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));
                    this.active();
                }
                if (!spec.abstract) {
                    this.set("ms_time", new jsgui.Data_Value({
                        contect: this.context
                    }));
                }
            }
            activate() {
                super.activate();
                var that = this;
                console.log("Media_Scrubber activate");
                var h_slider = this.get("h_slider");
                var time_display = this.get("time_display");
                var el_time_display = time_display.dom.el;
                var ms_time = this.get("ms_time");
                var dv_ms_duration = this.get("ms_duration");
                var ms_duration = dv_ms_duration.value();
                var s_duration = Math.round(ms_duration / 1e3);
                var mins_d = Math.floor(s_duration / 60);
                var secs_d = s_duration % 60;
                var str_secs_d = secs_d.toString();
                if (str_secs_d.length == 1) {
                    str_secs_d = "0" + str_secs_d;
                }
                var str_duration = mins_d + ":" + str_secs_d;
                this.on("change", function(e_change) {
                    var field_name = e_change.name, value = e_change.value;
                    if (value.value) {
                        value = value.value();
                    }
                    if (field_name == "ms_duration") {
                        h_slider.set("max", value, that);
                    }
                    if (field_name == "ms_time") {
                        var s_time = value / 1e3;
                        var mins = Math.floor(s_time / 60);
                        var secs = Math.floor(s_time % 60);
                        var str_secs = secs.toString();
                        if (str_secs.length == 1) {
                            str_secs = "0" + str_secs;
                        }
                        var str_time = mins + ":" + str_secs;
                        dv_ms_duration = that.get("ms_duration");
                        if (dv_ms_duration.value) {
                            ms_duration = dv_ms_duration.value();
                        } else {
                            ms_duration = dv_ms_duration;
                        }
                        var s_duration = ms_duration / 1e3;
                        var mins_d = Math.floor(s_duration / 60);
                        var secs_d = Math.floor(s_duration % 60);
                        var str_secs_d = secs_d.toString();
                        if (str_secs_d.length == 1) {
                            str_secs_d = "0" + str_secs_d;
                        }
                        var str_duration = mins_d + ":" + str_secs_d;
                        el_time_display.innerHTML = str_time + " / " + str_duration;
                        var proportion_through_track = value / ms_duration;
                        h_slider.value = value;
                    }
                });
                h_slider.on("change", function(e_change) {
                    var name = e_change.name, value = e_change.value, source = e_change.source;
                    if (source != that) {
                        that.set(name, value, source);
                    }
                });
            }
        }
        module.exports = Media_Scrubber;
    }, {
        "../html-core/html-core": 83,
        "./horizontal-slider": 46
    } ],
    53: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        class Menu_Node extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "menu_node";
                var that = this;
                if (!this._abstract) {
                    if (!spec.el) {
                        this.add_class("menu-node");
                        var spec_state = spec.state, state;
                        var main_control = make(Control({
                            class: "main"
                        }));
                        this.add(main_control);
                        if (spec.img_src) {}
                        if (spec.text) {
                            this.text = spec.text;
                            var span = make(jsgui.span({}));
                            span.add(spec.text);
                            main_control.add(span);
                        }
                        var menu = spec.menu;
                        if (menu) {
                            this.set("menu", menu);
                        }
                        var inner_control = this.inner_control = make(Control({
                            class: "inner hidden"
                        }));
                        this.add(inner_control);
                        if (spec.value) {
                            var obj_menu = spec.value;
                            var t_obj_menu = tof(obj_menu);
                            console.log("t_obj_menu", t_obj_menu);
                            if (t_obj_menu == "array") {
                                each(obj_menu, function(v) {
                                    var tv = tof(v);
                                    if (tv == "string") {
                                        var nested_menu_node = make(Menu_Node({
                                            text: v,
                                            menu: menu
                                        }));
                                        inner_control.add(nested_menu_node);
                                    }
                                });
                            }
                        }
                        var ctrl_fields = {
                            inner_control: inner_control._id(),
                            main_control: main_control._id(),
                            menu: spec.menu._id()
                        };
                        this.set("dom.attributes.data-jsgui-ctrl-fields", stringify(ctrl_fields).replace(/"/g, "'"));
                        if (spec_state) {
                            if (spec_state == "open" || spec_state == "closed") {
                                state = this.set("state", spec_state);
                            } else {
                                throw 'spec.state expects "open" or "closed".';
                            }
                        } else {
                            state = this.set("state", "open");
                        }
                    }
                }
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var inner_control = this.inner_control;
                    var main_control = this.main_control;
                    var menu = this.menu;
                    var that = this;
                }
            }
            close_all() {
                console.log("menu-node close_all");
                var inner_control = this.inner_control;
                inner_control.content.each(function(v, i) {
                    var tn = v.__type_name;
                    if (tn == "menu_node") {
                        v.close_all();
                    }
                });
                inner_control.hide();
                this.set("state", "closed", true);
            }
            close() {
                var inner_control = this.inner_control;
                inner_control.hide();
                this.set("state", "closed", true);
            }
            open() {
                var inner_control = this.inner_control;
                inner_control.show();
                this.set("state", "open", true);
            }
        }
        module.exports = Menu_Node;
    }, {
        "../html-core/html-core": 83
    } ],
    54: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Panel = require("./panel");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        var fields = {
            layout_mode: String
        };
        class Multi_Layout_Mode extends Control {
            constructor(spec) {
                super(spec);
                var make = this.context.make;
                var context = this.context;
                this.__type_name = "multi_layout_mode";
                this.add_class("multi-layout-mode");
                if (!spec.abstract && !spec.el) {
                    var layout_mode = this.layout_mode;
                    if (layout_mode) {
                        this.add_class(layout_mode);
                    }
                    var panel_title = new Panel({
                        context: context,
                        name: "title"
                    });
                    panel_title.add_class("title");
                    var panel_navigation = new Panel({
                        context: context,
                        name: "navigation"
                    });
                    panel_navigation.add_class("navigation");
                    var panel_main = new Panel({
                        context: context,
                        name: "main"
                    });
                    panel_main.add_class("main");
                    var panel_misc = new Panel({
                        context: context,
                        name: "misc"
                    });
                    panel_misc.add_class("misc");
                    if (layout_mode == "fluid-fixed") {
                        var panel_top = new Panel({
                            context: context,
                            name: "top"
                        });
                        panel_top.add_class("top");
                        var panel_left_wrapper = new Panel({
                            context: context,
                            name: "left-wrapper"
                        });
                        panel_left_wrapper.add_class("left-wrapper");
                        var panel_left = new Panel({
                            context: context,
                            name: "left"
                        });
                        panel_left.add_class("left");
                        var panel_right = new Panel({
                            context: context,
                            name: "right"
                        });
                        panel_right.add_class("right");
                        var panel_bottom = new Panel({
                            context: context,
                            name: "bottom"
                        });
                        panel_bottom.add_class("bottom");
                        this.add(panel_top);
                        this.add(panel_left_wrapper);
                        panel_left_wrapper.add(panel_left);
                        this.add(panel_right);
                        this.add(panel_bottom);
                        panel_top.add(panel_title);
                        panel_bottom.add(panel_navigation);
                        panel_left.add(panel_main);
                        panel_right.add(panel_misc);
                    } else {
                        this.add(panel_title);
                        this.add(panel_navigation);
                        this.add(panel_main);
                        this.add(panel_misc);
                    }
                    this.title = panel_title;
                    this.navigation = panel_navigation;
                    this.main = panel_main;
                    this.misc = panel_misc;
                }
            }
            activate() {
                super.activate();
            }
        }
        module.exports = Multi_Layout_Mode;
    }, {
        "../html-core/html-core": 83,
        "./panel": 55
    } ],
    55: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        class Panel extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "panel";
                this.add_class("panel");
                if (!spec.abstract && !spec.el) {
                    var l = 0;
                    var ctrl_fields = {};
                }
            }
            activate() {
                super.activate();
            }
        }
        module.exports = Panel;
    }, {
        "../html-core/html-core": 83
    } ],
    56: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Toggle_Button = require("./toggle-button");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        class Plus_Minus_Toggle_Button extends Toggle_Button {
            constructor(spec, add, make) {
                spec.states = [ "+", "-" ];
                spec.state = spec.state || "-";
                super(spec);
                this.add_class("plus-minus toggle-button");
                var state = this.set("state", spec.state);
            }
        }
        module.exports = Plus_Minus_Toggle_Button;
    }, {
        "../html-core/html-core": 83,
        "./toggle-button": 69
    } ],
    57: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var Button = require("./button");
        var Item = require("./item");
        var Collection = jsgui.Collection;
        var Data_Value = jsgui.Data_Value;
        class Popup_Menu_Button extends Button {
            constructor(spec, add, make) {
                spec.no_compose = true;
                super(spec);
                this.__type_name = "popup_menu_button";
                this.add_class("popup-menu-button");
                var context = this.context;
                var that = this;
                this.states = [ "closed", "open" ];
                this.state = new Data_Value("closed");
                this.i_state = 0;
                var active_fields = this.active_fields = {};
                active_fields.states = this.states;
                active_fields.state = this.state;
                active_fields.i_state = this.i_state;
                var compose = () => {
                    this.text = spec.text || spec.label || "";
                    var root_menu_item = new Item({
                        context: context,
                        item: this.text
                    });
                    that.add(root_menu_item);
                    that.root_menu_item = root_menu_item;
                    if (spec.items) {
                        this.items = new Collection(spec.items);
                        each(this.items, item => {
                            var menu_item = new Item({
                                context: context,
                                item: item
                            });
                            root_menu_item.inner.add(menu_item);
                        });
                    }
                    var ctrl_fields = {
                        root_menu_item: root_menu_item._id()
                    };
                    this.dom.attrs["data-jsgui-fields"] = stringify(active_fields).replace(/"/g, "'");
                    this.dom.attrs["data-jsgui-ctrl-fields"] = stringify(ctrl_fields).replace(/"/g, "'");
                };
                if (!spec.abstract && !spec.el) {
                    compose();
                }
                if (spec.el) {
                    compose();
                }
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var root_menu_item = this.root_menu_item;
                    console.log("Popup_Menu_Button activate");
                    var that = this;
                    this.state.on("change", function(e_change) {
                        var val = e_change.value;
                        root_menu_item.state.set(val);
                    });
                    root_menu_item.on("click", function(e_click) {
                        var new_i_state = that.i_state + 1;
                        if (new_i_state === that.states.length) {
                            new_i_state = 0;
                        }
                        that.i_state = new_i_state;
                        that.state.set(that.states[new_i_state]);
                    });
                }
            }
        }
        module.exports = Popup_Menu_Button;
    }, {
        "../html-core/html-core": 83,
        "./button": 34,
        "./item": 48
    } ],
    58: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        var Radio_Button = require("./radio-button");
        class Radio_Button_Group extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "radio_button_group";
                this.add_class("radio-button-group");
                var context = this.context;
                var that = this;
                if (!spec.abstract && !spec.el) {
                    var id = this._id();
                    var items = this.get("items").value();
                    each(items, function(v, i) {
                        var radio_button = new Radio_Button({
                            context: context,
                            name: id,
                            text: v,
                            value: v
                        });
                        that.add(radio_button);
                    });
                }
            }
            activate() {
                console.log("1) Activate radio_button_group");
                if (!this.__active) {
                    var that = this;
                    super.activate();
                    var ctrl_checked;
                    console.log("2) Activate radio_button_group");
                    this.content.each(function(ctrl, i) {
                        ctrl.on("change", false, function(e_change) {
                            ctrl_checked = ctrl;
                            that.raise("change", {
                                checked: ctrl_checked
                            });
                        });
                    });
                }
            }
        }
        module.exports = Radio_Button_Group;
    }, {
        "../html-core/html-core": 83,
        "./radio-button": 59
    } ],
    59: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        var fields = {
            name: String,
            text: String,
            value: String,
            checked: Boolean
        };
        class Radio_Button extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "radio_button";
                this.add_class("radio-button");
                var context = this.context;
                var that = this;
                if (!spec.abstract && !spec.el) {
                    var name = this.get("name").value();
                    var html_radio = new Control({
                        context: context
                    });
                    html_radio.set("dom.tagName", "input");
                    html_radio.set("dom.attributes.type", "radio");
                    html_radio.set("dom.attributes.name", name);
                    html_radio.set("dom.attributes.id", html_radio._id());
                    var html_label = new Control({
                        context: context
                    });
                    html_label.set("dom.tagName", "label");
                    var text_value = that.get("text").value();
                    if (is_defined(text_value)) {
                        html_label.add(text_value);
                    }
                    html_label.set("dom.attributes.for", html_radio._id());
                    that.add(html_radio);
                    that.add(html_label);
                    that.set("radio", html_radio);
                    that.set("label", html_label);
                    that.set("dom.attributes.data-jsgui-fields", stringify({
                        value: that.get("value")
                    }).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));
                }
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var radio = this.get("radio");
                    var el_radio = radio.dom.el.value();
                    var label = this.get("label");
                    var that = this;
                    radio.on("change", function(e_change) {
                        if (el_radio.checked) {
                            that.raise("change");
                        }
                    });
                }
            }
        }
        module.exports = Radio_Button;
    }, {
        "../html-core/html-core": 83
    } ],
    60: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var Scrollbar = require("./scrollbar");
        var H_Scrollbar = Scrollbar.H, V_Scrollbar = Scrollbar.V;
        class Scroll_View extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "toggle_button";
                this.add_class("scrollbar");
                if (!spec.abstract && !spec.el) {
                    var inner_view = new Control({
                        context: this.context
                    });
                    var h_scrollbar = new H_Scrollbar({
                        context: this.context
                    });
                    var v_scrollbar = new V_Scrollbar({
                        context: this.context
                    });
                    this.add(inner_view);
                    this.add(h_scrollbar);
                    this.add(v_scrollbar);
                    this.active();
                }
                var that = this;
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var that = this;
                }
            }
        }
        module.exports = Scroll_View;
    }, {
        "../html-core/html-core": 83,
        "./scrollbar": 61
    } ],
    61: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var Button = require("./button");
        class Scrollbar extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "scrollbar";
                this.active();
                var that = this;
                var context = this.context;
                if (!spec.abstract && !spec.el) {
                    this.add_class("scrollbar");
                    var btn_negitive = new Button({
                        context: context
                    });
                    var scroll_area = new Control({
                        context: context
                    });
                    var draggable_scroller = new Control({
                        context: context
                    });
                    var btn_positive = new Button({
                        context: context
                    });
                    this.add(btn_negitive);
                    scroll_area.add(draggable_scroller);
                    this.add(scroll_area);
                    this.add(btn_positive);
                }
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var that = this;
                }
            }
        }
        class Horizontal_Scrollbar extends Scrollbar {
            constructor(spec) {
                this.__direction = "horizontal";
                super(spec);
            }
        }
        class Vertical_Scrollbar extends Scrollbar {
            constructor(spec) {
                this.__direction = "vertical";
                super(spec);
            }
        }
        Scrollbar.H = Scrollbar.Horizontal = Horizontal_Scrollbar;
        Scrollbar.V = Scrollbar.Vertical = Vertical_Scrollbar;
        module.exports = Scrollbar;
    }, {
        "../html-core/html-core": 83,
        "./button": 34
    } ],
    62: [ function(require, module, exports) {
        var fields = [ [ "value", Object ], [ "field", String ], [ "meta_field", String ] ];
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        class Single_Line extends Control {
            constructor(spec) {
                super(spec);
                this.add_class("single-line");
                this.__type_name = "single_line";
                var value = this.value;
                var display_value;
                var meta_field = this.get("meta_field");
                if (meta_field) {
                    display_value = value.meta.get(meta_field.value());
                }
                var el = this.dom.el;
                if (!el) {
                    var span = new jsgui.span({
                        context: this.context
                    });
                    if (display_value) {
                        span.add(display_value);
                    }
                    this.add(span);
                    this.set("span", span);
                }
            }
            activate() {
                super.activate();
                var content = this.content;
                var span = content.get(0);
                var val = span.dom.el.innerHTML;
                this.value = val;
            }
        }
        module.exports = Single_Line;
    }, {
        "../html-core/html-core": 83
    } ],
    63: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Toggle_Button = require("./toggle-button");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        class Start_Stop_Toggle_Button extends Toggle_Button {
            constructor(spec, add, make) {
                spec.states = [ "start", "stop" ];
                spec.state = spec.state || "start";
                super(spec);
                this.__type_name = "start_stop_toggle_button";
                this.add_class("start-stop toggle-button");
                this.state = spec.state;
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    console.log("activate Start_Stop_Toggle_Button");
                    var that = this;
                    this.on("change", function(e_change) {
                        var name = e_change.name;
                        var value = e_change.value;
                        if (name === "state") {
                            if (value === "stop") {
                                that.raise("start");
                            }
                            if (value === "start") {
                                that.raise("stop");
                            }
                        }
                    });
                }
            }
        }
        module.exports = Start_Stop_Toggle_Button;
    }, {
        "../html-core/html-core": 83,
        "./toggle-button": 69
    } ],
    64: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Radio_Button_Group = require("./radio-button-group");
        var Panel = require("./panel");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var fp = jsgui.fp;
        var group = jsgui.group;
        class Tabs extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "tabs";
                this.add_class("tabs");
                var context = this.context;
                var that = this;
                if (!spec.abstract && !spec.el) {
                    var tabs = this.get("tabs").value();
                    var rbg_items = [];
                    var panels = [];
                    var t_panel;
                    each(tabs, function(tab) {
                        var t_tab = tof(tab);
                        if (t_tab === "string") {
                            rbg_items.push(tab);
                            t_panel = new Panel({
                                context: context,
                                name: tab
                            });
                            t_panel.add_class("hidden");
                            panels.push(t_panel);
                        }
                    });
                    var rbg = new Radio_Button_Group({
                        context: context,
                        items: rbg_items
                    });
                    rbg.add_class("horizontal");
                    this.set("rbg", rbg);
                    this.add(rbg);
                    each(panels, function(panel) {
                        that.add(panel);
                    });
                }
            }
            activate() {
                console.log("1) Activate Tabs");
                if (!this.__active) {
                    console.log("2) Activate Tabs");
                    var that = this;
                    super.activate();
                    var prev_showing_panel, showing_panel;
                    var rbg = this.get("rbg");
                    rbg.on("change", false, function(e_change) {
                        var checked_index = e_change.checked._index;
                        prev_showing_panel = showing_panel;
                        showing_panel = that.panel(checked_index);
                        if (prev_showing_panel) prev_showing_panel.hide();
                        showing_panel.show();
                        var panel_name = showing_panel.get("name");
                        e_change.tab_name = panel_name + "";
                        that.raise("change", e_change);
                    });
                }
            }
        }
        module.exports = Tabs;
    }, {
        "../html-core/html-core": 83,
        "./panel": 55,
        "./radio-button-group": 58
    } ],
    65: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Text_Input = require("./text-input");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var fields = [ [ "text", String ], [ "name", String ], [ "value", String ], [ "type", String ] ];
        class Text_Field extends Control {
            constructor(spec) {
                super(spec);
                this.add_class("field");
                var left = new jsgui.div({
                    context: this.context
                });
                left.add_class("left");
                var right = new jsgui.div({
                    context: this.context
                });
                right.add_class("right");
                this.add(left);
                this.add(right);
                var clearall = new jsgui.div({
                    context: this.context
                });
                clearall.add_class("clearall");
                this.add(clearall);
                var label = new jsgui.label({
                    context: this.context
                });
                var text = this.get("text");
                label.add(text.value());
                var textInput = new Text_Input({
                    context: this.context
                });
                var tiid = textInput._id();
                textInput.dom.attributes.id = tiid;
                textInput.dom.attributes.name = this.name;
                label.dom.attributes.for = tiid;
                textInput.dom.attributes.type = spec.type;
                left.add(label);
                right.add(textInput);
            }
        }
        module.exports = Text_Field;
    }, {
        "../html-core/html-core": 83,
        "./text-input": 66
    } ],
    66: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var fields = [ [ "value", String ], [ "type", String ] ];
        class Text_Input extends Control {
            constructor(spec) {
                this._super(spec);
                this.set("dom.tagName", "input");
                this.set("dom.attributes.type", "input");
            }
        }
        module.exports = Text_Input;
    }, {
        "../html-core/html-core": 83
    } ],
    67: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var fields = [ [ "text", String ] ];
        class Title_Bar extends Control {
            constructor(spec) {
                super(spec);
                this.add_class("title bar");
                var span = new jsgui.span({
                    context: this.context
                });
                span.add(this.text);
                this.add(span);
            }
        }
        module.exports = Title_Bar;
    }, {
        "../html-core/html-core": 83
    } ],
    68: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var Panel = require("./panel");
        var Title_Bar = require("./title-bar");
        var fields = {
            title: String
        };
        class Titled_Panel extends Panel {
            constructor(spec) {
                super(spec);
                this.__type_name = "titled_panel";
                if (!spec.abstract && !spec.el) {
                    var title_bar = new Title_Bar({
                        context: this.context,
                        text: this.title
                    });
                    title_bar.active();
                    this.add(title_bar);
                    var inner_control = new Control({
                        context: this.context
                    });
                    inner_control.active();
                    this.add(inner_control);
                }
            }
            activate() {
                super.activate();
                var title_bar = this.title_bar;
                var inner_control = this.inner_control;
                console.log("title_bar", title_bar);
                console.log("inner_control", inner_control);
            }
        }
        module.exports = Titled_Panel;
    }, {
        "../html-core/html-core": 83,
        "./panel": 55,
        "./title-bar": 67
    } ],
    69: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var fields = [ [ "text", String ], [ "state", String ], [ "states", Array ] ];
        class Toggle_Button extends Control {
            constructor(spec, add, make) {
                spec = spec || {};
                spec.__type_name = spec.__type_name || "toggle_button";
                super(spec);
                this.add_class("toggle-button");
                this.active();
                var spec_state = spec.state, state, spec_states = spec.states, states;
                var that = this;
                var active_fields;
                if (spec_state) {
                    state = this.state = spec.state;
                    if (!active_fields) active_fields = {};
                    active_fields.state = state;
                    if (!spec.abstract && !spec.el) {
                        var span_state = new jsgui.span({
                            context: this.context
                        });
                        span_state.active();
                        span_state.add(state + "");
                        that.add(span_state);
                        that.span_state = span_state;
                    }
                } else {}
                if (spec_states) {
                    states = this.states = spec_states;
                    if (!active_fields) active_fields = {};
                    active_fields.states = states;
                } else {}
                if (active_fields && typeof document === "undefined") {
                    this.dom.attributes["data-jsgui-fields"] = stringify(active_fields).replace(/"/g, "'");
                    this.dom.attributes["data-jsgui-ctrl-fields"] = stringify({
                        span_state: this.span_state._id()
                    }).replace(/"/g, "'");
                }
            }
            get state() {
                return this._state;
            }
            set state(value) {
                var span_state = this.span_state;
                this._state = value;
                var that = this;
                if (span_state) {
                    span_state.clear();
                    var tn_new_value = new jsgui.textNode({
                        context: that.context,
                        text: value
                    });
                    span_state.add(tn_new_value);
                }
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    console.log("toggle button activate");
                    var that = this;
                    this.on("click", function(e_click) {
                        console.log("toggle button clicked");
                        var state = that.state;
                        var states = that.states;
                        var i_current_state;
                        if (tof(states) === "array") {
                            each(states, function(i_state, i) {
                                if (i_state == state) {
                                    i_current_state = i;
                                }
                            });
                            var i_next_state = i_current_state + 1;
                            if (i_next_state == states.length) i_next_state = 0;
                            var str_next_state = states[i_next_state];
                            console.log("str_next_state", str_next_state);
                            that.state = str_next_state;
                        } else {
                            throw "stop";
                        }
                    });
                }
            }
        }
        module.exports = Toggle_Button;
    }, {
        "../html-core/html-core": 83
    } ],
    70: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Plus_Minus_Toggle_Button = require("./plus-minus-toggle-button");
        var Vertical_Expander = require("./vertical-expander");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        var fields = [ [ "toggle_button", Control ], [ "inner_control", Control ], [ "expander", Control ] ];
        class Tree_Node extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "tree_node";
                if (!this._abstract) {
                    if (typeof document == "undefined") {
                        this.add_class("tree-node");
                        var spec_state = spec.state, state;
                        if (spec.img_src) {
                            var img_src = this.img_src;
                        }
                        if (spec.text) {
                            this.set("text", spec.text);
                        }
                        if (spec_state) {
                            if (spec_state == "expanded" || spec_state == "contracted") {
                                this.state = spec_state;
                            } else {
                                throw 'spec.state expects "expanded" or "contracted".';
                            }
                        } else {
                            this.state = "expanded";
                        }
                        var top_line = add(Control({
                            class: "top-line"
                        }));
                        var plus_minus = make(Plus_Minus_Toggle_Button({}));
                        top_line.add(plus_minus);
                        plus_minus.hide();
                        var img_src = this.img_src;
                        var img = make(jsgui.img({}));
                        img.dom.attributes.src = img_src;
                        top_line.add(img);
                        var span = make(jsgui.span({}));
                        var text = this.text;
                        span.add(text);
                        top_line.add(span);
                        var clearall = add(Control({
                            class: "clearall"
                        }));
                        var expander = add(Vertical_Expander({}));
                        var inner_control = make(Control({
                            class: "inner"
                        }));
                        expander.add(inner_control);
                        var inner_control_content = inner_control.content;
                        inner_control_content.on("change", function(e_change) {
                            var l = inner_control_content.length();
                            if (l > 0) {
                                plus_minus.show();
                            }
                        });
                        this.toggle_button = plus_minus;
                        this.inner_control = inner_control;
                        this.expander = expander;
                        var ctrl_fields = {
                            toggle_button: plus_minus._id(),
                            inner_control: inner_control._id(),
                            expander: expander._id()
                        };
                        this.set("dom.attributes.data-jsgui-ctrl-fields", stringify(ctrl_fields).replace(/"/g, "'"));
                        this.active();
                    }
                }
            }
            activate() {
                super.activate();
                var toggle_button = this.toggle_button;
                var inner_control = this.inner_control;
                var expander = this.expander;
                toggle_button.on("toggle", function(e_toggle) {
                    console.log("tree-node toggle", e_toggle);
                    expander.toggle();
                });
            }
        }
        module.exports = Tree_Node;
    }, {
        "../html-core/html-core": 83,
        "./plus-minus-toggle-button": 56,
        "./vertical-expander": 72
    } ],
    71: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        var Button = require("./button");
        class Up_Down_Arrow_Buttons extends Control {
            constructor(spec) {
                var make = this.make;
                this._super(spec);
                this.add_class("up-down arrow buttons");
                this.__type_name = "up_down_arrow_buttons";
                var btn_up = new Button({
                    context: this.context,
                    text: "up"
                });
                var btn_down = new Button({
                    context: this.context,
                    text: "down"
                });
                this.add(btn_up);
                this.add(btn_down);
                this.set("btn_up", btn_up);
                this.set("btn_down", btn_down);
                var that = this;
            }
            activate() {
                super.activate();
                var that = this;
                var btn_up = this.btn_up;
                var btn_down = this.btn_down;
                var that = this;
                btn_up.on("click", function(e_click) {
                    that.raise("up");
                });
                btn_down.on("click", function(e_click) {
                    that.raise("down");
                });
            }
        }
        module.exports = Up_Down_Arrow_Buttons;
    }, {
        "../html-core/html-core": 83,
        "./button": 34
    } ],
    72: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
        var Control = jsgui.Control;
        class Vertical_Expander extends Control {
            constructor(spec) {
                super(spec);
                this.add_class("vertical expander");
                this.__type_name = "vertical_expander";
                this.set("states", [ "open", "closed" ]);
                this.set("state", spec.state || "open");
            }
            activate() {
                console.log("Vertical Expander activate");
                super.activate();
                var that = this;
                var orig_height;
                var el = that.dom.el;
                var ui_close = function() {
                    var h = el.childNodes[0].offsetHeight;
                    console.log("h", h);
                    orig_height = h;
                    el.style.height = orig_height + "px";
                    el.style.overflow = "hidden";
                    el.style.transition = "height 0.08s linear";
                    setTimeout(function() {
                        el.style.height = "0px";
                    }, 0);
                };
                var ui_open = function() {
                    el.style.height = orig_height + "px";
                    var fnTransitionEnd = function(e_end) {
                        console.log("fnTransitionEnd");
                        el.style.overflow = "visible";
                        el.removeEventListener("transitionend", fnTransitionEnd);
                    };
                    el.addEventListener("transitionend", fnTransitionEnd, false);
                };
                var state = this.get("state");
                state.on("change", function(e_change) {
                    console.log("Vertical_Expander state change", e_change);
                    var val = e_change.value;
                    if (val == "closed") {
                        ui_close();
                    }
                    if (val == "open") {
                        ui_open();
                    }
                });
            }
            toggle() {
                console.log("vertical-expander toggle");
                var state = this.state;
                var v_state = state.value();
                console.log("state", state);
                if (v_state == "open") {
                    state.set("closed");
                }
                if (v_state == "closed") {
                    state.set("open");
                }
            }
        }
        module.exports = Vertical_Expander;
    }, {
        "../html-core/html-core": 83
    } ],
    73: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var factory = require("./factory");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        class Array_Viewer extends Control {
            constructor(spec) {
                var make = this.make;
                this._super(spec);
                this.add_class("array-viewer");
                this.__type_name = "array_viewer";
                if (!this.factory) this.factory = factory;
                var req = this._context.req;
                if (is_defined(spec.value)) {
                    this.set("value", spec.value);
                }
                var that = this;
                if (!spec.el) {
                    var ctrlOpen = new Control({
                        context: this._context
                    });
                    ctrlOpen.set("dom.attributes.class", "array-open");
                    ctrlOpen.content.add("[");
                    var ctrlInner = new Control({
                        context: this._context
                    });
                    ctrlInner.set("dom.attributes.class", "array-inner");
                    var ctrlClose = new Control({
                        context: this._context
                    });
                    ctrlClose.set("dom.attributes.class", "array-close");
                    ctrlClose.content.add("]");
                    this.add(ctrlOpen);
                    this.add(ctrlInner);
                    this.add(ctrlClose);
                    this.set("inner", ctrlInner);
                    this.refresh_internal();
                }
                this.add_event_listener("change", function(e) {
                    var fieldName = e[0];
                    var fieldValue = e[1];
                    that.refresh_internal();
                });
            }
            refresh_internal() {
                var inner = this.get("inner");
                var value = this.get("value");
                var first = true;
                var context = this._context;
                var that = this;
                each(value, function(i, v) {
                    var comma_space;
                    if (!first) {
                        comma_space = new jsgui.span({
                            context: that._context
                        });
                        comma_space.content.push(", ");
                        inner.add(comma_space);
                    }
                    var ctrl = that.factory(v, context);
                    inner.add(ctrl);
                    first = false;
                });
            }
            activate() {
                this._super();
                var content = this.content;
                var ctrl_open = this.set("open", content.get(0));
                var ctrl_close = this.set("close", content.get(2));
                var hover_class = "bg-light-yellow";
                var group_open_close = jsgui.group_hover_class([ ctrl_open, ctrl_close ], hover_class);
                var that = this;
                group_open_close.selectable(this);
                var ctrl_inner = content.get(1);
                var prev_comma_space;
                ctrl_inner.content.each(function(i, v) {
                    var is_comma_space = i % 2;
                    if (is_comma_space) {
                        prev_comma_space = v;
                    } else {
                        if (prev_comma_space) {
                            prev_comma_space.selectable(v);
                        }
                    }
                });
            }
        }
        module.exports = Array_Viewer;
    }, {
        "../../html-core/html-core": 83,
        "./factory": 74
    } ],
    74: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var Object_Viewer = require("./object");
        var Array_Viewer = require("./array");
        var String_Viewer = require("./string");
        var Number_Viewer = require("./number");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        var map_modules = {};
        var that = this;
        var create = function(obj, context) {
            var tobj = tof(obj);
            if (tobj == "object") {
                var res = new Object_Viewer({
                    context: context,
                    value: obj
                });
                return res;
            }
            if (tobj == "array") {
                var res = new Array_Viewer({
                    context: context,
                    value: obj
                });
                return res;
            }
            if (tobj == "string") {
                var res = new String_Viewer({
                    context: context,
                    value: obj
                });
                return res;
            }
            if (tobj == "number") {
                var res = new Number_Viewer({
                    context: context,
                    value: obj
                });
                return res;
            }
            if (tobj == "data_value") {
                var tval = tof(val);
                return create(val, context);
                return res;
            }
        };
        module.exports = create;
    }, {
        "../../html-core/html-core": 83,
        "./array": 73,
        "./number": 75,
        "./object": 77,
        "./string": 78
    } ],
    75: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        class Number_Viewer extends Control {
            constructor(spec) {
                super(spec);
                var make = this.make;
                this.add_class("number-viewer");
                this.__type_name = "number_viewer";
                var that = this;
                var span = new jsgui.span({
                    context: this.context
                });
                if (is_defined(spec.value)) {
                    this.set("value", spec.value);
                }
                this.add(span);
                this.set("span", span);
                this.refresh_internal();
            }
            refresh_internal() {
                var value = this.get("value");
                var span = this.get("span");
                var span_content = span.content;
                var tval = tof(value);
                var context = this._context;
                var content = this.content;
                if (tval == "data_value") {
                    span_content.clear();
                    span_content.push(value.value());
                }
                if (tval == "number") {
                    span_content.clear();
                    span_content.push(value);
                }
            }
            activate() {
                this._super();
                var that = this;
                var hover_class = "bg-light-yellow";
                var span = this.get("span");
                var span_content = span.content;
                var content_val = span_content.get(0).value();
                var num = JSON.parse(content_val);
                this.set("value", num);
                that.selectable();
                jsgui.hover_class(this, hover_class);
            }
        }
        module.exports = Number_Viewer;
    }, {
        "../../html-core/html-core": 83
    } ],
    76: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var factory = require("./factory");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        class Object_KVP_Viewer extends Control {
            constructor(spec) {
                super(spec);
                this.add_class("object-kvp-viewer");
                this.__type_name = "object_kvp_viewer";
                var that = this;
                if (is_defined(spec.key)) {
                    this.set("key", spec.key);
                }
                var val;
                if (is_defined(spec.value)) {
                    val = spec.value;
                    this.set("value", spec.value);
                }
                var mode = this.mode;
                if (!spec.mode) {
                    spec.mode = "json";
                }
                if (!mode) {
                    mode = spec.mode;
                    this.mode = mode;
                }
                this.add_class(mode);
                if (!spec.el) {
                    if (mode == "json") {}
                    var ctrl_string_key = new that.String({
                        context: this._context,
                        text: spec.key,
                        mode: mode
                    });
                    var ctrl_value_container = new Control({
                        context: this.context
                    });
                    ctrl_value_container.add_class("object-kvp-value-viewer");
                    var ctrl_value;
                    if (is_defined(val)) {
                        var t_val = tof(val);
                        if (t_val == "string") {
                            ctrl_value = new that.String({
                                context: this.context,
                                value: val
                            });
                        }
                        if (t_val == "number") {
                            ctrl_value = new that.Number({
                                context: this.context,
                                value: val
                            });
                        }
                        if (ctrl_value) {
                            ctrl_value_container.add(ctrl_value);
                        }
                    }
                    var ctrlClose = new Control({
                        context: this.context
                    });
                    ctrlClose.add_class("object-close");
                    ctrlClose.content.add("}");
                    this.ctrl_key = ctrl_string_key;
                    this.ctrl_value = ctrl_value;
                    this.add(ctrl_string_key);
                    if (mode == "json") {
                        var span_key_colon_space = new jsgui.span({
                            context: this.context
                        });
                        span_key_colon_space.content.add(": ");
                        this.add(span_key_colon_space);
                    }
                    this.add(ctrl_value_container);
                }
            }
            refresh_internal() {
                var key = this.key;
                var value = this.value;
                var content = this.content;
                var key_content = ctrl_key.span;
                if (key) {
                    key_content.add(key);
                    var vcon = ctrl_value.content;
                    vcon.clear();
                    var ctrl_viewer = this.factory(value, this.context);
                    vcon.push(ctrl_viewer);
                }
            }
            activate(el) {
                var mode = this.mode;
                var hover_class = "bg-light-yellow";
                this._super(el);
                var el = el || this.dom.el;
                var cns = el.childNodes;
                var content = this.content;
                var clength = content.length;
                var ctrl_key, ctrl_value, ctrl_comma;
                if (mode === "json") {
                    if (clength === 3 || clength === 4) {
                        var content_key = content.get(0);
                        ctrl_key = this.ctrl_key = content_key;
                        ctrl_value = this.ctrl_value = content.get(2);
                    }
                    if (clength == 4) {
                        ctrl_comma = this.ctrl_comma = content.get(4);
                    }
                } else {
                    ctrl_key = this.ctrl_key;
                    ctrl_value = this.ctrl_value;
                }
                if (clength > 4) {
                    throw "stop";
                }
                console.log("ctrl_key", ctrl_key);
                var key_content = ctrl_key.content;
                var value_value = ctrl_value.value;
                console.log("value_value", value_value);
                var ctrl_key_open_quote, ctrl_key_content, ctrl_key_close_quote, ctrl_key_colon_space;
                if (key_content.length === 4) {
                    ctrl_key_open_quote = key_content.get(0);
                    ctrl_key_content = key_content.get(1);
                    ctrl_key_close_quote = key_content.get(2);
                    ctrl_key_colon_space = key_content.get(3);
                    var group_key_quotes = jsgui.group_hover_class([ ctrl_key_open_quote, ctrl_key_close_quote ], hover_class);
                    var that = this;
                    group_key_quotes.click_to_select(this);
                    jsgui.hover_class(ctrl_key_content, hover_class);
                    ctrl_key_content.click_to_select();
                    ctrl_key_colon_space.click_to_select(this);
                }
            }
        }
        module.exports = Object_KVP_Viewer;
    }, {
        "../../html-core/html-core": 83,
        "./factory": 74
    } ],
    77: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var Object_KVP_Viewer = require("./object-kvp");
        var factory = require("./factory");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        class Object_Viewer extends Control {
            constructor(spec) {
                var make = this.make;
                super(spec);
                if (!this.factory) this.factory = factory;
                this.add_class("object-viewer");
                this.__type_name = "object_viewer";
                var req = this.context.req;
                if (is_defined(spec.value)) {
                    this.value = spec.value;
                }
                if (!spec.el) {
                    var ctrlOpen = new Control({
                        context: this.context
                    });
                    ctrlOpen.add_class("object-open");
                    ctrlOpen.content.add("{");
                    var ctrlOpenID = ctrlOpen._id();
                    var ctrlInner = new Control({
                        context: this.context
                    });
                    ctrlInner.add_class("object-inner");
                    var ctrlClose = new Control({
                        context: this.context
                    });
                    ctrlClose.add_class("object-close");
                    ctrlClose.content.add("}");
                    var ctrlCloseID = ctrlClose._id();
                    this.add(ctrlOpen);
                    this.add(ctrlInner);
                    this.add(ctrlClose);
                    this.inner = ctrlInner;
                    var ctrl_fields = {
                        open: ctrlOpenID,
                        close: ctrlCloseID,
                        inner: ctrlInner._id()
                    };
                    this.set("dom.attributes.data-jsgui-ctrl-fields", stringify(ctrl_fields).replace(/"/g, "'"));
                    this.refresh_internal();
                }
                var that = this;
            }
            refresh_internal() {
                var value = this.value;
                var inner = this.inner;
                inner.clear();
                var context = this._context;
                var that = this;
                var first = true;
                var prev_kvp;
                each(value, function(v, i) {
                    if (!first) {
                        var comma = new jsgui.span({
                            context: context
                        });
                        comma.content.push(",");
                        prev_kvp.content.push(comma);
                    }
                    var kvp_viewer = new Object_KVP_Viewer({
                        context: context,
                        key: i,
                        value: v
                    });
                    var cInternal = that.factory(v, context);
                    inner.add(kvp_viewer);
                    first = false;
                    prev_kvp = kvp_viewer;
                });
            }
            activate() {
                super.activate();
                var ctrl_open = this.open;
                var ctrl_close = this.close;
                var ctrl_inner = this.inner;
                var hover_class = "bg-light-yellow";
                var group_open_close = jsgui.group_hover_class([ ctrl_open, ctrl_close ], hover_class);
                var that = this;
                group_open_close.selectable(this);
                var prev_comma;
                ctrl_inner.content.each(function(ctrl_kvp, i) {
                    var ckvp = ctrl_kvp.content;
                    if (prev_comma) {
                        prev_comma.click(function(e) {
                            ctrl_kvp.action_select_only();
                        });
                    }
                    if (ckvp.length() == 3) {
                        var comma = ckvp.get(2);
                        prev_comma = comma;
                    }
                });
                this.on("change", function(e_change) {
                    that.refresh_internal();
                });
                console.log("this._bound_events", this._bound_events);
            }
        }
        module.exports = Object_Viewer;
    }, {
        "../../html-core/html-core": 83,
        "./factory": 74,
        "./object-kvp": 76
    } ],
    78: [ function(require, module, exports) {
        var jsgui = require("../../html-core/html-core");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var group = jsgui.group;
        var extend = jsgui.extend;
        class String_Viewer extends Control {
            constructor(spec) {
                var make = this.make;
                this._super(spec);
                this.add_class("string-viewer");
                this.__type_name = "string_viewer";
                var that = this;
                var el = spec.el;
                console.log("string viewer init el", el);
                if (is_defined(spec.value)) {
                    this.set("value", spec.value);
                }
                var mode = spec.mode = spec.mode || "json";
                if (!el) {
                    if (mode == "json") {
                        var span_open = new jsgui.span({
                            context: this._context
                        });
                        span_open.add('"');
                        this.add(span_open);
                    }
                    var span = new jsgui.span({
                        context: this._context
                    });
                    span.set("dom.attributes.class", "single-line");
                    this.add(span);
                    this.set("span", span);
                    span.add(spec.text);
                    if (mode == "json") {
                        var span_close = new jsgui.span({
                            context: this._context
                        });
                        span_close.add('"');
                        this.add(span_close);
                    }
                    if (typeof document === "undefined") {
                        extend(this._fields = this._fields || {}, {
                            mode: mode
                        });
                    }
                }
            }
            refresh_internal() {
                var value = this.get("value");
                var span = this.get("span");
                var span_content = span.content;
                var tval = tof(value);
                var context = this._context;
                var content = this.content;
                if (tval == "data_value") {
                    span_content.clear();
                    span_content.push(value.value());
                }
            }
            activate() {
                this._super();
                var that = this;
                var content = this.content;
                var mode = this.get("mode");
                console.log("mode", mode);
                console.log("mode " + mode);
                if (mode == "json") {
                    var hover_class = "bg-light-yellow";
                    var ctrl_open = this.set("open", content.get(0));
                    console.log("ctrl_open", ctrl_open);
                    var span = this.set("span", content.get(1));
                    console.log("span", span);
                    var value = span.dom.el.innerHTML;
                    jsgui.hover_class(span, hover_class);
                    var ctrl_close = this.set("close", content.get(2));
                    var group_open_close = jsgui.group_hover_class([ ctrl_open, ctrl_close ], hover_class);
                    group_open_close.click(function(e) {
                        var ctrl_key = e.ctrlKey;
                        if (ctrl_key) {
                            that.action_select_toggle();
                        } else {
                            that.action_select_only();
                        }
                    });
                    span.selectable();
                }
                if (mode == "tabular") {
                    var span = this.get("span");
                    var value = span.dom.el.innerHTML;
                }
                this.set("value", value);
            }
        }
        module.exports = String_Viewer;
    }, {
        "../../html-core/html-core": 83
    } ],
    79: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var Horizontal_Menu = require("./horizontal-menu");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control;
        var fields = {
            title: String
        };
        class Window extends Control {
            constructor(spec, add, make) {
                super(spec);
                this.__type_name = "window";
                this.add_class("window");
                if (!spec.abstract && !spec.el) {
                    var div_relative = add(Control({
                        class: "relative"
                    }));
                    var title_bar = div_relative.add(make(Control({
                        class: "title bar"
                    })));
                    var dv_title = this.title;
                    var title_h2 = make(jsgui.h2());
                    title_bar.add(title_h2);
                    if (dv_title) {
                        var title = dv_title.value();
                        title_h2.add(title);
                    }
                    var inner_control = div_relative.add(make(Control({
                        class: "inner"
                    })));
                    this.inner_control = inner_control;
                    this.title_bar = title_bar;
                    this.ctrl_relative = div_relative;
                }
            }
            resizable() {
                this.set("resizable", "right-bottom");
                this.set("dom.attributes.data-jsgui-fields", "{'resizable': 'right-bottom'}");
            }
            activate() {
                if (!this.__active) {
                    super.activate();
                    var context = this.context;
                    var ctrl_relative = this.get("ctrl_relative");
                    var top_bar = this.title_bar;
                    top_bar.drag_handle_to(this);
                    var resizable = this.get("resizable");
                    if (resizable && resizable.value) resizable = resizable.value();
                    if (resizable == "right-bottom") {
                        var resize_handle = new Control({
                            class: "right-bottom resize-handle",
                            context: context
                        });
                        var size = this.size();
                        var resize_handle_width = 16;
                        var resize_handle_height = 16;
                        var x = size[0] - resize_handle_width;
                        var y = size[1] - resize_handle_height;
                        resize_handle.style({
                            left: x + "px",
                            top: y + "px"
                        });
                    }
                }
            }
            menu(menu_spec) {
                var h_menu_spec = {
                    value: menu_spec,
                    context: this.context
                };
                var h_menu = new Horizontal_Menu(h_menu_spec);
                var ic = this.inner_control;
                var ic_parent = ic.parent;
                h_menu.insert_before(ic);
                h_menu.active();
            }
        }
        module.exports = Window;
    }, {
        "../html-core/html-core": 83,
        "./horizontal-menu": 45
    } ],
    80: [ function(require, module, exports) {
        jsgui = require("../../client/client");
        page_context = new jsgui.Client_Page_Context({
            document: document
        });
        window.onload = function() {
            var early_load_and_activate = function() {
                page_context.update_Controls("toggle_button", jsgui.Toggle_Button);
                page_context.update_Controls("list", jsgui.List);
                page_context.update_Controls("item", jsgui.Item);
                page_context.update_Controls("combo_box", jsgui.Combo_Box);
                page_context.update_Controls("popup_menu_button", jsgui.Popup_Menu_Button);
                jsgui.activate(page_context);
            };
            early_load_and_activate();
        };
    }, {
        "../../client/client": 29
    } ],
    81: [ function(require, module, exports) {
        var jsgui = require("../lang/lang");
        var get_a_sig = jsgui.get_a_sig;
        var remove_sig_from_arr_shell = jsgui.remove_sig_from_arr_shell;
        var each = jsgui.each;
        var clone = jsgui.clone;
        var Evented_Class = jsgui.Evented_Class;
        var Data_Value = jsgui.Data_Value;
        var Data_Object = jsgui.Data_Object;
        var Collection = jsgui.Collection;
        var tof = jsgui.tof;
        var stringify = jsgui.stringify;
        class DOM_Attributes extends Evented_Class {
            constructor(spec) {
                super(spec);
            }
            set(key, value) {
                var old = this[key];
                this[key] = value;
                this.raise("change", {
                    key: key,
                    old: old,
                    new: value
                });
            }
        }
        class Control_DOM {
            constructor() {
                this.attrs = this.attributes = new DOM_Attributes();
            }
        }
        var fields = [ [ "content", "collection" ], [ "dom", "control_dom" ], [ "size", "size" ], [ "color", "color" ] ];
        class Control_Core extends Data_Object {
            constructor(spec) {
                spec = spec || {};
                spec.__type_name = spec.__type_name || "control";
                super(spec);
                this.mapListeners = {};
                this.__type = "control";
                var spec_content;
                this.dom = new Control_DOM();
                if (!this._abstract) {
                    var tagName = spec.tagName || spec.tag_name || "div";
                    this.dom.tagName = tagName;
                    this._icss = {};
                    spec_content = spec.content;
                    if (spec_content) {
                        var tsc = tof(spec_content);
                        if (tsc == "array") {
                            throw "Content array not yet supported here.";
                        } else if (tsc == "string" || tsc == "control") {
                            this.content.add(spec_content);
                        }
                    }
                    if (spec.el) {
                        this.dom.el = spec.el;
                    }
                    var that = this;
                    var context = this.context;
                    if (context) {
                        if (context.register_control) context.register_control(this);
                    } else {}
                    if (spec["class"]) {
                        this.dom.attrs.set("class", spec["class"]);
                    }
                    var content = this.content = new Collection({});
                    var that = this;
                    var set_dom_size = function(size) {
                        var width = size[0].join("");
                        var height = size[1].join("");
                        that.style({
                            width: width,
                            height: height
                        });
                    };
                    var set_dom_color = function(color) {
                        var color_css_property = "background-color";
                        var out_color = output_processors["color"](color);
                        that.style(color_css_property, out_color);
                    };
                }
            }
            get size() {}
            set size(value) {}
            get color() {}
            set color(value) {}
            post_init(spec) {
                if (spec && spec.id === true) {
                    this.set("dom.attributes.id", this._id());
                }
            }
            _get_amalgamated_style(arr_contexts) {
                return clone(this._.style);
            }
            _get_rendered_inline_css_dict() {
                var ast = this.get_amalgamated_style();
                var inline_css_dict = get_inline_css_dict_from_style(ast);
                return inline_css_dict;
            }
            property_css_transition_duration(style_property_name) {
                if (this.has("_.s.transition")) {
                    var tr = this._.s.transition;
                    if (tr[style_property_name]) {
                        var dur = tr[style_property_name][0];
                        return dur;
                    }
                }
            }
            has(item_name) {
                var arr = item_name.split(".");
                var c = 0, l = arr.length;
                var i = this;
                var s;
                while (c < l) {
                    s = arr[c];
                    if (typeof i[s] == "undefined") {
                        return false;
                    }
                    i = i[s];
                    c++;
                }
                return i;
            }
            renderDomAttributes() {
                if (this.beforeRenderDomAttributes) {
                    this.beforeRenderDomAttributes();
                }
                var dom_attrs = this.dom.attributes;
                if (!dom_attrs) {
                    throw "expecting dom_attrs";
                } else {
                    if (this._ctrl_fields) {
                        var obj_ctrl_fields = {};
                        var keys = Object.keys(this._ctrl_fields);
                        var key;
                        for (var c = 0, l = keys.length; c < l; c++) {
                            key = keys[c];
                            if (key !== "_bound_events") {
                                obj_ctrl_fields[key] = this._ctrl_fields[key]._id();
                            }
                        }
                        dom_attrs.set("data-jsgui-ctrl-fields", stringify(obj_ctrl_fields).replace(/"/g, "'"));
                    }
                    if (this._fields) {
                        dom_attrs.set("data-jsgui-fields", stringify(this._fields).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));
                    }
                    var arr = [];
                    var dom_attrs_keys = Object.keys(dom_attrs);
                    var key, item;
                    for (var c = 0, l = dom_attrs_keys.length; c < l; c++) {
                        key = dom_attrs_keys[c];
                        if (key !== "_bound_events") {
                            item = dom_attrs[key];
                            arr.push(" ", key, '="', item, '"');
                        }
                    }
                    return arr.join("");
                }
            }
            renderBeginTagToHtml() {
                var tagName = this.dom.tagName;
                var res;
                if (tagName === false) {
                    res = "";
                } else {
                    res = [ "<", tagName, this.renderDomAttributes(), ">" ].join("");
                }
                return res;
            }
            renderEndTagToHtml() {
                var res;
                var tagName = this.dom.tagName;
                var noClosingTag = this.dom.noClosingTag;
                if (tagName === false || noClosingTag) {
                    res = "";
                } else {
                    res = [ "</", tagName, ">" ].join("");
                }
                return res;
            }
            renderHtmlAppendment() {
                return this.htmlAppendment || "";
            }
            renderEmptyNodeJqo() {
                return [ this.renderBeginTagToHtml(), this.renderEndTagToHtml(), this.renderHtmlAppendment() ].join("");
            }
            iterate_this_and_subcontrols(ctrl_callback) {
                ctrl_callback(this);
                var content = this.content;
                var that = this, tv;
                content.each(function(v) {
                    tv = tof(v);
                    if (tv == "string") {} else if (tv == "data_value") {} else {
                        if (v && v.iterate_this_and_subcontrols) {
                            v.iterate_this_and_subcontrols.call(v, ctrl_callback);
                        }
                    }
                });
            }
            all_html_render(callback) {
                if (callback) {
                    var that = this;
                    var arr_waiting_controls = [];
                    this.iterate_this_and_subcontrols(function(control) {
                        if (control.__status == "waiting") arr_waiting_controls.push(control);
                    });
                    if (arr_waiting_controls.length == 0) {
                        var html = this.all_html_render();
                        callback(null, html);
                    } else {
                        var c = arr_waiting_controls.length;
                        var complete = function() {
                            that.pre_all_html_render();
                            var dom = that.dom;
                            if (dom) {
                                var html = [ that.renderBeginTagToHtml(), that.all_html_render_internal_controls(), that.renderEndTagToHtml(), that.renderHtmlAppendment() ].join("");
                                callback(null, html);
                            }
                        };
                        each(arr_waiting_controls, function(control, i) {
                            control.on("ready", function(e_ready) {
                                c--;
                                if (c == 0) {
                                    complete();
                                }
                            });
                        });
                    }
                } else {
                    this.pre_all_html_render();
                    var dom = this.dom;
                    if (dom) {
                        return [ this.renderBeginTagToHtml(), this.all_html_render_internal_controls(), this.renderEndTagToHtml(), this.renderHtmlAppendment() ].join("");
                    }
                }
            }
            render_content() {
                var content = this.content;
                if (!content.length) {
                    console.log("!!!no content length!!!");
                    console.log("");
                    console.log(this);
                    console.log("");
                    console.trace();
                    console.log("content", content);
                    console.log("tof(content) " + tof(content));
                    throw "stop";
                }
                var contentLength = content.length();
                var res = new Array(contentLength);
                var tn, output;
                var arr = content._arr;
                var c, l = arr.length, n;
                for (c = 0; c < l; c++) {
                    n = arr[c];
                    tn = tof(n);
                    if (tn == "string") {
                        res.push(jsgui.output_processors["string"](n));
                    }
                    if (tn == "data_value") {
                        res.push(n._);
                    } else {
                        if (tn == "data_object") {
                            throw "stop";
                        } else {
                            res.push(n.all_html_render());
                        }
                    }
                }
                return res.join("");
            }
            all_html_render_internal_controls() {
                return this.render_content();
            }
            pre_all_html_render() {}
            compose() {}
            wait(callback) {
                setTimeout(function() {
                    callback();
                }, 0);
            }
            visible(callback) {
                this.style("display", "block", callback);
            }
            transparent(callback) {
                this.style("opacity", 0, callback);
            }
            opaque(callback) {
                return this.style({
                    opacity: 1
                }, callback);
            }
            chain(arr_chain, callback) {
                var pos_in_chain = 0;
                var that = this;
                var process_chain = function() {
                    if (pos_in_chain < arr_chain.length) {
                        var item = arr_chain[pos_in_chain];
                        var t_item = tof(item);
                        if (t_item == "array") {
                            var count = item.length;
                            var cb = function() {
                                count--;
                                if (count == 0) {
                                    pos_in_chain++;
                                    process_chain();
                                }
                            };
                            each(item, function(i, v) {
                                that.fn_call(v, function() {
                                    cb();
                                });
                            });
                        } else {
                            that.fn_call(item, function() {
                                pos_in_chain++;
                                process_chain();
                            });
                        }
                    } else {
                        if (callback) {
                            callback.call(that);
                        }
                    }
                };
                process_chain();
            }
            fn_call(call, callback) {
                var t = tof(call);
                var fn, params, that = this;
                if (t == "string") {
                    fn = this[call];
                    params = [];
                    if (callback) {
                        return fn.call(this, callback);
                    } else {
                        return fn.call(this);
                    }
                }
                if (t == "array") {
                    fn = this[call[0]];
                    params = call.slice(1);
                    if (callback) params.push(callback);
                    return fn.apply(this, params);
                }
                if (t == "object") {
                    var count = 0;
                    each(call, function(i, v) {
                        count++;
                    });
                    each(call, function(i, v) {
                        var cb = function() {
                            count--;
                            if (count == 0) {
                                callback.call(that);
                            }
                        };
                        that.fn_call([ i, v ], cb);
                    });
                }
            }
            transition(value, callback) {
                return this.style({
                    transition: value
                }, callback);
            }
            transit() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                var that = this;
                var unshelled_sig = remove_sig_from_arr_shell(sig);
                if (unshelled_sig == "[[n,s],o]") {
                    return this.transit(a[0][0], a[0][1]);
                }
                if (sig === "[[[n,s],o],f]") {
                    var transit = a[0];
                    var callback = a[1];
                    var duration_and_tf = transit[0];
                    var map_values = transit[1];
                    this.transit(duration_and_tf, map_values, callback);
                } else if (sig === "[[n,s],o,f]") {
                    var duration_and_tf = a[0];
                    var map_values = a[1];
                    var callback = a[2];
                    var transition = {};
                    each(map_values, function(i, v) {
                        transition[i] = duration_and_tf;
                    });
                    that.transition(transition);
                    each(map_values, function(i, v) {
                        that.style(i, v);
                    });
                } else if (a.length === 2) {
                    var duration_and_tf = a[0];
                    var duration_and_tf = a[0];
                    var map_values = a[1];
                    var transition = {};
                    each(map_values, function(i, v) {
                        transition[i] = duration_and_tf;
                    });
                    that.transition(transition);
                    each(map_values, function(i, v) {
                        that.style(i, v);
                    });
                }
            }
            add(new_content) {
                var tnc = tof(new_content);
                if (tnc == "array") {
                    var res = [], that = this;
                    each(new_content, function(i, v) {
                        res.push(that.add(v));
                    });
                    return res;
                } else {
                    if (new_content) {
                        if (tnc === "string") {} else {
                            if (!new_content.context) {
                                if (this.context) {
                                    new_content.context = this.context;
                                }
                            }
                        }
                        var inner_control = this.inner_control;
                        if (inner_control) {
                            return inner_control.content.add(new_content);
                        } else {
                            return this.content.add(new_content);
                        }
                    }
                }
            }
            insert_before(target) {
                var target_parent = target.parent;
                var target_index = target._index;
                var content = target_parent.content;
                content.insert(this, target_index);
            }
            toJSON() {
                var res = [];
                res.push("Control(" + stringify(this._) + ")");
                return res.join("");
            }
            style() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                var style_name, style_value, modify_dom = true;
                if (sig == "[s]") {
                    var styleName = a[0];
                    var el = this.dom.el;
                    var res = getComputedStyle(el)[styleName];
                    return res;
                }
                if (sig == "[s,s,b]") {
                    var styleName = a[0];
                    var styleValue = a[1];
                    var modifyDom = a[2];
                }
                if (sig == "[s,s]" || sig == "[s,n]") {
                    var styleName = a[0];
                    var styleValue = a[1];
                }
                if (styleName && typeof styleValue !== "undefined") {
                    this._icss[styleName] = styleValue;
                    var str_css = "";
                    each(this._icss, function(item_style_value, item_style_name) {
                        str_css = str_css + item_style_name + ":" + item_style_value + ";";
                    });
                    if (modify_dom) {}
                }
                var that = this;
                if (sig == "[o]") {
                    each(a[0], function(v, i) {
                        that.style(i, v, false);
                    });
                    var style = this.dom.attributes.style;
                    var el = this.value("dom.el");
                    if (el) {
                        el.style.cssText = style;
                    }
                }
            }
            active() {
                var id = this._id();
                var dom = this.dom;
                var dom_attributes = dom.attributes;
                if (!dom_attributes) {
                    dom_attributes = dom.get("attributes");
                } else {}
                dom_attributes["data-jsgui-id"] = new Data_Value({
                    value: id
                });
                dom_attributes["data-jsgui-type"] = new Data_Value({
                    value: this.__type_name
                });
                var el;
                if (dom.el) {
                    el = dom.el;
                }
                if (el) {
                    if (el.nodeType === 1) {
                        el.setAttribute("data-jsgui-id", id);
                        el.setAttribute("data-jsgui-type", this.__type_name);
                    }
                }
                var tCtrl;
                this.content.each(function(ctrl) {
                    tCtrl = tof(ctrl);
                    if (tCtrl === "control") {
                        ctrl.active();
                    }
                });
            }
            find_selection_scope() {
                var res = this.selection_scope;
                if (res) return res;
                if (this.parent) return this.parent.find_selection_scope();
            }
            click(handler) {
                this.add_event_listener("click", handler);
            }
            hover(fn_in, fn_out) {
                this.add_event_listener("mouseover", function(e) {
                    fn_in();
                });
                this.add_event_listener("mouseout", function(e) {
                    fn_out();
                });
            }
            add_class(class_name) {
                var cls = this.dom.attrs.class;
                var el = this.dom.el;
                if (!cls) {
                    this.dom.attrs.set("class", str_cls);
                } else {
                    var tCls = tof(cls);
                    if (tCls == "object") {
                        cls[class_name] = true;
                        var arr_class = [];
                        each(cls, function(i, v) {
                            if (v) arr_class.push(i);
                        });
                        var str_class = arr_class.join(" ");
                        this.dom.attrs.set("class", str_cls);
                    } else if (tCls == "data_value") {
                        var val = cls.value();
                        var arr_classes = val.split(" ");
                        var already_has_class = false, l = arr_classes.length, c = 0;
                        while (c < l & !already_has_class) {
                            if (arr_classes[c] == class_name) {
                                already_has_class = true;
                            }
                            c++;
                        }
                        if (!already_has_class) {
                            arr_classes.push(class_name);
                        }
                        var str_cls = arr_classes.join(" ");
                        this.dom.attrs.set("class", str_cls);
                    } else if (tCls == "string") {
                        var arr_classes = cls.split(" ");
                        var already_has_class = false, l = arr_classes.length, c = 0;
                        while (c < l & !already_has_class) {
                            if (arr_classes[c] == class_name) {
                                already_has_class = true;
                            }
                            c++;
                        }
                        if (!already_has_class) {
                            arr_classes.push(class_name);
                        }
                        var str_cls = arr_classes.join(" ");
                        this.dom.attrs.set("class", str_cls);
                    }
                }
            }
            remove_class(class_name) {
                var cls = this.dom.attributes.class;
                var el = this.dom.el;
                if (cls) {
                    var tCls = tof(cls);
                    if (tCls == "object") {
                        var arr_class = [];
                        each(cls, function(i, v) {
                            if (i == class_name) cls[i] = false;
                            if (cls[i]) arr_class.push(i);
                        });
                        var str_class = arr_class.join(" ");
                        this.dom.attrs.set("class", str_cls);
                    }
                    if (tCls == "string") {
                        var arr_classes = cls.split(" ");
                        var arr_res = [];
                        var l = arr_classes.length, c = 0;
                        while (c < l) {
                            console.log("arr_classes[c]", arr_classes[c]);
                            if (arr_classes[c] != class_name) {
                                arr_res.push(arr_classes[c]);
                            }
                            c++;
                        }
                        var str_cls = arr_res.join(" ");
                        console.log("str_cls", str_cls);
                        this.dom.attrs.set("class", str_cls);
                    }
                    if (tCls == "data_value") {
                        var cls2 = cls.value();
                        var arr_classes = cls2.split(" ");
                        var arr_res = [];
                        var l = arr_classes.length, c = 0;
                        while (c < l) {
                            if (arr_classes[c] != class_name) {
                                arr_res.push(arr_classes[c]);
                            }
                            c++;
                        }
                        var str_cls = arr_res.join(" ");
                        this.dom.attrs.set("class", str_cls);
                    }
                }
            }
            hover_class(class_name) {
                var that = this;
                that.hover(function(e_in) {
                    that.add_class(class_name);
                }, function(e_out) {
                    that.remove_class(class_name);
                });
            }
            matches_selector(selector) {}
            is_ancestor_of(target) {
                var t_target = tof(target);
                var el = this.dom.el;
                var inner = function(target2) {
                    if (target2 == el) {
                        return true;
                    }
                    var parent = target2.parentNode;
                    if (!parent) {
                        return false;
                    } else {
                        return inner(parent);
                    }
                };
                if (t_target == "object") {
                    if (el != target) {
                        var parent = target.parentNode;
                        if (parent) {
                            return inner(parent);
                        }
                    }
                }
            }
            find_selected_ancestor_in_scope() {
                var s = this.selection_scope;
                var ps = this.parent.selection_scope;
                if (s === ps) {
                    var psel = parent.selected;
                    if (psel && psel.value && psel.value() == true) {
                        return parent;
                    } else {
                        return parent.find_selected_ancestor_in_scope();
                    }
                }
            }
            remove() {
                var el = this.dom.el;
                if (el) {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }
            }
            shallow_copy() {
                console.log("Control shallow_copy");
                var res = new Control({
                    context: this.context
                });
                var da = this.dom.attributes;
                var cl = da.class;
                var map_class_exclude = {
                    "bg-light-yellow": true,
                    selected: true
                };
                each(cl.split(" "), function(i, v) {
                    if (i && !map_class_exclude[i]) res.add_class(i);
                });
                var res_content = res.content;
                this.content.each(function(v, i) {
                    if (tof(v) == "data_value") {
                        res_content.add(v.value());
                    } else {
                        res_content.add(v.shallow_copy());
                    }
                });
                return res;
            }
            get color() {}
            set color(value) {
                var input_processor = jsgui.input_processors["color"];
                var output_processor = jsgui.output_processors["color"];
                var processed = input_processor(value);
                this.set("color", processed, false);
                var html_color = output_processor(processed);
                var color_property_name = this.color_property_name || "background-color";
                this.style(color_property_name, html_color);
            }
            get offset() {
                var el = this.dom.el;
                var res = [ el.offsetLeft, el.offsetTop ];
                return res;
            }
            set offset(value) {
                this.style({
                    left: a[0] + "px",
                    top: a[1] + "px"
                });
            }
            clear() {
                return this.content.clear();
            }
            activate() {}
        }
        var p = Control_Core.prototype;
        p.connect_fields = true;
        module.exports = Control_Core;
    }, {
        "../lang/lang": 94
    } ],
    82: [ function(require, module, exports) {
        var jsgui = require("../lang/lang");
        var is_ctrl = jsgui.is_ctrl;
        var get_a_sig = jsgui.get_a_sig, fp = jsgui.fp, each = jsgui.each;
        var Control_Core = require("./control-core");
        var tof = jsgui.tof;
        var desc = function(ctrl, callback) {
            if (ctrl.get) {
                var content = ctrl.get("content");
                var t_content = typeof content;
                if (t_content === "string" || t_content === "number") {} else {
                    var arr = content._arr;
                    var c, l = arr.length;
                    var item, t_item;
                    for (c = 0; c < l; c++) {
                        item = arr[c];
                        t_item = typeof item;
                        if (t_item === "string" || t_item === "numbers") {} else {
                            callback(arr[c]);
                            desc(arr[c], callback);
                        }
                    }
                }
            }
        };
        var dom_desc = function(el, callback) {
            callback(el);
            var cns = el.childNodes;
            var l = cns.length;
            for (var c = 0; c < l; c++) {
                dom_desc(cns[c], callback);
            }
        };
        var mapDomEventNames = {
            change: true,
            click: true,
            mousedown: true,
            mouseup: true,
            mousemove: true,
            mouseover: true,
            mouseout: true,
            blur: true,
            focus: true,
            keydown: true,
            keyup: true,
            keypress: true,
            contextmenu: true,
            touchstart: true,
            touchmove: true,
            touchend: true,
            abort: true,
            canplay: true,
            canplaythrough: true,
            durationchange: true,
            emptied: true,
            ended: true,
            error: true,
            loadeddata: true,
            loadedmetadata: true,
            loadstart: true,
            pause: true,
            play: true,
            playing: true,
            progress: true,
            ratechange: true,
            seeked: true,
            seeking: true,
            stalled: true,
            suspend: true,
            timeupdate: true,
            volumechange: true,
            waiting: true
        };
        class Control extends Control_Core {
            constructor(spec) {
                if (spec.el) {
                    var jgf = spec.el.getAttribute("data-jsgui-fields");
                    if (jgf) {
                        var s_pre_parse = jgf.replace(/\[DBL_QT\]/g, '"').replace(/\[SNG_QT\]/g, "'");
                        s_pre_parse = s_pre_parse.replace(/\'/g, '"');
                        var props = JSON.parse(s_pre_parse);
                        Object.assign(spec, props);
                    }
                }
                super(spec);
                if (typeof spec.selection_scope !== "undefined") {
                    this.selection_scope = selection_scope;
                    var scrollbars = this.scrollbars;
                    console.log("scrollbars", scrollbars);
                    var active_scroll = false;
                    if (scrollbars === "both" || scrollbars === "horizontal" || scrollbars === "vertical") {
                        active_scroll = true;
                        var scroll_view = new Scroll_View({
                            context: this.context
                        });
                        this.add(scroll_view);
                    }
                }
                if (spec.is_selectable) {
                    this.selectable();
                }
            }
            bcr() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[]") {
                    var el = this.dom.el;
                    var bcr = el.getBoundingClientRect();
                    var res = [ [ bcr.left, bcr.top ], [ bcr.right, bcr.bottom ], [ bcr.width, bcr.height ] ];
                    return res;
                }
                if (sig == "[a]") {
                    console.log("bcr sig arr");
                    var bcr_def = a[0];
                    var pos = bcr_def[0];
                    var br_pos = bcr_def[1];
                    var size = bcr_def[2];
                    this.style({
                        position: "absolute",
                        left: pos[0] + "px",
                        top: pos[1] + "px",
                        width: size[0] + "px",
                        height: size[1] + "px"
                    });
                }
            }
            add_text(value) {
                var tn = new Text_Node({
                    context: this.context,
                    text: value + ""
                });
                this.add(tn);
                return tn;
            }
            computed_style() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                var y;
                if (sig == "[s]") {
                    var property_name = a[0];
                    var el = this.dom.el;
                    if (el.currentStyle) y = el.currentStyle[styleProp]; else if (window.getComputedStyle) y = document.defaultView.getComputedStyle(el, null).getPropertyValue(property_name);
                    return y;
                }
            }
            padding() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[]") {
                    var left, top, right, bottom;
                    var c_padding = this.computed_style("padding");
                    var s_c_padding = c_padding.split(" ");
                    if (s_c_padding.length == 3) {
                        top = parseInt(s_c_padding[0], 10);
                        right = parseInt(s_c_padding[1], 10);
                        bottom = parseInt(s_c_padding[2], 10);
                        return [ 0, top, right, bottom ];
                    }
                }
            }
            border() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[]") {
                    var left, top, right, bottom;
                    var c_border = this.computed_style("border");
                    console.log("c_border", c_border);
                    throw "stop";
                }
            }
            border_thickness() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[]") {
                    var left, top, right, bottom;
                    var c_border = this.computed_style("border");
                    console.log("c_border", c_border);
                    var b2 = c_border.split(", ").join("");
                    var s_c_border = b2.split(" ");
                    console.log("s_c_border", s_c_border);
                    var thickness = parseInt(s_c_border[0], 10);
                    return thickness;
                }
            }
            cover() {}
            ghost() {}
            absolute_ghost_clone() {
                var type_name = this.__type_name;
                var id = this._id();
                var context = this.context;
                console.log("context", context);
                var ctrl_document = context.ctrl_document;
                console.log("ctrl_document", ctrl_document);
                console.log("type_name", type_name);
                var Cstr = context.map_Controls[type_name];
                console.log("Cstr", Cstr);
                var new_id = id + "_clone";
                var map_controls = context.map_controls;
                if (!map_controls[new_id]) {
                    var new_ctrl = new Cstr({
                        context: context,
                        id: new_id
                    });
                    console.log("new_ctrl", new_ctrl);
                    var body = ctrl_document.content().get(1);
                    var css_class = this.get("dom.attributes.class");
                    new_ctrl.set("dom.attributes.class", css_class);
                    var my_contents = this.content;
                    each(my_contents, function(v, i) {
                        console.log("i", i);
                        console.log("v", v);
                        var v_clone = v.clone();
                        console.log("v_clone", v_clone);
                        if (v_clone instanceof jsgui.Data_Value) {
                            new_ctrl.add(v_clone.value());
                        } else {
                            new_ctrl.add(v_clone);
                        }
                    });
                    console.log("this", this);
                    var my_bcr = this.bcr();
                    console.log("my_bcr", my_bcr);
                    var my_padding = this.padding();
                    console.log("my_padding", my_padding);
                    my_bcr[2][0] = my_bcr[2][0] - my_padding[0];
                    my_bcr[2][1] = my_bcr[2][1] - my_padding[1];
                    my_bcr[2][0] = my_bcr[2][0] - my_padding[2];
                    my_bcr[2][1] = my_bcr[2][1] - my_padding[3];
                    var my_border_thickness = this.border_thickness();
                    console.log("my_border_thickness", my_border_thickness);
                    var t_my_border_thickness = tof(my_border_thickness);
                    if (t_my_border_thickness == "number") {
                        my_bcr[2][0] = my_bcr[2][0] - 2 * my_border_thickness;
                        my_bcr[2][1] = my_bcr[2][1] - 2 * my_border_thickness;
                    }
                    new_ctrl.bcr(my_bcr);
                    console.log("new_ctrl", new_ctrl);
                    body.add(new_ctrl);
                    var new_el = new_ctrl.dom.el;
                    console.log("new_el", new_el);
                }
            }
            set(name, value) {
                if (typeof value !== "undefined") {
                    if (is_ctrl(value)) {
                        var cf = this._ctrl_fields = this._ctrl_fields || {};
                        cf[name] = value;
                    }
                    Control_Core.prototype.set.call(this, name, value);
                } else {
                    Control_Core.prototype.set.call(this, name);
                }
            }
            one_mousedown_anywhere(callback) {
                var body = this.context.body();
                var that = this;
                body.one("mousedown", function(e_mousedown) {
                    var el = that.dom.el;
                    var e_el = e_mousedown.srcElement || e_mousedown.target;
                    var iao = that.is_ancestor_of(e_el);
                    e_mousedown.within_this = iao;
                    callback(e_mousedown);
                });
            }
            activate_recursive() {
                var el = this.dom.el;
                var context = this.context;
                var map_controls = context.map_controls;
                var parent_control;
                recursive_dom_iterate_depth(el, function(el2) {
                    var nt = el2.nodeType;
                    if (nt == 1) {
                        var jsgui_id = el2.getAttribute("data-jsgui-id");
                        console.log("jsgui_id " + jsgui_id);
                        if (jsgui_id) {
                            var ctrl = map_controls[jsgui_id];
                            console.log("jsgui_id", jsgui_id);
                            console.log("!!ctrl", !!ctrl);
                            if (!ctrl.__active) ctrl.activate(el2);
                        }
                    }
                });
            }
            add_dom_event_listener(event_name, fn_handler) {
                console.log("add_dom_event_listener", event_name, this.__id);
                var listener = this._bound_events[event_name];
                var that = this;
                var el = this.dom.el;
                console.log("el", el);
                console.trace();
                if (el) {
                    console.log("listener", listener);
                    var t_listener = tof(listener);
                    console.log("t_listener", t_listener);
                    console.log("pre el addEventListener");
                    if (t_listener === "array") {
                        console.log("listener.length", listener.length);
                        each(listener, listener => {
                            el.addEventListener(event_name, listener, false);
                        });
                    } else {
                        el.addEventListener(event_name, listener, false);
                    }
                }
            }
            add_event_listener() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                console.log("control-enh add_event_listener sig", sig);
                if (a.l === 2) {
                    super.add_event_listener(a[0], a[1]);
                }
                if (a.l === 3) {
                    super.add_event_listener(a[0], a[2]);
                }
                if (sig === "[s,f]" || sig === "[s,b,f]") {
                    var event_name = a[0];
                    var using_dom = true;
                    if (a.l === 3 && a[1] === false) using_dom = false;
                    var fn_handler;
                    if (a.l === 2) fn_handler = a[1];
                    if (a.l === 3) fn_handler = a[2];
                    if (mapDomEventNames[a[0]] && using_dom) {
                        console.log("pre call add_dom_event_listener from add_event_listener");
                        console.log("this.dom.el", !!this.dom.el);
                        this.add_dom_event_listener(event_name, fn_handler);
                    }
                }
            }
            activate(el) {
                if (!this.__active) {
                    this.__active = true;
                    if (el) {
                        this.dom.el = el;
                    }
                    this.activate_dom_attributes();
                    this.activate_content_controls();
                    this.activate_content_listen();
                    this.activate_other_changes_listen();
                }
            }
            activate_other_changes_listen() {
                var dom_attributes = this.dom.attrs;
                var el = this.dom.el;
                dom_attributes.on("change", function(e_change) {
                    var property_name = e_change.name || e_change.key, dval = e_change.value || e_change.new;
                    var t_dval = tof(dval);
                    if (t_dval == "string" || t_dval == "number") {} else {
                        dval = dval.value();
                    }
                    if (el && el.nodeType === 1) {
                        el.setAttribute(property_name, dval);
                    }
                });
            }
            activate_content_listen() {
                var content = this.content;
                var that = this;
                var context = this.context;
                var map_controls = context.map_controls;
                content.on("change", function(e_change) {
                    var itemDomEl;
                    var el;
                    var dv_el = that.dom.el;
                    if (dv_el) el = dv_el;
                    var type = e_change.type;
                    if (type === "insert") {
                        var item = e_change.item;
                        var retrieved_item_dom_el = item.dom.el;
                        var t_ret = tof(retrieved_item_dom_el);
                        if (t_ret === "string") {
                            itemDomEl = retrieved_item_dom_el;
                        } else {
                            if (retrieved_item_dom_el) console.log("keys dv_item_dom_el", Object.keys(retrieved_item_dom_el));
                            if (retrieved_item_dom_el) {
                                itemDomEl = dv_item_dom_el.value();
                            }
                            if (!itemDomEl) {
                                if (context.map_els[item._id()]) {
                                    itemDomEl = context.map_els[item._id()];
                                }
                            }
                            if (!itemDomEl) {
                                var item_tag_name = "div";
                                var dv_tag_name = item.dom.tagName;
                                if (dv_tag_name) {
                                    item_tag_name = dv_tag_name;
                                }
                                var temp_el;
                                if (item_tag_name == "circle" || item_tag_name == "line" || item_tag_name == "polyline") {
                                    var temp_svg_container = e_change.item.context.document.createElement("div");
                                    temp_svg_container.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' + e_change.item.all_html_render() + "</svg>";
                                    itemDomEl = temp_svg_container.childNodes[0].childNodes[0];
                                } else {
                                    temp_el = e_change.item.context.document.createElement("div");
                                    temp_el.innerHTML = e_change.item.all_html_render();
                                    itemDomEl = temp_el.childNodes[0];
                                }
                                e_change.item.dom.el = itemDomEl;
                                item.active();
                            }
                        }
                        var t_item_dom_el = tof(itemDomEl);
                        if (t_item_dom_el === "string") {
                            itemDomEl = document.createTextNode(itemDomEl);
                        }
                        if (!el) {}
                        el.appendChild(itemDomEl);
                    }
                    if (type === "clear") {
                        if (el) el.innerHTML = "";
                    }
                });
            }
            rec_desc_ensure_ctrl_el_refs(el) {
                el = el || this.dom.el;
                var context = this.context;
                var that = this;
                if (el) {
                    var c, l, cns;
                    var jsgui_id;
                    var map_els = {};
                    dom_desc(el, function(el) {
                        if (el.getAttribute) {
                            jsgui_id = el.getAttribute("data-jsgui-id");
                            if (jsgui_id) {
                                map_els[jsgui_id] = el;
                                context.map_els[jsgui_id] = el;
                            }
                        }
                    });
                    desc(this, function(ctrl) {
                        var t_ctrl = tof(ctrl);
                        if (ctrl !== that && t_ctrl === "control") {
                            var id = ctrl._id();
                            if (map_els[id]) {
                                if (ctrl.dom.el !== map_els[id]) {
                                    ctrl.dom.el = map_els[id];
                                } else {}
                            }
                        }
                    });
                }
            }
            rec_desc_activate() {
                desc(this, function(ctrl) {
                    var t_ctrl = tof(ctrl);
                    if (t_ctrl === "control") {
                        ctrl.activate();
                    }
                });
            }
            activate_content_controls() {
                var el = this.dom.el;
                if (el) {
                    var context = this.context;
                    var ctrl_fields = {};
                    var that = this;
                    var c, l;
                    var my_content = this.content;
                    var str_ctrl_fields = el.getAttribute("data-jsgui-ctrl-fields");
                    if (str_ctrl_fields) {
                        ctrl_fields = JSON.parse(str_ctrl_fields.replace(/'/g, '"'));
                    }
                    var ctrl_fields_keys = Object.keys(ctrl_fields);
                    var l_ctrl_fields_keys = ctrl_fields_keys.length;
                    var key, value;
                    for (c = 0; c < l_ctrl_fields_keys; c++) {
                        key = ctrl_fields_keys[c];
                        value = ctrl_fields[key];
                        var referred_to_control = context.map_controls[value];
                        that[key] = referred_to_control;
                    }
                    var cns = el.childNodes;
                    var content = this.content;
                    for (c = 0, l = cns.length; c < l; c++) {
                        var cn = cns[c];
                        if (cn) {
                            var nt = cn.nodeType;
                            if (nt == 1) {
                                var cn_jsgui_id = cn.getAttribute("data-jsgui-id");
                                var cctrl = context.map_controls[cn_jsgui_id];
                                var found = false;
                                if (cctrl) {
                                    var ctrl_id = cctrl.__id;
                                    if (ctrl_id) {
                                        content.each(function(v, i) {
                                            if (v.__id) {
                                                if (v.__id == ctrl_id) found = true;
                                            }
                                        });
                                    }
                                    if (!found) {
                                        my_content.add(cctrl);
                                    }
                                }
                            }
                            if (nt == 3) {
                                var val = cn.nodeValue;
                                content.push(val);
                            }
                        }
                    }
                }
                this.rec_desc_activate();
            }
            activate_dom_attributes() {
                var el = this.dom.el;
                var that = this;
                var dom_attributes = this.dom.attributes;
                if (el) {
                    for (var i = 0, attrs = el.attributes, l = attrs.length; i < l; i++) {
                        var item = attrs.item(i);
                        var name = item.name;
                        var value = item.value;
                        if (name == "data-jsgui-id") {} else if (name == "data-jsgui-type") {} else if (name == "style") {
                            var map_inline_css = this._icss;
                            var arr_style_items = value.split(";");
                            for (var c = 0, l2 = arr_style_items.length; c < l2; c++) {
                                var style_item = arr_style_items[c];
                                var arr_style_item = style_item.split(":");
                                if (arr_style_item[0]) {
                                    map_inline_css[arr_style_item[0]] = arr_style_item[1];
                                }
                            }
                        } else {
                            dom_attributes[name] = value;
                        }
                    }
                }
            }
            attach_dom_events() {
                console.log("attach_dom_events");
                var that = this;
                each(this._bound_events, (handlers, name) => {
                    each(handlers, handler => {
                        console.log("event name", name);
                        that.add_dom_event_listener(name, handler);
                    });
                });
            }
            hide() {
                console.log("hide");
                this.add_class("hidden");
            }
            show() {
                console.log("show");
                this.remove_class("hidden");
            }
            descendants(search) {
                var recursive_iterate = function(ctrl, item_callback) {
                    var content = ctrl.content;
                    var t_content = tof(content);
                    if (t_content == "collection") {
                        if (content.length() > 0) {
                            content.each(function(item, i) {
                                item_callback(item);
                                recursive_iterate(item, item_callback);
                            });
                        }
                    }
                };
                var arr_matching = [];
                recursive_iterate(this, function(item) {
                    var item_type = item.__type_name;
                    if (item_type == search) {
                        arr_matching.push(item);
                    } else {}
                });
                return arr_matching;
            }
            ancestor(search) {
                if (this._parent) {
                    var ctrl_parent = this._parent._parent;
                    if (!ctrl_parent) {
                        return false;
                    } else {
                        var parent_type = ctrl_parent.__type_name;
                        if (parent_type == search) {
                            return ctrl_parent;
                        } else {
                            return ctrl_parent.ancestor(search);
                        }
                    }
                } else {
                    return false;
                }
            }
            draggable() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                var that = this;
                var options = {}, mode, drag_start_distance = 4;
                var fn_mousedown, fn_dragstart, fn_dragmove, fn_dragend;
                var handle_mousedown, handle_dragstart, handle_dragmove, handle_dragend;
                if (sig == "[o]") {
                    options = a[0];
                }
                if (sig == "[f,f,f,f]") {
                    handle_mousedown = a[0];
                    handle_dragstart = a[1];
                    handle_dragmove = a[2];
                    handle_dragend = a[3];
                }
                if (options.mode) mode = options.mode;
                if (options.move) handle_dragmove = options.move;
                if (options.start) handle_dragstart = options.start;
                if (mode == "ghost-copy") {
                    console.log("ghost-copy drag");
                }
                var body = that.context.body();
                var is_dragging;
                var pos_mousedown;
                var ghost_clone;
                var fn_mousemove = function(e_mousemove) {
                    var pos = [ e_mousemove.pageX, e_mousemove.pageY ];
                    var pos_offset = [ pos[0] - pos_mousedown[0], pos[1] - pos_mousedown[1] ];
                    if (!is_dragging) {
                        var dist = Math.round(Math.sqrt(pos_offset[0] * pos_offset[0] + pos_offset[1] * pos_offset[1]));
                        if (dist >= drag_start_distance) {
                            is_dragging = true;
                            if (mode == "ghost-copy") {
                                ghost_clone = that.absolute_ghost_clone();
                            }
                            if (handle_dragstart) {
                                e_mousemove.control = that;
                                body.add_class("no-text-select");
                                body.add_class("default-cursor");
                                handle_dragstart(e_mousemove);
                            }
                        }
                    }
                    if (is_dragging) {
                        if (handle_dragmove) {
                            e_mousemove.control = that;
                            handle_dragmove(e_mousemove);
                        }
                    }
                };
                var fn_mouseup = function(e_mouseup) {
                    body.off("mousemove", fn_mousemove);
                    body.off("mouseup", fn_mouseup);
                    body.remove_class("no-text-select");
                    body.remove_class("default-cursor");
                };
                this.on("mousedown", function(e_mousedown) {
                    pos_mousedown = [ e_mousedown.pageX, e_mousedown.pageY ];
                    body.on("mousemove", fn_mousemove);
                    body.on("mouseup", fn_mouseup);
                    body.add_class("no-text-select");
                    is_dragging = false;
                    if (handle_mousedown) {
                        handle_mousedown(e_mousedown);
                    }
                });
            }
            drag_handle_to(ctrl) {
                var mousedown_offset_from_ctrl_lt;
                var ctrl_el = ctrl.dom.el;
                this.draggable(function(e_mousedown) {
                    var target = e_mousedown.target;
                    var targetPos = findPos(target);
                    var el_ctrl = ctrl.value("dom.el");
                    var ctrl_el_pos = findPos(el_ctrl);
                    var e_pos_on_page = [ e_mousedown.pageX, e_mousedown.pageY ];
                    mousedown_offset_from_ctrl_lt = jsgui.v_subtract(e_pos_on_page, ctrl_el_pos);
                }, function(e_begin) {
                    var ctrlSize = ctrl.size();
                    var anchored_to = ctrl.anchored_to;
                    if (!anchored_to) {} else {
                        ctrl.unanchor();
                    }
                }, function(e_move) {
                    var clientX = e_move.clientX;
                    var clientY = e_move.clientY;
                    var window_size = get_window_size();
                    var ctrl_pos = jsgui.v_subtract([ clientX, clientY ], mousedown_offset_from_ctrl_lt);
                    var offset_adjustment = ctrl.offset_adjustment;
                    if (offset_adjustment) {
                        ctrl_pos = jsgui.v_add(ctrl_pos, offset_adjustment);
                    }
                    if (ctrl_pos[0] < 0) ctrl_pos[0] = 0;
                    if (ctrl_pos[1] < 0) ctrl_pos[1] = 0;
                    var ow = ctrl_el.offsetWidth;
                    var oh = ctrl_el.offsetHeight;
                    if (ctrl_pos[0] > window_size[0] - ow) ctrl_pos[0] = window_size[0] - ow;
                    if (ctrl_pos[1] > window_size[1] - oh) ctrl_pos[1] = window_size[1] - oh;
                    var style_vals = {
                        left: ctrl_pos[0] + "px",
                        top: ctrl_pos[1] + "px"
                    };
                    ctrl.style(style_vals);
                    ctrl.context.move_drag_ctrl(e_move, ctrl);
                }, function(e_end) {
                    var uo1 = ctrl.unanchored_offset;
                    ctrl.context.end_drag_ctrl(e_end, ctrl);
                    var uo2 = ctrl.unanchored_offset;
                    if (uo1 && uo2) {
                        ctrl.unanchored_offset = null;
                    }
                    ctrl.offset_adjustment = null;
                });
            }
            resize_handle_to(ctrl, handle_position) {
                if (handle_position == "right-bottom") {
                    var doc = ctrl.context.ctrl_document;
                    var fn_move = function(e_move) {};
                    var fn_up = function(e_up) {
                        doc.off("mousemove", fn_move);
                        doc.off("mouseup", fn_up);
                    };
                    ctrl.on("mousedown", function(e_mousedown) {
                        doc.on("mousemove", fn_move);
                        doc.on("mouseup", fn_up);
                    });
                }
            }
            selectable(ctrl) {
                var that = this;
                ctrl = ctrl || this;
                if (typeof document === "undefined") {
                    that.is_selectable = true;
                } else {
                    that.click(function(e) {
                        var ctrl_key = e.ctrlKey;
                        var meta_key = e.metaKey;
                        if (ctrl_key || meta_key) {
                            ctrl.action_select_toggle();
                        } else {
                            ctrl.action_select_only();
                        }
                    });
                }
            }
            action_select_only() {
                var ss = this.find_selection_scope();
                ss.select_only(this);
            }
            action_select_toggle() {
                this.find_selection_scope().select_toggle(this);
            }
            find_selection_scope() {
                var res = this.selection_scope;
                if (res) return res;
                if (this.parent) return this.parent.find_selection_scope();
            }
            make_full_height() {
                var el = this.dom.el;
                var viewportHeight = document.documentElement.clientHeight;
                var rect = el.getBoundingClientRect();
                console.log(rect.top, rect.right, rect.bottom, rect.left);
                var h = viewportHeight - rect.top;
                this.style("height", h + "px", true);
            }
            unanchor() {
                var anchored_to = this.get("anchored_to");
                anchored_to[0].unanchor_ctrl(this);
            }
        }
        module.exports = Control;
    }, {
        "../lang/lang": 94,
        "./control-core": 81
    } ],
    83: [ function(require, module, exports) {
        var jsgui = require("../lang/lang");
        var str_arr_mapify = jsgui.str_arr_mapify;
        var get_a_sig = jsgui.get_a_sig;
        var each = jsgui.each;
        var Control = jsgui.Control = require("./control-enh");
        var tof = jsgui.tof;
        var map_Controls = jsgui.map_Controls = {};
        var core_extension = str_arr_mapify(function(tagName) {
            jsgui[tagName] = class extends Control {
                constructor(spec) {
                    super(spec);
                    this.dom.tagName = tagName;
                }
            };
            jsgui[tagName].prototype._tag_name = tagName;
            map_Controls[tagName] = jsgui[tagName];
        });
        var core_extension_no_closing_tag = str_arr_mapify(function(tagName) {
            jsgui[tagName] = class extends Control {
                constructor(spec) {
                    super(spec);
                    this.dom.tagName = tagName;
                    this.dom.noClosingTag = true;
                }
            };
            jsgui[tagName].prototype._tag_name = tagName;
            map_Controls[tagName] = jsgui[tagName];
        });
        var recursive_dom_iterate = function(el, callback) {
            callback(el);
            var cns = el.childNodes;
            for (var c = 0, l = cns.length; c < l; c++) {
                recursive_dom_iterate(cns[c], callback);
            }
        };
        var recursive_dom_iterate_depth = function(el, callback) {
            var cns = el.childNodes;
            for (var c = 0, l = cns.length; c < l; c++) {
                recursive_dom_iterate_depth(cns[c], callback);
            }
            callback(el);
        };
        var activate = function(context) {
            if (!context) {
                throw "jsgui-html-enh activate(context) - need to supply context parameter.";
            }
            var map_jsgui_els = {};
            var map_jsgui_types = {};
            var arr_controls = [];
            var max_typed_ids = {};
            var id_before__ = function(id) {
                var pos1 = id.lastIndexOf("_");
                var res = id.substr(0, pos1);
                return res;
            };
            var num_after = function(id) {
                return parseInt(id.substr(id.lastIndexOf("_") + 1), 10);
            };
            recursive_dom_iterate(document, function(el) {
                var nt = el.nodeType;
                if (nt == 1) {
                    var jsgui_id = el.getAttribute("data-jsgui-id");
                    if (jsgui_id) {
                        var ib = id_before__(jsgui_id);
                        var num = num_after(jsgui_id);
                        if (!max_typed_ids[ib]) {
                            max_typed_ids[ib] = num;
                        } else {
                            if (num > max_typed_ids[ib]) max_typed_ids[ib] = num;
                        }
                        map_jsgui_els[jsgui_id] = el;
                        var jsgui_type = el.getAttribute("data-jsgui-type");
                        map_jsgui_types[jsgui_id] = jsgui_type;
                    }
                }
            });
            context.set_max_ids(max_typed_ids);
            var map_controls = context.map_controls;
            each(map_jsgui_els, function(el, jsgui_id) {
                var l_tag_name = el.tagName.toLowerCase();
                if (jsgui_id) {
                    var type = map_jsgui_types[jsgui_id];
                    console.log("!!map_controls[jsgui_id]", !!map_controls[jsgui_id]);
                    console.log("map_controls", map_controls);
                    if (!map_controls[jsgui_id]) {
                        var Cstr = context.map_Controls[type];
                        if (Cstr) {
                            console.log("creating constructor of type", type, "jsgui_id", jsgui_id);
                            var ctrl = new Cstr({
                                context: context,
                                _id: jsgui_id,
                                el: el
                            });
                            arr_controls.push(ctrl);
                            if (l_tag_name === "html") {
                                context.ctrl_document = ctrl;
                            }
                            map_controls[jsgui_id] = ctrl;
                        } else {
                            console.log("Missing context.map_Controls for type " + type + ", using generic Control");
                            var ctrl = new Control({
                                context: context,
                                _id: jsgui_id,
                                el: el
                            });
                            ctrl.__type_name = type;
                            arr_controls.push(ctrl);
                            map_controls[jsgui_id] = ctrl;
                        }
                    } else {
                        console.log("found control in map", jsgui_id);
                        var ctrl = map_controls[jsgui_id];
                        ctrl.dom.el = el;
                        if (ctrl.attach_dom_events) ctrl.attach_dom_events();
                    }
                }
            });
            recursive_dom_iterate_depth(document, function(el) {
                var nt = el.nodeType;
                if (nt == 1) {
                    var jsgui_id = el.getAttribute("data-jsgui-id");
                    if (jsgui_id) {
                        var ctrl = map_controls[jsgui_id];
                        ctrl.__activating = true;
                        ctrl.activate();
                        ctrl.__activating = false;
                    }
                }
            });
        };
        var escape_html_replacements = [ [ /&/g, "&amp;" ], [ /</g, "&lt;" ], [ />/g, "&gt;" ], [ /"/g, "&quot;" ], [ /'/g, "&#x27;" ], [ /\//g, "&#x2F;" ] ];
        var escape_html = function(str) {
            if (tof(str) == "data_value") str = str.get();
            var single_replacement;
            for (var c = 0, l = escape_html_replacements.length; c < l; c++) {
                single_replacement = escape_html_replacements[c];
                str = str.replace(single_replacement[0], single_replacement[1]);
            }
            return str;
        };
        jsgui.activate = activate;
        core_extension("html head title body div span h1 h2 h3 h4 h5 h6 label p a script button form img ul li audio video table tr td caption thead colgroup col");
        core_extension_no_closing_tag("link input");
        class textNode extends Control {
            constructor(spec) {
                super(spec);
                spec = spec || {};
                if (typeof spec == "string") {
                    spec = {
                        text: spec
                    };
                }
                spec.nodeType = 3;
                this._ = {};
                if (typeof spec.text != "undefined") {
                    this.text = spec.text;
                }
            }
            get text() {
                return this._.text;
            }
            set text(value) {
                this._.text = value;
                this.raise("change", {
                    name: "text",
                    value: value
                });
            }
            all_html_render() {
                var res;
                if (this.nx) {
                    res = this.text || "";
                } else {
                    res = escape_html(this.text || "") || "";
                }
                return res;
            }
        }
        class HTML_Document extends jsgui.Control {
            constructor(spec) {
                super(spec);
            }
            render_dtd() {
                return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n';
            }
        }
        class Blank_HTML_Document extends HTML_Document {
            constructor(spec) {
                console.log("Blank_HTML_Document");
                super(spec);
                var context = this.context;
                if (!spec.el) {
                    this.dom.tagName = "html";
                    var head = new jsgui.head({
                        context: context
                    });
                    this.content.add(head);
                    var title = new jsgui.title({
                        context: context
                    });
                    head.content.add(title);
                    var body = new jsgui.body({
                        context: context
                    });
                    this.content.add(body);
                    this.head = head;
                    this.title = title;
                    this.body = body;
                }
            }
            body() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[]") {
                    var content = this.content;
                    var body = content.get(1);
                    return body;
                }
            }
        }
        class Client_HTML_Document extends Blank_HTML_Document {
            constructor(spec) {
                console.log("Client_HTML_Document");
                super(spec);
                this.active();
            }
            include_js(url) {
                var head = this.get("head");
                var script = new jsgui.script({
                    context: this.context
                });
                var dom = script.dom;
                var domAttributes = dom.attributes;
                domAttributes.type = "text/javascript";
                domAttributes.src = url;
                head.content.add(script);
            }
            include_css(url) {
                var head = this.get("head");
                var link = new jsgui.link({
                    context: this.context
                });
                var dom = link.get("dom");
                var domAttributes = dom.get("attributes");
                domAttributes.set("rel", "stylesheet");
                domAttributes.set("type", "text/css");
                domAttributes.set("href", url);
                head.content().add(link);
            }
            include_jsgui_client(js_file_require_data_main) {
                js_file_require_data_main = js_file_require_data_main || "/js/web/jsgui-html-client";
                var head = this.head;
                var script = new jsgui.script({
                    context: this.context
                });
                var domAttributes = script.dom.attributes;
                domAttributes.set({
                    type: "text/javascript",
                    src: "/js/web/require.js",
                    "data-main": js_file_require_data_main
                });
                head.add(script);
            }
            include_jsgui_resource_client(path) {
                var js_file_require_data_main = path || "/js/web/jsgui-html-resource-client";
                this.include_jsgui_client(js_file_require_data_main);
            }
            include_client_css() {
                var head = this.get("head");
                var link = new jsgui.link({
                    context: this.context
                });
                var domAttributes = link.dom.attributes;
                domAttributes.rel = "stylesheet";
                domAttributes.type = "text/css";
                domAttributes.href = "/css/basic.css";
                head.content.add(link);
            }
        }
        jsgui.textNode = textNode;
        jsgui.HTML_Document = HTML_Document;
        jsgui.Blank_HTML_Document = Blank_HTML_Document;
        jsgui.Client_HTML_Document = Client_HTML_Document;
        jsgui.Page_Context = require("./../html-core/page-context");
        module.exports = jsgui;
    }, {
        "../lang/lang": 94,
        "./../html-core/page-context": 84,
        "./control-enh": 82
    } ],
    84: [ function(require, module, exports) {
        var jsgui = require("../lang/lang");
        var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
        var Control = jsgui.Control, Class = jsgui.Class;
        var fp = jsgui.fp;
        var group = jsgui.group;
        var get_a_sig = jsgui.get_a_sig;
        var get_window_size = jsgui.get_window_size;
        class Page_Context extends jsgui.Evented_Class {
            constructor(spec) {
                spec = spec || {};
                super(spec);
                if (spec.browser_info) {
                    this.browser_info = spec.browser_info;
                }
                if (spec.resource_pool) {
                    this.resource_pool = spec.resource_pool;
                }
                this.get_vector_methodology = function() {
                    if (this.browser_info.ie) {
                        return "vml";
                    } else {
                        return "svg";
                    }
                };
                var map_new_ids = {};
                var map_objects = {};
                var _get_new_typed_object_id = function(type_name) {
                    if (!is_defined(map_new_ids[type_name])) {
                        map_new_ids[type_name] = 0;
                    }
                    var res = type_name + "_" + map_new_ids[type_name];
                    map_new_ids[type_name]++;
                    return res;
                };
                this.new_id = _get_new_typed_object_id;
                this.set_max_ids = function(map_max_ids) {
                    each(map_max_ids, function(v, i) {
                        map_new_ids[i] = v + 1;
                    });
                };
                var map_Controls = this.map_Controls = {};
                var map_controls = this.map_controls = {};
                map_Controls["control"] = Control;
            }
            make(abstract_object) {
                if (abstract_object._abstract) {
                    var constructor = abstract_object.constructor;
                    var aos = abstract_object._spec;
                    aos.abstract = null;
                    aos.context = this;
                    var res = new constructor(abstract_object._spec);
                    return res;
                } else {
                    throw "Object must be abstract, having ._abstract == true";
                }
            }
            update_Controls() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[o]") {
                    var o = a[0];
                    var map_Controls = this.map_Controls;
                    each(o, function(name, Constructor) {
                        name = name.toLowerCase();
                        map_Controls[name] = Constructor;
                    });
                }
                if (sig == "[s,f]") {
                    var name = a[0];
                    var Constructor = a[1];
                    name = name.toLowerCase();
                    this.map_Controls[name] = Constructor;
                }
            }
            register_control(control) {
                var id = control._id();
                this.map_controls[id] = control;
            }
            first_ctrl_matching_type(type_name) {
                var res;
                each(this.map_controls, function(ctrl, ctrl_id, fn_stop) {
                    if (ctrl.__type_name === type_name) {
                        fn_stop();
                        res = ctrl;
                    }
                });
                return res;
            }
            begin_drag_ctrl(e_begin, ctrl) {
                this.raise("drag-ctrl-begin", e_end, ctrl);
            }
            move_drag_ctrl(e_move, ctrl) {
                var window_size = get_window_size();
                var from_left, from_top, from_right, from_bottom;
                var clientX = e_move.clientX;
                var clientY = e_move.clientY;
                var margin = 64;
                var is_left = clientX <= margin;
                var is_top = clientY <= margin;
                var is_right = clientX >= window_size[0] - margin;
                var is_bottom = clientY >= window_size[1] - margin;
                if (is_top) {
                    this.raise("drag-ctrl-top");
                } else if (is_bottom) {
                    this.raise("drag-ctrl-bottom");
                } else if (is_left) {
                    this.raise("drag-ctrl-left");
                } else if (is_right) {
                    this.raise("drag-ctrl-right");
                } else {
                    this.raise("drag-ctrl-no-zone");
                }
            }
            end_drag_ctrl(e_end, ctrl) {
                this.raise("drag-ctrl-end", e_end, ctrl);
            }
            drop_ctrl(ctrl, zone) {
                if (this.full_window) {
                    this.anchor(ctrl, zone);
                }
            }
            anchor(ctrl, zone) {
                console.log("page context anchor ");
                if (this.full_window) {
                    var fw = this.full_window;
                    var g9 = fw.get("grid_9");
                    if (g9) {
                        g9.anchor_ctrl(ctrl, zone);
                    }
                    var fwtn = fw.__type_name;
                }
            }
            begin_drag_selection_scope(e_begin, selection_scope) {
                var map_selected_controls = selection_scope.map_selected_controls;
                var arr_selected = jsgui.true_vals(map_selected_controls);
                var shallow_copies_selected = jsgui.shallow_copy(arr_selected);
                this.drag_selected = arr_selected;
                var ctrl_abs = this.make(Control({}));
                ctrl_abs.add(shallow_copies_selected);
                var screenX = e_begin.screenX;
                var screenY = e_begin.screenY;
                var clientX = e_begin.clientX;
                var clientY = e_begin.clientY;
                ctrl_abs.set("dom.attributes.style", "position: absolute; left: " + clientX + "px; top:" + clientY + "px; height: 200px; width: 320px; background-color: #EEEEEE");
                var html = ctrl_abs.all_html_render();
                var el_ctr = document.createElement("div");
                el_ctr.innerHTML = html;
                var el_abs = el_ctr.childNodes[0];
                document.body.appendChild(el_abs);
                this.ctrl_abs = ctrl_abs;
            }
            move_drag_selection_scope(e_move) {
                console.log("page context move_drag_selection_scope");
                var clientX = e_move.clientX;
                var clientY = e_move.clientY;
                var style = "position: absolute; left: " + clientX + "px; top:" + clientY + "px; height: 200px; width: 320px; background-color: #EEEEEE";
                var el = this.ctrl_abs.dom.el;
                el.style.cssText = style;
            }
            end_drag_selection_scope(e_end) {
                if (this.ctrl_abs) {
                    this.ctrl_abs.remove();
                    this.ctrl_abs = null;
                }
            }
        }
        module.exports = Page_Context;
    }, {
        "../lang/lang": 94
    } ],
    85: [ function(require, module, exports) {
        var jsgui = require("../html-core/html-core");
        var str_arr_mapify = jsgui.str_arr_mapify;
        var get_a_sig = jsgui.get_a_sig;
        var each = jsgui.each;
        var Control = jsgui.Control;
        var map_Controls = jsgui.map_Controls = {};
        var Controls = require("../controls/controls");
        Object.assign(jsgui, Controls);
        module.exports = jsgui;
    }, {
        "../controls/controls": 36,
        "../html-core/html-core": 83
    } ],
    86: [ function(require, module, exports) {
        var StiffArray = require("./stiffarray");
        var B_Plus_Node = function(nodeCapacity) {
            var m_public = {
                isLeaf: false,
                parent: null,
                keys: new StiffArray(nodeCapacity + 1),
                children: new StiffArray(nodeCapacity + 2)
            };
            return m_public;
        };
        var B_Plus_Leaf = function(nodeCapacity) {
            var m_public = {
                isLeaf: true,
                parent: null,
                keys: new StiffArray(nodeCapacity + 1),
                values: new StiffArray(nodeCapacity + 1),
                prevLeaf: null,
                nextLeaf: null
            };
            return m_public;
        };
        var FindInfo = (key, value, isPrefixSearch) => {
            isPrefixSearch = !!isPrefixSearch;
            var isKeyPresent = key != undefined;
            var isValuePresent = value != undefined;
            var prefixLength = 0;
            if (isPrefixSearch) {
                if (typeof key != "string") {
                    isPrefixSearch = false;
                } else {
                    prefixLength = key.length;
                }
            }
            return {
                key: key,
                value: value,
                isPrefixSearch: isPrefixSearch,
                leaf: null,
                index: -1,
                isKeyPresent: isKeyPresent,
                isValuePresent: isValuePresent,
                foundKey: function() {
                    return this.leaf.keys.items[this.index];
                },
                foundValue: function() {
                    return this.leaf.values.items[this.index];
                },
                prefix_length: prefixLength,
                check_prefix: function() {
                    if (!isPrefixSearch) return false;
                    if (this.index >= this.leaf.keys.count) return false;
                    var keyToCheck = this.foundKey();
                    if (this.prefix_length > keyToCheck.length) return false;
                    return keyToCheck.substr(0, this.prefix_length) == this.key;
                }
            };
        };
        var B_Plus_Tree = function(nodeCapacity) {
            if (nodeCapacity === undefined) nodeCapacity = 10;
            if (nodeCapacity < 4) throw "B_Plus_Tree(): node capacity must be >= 4";
            var m_public = {
                root: new B_Plus_Leaf(nodeCapacity),
                firstLeaf: null,
                lastLeaf: null,
                clear: function() {
                    p_Clear();
                },
                insert: function(key, value) {
                    if (arguments.length == 2) {
                        return p_Insert(key, value);
                    } else {
                        return p_Insert(key[0], key[1]);
                    }
                },
                remove: function(key, value) {
                    if (arguments.length == 2) {
                        return p_Remove(key, value);
                    } else {
                        p_RemoveKey(key);
                    }
                },
                findFirst: function(key, value) {
                    return p_FindFirst(key, value);
                },
                findFirstPrefix: function(prefix) {
                    return p_FindFirst(prefix, undefined, true);
                },
                findNext: function(findInfo) {
                    return p_FindNext(findInfo);
                },
                findLast: function(key, value) {
                    return p_FindLast(key, value);
                },
                findLastPrefix: function(prefix) {
                    return p_FindLast(prefix, undefined, true);
                },
                findPrevious: function(findInfo) {
                    return p_FindPrev(findInfo);
                },
                getValue: function(key) {
                    return p_GetValue(key);
                },
                setValue: function(key, value) {
                    p_SetValue(key, value);
                },
                count: function(key) {
                    if (arguments.length == 1) {
                        return p_CountKey(key);
                    } else {
                        return p_Count();
                    }
                },
                getCapacity: function() {
                    return m_nodeMaxCount;
                },
                each: function(callback) {
                    return p_each(callback);
                },
                keys: function() {
                    return p_keys();
                },
                keys_and_values: function() {
                    return p_keys_and_values();
                },
                get_by_prefix: function(prefix) {
                    return p_get_by_prefix(prefix);
                },
                get_keys_by_prefix: function(prefix) {
                    return p_get_keys_by_prefix(prefix);
                },
                get_values_by_key: function(key) {
                    return p_get_values_by_key(key);
                }
            };
            m_public.firstLeaf = m_public.root;
            m_public.lastLeaf = m_public.root;
            var m_nodeMaxCount = nodeCapacity;
            var m_nodeMinCount = Math.floor(m_nodeMaxCount / 2);
            var p_Clear = function() {
                m_public.root = new B_Plus_Leaf(m_nodeMaxCount);
                m_public.firstLeaf = m_public.root;
                m_public.lastLeaf = m_public.root;
            };
            var p_keys = function() {
                var res = [];
                _p_each_key(function(key) {
                    res.push(key);
                });
                return res;
            };
            var p_keys_and_values = function() {
                var res = [];
                p_each(function(key, value) {
                    res.push([ key, value ]);
                });
                return res;
            };
            var _p_each_key = function(callback) {
                var findInfo = p_FindFirst();
                while (findInfo != null) {
                    var fk = findInfo.foundKey();
                    callback(fk);
                    findInfo = p_FindNext(findInfo);
                }
            };
            var p_each = function(callback) {
                var findInfo = p_FindFirst();
                var doStop = false;
                while (findInfo != null) {
                    var fk = findInfo.foundKey();
                    var fv = findInfo.foundValue();
                    callback(fk, fv, function() {
                        doStop = true;
                    });
                    if (doStop) {
                        findInfo = null;
                    } else {
                        findInfo = p_FindNext(findInfo);
                    }
                }
            };
            var p_Insert = function(key, value) {
                var searchResult = searchLeaf(key);
                var leaf = searchResult.node;
                leaf.keys.insert(searchResult.index, key);
                leaf.values.insert(searchResult.index, value);
                if (leaf.keys.count > m_nodeMaxCount) {
                    if (leaf.prevLeaf != null && leaf.prevLeaf.keys.count < m_nodeMaxCount && leaf.prevLeaf.parent == leaf.parent) {
                        rotateAmongLeavesToLeft(leaf.prevLeaf, leaf);
                    } else if (leaf.nextLeaf != null && leaf.nextLeaf.keys.count < m_nodeMaxCount && leaf.nextLeaf.parent == leaf.parent) {
                        rotateAmongLeavesToRight(leaf, leaf.nextLeaf);
                    } else {
                        splitLeaf(leaf);
                    }
                }
            };
            var splitLeaf = function(leaf) {
                var leftCount = m_nodeMinCount;
                var rightCount = leaf.keys.count - leftCount;
                var newRightLeaf = new B_Plus_Leaf(m_nodeMaxCount);
                newRightLeaf.parent = leaf.parent;
                newRightLeaf.keys.copy_from(leaf.keys, leftCount, rightCount);
                newRightLeaf.values.copy_from(leaf.values, leftCount, rightCount);
                leaf.keys.count = leftCount;
                leaf.values.count = leftCount;
                newRightLeaf.nextLeaf = leaf.nextLeaf;
                if (newRightLeaf.nextLeaf != null) newRightLeaf.nextLeaf.prevLeaf = newRightLeaf;
                newRightLeaf.prevLeaf = leaf;
                leaf.nextLeaf = newRightLeaf;
                if (m_public.lastLeaf == leaf) m_public.lastLeaf = newRightLeaf;
                if (leaf.parent != null) {
                    var leafIndex = calcChildIndex(leaf.parent, leaf);
                    insertToParent(leaf.parent, newRightLeaf, newRightLeaf.keys.first(), leafIndex + 1);
                } else {
                    createNewRoot(leaf, newRightLeaf, newRightLeaf.keys.first());
                }
            };
            var createNewRoot = function(nodeLeft, nodeRight, key) {
                var newRoot = new B_Plus_Node(m_nodeMaxCount);
                newRoot.keys.add(key);
                newRoot.children.add(nodeLeft);
                newRoot.children.add(nodeRight);
                nodeLeft.parent = newRoot;
                nodeRight.parent = newRoot;
                m_public.root = newRoot;
            };
            var insertToParent = function(parentNode, newChildNode, newChildFirstKey, newChildIndex) {
                parentNode.keys.insert(newChildIndex - 1, newChildFirstKey);
                parentNode.children.insert(newChildIndex, newChildNode);
                newChildNode.parent = parentNode;
                if (parentNode.keys.count > m_nodeMaxCount) {
                    splitNode(parentNode);
                }
            };
            var splitNode = function(node) {
                var newLeftCount = m_nodeMinCount;
                var newRightCount = m_nodeMaxCount - newLeftCount;
                var middleKey = node.keys.items[newLeftCount];
                var newRightNode = new B_Plus_Node(m_nodeMaxCount);
                newRightNode.keys.copy_from(node.keys, newLeftCount + 1, newRightCount);
                newRightNode.children.copy_from(node.children, newLeftCount + 1, newRightCount + 1);
                node.keys.count = newLeftCount;
                node.children.count = newLeftCount + 1;
                for (var i = 0; i < newRightNode.children.count; i++) newRightNode.children.items[i].parent = newRightNode;
                if (node.parent == null) {
                    createNewRoot(node, newRightNode, middleKey);
                } else {
                    var nodeIndex = calcChildIndex(node.parent, node);
                    insertToParent(node.parent, newRightNode, middleKey, nodeIndex + 1);
                }
            };
            var p_Remove = function(key, value) {
                var searchResult = searchLeafValue(key, value);
                if (!searchResult.found) return false;
                removeFromLeaf(searchResult.node, searchResult.index);
                return true;
            };
            var p_RemoveKey = function(key) {
                while (true) {
                    var searchResult = searchLeaf(key);
                    if (!searchResult.found) break;
                    removeFromLeaf(searchResult.node, searchResult.index);
                }
            };
            var removeFromLeaf = function(leaf, index) {
                leaf.keys.removeAt(index);
                leaf.values.removeAt(index);
                if (leaf.keys.count < m_nodeMinCount) {
                    if (leaf.prevLeaf != null && leaf.parent == leaf.prevLeaf.parent && leaf.prevLeaf.keys.count > m_nodeMinCount) {
                        rotateAmongLeavesToRight(leaf.prevLeaf, leaf);
                    } else if (leaf.nextLeaf != null && leaf.parent == leaf.nextLeaf.parent && leaf.nextLeaf.keys.count > m_nodeMinCount) {
                        rotateAmongLeavesToLeft(leaf, leaf.nextLeaf);
                    } else {
                        mergeLeaf(leaf);
                    }
                }
                return true;
            };
            var mergeLeaf = function(leaf) {
                if (leaf.parent == null) {
                    return;
                }
                var leftCount = m_nodeMaxCount + 1;
                var rightCount = m_nodeMaxCount + 1;
                if (leaf.prevLeaf != null && leaf.prevLeaf.parent == leaf.parent) {
                    leftCount = leaf.prevLeaf.keys.count;
                }
                if (leaf.nextLeaf != null && leaf.nextLeaf.parent == leaf.parent) {
                    rightCount = leaf.nextLeaf.keys.count;
                }
                if (leftCount < rightCount) {
                    if (leftCount + leaf.keys.count > m_nodeMaxCount) throw "B_Plus_Tree.mergeLeaf(): leftCount";
                    mergeLeaves(leaf.prevLeaf, leaf);
                } else {
                    if (rightCount + leaf.keys.count > m_nodeMaxCount) throw "B_Plus_Tree.mergeLeaf(): rightCount";
                    mergeLeaves(leaf, leaf.nextLeaf);
                }
            };
            var mergeLeaves = function(leafLeft, leafRight) {
                leafLeft.keys.add_from(leafRight.keys);
                leafLeft.values.add_from(leafRight.values);
                leafLeft.nextLeaf = leafRight.nextLeaf;
                if (leafLeft.nextLeaf != null) leafLeft.nextLeaf.prevLeaf = leafLeft;
                if (m_public.lastLeaf == leafRight) m_public.lastLeaf = leafLeft;
                var parent = leafRight.parent;
                var leafRightIndex = calcChildIndex(parent, leafRight);
                parent.keys.removeAt(leafRightIndex - 1);
                parent.children.removeAt(leafRightIndex);
                if (parent.keys.count < m_nodeMinCount) {
                    mergeNode(parent);
                }
            };
            var mergeNode = function(node) {
                var parent = node.parent;
                if (node.parent == null) {
                    if (node.keys.count == 0) {
                        m_public.root = node.children.items[0];
                        m_public.root.parent = null;
                    }
                    return;
                }
                var nodeIndex = calcChildIndex(parent, node);
                var leftSibling = nodeIndex > 0 ? parent.children.items[nodeIndex - 1] : null;
                var rightSibling = nodeIndex + 1 < parent.children.count ? parent.children.items[nodeIndex + 1] : null;
                if (leftSibling != null && leftSibling.keys.count > m_nodeMinCount) {
                    rotateAmongNodesToRight(leftSibling, node);
                    return;
                }
                if (rightSibling != null && rightSibling.keys.count > m_nodeMinCount) {
                    rotateAmongNodesToLeft(node, rightSibling);
                    return;
                }
                var leftCount = m_nodeMaxCount + 1;
                var rightCount = m_nodeMaxCount + 1;
                if (leftSibling != null) {
                    leftCount = leftSibling.keys.count;
                }
                if (rightSibling != null) {
                    rightCount = rightSibling.keys.count;
                }
                if (leftCount < rightCount) {
                    if (leftSibling == null) throw "B_Plus_Tree.mergeNode(): leftSibling";
                    mergeNodes(leftSibling, node, nodeIndex);
                } else {
                    if (rightSibling == null) throw "B_Plus_Tree.mergeNode(): rightSibling";
                    mergeNodes(node, rightSibling, nodeIndex + 1);
                }
            };
            var mergeNodes = function(nodeLeft, nodeRight, nodeRightIndex) {
                var parent = nodeLeft.parent;
                for (var i = 0; i < nodeRight.children.count; i++) nodeRight.children.items[i].parent = nodeLeft;
                nodeLeft.keys.add(nodeLeft.parent.keys.items[nodeRightIndex - 1]);
                nodeLeft.keys.add_from(nodeRight.keys);
                nodeLeft.children.add_from(nodeRight.children);
                parent.keys.removeAt(nodeRightIndex - 1);
                parent.children.removeAt(nodeRightIndex);
                if (parent.keys.count < m_nodeMinCount) {
                    mergeNode(parent);
                }
            };
            var p_FindFirst = function(key, value, isPrefixSearch) {
                var findInfo = FindInfo(key, value, isPrefixSearch);
                if (findInfo.isKeyPresent) {
                    if (findInfo.isPrefixSearch && findInfo.isValuePresent) throw "B_Plus_Tree.p_FindFirst(): arguments error: isPrefixSearch, but value is present";
                    var searchResult = findInfo.isValuePresent ? searchLeafValue(key, value) : searchLeaf(key);
                    findInfo.leaf = searchResult.node;
                    findInfo.index = searchResult.index;
                    if (!searchResult.found) {
                        if (!findInfo.check_prefix()) {
                            return null;
                        }
                    }
                } else {
                    if (findInfo.isValuePresent) throw "B_Plus_Tree.findFirst(): arguments error: key is not present, but value is present";
                    findInfo.leaf = m_public.firstLeaf;
                    findInfo.index = 0;
                    if (findInfo.leaf.keys.count <= 0) return null;
                }
                return findInfo;
            };
            var p_FindLast = function(key, value, isPrefixSearch) {
                var findInfo = new FindInfo(key, value, isPrefixSearch);
                if (findInfo.isKeyPresent) {
                    if (findInfo.isPrefixSearch && findInfo.isValuePresent) throw "B_Plus_Tree.p_FindLast(): arguments error: isPrefixSearch, but value is present";
                    if (findInfo.isPrefixSearch) {
                        var searchResult = searchLastLeafByPrefix(key);
                        findInfo.leaf = searchResult.node;
                        findInfo.index = searchResult.index;
                        if (!searchResult.found) {
                            return null;
                        }
                    } else {
                        var searchResult = findInfo.isValuePresent ? searchLastLeafValue(key, value) : searchLastLeaf(key);
                        findInfo.leaf = searchResult.node;
                        findInfo.index = searchResult.index;
                        if (!searchResult.found) {
                            return null;
                        }
                    }
                } else {
                    if (findInfo.isValuePresent) throw "B_Plus_Tree.findLast(): arguments error: key is not present, but value is present";
                    findInfo.leaf = m_public.lastLeaf;
                    findInfo.index = findInfo.leaf.keys.count - 1;
                    if (findInfo.index < 0) return null;
                }
                return findInfo;
            };
            var findGoToNext = function(findInfo) {
                findInfo.index++;
                if (findInfo.index >= findInfo.leaf.keys.count) {
                    findInfo.leaf = findInfo.leaf.nextLeaf;
                    findInfo.index = 0;
                }
                return findInfo.leaf != null;
            };
            var findGoToPrev = function(findInfo) {
                findInfo.index--;
                if (findInfo.index < 0) {
                    findInfo.leaf = findInfo.leaf.prevLeaf;
                    if (findInfo.leaf == null) return false;
                    findInfo.index = findInfo.leaf.keys.count - 1;
                }
                return true;
            };
            var p_FindNext = function(findInfo) {
                while (true) {
                    if (!findGoToNext(findInfo)) return null;
                    if (findInfo.isPrefixSearch) {
                        if (!findInfo.check_prefix()) return null;
                    } else {
                        if (findInfo.isKeyPresent && findInfo.key != findInfo.foundKey()) return null;
                    }
                    if (findInfo.isValuePresent) {
                        if (findInfo.value == findInfo.foundValue()) return findInfo;
                    } else {
                        return findInfo;
                    }
                }
            };
            var p_FindPrev = function(findInfo) {
                while (true) {
                    if (!findGoToPrev(findInfo)) return null;
                    if (findInfo.isPrefixSearch) {
                        if (!findInfo.check_prefix()) return null;
                    } else {
                        if (findInfo.isKeyPresent && findInfo.key != findInfo.foundKey()) return null;
                    }
                    if (findInfo.isValuePresent) {
                        if (findInfo.value == findInfo.foundValue()) return findInfo;
                    } else {
                        return findInfo;
                    }
                }
            };
            var p_get_values_by_key = function(key) {
                var res = [];
                var findInfo = p_FindFirst(key);
                while (findInfo != null) {
                    res.push(findInfo.foundValue());
                    findInfo = p_FindNext(findInfo);
                }
                return res;
            };
            var p_get_by_prefix = function(prefix) {
                var res = [];
                var findInfo = m_public.findFirstPrefix(prefix);
                while (findInfo != null) {
                    res.push([ findInfo.foundKey(), findInfo.foundValue() ]);
                    findInfo = m_public.findNext(findInfo);
                }
                return res;
            };
            var p_get_keys_by_prefix = function(prefix) {
                var res = [];
                var findInfo = m_public.findFirstPrefix(prefix);
                while (findInfo != null) {
                    res.push(findInfo.foundKey());
                    findInfo = m_public.findNext(findInfo);
                }
                return res;
            };
            var p_GetValue = function(key) {
                var searchResult = searchLeaf(key);
                if (!searchResult.found) return null;
                return searchResult.node.values.items[searchResult.index];
            };
            var p_SetValue = function(key, value) {
                var searchResult = searchLeaf(key);
                if (searchResult.found) {
                    removeFromLeaf(searchResult.node, searchResult.index);
                }
                p_Insert(key, value);
            };
            var p_Count = function() {
                var result = 0;
                var leaf = m_public.firstLeaf;
                while (leaf != null) {
                    result += leaf.keys.count;
                    leaf = leaf.nextLeaf;
                }
                return result;
            };
            var p_CountKey = function(key) {
                var result = 0;
                var findInfo = m_public.findFirst(key);
                while (findInfo != null) {
                    result++;
                    findInfo = m_public.findNext(findInfo);
                }
                return result;
            };
            var rotateAmongNodesToLeft = function(leftNode, rightNode) {
                var parent = rightNode.parent;
                var rightIndex = calcChildIndex(parent, rightNode);
                leftNode.keys.add(parent.keys.items[rightIndex - 1]);
                parent.keys.items[rightIndex - 1] = rightNode.keys.first();
                rightNode.keys.removeFirst();
                rightNode.children.first().parent = leftNode;
                leftNode.children.add(rightNode.children.first());
                rightNode.children.removeFirst();
            };
            var rotateAmongNodesToRight = function(leftNode, rightNode) {
                var parent = rightNode.parent;
                var rightIndex = calcChildIndex(parent, rightNode);
                rightNode.keys.insert(0, parent.keys.items[rightIndex - 1]);
                parent.keys.items[rightIndex - 1] = leftNode.keys.last();
                leftNode.keys.removeLast();
                rightNode.children.insert(0, leftNode.children.last());
                rightNode.children.first().parent = rightNode;
                leftNode.children.removeLast();
            };
            var rotateAmongLeavesToLeft = function(leftLeaf, rightLeaf) {
                var rightIndex = calcChildIndex(rightLeaf.parent, rightLeaf);
                leftLeaf.keys.add(rightLeaf.keys.first());
                leftLeaf.values.add(rightLeaf.values.first());
                rightLeaf.keys.removeFirst();
                rightLeaf.values.removeFirst();
                rightLeaf.parent.keys.items[rightIndex - 1] = rightLeaf.keys.first();
            };
            var rotateAmongLeavesToRight = function(leftLeaf, rightLeaf) {
                var rightIndex = calcChildIndex(rightLeaf.parent, rightLeaf);
                rightLeaf.keys.insert(0, leftLeaf.keys.last());
                rightLeaf.values.insert(0, leftLeaf.values.last());
                leftLeaf.keys.removeLast();
                leftLeaf.values.removeLast();
                rightLeaf.parent.keys.items[rightIndex - 1] = rightLeaf.keys.first();
            };
            var calcChildIndex = function(node, child) {
                var key = child.keys.first();
                var searchResult = node.keys.search_first(key);
                if (!searchResult.found) {
                    if (node.children.items[searchResult.index] != child) throw "B_PlusTree.calcChildIndex(): 1";
                    return searchResult.index;
                }
                var index = searchResult.index;
                for (;;) {
                    if (node.children.items[index] == child) return index;
                    index++;
                    if (index >= node.children.count) break;
                    if (node.keys.items[index - 1] != key) break;
                }
                throw "B_PlusTree.calcChildIndex(): 2";
            };
            var searchLeaf = function(key) {
                var doSearchLeaf = function(node, key) {
                    var searchResult = node.keys.search_first(key);
                    if (node.isLeaf) {
                        return {
                            node: node,
                            found: searchResult.found,
                            index: searchResult.index
                        };
                    }
                    if (searchResult.found) {
                        var resultLeft = doSearchLeaf(node.children.items[searchResult.index], key);
                        if (resultLeft.found) return resultLeft;
                        return doSearchLeaf(node.children.items[searchResult.index + 1], key);
                    } else {
                        return doSearchLeaf(node.children.items[searchResult.index], key);
                    }
                };
                return doSearchLeaf(m_public.root, key);
            };
            var searchLastLeaf = function(key) {
                var doSearchLastLeaf = function(node, key) {
                    var searchResult = node.keys.search_last(key);
                    if (node.isLeaf) {
                        return {
                            node: node,
                            found: searchResult.found,
                            index: searchResult.index
                        };
                    }
                    if (searchResult.found) {
                        var resultRight = doSearchLastLeaf(node.children.items[searchResult.index + 1], key);
                        if (resultRight.found) return resultRight;
                        return doSearchLastLeaf(node.children.items[searchResult.index], key);
                    } else {
                        return doSearchLastLeaf(node.children.items[searchResult.index], key);
                    }
                };
                return doSearchLastLeaf(m_public.root, key);
            };
            var searchLastLeafByPrefix = function(prefix) {
                var doSearchLastLeafByPrefix = function(node, prefix) {
                    var searchResult = node.keys.search_last_prefix(prefix);
                    if (node.isLeaf) {
                        return {
                            node: node,
                            found: searchResult.found,
                            index: searchResult.index
                        };
                    }
                    if (searchResult.found) {
                        var resultRight = doSearchLastLeafByPrefix(node.children.items[searchResult.index + 1], prefix);
                        if (resultRight.found) return resultRight;
                        return doSearchLastLeafByPrefix(node.children.items[searchResult.index], prefix);
                    } else {
                        return doSearchLastLeafByPrefix(node.children.items[searchResult.index], prefix);
                    }
                };
                return doSearchLastLeafByPrefix(m_public.root, prefix);
            };
            var searchLeafValue = function(key, value) {
                var searchResult = searchLeaf(key);
                if (!searchResult.found) return searchResult;
                var valueFound = false;
                var leaf = searchResult.node;
                var index = searchResult.index;
                for (;;) {
                    if (index >= leaf.values.count) {
                        leaf = leaf.nextLeaf;
                        if (leaf == null) break;
                        index = 0;
                    }
                    if (leaf.keys.items[index] != key) break;
                    if (leaf.values.items[index] == value) {
                        valueFound = true;
                        break;
                    }
                    index++;
                }
                return {
                    node: leaf,
                    found: valueFound,
                    index: index
                };
            };
            var searchLastLeafValue = function(key, value) {
                var searchResult = searchLastLeaf(key);
                if (!searchResult.found) return searchResult;
                var valueFound = false;
                var leaf = searchResult.node;
                var index = searchResult.index;
                for (;;) {
                    if (index < 0) {
                        leaf = leaf.prevLeaf;
                        if (leaf == null) break;
                        index = leaf.values.count - 1;
                    }
                    if (leaf.keys.items[index] != key) break;
                    if (leaf.values.items[index] == value) {
                        valueFound = true;
                        break;
                    }
                    index--;
                }
                return {
                    node: leaf,
                    found: valueFound,
                    index: index
                };
            };
            return m_public;
        };
        B_Plus_Tree.FindInfo = FindInfo;
        module.exports = B_Plus_Tree;
    }, {
        "./stiffarray": 87
    } ],
    87: [ function(require, module, exports) {
        var StiffArray = function(capacity) {
            var m_public = {
                items: new Array(capacity),
                count: 0,
                first: function() {
                    if (this.count == 0) throw "StiffArray.first()";
                    return this.items[0];
                },
                last: function() {
                    if (this.count == 0) throw "StiffArray.last()";
                    return this.items[this.count - 1];
                },
                add: function(item) {
                    if (this.count >= capacity) throw "StiffArray.add()";
                    this.items[this.count++] = item;
                },
                add_from: function(source) {
                    if (this.count + source.count > capacity) throw "StiffArray.add_from()";
                    for (var i = 0; i < source.count; i++) this.items[this.count++] = source.items[i];
                },
                insert: function(index, item) {
                    if (index < 0 || index > this.count) throw "StiffArray.insert(): index";
                    if (this.count >= capacity) throw "StiffArray.insert(): overflow";
                    for (var i = this.count; i > index; i--) this.items[i] = this.items[i - 1];
                    this.items[index] = item;
                    this.count++;
                },
                removeAt: function(index) {
                    if (index < 0 || index >= this.count) throw "StiffArray.removeAt()";
                    this.count--;
                    for (var i = index; i < this.count; i++) this.items[i] = this.items[i + 1];
                },
                removeFirst: function() {
                    this.removeAt(0);
                },
                removeLast: function() {
                    this.removeAt(this.count - 1);
                },
                copy_from: function(source, index, count) {
                    for (var i = 0; i < count; i++) {
                        this.items[i] = source.items[i + index];
                    }
                    this.count = count;
                },
                search_first: function(item) {
                    var cnt = this.count;
                    var first = 0;
                    while (cnt > 0) {
                        var step = Math.floor(cnt / 2);
                        var index = first + step;
                        if (this.items[index] < item) {
                            first = index + 1;
                            cnt -= step + 1;
                        } else {
                            cnt = step;
                        }
                    }
                    if (first < this.count) {
                        return {
                            found: this.items[first] == item,
                            index: first
                        };
                    }
                    return {
                        found: false,
                        index: first
                    };
                },
                search_last: function(item) {
                    var cnt = this.count;
                    var first = 0;
                    while (cnt > 0) {
                        var step = Math.floor(cnt / 2);
                        var index = first + step;
                        if (item >= this.items[index]) {
                            first = index + 1;
                            cnt -= step + 1;
                        } else {
                            cnt = step;
                        }
                    }
                    if (first > 0 && first <= this.count) {
                        if (this.items[first - 1] == item) {
                            return {
                                found: true,
                                index: first - 1
                            };
                        }
                    }
                    return {
                        found: false,
                        index: first
                    };
                },
                search_last_prefix: function(prefix) {
                    var prefix_length = prefix.length;
                    var check_prefix = function(item) {
                        if (prefix_length > item.length) return false;
                        return item.substr(0, prefix_length) == prefix;
                    };
                    var cnt = this.count;
                    var first = 0;
                    while (cnt > 0) {
                        var step = Math.floor(cnt / 2);
                        var index = first + step;
                        var item = this.items[index];
                        if (prefix > item || check_prefix(item)) {
                            first = index + 1;
                            cnt -= step + 1;
                        } else {
                            cnt = step;
                        }
                    }
                    if (first > 0 && first <= this.count) {
                        if (check_prefix(this.items[first - 1])) {
                            return {
                                found: true,
                                index: first - 1
                            };
                        }
                    }
                    return {
                        found: false,
                        index: first
                    };
                },
                toString: function() {
                    return this.items.slice(0, this.count).toString();
                }
            };
            return m_public;
        };
        module.exports = StiffArray;
    }, {} ],
    88: [ function(require, module, exports) {
        var jsgui = require("./essentials");
        var Data_Value = require("./data-value");
        var Data_Object = require("./data-object");
        var Sorted_KVS = require("./sorted-kvs");
        var dobj = Data_Object.dobj;
        var Constraint = Data_Object.Constraint;
        var j = jsgui;
        var Class = j.Class;
        var each = j.each;
        var eac = j.eac;
        var is_array = j.is_array;
        var is_dom_node = j.is_dom_node;
        var is_ctrl = j.is_ctrl;
        var extend = j.extend;
        var clone = j.clone;
        var x_clones = j.x_clones;
        var get_truth_map_from_arr = j.get_truth_map_from_arr;
        var get_map_from_arr = j.get_map_from_arr;
        var arr_like_to_arr = j.arr_like_to_arr;
        var tof = j.tof;
        var is_defined = j.is_defined;
        var stringify = j.stringify;
        var functional_polymorphism = j.functional_polymorphism;
        var fp = j.fp;
        var arrayify = j.arrayify;
        var mapify = j.mapify;
        var are_equal = j.are_equal;
        var get_item_sig = j.get_item_sig;
        var set_vals = j.set_vals;
        var truth = j.truth;
        var trim_sig_brackets = j.trim_sig_brackets;
        var iterate_ancestor_classes = j.iterate_ancestor_classes;
        var is_constructor_fn = j.is_constructor_fn;
        var get_a_sig = j.get_a_sig;
        var is_arr_of_strs = j.is_arr_of_strs;
        var is_arr_of_arrs = j.is_arr_of_arrs;
        var input_processors = j.input_processors;
        var native_constructor_tof = jsgui.native_constructor_tof;
        var dop = Data_Object.prototype;
        class Collection extends Data_Object {
            constructor(spec, arr_values) {
                super(spec);
                spec = spec || {};
                this.__type = "collection";
                this.__type_name = "collection";
                var spec = spec || {};
                var t_spec = tof(spec);
                if (spec.abstract === true) {
                    if (t_spec === "function") {
                        this.constraint(spec);
                    }
                } else {
                    this._relationships = this._relationships || {};
                    this._arr_idx = 0;
                    this._arr = [];
                    this.index = new Sorted_KVS();
                    this.fn_index = spec.fn_index;
                    if (t_spec == "array") {
                        spec = {
                            load_array: spec
                        };
                    } else {
                        if (t_spec == "function") {
                            if (spec.abstract === true) {
                                this._abstract = true;
                            } else {}
                        } else if (t_spec == "string") {
                            var map_native_constructors = {
                                array: Array,
                                boolean: Boolean,
                                number: Number,
                                string: String,
                                object: Object
                            };
                            var nc = map_native_constructors[spec];
                            if (nc) {
                                spec = {
                                    constraint: nc
                                };
                                if (nc == String) {
                                    spec.index_by = "value";
                                }
                            }
                        }
                    }
                    if (is_defined(spec.items)) {
                        spec.load_array = spec.load_array || spec.items;
                    }
                    if (arr_values) {
                        spec.load_array = arr_values;
                    }
                    if (is_defined(spec.accepts)) {
                        this._accepts = spec.accepts;
                    }
                    if (jsgui.__data_id_method === "init") {
                        if (this.context) {
                            this.__id = this.context.new_id(this.__type_name || this.__type);
                            this.context.map_objects[this.__id] = this;
                        } else {}
                    }
                    if (!this.__type) {}
                    if (spec.load_array) {
                        this.load_array(spec.load_array);
                    }
                }
            }
            set(value) {
                var tval = tof(value);
                var that = this;
                if (tval == "data_object") {
                    this.clear();
                    return this.push(value);
                } else if (tval == "array") {
                    this.clear();
                    each(value, function(v, i) {
                        that.push(v);
                    });
                } else {
                    if (tval == "collection") {
                        throw "stop";
                        this.clear();
                        value.each(function(v, i) {
                            that.push(v);
                        });
                    } else {
                        return this._super(value);
                    }
                }
            }
            clear() {
                this._arr_idx = 0;
                this._arr = [];
                this.index.clear();
                this.raise("change", {
                    type: "clear"
                });
            }
            stringify() {
                var res = [];
                if (this._abstract) {
                    var ncto = native_constructor_tof(this._type_constructor);
                    res.push("~Collection(");
                    if (ncto) {
                        res.push(ncto);
                    } else {}
                    res.push(")");
                } else {
                    res.push("Collection(");
                    var first = true;
                    this.each(function(v, i) {
                        if (!first) {
                            res.push(", ");
                        } else {
                            first = false;
                        }
                        res.push(stringify(v));
                    });
                    res.push(")");
                }
                return res.join("");
            }
            toString() {
                return stringify(this._arr);
            }
            toObject() {
                var res = [];
                this.each(function(v, i) {
                    res.push(v.toObject());
                });
                return res;
            }
            each() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[f]") {
                    return each(this._arr, a[0]);
                } else {
                    if (sig == "[X,f]") {
                        var index = a[0];
                        var callback = a[1];
                        return index.each(callback);
                    } else {
                        if (a.l == 2) {
                            return each(this._arr, a[0], a[1]);
                        }
                    }
                }
            }
            _id() {
                if (this.context) {
                    this.__id = this.context.new_id(this.__type_name || this.__type);
                } else {
                    if (!is_defined(this.__id)) {}
                }
                return this.__id;
            }
            length() {
                return this._arr.length;
            }
            find() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (a.l == 1) {
                    var pos = this.index.get(a[0])[0];
                    var item = this._arr[pos];
                    return item;
                    var index_system_find_res = this.index_system.find(a[0]);
                    if (index_system_find_res === false) {
                        var foundItems = [];
                        each(this, function(index, item) {
                            throw "stop";
                        });
                    } else {
                        if (index_system_find_res) {
                            return index_system_find_res;
                        } else {
                            return [];
                        }
                    }
                }
                if (sig == "[o,s]") {
                    return this.index_system.find(a[0], a[1]);
                }
                if (sig == "[s,s]") {
                    return this.index_system.find(a[0], a[1]);
                }
                if (sig == "[a,s]") {
                    return this.index_system.find(a[0], a[1]);
                }
                if (sig == "[s,o]") {
                    var propertyName = a[0];
                    var query = a[1];
                    var foundItems = [];
                    each(this, function(item, index) {
                        if (item.get) {
                            var itemProperty = item.get(propertyName);
                        } else {
                            var itemProperty = item[propertyName];
                        }
                        var tip = tof(itemProperty);
                        var tip2;
                        var ip2;
                        if (tip === "data_value") {
                            var ip2 = itemProperty.value();
                            tip2 = tof(ip2);
                        } else {
                            ip2 = itemProperty;
                            tip2 = tip;
                        }
                        if (tip2 === "array") {
                            each(ip2, function(v, i) {
                                var matches = obj_matches_query_obj(v, query);
                                if (matches) {
                                    foundItems.push(v);
                                }
                            });
                        }
                    });
                    var res = new Collection(foundItems);
                    return res;
                }
            }
            get() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[n]" || sig == "[i]") {
                    return this._arr[a[0]];
                }
                if (sig == "[s]") {
                    var ix_sys = this.index_system;
                    var res;
                    if (ix_sys) {
                        var pui = ix_sys._primary_unique_index;
                        res = pui.get(a[0])[0];
                    }
                    if (res) {
                        return res;
                    }
                    return Data_Object.prototype.get.apply(this, a);
                }
            }
            insert(item, pos) {
                this._arr.splice(pos, 0, item);
                this.trigger("change", {
                    name: "insert",
                    item: item,
                    pos: pos
                });
            }
            remove() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                var that = this;
                if (sig == "[n]") {
                    var own_id = this._id();
                    var pos = a[0];
                    var item = this._arr[pos];
                    var o_item = item;
                    var spliced_pos = pos;
                    this._arr.splice(pos, 1);
                    this._arr_idx--;
                    var length = this._arr.length;
                    while (pos < length) {
                        var item = this._arr[pos];
                        item.relationships[own_id] = [ that, pos ];
                        pos++;
                    }
                    this.index_system.remove(o_item);
                    var e = {
                        target: this,
                        item: item,
                        position: spliced_pos
                    };
                    this.raise_event(that, "remove", e);
                }
                if (sig == "[s]") {
                    var key = a[0];
                    var obj = this.index_system.find([ [ "value", key ] ]);
                    var my_id = this.__id;
                    var item_pos_within_this = obj[0]._relationships[my_id];
                    this.index_system.remove(key);
                    this._arr.splice(item_pos_within_this, 1);
                    for (var c = item_pos_within_this, l = this._arr.length; c < l; c++) {
                        var item = this._arr[c];
                        item._relationships[my_id]--;
                    }
                    var e = {
                        target: this,
                        item: obj[0],
                        position: item_pos_within_this
                    };
                    this.raise(that, "remove", e);
                }
            }
            has(obj_key) {}
            get_index() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig === "[s]") {
                    return this.index_system.search(a[0]);
                }
            }
            index_by() {
                var that = this;
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
            }
            push(value) {
                var tv = tof(value);
                var fn_index = this.fn_index;
                var idx_key, has_idx_key = false, pos;
                if (fn_index) {
                    idx_key = fn_index(value);
                    has_idx_key = true;
                }
                if (tv === "object" || tv === "function") {
                    pos = this._arr.length;
                    this._arr.push(value);
                    this._arr_idx++;
                    var e = {
                        target: this,
                        item: value,
                        position: pos,
                        type: "insert"
                    };
                    this.raise("change", e);
                }
                if (tv == "collection") {}
                if (tv == "data_object" || tv == "control") {
                    pos = this._arr.length;
                    this._arr.push(value);
                    this._arr_idx++;
                    var e = {
                        target: this,
                        item: value,
                        position: pos,
                        type: "insert"
                    };
                    this.raise("change", e);
                }
                if (tv === "array") {
                    var new_coll = new Collection(value);
                    console.log("new_coll", new_coll);
                    pos = this._arr.length;
                    this._arr.push(new_coll);
                    var e = {
                        target: this,
                        item: new_coll,
                        position: pos,
                        type: "insert"
                    };
                    this.raise("change", e);
                }
                if (tv == "string" || tv == "number") {
                    var dv = new Data_Value({
                        value: value
                    });
                    pos = this._arr.length;
                    this._arr.push(dv);
                    var e = {
                        target: this,
                        item: dv,
                        position: pos,
                        type: "insert"
                    };
                    this.raise("change", e);
                }
                if (has_idx_key) {
                    this.index.put(idx_key, pos);
                }
                return value;
            }
            load_array(arr) {
                var that = this;
                console.log("load_array arr ", arr);
                for (var c = 0, l = arr.length; c < l; c++) {
                    that.push(arr[c]);
                }
                this.raise("load");
            }
            values() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (a.l == 0) {
                    return this._arr;
                } else {
                    var stack = new Error().stack;
                    throw "not yet implemented";
                }
            }
            value() {
                var res = [];
                this.each(function(v, i) {
                    if (typeof v.value == "function") {
                        res.push(v.value());
                    } else {
                        res.push(v);
                    }
                });
                return res;
            }
        }
        var p = Collection.prototype;
        p.add = p.push;
        module.exports = Collection;
    }, {
        "./data-object": 89,
        "./data-value": 90,
        "./essentials": 92,
        "./sorted-kvs": 97
    } ],
    89: [ function(require, module, exports) {
        var jsgui = require("./essentials");
        var Evented_Class = require("./evented-class");
        var Data_Value = require("./data-value");
        var j = jsgui;
        var Class = j.Class;
        var each = j.each;
        var is_array = j.is_array;
        var is_dom_node = j.is_dom_node;
        var is_ctrl = j.is_ctrl;
        var extend = j.extend;
        var get_truth_map_from_arr = j.get_truth_map_from_arr;
        var get_map_from_arr = j.get_map_from_arr;
        var arr_like_to_arr = j.arr_like_to_arr;
        var tof = j.tof;
        var is_defined = j.is_defined;
        var stringify = j.stringify;
        var functional_polymorphism = j.functional_polymorphism;
        var fp = j.fp;
        var arrayify = j.arrayify;
        var mapify = j.mapify;
        var are_equal = j.are_equal;
        var get_item_sig = j.get_item_sig;
        var get_a_sig = j.get_a_sig;
        var set_vals = j.set_vals;
        var truth = j.truth;
        var trim_sig_brackets = j.trim_sig_brackets;
        var ll_set = j.ll_set;
        var ll_get = j.ll_get;
        var input_processors = j.input_processors;
        var iterate_ancestor_classes = j.iterate_ancestor_classes;
        var is_arr_of_arrs = j.is_arr_of_arrs;
        var is_arr_of_strs = j.is_arr_of_strs;
        var is_arr_of_t = j.is_arr_of_t;
        var clone = jsgui.clone;
        var data_value_index = 0;
        jsgui.__data_id_method = "init";
        var Ordered_String_List = require("./ordered-string-list");
        class Mini_Context {
            constructor(spec) {
                var map_typed_counts = {};
                var typed_id = function(str_type) {
                    throw "stop Mini_Context typed id";
                    var res;
                    if (!map_typed_counts[str_type]) {
                        res = str_type + "_0";
                        map_typed_counts[str_type] = 1;
                    } else {
                        res = str_type + "_" + map_typed_counts[str_type];
                        map_typed_counts[str_type]++;
                    }
                    return res;
                };
                this.new_id = typed_id;
            }
            make(abstract_object) {
                if (abstract_object._abstract) {
                    var constructor = abstract_object.constructor;
                    var aos = abstract_object._spec;
                    aos.abstract = null;
                    aos.context = this;
                    var res = new constructor(aos);
                    return res;
                } else {
                    throw "Object must be abstract, having ._abstract == true";
                }
            }
        }
        var is_js_native = function(obj) {
            var t = tof(obj);
            return t == "number" || t == "string" || t == "boolean" || t == "array";
        };
        class Data_Object extends Evented_Class {
            constructor(spec) {
                super(spec);
                this.__data_object = true;
                if (!spec) spec = {};
                if (spec.abstract === true) {
                    this._abstract = true;
                    var tSpec = tof(spec);
                    if (tSpec == "function") {
                        this._type_constructor = spec;
                    }
                    if (tSpec == "object") {
                        this._spec = spec;
                    }
                } else {
                    var that = this;
                    this._initializing = true;
                    var t_spec = tof(spec);
                    if (!this.__type) {
                        this.__type = "data_object";
                    }
                    this.__type_name = spec.__type_name || "data_object";
                    if (t_spec == "object") {
                        if (spec.context) {
                            this.context = spec.context;
                        }
                        if (spec._id) {
                            this.__id = spec._id;
                        }
                    }
                    if (t_spec == "data_object") {
                        if (spec.context) this.context = spec.context;
                        each(spec_keys, function(i, key) {
                            that.set(key, spec.get(key));
                        });
                    }
                    if (!is_defined(this.__id) && jsgui.__data_id_method == "init") {
                        if (this.context) {
                            this.__id = this.context.new_id(this.__type_name || this.__type);
                        } else {}
                    }
                    if (is_defined(spec.parent)) {
                        this.set("parent", spec.parent);
                    }
                    if (this.context) {
                        this.init_default_events();
                    }
                    this._initializing = false;
                }
            }
            init_default_events() {}
            keys() {
                return Object.keys(this._);
            }
            toJSON() {
                var res = [];
                res.push("Data_Object(" + JSON.stringify(this._) + ")");
                return res.join("");
            }
            toObject() {
                var res = {};
                return res;
            }
            parent() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                var obj, index;
                if (a.l === 0) {
                    return this._parent;
                }
                if (a.l == 1) {
                    obj = a[0];
                    if (!this.context && obj.context) {
                        this.context = obj.context;
                    }
                    var relate_by_id = function(that) {
                        var obj_id = obj._id();
                        that._relationships[obj_id] = true;
                    };
                    var relate_by_ref = function(that) {
                        that._parent = obj;
                    };
                    relate_by_ref(this);
                }
                if (a.l == 2) {
                    obj = a[0];
                    index = a[1];
                    if (!this.context && obj.context) {
                        this.context = obj.context;
                    }
                    this._parent = obj;
                    this._index = index;
                }
                if (is_defined(index)) {} else {}
            }
            _id() {
                if (this.__id) return this.__id;
                if (this.context) {
                    this.__id = this.context.new_id(this.__type_name || this.__type);
                } else {
                    if (this._abstract) {
                        return undefined;
                    } else if (!is_defined(this.__id)) {
                        throw "stop, currently unsupported.";
                        this.__id = new_data_object_id();
                        console.log("!!! no context __id " + this.__id);
                    }
                }
                return this.__id;
            }
            each(callback) {
                each(this._, callback);
            }
            position_within(parent) {
                var p_id = parent._id();
                if (this._parents && is_defined(this._parents[p_id])) {
                    var parent_rel_info = this._parents[p_id];
                    var pos_within = parent_rel_info[1];
                    return pos_within;
                }
            }
            remove_from(parent) {
                var p_id = parent._id();
                if (this._parents && is_defined(this._parents[p_id])) {
                    var parent = this._parents[p_id][0];
                    var pos_within = this._parents[p_id][1];
                    var item = parent._arr[pos_within];
                    parent.remove(pos_within);
                    delete this._parents[p_id];
                }
            }
            load_from_spec(spec, arr_item_names) {
                var that = this;
                each(arr_item_names, function(v, i) {
                    var spec_item = spec[v];
                    if (is_defined(spec_item)) {
                        that.set(v, spec_item);
                    }
                });
            }
            get() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                var do_typed_processing = false;
                if (do_typed_processing) {
                    if (a.l === 0) {
                        var output_obj = jsgui.output_processors[this.__type_name](this._);
                        return output_obj;
                    } else {
                        console.log("a", a);
                        console.trace();
                        throw "not yet implemented";
                    }
                } else {
                    if (sig == "[s,f]") {
                        throw "Asyncronous access not allowed on Data_Object get.";
                        var res = this.get(a[0]);
                        var callback = a[1];
                        if (typeof res == "function") {
                            res(callback);
                        } else {
                            return res;
                        }
                    }
                    if (sig == "[s]") {
                        var res = ll_get(this._, a[0]);
                        if (!res) {
                            res = this[a[0]];
                        }
                        return res;
                    } else if (a.l === 0) {
                        return this._;
                    }
                }
            }
            set() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (this._abstract) return false;
                var that = this, res;
                var input_processors = jsgui.input_processors;
                if (a.l == 2 || a.l == 3) {
                    var property_name = a[0], value = a[1];
                    var ta2 = tof(a[2]);
                    var silent = false;
                    var source;
                    if (ta2 == "string" || ta2 == "boolean") {
                        silent = a[2];
                    }
                    if (ta2 == "control") {
                        source = a[2];
                    }
                    if (!this._initializing && this._map_read_only && this._map_read_only[property_name]) {
                        throw 'Property "' + property_name + '" is read-only.';
                    } else {
                        var split_pn = property_name.split(".");
                        if (split_pn.length > 1 && property_name != ".") {
                            var spn_first = split_pn[0];
                            var spn_arr_next = split_pn.slice(1);
                            var data_object_next = this.get(spn_first);
                            if (data_object_next) {
                                res = data_object_next.set(spn_arr_next.join("."), value);
                                if (!silent) {
                                    var e_change = {
                                        name: property_name,
                                        value: value,
                                        bubbled: true
                                    };
                                    if (source) {
                                        e_change.source = source;
                                    }
                                    this.raise_event("change", e_change);
                                }
                            } else {
                                throw "No data object at this level.";
                            }
                        } else {
                            var data_object_next = this.get(property_name);
                            console.log("data_object_next", data_object_next);
                            if (data_object_next) {
                                var field = this.field(property_name);
                                if (field) {
                                    data_object_next.__type_name = field[1] || data_object_next.__type_name;
                                }
                                data_object_next.set(value);
                            }
                            if (!is_defined(data_object_next)) {
                                var tv = typeof value;
                                var dv;
                                if (tv === "string" || tv === "number" || tv === "boolean" || tv === "date") {
                                    dv = new Data_Value({
                                        value: value
                                    });
                                } else {
                                    if (tv === "array") {
                                        dv = new Data_Value({
                                            value: value
                                        });
                                    } else {
                                        if (tv === "object") {
                                            if (value.__data_object || value.__data_value || value.__data_grid) {
                                                dv = value;
                                            } else {
                                                dv = new Data_Value({
                                                    value: value
                                                });
                                            }
                                        } else {
                                            dv = value;
                                        }
                                    }
                                }
                                this._[property_name] = dv;
                                if (!silent) {
                                    e_change = {
                                        name: property_name,
                                        value: dv
                                    };
                                    if (source) {
                                        e_change.source = source;
                                    }
                                    this.raise_event("change", e_change);
                                }
                                return value;
                            } else {
                                var next_is_js_native = is_js_native(data_object_next);
                                if (next_is_js_native) {
                                    this._[property_name] = value;
                                    res = value;
                                } else {
                                    res = data_object_next;
                                    this._[property_name] = data_object_next;
                                }
                                if (!silent) {
                                    var e_change = {
                                        name: property_name,
                                        value: data_object_next.value()
                                    };
                                    if (source) {
                                        e_change.source = source;
                                    }
                                    this.trigger("change", e_change);
                                }
                                return res;
                            }
                        }
                    }
                } else {
                    var value = a[0];
                    var property_name = a[1];
                    var input_processor = input_processors[this.__type_name];
                    if (input_processor) {
                        var processed_input = input_processor(value);
                        value = processed_input;
                        this._[property_name] = value;
                        this.raise_event("change", {
                            value: value
                        });
                        return value;
                    } else {
                        if (sig == "[D]") {
                            this._[property_name] = value;
                            this.raise_event("change", [ property_name, value ]);
                            return value;
                        }
                        if (sig == "[o]") {
                            res = {};
                            each(a[0], function(v, i) {
                                res[i] = that.set(i, v);
                            });
                            return res;
                        }
                        if (sig == "[c]") {
                            this._[property_name] = value;
                            this.raise_event("change", [ property_name, value ]);
                            return value;
                        }
                    }
                }
            }
            has(property_name) {
                return is_defined(this.get(property_name));
            }
        }
        jsgui.map_classes = {};
        var dobj = (obj, data_def) => {
            var cstr = Data_Object;
            var res;
            if (data_def) {
                res = new cstr({
                    data_def: data_def
                });
            } else {
                res = new cstr({});
            }
            var tobj = tof(obj);
            if (tobj == "object") {
                var res_set = res.set;
                each(obj, function(v, i) {
                    res_set.call(res, i, v);
                });
            }
            return res;
        };
        Data_Object.dobj = dobj;
        Data_Object.Mini_Context = Mini_Context;
        module.exports = Data_Object;
    }, {
        "./data-value": 90,
        "./essentials": 92,
        "./evented-class": 93,
        "./ordered-string-list": 96
    } ],
    90: [ function(require, module, exports) {
        var jsgui = require("./essentials");
        var Evented_Class = require("./evented-class");
        var j = jsgui;
        var Class = j.Class;
        var each = j.each;
        var is_array = j.is_array;
        var is_dom_node = j.is_dom_node;
        var is_ctrl = j.is_ctrl;
        var extend = j.extend;
        var get_truth_map_from_arr = j.get_truth_map_from_arr;
        var get_map_from_arr = j.get_map_from_arr;
        var arr_like_to_arr = j.arr_like_to_arr;
        var tof = j.tof;
        var is_defined = j.is_defined;
        var stringify = j.stringify;
        var functional_polymorphism = j.functional_polymorphism;
        var fp = j.fp;
        var arrayify = j.arrayify;
        var mapify = j.mapify;
        var are_equal = j.are_equal;
        var get_item_sig = j.get_item_sig;
        var set_vals = j.set_vals;
        var truth = j.truth;
        var trim_sig_brackets = j.trim_sig_brackets;
        var ll_set = j.ll_set;
        var ll_get = j.ll_get;
        var input_processors = j.input_processors;
        var iterate_ancestor_classes = j.iterate_ancestor_classes;
        var is_arr_of_arrs = j.is_arr_of_arrs;
        var is_arr_of_strs = j.is_arr_of_strs;
        var is_arr_of_t = j.is_arr_of_t;
        var clone = jsgui.clone;
        var input_processors = jsgui.input_processors;
        class Data_Value extends Evented_Class {
            constructor(spec) {
                super(spec);
                this.__data_value = true;
                if (spec && spec.context) {
                    this.context = spec.context;
                }
                if (spec) {}
                if (spec && is_defined(spec.value)) {
                    this._ = spec.value;
                }
                this.__type = "data_value";
                this._relationships = {};
            }
            get() {
                return this._;
            }
            value() {
                return this._;
            }
            toObject() {
                return this._;
            }
            set(val) {
                var input_processor = input_processors[this.__type_name];
                if (input_processor) {
                    val = input_processor(val);
                }
                var old_val = this._;
                this._ = val;
                this.raise("change", {
                    old: old_val,
                    value: val
                });
                return val;
            }
            toString() {
                return this.get();
            }
            toJSON() {
                var val = this.get();
                var tval = typeof val;
                if (tval == "string") {
                    return '"' + val + '"';
                } else {
                    return val;
                }
            }
            clone() {
                var res = new Data_Value({
                    value: this._
                });
                return res;
            }
            _id() {
                if (this.__id) return this.__id;
                if (this.context) {
                    this.__id = this.context.new_id(this.__type_name || this.__type);
                } else {
                    if (!is_defined(this.__id)) {
                        throw "DataValue should have context";
                        this.__id = new_data_value_id();
                    }
                }
                return this.__id;
            }
            parent() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                var obj, index;
                if (a.l == 0) {
                    return this._parent;
                }
                if (a.l == 1) {
                    obj = a[0];
                    if (!this.context && obj.context) {
                        this.context = obj.context;
                    }
                    var relate_by_id = function(that) {
                        var obj_id = obj._id();
                        that._relationships[obj_id] = true;
                    };
                    var relate_by_ref = function(that) {
                        that._parent = obj;
                    };
                    relate_by_ref(this);
                }
                if (a.l == 2) {
                    obj = a[0];
                    index = a[1];
                    if (!this.context && obj.context) {
                        this.context = obj.context;
                    }
                    this._parent = obj;
                    this._index = index;
                }
                if (is_defined(index)) {} else {}
            }
        }
        module.exports = Data_Value;
    }, {
        "./essentials": 92,
        "./evented-class": 93
    } ],
    91: [ function(require, module, exports) {
        class Node {
            constructor(spec) {
                this.neighbours = spec.neighbours || [];
                this.value = spec.value;
            }
            previous() {
                return this.neighbours[0];
            }
            next() {
                return this.neighbours[1];
            }
        }
        class Doubly_Linked_List {
            constructor(spec) {
                this.first = null;
                this.last = null;
                this.length = 0;
            }
            each_node(callback) {
                var node = this.first;
                var ctu = true;
                var stop = function() {
                    ctu = false;
                };
                while (node && ctu) {
                    callback(node, stop);
                    node = node.neighbours[1];
                }
            }
            each(callback) {
                this.each_node(function(node, stop) {
                    callback(node.value, stop);
                });
            }
            remove(node) {
                if (node.neighbours[0]) {
                    node.neighbours[0].neighbours[1] = node.neighbours[1];
                } else {
                    this.first = node.neighbours[1];
                }
                if (node.neighbours[1]) {
                    node.neighbours[1].neighbours[0] = node.neighbours[0];
                } else {
                    this.last = node.neighbours[0];
                }
                node.neighbours = [];
                if (node.parent == this) {
                    delete node.parent;
                    this.length--;
                }
            }
            insert_beginning(val) {
                if (val instanceof Node) {
                    if (this.first == null) {
                        this.first = val;
                        this.last = val;
                        val.neighbours = [];
                        if (val.parent != this) {
                            val.parent = this;
                            this.length++;
                        }
                    } else {
                        this.insert_before(val, this.first);
                    }
                    return val;
                } else {
                    var node = new Node({
                        value: val
                    });
                    return this.insert_beginning(node);
                }
            }
            insert_before(val, node) {
                if (val instanceof Node) {
                    val.neighbours = [ node.neighbours[0], node ];
                    if (node.neighbours[0] == null) {
                        this.first = val;
                    } else {
                        node.neighbours[0].neighbours[1] = val;
                    }
                    node.neighbours[0] = val;
                    if (val.parent != this) {
                        val.parent = this;
                        this.length++;
                    }
                    return val;
                } else {
                    var new_node = new Node({
                        value: val
                    });
                    return this.insert_before(new_node, node);
                }
            }
            insert_after(val, node) {
                if (val instanceof Node) {
                    val.neighbours = [ node, node.neighbours[1] ];
                    if (node.neighbours[1] == null) {
                        this.last = val;
                    } else {
                        node.neighbours[1].neighbours[0] = val;
                    }
                    node.neighbours[1] = val;
                    if (val.parent != this) {
                        val.parent = this;
                        this.length++;
                    }
                    return val;
                } else {
                    var new_node = new Node({
                        value: val
                    });
                    return this.insert_after(new_node, node);
                }
            }
            push(val) {
                if (val instanceof Node) {
                    if (this.last == null) {
                        this.insert_beginning(val);
                    } else {
                        return this.insert_after(val, this.last);
                    }
                    return val;
                } else {
                    var new_node = new Node({
                        value: val
                    });
                    return this.push(new_node);
                }
            }
        }
        Doubly_Linked_List.Node = Node;
        module.exports = Doubly_Linked_List;
    }, {} ],
    92: [ function(require, module, exports) {
        (function(Buffer) {
            if (typeof window === "undefined") {
                var Stream = require("stream");
            } else {}
            var each = (collection, fn, context) => {
                if (collection) {
                    if (collection.__type == "collection") {
                        return collection.each(fn, context);
                    }
                    var ctu = true;
                    var stop = function() {
                        ctu = false;
                    };
                    if (is_array(collection)) {
                        var res = [], res_item;
                        for (var c = 0, l = collection.length; c < l; c++) {
                            res_item;
                            if (ctu == false) break;
                            if (context) {
                                res_item = fn.call(context, collection[c], c, stop);
                            } else {
                                res_item = fn(collection[c], c, stop);
                            }
                            res.push(res_item);
                        }
                        return res;
                    } else {
                        var name, res = {};
                        for (name in collection) {
                            if (ctu == false) break;
                            if (context) {
                                res[name] = fn.call(context, collection[name], name, stop);
                            } else {
                                res[name] = fn(collection[name], name, stop);
                            }
                        }
                        return res;
                    }
                }
            };
            var jq_class2type = {};
            var jq_type = obj => {
                if (obj == null) return String(obj);
                var s = Object.prototype.toString.call(obj);
                return jq_class2type[s] || "object";
            };
            var is_array = Array.isArray;
            var is_dom_node = function isDomNode(obj) {
                return !!obj && typeof obj.nodeType != "undefined" && typeof obj.childNodes != "undefined";
            };
            var get_truth_map_from_arr = function(arr) {
                var res = {};
                each(arr, function(v, i) {
                    res[v] = true;
                });
                return res;
            };
            var get_map_from_arr = function(arr) {
                var res = {};
                for (var c = 0, l = arr.length; c < l; c++) {
                    res[arr[c]] = c;
                }
                return res;
            };
            var arr_like_to_arr = function(arr_like) {
                var res = new Array(arr_like.length);
                for (var c = 0, l = arr_like.length; c < l; c++) {
                    res[c] = arr_like[c];
                }
                return res;
            };
            var is_ctrl = function(obj) {
                return typeof obj != "undefined" && obj != null && is_defined(obj.__type_name) && is_defined(obj.content) && is_defined(obj.dom);
            };
            var tof = (obj, t1) => {
                var res = t1 || typeof obj;
                if (res === "number" || res === "string" || res === "function" || res === "boolean") {
                    return res;
                }
                if (res === "object") {
                    if (typeof obj !== "undefined") {
                        if (obj === null) {
                            return "null";
                        }
                        if (obj.__type) {
                            return obj.__type;
                        } else {
                            if (is_ctrl(obj)) {
                                return "control";
                            }
                            if (obj instanceof Date) {
                                return "date";
                            }
                            if (is_array(obj)) {
                                return "array";
                            } else {
                                if (obj instanceof RegExp) res = "regex";
                                if (typeof window === "undefined") {
                                    if (obj instanceof Buffer) res = "buffer";
                                    if (obj instanceof Stream.Readable) res = "readable_stream";
                                    if (obj instanceof Stream.Writable) res = "writable_stream";
                                }
                            }
                            return res;
                        }
                    } else {
                        return "undefined";
                    }
                }
                return res;
            };
            var atof = arr => {
                var res = new Array(arr.length);
                for (var c = 0, l = arr.length; c < l; c++) {
                    res[c] = tof(arr[c]);
                }
                return res;
            };
            var is_defined = value => {
                return typeof value != "undefined";
            }, isdef = is_defined;
            var is_data_object = function(obj) {
                if (obj) {
                    if (obj.__type == "data_object") return true;
                    if (obj.__type == "collection") return true;
                }
                return false;
            };
            var is_collection = function(obj) {
                if (obj) {
                    if (obj.__type == "collection") return true;
                }
                return false;
            };
            var stringify = JSON.stringify;
            var get_a_sig = a => {
                var c = 0, l = a.length;
                var res = "[";
                var first = true;
                for (c = 0; c < l; c++) {
                    if (!first) {
                        res = res + ",";
                    } else {
                        first = false;
                    }
                    res = res + get_item_sig(a[c]);
                }
                res = res + "]";
                return res;
            };
            var get_item_sig = (i, arr_depth) => {
                var res;
                var t1 = typeof i;
                if (t1 === "string") {
                    res = "s";
                } else if (t1 === "number") {
                    res = "n";
                } else if (t1 === "boolean") {
                    res = "b";
                } else if (t1 === "function") {
                    res = "f";
                } else {
                    var t = tof(i, t1);
                    if (t === "array") {
                        if (arr_depth) {
                            res = "[";
                            for (var c = 0, l = i.length; c < l; c++) {
                                if (c > 0) res = res + ",";
                                res = res + get_item_sig(i[c], arr_depth - 1);
                            }
                            res = res + "]";
                        } else {
                            res = "a";
                        }
                    } else if (t === "control") {
                        res = "c";
                    } else if (t === "date") {
                        res = "d";
                    } else if (t === "regex") {
                        res = "r";
                    } else if (t === "buffer") {
                        res = "B";
                    } else if (t === "readable_stream") {
                        res = "R";
                    } else if (t === "writable_stream") {
                        res = "W";
                    } else if (t === "object") {
                        res = "o";
                    } else if (t === "undefined") {
                        res = "u";
                    } else {
                        if (t == "collection_index") {
                            return "X";
                        } else if (t === "data_object") {
                            if (i._abstract) {
                                res = "~D";
                            } else {
                                res = "D";
                            }
                        } else {
                            if (t === "data_value") {
                                if (i._abstract) {
                                    res = "~V";
                                } else {
                                    res = "V";
                                }
                            } else if (t === "null") {
                                res = "!";
                            } else if (t === "collection") {
                                if (i._abstract) {
                                    res = "~C";
                                } else {
                                    res = "C";
                                }
                            } else {
                                if (t === "data_grid") {
                                    if (i._abstract) {
                                        res = "~G";
                                    } else {
                                        res = "G";
                                    }
                                } else {
                                    throw "Unexpected object type " + t;
                                }
                            }
                        }
                    }
                }
                return res;
            };
            var trim_sig_brackets = function(sig) {
                if (tof(sig) === "string") {
                    if (sig.charAt(0) == "[" && sig.charAt(sig.length - 1) == "]") {
                        return sig.substring(1, sig.length - 1);
                    } else {
                        return sig;
                    }
                }
            };
            var arr_trim_undefined = function(arr_like) {
                var res = [];
                var last_defined = -1;
                var t, v;
                for (var c = 0, l = arr_like.length; c < l; c++) {
                    v = arr_like[c];
                    t = tof(v);
                    if (t == "undefined") {} else {
                        last_defined = c;
                    }
                }
                for (var c = 0, l = arr_like.length; c < l; c++) {
                    if (c <= last_defined) {
                        res.push(arr_like[c]);
                    }
                }
                return res;
            };
            var functional_polymorphism = function(options, fn) {
                var a0 = arguments;
                if (a0.length === 1) {
                    fn = a0[0];
                    options = null;
                }
                var arr_slice = Array.prototype.slice;
                var arr, sig, a2, l, a;
                return function() {
                    a = arguments;
                    l = a.length;
                    if (l === 1) {
                        sig = get_item_sig([ a[0] ], 1);
                        a2 = [ a[0] ];
                        a2.l = 1;
                        return fn.call(this, a2, sig);
                    } else if (l > 1) {
                        arr = arr_trim_undefined(arr_slice.call(a, 0));
                        sig = get_item_sig(arr, 1);
                        arr.l = arr.length;
                        return fn.call(this, arr, sig);
                    } else if (a.length === 0) {
                        arr = new Array(0);
                        arr.l = 0;
                        return fn.call(this, arr, "[]");
                    }
                };
            };
            var fp = functional_polymorphism;
            var arrayify = fp(function(a, sig) {
                var param_index, num_parallel = 1, delay = 0, fn;
                var res;
                var process_as_fn = function() {
                    res = function() {
                        var a = arr_like_to_arr(arguments), ts = atof(a), t = this;
                        var last_arg = a[a.length - 1];
                        if (tof(last_arg) == "function") {
                            if (typeof param_index !== "undefined" && ts[param_index] == "array") {
                                var res = [];
                                var fns = [];
                                each(a[param_index], function(v, i) {
                                    var new_params = a.slice(0, a.length - 1);
                                    new_params[param_index] = v;
                                    fns.push([ t, fn, new_params ]);
                                });
                                call_multiple_callback_functions(fns, num_parallel, delay, function(err, res) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        var a = [];
                                        a = a.concat.apply(a, res);
                                        var callback = last_arg;
                                        callback(null, a);
                                    }
                                });
                            } else {
                                return fn.apply(t, a);
                            }
                        } else {
                            if (typeof param_index !== "undefined" && ts[param_index] == "array") {
                                var res = [];
                                for (var c = 0, l = a[param_index].length; c < l; c++) {
                                    a[param_index] = arguments[param_index][c];
                                    var result = fn.apply(t, a);
                                    res.push(result);
                                }
                                return res;
                            } else {
                                return fn.apply(t, a);
                            }
                        }
                    };
                };
                if (sig == "[o]") {
                    var res = [];
                    each(a[0], function(v, i) {
                        res.push([ v, i ]);
                    });
                } else if (sig == "[f]") {
                    param_index = 0, fn = a[0];
                    process_as_fn();
                } else if (sig == "[n,f]") {
                    param_index = a[0], fn = a[1];
                    process_as_fn();
                } else if (sig == "[n,n,f]") {
                    param_index = a[0], num_parallel = a[1], fn = a[2];
                    process_as_fn();
                } else if (sig == "[n,n,n,f]") {
                    param_index = a[0], num_parallel = a[1], delay = a[2], fn = a[3];
                    process_as_fn();
                }
                return res;
            });
            var mapify = target => {
                var tt = tof(target);
                if (tt == "function") {
                    var res = fp(function(a, sig) {
                        var that = this;
                        if (sig == "[o]") {
                            var map = a[0];
                            each(map, function(v, i) {
                                target.call(that, v, i);
                            });
                        } else if (sig == "[o,f]") {
                            var map = a[0];
                            var callback = a[1];
                            var fns = [];
                            each(map, function(v, i) {
                                fns.push([ target, [ v, i ] ]);
                            });
                            call_multi(fns, function(err_multi, res_multi) {
                                if (err_multi) {
                                    callback(err_multi);
                                } else {
                                    callback(null, res_multi);
                                }
                            });
                        } else if (a.length >= 2) {
                            target.apply(this, a);
                        }
                    });
                    return res;
                } else if (tt == "array") {
                    var res = {};
                    if (arguments.length == 1) {
                        if (is_arr_of_strs(target)) {
                            each(target, function(v, i) {
                                res[v] = true;
                            });
                        } else {
                            each(target, function(v, i) {
                                res[v[0]] = v[1];
                            });
                        }
                    } else {
                        var by_property_name = arguments[1];
                        each(target, function(v, i) {
                            res[v[by_property_name]] = v;
                        });
                    }
                    return res;
                }
            };
            var clone = fp((a, sig) => {
                var obj = a[0];
                if (a.l == 1) {
                    var t = tof(obj);
                    if (t == "array") {
                        var res = [];
                        each(obj, function(v) {
                            res.push(clone(v));
                        });
                        return res;
                    } else if (t == "undefined") {
                        return undefined;
                    } else if (t == "string") {
                        return obj;
                    } else if (t == "number") {
                        return obj;
                    } else if (t == "function") {
                        return obj;
                    } else if (t == "boolean") {
                        return obj;
                    } else if (t == "null") {
                        return obj;
                    } else {
                        return Object.assign({}, obj);
                    }
                } else if (a.l == 2 && tof(a[1]) == "number") {
                    var res = [];
                    for (var c = 0; c < a[1]; c++) {
                        res.push(clone(obj));
                    }
                    return res;
                }
            });
            var are_equal = require("deep-equal");
            var set_vals = function(obj, map) {
                each(map, function(v, i) {
                    obj[i] = v;
                });
            };
            var ll_set = function(obj, prop_name, prop_value) {
                var arr = prop_name.split(".");
                var c = 0, l = arr.length;
                var i = obj._ || obj, s;
                while (c < l) {
                    s = arr[c];
                    if (typeof i[s] == "undefined") {
                        if (c - l == -1) {
                            i[s] = prop_value;
                        } else {
                            i[s] = {};
                        }
                    } else {
                        if (c - l == -1) {
                            i[s] = prop_value;
                        }
                    }
                    i = i[s];
                    c++;
                }
                return prop_value;
            };
            var ll_get = function(a0, a1) {
                if (a0 && a1) {
                    var i = a0._ || a0;
                    if (a1 == ".") {
                        if (typeof i["."] == "undefined") {
                            return undefined;
                        } else {
                            return i["."];
                        }
                    } else {
                        var arr = a1.split(".");
                        var c = 0, l = arr.length, s;
                        while (c < l) {
                            s = arr[c];
                            if (typeof i[s] == "undefined") {
                                if (c - l == -1) {} else {
                                    throw "object " + s + " not found";
                                }
                            } else {
                                if (c - l == -1) {
                                    return i[s];
                                }
                            }
                            i = i[s];
                            c++;
                        }
                    }
                }
            };
            var truth = function(value) {
                return value === true;
            };
            var iterate_ancestor_classes = function(obj, callback) {
                var ctu = true;
                var stop = function() {
                    ctu = false;
                };
                callback(obj, stop);
                if (obj._superclass && ctu) {
                    iterate_ancestor_classes(obj._superclass, callback);
                }
            };
            var is_arr_of_t = function(obj, type_name) {
                var t = tof(obj), tv;
                if (t == "array") {
                    var res = true;
                    each(obj, function(v, i) {
                        tv = tof(v);
                        if (tv != type_name) res = false;
                    });
                    return res;
                } else {
                    return false;
                }
            };
            var is_arr_of_arrs = function(obj) {
                return is_arr_of_t(obj, "array");
            };
            var is_arr_of_strs = function(obj) {
                return is_arr_of_t(obj, "string");
            };
            var input_processors = {};
            var output_processors = {};
            var call_multiple_callback_functions = fp(function(a, sig) {
                var arr_functions_params_pairs, callback, return_params = false;
                var delay;
                var num_parallel = 1;
                if (a.l == 2) {
                    arr_functions_params_pairs = a[0];
                    callback = a[1];
                }
                if (a.l == 3) {
                    if (sig == "[a,n,f]") {
                        arr_functions_params_pairs = a[0];
                        num_parallel = a[1];
                        callback = a[2];
                    }
                    if (sig == "[n,a,f]") {
                        arr_functions_params_pairs = a[1];
                        num_parallel = a[0];
                        callback = a[2];
                    }
                    if (sig == "[a,f,b]") {
                        arr_functions_params_pairs = a[0];
                        callback = a[1];
                        return_params = a[2];
                    }
                }
                if (a.l == 4) {
                    if (sig == "[a,n,n,f]") {
                        arr_functions_params_pairs = a[0];
                        num_parallel = a[1];
                        delay = a[2];
                        callback = a[3];
                    }
                    if (sig == "[n,n,a,f]") {
                        arr_functions_params_pairs = a[2];
                        num_parallel = a[0];
                        delay = a[1];
                        callback = a[3];
                    }
                }
                var res = [];
                var l = arr_functions_params_pairs.length;
                var c = 0;
                var that = this;
                var count_unfinished = l;
                var num_currently_executing = 0;
                var process = function(delay) {
                    num_currently_executing++;
                    var main = function() {
                        var pair = arr_functions_params_pairs[c];
                        var context;
                        var fn, params, fn_callback;
                        var pair_sig = get_item_sig(pair);
                        var t_pair = tof(pair);
                        if (t_pair == "function") {
                            fn = pair;
                            params = [];
                        } else {
                            if (pair) {
                                if (pair.length == 1) {}
                                if (pair.length == 2) {
                                    if (tof(pair[1]) == "function") {
                                        context = pair[0];
                                        fn = pair[1];
                                        params = [];
                                    } else {
                                        fn = pair[0];
                                        params = pair[1];
                                    }
                                }
                                if (pair.length == 3) {
                                    if (tof(pair[0]) === "function" && tof(pair[1]) === "array" && tof(pair[2]) === "function") {
                                        fn = pair[0];
                                        params = pair[1];
                                        fn_callback = pair[2];
                                    }
                                    if (tof(pair[1]) === "function" && tof(pair[2]) === "array") {
                                        context = pair[0];
                                        fn = pair[1];
                                        params = pair[2];
                                    }
                                }
                                if (pair.length == 4) {
                                    context = pair[0];
                                    fn = pair[1];
                                    params = pair[2];
                                    fn_callback = pair[3];
                                }
                            } else {}
                        }
                        var i = c;
                        c++;
                        var cb = function(err, res2) {
                            num_currently_executing--;
                            count_unfinished--;
                            if (err) {
                                var stack = new Error().stack;
                                callback(err);
                            } else {
                                if (return_params) {
                                    res[i] = [ params, res2 ];
                                } else {
                                    res[i] = res2;
                                }
                                if (fn_callback) {
                                    fn_callback(null, res2);
                                }
                                if (c < l) {
                                    if (num_currently_executing < num_parallel) {
                                        process(delay);
                                    }
                                } else {
                                    if (count_unfinished <= 0) {
                                        callback(null, res);
                                    }
                                }
                            }
                        };
                        var arr_to_call = params || [];
                        arr_to_call.push(cb);
                        if (fn) {
                            if (context) {
                                fn.apply(context, arr_to_call);
                            } else {
                                fn.apply(that, arr_to_call);
                            }
                        } else {}
                    };
                    if (arr_functions_params_pairs[c]) {
                        if (delay) {
                            setTimeout(main, delay);
                        } else {
                            main();
                        }
                    }
                };
                if (arr_functions_params_pairs.length > 0) {
                    while (c < l && num_currently_executing < num_parallel) {
                        if (delay) {
                            process(delay * c);
                        } else {
                            process();
                        }
                    }
                } else {
                    if (callback) {}
                }
            });
            var multi = call_multiple_callback_functions;
            var call_multi = call_multiple_callback_functions;
            var Fns = function() {
                var fns = [];
                fns.go = function(parallel, delay, callback) {
                    var a = arguments;
                    var al = a.length;
                    if (al == 1) {
                        call_multi(fns, parallel);
                    }
                    if (al == 2) {
                        call_multi(parallel, fns, delay);
                    }
                    if (al == 3) {
                        call_multi(parallel, delay, fns, callback);
                    }
                };
                return fns;
            };
            var native_constructor_tof = function(value) {
                if (value === String) {
                    return "String";
                }
                if (value === Number) {
                    return "Number";
                }
                if (value === Boolean) {
                    return "Boolean";
                }
                if (value === Array) {
                    return "Array";
                }
                if (value === Object) {
                    return "Object";
                }
            };
            var sig_match = function(sig1, sig2) {
                var sig1_inner = sig1.substr(1, sig1.length - 2);
                var sig2_inner = sig2.substr(1, sig2.length - 2);
                if (sig1_inner.indexOf("[") > -1 || sig1_inner.indexOf("]") > -1 || sig2_inner.indexOf("[") > -1 || sig2_inner.indexOf("]") > -1) {
                    throw "sig_match only supports flat signatures.";
                }
                var sig1_parts = sig1_inner.split(",");
                var sig2_parts = sig2_inner.split(",");
                var res = true;
                if (sig1_parts.length == sig2_parts.length) {
                    var c = 0, l = sig1_parts.length, i1, i2;
                    while (res && c < l) {
                        i1 = sig1_parts[c];
                        i2 = sig2_parts[c];
                        if (i1 === i2) {} else {
                            if (i1 !== "?") {
                                res = false;
                            }
                        }
                        c++;
                    }
                    return res;
                } else {
                    return false;
                }
            };
            var remove_sig_from_arr_shell = function(sig) {
                if (sig[0] == "[" && sig[sig.length - 1] == "]") {
                    return sig.substring(1, sig.length - 1);
                }
                return sig;
            };
            var str_arr_mapify = function(fn) {
                var res = fp(function(a, sig) {
                    if (a.l == 1) {
                        if (sig == "[s]") {
                            var s_pn = a[0].split(" ");
                            if (s_pn.length > 1) {
                                return res.call(this, s_pn);
                            } else {
                                return fn.call(this, a[0]);
                            }
                        }
                        if (tof(a[0]) == "array") {
                            var res2 = {}, that = this;
                            each(a[0], function(v, i) {
                                res2[v] = fn.call(that, v);
                            });
                            return res2;
                        }
                    }
                });
                return res;
            };
            var jsgui = {
                each: each,
                is_array: is_array,
                is_dom_node: is_dom_node,
                is_ctrl: is_ctrl,
                clone: clone,
                get_truth_map_from_arr: get_truth_map_from_arr,
                arr_trim_undefined: arr_trim_undefined,
                get_map_from_arr: get_map_from_arr,
                arr_like_to_arr: arr_like_to_arr,
                tof: tof,
                atof: atof,
                is_defined: is_defined,
                stringify: stringify,
                functional_polymorphism: functional_polymorphism,
                fp: fp,
                arrayify: arrayify,
                mapify: mapify,
                str_arr_mapify: str_arr_mapify,
                are_equal: are_equal,
                get_a_sig: get_a_sig,
                get_item_sig: get_item_sig,
                set_vals: set_vals,
                truth: truth,
                trim_sig_brackets: trim_sig_brackets,
                ll_set: ll_set,
                ll_get: ll_get,
                iterate_ancestor_classes: iterate_ancestor_classes,
                is_arr_of_t: is_arr_of_t,
                is_arr_of_arrs: is_arr_of_arrs,
                is_arr_of_strs: is_arr_of_strs,
                input_processors: input_processors,
                output_processors: output_processors,
                call_multiple_callback_functions: call_multiple_callback_functions,
                call_multi: call_multi,
                multi: call_multi,
                native_constructor_tof: native_constructor_tof,
                Fns: Fns,
                sig_match: sig_match,
                remove_sig_from_arr_shell: remove_sig_from_arr_shell
            };
            jsgui.data_types_info = jsgui.data_types_info || {};
            module.exports = jsgui;
        }).call(this, require("buffer").Buffer);
    }, {
        buffer: 3,
        "deep-equal": 99,
        stream: 25
    } ],
    93: [ function(require, module, exports) {
        var jsgui = require("./essentials");
        var j = jsgui;
        var Class = j.Class;
        var each = j.each;
        var is_array = j.is_array;
        var is_dom_node = j.is_dom_node;
        var is_ctrl = j.is_ctrl;
        var extend = j.extend;
        var get_truth_map_from_arr = j.get_truth_map_from_arr;
        var get_map_from_arr = j.get_map_from_arr;
        var arr_like_to_arr = j.arr_like_to_arr;
        var tof = j.tof;
        var is_defined = j.is_defined;
        var stringify = j.stringify;
        var functional_polymorphism = j.functional_polymorphism;
        var fp = j.fp;
        var arrayify = j.arrayify;
        var mapify = j.mapify;
        var are_equal = j.are_equal;
        var get_item_sig = j.get_item_sig;
        var set_vals = j.set_vals;
        var truth = j.truth;
        var trim_sig_brackets = j.trim_sig_brackets;
        var ll_set = j.ll_set;
        var ll_get = j.ll_get;
        var input_processors = j.input_processors;
        var iterate_ancestor_classes = j.iterate_ancestor_classes;
        var is_arr_of_arrs = j.is_arr_of_arrs;
        var is_arr_of_strs = j.is_arr_of_strs;
        var is_arr_of_t = j.is_arr_of_t;
        var clone = jsgui.clone;
        class Evented_Class {
            constructor() {
                this._bound_events = {};
            }
            raise_event() {
                var a = Array.prototype.slice.call(arguments), sig = get_item_sig(a, 1);
                a.l = a.length;
                var that = this;
                var target = this;
                var c, l;
                if (sig == "[s]") {
                    var target = this;
                    var event_name = a[0];
                    var bgh = this._bound_general_handler;
                    var be = this._bound_events;
                    var res = [];
                    if (bgh) {
                        for (c = 0, l = bgh.length; c < l; c++) {
                            res.push(bgh[c].call(target, event_name));
                        }
                    }
                    if (be) {
                        var bei = be[event_name];
                        if (tof(bei) == "array") {
                            for (c = 0, l = bei.length; c < l; c++) {
                                res.push(bei[c].call(target));
                            }
                            return res;
                        }
                    }
                }
                if (sig == "[s,a]") {
                    var be = this._bound_events;
                    var bgh = this._bound_general_handler;
                    var event_name = a[0];
                    var res = [];
                    if (bgh) {
                        for (c = 0, l = bgh.length; c < l; c++) {
                            res.push(bgh[c].call(target, event_name, a[1]));
                        }
                    }
                    if (be) {
                        var bei = be[event_name];
                        if (tof(bei) === "array") {
                            for (c = 0, l = bei.length; c < l; c++) {
                                res.push(bei[c].call(target, a[1]));
                            }
                        }
                    }
                }
                if (sig == "[s,o]") {
                    var be = this._bound_events;
                    var bgh = this._bound_general_handler;
                    var event_name = a[0];
                    if (!a[1].target) a[1].target = target;
                    var res = [];
                    if (bgh) {
                        for (c = 0, l = bgh.length; c < l; c++) {
                            res.push(bgh[c].call(target, event_name, a[1]));
                        }
                    }
                    if (be) {
                        var bei = be[event_name];
                        if (tof(bei) === "array") {
                            for (c = 0, l = bei.length; c < l; c++) {
                                res.push(bei[c].call(target, a[1]));
                            }
                        }
                    }
                } else {
                    if (a.l > 2) {
                        var event_name = a[0];
                        var additional_args = [];
                        var bgh_args = [ event_name ];
                        for (c = 1, l = a.l; c < l; c++) {
                            additional_args.push(a[c]);
                            bgh_args.push(a[c]);
                        }
                        var be = this._bound_events;
                        var bgh = this._bound_general_handler;
                        var res = [];
                        if (bgh) {
                            for (c = 0, l = bgh.length; c < l; c++) {
                                res.push(bgh[c].apply(target, bgh_args));
                            }
                        }
                        if (be) {
                            var bei = be[event_name];
                            if (tof(bei) == "array") {
                                if (bei.length > 0) {
                                    for (c = 0, l = bei.length; c < l; c++) {
                                        if (bei[c]) res.push(bei[c].apply(target, additional_args));
                                    }
                                    return res;
                                } else {
                                    return res;
                                }
                            }
                        }
                    }
                }
                return res;
            }
            add_event_listener() {
                var a = Array.prototype.slice.call(arguments), sig = get_item_sig(a, 1);
                a.l = a.length;
                if (sig == "[f]") {
                    this._bound_general_handler = this._bound_general_handler || [];
                    if (Array.isArray(this._bound_general_handler)) {
                        this._bound_general_handler.push(a[0]);
                    }
                }
                if (sig == "[s,f]") {
                    var event_name = a[0], fn_listener = a[1];
                    this._bound_events = this._bound_events || {};
                    if (!this._bound_events[event_name]) this._bound_events[event_name] = [];
                    var bei = this._bound_events[event_name];
                    if (Array.isArray(bei)) {
                        bei.push(fn_listener);
                    }
                }
            }
            on() {
                return this.add_event_listener.apply(this, arguments);
            }
            remove_event_listener(event_name, fn_listener) {
                if (this._bound_events) {
                    var bei = this._bound_events[event_name] || [];
                    if (Array.isArray(bei)) {
                        var c = 0, l = bei.length, found = false;
                        while (!found && c < l) {
                            if (bei[c] === fn_listener) {
                                found = true;
                            } else {
                                c++;
                            }
                        }
                        if (found) {
                            bei.splice(c, 1);
                        }
                    }
                }
            }
            off() {
                return this.remove_event_listener.apply(this, arguments);
            }
            one(event_name, fn_handler) {
                var inner_handler = function(e) {
                    fn_handler.call(this, e);
                    this.off(event_name, inner_handler);
                };
                this.on(event_name, inner_handler);
            }
        }
        var p = Evented_Class.prototype;
        p.raise = p.raise_event;
        p.trigger = p.raise_event;
        module.exports = Evented_Class;
    }, {
        "./essentials": 92
    } ],
    94: [ function(require, module, exports) {
        var jsgui = require("./essentials");
        var B_Plus_Tree = require("./b-plus-tree/b-plus-tree");
        var Collection = require("./collection");
        var Data_Object = require("./data-object");
        var Data_Value = require("./data-value");
        var Doubly_Linked_List = require("./doubly-linked-list");
        var Evented_Class = require("./evented-class");
        var Ordered_KVS = require("./ordered-kvs");
        var Ordered_String_List = require("./ordered-string-list");
        var Sorted_KVS = require("./sorted-kvs");
        var util = require("./util");
        jsgui.B_Plus_Tree = B_Plus_Tree;
        jsgui.Collection = Collection;
        jsgui.Data_Object = Data_Object;
        jsgui.Data_Value = Data_Value;
        jsgui.Doubly_Linked_List = Doubly_Linked_List;
        jsgui.Evented_Class = Evented_Class;
        jsgui.Ordered_KVS = Ordered_KVS;
        jsgui.Ordered_String_List = Ordered_String_List;
        jsgui.Sorted_KVS = Sorted_KVS;
        module.exports = jsgui;
    }, {
        "./b-plus-tree/b-plus-tree": 86,
        "./collection": 88,
        "./data-object": 89,
        "./data-value": 90,
        "./doubly-linked-list": 91,
        "./essentials": 92,
        "./evented-class": 93,
        "./ordered-kvs": 95,
        "./ordered-string-list": 96,
        "./sorted-kvs": 97,
        "./util": 98
    } ],
    95: [ function(require, module, exports) {
        var Doubly_Linked_List = require("./doubly-linked-list");
        class Ordered_KVS {
            constructor() {
                this.dll = new Doubly_Linked_List();
                this.node_map = {};
            }
            length() {
                return this.dll.length;
            }
            put(key, value) {
                return this.push(key, value);
            }
            get(key) {
                var kvs_node = this.node_map[key];
                if (kvs_node) {
                    return kvs_node.value;
                } else {
                    return undefined;
                }
            }
            push(key, value) {
                var node = this.dll.push(value);
                node.key = key;
                this.node_map[key] = node;
            }
            out(key) {
                var node = this.node_map[key];
                delete this.node_map[key];
                this.dll.remove(node);
            }
            each(callback) {
                this.dll.each_node(function(node, stop) {
                    callback(node.key, node.value, stop);
                });
            }
            values() {
                var res = [];
                this.each(function(key, value) {
                    res.push(value);
                });
                return res;
            }
            keys() {
                var res = [];
                this.each(function(key, value) {
                    res.push(key);
                });
                return res;
            }
            keys_and_values() {
                var res = [];
                this.each(function(key, value) {
                    res.push([ key, value ]);
                });
                return res;
            }
        }
        module.exports = Ordered_KVS;
    }, {
        "./doubly-linked-list": 91
    } ],
    96: [ function(require, module, exports) {
        class Ordered_String_List {
            constructor() {
                var arr = [];
                var dict_indexes = {};
                var reindex_dict_indexes = function() {
                    dict_indexes = {};
                    for (var c = 0, l = arr.length; c < l; c++) {
                        dict_indexes[arr[c]] = c;
                    }
                };
                this.has = function(value) {
                    return typeof dict_indexes[value] !== "undefined";
                };
                this.put = function(value) {
                    if (this.has(value)) {} else {
                        var index = arr.length;
                        arr.push(value);
                        dict_indexes[value] = index;
                    }
                };
                this.out = function(value) {
                    if (this.has(value)) {
                        var idx = dict_indexes[value];
                        arr.splice(idx, 1);
                        delete dict_indexes[value];
                        for (var c = idx, l = arr.length; c < l; c++) {
                            var i = arr[c];
                            dict_indexes[i]--;
                        }
                    }
                };
                this.toggle = function(value) {
                    if (this.has(value)) {
                        this.out(value);
                    } else {
                        this.put(value);
                    }
                };
                this.move_value = function(value, index) {
                    if (this.has(value) && dict_indexes[value] != index) {
                        var old_index = dict_indexes[value];
                        arr.splice(old_index, 1);
                        arr.splice(index, 0, value);
                        if (index < old_index) {
                            dict_indexes[arr[index]] = index;
                            for (var c = index + 1; c <= old_index; c++) {
                                dict_indexes[arr[c]]++;
                            }
                        } else if (index > old_index) {
                            dict_indexes[arr[index]] = index;
                            for (var c = old_index; c < index; c++) {
                                dict_indexes[arr[c]]--;
                            }
                        }
                    }
                };
                this._index_scan = function() {
                    for (var c = 0, l = arr.length; c < l; c++) {
                        console.log("c " + c + " arr[c] " + arr[c] + " idx " + dict_indexes[arr[c]]);
                    }
                };
                this.toString = function() {
                    var res = arr.join(" ");
                    return res;
                };
                this.toString.stringify = true;
                this.set = function(val) {
                    if (typeof val === "string") {
                        arr = val.split(" ");
                        reindex_dict_indexes();
                    }
                };
                var a = arguments;
                if (a.length == 1) {
                    var spec = a[0];
                    if (typeof spec === "string") {
                        this.set(spec);
                    }
                }
            }
        }
        module.exports = Ordered_String_List;
    }, {} ],
    97: [ function(require, module, exports) {
        var jsgui = require("./essentials");
        var mapify = jsgui.mapify;
        var B_Plus_Tree = require("./b-plus-tree/b-plus-tree");
        class Sorted_KVS {
            constructor(spec) {
                spec = spec || {};
                if (typeof spec.unique_keys !== "undefined") this.unique_keys = spec.unique_keys;
                this.tree = B_Plus_Tree(12);
            }
            clear() {
                this.tree.clear();
            }
            out(key) {
                this.tree.remove(key);
            }
            get(key) {
                return this.tree.get_values_by_key(key);
            }
            has(key) {
                return this.key_count(key) > 0;
            }
            get_cursor() {}
            keys() {
                return this.tree.keys();
            }
            keys_and_values() {
                return this.tree.keys_and_values();
            }
            key_count(key) {
                if (typeof key !== "undefined") {
                    return this.tree.count(key);
                } else {
                    return this.tree.count();
                }
            }
            get_keys_by_prefix(prefix) {
                return this.tree.get_keys_by_prefix(prefix);
            }
            each(callback) {
                return this.tree.each(callback);
            }
            get_by_prefix(prefix) {
                return this.tree.get_by_prefix(prefix);
            }
        }
        Sorted_KVS.prototype.put = mapify(function(key, value) {
            var insert_res = this.tree.insert(key, value);
        });
        module.exports = Sorted_KVS;
    }, {
        "./b-plus-tree/b-plus-tree": 86,
        "./essentials": 92
    } ],
    98: [ function(require, module, exports) {
        var jsgui = require("./essentials");
        var Collection = require("./collection");
        var j = jsgui;
        var each = j.each;
        var tof = j.tof;
        var atof = j.atof;
        var is_defined = j.is_defined;
        var fp = j.fp;
        var arrayify = j.arrayify;
        var mapify = j.mapify;
        var get_item_sig = j.get_item_sig;
        var vectorify = function(n_fn) {
            var fn_res = fp(function(a, sig) {
                if (a.l > 2) {
                    var res = a[0];
                    for (var c = 1, l = a.l; c < l; c++) {
                        res = fn_res(res, a[c]);
                    }
                    return res;
                } else {
                    if (sig == "[n,n]") {
                        return n_fn(a[0], a[1]);
                    } else {
                        var ats = atof(a);
                        if (ats[0] == "array") {
                            if (ats[1] == "number") {
                                var res = [], n = a[1];
                                each(a[0], function(i, v) {
                                    res.push(fn_res(v, n));
                                });
                                return res;
                            }
                            if (ats[1] == "array") {
                                if (ats[0].length != ats[1].length) {
                                    throw "vector array lengths mismatch";
                                } else {
                                    var res = [], arr2 = a[1];
                                    each(a[0], function(i, v) {
                                        res.push(fn_res(v, arr2[i]));
                                    });
                                    return res;
                                }
                            }
                        }
                    }
                }
            });
            return fn_res;
        };
        var n_add = function(n1, n2) {
            return n1 + n2;
        }, n_subtract = function(n1, n2) {
            return n1 - n2;
        }, n_multiply = function(n1, n2) {
            return n1 * n2;
        }, n_divide = function(n1, n2) {
            return n1 / n2;
        };
        var v_add = vectorify(n_add), v_subtract = vectorify(n_subtract);
        var v_multiply = vectorify(n_multiply), v_divide = vectorify(n_divide);
        var vector_magnitude = function(vector) {
            var res = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
            return res;
        };
        var distance_between_points = function(points) {
            var offset = v_subtract(points[1], points[0]);
            return vector_magnitude(offset);
        };
        var execute_on_each_simple = function(items, fn) {
            var res = [], that = this;
            each(items, function(i, v) {
                res.push(fn.call(that, v));
            });
            return res;
        };
        var filter_map_by_regex = function(map, regex) {
            var res = {};
            each(map, function(i, v) {
                if (i.match(regex)) {
                    res[i] = v;
                }
            });
            return res;
        };
        var npx = arrayify(function(value) {
            var res, a = arguments, t = tof(a[0]);
            if (t === "string") {
                res = a[0];
            } else if (t === "number") {
                res = a[0] + "px";
            }
            return res;
        });
        var no_px = arrayify(fp(function(a, sig) {
            var re = /px$/, res;
            if (sig == "[s]" && re.test(a[0])) {
                res = parseInt(a[0]);
            } else {
                res = a[0];
            }
            return res;
        }));
        var arr_ltrb = [ "left", "top", "right", "bottom" ];
        var str_arr_mapify = function(fn) {
            var res = fp(function(a, sig) {
                if (a.l == 1) {
                    if (sig == "[s]") {
                        var s_pn = a[0].split(" ");
                        if (s_pn.length > 1) {
                            return res.call(this, s_pn);
                        } else {
                            return fn.call(this, a[0]);
                        }
                    }
                    if (tof(a[0]) == "array") {
                        var res2 = {}, that = this;
                        each(a[0], function(i, v) {
                            res2[v] = fn.call(that, v);
                        });
                        return res2;
                    }
                }
            });
            return res;
        };
        var arr_hex_chars = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" ];
        var dict_hex_to_bin = {
            "0": 0,
            "1": 1,
            "2": 2,
            "3": 3,
            "4": 4,
            "5": 5,
            "6": 6,
            "7": 7,
            "8": 8,
            "9": 9,
            A: 10,
            B: 11,
            C: 12,
            D: 13,
            E: 14,
            F: 15
        };
        var str_hex_to_int = function(str_hex) {
            str_hex = str_hex.toUpperCase();
            var i = str_hex.length;
            var res = 0, exp = 1;
            while (i--) {
                var i_part = dict_hex_to_bin[str_hex.charAt(i)];
                var ip2 = i_part * exp;
                res = res + ip2;
                exp = exp * 16;
            }
            return res;
        };
        var byte_int_to_str_hex_2 = function(byte_int) {
            var a = Math.floor(byte_int / 16), b = byte_int % 16, sa = arr_hex_chars[a], sb = arr_hex_chars[b], res = sa + sb;
            return res;
        };
        var arr_rgb_to_str_hex_6 = function(arr_rgb) {
            var r = byte_int_to_str_hex_2(arr_rgb[0]);
            var res = r + byte_int_to_str_hex_2(arr_rgb[1]) + byte_int_to_str_hex_2(arr_rgb[2]);
            return res;
        };
        var arr_rgb_to_css_hex_6 = function(arr_rgb) {
            return "#" + arr_rgb_to_str_hex_6(arr_rgb);
        };
        var input_processors = {};
        var output_processors = {};
        var validators = {
            number: function(value) {
                return tof(value) == "number";
            }
        };
        var referred_object_is_defined = function(object_reference) {
            return is_defined(object_reference[0][object_reference[1]]);
        };
        var set_vals = function(obj, map) {
            each(map, function(i, v) {
                obj[i] = v;
            });
        };
        var extend = jsgui.extend, fp = jsgui.fp, stringify = jsgui.stringify, tof = jsgui.tof;
        var data_types_info = {
            color: [ "indexed_array", [ [ "red", "number" ], [ "green", "number" ], [ "blue", "number" ] ] ],
            oltrb: [ "optional_array", [ "left", "top", "right", "bottom" ] ]
        };
        var color_preprocessor_parser = fp(function(a, sig) {
            if (sig == "[s]") {
                var input = a[0];
                var rx_hex = /(#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2}))/;
                var m = input.match(rx_hex);
                if (m) {
                    var r = jsgui.str_hex_to_int(m[2]);
                    var g = jsgui.str_hex_to_int(m[3]);
                    var b = jsgui.str_hex_to_int(m[4]);
                    var res = [ r, g, b ];
                    return res;
                }
            }
        });
        var color_preprocessor = function(fn_color_processor) {
            var that = this;
            var res = fp(function(a, sig) {
                if (sig == "[[s]]") {
                    var rx_hex = /(#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2}))/;
                    var input = a[0][0];
                    var m = input.match(rx_hex);
                    if (m) {
                        var r = jsgui.str_hex_to_int(m[2]);
                        var g = jsgui.str_hex_to_int(m[3]);
                        var b = jsgui.str_hex_to_int(m[4]);
                        var res = [ r, g, b ];
                        return res;
                    }
                } else {
                    return fn_color_processor.apply(that, a);
                }
            });
            return res;
        };
        input_processors["optional_array"] = fp(function(a, sig) {
            if (a.l == 2) {
                var oa_params = a[0], input = a[1];
                if (tof(input) == "array") {
                    if (input.length <= oa_params.length) {
                        return input;
                    }
                } else {
                    return input;
                }
            }
            if (a.l == 3) {
                var oa_params = a[0], items_data_type_name = a[1], input = a[2];
                var input_processor_for_items = jsgui.input_processors[items_data_type_name];
                if (tof(input) == "array") {
                    if (input.length <= oa_params.length) {
                        var res = [];
                        each(input, function(i, v) {
                            res.push(input_processor_for_items(v));
                        });
                        return res;
                    }
                } else {
                    return input_processor_for_items(input);
                }
            }
        });
        input_processors["indexed_array"] = fp(function(a, sig) {
            console.log("indexed_array sig", sig);
            if (a.l == 2) {
                var ia_params = a[0], input = a[1];
                if (tof(input) == "array") {
                    if (input.length <= ia_params.length) {
                        return input;
                    }
                }
            }
            if (a.l == 3) {
                var ia_params = a[0], items_data_type_name = a[1], input = a[2];
                var input_processor_for_items = jsgui.input_processors[items_data_type_name];
                if (tof(input) == "array") {
                    if (input.length <= ia_params.length) {
                        var res = [];
                        each(input, function(i, v) {
                            res.push(input_processor_for_items(v));
                        });
                        return res;
                    }
                }
            }
        });
        input_processors["n_units"] = function(str_units, input) {
            if (tof(input) == "number") {
                return [ input, str_units ];
            }
            if (tof(input) == "string") {
                var rx_n_units = /^(\d+)(\w+)$/;
                var match = input.match(rx_n_units);
                if (match) {
                    return [ parseInt(match[1]), match[2] ];
                }
                rx_n_units = /^(\d*\.\d+)(\w+)$/;
                match = input.match(rx_n_units);
                if (match) {
                    return [ parseFloat(match[1]), match[2] ];
                }
            }
        };
        var dti_color = jsgui.data_types_info["color"];
        input_processors["color"] = function(input) {
            var res;
            console.log("processing color input: " + stringify(input));
            var input_sig = get_item_sig(input, 2);
            if (input_sig == "[s]") {
                res = color_preprocessor_parser(input[0]);
            }
            if (input_sig == "[n,n,n]") {
                res = input;
            }
            console.log("res " + stringify(res));
            console.log("color input_processors output", res);
            return res;
        };
        jsgui.output_processors["color"] = function(jsgui_color) {
            var res = jsgui.arr_rgb_to_css_hex_6(jsgui_color);
            return res;
        };
        var group = function() {
            var a = arguments;
            if (a.length == 1 && tof(a[0]) == "array") {
                return group.apply(this, a[0]);
            }
            var res;
            for (var c = 0, l = a.length; c < l; c++) {
                var item = a[c];
                if (c == 0) {
                    res = new Collection({
                        context: item.context
                    });
                }
                res.push(item);
            }
            var C = a[0].constructor;
            var p = C.prototype;
            var i;
            for (i in p) {
                var tpi = tof(p[i]);
                if (tpi == "function") {
                    (function(i) {
                        if (i != "each" && i != "get" && i != "add_event_listener") {
                            res[i] = function() {
                                var a = arguments;
                                res.each(function(v, i2) {
                                    v[i].apply(v, a);
                                });
                            };
                        }
                    })(i);
                }
            }
            return res;
        };
        var true_vals = function(map) {
            var res = [];
            for (var i in map) {
                if (map[i]) res.push(map[i]);
            }
            return res;
        };
        var util = {
            vectorify: vectorify,
            v_add: v_add,
            v_subtract: v_subtract,
            v_multiply: v_multiply,
            v_divide: v_divide,
            vector_magnitude: vector_magnitude,
            distance_between_points: distance_between_points,
            execute_on_each_simple: execute_on_each_simple,
            mapify: mapify,
            filter_map_by_regex: filter_map_by_regex,
            atof: atof,
            npx: npx,
            no_px: no_px,
            str_arr_mapify: str_arr_mapify,
            arr_ltrb: arr_ltrb,
            true_vals: true_vals,
            validators: validators,
            __data_id_method: "lazy",
            str_hex_to_int: str_hex_to_int,
            arr_rgb_to_css_hex_6: arr_rgb_to_css_hex_6,
            group: group
        };
        module.exports = util;
    }, {
        "./collection": 88,
        "./essentials": 92
    } ],
    99: [ function(require, module, exports) {
        var pSlice = Array.prototype.slice;
        var objectKeys = require("./lib/keys.js");
        var isArguments = require("./lib/is_arguments.js");
        var deepEqual = module.exports = function(actual, expected, opts) {
            if (!opts) opts = {};
            if (actual === expected) {
                return true;
            } else if (actual instanceof Date && expected instanceof Date) {
                return actual.getTime() === expected.getTime();
            } else if (!actual || !expected || typeof actual != "object" && typeof expected != "object") {
                return opts.strict ? actual === expected : actual == expected;
            } else {
                return objEquiv(actual, expected, opts);
            }
        };
        function isUndefinedOrNull(value) {
            return value === null || value === undefined;
        }
        function isBuffer(x) {
            if (!x || typeof x !== "object" || typeof x.length !== "number") return false;
            if (typeof x.copy !== "function" || typeof x.slice !== "function") {
                return false;
            }
            if (x.length > 0 && typeof x[0] !== "number") return false;
            return true;
        }
        function objEquiv(a, b, opts) {
            var i, key;
            if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false;
            if (a.prototype !== b.prototype) return false;
            if (isArguments(a)) {
                if (!isArguments(b)) {
                    return false;
                }
                a = pSlice.call(a);
                b = pSlice.call(b);
                return deepEqual(a, b, opts);
            }
            if (isBuffer(a)) {
                if (!isBuffer(b)) {
                    return false;
                }
                if (a.length !== b.length) return false;
                for (i = 0; i < a.length; i++) {
                    if (a[i] !== b[i]) return false;
                }
                return true;
            }
            try {
                var ka = objectKeys(a), kb = objectKeys(b);
            } catch (e) {
                return false;
            }
            if (ka.length != kb.length) return false;
            ka.sort();
            kb.sort();
            for (i = ka.length - 1; i >= 0; i--) {
                if (ka[i] != kb[i]) return false;
            }
            for (i = ka.length - 1; i >= 0; i--) {
                key = ka[i];
                if (!deepEqual(a[key], b[key], opts)) return false;
            }
            return typeof a === typeof b;
        }
    }, {
        "./lib/is_arguments.js": 100,
        "./lib/keys.js": 101
    } ],
    100: [ function(require, module, exports) {
        var supportsArgumentsClass = function() {
            return Object.prototype.toString.call(arguments);
        }() == "[object Arguments]";
        exports = module.exports = supportsArgumentsClass ? supported : unsupported;
        exports.supported = supported;
        function supported(object) {
            return Object.prototype.toString.call(object) == "[object Arguments]";
        }
        exports.unsupported = unsupported;
        function unsupported(object) {
            return object && typeof object == "object" && typeof object.length == "number" && Object.prototype.hasOwnProperty.call(object, "callee") && !Object.prototype.propertyIsEnumerable.call(object, "callee") || false;
        }
    }, {} ],
    101: [ function(require, module, exports) {
        exports = module.exports = typeof Object.keys === "function" ? Object.keys : shim;
        exports.shim = shim;
        function shim(obj) {
            var keys = [];
            for (var key in obj) keys.push(key);
            return keys;
        }
    }, {} ],
    102: [ function(require, module, exports) {
        var jsgui = require("../lang/lang");
        var stringify = jsgui.stringify, each = jsgui.each, arrayify = jsgui.arrayify, tof = jsgui.tof, get_a_sig = jsgui.get_a_sig;
        var filter_map_by_regex = jsgui.filter_map_by_regex;
        var Evented_Class = jsgui.Evented_Class, Data_Object = jsgui.Data_Object;
        var fp = jsgui.fp, is_defined = jsgui.is_defined;
        var Collection = jsgui.Collection;
        class Resource_Pool extends Evented_Class {
            constructor(spec) {
                super(spec);
                this.resources = new Collection({
                    fn_index: item => {
                        var key = item.name;
                        return key;
                    }
                });
            }
            _get_resources_by_interface(i_name) {
                var res = [];
                this.resources.each(function(i, resource) {
                    console.log("resource " + resource);
                    var i = resource.get("interface");
                    if (tof(i) == "string") {
                        if (i == i_name) res.push(resource);
                    } else if (tof(i) == "array") {
                        var done = true;
                        each(i, function(i2, v) {
                            if (!done) {
                                if (i == i_name) res.push(resource);
                                done = true;
                            }
                        });
                    }
                });
                if (res.length > 1) return res;
                return res[0];
            }
            index_resource(obj) {}
            receive_resource_event() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[D,s,[s,s]]") {
                    var data_object = a[0];
                }
                if (sig == "[D,s]") {
                    var data_object = a[0];
                    var event_name = a[1];
                }
            }
            add(obj) {
                var that = this;
                var obj_name = obj.name;
                console.log("** obj_name " + obj_name);
                if (this.has_resource(obj_name)) {
                    throw "Resource pool already has resource with name " + obj_name;
                } else {
                    this.resources.add(obj);
                    obj.pool = this;
                    this.raise_event("added", obj);
                }
            }
            push(obj) {
                return this.add(obj);
            }
            has_resource() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[s]") {
                    var obj_lookup_val = a[0];
                    return this.resources.has(obj_lookup_val);
                }
            }
            get_resource_names() {
                var res = [];
                each(this.resources, resource => {
                    res.push(resource.name);
                });
                return res;
            }
            get_resource() {
                var a = arguments;
                a.l = arguments.length;
                var sig = get_a_sig(a, 1);
                if (sig == "[s]") {
                    var obj_lookup_val = a[0];
                    var find_result = this.resources.find(obj_lookup_val);
                    if (find_result) {
                        var res = find_result;
                    }
                    return res;
                }
            }
            count() {
                return this.resources.length;
            }
            start(callback) {
                var arr_resources_meeting_requirements = [];
                this.resources.each(function(v, i) {
                    var mr = v.meets_requirements();
                    if (mr) {
                        arr_resources_meeting_requirements.push(v);
                    }
                });
                var l_resources = this.resources.length();
                if (arr_resources_meeting_requirements.length == l_resources) {
                    var fns = [];
                    var num_to_start = arr_resources_meeting_requirements.length;
                    var num_starting = 0, num_started = 0;
                    var cb = function(err, start_res) {
                        num_starting--;
                        num_started++;
                        if (num_started == num_to_start) {
                            if (callback) callback(null, true);
                        }
                    };
                    each(arr_resources_meeting_requirements, function(resource_ready_to_start) {
                        resource_ready_to_start.start(cb);
                        num_starting++;
                    });
                }
            }
        }
        module.exports = Resource_Pool;
    }, {
        "../lang/lang": 94
    } ]
}, {}, [ 80 ]);