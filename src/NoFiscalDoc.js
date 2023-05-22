const NoFiscalDoc = {
    Tfhka: null,
    bandera: false,
    init(tfhka) {     
     if (!tfhka) throw new Error("Impresora no inicializada");
        this.Tfhka = tfhka;
        if (!this.Tfhka.bandera) throw new Error("Impresora no inicializada");
        const statusPrinter = this.Tfhka.CheckFprinter();
        if (!statusPrinter) throw new Error("Impresora no conectada");
    },
    //Apertura el documento No Fiscal
    Apertura(cmd) {
        const statusPrinter = this.Tfhka.CheckFprinter();
        if (!statusPrinter) throw new Error("Impresora no conectada");
        this.bandera = true;
        Tfhka.SendCmd("800" + cmd);
    },
    //Efecto negrita
    Bold(cmd) {
        if (!this.bandera) throw new Error("No hay documento abierto");
        const statusPrinter = this.Tfhka.CheckFprinter();
        if (!statusPrinter) throw new Error("Impresora no conectada");
        Tfhka.SendCmd("80*" + cmd);
    },
    //Efecto expandido
    Expanded(cmd) {
        if (!this.bandera) throw new Error("No hay documento abierto");
        const statusPrinter = this.Tfhka.CheckFprinter();
        if (!statusPrinter) throw new Error("Impresora no conectada");
        Tfhka.SendCmd("80>" + cmd);
    },
    // Efecto negrita + centrado + doble ancho
    BoldCenterDouble(cmd) {
        if (!this.bandera) throw new Error("No hay documento abierto");
        const statusPrinter = this.Tfhka.CheckFprinter();
        if (!statusPrinter) throw new Error("Impresora no conectada");
        Tfhka.SendCmd("80$" + cmd);
    },
    //Efecto centrado
    Center(cmd) {
        if (!this.bandera) throw new Error("No hay documento abierto");
        const statusPrinter = this.Tfhka.CheckFprinter();
        if (!statusPrinter) throw new Error("Impresora no conectada");
        Tfhka.SendCmd("80!" + cmd);
    },
    //Efecto negrita + centrado 
    BoldCenter(cmd) {
        if (!this.bandera) throw new Error("No hay documento abierto");
        const statusPrinter = this.Tfhka.CheckFprinter();
        if (!statusPrinter) throw new Error("Impresora no conectada");
        Tfhka.SendCmd("80¡" + cmd);
    },
    Close(cmd) {
        const statusPrinter = this.Tfhka.CheckFprinter();
        if (!statusPrinter) throw new Error("Impresora no conectada");
        if (!this.bandera) throw new Error("No hay documento abierto");
        this.bandera = false;
        Tfhka.SendCmd("810" + cmd);
    }
}