// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = import.meta.require;

// node_modules/@actions/core/lib/utils.js
var require_utils = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.toCommandProperties = exports.toCommandValue = undefined;
  function toCommandValue(input) {
    if (input === null || input === undefined) {
      return "";
    } else if (typeof input === "string" || input instanceof String) {
      return input;
    }
    return JSON.stringify(input);
  }
  exports.toCommandValue = toCommandValue;
  function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
      return {};
    }
    return {
      title: annotationProperties.title,
      file: annotationProperties.file,
      line: annotationProperties.startLine,
      endLine: annotationProperties.endLine,
      col: annotationProperties.startColumn,
      endColumn: annotationProperties.endColumn
    };
  }
  exports.toCommandProperties = toCommandProperties;
});

// node_modules/@actions/core/lib/command.js
var require_command = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.issue = exports.issueCommand = undefined;
  var os = __importStar(__require("os"));
  var utils_1 = require_utils();
  function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
  }
  exports.issueCommand = issueCommand;
  function issue(name, message = "") {
    issueCommand(name, {}, message);
  }
  exports.issue = issue;
  var CMD_STRING = "::";

  class Command {
    constructor(command, properties, message) {
      if (!command) {
        command = "missing.command";
      }
      this.command = command;
      this.properties = properties;
      this.message = message;
    }
    toString() {
      let cmdStr = CMD_STRING + this.command;
      if (this.properties && Object.keys(this.properties).length > 0) {
        cmdStr += " ";
        let first = true;
        for (const key in this.properties) {
          if (this.properties.hasOwnProperty(key)) {
            const val = this.properties[key];
            if (val) {
              if (first) {
                first = false;
              } else {
                cmdStr += ",";
              }
              cmdStr += `${key}=${escapeProperty(val)}`;
            }
          }
        }
      }
      cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
      return cmdStr;
    }
  }
  function escapeData(s) {
    return (0, utils_1.toCommandValue)(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  }
  function escapeProperty(s) {
    return (0, utils_1.toCommandValue)(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
  }
});

// node_modules/@actions/core/lib/file-command.js
var require_file_command = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.prepareKeyValueMessage = exports.issueFileCommand = undefined;
  var crypto = __importStar(__require("crypto"));
  var fs = __importStar(__require("fs"));
  var os = __importStar(__require("os"));
  var utils_1 = require_utils();
  function issueFileCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
      throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${(0, utils_1.toCommandValue)(message)}${os.EOL}`, {
      encoding: "utf8"
    });
  }
  exports.issueFileCommand = issueFileCommand;
  function prepareKeyValueMessage(key, value) {
    const delimiter = `ghadelimiter_${crypto.randomUUID()}`;
    const convertedValue = (0, utils_1.toCommandValue)(value);
    if (key.includes(delimiter)) {
      throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
    }
    if (convertedValue.includes(delimiter)) {
      throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
    }
    return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
  }
  exports.prepareKeyValueMessage = prepareKeyValueMessage;
});

// node_modules/@actions/http-client/lib/proxy.js
var require_proxy = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.checkBypass = exports.getProxyUrl = undefined;
  function getProxyUrl(reqUrl) {
    const usingSsl = reqUrl.protocol === "https:";
    if (checkBypass(reqUrl)) {
      return;
    }
    const proxyVar = (() => {
      if (usingSsl) {
        return process.env["https_proxy"] || process.env["HTTPS_PROXY"];
      } else {
        return process.env["http_proxy"] || process.env["HTTP_PROXY"];
      }
    })();
    if (proxyVar) {
      try {
        return new DecodedURL(proxyVar);
      } catch (_a) {
        if (!proxyVar.startsWith("http://") && !proxyVar.startsWith("https://"))
          return new DecodedURL(`http://${proxyVar}`);
      }
    } else {
      return;
    }
  }
  exports.getProxyUrl = getProxyUrl;
  function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
      return false;
    }
    const reqHost = reqUrl.hostname;
    if (isLoopbackAddress(reqHost)) {
      return true;
    }
    const noProxy = process.env["no_proxy"] || process.env["NO_PROXY"] || "";
    if (!noProxy) {
      return false;
    }
    let reqPort;
    if (reqUrl.port) {
      reqPort = Number(reqUrl.port);
    } else if (reqUrl.protocol === "http:") {
      reqPort = 80;
    } else if (reqUrl.protocol === "https:") {
      reqPort = 443;
    }
    const upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === "number") {
      upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    for (const upperNoProxyItem of noProxy.split(",").map((x) => x.trim().toUpperCase()).filter((x) => x)) {
      if (upperNoProxyItem === "*" || upperReqHosts.some((x) => x === upperNoProxyItem || x.endsWith(`.${upperNoProxyItem}`) || upperNoProxyItem.startsWith(".") && x.endsWith(`${upperNoProxyItem}`))) {
        return true;
      }
    }
    return false;
  }
  exports.checkBypass = checkBypass;
  function isLoopbackAddress(host) {
    const hostLower = host.toLowerCase();
    return hostLower === "localhost" || hostLower.startsWith("127.") || hostLower.startsWith("[::1]") || hostLower.startsWith("[0:0:0:0:0:0:0:1]");
  }

  class DecodedURL extends URL {
    constructor(url, base) {
      super(url, base);
      this._decodedUsername = decodeURIComponent(super.username);
      this._decodedPassword = decodeURIComponent(super.password);
    }
    get username() {
      return this._decodedUsername;
    }
    get password() {
      return this._decodedPassword;
    }
  }
});

// node_modules/tunnel/lib/tunnel.js
var require_tunnel = __commonJS((exports) => {
  var net = __require("net");
  var tls = __require("tls");
  var http = __require("http");
  var https = __require("https");
  var events = __require("events");
  var assert = __require("assert");
  var util = __require("util");
  exports.httpOverHttp = httpOverHttp;
  exports.httpsOverHttp = httpsOverHttp;
  exports.httpOverHttps = httpOverHttps;
  exports.httpsOverHttps = httpsOverHttps;
  function httpOverHttp(options) {
    var agent = new TunnelingAgent(options);
    agent.request = http.request;
    return agent;
  }
  function httpsOverHttp(options) {
    var agent = new TunnelingAgent(options);
    agent.request = http.request;
    agent.createSocket = createSecureSocket;
    agent.defaultPort = 443;
    return agent;
  }
  function httpOverHttps(options) {
    var agent = new TunnelingAgent(options);
    agent.request = https.request;
    return agent;
  }
  function httpsOverHttps(options) {
    var agent = new TunnelingAgent(options);
    agent.request = https.request;
    agent.createSocket = createSecureSocket;
    agent.defaultPort = 443;
    return agent;
  }
  function TunnelingAgent(options) {
    var self2 = this;
    self2.options = options || {};
    self2.proxyOptions = self2.options.proxy || {};
    self2.maxSockets = self2.options.maxSockets || http.Agent.defaultMaxSockets;
    self2.requests = [];
    self2.sockets = [];
    self2.on("free", function onFree(socket, host, port, localAddress) {
      var options2 = toOptions(host, port, localAddress);
      for (var i = 0, len = self2.requests.length;i < len; ++i) {
        var pending = self2.requests[i];
        if (pending.host === options2.host && pending.port === options2.port) {
          self2.requests.splice(i, 1);
          pending.request.onSocket(socket);
          return;
        }
      }
      socket.destroy();
      self2.removeSocket(socket);
    });
  }
  util.inherits(TunnelingAgent, events.EventEmitter);
  TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
    var self2 = this;
    var options = mergeOptions({ request: req }, self2.options, toOptions(host, port, localAddress));
    if (self2.sockets.length >= this.maxSockets) {
      self2.requests.push(options);
      return;
    }
    self2.createSocket(options, function(socket) {
      socket.on("free", onFree);
      socket.on("close", onCloseOrRemove);
      socket.on("agentRemove", onCloseOrRemove);
      req.onSocket(socket);
      function onFree() {
        self2.emit("free", socket, options);
      }
      function onCloseOrRemove(err) {
        self2.removeSocket(socket);
        socket.removeListener("free", onFree);
        socket.removeListener("close", onCloseOrRemove);
        socket.removeListener("agentRemove", onCloseOrRemove);
      }
    });
  };
  TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
    var self2 = this;
    var placeholder = {};
    self2.sockets.push(placeholder);
    var connectOptions = mergeOptions({}, self2.proxyOptions, {
      method: "CONNECT",
      path: options.host + ":" + options.port,
      agent: false,
      headers: {
        host: options.host + ":" + options.port
      }
    });
    if (options.localAddress) {
      connectOptions.localAddress = options.localAddress;
    }
    if (connectOptions.proxyAuth) {
      connectOptions.headers = connectOptions.headers || {};
      connectOptions.headers["Proxy-Authorization"] = "Basic " + new Buffer(connectOptions.proxyAuth).toString("base64");
    }
    debug("making CONNECT request");
    var connectReq = self2.request(connectOptions);
    connectReq.useChunkedEncodingByDefault = false;
    connectReq.once("response", onResponse);
    connectReq.once("upgrade", onUpgrade);
    connectReq.once("connect", onConnect);
    connectReq.once("error", onError);
    connectReq.end();
    function onResponse(res) {
      res.upgrade = true;
    }
    function onUpgrade(res, socket, head) {
      process.nextTick(function() {
        onConnect(res, socket, head);
      });
    }
    function onConnect(res, socket, head) {
      connectReq.removeAllListeners();
      socket.removeAllListeners();
      if (res.statusCode !== 200) {
        debug("tunneling socket could not be established, statusCode=%d", res.statusCode);
        socket.destroy();
        var error = new Error("tunneling socket could not be established, " + "statusCode=" + res.statusCode);
        error.code = "ECONNRESET";
        options.request.emit("error", error);
        self2.removeSocket(placeholder);
        return;
      }
      if (head.length > 0) {
        debug("got illegal response body from proxy");
        socket.destroy();
        var error = new Error("got illegal response body from proxy");
        error.code = "ECONNRESET";
        options.request.emit("error", error);
        self2.removeSocket(placeholder);
        return;
      }
      debug("tunneling connection has established");
      self2.sockets[self2.sockets.indexOf(placeholder)] = socket;
      return cb(socket);
    }
    function onError(cause) {
      connectReq.removeAllListeners();
      debug(`tunneling socket could not be established, cause=%s
`, cause.message, cause.stack);
      var error = new Error("tunneling socket could not be established, " + "cause=" + cause.message);
      error.code = "ECONNRESET";
      options.request.emit("error", error);
      self2.removeSocket(placeholder);
    }
  };
  TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
    var pos = this.sockets.indexOf(socket);
    if (pos === -1) {
      return;
    }
    this.sockets.splice(pos, 1);
    var pending = this.requests.shift();
    if (pending) {
      this.createSocket(pending, function(socket2) {
        pending.request.onSocket(socket2);
      });
    }
  };
  function createSecureSocket(options, cb) {
    var self2 = this;
    TunnelingAgent.prototype.createSocket.call(self2, options, function(socket) {
      var hostHeader = options.request.getHeader("host");
      var tlsOptions = mergeOptions({}, self2.options, {
        socket,
        servername: hostHeader ? hostHeader.replace(/:.*$/, "") : options.host
      });
      var secureSocket = tls.connect(0, tlsOptions);
      self2.sockets[self2.sockets.indexOf(socket)] = secureSocket;
      cb(secureSocket);
    });
  }
  function toOptions(host, port, localAddress) {
    if (typeof host === "string") {
      return {
        host,
        port,
        localAddress
      };
    }
    return host;
  }
  function mergeOptions(target) {
    for (var i = 1, len = arguments.length;i < len; ++i) {
      var overrides = arguments[i];
      if (typeof overrides === "object") {
        var keys = Object.keys(overrides);
        for (var j = 0, keyLen = keys.length;j < keyLen; ++j) {
          var k = keys[j];
          if (overrides[k] !== undefined) {
            target[k] = overrides[k];
          }
        }
      }
    }
    return target;
  }
  var debug;
  if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
    debug = function() {
      var args = Array.prototype.slice.call(arguments);
      if (typeof args[0] === "string") {
        args[0] = "TUNNEL: " + args[0];
      } else {
        args.unshift("TUNNEL:");
      }
      console.error.apply(console, args);
    };
  } else {
    debug = function() {};
  }
  exports.debug = debug;
});

