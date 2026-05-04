function slice(s, from, toInclusive) {
  if (!s) return "";
  return s.substring(from, toInclusive + 1);
}

function parse(cadena) {
  const s = cadena || "";
  return {
    cashierNumber: slice(s, 0, 3),
    SubtotalSales: slice(s, 4, 20),
    LastInvoiceNumber: slice(s, 21, 28),
    QuantityOfInvoicesToday: slice(s, 29, 33),
    LastDocumentNotFiscal: slice(s, 34, 41),
    QuantityDocumentNotFiscal: slice(s, 42, 46),
    QuantityDocumentZ: slice(s, 47, 50),
    QuantityDocumentCreditNoteFiscal: slice(s, 51, 54),
    RIF: slice(s, 55, 65),
    Serial: slice(s, 66, 75),
    currentPrinterTime: slice(s, 76, 81),
    currentPrinterDate: slice(s, 82, 87),
    lastNCNumber: slice(s, 88, 95),
    quantityOfNCToday: slice(s, 96, 100),
  };
}

module.exports = {
  parse,
  init: parse,
};
