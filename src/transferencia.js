import { DOMParser } from '@xmldom/xmldom';
import { Client } from './client.js';
import { Cuenta } from './cuenta.js';
import {
    CepError,
    CepNotAvailableError,
    MaxRequestError,
    TransferNotFoundError
} from './exceptions.js';
import { isValidBankCode, isValidBankName } from './banks.js';

const MAX_REQUEST_ERROR_MESSAGE = 'Lo sentimos, pero ha excedido el número máximo de consultas en este portal';
const NO_PAYMENT_ERROR_MESSAGE = 'No se encontró ningún pago con la información proporcionada';
const NO_OPERATION_ERROR_MESSAGE = 'El SPEI no ha recibido una orden de pago que cumpla con el criterio de búsqueda especificado';
const NO_CEP_ERROR_MESSAGE = 'Con la información proporcionada se identificó el siguiente pago';

export class Transferencia {

    constructor(fechaOperacion, fechaAbono, ordenante, beneficiario, monto, iva,
        concepto, claveRastreo, emisor, receptor, sello, tipoPago, pagoABanco = false, xmlData = null, pdfData = null, numeroCertificado = null, cadenaCda = null) {
        this.fechaOperacion = fechaOperacion;
        this.fechaAbono = fechaAbono;
        this.ordenante = ordenante;
        this.beneficiario = beneficiario;
        this.monto = monto;
        this.iva = iva;
        this.concepto = concepto;
        this.claveRastreo = claveRastreo;
        this.emisor = emisor;
        this.receptor = receptor;
        this.sello = sello;
        this.tipoPago = tipoPago;
        this.pagoABanco = pagoABanco;
        this.xmlData = xmlData;
        this.pdfData = pdfData;
        this.numeroCertificado = numeroCertificado;
        this.cadenaCda = cadenaCda;
        this._client = null;
    }

    /**
     * Obtiene el monto en pesos
     * @returns {number} Monto en pesos
     */
    get montoPesos() {
        return this.monto;
    }

    /**
     * Obtiene los datos XML originales del CEP
     * @returns {Buffer|null} Datos XML como Buffer, o null si no están disponibles
     */
    getXmlData() {
        return this.xmlData;
    }

    /**
     * Obtiene los datos PDF originales del CEP
     * @returns {Buffer|null} Datos PDF como Buffer, o null si no están disponibles
     */
    getPdfData() {
        return this.pdfData;
    }

    /**
     * Valida una transferencia SPEI con el portal CEP de Banxico y obtiene todos los datos
     * @param {string} fecha - Fecha de la transferencia
     * @param {string} claveRastreo - Clave de rastreo
     * @param {string} emisor - Banco emisor
     * @param {string} receptor - Banco receptor
     * @param {string} cuenta - Número de cuenta
     * @param {number} monto - Monto en centavos
     * @param {boolean} pagoABanco - Si es pago a banco
     * @returns {Promise<Transferencia>} La transferencia validada con todos los datos parseados
     */
    static async validar(fecha, claveRastreo, emisor, receptor, cuenta, monto, pagoABanco = false) {
        const client = await this._validar(fecha, claveRastreo, emisor, receptor, cuenta, monto, pagoABanco);
        
        const xmlData = await this._descargar(client, 'XML');
        const xmlString = xmlData.toString('utf-8');

        if (xmlString.includes(MAX_REQUEST_ERROR_MESSAGE)) {
            throw new MaxRequestError();
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'text/xml');
        const resp = doc.documentElement;

        if (!resp) {
            throw new CepError('Respuesta XML inválida');
        }

        const ordenanteElement = resp.getElementsByTagName('Ordenante')[0];
        const beneficiarioElement = resp.getElementsByTagName('Beneficiario')[0];

        if (!ordenanteElement || !beneficiarioElement) {
            throw new CepError('Elementos Ordenante o Beneficiario no encontrados en el XML');
        }

        const ordenante = Cuenta.fromXmlElement(ordenanteElement);
        const beneficiario = Cuenta.fromXmlElement(beneficiarioElement);
        const cadenaCda = resp.getAttribute('cadenaCDA').split('|');
        const numeroCertificado = resp.getAttribute('numeroCertificado');
        const fechaAbonoStr = cadenaCda[4] + cadenaCda[5];
        const fechaAbono = this._parseFechaAbono(fechaAbonoStr);
        const tipoPago = parseInt(cadenaCda[2]);
        const fechaOperacion = new Date(resp.getAttribute('FechaOperacion'));
        const iva = parseFloat(beneficiarioElement.getAttribute('IVA'));
        const concepto = beneficiarioElement.getAttribute('Concepto');
        const sello = resp.getAttribute('sello');
        const montoInt = beneficiarioElement.getAttribute('MontoPago');
        

        const transferencia = new Transferencia(
            fechaOperacion, fechaAbono, ordenante, beneficiario, 
            montoInt, iva, concepto, claveRastreo, emisor, receptor, 
            sello, tipoPago, pagoABanco, xmlData, null, numeroCertificado, cadenaCda
        );
        
        // Guardar datos de validación para posible descarga de PDF
        transferencia._validacionData = {
            fecha, claveRastreo, emisor, receptor, cuenta, monto, pagoABanco
        };
        
        return transferencia;
    }


