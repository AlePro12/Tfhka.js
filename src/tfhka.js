const Handler = require("./utils/handler");
const S1Data = require("./utils/S1Data");

const SLEEP_BUFFER = new Int32Array(new SharedArrayBuffer(4));

function sleepSync(ms) {
  if (ms <= 0) return;
  Atomics.wait(SLEEP_BUFFER, 0, 0, ms);
}

const STATUS_READY = [0x40, 0x60];

const Tfhka = {
  retry: 2,
  retryDelayMs: 200,
  connected: false,
  port: null,
  dllPath: null,

  init(port, dllPath = null) {
    if (this.connected && this.port === port && this.dllPath === dllPath) {
      return true;
    }
    if (this.connected) {
      try { Handler.close(); } catch (_) {}
      this.connected = false;
    }
    this.port = port;
    this.dllPath = dllPath;
    Handler.init(port, dllPath);
    if (!Handler.open()) {
      throw new Error("Error al abrir la impresora en puerto " + port);
    }
    if (!Handler.CheckFprinter()) {
      try { Handler.close(); } catch (_) {}
      throw new Error("Impresora no responde tras abrir el puerto");
    }
    this.connected = true;
    return true;
  },

  close() {
    if (!this.connected) return true;
    let res = false;
    try { res = Handler.close(); } catch (_) { res = false; }
    this.connected = false;
    return res;
  },

  reconnect() {
    if (!this.port) throw new Error("Impresora no inicializada");
    try { Handler.close(); } catch (_) {}
    this.connected = false;
    return this.init(this.port, this.dllPath);
  },

  CheckFprinter() {
    if (!this.connected) return false;
    return Handler.CheckFprinter();
  },

  ReadFpStatus() {
    if (!this.connected) throw new Error("Impresora no inicializada");
    const { res, pStatus, pError } = Handler.ReadFpStatus();
    if (!res) throw new Error("Error al leer status");
    return { status: pStatus.deref(), error: pError.deref() };
  },

  waitForReady(timeoutMs = 30000, pollMs = 100) {
    if (!this.connected) throw new Error("Impresora no inicializada");
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const { status } = this.ReadFpStatus();
        if (STATUS_READY.includes(status)) return true;
      } catch (_) {}
      sleepSync(pollMs);
    }
    return false;
  },

  SendCmd(cmd) {
    if (!this.connected) throw new Error("Impresora no inicializada");
    const attempts = this.retry + 1;
    let lastErr = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const { res } = Handler.SendCmd(cmd);
        if (res) return res;
      } catch (e) {
        lastErr = e;
      }
      if (i < attempts - 1) {
        sleepSync(this.retryDelayMs * Math.pow(2, i));
        if (!Handler.CheckFprinter()) {
          try { this.reconnect(); } catch (_) {}
        }
      }
    }
    const suffix = lastErr ? " (" + lastErr.message + ")" : "";
    throw new Error("Error al enviar comando: " + cmd + suffix);
  },

  S1Data() {
    if (!this.connected) throw new Error("Impresora no inicializada");
    const { res, cadena } = Handler.UploadStatusDin("S1");
    if (!res) throw new Error("Error al leer datos S1");
    return S1Data.parse(cadena);
  },

  UploadStatus(cmd) {
    if (!this.connected) throw new Error("Impresora no inicializada");
    const { res, cadena, pStatus, pError } = Handler.UploadStatusDin(cmd);
    if (!res) throw new Error("Error al leer " + cmd);
    return {
      cadena,
      status: pStatus.deref(),
      error: pError.deref(),
    };
  },
};

module.exports = Tfhka;
