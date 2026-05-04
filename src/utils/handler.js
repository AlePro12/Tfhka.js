var ffi = require("ffi-napi");
var path = require("path");
var ref = require("ref-napi");

var bool = ref.types.bool;
var long = ref.types.long;

const to_buffstr = require("./tobuffStr");

const DEFAULT_DLL = path.join(__dirname, "tfhkaif.dll");

const Handler = {
  port: "COM1",
  dllPath: DEFAULT_DLL,
  lib: null,
  _loadedDllPath: null,

  init(port, dllPath = null) {
    this.port = port;
    const targetDll = dllPath || DEFAULT_DLL;
    if (this.lib && this._loadedDllPath === targetDll) {
      this.dllPath = targetDll;
      return;
    }
    this.dllPath = targetDll;
    this.lib = ffi.Library(this.dllPath, {
      OpenFpctrl: [bool, ["string"]],
      SendCmd: [bool, ["long *", "long *", "string"]],
      CheckFprinter: [bool, []],
      ReadFpStatus: [bool, ["long *", "long *"]],
      CloseFpctrl: [bool, []],
      UploadStatusDin: [bool, ["long *", "long *", "string", "char *"]],
    });
    this._loadedDllPath = this.dllPath;
  },

  _ensureLib() {
    if (!this.lib) {
      throw new Error("Handler no inicializado: llame a init(port) primero");
    }
  },

  CheckFprinter() {
    this._ensureLib();
    try {
      return this.lib.CheckFprinter();
    } catch (e) {
      return false;
    }
  },

  ReadFpStatus() {
    this._ensureLib();
    const pStatus = ref.alloc(long);
    const pError = ref.alloc(long);
    const res = this.lib.ReadFpStatus(pStatus, pError);
    return { res, pStatus, pError };
  },

  open() {
    this._ensureLib();
    return this.lib.OpenFpctrl(this.port);
  },

  close() {
    if (!this.lib) return true;
    try {
      return this.lib.CloseFpctrl();
    } catch (e) {
      return false;
    }
  },

  SendCmd(cmd) {
    this._ensureLib();
    const pStatus = ref.alloc(long);
    const pError = ref.alloc(long);
    const res = this.lib.SendCmd(pStatus, pError, cmd);
    return { res, pStatus, pError };
  },

  UploadStatusDin(req) {
    this._ensureLib();
    const pStatus = ref.alloc(long);
    const pError = ref.alloc(long);
    const bufCadena = Buffer.alloc(1000);
    const res = this.lib.UploadStatusDin(pStatus, pError, req, bufCadena);
    const cadena = to_buffstr(bufCadena);
    return { res, cadena, pStatus, pError };
  },
};

module.exports = Handler;
