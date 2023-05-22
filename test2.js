const Tfhka = require("./src/tfhka");
Tfhka.init("COM1");

const S1 = Tfhka.S1Data();
console.log(S1);

try {
    Tfhka.SendCmd("800Documento de prueba 2");
    Tfhka.SendCmd("80$Tfhka.JS v1.0.0");
    Tfhka.SendCmd("810fin del doc AlphaSoft, C.A.");

} catch (e) {
    console.log(e);
}
