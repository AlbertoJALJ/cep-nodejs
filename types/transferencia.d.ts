import { Cuenta } from './cuenta';
import { Client } from './client';

export interface TransferenciaDict {
    fechaOperacion: string;
    fechaAbono: string;
    ordenante: any;
    beneficiario: any;
    monto: number;
    montoPesos: number;
    iva: string;
    concepto: string;
    claveRastreo: string;
    emisor: string;
    receptor: string;
    sello: string;
    tipoPago: number;
    pagoABanco: boolean;
}

export declare class Transferencia {
    fechaOperacion: Date | null;
    fechaAbono: Date | null;
    ordenante: Cuenta | null;
    beneficiario: Cuenta | null;
    monto: number | null;
    iva: number | null;
    concepto: string | null;
    claveRastreo: string | null;
    emisor: string | null;
    receptor: string | null;
    sello: string | null;
    tipoPago: number | null;
    pagoABanco: boolean;
    xmlData: Buffer | null;
    pdfData: Buffer | null;
    private _client: Client | null;
    private _validacionData: any;

    constructor(
        fechaOperacion?: Date | null,
        fechaAbono?: Date | null,
        ordenante?: Cuenta | null,
        beneficiario?: Cuenta | null,
        monto?: number | null,
        iva?: number | null,
        concepto?: string | null,
        claveRastreo?: string | null,
        emisor?: string | null,
        receptor?: string | null,
        sello?: string | null,
        tipoPago?: number | null,
        pagoABanco?: boolean,
        xmlData?: Buffer | null,
        pdfData?: Buffer | null
    );

    /**
     * Obtiene el monto en pesos
     */
    get montoPesos(): number;

    /**
     * Obtiene los datos XML originales del CEP
     */
    getXmlData(): Buffer | null;

    /**
     * Obtiene los datos PDF originales del CEP
     */
    getPdfData(): Buffer | null;

    /**
     * Valida una transferencia SPEI con el portal CEP de Banxico
     */
    static validar(
        fecha: Date | string,
        claveRastreo: string,
        emisor: string,
        receptor: string,
        cuenta: string,
        monto: number,
        pagoABanco?: boolean
    ): Promise<Transferencia>;

    /**
     * Descarga PDF de la transferencia usando datos de validación separados
     */
    descargarPDF(): Promise<Buffer>;

    /**
     * Método legacy para compatibilidad
     */
    descargar(formato?: 'PDF' | 'XML'): Promise<Buffer>;

    /**
     * Convierte la transferencia a un objeto plano
     */
    toDict(): TransferenciaDict;

    /**
     * Valida los datos de la transferencia con el servidor CEP
     */
    private static _validar(
        fecha: Date | string,
        claveRastreo: string,
        emisor: string,
        receptor: string,
        cuenta: string,
        monto: number,
        pagoABanco?: boolean
    ): Promise<Client>;

    /**
     * Descarga archivo del servidor CEP
     */
    private static _descargar(client: Client, formato?: 'PDF' | 'XML'): Promise<Buffer>;

    /**
     * Parsea fecha de abono del formato del CEP
     */
    private static _parseFechaAbono(fechaStr: string): Date;

    /**
     * Formatea monto de centavos a pesos
     */
    private static _formatMonto(montoEnCentavos: number): string;
}
