var start = new Date().getTime();

const Tfhka = require("./src/tfhka");
Tfhka.init("COM9", "USB");
Tfhka.debug = true;
//Tfhka.SendCmd("PJ4304");
const S1 = Tfhka.S1Data();
console.log(S1);
//F00->F09
//S3 systemFlags
//get 21 flag
console.log("MODELO IMPRESORA:" + Tfhka.modelPrinter);
try {
  //Tfhka.ImprimirProg();
} catch (e) {
  console.log(e);
}

var end = new Date().getTime();
var time = end - start;
//to sec
time = time / 1000;
console.log("Execution time: " + time);
