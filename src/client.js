import fetch from 'node-fetch';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36';
const BASE_URL = 'https://www.banxico.org.mx/cep';

let globalBaseUrl = BASE_URL;

/**
 * Configura la URL base para usar el entorno beta o producción
 * @param {boolean} beta - Si es true, usa la URL beta
 */
export function configure(beta = false) {
    globalBaseUrl = BASE_URL;
}

export class Client {
    constructor() {
        this.baseUrl = globalBaseUrl;
        this.baseData = {
            tipoCriterio: 'T',
            captcha: 'c',
            tipoConsulta: 1
        };
        this.sessionCookies = [];
    }

    /**
     * Realiza una petición GET
     * @param {string} endpoint - El endpoint a consultar
     * @param {Object} options - Opciones adicionales para fetch
     * @returns {Promise<Buffer>} El contenido de la respuesta como Buffer
     */
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, {}, options);
    }

    /**
     * Realiza una petición POST
     * @param {string} endpoint - El endpoint a consultar
     * @param {Object} data - Los datos a enviar
     * @param {Object} options - Opciones adicionales para fetch
     * @returns {Promise<Buffer>} El contenido de la respuesta como Buffer
     */
    async post(endpoint, data, options = {}) {
        const mergedData = { ...this.baseData, ...data };
        return this.request('POST', endpoint, mergedData, options);
    }

    /**
     * Realiza una petición HTTP
     * @param {string} method - El método HTTP
     * @param {string} endpoint - El endpoint a consultar
     * @param {Object} data - Los datos a enviar
     * @param {Object} options - Opciones adicionales para fetch
     * @returns {Promise<Buffer>} El contenido de la respuesta como Buffer
     */
    async request(method, endpoint, data, options = {}) {
        const url = this.baseUrl + endpoint;
        
        const fetchOptions = {
            method,
            headers: {
                'User-Agent': USER_AGENT,
                ...options.headers
            },
            ...options
        };

        // Agregar cookies de sesión si existen
        if (this.sessionCookies.length > 0) {
            fetchOptions.headers['Cookie'] = this.sessionCookies.join('; ');
        }

        if (method === 'POST') {
            // Convertir datos a form-encoded
            const formData = new URLSearchParams();
            for (const [key, value] of Object.entries(data)) {
                formData.append(key, value);
            }
            fetchOptions.body = formData;
        }

        const response = await fetch(url, fetchOptions);
        // console.log(response);
        
        // Guardar cookies de sesión
        const setCookieHeaders = response.headers.raw()['set-cookie'];
        if (setCookieHeaders) {
            this.sessionCookies = setCookieHeaders.map(cookie => cookie.split(';')[0]);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return Buffer.from(await response.arrayBuffer());
    }
}
