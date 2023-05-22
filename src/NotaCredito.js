const NotaCredito = {
  Tfhka: null,
  linesAdc: 0,
  rif: "",
  razonSocial: "",
  facturaAfectada: "",
  fechaFacturaAfectada: "",
  SerialNumber: "",
  Log: [],
  process: "init",
  precioDecimals: 2,
  cantidadDecimals: 2,
  init(
    tfhka,
    { rif, razonSocial, facturaAfectada, fechaFacturaAfectada, SerialNumber }
  ) {
    this.rif = rif;
    this.razonSocial = razonSocial;
    this.facturaAfectada = facturaAfectada;
    this.fechaFacturaAfectada = fechaFacturaAfectada;
    this.SerialNumber = SerialNumber;
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
    if (!this.facturaAfectada) throw new Error("Factura Afectada no definida");
    if (!this.fechaFacturaAfectada)
      throw new Error("Fecha Factura Afectada no definida");
    if (!this.SerialNumber) throw new Error("Serial Number no definido");
    this.Tfhka.SendCmd("iR*" + this.rif);
    this.process = "encabezado_rif";
    this.Tfhka.SendCmd("iS*" + this.razonSocial);
    this.process = "encabezado_razon_social";
    this.Tfhka.SendCmd("iF*" + this.facturaAfectada);
    this.process = "encabezado_factura_afectada";
    this.Tfhka.SendCmd("iD*" + this.fechaFacturaAfectada);
    this.process = "encabezado_fecha_factura_afectada";
    this.Tfhka.SendCmd("iI*" + this.SerialNumber);
    this.process = "encabezado_serial_number";
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
    //Los comentarios que se realicen en las nota de débito deberán ser enviados después de un producto. MANUAL DE PROTOCOLOS Y COMANDOS PAGINA 42
    if (this.process.indexOf("item") == -1)
      throw new Error("Comentario fuera de lugar");
    const statusPrinter = this.Tfhka.CheckFprinter();
    if (!statusPrinter) throw new Error("Impresora no conectada");
    this.Tfhka.SendCmd("@" + cmd);
    this.process = "comentario";
  },
  PrintItem({ cantidad, descripcion, precio, iva }) {
    if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
    let cmd = "";
    if (iva) {
      cmd += "d1";
    } else {
      cmd += "d0";
    } //000000100000001000Producto Exento
    const Flag21 = this.Tfhka.flags[21]; //
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
  Cerrar() {
    if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
    this.Tfhka.SendCmd("101");
    this.process = "end";
  },
};

module.exports = NotaCredito;
