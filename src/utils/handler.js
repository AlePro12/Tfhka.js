var ffi = require("ffi-napi");
var path = require("path");
var ref = require("ref-napi");
var bool = ref.types.bool;
//long type
var long = ref.types.long;
const to_buffstr = require("./tobuffStr");
const Handler = {
  port: "COM1",
  retry: 1,
  dllPath: null,
  init(port, portType = "serial", dllPath = null) {
    this.port = port;
    if (portType === "USB") {
      this.dllPath = path.join(__dirname, "tfhkaif_usb.dll");
    } else {
      this.dllPath = path.join(__dirname, "tfhkaif_serial.dll");
    }
    if (dllPath) this.dllPath = dllPath;
    this.lib = ffi.Library(this.dllPath, {
      OpenFpctrl: [bool, ["string"]],
      SendCmd: [bool, ["long *", "long *", "string"]],
      CheckFprinter: [bool, []],
      ReadFpStatus: [bool, ["long *", "long *"]],
      CloseFpctrl: [bool, []],
      UploadStatusDin: [bool, ["long *", "long *", "string", "char *"]],
    });
  },
  lib: null,
  CheckFprinter() {
    return this.lib.CheckFprinter();
  },
  ReadFpStatus() {
    const pStatus = ref.alloc(long);
    const pError = ref.alloc(long);
    const res = this.lib.ReadFpStatus(pStatus, pError);
    return { res, pStatus, pError };
  },
  open() {
    return this.lib.OpenFpctrl(this.port);
  },
  close() {
    return this.lib.CloseFpctrl();
  },
  SendCmd(cmd) {
    const pStatus = ref.alloc(long);
    const pError = ref.alloc(long);
    const res = this.lib.SendCmd(pStatus, pError, cmd);
    return { res, pStatus, pError };
  },
  UploadStatusDin(req) {
    const pStatus = ref.alloc(long);
    const pError = ref.alloc(long);
    var bufCadena = new Buffer(1000);
    bufCadena.write("", 0, "utf-8");
    const res = this.lib.UploadStatusDin(pStatus, pError, req, bufCadena);
    const cadena = to_buffstr(bufCadena);
    return { res, cadena, pStatus, pError };
  },
};

module.exports = Handler;
