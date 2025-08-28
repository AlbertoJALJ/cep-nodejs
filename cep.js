/* eslint-disable camelcase */
import fetch from 'node-fetch';      // ≥ Node 18 usa global fetch

// ────── Excepciones específicas ────────────────────────────────
export class TransferNotFoundError   extends Error {}
export class CepNotAvailableError    extends Error {}
export class MaxRequestError         extends Error {}

// ────── Helper: formato AAAA-MM-DD que pide Banxico ────────────
const fmtDate = d =>
  d instanceof Date
    ? d.toISOString().slice(0, 10)
    : d;            // si ya viene como string

// ────── Transferencia (devuelto tras validar) ──────────────────
export class Transfer {
  constructor({ folio, params, client }) {
    this.folio  = folio;   // «id» interno de Banxico
    this.params = params;  // para depuración
    this._cli   = client;
  }

  /**
   * Descarga el CEP en el formato deseado (PDF|XML|ZIP)
   * @param {'PDF'|'XML'|'ZIP'} formato
   * @returns {Promise<Buffer>}
   */
  async descargar(formato = 'PDF') {
    const url = `${this._cli._base}/cep/descargaCEP.htm?folio=${this.folio}&tipoDoc=${formato}`;
    const rsp = await fetch(url);
    if (!rsp.ok) throw new Error(`Error HTTP ${rsp.status} al descargar CEP`);
    return Buffer.from(await rsp.arrayBuffer());
  }

  toString() {
    return `[Transfer folio=${this.folio} ${this.params.clave_rastreo}]`;
  }
}

// ────── Cliente principal ──────────────────────────────────────
export class CepClient {
  /**
   * @param {{beta?: boolean}} [cfg]
   */
  constructor(cfg = {}) {
    // hosts idénticos a los que usa `cep-python` 
    this._base = cfg.beta
      ? 'https://cepsandbox.banxico.org.mx' // “entorno de pruebas”
      : 'https://www.banxico.org.mx';
  }

  /**
   * Valida la existencia de una transferencia SPEI en la base CEP
   * @param {{
   *   fecha: Date|string,
   *   clave_rastreo: string,
   *   emisor: string,      // 5 dígitos
   *   receptor: string,    // 5 dígitos
   *   cuenta: string,      // CLABE / tarjeta / celular
   *   monto: number,       // centavos (int)
   *   pago_a_banco?: boolean
   * }} params
   * @returns {Promise<Transfer>}
   */
  async validar(params) {
    // 1 ) Normalizar payload adaptado a lo que envía cep-python
    const {
      fecha,
      clave_rastreo,
      emisor,
      receptor,
      cuenta,
      monto,
      pago_a_banco = false,
    } = params;

    const body = new URLSearchParams({
      fechaOperacion: fmtDate(fecha),
      claveRastreo:   clave_rastreo,
      institucionOrdenante:   emisor,
      institucionBeneficiaria: receptor,
      cuentaBeneficiaria:     cuenta,
      // Banxico espera DECIMALES - convertimos centavos→peso
      monto: (monto / 100).toFixed(2),
      pagoABanco: pago_a_banco ? '1' : '0',
    });

    // 2 ) POST al endpoint de consulta
    const url = `${this._base}/cep/doConsultaCEP.htm`;
    const rsp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (rsp.status === 429) throw new MaxRequestError('Rate limit CEP');

    // 3 ) Respuesta JSON con “folio” o mensaje de error
    const data = await rsp.json().catch(async () => {
      // Si Banxico devuelve HTML (error), lo parseamos rudimentariamente:
      const html = await rsp.text();
      if (/transferencia no encontrada/i.test(html))
        throw new TransferNotFoundError('Transferencia no encontrada');
      throw new Error('Respuesta inesperada del CEP');
    });

    if (data.resultado === 'NO_ENCONTRADO')
      throw new TransferNotFoundError('Transferencia no encontrada');
    if (data.resultado === 'SIN_CEP')
      throw new CepNotAvailableError('CEP aún no disponible');

    // 4 ) Éxito → devolvemos objeto Transfer
    return new Transfer({
      folio: data.folio,
      params,
      client: this,
    });
  }
}