const Handler = require("./handler");
const S1Data = require("./S1Data");
const Tfhka = {
  retry: 2,
  bandera: false,
  init(port, dllPath = null) {
    Handler.init(port, dllPath);
    const openPrint = Handler.open();
    console.log("🚀 ~ file: tfhka.js:9 ~ init ~ openPrint:", openPrint);
    if (!openPrint) {
      throw new Error("Error al abrir la impresora");
      return;
    }
    this.bandera = true;
  },
  SendCmd(cmd) {
    if (!this.bandera) throw new Error("Impresora no inicializada");
    const statusPrinter = Handler.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    let sndCmdStatus = Handler.SendCmd(cmd).res;
    //retry
    if (!sndCmdStatus) {
      for (let i = 0; i < this.retry; i++) {
        sndCmdStatus = Handler.SendCmd(cmd).res;
        if (sndCmdStatus) return sndCmdStatus;
      }
    } else {
      return sndCmdStatus;
    }
    throw new Error("Error al enviar comando");
  },
  S1Data() {
    if (!this.bandera) throw new Error("Impresora no inicializada");
    const statusPrinter = Handler.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    const {
      res: resRead,
      cadena,
      pStatus: pStatusRead,
      pError: pErrorRead,
    } = Handler.UploadStatusDin("S1");
    if (!resRead) throw new Error("Error al leer datos");
    const S1 = S1Data.init(cadena);
    return S1;
  },
};

module.exports = Tfhka;
