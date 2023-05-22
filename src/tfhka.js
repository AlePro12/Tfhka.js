const Handler = require("./utils/handler");
const S1Data = require("./models/S1Data");
const S3Data = require("./models/S3Data");

const devices = require("./models/devices");
const Tfhka = {
  retry: 2,
  bandera: false,
  portType: "serial", // USB || serial
  modelPrinter: "",
  lastFactura: 0,
  nextFactura: 0,
  SerialNumber: "",
  debug: false,
  printerPreferences: {
    codeEAN13CharMaxLen: 12,
    codeITFCharMaxLen: 12,
    codeCode128CharMaxLen: 23,
    codeCode39CharMaxLen: 20,
    codeQRCharMaxLen: 120,
    codePDFCharMaxLen: 120,
    headersXlen: 40,
    footersXlen: 40,
    RifLen: 40,
    RazonSocialLen: 40,
    AdcInfoLen: 40,
    CommentsLen: 40,
    DescLen: 127,
  },
  flags: [],
  RIF: "",
  SubtotalSales: 0,
  init(port, portType, dllPath = null) {
    Handler.init(port, portType, dllPath);
    const openPrint = Handler.open();
    console.log("🚀 ~ file: tfhka.js:9 ~ init ~ openPrint:", openPrint);
    if (!openPrint) {
      throw new Error("Error al abrir la impresora");
      return;
    }
    this.bandera = true;
    this.S1Data();
    this.S3Data();
    this.IdentifyPrinter();
  },
  CheckFprinter() {
    if (!this.bandera) throw new Error("Impresora no inicializada");
    const statusPrinter = Handler.CheckFprinter();
    return statusPrinter;
  },
  SendCmd(cmd) {
    if (!this.bandera)
      throw new Error("Impresora no inicializada SendCmd: " + cmd);
    const statusPrinter = Handler.CheckFprinter();
    if (!statusPrinter)
      throw new Error("Impresora no conectada SendCmd: " + cmd);
    let sndCmdStatus = Handler.SendCmd(cmd).res;
    this.debugger("Sndcmd " + cmd + " status: " + sndCmdStatus);
    //retry
    if (!sndCmdStatus) {
      for (let i = 0; i < this.retry; i++) {
        this.debugger("Sndcmd RETRY " + cmd + " status: " + sndCmdStatus);
        sndCmdStatus = Handler.SendCmd(cmd).res;
        if (sndCmdStatus) return sndCmdStatus;
      }
    } else {
      return sndCmdStatus;
    }
    throw new Error(
      "Error al enviar comando SendCmd: " + cmd + " RetryTimes: " + this.retry
    );
  },
  ActParams(S1D = false) {
    if (!this.bandera) throw new Error("Impresora no inicializada");
    if (!S1D) S1D = this.S1Data();
    this.lastFactura = S1D.lastInvoiceNumber;
    this.nextFactura = S1D.lastInvoiceNumber + 1;
    this.SerialNumber = S1D.registeredMachineNumber;
    this.RIF = S1D.rif;
    this.SubtotalSales = S1D.totalDailySales;
  },
  IdentifyPrinter() {
    // first 3 digits of serial number
    try {
      let modelId = this.SerialNumber.substring(0, 3);
      devices.forEach((device) => {
        if (device.modelId == modelId) {
          this.modelPrinter = device.name;
          this.printerPreferences = device;
        }
      });
    } catch (error) {
      console.log("🚀 ~ file: tfhka.js:66 ~ IdentifyPrinter ~ error", error);
    }
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
    this.lastFactura = S1.lastInvoiceNumber;
    this.nextFactura = S1.lastInvoiceNumber + 1;
    this.SerialNumber = S1.registeredMachineNumber;
    this.RIF = S1.rif;
    this.SubtotalSales = S1.totalDailySales;

    return S1;
  },
  S3Data() {
    if (!this.bandera) throw new Error("Impresora no inicializada");
    const statusPrinter = Handler.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    const {
      res: resRead,
      cadena,
      pStatus: pStatusRead,
      pError: pErrorRead,
    } = Handler.UploadStatusDin("S3");
    if (!resRead) throw new Error("Error al leer datos");
    const S3 = S3Data.init(cadena);
    this.flags = S3.systemFlags;
    return S3;
  },
  S2Data() {},
  ImprimirProg() {
    if (!this.bandera) throw new Error("Impresora no inicializada");
    const statusPrinter = Handler.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    this.SendCmd("D");
    //imprime el encabezado y pie de pagina programados
  },
  errorHandlerDocCancel() {
    if (!this.bandera) throw new Error("Impresora no inicializada");
    const statusPrinter = Handler.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    try {
      this.SendCmd("7");
    } catch (error) {
      console.log("impresora lista para imprimir");
      return true;
    }
    //cancela el documento
  },
  CierreX() {
    return this.SendCmd("I0X");
  },
  CierreX2() {
    return this.SendCmd("I1X");
  },
  BorrarAcumulado() {
    return this.SendCmd("X1X");
  },
  CierreZ() {
    return this.SendCmd("I0Z");
  },
  debugger(msg) {
    if (this.debug) console.log(msg);
  },
};

module.exports = Tfhka;
