var ffi = require("ffi-napi");
var path = require("path");
var ref = require("ref-napi");
const S1PrinterData = require("./S1PrinterData");
//boolean type
let arr = [];

var bool = ref.types.bool;
//long type
var long = ref.types.long;
const dllPath = path.join(__dirname, "tfhkaif.dll");
console.log("🚀 ~ file: test.js:5 ~ dllPath:", dllPath);
//ReadFpStatus (long *pStatus, long *pError) returns boolean
//SendCmd (long nCmd, long nSubCmd, char *pStr) returns boolean
//OpenFpctrl (char *pPort) returns boolean
//CloseFpctrl () returns boolean
//CheckFprinter () returns boolean
//BOOLEAN UploadStatusDin(Status *Long, Error *Long, String cmd, String *cadena)
//string type ref

var String = ref.refType(ref.types.CString);

const libtfhka = ffi.Library(dllPath, {
  OpenFpctrl: [bool, ["string"]],
  SendCmd: [bool, ["long *", "long *", "string"]],
  CheckFprinter: [bool, []],
  ReadFpStatus: [bool, ["long *", "long *"]],
  CloseFpctrl: [bool, []],
  UploadStatusDin: [bool, ["long *", "long *", "string", "char *"]],
});
test();
//async function
async function test() {
  const out = libtfhka.OpenFpctrl("COM1");
  console.log("🚀 ~ file: test.js:10 ~ out:", out);
  const PrStatus = libtfhka.CheckFprinter();
  console.log("🚀 ~ file: test.js:24 ~ test ~ PrStatus:", PrStatus);
  console.log(
    "🚀 ~ file: test.js:26 ~ test ~ pStatus: ReadFpStatus (long *pStatus, long *pError)"
  );
  const pStatus = ref.alloc(long);
  const pError = ref.alloc(long);
  const out2 = libtfhka.ReadFpStatus(pStatus, pError);
  console.log("🚀 ~ file: test.js:28 ~ test ~ out2:", out2);
  console.log("🚀 ~ file: test.js:29 ~ test ~ pStatus:", pStatus.deref());
  console.log("🚀 ~ file: test.js:30 ~ test ~ pError:", pError.deref());
  //S1

  var bufCadena = new Buffer(1000);
  bufCadena.write("S1", 0, "utf-8");

  const out3 = libtfhka.UploadStatusDin(pStatus, pError, "S1", bufCadena);

  console.log("🚀 ~ file: test.js:33 ~ test ~ out3:", out3);
  console.log("🚀 ~ file: test.js:29 ~ test ~ pStatus:", pStatus.deref());
  console.log(
    "🚀 ~ file: test.js:34 ~ test ~ bufCadena:",
    to_buffstr(bufCadena)
  );
  const Prs1 = S1_Parser(to_buffstr(bufCadena));
  console.log(Prs1.Serial + " RIF:" + Prs1.RIF);
  console.log("🚀 ~ file: test.js:30 ~ test ~ pError:", pError.deref());

  const out4 = libtfhka.SendCmd(pStatus, pError, "800Documento de prueba");
  console.log("🚀 ~ file: test.js:33 ~ test ~ out4:", out4);
  console.log("🚀 ~ file: test.js:30 ~ test ~ pError:", pError.deref());

  if (!out4) throw new Error("Error al enviar comando");
  const out5 = libtfhka.SendCmd(pStatus, pError, "80$Tfhka.JS v1.0.0");
  if (!out5) throw new Error("Error al enviar comando");

  const out6 = libtfhka.SendCmd(
    pStatus,
    pError,
    "810fin del doc AlphaSoft, C.A."
  );
  if (!out6) throw new Error("Error al enviar comando");

  console.log("🚀 ~ file: test.js:81 ~ test ~ out6:", out6);
  //close port
  const out8 = libtfhka.CloseFpctrl();
  console.log("🚀 ~ file: test.js:10 ~ out:", out8);
}

function to_buffstr(theStringBuffer) {
  var theString = theStringBuffer.toString("utf-8");
  var terminatingNullPos = theString.indexOf("\u0000");
  if (terminatingNullPos >= 0) {
    theString = theString.substr(0, terminatingNullPos);
  }
  return theString;
}

function S1_Parser(s) {
  arr = [];
  console.log(s);
  for (var i = 0; i < s.length; i++) {
    arr.push(s.charAt(i));
  }
  const S1 = {
    cashierNumber: "",
    SubtotalSales: "",
    LastInvoiceNumber: "",
    QuantityOfInvoicesToday: "",
    LastDocumentNotFiscal: "",
    QuantityDocumentNotFiscal: "",
    QuantityDocumentZ: "",
    QuantityDocumentCreditNoteFiscal: "",
    RIF: "",
    Serial: "",
    currentPrinterTime: "",
    currentPrinterDate: "",
    lastNCNumber: "",
    quantityOfNCToday: "",
  };

  S1.cashierNumber = g(0, 3);
  S1.SubtotalSales = g(4, 20);
  S1.LastInvoiceNumber = g(21, 28);
  S1.QuantityOfInvoicesToday = g(29, 33);
  S1.LastDocumentNotFiscal = g(34, 41);
  S1.QuantityDocumentNotFiscal = g(42, 46);
  S1.QuantityDocumentZ = g(47, 50);
  S1.QuantityDocumentCreditNoteFiscal = g(51, 54);
  S1.RIF = g(55, 65);
  S1.Serial = g(66, 75);
  S1.currentPrinterTime = g(76, 81);
  S1.currentPrinterDate = g(82, 87);
  S1.lastNCNumber = g(88, 95);
  S1.quantityOfNCToday = g(96, 100);

  console.log(S1);
  return S1;
}

function g(d, h) {
  let cadena = "";
  for (let i = 0; i < arr.length; i++) {
    if (d <= i) {
      cadena += arr[i];
    }
    if (i == h) return cadena;
  }
}
