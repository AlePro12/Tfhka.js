const S3Data = {
  arr: [],
  model: "SRP350, HSP7000, TD1125, HKA112, KUBE",
  S3: {
    /*	private int typeTax1;

	private double tax1;

	private int typeTax2;

	private double tax2;

	private int typeTax3;

	private double tax3;

	private int[] systemFlags;

  */
    typeTax1: "",
    tax1: 0,
    typeTax2: 0,
    tax2: 0,
    typeTax3: 0,
    tax3: 0,
    systemFlags: [],
  },
  init: function (s) {
    console.log("🚀 ~ file: S3Data.js:77 ~ S3Data.s:", s);
    //S3 2 1600 2 0800 2 3100 0 0000 000000000000000000000000000000000000000000000000000000001000000000000000000000000020000000000000000000000000000000000000000
    //000000000000000000000000000000000000000000000000000000001000000000000000000000000020000000000000000000000000000000000000000
    for (var i = 0; i < s.length; i++) {
      this.arr.push(s.charAt(i));
    }
    //mayor a 140 y menor a 148
    this.S3.typeTax1 = this.g(2, 2);
    this.S3.tax1 = this.nP(this.g(3, 6));
    this.S3.typeTax2 = this.g(7, 7);
    this.S3.tax2 = this.nP(this.g(8, 11));
    this.S3.typeTax3 = this.g(12, 12);
    this.S3.tax3 = this.nP(this.g(13, 16));
    if (s > 140 && s < 146) {
    } else {
      // OJO CUANDO EL IGTF ESTA HABILITADO EMPIEZA LOS FLAGS EN 22
      this.model = "SRP812, DT230, HKA80, P3100DL, PP9, ACLAS PP9-PLUS, TD1140";
      var count = 0;
      let start = 17;
      let end = 122;
      for (let i = 0; i < 64; i++) {
        //console.log("start:", start);
        //console.log("start sec:", start + 1);
        this.S3.systemFlags.push(this.g(start, start + 1));
        start = start + 2;
        if (end == start) break;
        count++;
      }
    }
    return this.S3;
  },
  nP: function (n) {
    //remove pad have two decimals
    //example :1600 => 16.00
    n = n.replace(/^0+/, "");
    n = n.replace(/(\d{2})$/, ".$1");
    return parseFloat(n);
  },
  g: function (d, h) {
    let cadena = "";
    for (let i = 0; i < this.arr.length; i++) {
      if (d <= i) {
        cadena += this.arr[i];
      }
      if (i == h) return cadena;
    }
    throw new Error("Error al leer datos " + d + " " + h);
  },
};
module.exports = S3Data;