    /**
     * Descarga el PDF de la transferencia usando un cliente independiente
     * @returns {Promise<Buffer>} Contenido del PDF
     */
    async descargarPDF() {
        if (!this._validacionData) {
            throw new Error('Datos de validación no disponibles. Primero valida la transferencia.');
        }

        // Crear un cliente completamente nuevo para la descarga de PDF
        const { fecha, claveRastreo, emisor, receptor, cuenta, monto, pagoABanco } = this._validacionData;
        const pdfClient = await Transferencia._validar(fecha, claveRastreo, emisor, receptor, cuenta, monto, pagoABanco);
        
        const data = await Transferencia._descargar(pdfClient, 'PDF');
        this.pdfData = data;
        return data;
    }

    /**
     * Descarga el CEP en el formato especificado (método legacy)
     * @param {string} formato - Formato: 'PDF', 'XML' o 'ZIP'
     * @returns {Promise<Buffer>} Contenido del archivo
     */
    async descargar(formato = 'PDF') {
        if (!this._client) {
            throw new Error('Cliente no disponible. Primero valida la transferencia.');
        }

        const data = await Transferencia._descargar(this._client, formato);

        if (formato === 'PDF' && !this.pdfData) {
            this.pdfData = data;
        } else if (formato === 'XML' && !this.xmlData) {
            this.xmlData = data;
        }

        return data;
    }

    /**
     * Convierte la transferencia a un objeto plano
     * @returns {Object} Representación como objeto plano
     */
    toDict() {
        return {
            fechaOperacion: this.fechaOperacion.toISOString().split('T')[0],
            fechaAbono: this.fechaAbono.toISOString(),
            ordenante: this.ordenante.toDict(),
            beneficiario: this.beneficiario.toDict(),
            monto: this.monto,
            montoPesos: this.montoPesos,
            iva: this.iva.toString(),
            concepto: this.concepto,
            claveRastreo: this.claveRastreo,
            emisor: this.emisor,
            receptor: this.receptor,
            sello: this.sello,
            tipoPago: this.tipoPago,
            pagoABanco: this.pagoABanco
        };
    }

    /**
     * Valida los datos de la transferencia con el servidor CEP
     * @param {Date} fecha - Fecha de la transferencia
     * @param {string} claveRastreo - Clave de rastreo
     * @param {string} emisor - Banco emisor
     * @param {string} receptor - Banco receptor
     * @param {string} cuenta - Número de cuenta
     * @param {number} monto - Monto en centavos
     * @param {boolean} pagoABanco - Si es pago a banco
     * @returns {Promise<Client>} Cliente autenticado
     * @private
     */
    static async _validar(fecha, claveRastreo, emisor, receptor, cuenta, monto, pagoABanco = false) {
        if (!isValidBankCode(emisor)) {
            throw new Error(`Banco emisor inválido: ${emisor}`);
        }
        if (!isValidBankCode(receptor)) {
            throw new Error(`Banco receptor inválido: ${receptor}`);
        }

        const client = new Client();

        const requestBody = {
            fecha: fecha,
            criterio: claveRastreo,
            emisor: emisor,
            receptor: receptor,
            cuenta: cuenta,
            monto: this._formatMonto(monto),
            receptorParticipante: 0
        };

        const resp = await client.post('/valida.do', requestBody);
        const decodedResp = resp.toString('utf-8');

        if (decodedResp.includes(NO_CEP_ERROR_MESSAGE)) {
            throw new CepNotAvailableError();
        }
        if (decodedResp.includes(NO_PAYMENT_ERROR_MESSAGE) ||
            decodedResp.includes(NO_OPERATION_ERROR_MESSAGE)) {
            throw new TransferNotFoundError();
        }

        return client;
    }

    /**
     * Descarga el archivo en el formato especificado
     * @param {Client} client - Cliente autenticado
     * @param {string} formato - Formato: 'PDF', 'XML' o 'ZIP'
     * @returns {Promise<Buffer>} Contenido del archivo
     * @private
     */
    static async _descargar(client, formato = 'PDF') {
        return client.get(`/descarga.do?formato=${formato}`);
    }

    static _parseFechaAbono(fechaStr) {
        const day = parseInt(fechaStr.substr(0, 2));
        const month = parseInt(fechaStr.substr(2, 2)) - 1;
        const year = parseInt(fechaStr.substr(4, 4));
        const hour = parseInt(fechaStr.substr(8, 2));
        const minute = parseInt(fechaStr.substr(10, 2));
        const second = parseInt(fechaStr.substr(12, 2));
        return new Date(year, month, day, hour, minute, second);
    }

    static _formatMonto(montoEnCentavos) {
        return (montoEnCentavos / 100).toFixed(2);
    }
}