// node_modules/@actions/http-client/lib/index.js
var require_lib = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = undefined;
  var http = __importStar(__require("http"));
  var https = __importStar(__require("https"));
  var pm = __importStar(require_proxy());
  var tunnel = __importStar(require_tunnel());
  var undici_1 = __require("undici");
  var HttpCodes;
  (function(HttpCodes2) {
    HttpCodes2[HttpCodes2["OK"] = 200] = "OK";
    HttpCodes2[HttpCodes2["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes2[HttpCodes2["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes2[HttpCodes2["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes2[HttpCodes2["SeeOther"] = 303] = "SeeOther";
    HttpCodes2[HttpCodes2["NotModified"] = 304] = "NotModified";
    HttpCodes2[HttpCodes2["UseProxy"] = 305] = "UseProxy";
    HttpCodes2[HttpCodes2["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes2[HttpCodes2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes2[HttpCodes2["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes2[HttpCodes2["BadRequest"] = 400] = "BadRequest";
    HttpCodes2[HttpCodes2["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes2[HttpCodes2["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes2[HttpCodes2["Forbidden"] = 403] = "Forbidden";
    HttpCodes2[HttpCodes2["NotFound"] = 404] = "NotFound";
    HttpCodes2[HttpCodes2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes2[HttpCodes2["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes2[HttpCodes2["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes2[HttpCodes2["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes2[HttpCodes2["Conflict"] = 409] = "Conflict";
    HttpCodes2[HttpCodes2["Gone"] = 410] = "Gone";
    HttpCodes2[HttpCodes2["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes2[HttpCodes2["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes2[HttpCodes2["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes2[HttpCodes2["BadGateway"] = 502] = "BadGateway";
    HttpCodes2[HttpCodes2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes2[HttpCodes2["GatewayTimeout"] = 504] = "GatewayTimeout";
  })(HttpCodes || (exports.HttpCodes = HttpCodes = {}));
  var Headers;
  (function(Headers2) {
    Headers2["Accept"] = "accept";
    Headers2["ContentType"] = "content-type";
  })(Headers || (exports.Headers = Headers = {}));
  var MediaTypes;
  (function(MediaTypes2) {
    MediaTypes2["ApplicationJson"] = "application/json";
  })(MediaTypes || (exports.MediaTypes = MediaTypes = {}));
  function getProxyUrl(serverUrl) {
    const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : "";
  }
  exports.getProxyUrl = getProxyUrl;
  var HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
  ];
  var HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
  ];
  var RetryableHttpVerbs = ["OPTIONS", "GET", "DELETE", "HEAD"];
  var ExponentialBackoffCeiling = 10;
  var ExponentialBackoffTimeSlice = 5;

  class HttpClientError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.name = "HttpClientError";
      this.statusCode = statusCode;
      Object.setPrototypeOf(this, HttpClientError.prototype);
    }
  }
  exports.HttpClientError = HttpClientError;

  class HttpClientResponse {
    constructor(message) {
      this.message = message;
    }
    readBody() {
      return __awaiter(this, undefined, undefined, function* () {
        return new Promise((resolve) => __awaiter(this, undefined, undefined, function* () {
          let output = Buffer.alloc(0);
          this.message.on("data", (chunk) => {
            output = Buffer.concat([output, chunk]);
          });
          this.message.on("end", () => {
            resolve(output.toString());
          });
        }));
      });
    }
    readBodyBuffer() {
      return __awaiter(this, undefined, undefined, function* () {
        return new Promise((resolve) => __awaiter(this, undefined, undefined, function* () {
          const chunks = [];
          this.message.on("data", (chunk) => {
            chunks.push(chunk);
          });
          this.message.on("end", () => {
            resolve(Buffer.concat(chunks));
          });
        }));
      });
    }
  }
  exports.HttpClientResponse = HttpClientResponse;
  function isHttps(requestUrl) {
    const parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === "https:";
  }
  exports.isHttps = isHttps;

  class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
      this._ignoreSslError = false;
      this._allowRedirects = true;
      this._allowRedirectDowngrade = false;
      this._maxRedirects = 50;
      this._allowRetries = false;
      this._maxRetries = 1;
      this._keepAlive = false;
      this._disposed = false;
      this.userAgent = userAgent;
      this.handlers = handlers || [];
      this.requestOptions = requestOptions;
      if (requestOptions) {
        if (requestOptions.ignoreSslError != null) {
          this._ignoreSslError = requestOptions.ignoreSslError;
        }
        this._socketTimeout = requestOptions.socketTimeout;
        if (requestOptions.allowRedirects != null) {
          this._allowRedirects = requestOptions.allowRedirects;
        }
        if (requestOptions.allowRedirectDowngrade != null) {
          this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
        }
        if (requestOptions.maxRedirects != null) {
          this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
        }
        if (requestOptions.keepAlive != null) {
          this._keepAlive = requestOptions.keepAlive;
        }
        if (requestOptions.allowRetries != null) {
          this._allowRetries = requestOptions.allowRetries;
        }
        if (requestOptions.maxRetries != null) {
          this._maxRetries = requestOptions.maxRetries;
        }
      }
    }
    options(requestUrl, additionalHeaders) {
      return __awaiter(this, undefined, undefined, function* () {
        return this.request("OPTIONS", requestUrl, null, additionalHeaders || {});
      });
    }
    get(requestUrl, additionalHeaders) {
      return __awaiter(this, undefined, undefined, function* () {
        return this.request("GET", requestUrl, null, additionalHeaders || {});
      });
    }
    del(requestUrl, additionalHeaders) {
      return __awaiter(this, undefined, undefined, function* () {
        return this.request("DELETE", requestUrl, null, additionalHeaders || {});
      });
    }
    post(requestUrl, data, additionalHeaders) {
      return __awaiter(this, undefined, undefined, function* () {
        return this.request("POST", requestUrl, data, additionalHeaders || {});
      });
    }
    patch(requestUrl, data, additionalHeaders) {
      return __awaiter(this, undefined, undefined, function* () {
        return this.request("PATCH", requestUrl, data, additionalHeaders || {});
      });
    }
    put(requestUrl, data, additionalHeaders) {
      return __awaiter(this, undefined, undefined, function* () {
        return this.request("PUT", requestUrl, data, additionalHeaders || {});
      });
    }
    head(requestUrl, additionalHeaders) {
      return __awaiter(this, undefined, undefined, function* () {
        return this.request("HEAD", requestUrl, null, additionalHeaders || {});
      });
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
      return __awaiter(this, undefined, undefined, function* () {
        return this.request(verb, requestUrl, stream, additionalHeaders);
      });
    }
    getJson(requestUrl, additionalHeaders = {}) {
      return __awaiter(this, undefined, undefined, function* () {
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        const res = yield this.get(requestUrl, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      });
    }
    postJson(requestUrl, obj, additionalHeaders = {}) {
      return __awaiter(this, undefined, undefined, function* () {
        const data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        const res = yield this.post(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      });
    }
    putJson(requestUrl, obj, additionalHeaders = {}) {
      return __awaiter(this, undefined, undefined, function* () {
        const data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        const res = yield this.put(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      });
    }
    patchJson(requestUrl, obj, additionalHeaders = {}) {
      return __awaiter(this, undefined, undefined, function* () {
        const data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        const res = yield this.patch(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      });
    }
    request(verb, requestUrl, data, headers) {
      return __awaiter(this, undefined, undefined, function* () {
        if (this._disposed) {
          throw new Error("Client has already been disposed.");
        }
        const parsedUrl = new URL(requestUrl);
        let info = this._prepareRequest(verb, parsedUrl, headers);
        const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb) ? this._maxRetries + 1 : 1;
        let numTries = 0;
        let response;
        do {
          response = yield this.requestRaw(info, data);
          if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
            let authenticationHandler;
            for (const handler of this.handlers) {
              if (handler.canHandleAuthentication(response)) {
                authenticationHandler = handler;
                break;
              }
            }
            if (authenticationHandler) {
              return authenticationHandler.handleAuthentication(this, info, data);
            } else {
              return response;
            }
          }
          let redirectsRemaining = this._maxRedirects;
          while (response.message.statusCode && HttpRedirectCodes.includes(response.message.statusCode) && this._allowRedirects && redirectsRemaining > 0) {
            const redirectUrl = response.message.headers["location"];
            if (!redirectUrl) {
              break;
            }
            const parsedRedirectUrl = new URL(redirectUrl);
            if (parsedUrl.protocol === "https:" && parsedUrl.protocol !== parsedRedirectUrl.protocol && !this._allowRedirectDowngrade) {
              throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");
            }
            yield response.readBody();
            if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
              for (const header in headers) {
                if (header.toLowerCase() === "authorization") {
                  delete headers[header];
                }
              }
            }
            info = this._prepareRequest(verb, parsedRedirectUrl, headers);
            response = yield this.requestRaw(info, data);
            redirectsRemaining--;
          }
          if (!response.message.statusCode || !HttpResponseRetryCodes.includes(response.message.statusCode)) {
            return response;
          }
          numTries += 1;
          if (numTries < maxTries) {
            yield response.readBody();
            yield this._performExponentialBackoff(numTries);
          }
        } while (numTries < maxTries);
        return response;
      });
    }
    dispose() {
      if (this._agent) {
        this._agent.destroy();
      }
      this._disposed = true;
    }
    requestRaw(info, data) {
      return __awaiter(this, undefined, undefined, function* () {
        return new Promise((resolve, reject) => {
          function callbackForResult(err, res) {
            if (err) {
              reject(err);
            } else if (!res) {
              reject(new Error("Unknown error"));
            } else {
              resolve(res);
            }
          }
          this.requestRawWithCallback(info, data, callbackForResult);
        });
      });
    }
    requestRawWithCallback(info, data, onResult) {
      if (typeof data === "string") {
        if (!info.options.headers) {
          info.options.headers = {};
        }
        info.options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
      }
      let callbackCalled = false;
      function handleResult(err, res) {
        if (!callbackCalled) {
          callbackCalled = true;
          onResult(err, res);
        }
      }
      const req = info.httpModule.request(info.options, (msg) => {
        const res = new HttpClientResponse(msg);
        handleResult(undefined, res);
      });
      let socket;
      req.on("socket", (sock) => {
        socket = sock;
      });
      req.setTimeout(this._socketTimeout || 3 * 60000, () => {
        if (socket) {
          socket.end();
        }
        handleResult(new Error(`Request timeout: ${info.options.path}`));
      });
      req.on("error", function(err) {
        handleResult(err);
      });
      if (data && typeof data === "string") {
        req.write(data, "utf8");
      }
      if (data && typeof data !== "string") {
        data.on("close", function() {
          req.end();
        });
        data.pipe(req);
      } else {
        req.end();
      }
    }
    getAgent(serverUrl) {
      const parsedUrl = new URL(serverUrl);
      return this._getAgent(parsedUrl);
    }
    getAgentDispatcher(serverUrl) {
      const parsedUrl = new URL(serverUrl);
      const proxyUrl = pm.getProxyUrl(parsedUrl);
      const useProxy = proxyUrl && proxyUrl.hostname;
      if (!useProxy) {
        return;
      }
      return this._getProxyAgentDispatcher(parsedUrl, proxyUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
      const info = {};
      info.parsedUrl = requestUrl;
      const usingSsl = info.parsedUrl.protocol === "https:";
      info.httpModule = usingSsl ? https : http;
      const defaultPort = usingSsl ? 443 : 80;
      info.options = {};
      info.options.host = info.parsedUrl.hostname;
      info.options.port = info.parsedUrl.port ? parseInt(info.parsedUrl.port) : defaultPort;
      info.options.path = (info.parsedUrl.pathname || "") + (info.parsedUrl.search || "");
      info.options.method = method;
      info.options.headers = this._mergeHeaders(headers);
      if (this.userAgent != null) {
        info.options.headers["user-agent"] = this.userAgent;
      }
      info.options.agent = this._getAgent(info.parsedUrl);
      if (this.handlers) {
        for (const handler of this.handlers) {
          handler.prepareRequest(info.options);
        }
      }
      return info;
    }
    _mergeHeaders(headers) {
      if (this.requestOptions && this.requestOptions.headers) {
        return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
      }
      return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
      let clientHeader;
      if (this.requestOptions && this.requestOptions.headers) {
        clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
      }
      return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
      let agent;
      const proxyUrl = pm.getProxyUrl(parsedUrl);
      const useProxy = proxyUrl && proxyUrl.hostname;
      if (this._keepAlive && useProxy) {
        agent = this._proxyAgent;
      }
      if (!useProxy) {
        agent = this._agent;
      }
      if (agent) {
        return agent;
      }
      const usingSsl = parsedUrl.protocol === "https:";
      let maxSockets = 100;
      if (this.requestOptions) {
        maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
      }
      if (proxyUrl && proxyUrl.hostname) {
        const agentOptions = {
          maxSockets,
          keepAlive: this._keepAlive,
          proxy: Object.assign(Object.assign({}, (proxyUrl.username || proxyUrl.password) && {
            proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
          }), { host: proxyUrl.hostname, port: proxyUrl.port })
        };
        let tunnelAgent;
        const overHttps = proxyUrl.protocol === "https:";
        if (usingSsl) {
          tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
        } else {
          tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
        }
        agent = tunnelAgent(agentOptions);
        this._proxyAgent = agent;
      }
      if (!agent) {
        const options = { keepAlive: this._keepAlive, maxSockets };
        agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
        this._agent = agent;
      }
      if (usingSsl && this._ignoreSslError) {
        agent.options = Object.assign(agent.options || {}, {
          rejectUnauthorized: false
        });
      }
      return agent;
    }
    _getProxyAgentDispatcher(parsedUrl, proxyUrl) {
      let proxyAgent;
      if (this._keepAlive) {
        proxyAgent = this._proxyAgentDispatcher;
      }
      if (proxyAgent) {
        return proxyAgent;
      }
      const usingSsl = parsedUrl.protocol === "https:";
      proxyAgent = new undici_1.ProxyAgent(Object.assign({ uri: proxyUrl.href, pipelining: !this._keepAlive ? 0 : 1 }, (proxyUrl.username || proxyUrl.password) && {
        token: `Basic ${Buffer.from(`${proxyUrl.username}:${proxyUrl.password}`).toString("base64")}`
      }));
      this._proxyAgentDispatcher = proxyAgent;
      if (usingSsl && this._ignoreSslError) {
        proxyAgent.options = Object.assign(proxyAgent.options.requestTls || {}, {
          rejectUnauthorized: false
        });
      }
      return proxyAgent;
    }
    _performExponentialBackoff(retryNumber) {
      return __awaiter(this, undefined, undefined, function* () {
        retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
        const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
      });
    }
    _processResponse(res, options) {
      return __awaiter(this, undefined, undefined, function* () {
        return new Promise((resolve, reject) => __awaiter(this, undefined, undefined, function* () {
          const statusCode = res.message.statusCode || 0;
          const response = {
            statusCode,
            result: null,
            headers: {}
          };
          if (statusCode === HttpCodes.NotFound) {
            resolve(response);
          }
          function dateTimeDeserializer(key, value) {
            if (typeof value === "string") {
              const a = new Date(value);
              if (!isNaN(a.valueOf())) {
                return a;
              }
            }
            return value;
          }
          let obj;
          let contents;
          try {
            contents = yield res.readBody();
            if (contents && contents.length > 0) {
              if (options && options.deserializeDates) {
                obj = JSON.parse(contents, dateTimeDeserializer);
              } else {
                obj = JSON.parse(contents);
              }
              response.result = obj;
            }
            response.headers = res.message.headers;
          } catch (err) {}
          if (statusCode > 299) {
            let msg;
            if (obj && obj.message) {
              msg = obj.message;
            } else if (contents && contents.length > 0) {
              msg = contents;
            } else {
              msg = `Failed request: (${statusCode})`;
            }
            const err = new HttpClientError(msg, statusCode);
            err.result = response.result;
            reject(err);
          } else {
            resolve(response);
          }
        }));
      });
    }
  }
  exports.HttpClient = HttpClient;
  var lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {});
});

// node_modules/@actions/http-client/lib/auth.js
var require_auth = __commonJS((exports) => {
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = undefined;

  class BasicCredentialHandler {
    constructor(username, password) {
      this.username = username;
      this.password = password;
    }
    prepareRequest(options) {
      if (!options.headers) {
        throw Error("The request has no headers");
      }
      options.headers["Authorization"] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`;
    }
    canHandleAuthentication() {
      return false;
    }
    handleAuthentication() {
      return __awaiter(this, undefined, undefined, function* () {
        throw new Error("not implemented");
      });
    }
  }
  exports.BasicCredentialHandler = BasicCredentialHandler;

  class BearerCredentialHandler {
    constructor(token) {
      this.token = token;
    }
    prepareRequest(options) {
      if (!options.headers) {
        throw Error("The request has no headers");
      }
      options.headers["Authorization"] = `Bearer ${this.token}`;
    }
    canHandleAuthentication() {
      return false;
    }
    handleAuthentication() {
      return __awaiter(this, undefined, undefined, function* () {
        throw new Error("not implemented");
      });
    }
  }
  exports.BearerCredentialHandler = BearerCredentialHandler;

  class PersonalAccessTokenCredentialHandler {
    constructor(token) {
      this.token = token;
    }
    prepareRequest(options) {
      if (!options.headers) {
        throw Error("The request has no headers");
      }
      options.headers["Authorization"] = `Basic ${Buffer.from(`PAT:${this.token}`).toString("base64")}`;
    }
    canHandleAuthentication() {
      return false;
    }
    handleAuthentication() {
      return __awaiter(this, undefined, undefined, function* () {
        throw new Error("not implemented");
      });
    }
  }
  exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
});

// node_modules/@actions/core/lib/oidc-utils.js
var require_oidc_utils = __commonJS((exports) => {
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.OidcClient = undefined;
  var http_client_1 = require_lib();
  var auth_1 = require_auth();
  var core_1 = require_core();

  class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
      const requestOptions = {
        allowRetries: allowRetry,
        maxRetries: maxRetry
      };
      return new http_client_1.HttpClient("actions/oidc-client", [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
      const token = process.env["ACTIONS_ID_TOKEN_REQUEST_TOKEN"];
      if (!token) {
        throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable");
      }
      return token;
    }
    static getIDTokenUrl() {
      const runtimeUrl = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
      if (!runtimeUrl) {
        throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable");
      }
      return runtimeUrl;
    }
    static getCall(id_token_url) {
      var _a;
      return __awaiter(this, undefined, undefined, function* () {
        const httpclient = OidcClient.createHttpClient();
        const res = yield httpclient.getJson(id_token_url).catch((error) => {
          throw new Error(`Failed to get ID Token. 
 
        Error Code : ${error.statusCode}
 
        Error Message: ${error.message}`);
        });
        const id_token = (_a = res.result) === null || _a === undefined ? undefined : _a.value;
        if (!id_token) {
          throw new Error("Response json body do not have ID Token field");
        }
        return id_token;
      });
    }
    static getIDToken(audience) {
      return __awaiter(this, undefined, undefined, function* () {
        try {
          let id_token_url = OidcClient.getIDTokenUrl();
          if (audience) {
            const encodedAudience = encodeURIComponent(audience);
            id_token_url = `${id_token_url}&audience=${encodedAudience}`;
          }
          (0, core_1.debug)(`ID token url is ${id_token_url}`);
          const id_token = yield OidcClient.getCall(id_token_url);
          (0, core_1.setSecret)(id_token);
          return id_token;
        } catch (error) {
          throw new Error(`Error message: ${error.message}`);
        }
      });
    }
  }
  exports.OidcClient = OidcClient;
});

// node_modules/@actions/core/lib/summary.js
var require_summary = __commonJS((exports) => {
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = undefined;
  var os_1 = __require("os");
  var fs_1 = __require("fs");
  var { access, appendFile, writeFile } = fs_1.promises;
  exports.SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
  exports.SUMMARY_DOCS_URL = "https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary";

  class Summary {
    constructor() {
      this._buffer = "";
    }
    filePath() {
      return __awaiter(this, undefined, undefined, function* () {
        if (this._filePath) {
          return this._filePath;
        }
        const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
        if (!pathFromEnv) {
          throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
        }
        try {
          yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
        } catch (_a) {
          throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
        }
        this._filePath = pathFromEnv;
        return this._filePath;
      });
    }
    wrap(tag, content, attrs = {}) {
      const htmlAttrs = Object.entries(attrs).map(([key, value]) => ` ${key}="${value}"`).join("");
      if (!content) {
        return `<${tag}${htmlAttrs}>`;
      }
      return `<${tag}${htmlAttrs}>${content}</${tag}>`;
    }
    write(options) {
      return __awaiter(this, undefined, undefined, function* () {
        const overwrite = !!(options === null || options === undefined ? undefined : options.overwrite);
        const filePath = yield this.filePath();
        const writeFunc = overwrite ? writeFile : appendFile;
        yield writeFunc(filePath, this._buffer, { encoding: "utf8" });
        return this.emptyBuffer();
      });
    }
    clear() {
      return __awaiter(this, undefined, undefined, function* () {
        return this.emptyBuffer().write({ overwrite: true });
      });
    }
    stringify() {
      return this._buffer;
    }
    isEmptyBuffer() {
      return this._buffer.length === 0;
    }
    emptyBuffer() {
      this._buffer = "";
      return this;
    }
    addRaw(text, addEOL = false) {
      this._buffer += text;
      return addEOL ? this.addEOL() : this;
    }
    addEOL() {
      return this.addRaw(os_1.EOL);
    }
    addCodeBlock(code, lang) {
      const attrs = Object.assign({}, lang && { lang });
      const element = this.wrap("pre", this.wrap("code", code), attrs);
      return this.addRaw(element).addEOL();
    }
    addList(items, ordered = false) {
      const tag = ordered ? "ol" : "ul";
      const listItems = items.map((item) => this.wrap("li", item)).join("");
      const element = this.wrap(tag, listItems);
      return this.addRaw(element).addEOL();
    }
    addTable(rows) {
      const tableBody = rows.map((row) => {
        const cells = row.map((cell) => {
          if (typeof cell === "string") {
            return this.wrap("td", cell);
          }
          const { header, data, colspan, rowspan } = cell;
          const tag = header ? "th" : "td";
          const attrs = Object.assign(Object.assign({}, colspan && { colspan }), rowspan && { rowspan });
          return this.wrap(tag, data, attrs);
        }).join("");
        return this.wrap("tr", cells);
      }).join("");
      const element = this.wrap("table", tableBody);
      return this.addRaw(element).addEOL();
    }
    addDetails(label, content) {
      const element = this.wrap("details", this.wrap("summary", label) + content);
      return this.addRaw(element).addEOL();
    }
    addImage(src, alt, options) {
      const { width, height } = options || {};
      const attrs = Object.assign(Object.assign({}, width && { width }), height && { height });
      const element = this.wrap("img", null, Object.assign({ src, alt }, attrs));
      return this.addRaw(element).addEOL();
    }
    addHeading(text, level) {
      const tag = `h${level}`;
      const allowedTag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) ? tag : "h1";
      const element = this.wrap(allowedTag, text);
      return this.addRaw(element).addEOL();
    }
    addSeparator() {
      const element = this.wrap("hr", null);
      return this.addRaw(element).addEOL();
    }
    addBreak() {
      const element = this.wrap("br", null);
      return this.addRaw(element).addEOL();
    }
    addQuote(text, cite) {
      const attrs = Object.assign({}, cite && { cite });
      const element = this.wrap("blockquote", text, attrs);
      return this.addRaw(element).addEOL();
    }
    addLink(text, href) {
      const element = this.wrap("a", text, { href });
      return this.addRaw(element).addEOL();
    }
  }
  var _summary = new Summary;
  exports.markdownSummary = _summary;
  exports.summary = _summary;
});

// node_modules/@actions/core/lib/path-utils.js
var require_path_utils = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = undefined;
  var path = __importStar(__require("path"));
  function toPosixPath(pth) {
    return pth.replace(/[\\]/g, "/");
  }
  exports.toPosixPath = toPosixPath;
  function toWin32Path(pth) {
    return pth.replace(/[/]/g, "\\");
  }
  exports.toWin32Path = toWin32Path;
  function toPlatformPath(pth) {
    return pth.replace(/[/\\]/g, path.sep);
  }
  exports.toPlatformPath = toPlatformPath;
});

// node_modules/@actions/io/lib/io-util.js
var require_io_util = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var _a;
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getCmdPath = exports.tryGetExecutablePath = exports.isRooted = exports.isDirectory = exports.exists = exports.READONLY = exports.UV_FS_O_EXLOCK = exports.IS_WINDOWS = exports.unlink = exports.symlink = exports.stat = exports.rmdir = exports.rm = exports.rename = exports.readlink = exports.readdir = exports.open = exports.mkdir = exports.lstat = exports.copyFile = exports.chmod = undefined;
  var fs = __importStar(__require("fs"));
  var path = __importStar(__require("path"));
  _a = fs.promises, exports.chmod = _a.chmod, exports.copyFile = _a.copyFile, exports.lstat = _a.lstat, exports.mkdir = _a.mkdir, exports.open = _a.open, exports.readdir = _a.readdir, exports.readlink = _a.readlink, exports.rename = _a.rename, exports.rm = _a.rm, exports.rmdir = _a.rmdir, exports.stat = _a.stat, exports.symlink = _a.symlink, exports.unlink = _a.unlink;
  exports.IS_WINDOWS = process.platform === "win32";
  exports.UV_FS_O_EXLOCK = 268435456;
  exports.READONLY = fs.constants.O_RDONLY;
  function exists(fsPath) {
    return __awaiter(this, undefined, undefined, function* () {
      try {
        yield exports.stat(fsPath);
      } catch (err) {
        if (err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return true;
    });
  }
  exports.exists = exists;
  function isDirectory(fsPath, useStat = false) {
    return __awaiter(this, undefined, undefined, function* () {
      const stats = useStat ? yield exports.stat(fsPath) : yield exports.lstat(fsPath);
      return stats.isDirectory();
    });
  }
  exports.isDirectory = isDirectory;
  function isRooted(p) {
    p = normalizeSeparators(p);
    if (!p) {
      throw new Error('isRooted() parameter "p" cannot be empty');
    }
    if (exports.IS_WINDOWS) {
      return p.startsWith("\\") || /^[A-Z]:/i.test(p);
    }
    return p.startsWith("/");
  }
  exports.isRooted = isRooted;
  function tryGetExecutablePath(filePath, extensions) {
    return __awaiter(this, undefined, undefined, function* () {
      let stats = undefined;
      try {
        stats = yield exports.stat(filePath);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
        }
      }
      if (stats && stats.isFile()) {
        if (exports.IS_WINDOWS) {
          const upperExt = path.extname(filePath).toUpperCase();
          if (extensions.some((validExt) => validExt.toUpperCase() === upperExt)) {
            return filePath;
          }
        } else {
          if (isUnixExecutable(stats)) {
            return filePath;
          }
        }
      }
      const originalFilePath = filePath;
      for (const extension of extensions) {
        filePath = originalFilePath + extension;
        stats = undefined;
        try {
          stats = yield exports.stat(filePath);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
          }
        }
        if (stats && stats.isFile()) {
          if (exports.IS_WINDOWS) {
            try {
              const directory = path.dirname(filePath);
              const upperName = path.basename(filePath).toUpperCase();
              for (const actualName of yield exports.readdir(directory)) {
                if (upperName === actualName.toUpperCase()) {
                  filePath = path.join(directory, actualName);
                  break;
                }
              }
            } catch (err) {
              console.log(`Unexpected error attempting to determine the actual case of the file '${filePath}': ${err}`);
            }
            return filePath;
          } else {
            if (isUnixExecutable(stats)) {
              return filePath;
            }
          }
        }
      }
      return "";
    });
  }
  exports.tryGetExecutablePath = tryGetExecutablePath;
  function normalizeSeparators(p) {
    p = p || "";
    if (exports.IS_WINDOWS) {
      p = p.replace(/\//g, "\\");
      return p.replace(/\\\\+/g, "\\");
    }
    return p.replace(/\/\/+/g, "/");
  }
  function isUnixExecutable(stats) {
    return (stats.mode & 1) > 0 || (stats.mode & 8) > 0 && stats.gid === process.getgid() || (stats.mode & 64) > 0 && stats.uid === process.getuid();
  }
  function getCmdPath() {
    var _a2;
    return (_a2 = process.env["COMSPEC"]) !== null && _a2 !== undefined ? _a2 : `cmd.exe`;
  }
  exports.getCmdPath = getCmdPath;
});

// node_modules/@actions/io/lib/io.js
var require_io = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.findInPath = exports.which = exports.mkdirP = exports.rmRF = exports.mv = exports.cp = undefined;
  var assert_1 = __require("assert");
  var path = __importStar(__require("path"));
  var ioUtil = __importStar(require_io_util());
  function cp(source, dest, options = {}) {
    return __awaiter(this, undefined, undefined, function* () {
      const { force, recursive, copySourceDirectory } = readCopyOptions(options);
      const destStat = (yield ioUtil.exists(dest)) ? yield ioUtil.stat(dest) : null;
      if (destStat && destStat.isFile() && !force) {
        return;
      }
      const newDest = destStat && destStat.isDirectory() && copySourceDirectory ? path.join(dest, path.basename(source)) : dest;
      if (!(yield ioUtil.exists(source))) {
        throw new Error(`no such file or directory: ${source}`);
      }
      const sourceStat = yield ioUtil.stat(source);
      if (sourceStat.isDirectory()) {
        if (!recursive) {
          throw new Error(`Failed to copy. ${source} is a directory, but tried to copy without recursive flag.`);
        } else {
          yield cpDirRecursive(source, newDest, 0, force);
        }
      } else {
        if (path.relative(source, newDest) === "") {
          throw new Error(`'${newDest}' and '${source}' are the same file`);
        }
        yield copyFile(source, newDest, force);
      }
    });
  }
  exports.cp = cp;
  function mv(source, dest, options = {}) {
    return __awaiter(this, undefined, undefined, function* () {
      if (yield ioUtil.exists(dest)) {
        let destExists = true;
        if (yield ioUtil.isDirectory(dest)) {
          dest = path.join(dest, path.basename(source));
          destExists = yield ioUtil.exists(dest);
        }
        if (destExists) {
          if (options.force == null || options.force) {
            yield rmRF(dest);
          } else {
            throw new Error("Destination already exists");
          }
        }
      }
      yield mkdirP(path.dirname(dest));
      yield ioUtil.rename(source, dest);
    });
  }
  exports.mv = mv;
  function rmRF(inputPath) {
    return __awaiter(this, undefined, undefined, function* () {
      if (ioUtil.IS_WINDOWS) {
        if (/[*"<>|]/.test(inputPath)) {
          throw new Error('File path must not contain `*`, `"`, `<`, `>` or `|` on Windows');
        }
      }
      try {
        yield ioUtil.rm(inputPath, {
          force: true,
          maxRetries: 3,
          recursive: true,
          retryDelay: 300
        });
      } catch (err) {
        throw new Error(`File was unable to be removed ${err}`);
      }
    });
  }
  exports.rmRF = rmRF;
  function mkdirP(fsPath) {
    return __awaiter(this, undefined, undefined, function* () {
      assert_1.ok(fsPath, "a path argument must be provided");
      yield ioUtil.mkdir(fsPath, { recursive: true });
    });
  }
  exports.mkdirP = mkdirP;
  function which(tool, check) {
    return __awaiter(this, undefined, undefined, function* () {
      if (!tool) {
        throw new Error("parameter 'tool' is required");
      }
      if (check) {
        const result = yield which(tool, false);
        if (!result) {
          if (ioUtil.IS_WINDOWS) {
            throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`);
          } else {
            throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`);
          }
        }
        return result;
      }
      const matches = yield findInPath(tool);
      if (matches && matches.length > 0) {
        return matches[0];
      }
      return "";
    });
  }
  exports.which = which;
  function findInPath(tool) {
    return __awaiter(this, undefined, undefined, function* () {
      if (!tool) {
        throw new Error("parameter 'tool' is required");
      }
      const extensions = [];
      if (ioUtil.IS_WINDOWS && process.env["PATHEXT"]) {
        for (const extension of process.env["PATHEXT"].split(path.delimiter)) {
          if (extension) {
            extensions.push(extension);
          }
        }
      }
      if (ioUtil.isRooted(tool)) {
        const filePath = yield ioUtil.tryGetExecutablePath(tool, extensions);
        if (filePath) {
          return [filePath];
        }
        return [];
      }
      if (tool.includes(path.sep)) {
        return [];
      }
      const directories = [];
      if (process.env.PATH) {
        for (const p of process.env.PATH.split(path.delimiter)) {
          if (p) {
            directories.push(p);
          }
        }
      }
      const matches = [];
      for (const directory of directories) {
        const filePath = yield ioUtil.tryGetExecutablePath(path.join(directory, tool), extensions);
        if (filePath) {
          matches.push(filePath);
        }
      }
      return matches;
    });
  }
  exports.findInPath = findInPath;
  function readCopyOptions(options) {
    const force = options.force == null ? true : options.force;
    const recursive = Boolean(options.recursive);
    const copySourceDirectory = options.copySourceDirectory == null ? true : Boolean(options.copySourceDirectory);
    return { force, recursive, copySourceDirectory };
  }
  function cpDirRecursive(sourceDir, destDir, currentDepth, force) {
    return __awaiter(this, undefined, undefined, function* () {
      if (currentDepth >= 255)
        return;
      currentDepth++;
      yield mkdirP(destDir);
      const files = yield ioUtil.readdir(sourceDir);
      for (const fileName of files) {
        const srcFile = `${sourceDir}/${fileName}`;
        const destFile = `${destDir}/${fileName}`;
        const srcFileStat = yield ioUtil.lstat(srcFile);
        if (srcFileStat.isDirectory()) {
          yield cpDirRecursive(srcFile, destFile, currentDepth, force);
        } else {
          yield copyFile(srcFile, destFile, force);
        }
      }
      yield ioUtil.chmod(destDir, (yield ioUtil.stat(sourceDir)).mode);
    });
  }
  function copyFile(srcFile, destFile, force) {
    return __awaiter(this, undefined, undefined, function* () {
      if ((yield ioUtil.lstat(srcFile)).isSymbolicLink()) {
        try {
          yield ioUtil.lstat(destFile);
          yield ioUtil.unlink(destFile);
        } catch (e) {
          if (e.code === "EPERM") {
            yield ioUtil.chmod(destFile, "0666");
            yield ioUtil.unlink(destFile);
          }
        }
        const symlinkFull = yield ioUtil.readlink(srcFile);
        yield ioUtil.symlink(symlinkFull, destFile, ioUtil.IS_WINDOWS ? "junction" : null);
      } else if (!(yield ioUtil.exists(destFile)) || force) {
        yield ioUtil.copyFile(srcFile, destFile);
      }
    });
  }
});

// node_modules/@actions/exec/lib/toolrunner.js
var require_toolrunner = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.argStringToArray = exports.ToolRunner = undefined;
  var os = __importStar(__require("os"));
  var events = __importStar(__require("events"));
  var child = __importStar(__require("child_process"));
  var path = __importStar(__require("path"));
  var io = __importStar(require_io());
  var ioUtil = __importStar(require_io_util());
  var timers_1 = __require("timers");
  var IS_WINDOWS = process.platform === "win32";

  class ToolRunner extends events.EventEmitter {
    constructor(toolPath, args, options) {
      super();
      if (!toolPath) {
        throw new Error("Parameter 'toolPath' cannot be null or empty.");
      }
      this.toolPath = toolPath;
      this.args = args || [];
      this.options = options || {};
    }
    _debug(message) {
      if (this.options.listeners && this.options.listeners.debug) {
        this.options.listeners.debug(message);
      }
    }
    _getCommandString(options, noPrefix) {
      const toolPath = this._getSpawnFileName();
      const args = this._getSpawnArgs(options);
      let cmd = noPrefix ? "" : "[command]";
      if (IS_WINDOWS) {
        if (this._isCmdFile()) {
          cmd += toolPath;
          for (const a of args) {
            cmd += ` ${a}`;
          }
        } else if (options.windowsVerbatimArguments) {
          cmd += `"${toolPath}"`;
          for (const a of args) {
            cmd += ` ${a}`;
          }
        } else {
          cmd += this._windowsQuoteCmdArg(toolPath);
          for (const a of args) {
            cmd += ` ${this._windowsQuoteCmdArg(a)}`;
          }
        }
      } else {
        cmd += toolPath;
        for (const a of args) {
          cmd += ` ${a}`;
        }
      }
      return cmd;
    }
    _processLineBuffer(data, strBuffer, onLine) {
      try {
        let s = strBuffer + data.toString();
        let n = s.indexOf(os.EOL);
        while (n > -1) {
          const line = s.substring(0, n);
          onLine(line);
          s = s.substring(n + os.EOL.length);
          n = s.indexOf(os.EOL);
        }
        return s;
      } catch (err) {
        this._debug(`error processing line. Failed with error ${err}`);
        return "";
      }
    }
    _getSpawnFileName() {
      if (IS_WINDOWS) {
        if (this._isCmdFile()) {
          return process.env["COMSPEC"] || "cmd.exe";
        }
      }
      return this.toolPath;
    }
    _getSpawnArgs(options) {
      if (IS_WINDOWS) {
        if (this._isCmdFile()) {
          let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
          for (const a of this.args) {
            argline += " ";
            argline += options.windowsVerbatimArguments ? a : this._windowsQuoteCmdArg(a);
          }
          argline += '"';
          return [argline];
        }
      }
      return this.args;
    }
    _endsWith(str, end) {
      return str.endsWith(end);
    }
    _isCmdFile() {
      const upperToolPath = this.toolPath.toUpperCase();
      return this._endsWith(upperToolPath, ".CMD") || this._endsWith(upperToolPath, ".BAT");
    }
    _windowsQuoteCmdArg(arg) {
      if (!this._isCmdFile()) {
        return this._uvQuoteCmdArg(arg);
      }
      if (!arg) {
        return '""';
      }
      const cmdSpecialChars = [
        " ",
        "\t",
        "&",
        "(",
        ")",
        "[",
        "]",
        "{",
        "}",
        "^",
        "=",
        ";",
        "!",
        "'",
        "+",
        ",",
        "`",
        "~",
        "|",
        "<",
        ">",
        '"'
      ];
      let needsQuotes = false;
      for (const char of arg) {
        if (cmdSpecialChars.some((x) => x === char)) {
          needsQuotes = true;
          break;
        }
      }
      if (!needsQuotes) {
        return arg;
      }
      let reverse = '"';
      let quoteHit = true;
      for (let i = arg.length;i > 0; i--) {
        reverse += arg[i - 1];
        if (quoteHit && arg[i - 1] === "\\") {
          reverse += "\\";
        } else if (arg[i - 1] === '"') {
          quoteHit = true;
          reverse += '"';
        } else {
          quoteHit = false;
        }
      }
      reverse += '"';
      return reverse.split("").reverse().join("");
    }
    _uvQuoteCmdArg(arg) {
      if (!arg) {
        return '""';
      }
      if (!arg.includes(" ") && !arg.includes("\t") && !arg.includes('"')) {
        return arg;
      }
      if (!arg.includes('"') && !arg.includes("\\")) {
        return `"${arg}"`;
      }
      let reverse = '"';
      let quoteHit = true;
      for (let i = arg.length;i > 0; i--) {
        reverse += arg[i - 1];
        if (quoteHit && arg[i - 1] === "\\") {
          reverse += "\\";
        } else if (arg[i - 1] === '"') {
          quoteHit = true;
          reverse += "\\";
        } else {
          quoteHit = false;
        }
      }
      reverse += '"';
      return reverse.split("").reverse().join("");
    }
    _cloneExecOptions(options) {
      options = options || {};
      const result = {
        cwd: options.cwd || process.cwd(),
        env: options.env || process.env,
        silent: options.silent || false,
        windowsVerbatimArguments: options.windowsVerbatimArguments || false,
        failOnStdErr: options.failOnStdErr || false,
        ignoreReturnCode: options.ignoreReturnCode || false,
        delay: options.delay || 1e4
      };
      result.outStream = options.outStream || process.stdout;
      result.errStream = options.errStream || process.stderr;
      return result;
    }
    _getSpawnOptions(options, toolPath) {
      options = options || {};
      const result = {};
      result.cwd = options.cwd;
      result.env = options.env;
      result["windowsVerbatimArguments"] = options.windowsVerbatimArguments || this._isCmdFile();
      if (options.windowsVerbatimArguments) {
        result.argv0 = `"${toolPath}"`;
      }
      return result;
    }
    exec() {
      return __awaiter(this, undefined, undefined, function* () {
        if (!ioUtil.isRooted(this.toolPath) && (this.toolPath.includes("/") || IS_WINDOWS && this.toolPath.includes("\\"))) {
          this.toolPath = path.resolve(process.cwd(), this.options.cwd || process.cwd(), this.toolPath);
        }
        this.toolPath = yield io.which(this.toolPath, true);
        return new Promise((resolve, reject) => __awaiter(this, undefined, undefined, function* () {
          this._debug(`exec tool: ${this.toolPath}`);
          this._debug("arguments:");
          for (const arg of this.args) {
            this._debug(`   ${arg}`);
          }
          const optionsNonNull = this._cloneExecOptions(this.options);
          if (!optionsNonNull.silent && optionsNonNull.outStream) {
            optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
          }
          const state = new ExecState(optionsNonNull, this.toolPath);
          state.on("debug", (message) => {
            this._debug(message);
          });
          if (this.options.cwd && !(yield ioUtil.exists(this.options.cwd))) {
            return reject(new Error(`The cwd: ${this.options.cwd} does not exist!`));
          }
          const fileName = this._getSpawnFileName();
          const cp = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
          let stdbuffer = "";
          if (cp.stdout) {
            cp.stdout.on("data", (data) => {
              if (this.options.listeners && this.options.listeners.stdout) {
                this.options.listeners.stdout(data);
              }
              if (!optionsNonNull.silent && optionsNonNull.outStream) {
                optionsNonNull.outStream.write(data);
              }
              stdbuffer = this._processLineBuffer(data, stdbuffer, (line) => {
                if (this.options.listeners && this.options.listeners.stdline) {
                  this.options.listeners.stdline(line);
                }
              });
            });
          }
          let errbuffer = "";
          if (cp.stderr) {
            cp.stderr.on("data", (data) => {
              state.processStderr = true;
              if (this.options.listeners && this.options.listeners.stderr) {
                this.options.listeners.stderr(data);
              }
              if (!optionsNonNull.silent && optionsNonNull.errStream && optionsNonNull.outStream) {
                const s = optionsNonNull.failOnStdErr ? optionsNonNull.errStream : optionsNonNull.outStream;
                s.write(data);
              }
              errbuffer = this._processLineBuffer(data, errbuffer, (line) => {
                if (this.options.listeners && this.options.listeners.errline) {
                  this.options.listeners.errline(line);
                }
              });
            });
          }
          cp.on("error", (err) => {
            state.processError = err.message;
            state.processExited = true;
            state.processClosed = true;
            state.CheckComplete();
          });
          cp.on("exit", (code) => {
            state.processExitCode = code;
            state.processExited = true;
            this._debug(`Exit code ${code} received from tool '${this.toolPath}'`);
            state.CheckComplete();
          });
          cp.on("close", (code) => {
            state.processExitCode = code;
            state.processExited = true;
            state.processClosed = true;
            this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
            state.CheckComplete();
          });
          state.on("done", (error, exitCode) => {
            if (stdbuffer.length > 0) {
              this.emit("stdline", stdbuffer);
            }
            if (errbuffer.length > 0) {
              this.emit("errline", errbuffer);
            }
            cp.removeAllListeners();
            if (error) {
              reject(error);
            } else {
              resolve(exitCode);
            }
          });
          if (this.options.input) {
            if (!cp.stdin) {
              throw new Error("child process missing stdin");
            }
            cp.stdin.end(this.options.input);
          }
        }));
      });
    }
  }
  exports.ToolRunner = ToolRunner;
  function argStringToArray(argString) {
    const args = [];
    let inQuotes = false;
    let escaped = false;
    let arg = "";
    function append(c) {
      if (escaped && c !== '"') {
        arg += "\\";
      }
      arg += c;
      escaped = false;
    }
    for (let i = 0;i < argString.length; i++) {
      const c = argString.charAt(i);
      if (c === '"') {
        if (!escaped) {
          inQuotes = !inQuotes;
        } else {
          append(c);
        }
        continue;
      }
      if (c === "\\" && escaped) {
        append(c);
        continue;
      }
      if (c === "\\" && inQuotes) {
        escaped = true;
        continue;
      }
      if (c === " " && !inQuotes) {
        if (arg.length > 0) {
          args.push(arg);
          arg = "";
        }
        continue;
      }
      append(c);
    }
    if (arg.length > 0) {
      args.push(arg.trim());
    }
    return args;
  }
  exports.argStringToArray = argStringToArray;

  class ExecState extends events.EventEmitter {
    constructor(options, toolPath) {
      super();
      this.processClosed = false;
      this.processError = "";
      this.processExitCode = 0;
      this.processExited = false;
      this.processStderr = false;
      this.delay = 1e4;
      this.done = false;
      this.timeout = null;
      if (!toolPath) {
        throw new Error("toolPath must not be empty");
      }
      this.options = options;
      this.toolPath = toolPath;
      if (options.delay) {
        this.delay = options.delay;
      }
    }
    CheckComplete() {
      if (this.done) {
        return;
      }
      if (this.processClosed) {
        this._setResult();
      } else if (this.processExited) {
        this.timeout = timers_1.setTimeout(ExecState.HandleTimeout, this.delay, this);
      }
    }
    _debug(message) {
      this.emit("debug", message);
    }
    _setResult() {
      let error;
      if (this.processExited) {
        if (this.processError) {
          error = new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
        } else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) {
          error = new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
        } else if (this.processStderr && this.options.failOnStdErr) {
          error = new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
        }
      }
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.done = true;
      this.emit("done", error, this.processExitCode);
    }
    static HandleTimeout(state) {
      if (state.done) {
        return;
      }
      if (!state.processClosed && state.processExited) {
        const message = `The STDIO streams did not close within ${state.delay / 1000} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
        state._debug(message);
      }
      state._setResult();
    }
  }
});

// node_modules/@actions/exec/lib/exec.js
var require_exec = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getExecOutput = exports.exec = undefined;
  var string_decoder_1 = __require("string_decoder");
  var tr = __importStar(require_toolrunner());
  function exec(commandLine, args, options) {
    return __awaiter(this, undefined, undefined, function* () {
      const commandArgs = tr.argStringToArray(commandLine);
      if (commandArgs.length === 0) {
        throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
      }
      const toolPath = commandArgs[0];
      args = commandArgs.slice(1).concat(args || []);
      const runner = new tr.ToolRunner(toolPath, args, options);
      return runner.exec();
    });
  }
  exports.exec = exec;
  function getExecOutput(commandLine, args, options) {
    var _a, _b;
    return __awaiter(this, undefined, undefined, function* () {
      let stdout = "";
      let stderr = "";
      const stdoutDecoder = new string_decoder_1.StringDecoder("utf8");
      const stderrDecoder = new string_decoder_1.StringDecoder("utf8");
      const originalStdoutListener = (_a = options === null || options === undefined ? undefined : options.listeners) === null || _a === undefined ? undefined : _a.stdout;
      const originalStdErrListener = (_b = options === null || options === undefined ? undefined : options.listeners) === null || _b === undefined ? undefined : _b.stderr;
      const stdErrListener = (data) => {
        stderr += stderrDecoder.write(data);
        if (originalStdErrListener) {
          originalStdErrListener(data);
        }
      };
      const stdOutListener = (data) => {
        stdout += stdoutDecoder.write(data);
        if (originalStdoutListener) {
          originalStdoutListener(data);
        }
      };
      const listeners = Object.assign(Object.assign({}, options === null || options === undefined ? undefined : options.listeners), { stdout: stdOutListener, stderr: stdErrListener });
      const exitCode = yield exec(commandLine, args, Object.assign(Object.assign({}, options), { listeners }));
      stdout += stdoutDecoder.end();
      stderr += stderrDecoder.end();
      return {
        exitCode,
        stdout,
        stderr
      };
    });
  }
  exports.getExecOutput = getExecOutput;
});

// node_modules/@actions/core/lib/platform.js
var require_platform = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getDetails = exports.isLinux = exports.isMacOS = exports.isWindows = exports.arch = exports.platform = undefined;
  var os_1 = __importDefault(__require("os"));
  var exec = __importStar(require_exec());
  var getWindowsInfo = () => __awaiter(undefined, undefined, undefined, function* () {
    const { stdout: version } = yield exec.getExecOutput('powershell -command "(Get-CimInstance -ClassName Win32_OperatingSystem).Version"', undefined, {
      silent: true
    });
    const { stdout: name } = yield exec.getExecOutput('powershell -command "(Get-CimInstance -ClassName Win32_OperatingSystem).Caption"', undefined, {
      silent: true
    });
    return {
      name: name.trim(),
      version: version.trim()
    };
  });
  var getMacOsInfo = () => __awaiter(undefined, undefined, undefined, function* () {
    var _a, _b, _c, _d;
    const { stdout } = yield exec.getExecOutput("sw_vers", undefined, {
      silent: true
    });
    const version = (_b = (_a = stdout.match(/ProductVersion:\s*(.+)/)) === null || _a === undefined ? undefined : _a[1]) !== null && _b !== undefined ? _b : "";
    const name = (_d = (_c = stdout.match(/ProductName:\s*(.+)/)) === null || _c === undefined ? undefined : _c[1]) !== null && _d !== undefined ? _d : "";
    return {
      name,
      version
    };
  });
  var getLinuxInfo = () => __awaiter(undefined, undefined, undefined, function* () {
    const { stdout } = yield exec.getExecOutput("lsb_release", ["-i", "-r", "-s"], {
      silent: true
    });
    const [name, version] = stdout.trim().split(`
`);
    return {
      name,
      version
    };
  });
  exports.platform = os_1.default.platform();
  exports.arch = os_1.default.arch();
  exports.isWindows = exports.platform === "win32";
  exports.isMacOS = exports.platform === "darwin";
  exports.isLinux = exports.platform === "linux";
  function getDetails() {
    return __awaiter(this, undefined, undefined, function* () {
      return Object.assign(Object.assign({}, yield exports.isWindows ? getWindowsInfo() : exports.isMacOS ? getMacOsInfo() : getLinuxInfo()), {
        platform: exports.platform,
        arch: exports.arch,
        isWindows: exports.isWindows,
        isMacOS: exports.isMacOS,
        isLinux: exports.isLinux
      });
    });
  }
  exports.getDetails = getDetails;
});

// node_modules/@actions/core/lib/core.js
var require_core = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.platform = exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = exports.markdownSummary = exports.summary = exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = undefined;
  var command_1 = require_command();
  var file_command_1 = require_file_command();
  var utils_1 = require_utils();
  var os = __importStar(__require("os"));
  var path = __importStar(__require("path"));
  var oidc_utils_1 = require_oidc_utils();
  var ExitCode;
  (function(ExitCode2) {
    ExitCode2[ExitCode2["Success"] = 0] = "Success";
    ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
  })(ExitCode || (exports.ExitCode = ExitCode = {}));
  function exportVariable(name, val) {
    const convertedVal = (0, utils_1.toCommandValue)(val);
    process.env[name] = convertedVal;
    const filePath = process.env["GITHUB_ENV"] || "";
    if (filePath) {
      return (0, file_command_1.issueFileCommand)("ENV", (0, file_command_1.prepareKeyValueMessage)(name, val));
    }
    (0, command_1.issueCommand)("set-env", { name }, convertedVal);
  }
  exports.exportVariable = exportVariable;
  function setSecret(secret) {
    (0, command_1.issueCommand)("add-mask", {}, secret);
  }
  exports.setSecret = setSecret;
  function addPath(inputPath) {
    const filePath = process.env["GITHUB_PATH"] || "";
    if (filePath) {
      (0, file_command_1.issueFileCommand)("PATH", inputPath);
    } else {
      (0, command_1.issueCommand)("add-path", {}, inputPath);
    }
    process.env["PATH"] = `${inputPath}${path.delimiter}${process.env["PATH"]}`;
  }
  exports.addPath = addPath;
  function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
    if (options && options.required && !val) {
      throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
      return val;
    }
    return val.trim();
  }
  exports.getInput = getInput;
  function getMultilineInput(name, options) {
    const inputs = getInput(name, options).split(`
`).filter((x) => x !== "");
    if (options && options.trimWhitespace === false) {
      return inputs;
    }
    return inputs.map((input) => input.trim());
  }
  exports.getMultilineInput = getMultilineInput;
  function getBooleanInput(name, options) {
    const trueValue = ["true", "True", "TRUE"];
    const falseValue = ["false", "False", "FALSE"];
    const val = getInput(name, options);
    if (trueValue.includes(val))
      return true;
    if (falseValue.includes(val))
      return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}
` + `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
  }
  exports.getBooleanInput = getBooleanInput;
  function setOutput(name, value) {
    const filePath = process.env["GITHUB_OUTPUT"] || "";
    if (filePath) {
      return (0, file_command_1.issueFileCommand)("OUTPUT", (0, file_command_1.prepareKeyValueMessage)(name, value));
    }
    process.stdout.write(os.EOL);
    (0, command_1.issueCommand)("set-output", { name }, (0, utils_1.toCommandValue)(value));
  }
  exports.setOutput = setOutput;
  function setCommandEcho(enabled) {
    (0, command_1.issue)("echo", enabled ? "on" : "off");
  }
  exports.setCommandEcho = setCommandEcho;
  function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
  }
  exports.setFailed = setFailed;
  function isDebug() {
    return process.env["RUNNER_DEBUG"] === "1";
  }
  exports.isDebug = isDebug;
  function debug(message) {
    (0, command_1.issueCommand)("debug", {}, message);
  }
  exports.debug = debug;
  function error(message, properties = {}) {
    (0, command_1.issueCommand)("error", (0, utils_1.toCommandProperties)(properties), message instanceof Error ? message.toString() : message);
  }
  exports.error = error;
  function warning(message, properties = {}) {
    (0, command_1.issueCommand)("warning", (0, utils_1.toCommandProperties)(properties), message instanceof Error ? message.toString() : message);
  }
  exports.warning = warning;
  function notice(message, properties = {}) {
    (0, command_1.issueCommand)("notice", (0, utils_1.toCommandProperties)(properties), message instanceof Error ? message.toString() : message);
  }
  exports.notice = notice;
  function info(message) {
    process.stdout.write(message + os.EOL);
  }
  exports.info = info;
  function startGroup(name) {
    (0, command_1.issue)("group", name);
  }
  exports.startGroup = startGroup;
  function endGroup() {
    (0, command_1.issue)("endgroup");
  }
  exports.endGroup = endGroup;
  function group(name, fn) {
    return __awaiter(this, undefined, undefined, function* () {
      startGroup(name);
      let result;
      try {
        result = yield fn();
      } finally {
        endGroup();
      }
      return result;
    });
  }
  exports.group = group;
  function saveState(name, value) {
    const filePath = process.env["GITHUB_STATE"] || "";
    if (filePath) {
      return (0, file_command_1.issueFileCommand)("STATE", (0, file_command_1.prepareKeyValueMessage)(name, value));
    }
    (0, command_1.issueCommand)("save-state", { name }, (0, utils_1.toCommandValue)(value));
  }
  exports.saveState = saveState;
  function getState(name) {
    return process.env[`STATE_${name}`] || "";
  }
  exports.getState = getState;
  function getIDToken(aud) {
    return __awaiter(this, undefined, undefined, function* () {
      return yield oidc_utils_1.OidcClient.getIDToken(aud);
    });
  }
  exports.getIDToken = getIDToken;
  var summary_1 = require_summary();
  Object.defineProperty(exports, "summary", { enumerable: true, get: function() {
    return summary_1.summary;
  } });
  var summary_2 = require_summary();
  Object.defineProperty(exports, "markdownSummary", { enumerable: true, get: function() {
    return summary_2.markdownSummary;
  } });
  var path_utils_1 = require_path_utils();
  Object.defineProperty(exports, "toPosixPath", { enumerable: true, get: function() {
    return path_utils_1.toPosixPath;
  } });
  Object.defineProperty(exports, "toWin32Path", { enumerable: true, get: function() {
    return path_utils_1.toWin32Path;
  } });
  Object.defineProperty(exports, "toPlatformPath", { enumerable: true, get: function() {
    return path_utils_1.toPlatformPath;
  } });
  exports.platform = __importStar(require_platform());
});

// node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS((exports, module) => {
  var constants = __require("constants");
  var origCwd = process.cwd;
  var cwd = null;
  var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    if (!cwd)
      cwd = origCwd.call(process);
    return cwd;
  };
  try {
    process.cwd();
  } catch (er) {}
  if (typeof process.chdir === "function") {
    chdir = process.chdir;
    process.chdir = function(d) {
      cwd = null;
      chdir.call(process, d);
    };
    if (Object.setPrototypeOf)
      Object.setPrototypeOf(process.chdir, chdir);
  }
  var chdir;
  module.exports = patch;
  function patch(fs) {
    if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
      patchLchmod(fs);
    }
    if (!fs.lutimes) {
      patchLutimes(fs);
    }
    fs.chown = chownFix(fs.chown);
    fs.fchown = chownFix(fs.fchown);
    fs.lchown = chownFix(fs.lchown);
    fs.chmod = chmodFix(fs.chmod);
    fs.fchmod = chmodFix(fs.fchmod);
    fs.lchmod = chmodFix(fs.lchmod);
    fs.chownSync = chownFixSync(fs.chownSync);
    fs.fchownSync = chownFixSync(fs.fchownSync);
    fs.lchownSync = chownFixSync(fs.lchownSync);
    fs.chmodSync = chmodFixSync(fs.chmodSync);
    fs.fchmodSync = chmodFixSync(fs.fchmodSync);
    fs.lchmodSync = chmodFixSync(fs.lchmodSync);
    fs.stat = statFix(fs.stat);
    fs.fstat = statFix(fs.fstat);
    fs.lstat = statFix(fs.lstat);
    fs.statSync = statFixSync(fs.statSync);
    fs.fstatSync = statFixSync(fs.fstatSync);
    fs.lstatSync = statFixSync(fs.lstatSync);
    if (fs.chmod && !fs.lchmod) {
      fs.lchmod = function(path, mode, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchmodSync = function() {};
    }
    if (fs.chown && !fs.lchown) {
      fs.lchown = function(path, uid, gid, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchownSync = function() {};
    }
    if (platform === "win32") {
      fs.rename = typeof fs.rename !== "function" ? fs.rename : function(fs$rename) {
        function rename(from, to, cb) {
          var start = Date.now();
          var backoff = 0;
          fs$rename(from, to, function CB(er) {
            if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 60000) {
              setTimeout(function() {
                fs.stat(to, function(stater, st) {
                  if (stater && stater.code === "ENOENT")
                    fs$rename(from, to, CB);
                  else
                    cb(er);
                });
              }, backoff);
              if (backoff < 100)
                backoff += 10;
              return;
            }
            if (cb)
              cb(er);
          });
        }
        if (Object.setPrototypeOf)
          Object.setPrototypeOf(rename, fs$rename);
        return rename;
      }(fs.rename);
    }
    fs.read = typeof fs.read !== "function" ? fs.read : function(fs$read) {
      function read(fd, buffer, offset, length, position, callback_) {
        var callback;
        if (callback_ && typeof callback_ === "function") {
          var eagCounter = 0;
          callback = function(er, _, __) {
            if (er && er.code === "EAGAIN" && eagCounter < 10) {
              eagCounter++;
              return fs$read.call(fs, fd, buffer, offset, length, position, callback);
            }
            callback_.apply(this, arguments);
          };
        }
        return fs$read.call(fs, fd, buffer, offset, length, position, callback);
      }
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(read, fs$read);
      return read;
    }(fs.read);
    fs.readSync = typeof fs.readSync !== "function" ? fs.readSync : function(fs$readSync) {
      return function(fd, buffer, offset, length, position) {
        var eagCounter = 0;
        while (true) {
          try {
            return fs$readSync.call(fs, fd, buffer, offset, length, position);
          } catch (er) {
            if (er.code === "EAGAIN" && eagCounter < 10) {
              eagCounter++;
              continue;
            }
            throw er;
          }
        }
      };
    }(fs.readSync);
    function patchLchmod(fs2) {
      fs2.lchmod = function(path, mode, callback) {
        fs2.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
          if (err) {
            if (callback)
              callback(err);
            return;
          }
          fs2.fchmod(fd, mode, function(err2) {
            fs2.close(fd, function(err22) {
              if (callback)
                callback(err2 || err22);
            });
          });
        });
      };
      fs2.lchmodSync = function(path, mode) {
        var fd = fs2.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
        var threw = true;
        var ret;
        try {
          ret = fs2.fchmodSync(fd, mode);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs2.closeSync(fd);
            } catch (er) {}
          } else {
            fs2.closeSync(fd);
          }
        }
        return ret;
      };
    }
    function patchLutimes(fs2) {
      if (constants.hasOwnProperty("O_SYMLINK") && fs2.futimes) {
        fs2.lutimes = function(path, at, mt, cb) {
          fs2.open(path, constants.O_SYMLINK, function(er, fd) {
            if (er) {
              if (cb)
                cb(er);
              return;
            }
            fs2.futimes(fd, at, mt, function(er2) {
              fs2.close(fd, function(er22) {
                if (cb)
                  cb(er2 || er22);
              });
            });
          });
        };
        fs2.lutimesSync = function(path, at, mt) {
          var fd = fs2.openSync(path, constants.O_SYMLINK);
          var ret;
          var threw = true;
          try {
            ret = fs2.futimesSync(fd, at, mt);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs2.closeSync(fd);
              } catch (er) {}
            } else {
              fs2.closeSync(fd);
            }
          }
          return ret;
        };
      } else if (fs2.futimes) {
        fs2.lutimes = function(_a, _b, _c, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs2.lutimesSync = function() {};
      }
    }
    function chmodFix(orig) {
      if (!orig)
        return orig;
      return function(target, mode, cb) {
        return orig.call(fs, target, mode, function(er) {
          if (chownErOk(er))
            er = null;
          if (cb)
            cb.apply(this, arguments);
        });
      };
    }
    function chmodFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, mode) {
        try {
          return orig.call(fs, target, mode);
        } catch (er) {
          if (!chownErOk(er))
            throw er;
        }
      };
    }
    function chownFix(orig) {
      if (!orig)
        return orig;
      return function(target, uid, gid, cb) {
        return orig.call(fs, target, uid, gid, function(er) {
          if (chownErOk(er))
            er = null;
          if (cb)
            cb.apply(this, arguments);
        });
      };
    }
    function chownFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, uid, gid) {
        try {
          return orig.call(fs, target, uid, gid);
        } catch (er) {
          if (!chownErOk(er))
            throw er;
        }
      };
    }
    function statFix(orig) {
      if (!orig)
        return orig;
      return function(target, options, cb) {
        if (typeof options === "function") {
          cb = options;
          options = null;
        }
        function callback(er, stats) {
          if (stats) {
            if (stats.uid < 0)
              stats.uid += 4294967296;
            if (stats.gid < 0)
              stats.gid += 4294967296;
          }
          if (cb)
            cb.apply(this, arguments);
        }
        return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
      };
    }
    function statFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, options) {
        var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
        if (stats) {
          if (stats.uid < 0)
            stats.uid += 4294967296;
          if (stats.gid < 0)
            stats.gid += 4294967296;
        }
        return stats;
      };
    }
    function chownErOk(er) {
      if (!er)
        return true;
      if (er.code === "ENOSYS")
        return true;
      var nonroot = !process.getuid || process.getuid() !== 0;
      if (nonroot) {
        if (er.code === "EINVAL" || er.code === "EPERM")
          return true;
      }
      return false;
    }
  }
});

// node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS((exports, module) => {
  var Stream = __require("stream").Stream;
  module.exports = legacy;
  function legacy(fs) {
    return {
      ReadStream,
      WriteStream
    };
    function ReadStream(path, options) {
      if (!(this instanceof ReadStream))
        return new ReadStream(path, options);
      Stream.call(this);
      var self2 = this;
      this.path = path;
      this.fd = null;
      this.readable = true;
      this.paused = false;
      this.flags = "r";
      this.mode = 438;
      this.bufferSize = 64 * 1024;
      options = options || {};
      var keys = Object.keys(options);
      for (var index = 0, length = keys.length;index < length; index++) {
        var key = keys[index];
        this[key] = options[key];
      }
      if (this.encoding)
        this.setEncoding(this.encoding);
      if (this.start !== undefined) {
        if (typeof this.start !== "number") {
          throw TypeError("start must be a Number");
        }
        if (this.end === undefined) {
          this.end = Infinity;
        } else if (typeof this.end !== "number") {
          throw TypeError("end must be a Number");
        }
        if (this.start > this.end) {
          throw new Error("start must be <= end");
        }
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          self2._read();
        });
        return;
      }
      fs.open(this.path, this.flags, this.mode, function(err, fd) {
        if (err) {
          self2.emit("error", err);
          self2.readable = false;
          return;
        }
        self2.fd = fd;
        self2.emit("open", fd);
        self2._read();
      });
    }
    function WriteStream(path, options) {
      if (!(this instanceof WriteStream))
        return new WriteStream(path, options);
      Stream.call(this);
      this.path = path;
      this.fd = null;
      this.writable = true;
      this.flags = "w";
      this.encoding = "binary";
      this.mode = 438;
      this.bytesWritten = 0;
      options = options || {};
      var keys = Object.keys(options);
      for (var index = 0, length = keys.length;index < length; index++) {
        var key = keys[index];
        this[key] = options[key];
      }
      if (this.start !== undefined) {
        if (typeof this.start !== "number") {
          throw TypeError("start must be a Number");
        }
        if (this.start < 0) {
          throw new Error("start must be >= zero");
        }
        this.pos = this.start;
      }
      this.busy = false;
      this._queue = [];
      if (this.fd === null) {
        this._open = fs.open;
        this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
        this.flush();
      }
    }
  }
});

// node_modules/graceful-fs/clone.js
var require_clone = __commonJS((exports, module) => {
  module.exports = clone;
  var getPrototypeOf = Object.getPrototypeOf || function(obj) {
    return obj.__proto__;
  };
  function clone(obj) {
    if (obj === null || typeof obj !== "object")
      return obj;
    if (obj instanceof Object)
      var copy = { __proto__: getPrototypeOf(obj) };
    else
      var copy = Object.create(null);
    Object.getOwnPropertyNames(obj).forEach(function(key) {
      Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
    });
    return copy;
  }
});

// node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS((exports, module) => {
  var fs = __require("fs");
  var polyfills = require_polyfills();
  var legacy = require_legacy_streams();
  var clone = require_clone();
  var util = __require("util");
  var gracefulQueue;
  var previousSymbol;
  if (typeof Symbol === "function" && typeof Symbol.for === "function") {
    gracefulQueue = Symbol.for("graceful-fs.queue");
    previousSymbol = Symbol.for("graceful-fs.previous");
  } else {
    gracefulQueue = "___graceful-fs.queue";
    previousSymbol = "___graceful-fs.previous";
  }
  function noop() {}
  function publishQueue(context, queue2) {
    Object.defineProperty(context, gracefulQueue, {
      get: function() {
        return queue2;
      }
    });
  }
  var debug = noop;
  if (util.debuglog)
    debug = util.debuglog("gfs4");
  else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
    debug = function() {
      var m = util.format.apply(util, arguments);
      m = "GFS4: " + m.split(/\n/).join(`
GFS4: `);
      console.error(m);
    };
  if (!fs[gracefulQueue]) {
    queue = global[gracefulQueue] || [];
    publishQueue(fs, queue);
    fs.close = function(fs$close) {
      function close(fd, cb) {
        return fs$close.call(fs, fd, function(err) {
          if (!err) {
            resetQueue();
          }
          if (typeof cb === "function")
            cb.apply(this, arguments);
        });
      }
      Object.defineProperty(close, previousSymbol, {
        value: fs$close
      });
      return close;
    }(fs.close);
    fs.closeSync = function(fs$closeSync) {
      function closeSync(fd) {
        fs$closeSync.apply(fs, arguments);
        resetQueue();
      }
      Object.defineProperty(closeSync, previousSymbol, {
        value: fs$closeSync
      });
      return closeSync;
    }(fs.closeSync);
    if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
      process.on("exit", function() {
        debug(fs[gracefulQueue]);
        __require("assert").equal(fs[gracefulQueue].length, 0);
      });
    }
  }
  var queue;
  if (!global[gracefulQueue]) {
    publishQueue(global, fs[gracefulQueue]);
  }
  module.exports = patch(clone(fs));
  if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs);
    fs.__patched = true;
  }
  function patch(fs2) {
    polyfills(fs2);
    fs2.gracefulify = patch;
    fs2.createReadStream = createReadStream;
    fs2.createWriteStream = createWriteStream;
    var fs$readFile = fs2.readFile;
    fs2.readFile = readFile;
    function readFile(path, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$readFile(path, options, cb);
      function go$readFile(path2, options2, cb2, startTime) {
        return fs$readFile(path2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$readFile, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$writeFile = fs2.writeFile;
    fs2.writeFile = writeFile;
    function writeFile(path, data, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$writeFile(path, data, options, cb);
      function go$writeFile(path2, data2, options2, cb2, startTime) {
        return fs$writeFile(path2, data2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$writeFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$appendFile = fs2.appendFile;
    if (fs$appendFile)
      fs2.appendFile = appendFile;
    function appendFile(path, data, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$appendFile(path, data, options, cb);
      function go$appendFile(path2, data2, options2, cb2, startTime) {
        return fs$appendFile(path2, data2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$appendFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$copyFile = fs2.copyFile;
    if (fs$copyFile)
      fs2.copyFile = copyFile;
    function copyFile(src, dest, flags, cb) {
      if (typeof flags === "function") {
        cb = flags;
        flags = 0;
      }
      return go$copyFile(src, dest, flags, cb);
      function go$copyFile(src2, dest2, flags2, cb2, startTime) {
        return fs$copyFile(src2, dest2, flags2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$readdir = fs2.readdir;
    fs2.readdir = readdir;
    var noReaddirOptionVersions = /^v[0-5]\./;
    function readdir(path, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir(path2, options2, cb2, startTime) {
        return fs$readdir(path2, fs$readdirCallback(path2, options2, cb2, startTime));
      } : function go$readdir(path2, options2, cb2, startTime) {
        return fs$readdir(path2, options2, fs$readdirCallback(path2, options2, cb2, startTime));
      };
      return go$readdir(path, options, cb);
      function fs$readdirCallback(path2, options2, cb2, startTime) {
        return function(err, files) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([
              go$readdir,
              [path2, options2, cb2],
              err,
              startTime || Date.now(),
              Date.now()
            ]);
          else {
            if (files && files.sort)
              files.sort();
            if (typeof cb2 === "function")
              cb2.call(this, err, files);
          }
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var legStreams = legacy(fs2);
      ReadStream = legStreams.ReadStream;
      WriteStream = legStreams.WriteStream;
    }
    var fs$ReadStream = fs2.ReadStream;
    if (fs$ReadStream) {
      ReadStream.prototype = Object.create(fs$ReadStream.prototype);
      ReadStream.prototype.open = ReadStream$open;
    }
    var fs$WriteStream = fs2.WriteStream;
    if (fs$WriteStream) {
      WriteStream.prototype = Object.create(fs$WriteStream.prototype);
      WriteStream.prototype.open = WriteStream$open;
    }
    Object.defineProperty(fs2, "ReadStream", {
      get: function() {
        return ReadStream;
      },
      set: function(val) {
        ReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(fs2, "WriteStream", {
      get: function() {
        return WriteStream;
      },
      set: function(val) {
        WriteStream = val;
      },
      enumerable: true,
      configurable: true
    });
    var FileReadStream = ReadStream;
    Object.defineProperty(fs2, "FileReadStream", {
      get: function() {
        return FileReadStream;
      },
      set: function(val) {
        FileReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    var FileWriteStream = WriteStream;
    Object.defineProperty(fs2, "FileWriteStream", {
      get: function() {
        return FileWriteStream;
      },
      set: function(val) {
        FileWriteStream = val;
      },
      enumerable: true,
      configurable: true
    });
    function ReadStream(path, options) {
      if (this instanceof ReadStream)
        return fs$ReadStream.apply(this, arguments), this;
      else
        return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
    }
    function ReadStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          if (that.autoClose)
            that.destroy();
          that.emit("error", err);
        } else {
          that.fd = fd;
          that.emit("open", fd);
          that.read();
        }
      });
    }
    function WriteStream(path, options) {
      if (this instanceof WriteStream)
        return fs$WriteStream.apply(this, arguments), this;
      else
        return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
    }
    function WriteStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          that.destroy();
          that.emit("error", err);
        } else {
          that.fd = fd;
          that.emit("open", fd);
        }
      });
    }
    function createReadStream(path, options) {
      return new fs2.ReadStream(path, options);
    }
    function createWriteStream(path, options) {
      return new fs2.WriteStream(path, options);
    }
    var fs$open = fs2.open;
    fs2.open = open;
    function open(path, flags, mode, cb) {
      if (typeof mode === "function")
        cb = mode, mode = null;
      return go$open(path, flags, mode, cb);
      function go$open(path2, flags2, mode2, cb2, startTime) {
        return fs$open(path2, flags2, mode2, function(err, fd) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$open, [path2, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    return fs2;
  }
  function enqueue(elem) {
    debug("ENQUEUE", elem[0].name, elem[1]);
    fs[gracefulQueue].push(elem);
    retry();
  }
  var retryTimer;
  function resetQueue() {
    var now = Date.now();
    for (var i = 0;i < fs[gracefulQueue].length; ++i) {
      if (fs[gracefulQueue][i].length > 2) {
        fs[gracefulQueue][i][3] = now;
        fs[gracefulQueue][i][4] = now;
      }
    }
    retry();
  }
  function retry() {
    clearTimeout(retryTimer);
    retryTimer = undefined;
    if (fs[gracefulQueue].length === 0)
      return;
    var elem = fs[gracefulQueue].shift();
    var fn = elem[0];
    var args = elem[1];
    var err = elem[2];
    var startTime = elem[3];
    var lastTime = elem[4];
    if (startTime === undefined) {
      debug("RETRY", fn.name, args);
      fn.apply(null, args);
    } else if (Date.now() - startTime >= 60000) {
      debug("TIMEOUT", fn.name, args);
      var cb = args.pop();
      if (typeof cb === "function")
        cb.call(null, err);
    } else {
      var sinceAttempt = Date.now() - lastTime;
      var sinceStart = Math.max(lastTime - startTime, 1);
      var desiredDelay = Math.min(sinceStart * 1.2, 100);
      if (sinceAttempt >= desiredDelay) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args.concat([startTime]));
      } else {
        fs[gracefulQueue].push(elem);
      }
    }
    if (retryTimer === undefined) {
      retryTimer = setTimeout(retry, 0);
    }
  }
});

// node_modules/universalify/index.js
var require_universalify = __commonJS((exports) => {
  exports.fromCallback = function(fn) {
    return Object.defineProperty(function(...args) {
      if (typeof args[args.length - 1] === "function")
        fn.apply(this, args);
      else {
        return new Promise((resolve, reject) => {
          args.push((err, res) => err != null ? reject(err) : resolve(res));
          fn.apply(this, args);
        });
      }
    }, "name", { value: fn.name });
  };
  exports.fromPromise = function(fn) {
    return Object.defineProperty(function(...args) {
      const cb = args[args.length - 1];
      if (typeof cb !== "function")
        return fn.apply(this, args);
      else {
        args.pop();
        fn.apply(this, args).then((r) => cb(null, r), cb);
      }
    }, "name", { value: fn.name });
  };
});

// node_modules/jsonfile/utils.js
var require_utils2 = __commonJS((exports, module) => {
  function stringify(obj, { EOL = `
`, finalEOL = true, replacer = null, spaces } = {}) {
    const EOF = finalEOL ? EOL : "";
    const str = JSON.stringify(obj, replacer, spaces);
    return str.replace(/\n/g, EOL) + EOF;
  }
  function stripBom(content) {
    if (Buffer.isBuffer(content))
      content = content.toString("utf8");
    return content.replace(/^\uFEFF/, "");
  }
  module.exports = { stringify, stripBom };
});

// node_modules/jsonfile/index.js
var require_jsonfile = __commonJS((exports, module) => {
  var _fs;
  try {
    _fs = require_graceful_fs();
  } catch (_) {
    _fs = __require("fs");
  }
  var universalify = require_universalify();
  var { stringify, stripBom } = require_utils2();
  async function _readFile(file, options = {}) {
    if (typeof options === "string") {
      options = { encoding: options };
    }
    const fs = options.fs || _fs;
    const shouldThrow = "throws" in options ? options.throws : true;
    let data = await universalify.fromCallback(fs.readFile)(file, options);
    data = stripBom(data);
    let obj;
    try {
      obj = JSON.parse(data, options ? options.reviver : null);
    } catch (err) {
      if (shouldThrow) {
        err.message = `${file}: ${err.message}`;
        throw err;
      } else {
        return null;
      }
    }
    return obj;
  }
  var readFile = universalify.fromPromise(_readFile);
  function readFileSync(file, options = {}) {
    if (typeof options === "string") {
      options = { encoding: options };
    }
    const fs = options.fs || _fs;
    const shouldThrow = "throws" in options ? options.throws : true;
    try {
      let content = fs.readFileSync(file, options);
      content = stripBom(content);
      return JSON.parse(content, options.reviver);
    } catch (err) {
      if (shouldThrow) {
        err.message = `${file}: ${err.message}`;
        throw err;
      } else {
        return null;
      }
    }
  }
  async function _writeFile(file, obj, options = {}) {
    const fs = options.fs || _fs;
    const str = stringify(obj, options);
    await universalify.fromCallback(fs.writeFile)(file, str, options);
  }
  var writeFile = universalify.fromPromise(_writeFile);
  function writeFileSync(file, obj, options = {}) {
    const fs = options.fs || _fs;
    const str = stringify(obj, options);
    return fs.writeFileSync(file, str, options);
  }
  module.exports = {
    readFile,
    readFileSync,
    writeFile,
    writeFileSync
  };
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS((exports, module) => {
  var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
  module.exports = debug;
});

// node_modules/semver/internal/constants.js
var require_constants = __commonJS((exports, module) => {
  var SEMVER_SPEC_VERSION = "2.0.0";
  var MAX_LENGTH = 256;
  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  var MAX_SAFE_COMPONENT_LENGTH = 16;
  var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
  var RELEASE_TYPES = [
    "major",
    "premajor",
    "minor",
    "preminor",
    "patch",
    "prepatch",
    "prerelease"
  ];
  module.exports = {
    MAX_LENGTH,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  };
});

// node_modules/semver/internal/re.js
var require_re = __commonJS((exports, module) => {
  var {
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_LENGTH
  } = require_constants();
  var debug = require_debug();
  exports = module.exports = {};
  var re = exports.re = [];
  var safeRe = exports.safeRe = [];
  var src = exports.src = [];
  var safeSrc = exports.safeSrc = [];
  var t = exports.t = {};
  var R = 0;
  var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
  var safeRegexReplacements = [
    ["\\s", 1],
    ["\\d", MAX_LENGTH],
    [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
  ];
  var makeSafeRegex = (value) => {
    for (const [token, max] of safeRegexReplacements) {
      value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
    }
    return value;
  };
  var createToken = (name, value, isGlobal) => {
    const safe = makeSafeRegex(value);
    const index = R++;
    debug(name, index, value);
    t[name] = index;
    src[index] = value;
    safeSrc[index] = safe;
    re[index] = new RegExp(value, isGlobal ? "g" : undefined);
    safeRe[index] = new RegExp(safe, isGlobal ? "g" : undefined);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
  createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
  createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
  createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
  createToken("FULL", `^${src[t.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
  createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COERCEPLAIN", `${"(^|[^\\d])" + "(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
  createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
  createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?` + `(?:${src[t.BUILD]})?` + `(?:$|[^\\d])`);
  createToken("COERCERTL", src[t.COERCE], true);
  createToken("COERCERTLFULL", src[t.COERCEFULL], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
  exports.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
  exports.caretTrimReplace = "$1^";
  createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
  exports.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAIN]})` + `\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAINLOOSE]})` + `\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS((exports, module) => {
  var looseOption = Object.freeze({ loose: true });
  var emptyOpts = Object.freeze({});
  var parseOptions = (options) => {
    if (!options) {
      return emptyOpts;
    }
    if (typeof options !== "object") {
      return looseOption;
    }
    return options;
  };
  module.exports = parseOptions;
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS((exports, module) => {
  var numeric = /^[0-9]+$/;
  var compareIdentifiers = (a, b) => {
    if (typeof a === "number" && typeof b === "number") {
      return a === b ? 0 : a < b ? -1 : 1;
    }
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
  };
  var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
  module.exports = {
    compareIdentifiers,
    rcompareIdentifiers
  };
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS((exports, module) => {
  var debug = require_debug();
  var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
  var { safeRe: re, t } = require_re();
  var parseOptions = require_parse_options();
  var { compareIdentifiers } = require_identifiers();

  class SemVer {
    constructor(version, options) {
      options = parseOptions(options);
      if (version instanceof SemVer) {
        if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
      if (!m) {
        throw new TypeError(`Invalid Version: ${version}`);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    format() {
      this.version = `${this.major}.${this.minor}.${this.patch}`;
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join(".")}`;
      }
      return this.version;
    }
    toString() {
      return this.version;
    }
    compare(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        if (typeof other === "string" && other === this.version) {
          return 0;
        }
        other = new SemVer(other, this.options);
      }
      if (other.version === this.version) {
        return 0;
      }
      return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.major < other.major) {
        return -1;
      }
      if (this.major > other.major) {
        return 1;
      }
      if (this.minor < other.minor) {
        return -1;
      }
      if (this.minor > other.minor) {
        return 1;
      }
      if (this.patch < other.patch) {
        return -1;
      }
      if (this.patch > other.patch) {
        return 1;
      }
      return 0;
    }
    comparePre(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      let i = 0;
      do {
        const a = this.prerelease[i];
        const b = other.prerelease[i];
        debug("prerelease compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    compareBuild(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      let i = 0;
      do {
        const a = this.build[i];
        const b = other.build[i];
        debug("build compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    inc(release, identifier, identifierBase) {
      if (release.startsWith("pre")) {
        if (!identifier && identifierBase === false) {
          throw new Error("invalid increment argument: identifier is empty");
        }
        if (identifier) {
          const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
          if (!match || match[1] !== identifier) {
            throw new Error(`invalid identifier: ${identifier}`);
          }
        }
      }
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier, identifierBase);
          this.inc("pre", identifier, identifierBase);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier, identifierBase);
          }
          this.inc("pre", identifier, identifierBase);
          break;
        case "release":
          if (this.prerelease.length === 0) {
            throw new Error(`version ${this.raw} is not a prerelease`);
          }
          this.prerelease.length = 0;
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre": {
          const base = Number(identifierBase) ? 1 : 0;
          if (this.prerelease.length === 0) {
            this.prerelease = [base];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === "number") {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              if (identifier === this.prerelease.join(".") && identifierBase === false) {
                throw new Error("invalid increment argument: identifier already exists");
              }
              this.prerelease.push(base);
            }
          }
          if (identifier) {
            let prerelease = [identifier, base];
            if (identifierBase === false) {
              prerelease = [identifier];
            }
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = prerelease;
              }
            } else {
              this.prerelease = prerelease;
            }
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.raw = this.format();
      if (this.build.length) {
        this.raw += `+${this.build.join(".")}`;
      }
      return this;
    }
  }
  module.exports = SemVer;
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var parse = (version, options, throwErrors = false) => {
    if (version instanceof SemVer) {
      return version;
    }
    try {
      return new SemVer(version, options);
    } catch (er) {
      if (!throwErrors) {
        return null;
      }
      throw er;
    }
  };
  module.exports = parse;
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS((exports, module) => {
  var parse = require_parse();
  var clean = (version, options) => {
    const s = parse(version.trim().replace(/^[=v]+/, ""), options);
    return s ? s.version : null;
  };
  module.exports = clean;
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS((exports, module) => {
  var parse = require_parse();
  var valid = (version, options) => {
    const v = parse(version, options);
    return v ? v.version : null;
  };
  module.exports = valid;
});

// node_modules/lodash.set/index.js
var require_lodash = __commonJS((exports, module) => {
  var FUNC_ERROR_TEXT = "Expected a function";
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var INFINITY = 1 / 0;
  var MAX_SAFE_INTEGER = 9007199254740991;
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var symbolTag = "[object Symbol]";
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  var reLeadingDot = /^\./;
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reEscapeChar = /\\(\\)?/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }
  function isHostObject(value) {
    var result = false;
    if (value != null && typeof value.toString != "function") {
      try {
        result = !!(value + "");
      } catch (e) {}
    }
    return result;
  }
  var arrayProto = Array.prototype;
  var funcProto = Function.prototype;
  var objectProto = Object.prototype;
  var coreJsData = root["__core-js_shared__"];
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var objectToString = objectProto.toString;
  var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
  var Symbol2 = root.Symbol;
  var splice = arrayProto.splice;
  var Map = getNative(root, "Map");
  var nativeCreate = getNative(Object, "create");
  var symbolProto = Symbol2 ? Symbol2.prototype : undefined;
  var symbolToString = symbolProto ? symbolProto.toString : undefined;
  function Hash(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
  }
  function hashDelete(key) {
    return this.has(key) && delete this.__data__[key];
  }
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : undefined;
  }
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
  }
  function hashSet(key, value) {
    var data = this.__data__;
    data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
    return this;
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  function ListCache(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function listCacheClear() {
    this.__data__ = [];
  }
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    return true;
  }
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? undefined : data[index][1];
  }
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  function MapCache(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function mapCacheClear() {
    this.__data__ = {
      hash: new Hash,
      map: new (Map || ListCache),
      string: new Hash
    };
  }
  function mapCacheDelete(key) {
    return getMapData(this, key)["delete"](key);
  }
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  function mapCacheSet(key, value) {
    getMapData(this, key).set(key, value);
    return this;
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
      object[key] = value;
    }
  }
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  function baseSet(object, path, value, customizer) {
    if (!isObject(object)) {
      return object;
    }
    path = isKey(path, object) ? [path] : castPath(path);
    var index = -1, length = path.length, lastIndex = length - 1, nested = object;
    while (nested != null && ++index < length) {
      var key = toKey(path[index]), newValue = value;
      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : undefined;
        if (newValue === undefined) {
          newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
        }
      }
      assignValue(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  function castPath(value) {
    return isArray(value) ? value : stringToPath(value);
  }
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }
  function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  function isKey(value, object) {
    if (isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  var stringToPath = memoize(function(string) {
    string = toString(string);
    var result = [];
    if (reLeadingDot.test(string)) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, string2) {
      result.push(quote ? string2.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  function toKey(value) {
    if (typeof value == "string" || isSymbol(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return func + "";
      } catch (e) {}
    }
    return "";
  }
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
  }
  memoize.Cache = MapCache;
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var isArray = Array.isArray;
  function isFunction(value) {
    var tag = isObject(value) ? objectToString.call(value) : "";
    return tag == funcTag || tag == genTag;
  }
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == "object" || type == "function");
  }
  function isObjectLike(value) {
    return !!value && typeof value == "object";
  }
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
  }
  function toString(value) {
    return value == null ? "" : baseToString(value);
  }
  function set(object, path, value) {
    return object == null ? object : baseSet(object, path, value);
  }
  module.exports = set;
});

// prepare-release.js
var import_core5 = __toESM(require_core(), 1);
var import_exec = __toESM(require_exec(), 1);
var import_jsonfile2 = __toESM(require_jsonfile(), 1);
var import_clean = __toESM(require_clean(), 1);
var import_valid = __toESM(require_valid(), 1);
var import_lodash = __toESM(require_lodash(), 1);
import fs3 from "fs";
import os from "os";
import path3 from "path";

// utils/get-inputs.js
var import_core = __toESM(require_core(), 1);
var get_inputs_default = () => ({
  version: String(import_core.default.getInput("version")),
  bundleDependencies: process.env.GITHUB_ACTIONS ? import_core.default.getBooleanInput("bundle-dependencies") : false,
  commands: import_core.default.getMultilineInput("commands"),
  credFiles: [],
  meta: import_core.default.getMultilineInput("meta"),
  root: import_core.default.getInput("root") || process.cwd(),
  sync: process.env.GITHUB_ACTIONS ? import_core.default.getBooleanInput("sync") : false,
  syncBranch: import_core.default.getInput("sync-branch") || "main",
  syncEmail: import_core.default.getInput("sync-email") || "github-actions@github.com",
  syncMessage: import_core.default.getInput("sync-message") || "release v%s generated by @tanaabased/prepare-release-action",
  syncTags: import_core.default.getMultilineInput("sync-tags"),
  syncToken: import_core.default.getInput("sync-token") || process.env.GITHUB_TOKEN,
  syncUsername: import_core.default.getInput("sync-username") || "github-actions",
  tokens: import_core.default.getMultilineInput("update-files-meta") ?? [],
  updateHeader: import_core.default.getMultilineInput("update-files-header") ?? [],
  updateFiles: import_core.default.getMultilineInput("update-files") ?? [],
  versionMatch: import_core.default.getInput("version-match") || "v[0-9].*"
});

// utils/get-stdout.js
import { execSync } from "child_process";
var get_stdout_default = (command) => {
  if (!command)
    throw new Error("Must specify a command!");
  const data = execSync(command, { maxBuffer: 1024 * 1024 * 10, encoding: "utf-8" });
  return typeof data === "string" ? data.trim() : data;
};

// utils/has-dependencies.js
var import_core2 = __toESM(require_core(), 1);
var import_jsonfile = __toESM(require_jsonfile(), 1);
var has_dependencies_default = (pjson) => {
  const { dependencies } = import_jsonfile.default.readFileSync(pjson);
  if (!dependencies || dependencies && Object.keys(dependencies).length === 0) {
    import_core2.default.info("No dependencies found in package.json, skipping bundle-dependencies step");
  }
  return typeof dependencies === "object" && dependencies !== null && Object.keys(dependencies).length > 0;
};

// utils/hide-credentials.js
var import_core3 = __toESM(require_core(), 1);
import fs from "fs";
import path from "path";
var hide_credentials_default = async (collector = []) => {
  const runnerTemp = process.env["RUNNER_TEMP"];
  if (!runnerTemp)
    return collector;
  try {
    const files = await fs.promises.readdir(runnerTemp);
    for (const file of files) {
      if (file.startsWith("git-credentials-") && file.endsWith(".config")) {
        const src = path.join(runnerTemp, file);
        const backup = `${src}.bak`;
        await fs.promises.rename(src, backup);
        collector.push(backup);
        import_core3.default.info(`Temporarily hiding actions/checkout credential file ${file} in favor of our auth`);
      }
    }
  } catch (e) {
    import_core3.default.debug(`Could not backup credential files: ${e.message}`);
  }
  return collector;
};

// utils/parse-tokens.js
var parse_tokens_default = (tokens) => {
  return tokens.map((token) => token.split("=")).filter(([token, value]) => typeof token === "string" && typeof value === "string").map(([token, value]) => [token.trim(), value.trim()]);
};

// utils/restore-credentials.js
var import_core4 = __toESM(require_core(), 1);
import fs2 from "fs";
import path2 from "path";
var restore_credentials_default = async (files = []) => {
  for (const backup of files) {
    try {
      const src = backup.replace(/\.bak$/, "");
      await fs2.promises.rename(backup, src);
      const file = path2.basename(src);
      import_core4.default.info(`Restored actions/checkout credential file ${file}`);
    } catch (e) {
      import_core4.default.warning(`Failed to restore credential file ${backup}: ${e.message}`);
    }
  }
  return [];
};

// prepare-release.js
var main = async () => {
  const inputs = get_inputs_default();
  process.chdir(inputs.root);
  inputs.pjson = path3.join(inputs.root, "package.json");
  try {
    const isShallow = get_stdout_default("git rev-parse --is-shallow-repository");
    if (isShallow === "true") {
      import_core5.default.startGroup("Configuring repo");
      import_core5.default.info(`working-dir: ${process.cwd()}`);
      await import_exec.default.exec("git", ["fetch", "--unshallow"]);
      await import_exec.default.exec("git", ["fetch", "--all"]);
      import_core5.default.endGroup();
    }
    if (!inputs.version)
      throw new Error("Version is a required input!");
    if (inputs.version === "dev")
      inputs.version = get_stdout_default(`git describe --tags --always --abbrev=1 --match="${inputs.versionMatch}"`);
    if (import_valid.default(import_clean.default(inputs.version)) === null)
      throw new Error(`Version ${inputs.version} must be semver valid!`);
    if (!fs3.existsSync(inputs.pjson))
      throw new Error(`Could not detect a package.json in ${inputs.root}`);
    for (const [index, filename] of inputs.updateFiles.entries()) {
      inputs.updateFiles[index] = path3.isAbsolute(filename) ? filename : path3.resolve(inputs.root, filename);
    }
    import_core5.default.startGroup("Ensuring bun");
    import_core5.default.info(`bun-version: ${get_stdout_default("bun --version")}`);
    import_core5.default.endGroup();
    import_core5.default.startGroup("Configuring git");
    await import_exec.default.exec("git", ["config", "user.name", inputs.syncUsername]);
    await import_exec.default.exec("git", ["config", "user.email", inputs.syncEmail]);
    if (inputs.sync)
      await import_exec.default.exec("git", ["checkout", inputs.syncBranch]);
    import_core5.default.endGroup();
    for (const command of inputs.commands)
      await import_exec.default.exec(command);
    if (inputs.meta.length > 0) {
      const pjson = import_jsonfile2.default.readFileSync(inputs.pjson);
      inputs.meta.forEach((line) => {
        if (Array.isArray(line))
          import_lodash.default(pjson, line[0], line[1]);
        else if (typeof line === "string") {
          const key = line.split("=")[0];
          const value = line.split("=")[1];
          import_lodash.default(pjson, key, value);
        }
      });
      import_jsonfile2.default.writeFileSync(inputs.pjson, pjson, { spaces: 2 });
      import_core5.default.debug(`updated pjson`);
      import_core5.default.debug(import_jsonfile2.default.readFileSync(inputs.pjson));
    }
    for (const file of inputs.updateFiles.filter((file2) => fs3.existsSync(file2))) {
      let content = fs3.readFileSync(file, { encoding: "utf-8" });
      import_core5.default.startGroup(`Updating ${file} with update-files-meta tokens`);
      for (const [token, value] of parse_tokens_default(inputs.tokens)) {
        import_core5.default.info(`{{ ${token} }}: ${value}`);
        content = content.replace(new RegExp(`\\{\\{\\s*${token}\\s*\\}\\}`, "g"), value);
      }
      import_core5.default.endGroup();
      if (inputs.updateHeader.length > 0) {
        import_core5.default.startGroup(`Updating ${file} with update-files-header content`);
        import_core5.default.info(`update-header: ${inputs.updateHeader.join(os.EOL)}`);
        import_core5.default.endGroup();
        content = `${inputs.updateHeader.join(os.EOL)}${os.EOL}${os.EOL}${content}`;
      }
      fs3.writeFileSync(file, content);
      import_core5.default.debug(`updated ${file}:`);
      import_core5.default.debug(`---`);
      import_core5.default.debug(`${fs3.readFileSync(file, { encoding: "utf-8" })}`);
      import_core5.default.debug(`---`);
    }
    const bumpArgs = inputs.sync ? [inputs.version, "--commit", inputs.syncMessage, "--all"] : [inputs.version];
    await import_exec.default.exec("bunx", ["--bun", "--package", "version-bump-prompt@6.1.0", "bump", ...bumpArgs]);
    const currentCommit = get_stdout_default("git --no-pager log --pretty=format:%h -n 1");
    const tags = inputs.syncTags.concat([inputs.version]);
    for (const tag of tags)
      await import_exec.default.exec("git", ["tag", "--force", tag, currentCommit]);
    if (inputs.sync) {
      import_core5.default.startGroup("Sync changes information");
      await import_exec.default.exec("git", ["--no-pager", "log", "-1"]);
      await import_exec.default.exec("git", ["--no-pager", "tag", "--points-at", "HEAD"]);
      await import_exec.default.exec("git", ["diff", "HEAD~1"]);
      import_core5.default.endGroup();
      inputs.credFiles = await hide_credentials_default();
      const basicCredential = Buffer.from(`x-access-token:${inputs.syncToken}`, "utf8").toString("base64");
      const authString = `AUTHORIZATION: basic ${basicCredential}`;
      import_core5.default.setSecret(basicCredential);
      await import_exec.default.exec("git", ["config", "--local", "http.https://github.com/.extraheader", authString]);
      await import_exec.default.exec("git", ["push", "origin", inputs.syncBranch]);
      for (const tag of tags)
        await import_exec.default.exec("git", ["push", "--force", "origin", tag]);
      if (Array.isArray(inputs.credFiles) && inputs.credFiles.length > 0) {
        inputs.credFiles = await restore_credentials_default(inputs.credFiles);
      }
    }
    if (inputs.bundleDependencies && has_dependencies_default(inputs.pjson)) {
      await import_exec.default.exec("bunx", ["--bun", "--package", "bundle-dependencies@1.0.2", "bundle-dependencies", "update"]);
      await import_exec.default.exec("bunx", ["--bun", "--package", "bundle-dependencies@1.0.2", "bundle-dependencies", "list-bundled-dependencies"]);
    }
    import_core5.default.startGroup("Change information");
    await import_exec.default.exec("git", ["--no-pager", "log", "-1"]);
    await import_exec.default.exec("git", ["--no-pager", "tag", "--points-at", "HEAD"]);
    await import_exec.default.exec("git", ["diff", "HEAD~1"]);
    import_core5.default.endGroup();
  } catch (error) {
    import_core5.default.setFailed(error.message);
    process.exit(1);
  }
};
main();

//# debugId=1C7F670703FAACA864756E2164756E21
//# sourceMappingURL=index.js.map
