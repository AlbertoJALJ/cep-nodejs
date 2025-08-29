import { Response } from 'node-fetch';

export declare class Client {
    baseUrl: string;
    session: string | null;

    constructor(baseUrl?: string);

    /**
     * Construye los headers HTTP para las peticiones
     */
    _buildHeaders(): Record<string, string>;

    /**
     * Actualiza la sesión con las cookies del response
     */
    _updateSession(response: Response): void;

    /**
     * Realiza una petición GET
     */
    get(path: string): Promise<Buffer>;

    /**
     * Realiza una petición POST
     */
    post(path: string, data?: Record<string, any>): Promise<Response>;
}
