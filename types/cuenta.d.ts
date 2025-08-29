export declare class Cuenta {
    nombre: string | null;
    tipoCuenta: string | null;
    banco: string | null;
    numero: string | null;
    rfc: string | null;

    constructor(nombre?: string, tipoCuenta?: string, banco?: string, numero?: string, rfc?: string);

    /**
     * Crea una instancia de Cuenta desde un elemento XML
     */
    static fromXmlElement(element: Element): Cuenta;

    /**
     * Convierte la cuenta a un objeto plano
     */
    toDict(): {
        nombre: string | null;
        tipoCuenta: string | null;
        banco: string | null;
        numero: string | null;
        rfc: string | null;
    };
}
