const Factura = {
  Tfhka: null,
  linesAdc: 0,
  rif: "",
  razonSocial: "",
  Log: [],
  process: "init",
  precioDecimals: 2,
  cantidadDecimals: 2,
  init(tfhka, { rif, razonSocial }) {
    this.rif = rif;
    this.razonSocial = razonSocial;
    if (!tfhka) throw new Error("Impresora no inicializada");
    this.Tfhka = tfhka;
    if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
    const statusPrinter = tfhka.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    this.process = "ready";
  },
  Open() {
    const statusPrinter = this.Tfhka.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    if (!this.rif) throw new Error("RIF no definido");
    if (!this.razonSocial) throw new Error("Razon Social no definida");
    this.Tfhka.SendCmd("iR*" + this.rif);
    this.process = "encabezado_rif";
    this.Tfhka.SendCmd("iS*" + this.razonSocial);
    this.process = "encabezado_razon_social";
  },
  PrintLnAdc(cmd) {
    if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
    const statusPrinter = this.Tfhka.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    if (this.linesAdc > 8)
      throw new Error("No se pueden imprimir mas de 9 lineas adicionales");
    this.Tfhka.SendCmd("i0" + this.linesAdc + cmd);
    this.process = "linea_adicional_" + this.linesAdc;
    this.linesAdc++;
  },
  PrintComent(cmd) {
    if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
    const statusPrinter = this.Tfhka.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    this.Tfhka.SendCmd("@" + cmd);
    this.process = "comentario";
  },
  PrintItem({ cantidad, descripcion, precio, iva }) {
    if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
    let cmd = "";
    if (iva) {
      cmd += "!";
    } else {
      cmd += " ";
    } //000000100000001000Producto Exento
    const Flag21 = this.Tfhka.flags[21];
    this.precioDecimals = 2;
    this.cantidadDecimals = 3;
    let precioEnteros = 8;
    if (Flag21 == "01") {
      // precio (7 enteros + 3 decimales)
      this.precioDecimals = 3;

      precioEnteros = 7;
    } else if (Flag21 == "02") {
      //(6 enteros + 4 decimales)
      this.precioDecimals = 4;
      precioEnteros = 6;
    } else if (Flag21 == "11") {
      //(9 enteros + 1 decimales)
      this.precioDecimals = 1;
      precioEnteros = 9;
    } else if (Flag21 == "12") {
      //(10 enteros + 0 decimales)
      this.precioDecimals = 0;
      precioEnteros = 10;
    } else if (Flag21 == "30") {
      //(14 enteros + 2 decimales)
      this.precioDecimals = 2;
      precioEnteros = 14;
      //(5 enteros + 3 decimales)
      this.cantidadDecimals = 3;
    }
    precio = parseFloat(precio);
    cantidad = parseFloat(cantidad);
    precio = precio.toFixed(this.precioDecimals);
    //precio erase . or ,
    precio = precio.replace(".", "");
    precio = precio.replace(",", "");
    // precio 10 digitos
    precio = precio.padStart(10, "0");
    // cantidad 8 digitos
    cantidad = cantidad.toFixed(this.cantidadDecimals);
    cantidad = cantidad.replace(".", "");
    cantidad = cantidad.replace(",", "");
    cantidad = cantidad.padStart(8, "0");
    // descripcion tfhka.printerPreferences.DescLen caracteres
    descripcion = descripcion.substring(
      0,
      this.Tfhka.printerPreferences.DescLen
    );
    cmd += precio + cantidad + descripcion;
    console.log("🚀 ~ file: Factura.js:102 ~ PrintItem ~ cmd:", cmd);

    this.Tfhka.SendCmd(cmd);
    this.process = "item_" + descripcion;
    return cmd;
  },
  AddDiscountPercent({ percent }) {
    if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
    // p-1000
    percent = percent.toFixed(this.precioDecimals);
    percent = percent.replace(".", "");
    percent = percent.replace(",", "");
    percent = percent.padStart(4, "0");
    this.Tfhka.SendCmd("p-" + percent);
  },
  AddCode(data) {},
  Pago({ tipo, monto }) {
    if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
    //tipo tiene que ser 2 digitos del 01 al 99
    if (tipo < 1 || tipo > 99) throw new Error("Tipo de pago invalido");
    //201000000002062
    monto = monto.toFixed(this.precioDecimals);
    monto = monto.replace(".", "");
    monto = monto.replace(",", "");
    monto = monto.padStart(12, "0");
    this.Tfhka.SendCmd("2" + tipo + monto);
  },
  CerrarFactura() {
    if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
    this.Tfhka.SendCmd("101");
    this.process = "end";
  },
  PrintCode(text, position) {
    if (position == "footer") {
      position = "y";
    } else {
      position = "Y";
    }
    const Flag43 = this.Tfhka.flags[43];
    if (Flag43 == "00") {
      //ean13 12 digitos
      if (!this.Tfhka.printerPreferences.codeEAN13CharMaxLen)
        throw new Error("la impresora no soporta este tipo de codigo");
      if (text.length > this.Tfhka.printerPreferences.codeEAN13CharMaxLen)
        throw new Error(
          "la longitud del codigo es mayor a la permitida para esta impresora"
        );
      text = text.padStart(12, "0");
    } else if (Flag43 == "01") {
      //ITF
      if (!this.Tfhka.printerPreferences.codeITFCharMaxLen)
        throw new Error("la impresora no soporta este tipo de codigo");
      if (text.length > this.Tfhka.printerPreferences.codeITFCharMaxLen)
        throw new Error(
          "la longitud del codigo es mayor a la permitida para esta impresora"
        );
    } else if (Flag43 == "02") {
      //code128
      if (!this.Tfhka.printerPreferences.codeCode128CharMaxLen)
        throw new Error("la impresora no soporta este tipo de codigo");
      if (text.length > this.Tfhka.printerPreferences.codeCode128CharMaxLen)
        throw new Error(
          "la longitud del codigo es mayor a la permitida para esta impresora"
        );
    } else if (Flag43 == "03") {
      //code39
      if (!this.Tfhka.printerPreferences.codeCode39CharMaxLen)
        throw new Error("la impresora no soporta este tipo de codigo");
      if (text.length > this.Tfhka.printerPreferences.codeCode39CharMaxLen)
        throw new Error(
          "la longitud del codigo es mayor a la permitida para esta impresora"
        );
    } else if (Flag43 == "04") {
      //QR
      if (!this.Tfhka.printerPreferences.codeQRCharMaxLen)
        throw new Error("la impresora no soporta este tipo de codigo");
      if (text.length > this.Tfhka.printerPreferences.codeQRCharMaxLen)
        throw new Error(
          "la longitud del codigo es mayor a la permitida para esta impresora"
        );
    } else if (Flag43 == "05") {
      //PDF
      if (!this.Tfhka.printerPreferences.codePDFCharMaxLen)
        throw new Error("la impresora no soporta este tipo de codigo");
      if (text.length > this.Tfhka.printerPreferences.codePDFCharMaxLen)
        throw new Error(
          "la longitud del codigo es mayor a la permitida para esta impresora"
        );
    }
    this.Tfhka.SendCmd(position + text);
  },
  setQrtype(type) {
    this.Tfhka.SendCmd("PJ43" + type);
  }
};

module.exports = Factura;
