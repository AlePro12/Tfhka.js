var start = new Date().getTime();
// 0000010000 00000001 1000TEST C/IVA RetryTimes: 2
// 0000001000
//!0000010000 00000100  TEST C/IVA
// 0000001000 00001000 Producto
// 000000100000001000Producto
//
/*
  dcmd iR*V-29752300 status: true
Sndcmd iS*Alejandro Sanchez status: true
Sndcmd i00Pruebas de impresion Tfhka.JS Factura.js status: true
Sndcmd i01Usando tfkha.js v1.0.0 status: true
Sndcmd i02 status: true
Sndcmd @Comentario de prueba status: true
Sndcmd !0000010000000001001000TEST C/IVA status: true
Sndcmd  0000010000000001001000TEST S/IVA status: true
*/
const Tfhka = require("./src/tfhka");
const NotaCredito = require("./src/NotaCredito");

Tfhka.init("COM9", "USB");
Tfhka.debug = true;
const S1 = Tfhka.S1Data();

Tfhka.errorHandlerDocCancel();
console.log(S1);

try {
  NotaCredito.init(Tfhka, {
    rif: "V-29752300",
    razonSocial: "Alejandro Sanchez",
    facturaAfectada: "00034442",
    fechaFacturaAfectada: "22-05-2023",
    SerialNumber: Tfhka.SerialNumber,
  });
  NotaCredito.Open();
  NotaCredito.PrintLnAdc("Pruebas de impresion Tfhka.JS NotaCredito.js");
  NotaCredito.PrintLnAdc("tfkha.js v1.0.0");
  NotaCredito.PrintLnAdc("AlphaSoft");

  //cantidad, descripcion, precio, iva
  NotaCredito.PrintItem({
    cantidad: 0.1,
    descripcion: "TEST S/IVA",
    precio: 100,
    iva: false,
  });
  NotaCredito.PrintComent("Comentario de prueba");
  NotaCredito.PrintItem({
    cantidad: 0.1,
    descripcion: "TEST C/IVA",
    precio: 100,
    iva: true,
  });
  //Factura.PrintCode("https://diosenticonfio.com/itemtest", "Y");
  //Factura.PrintCode("https://diosenticonfio.com", "footer");

  NotaCredito.Cerrar();
} catch (e) {
  console.log(e);
}
var end = new Date().getTime();

var time = end - start;
console.log("Execution time: " + time);
