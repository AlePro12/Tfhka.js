const S1Data = {
  arr: [],
  model: "SRP350, HSP7000, TD1125, HKA112, KUBE",
  S1: {
    /*	private int cashierNumber;
	private double totalDailySales;
	private int lastInvoiceNumber;
	private int lastDebitNoteNumber;
	private int quantityDebitNotesToday;
	private int quantityOfInvoicesToday;
	private int numberNonFiscalDocuments;
	private int quantityNonFiscalDocuments;
	private int dailyClosureCounter;
	private int auditReportsCounter;
	private string rif;
	private string registeredMachineNumber;
	private DateTime currentPrinterDateTime;
	private int lastNCNumber;
	private int quantityOfNCToday;

  */
    cashierNumber: "",
    totalDailySales: 0,
    lastInvoiceNumber: 0,
    lastDebitNoteNumber: 0,
    quantityOfInvoicesToday: 0,
    quantityDebitNotesToday: 0, // MODEL SRP812, DT230, HKA80, P3100DL, PP9, ACLAS PP9-PLUS, TD1140
    lastCreditNoteNumber: 0,
    quantityCreditNotesToday: 0,
    numberNonFiscalDocuments: 0,
    quantityNonFiscalDocuments: 0,
    dailyClosureCounter: 0,
    auditReportsCounter: 0,
    rif: "",
    registeredMachineNumber: "",
    currentPrinterDateTime: "",
    currentPrinterTime: "",
    currentPrinterDate: "",
    lastNCNumber: 0,
    quantityOfNCToday: 0,
  },
  init: function (s) {
    for (var i = 0; i < s.length; i++) {
      this.arr.push(s.charAt(i));
    }
    this.S1.cashierNumber = this.g(0, 3);
    this.S1.totalDailySales = this.nP(this.g(4, 20));
    this.S1.lastInvoiceNumber = this.g(21, 28);
    this.S1.quantityOfInvoicesToday = this.g(29, 33);
    if (s == 100 || s == 99) {
      this.S1.numberNonFiscalDocuments = this.g(34, 41);
      this.S1.quantityNonFiscalDocuments = this.g(42, 46);
      this.S1.dailyClosureCounter = this.g(47, 50);
      this.S1.auditReportsCounter = this.g(51, 54);
      this.S1.rif = this.g(55, 65);
      this.S1.registeredMachineNumber = this.g(66, 75);
      this.S1.currentPrinterTime = this.g(76, 81);
      this.S1.currentPrinterDate = this.g(82, 87);
      this.S1.lastNCNumber = this.g(88, 95);
      this.S1.quantityOfNCToday = this.g(96, 100);
    } else {
      this.model = "SRP812, DT230, HKA80, P3100DL, PP9, ACLAS PP9-PLUS, TD1140";
      this.S1.lastDebitNoteNumber = this.g(34, 41);
      this.S1.quantityDebitNotesToday = this.g(42, 46);
      this.S1.lastCreditNoteNumber = this.g(47, 54);
      this.S1.quantityCreditNotesToday = this.g(55, 59);
      this.S1.numberNonFiscalDocuments = this.g(60, 67);
      this.S1.quantityNonFiscalDocuments = this.g(68, 72);
      this.S1.dailyClosureCounter = this.g(73, 76);
      this.S1.auditReportsCounter = this.g(77, 80);
      this.S1.rif = this.g(81, 91);
      this.S1.registeredMachineNumber = this.g(92, 101);
      this.S1.currentPrinterTime = this.g(102, 107);
      this.S1.currentPrinterDate = this.g(108, 113);
    }
    return this.S1;
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
  },
};
module.exports = S1Data;
