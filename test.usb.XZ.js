var start = new Date().getTime();

const Tfhka = require("./src/tfhka");
Tfhka.init("COM9", "USB");
Tfhka.debug = true;
//Tfhka.CierreZ();
var end = new Date().getTime();
var time = end - start;
//to sec
time = time / 1000;
console.log("Execution time: " + time);
