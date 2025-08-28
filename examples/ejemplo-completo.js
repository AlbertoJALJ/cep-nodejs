import { 
    Transferencia, 
    configure,
    TransferNotFoundError,
    MaxRequestError,
    CepNotAvailableError,
} from '../index.js';
import { writeFileSync } from 'fs';


async function ejemploCompleto() {
    configure(false);
    
    try {
        const fecha = '12-08-2025'
        const claveRastreo = 'TEST12345678901234567890';
        const emisor = 'BBVA MEXICO';
        const receptor = 'Mercado Pago W';
        const cuenta = '000000001234567890';
        const monto = 25000; // $250.00 en centavos

        // Validar transferencia (automáticamente obtiene todos los datos del XML)
        console.log(`Validando transferencia de $${monto / 100} MXN...`);
        
        const transferencia = await Transferencia.validar(
            fecha, claveRastreo, emisor, receptor, cuenta, monto, false
        );
        
        console.log('✓ Transferencia validada con todos los datos');
        console.log(`✓ Ordenante: ${transferencia.ordenante?.nombre}`);
        console.log(`✓ Beneficiario: ${transferencia.beneficiario?.nombre}`);
        console.log(`✓ Monto: $${transferencia.montoPesos} MXN`);
        console.log(`✓ Fecha operación: ${transferencia.fechaOperacion?.toLocaleDateString()}`);
        
        const xmlData = transferencia.getXmlData();
        if (xmlData) {
            writeFileSync('transferencia.xml', xmlData);
            console.log(`✓ XML guardado (${xmlData.length} bytes)`);
        }

        // Descargar PDF (opcional - usa cliente independiente)
        console.log('\nDescargando PDF con cliente separado...');
        const pdfData = await transferencia.descargarPDF();
        writeFileSync('transferencia.pdf', pdfData);
        console.log(`✓ PDF guardado (${pdfData.length} bytes)`);

    } catch (error) {
        // console.log(error);
        // console.log(`✗ Error: ${error.message}`);
        
        if (error instanceof TransferNotFoundError) {
            console.log('  → Transferencia no encontrada');
        } else if (error instanceof MaxRequestError) {
            console.log('  → Límite de consultas excedido');
        } else if (error instanceof CepNotAvailableError) {
            console.log('  → CEP no disponible');
        }
    }
}


// Ejecutar ejemplo
ejemploCompleto()
    .catch(error => {
        console.error('Error ejecutando ejemplo:', error);
    });
