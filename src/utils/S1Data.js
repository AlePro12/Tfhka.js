const S1Data = {
  arr: [],
  init: function (s) {
    for (var i = 0; i < s.length; i++) {
      this.arr.push(s.charAt(i));
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

    S1.cashierNumber = this.g(0, 3);
    S1.SubtotalSales = this.g(4, 20);
    S1.LastInvoiceNumber = this.g(21, 28);
    S1.QuantityOfInvoicesToday = this.g(29, 33);
    S1.LastDocumentNotFiscal = this.g(34, 41);
    S1.QuantityDocumentNotFiscal = this.g(42, 46);
    S1.QuantityDocumentZ = this.g(47, 50);
    S1.QuantityDocumentCreditNoteFiscal = this.g(51, 54);
    S1.RIF = this.g(55, 65);
    S1.Serial = this.g(66, 75);
    S1.currentPrinterTime = this.g(76, 81);
    S1.currentPrinterDate = this.g(82, 87);
    S1.lastNCNumber = this.g(88, 95);
    S1.quantityOfNCToday = this.g(96, 100);

    return S1;
  },
  g: function (d, h) {
    let cadena = "";
    for (let i = 0; i < this.arr.length; i++) {
      if (d <= i) {
        cadena += this.arr[i];
      }
      if (i == h) return cadena;
    }
  },
};
module.exports = S1Data;
