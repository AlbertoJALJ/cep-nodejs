export class Cuenta {
    /**
     * @param {string} nombre - Nombre del titular de la cuenta
     * @param {string} tipoCuenta - Tipo de cuenta
     * @param {string} banco - Nombre del banco
     * @param {string} numero - Número de cuenta
     * @param {string} rfc - RFC del titular
     */
    constructor(nombre, tipoCuenta, banco, numero, rfc) {
        this.nombre = nombre;
        this.tipoCuenta = tipoCuenta;
        this.banco = banco;
        this.numero = numero;
        this.rfc = rfc;
    }

    /**
     * Crea una instancia de Cuenta desde un elemento XML
     * @param {Element} element - Elemento XML que contiene los datos de la cuenta
     * @returns {Cuenta} Nueva instancia de Cuenta
     */
    static fromXmlElement(element) {
        const banco = element.getAttribute('BancoEmisor') || element.getAttribute('BancoReceptor');
        
        return new Cuenta(
            element.getAttribute('Nombre'),
            element.getAttribute('TipoCuenta'),
            banco,
            element.getAttribute('Cuenta'),
            element.getAttribute('RFC')
        );
    }

    /**
     * Convierte la cuenta a un objeto plano
     * @returns {Object} Representación de la cuenta como objeto plano
     */
    toDict() {
        return {
            nombre: this.nombre,
            tipoCuenta: this.tipoCuenta,
            banco: this.banco,
            numero: this.numero,
            rfc: this.rfc
        };
    }
}
