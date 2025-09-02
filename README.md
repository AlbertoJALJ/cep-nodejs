# CEP Banxico

[![npm version](https://badge.fury.io/js/cep-banxico.svg)](https://badge.fury.io/js/cep-banxico)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

Cliente Node.js profesional para consultar transferencias SPEI en el portal CEP de Banxico.

## 🚀 Características

- ✅ **Validación completa** de transferencias SPEI
- ✅ **Descarga de comprobantes** en PDF y XML  
- ✅ **Cliente independiente** para PDF (sin conflictos)
- ✅ **Datos estructurados** parseados automáticamente
- ✅ **Manejo robusto de errores** específicos del CEP
- ✅ **Soporte TypeScript completo** con tipos incluidos
- ✅ **Cero dependencias pesadas** (solo 2 dependencias)

## 📦 Instalación

```bash
# Con pnpm (recomendado)
pnpm add cep-banxico

# Con npm
npm install cep-banxico

# Con yarn
yarn add cep-banxico
```

## 🔧 Uso Rápido

```javascript
import { Transferencia, configure } from 'cep-banxico';

// Configurar entorno (false = producción, true = beta)
configure(false);

// Validar transferencia (obtiene automáticamente todos los datos)
const transferencia = await Transferencia.validar(
    '12-08-2025',                    // fecha
    'TEST12345678901234567890',      // clave de rastreo
    '40012',                         // código banco emisor (BBVA MEXICO)
    '90722',                         // código banco receptor (Mercado Pago W)  
    '000000001234567890',            // cuenta
    25000                            // monto en centavos ($250.00)
);

// Datos disponibles inmediatamente
console.log(transferencia.ordenante.nombre);   // "JOSE ALBERTO LOPEZ JIMENEZ"
console.log(transferencia.beneficiario.nombre); // "Jose Alberto Lopez Jimenez"
console.log(transferencia.montoPesos);          // 250.00
console.log(transferencia.fechaOperacion);     // Date object

// Descargar PDF (opcional - usa cliente independiente)  
const pdfData = await transferencia.descargarPDF();
```

## 🎯 Ejemplos Avanzados

### Solo validación (sin descargas)
```javascript
const transferencia = await Transferencia.validar(fecha, claveRastreo, emisor, receptor, cuenta, monto);
// Todos los datos están disponibles inmediatamente
// XML incluido automáticamente, PDF opcional
```

### Descargar múltiples formatos
```javascript
// El XML ya está incluido
const xmlData = transferencia.getXmlData();

// PDF requiere cliente independiente
const pdfData = await transferencia.descargarPDF();

```

### Uso con TypeScript
```typescript
import { 
    Transferencia, 
    TransferenciaDict, 
    Cuenta,
    TransferNotFoundError 
} from 'cep-banxico';

// Tipos completamente tipados
const transferencia: Transferencia = await Transferencia.validar(
    new Date('2023-12-15'),
    'TEST123456789',
    '40012',                         // BBVA MEXICO
    '40072',                         // Banorte
    '000000001234567890',
    100000,
    false
);

// Datos tipados automáticamente
const montoEnPesos: number = transferencia.montoPesos;
const xmlData: Buffer | null = transferencia.getXmlData();
const dict: TransferenciaDict = transferencia.toDict();

// Cuenta con tipos
const cuenta = new Cuenta('Juan Pérez', 'Cheques', 'BBVA', '123456789', 'RFC123456789');
```

### Manejo de errores
```javascript
import { 
    TransferNotFoundError,
    MaxRequestError,
    CepNotAvailableError,
    CepError
} from 'cep-banxico';

try {
    const transferencia = await Transferencia.validar(/* parámetros */);
} catch (error) {
    if (error instanceof TransferNotFoundError) {
        console.log('Transferencia no encontrada');
    } else if (error instanceof MaxRequestError) {
        console.log('Límite de consultas excedido');  
    } else if (error instanceof CepNotAvailableError) {
        console.log('CEP no disponible');
    } else if (error instanceof CepError) {
        console.log('Error del sistema CEP:', error.message);
    }
}
```

## 📚 Referencia de API

### `Transferencia.validar()`

Método principal para validar y obtener datos de transferencias SPEI.

```javascript
static async validar(fecha, claveRastreo, emisor, receptor, cuenta, monto, pagoABanco = false)
```

**Parámetros:**
- `fecha` (string): Fecha en formato DD-MM-YYYY
- `claveRastreo` (string): Clave de rastreo de la transferencia
- `emisor` (string): Código del banco emisor (ej: '40012' para BBVA)
- `receptor` (string): Código del banco receptor (ej: '90722' para Mercado Pago)  
- `cuenta` (string): Número de cuenta del beneficiario
- `monto` (number): Monto en centavos (ej: 25000 = $250.00)
- `pagoABanco` (boolean, opcional): Si es pago a banco

**Retorna:** `Promise<Transferencia>` - Instancia con todos los datos parseados

**Lanza:** `TransferNotFoundError`, `MaxRequestError`, `CepNotAvailableError`, `CepError`

### `transferencia.descargarPDF()`

Descarga el comprobante PDF usando cliente independiente.

```javascript
async descargarPDF()
```

**Retorna:** `Promise<Buffer>` - Datos del archivo PDF

### Propiedades de Transferencia

```javascript
transferencia.fechaOperacion     // Date - Fecha de la operación
transferencia.fechaAbono         // Date - Fecha y hora del abono
transferencia.ordenante          // Cuenta - Cuenta ordenante
transferencia.beneficiario       // Cuenta - Cuenta beneficiario
transferencia.monto              // number - Monto en centavos
transferencia.montoPesos         // number - Monto en pesos (getter)
transferencia.iva                // number - IVA
transferencia.concepto           // string - Concepto 
transferencia.claveRastreo       // string - Clave de rastreo
transferencia.emisor             // string - Banco emisor
transferencia.receptor           // string - Banco receptor
transferencia.sello              // string - Sello digital
transferencia.tipoPago           // number - Tipo de pago
```

### Clase `Cuenta`

```javascript
cuenta.nombre        // string - Nombre del titular
cuenta.banco         // string - Nombre del banco
cuenta.numero        // string - Número de cuenta
cuenta.rfc           // string - RFC del titular
cuenta.tipoCuenta    // string - Tipo de cuenta
```

### Utilidades

```javascript
import { BANKS, isValidBankCode, getBankName } from 'cep-banxico';

// Validar código de banco
isValidBankCode('40012')  // true

// Obtener nombre por código
getBankName('40012')  // 'BBVA MEXICO'

// Ver todos los bancos SPEI
console.log(BANKS);
```

## ⚠️ Consideraciones Importantes

### Límites del Portal CEP
- **Consultas por día**: Banxico limita el número de consultas diarias
- **Rate limiting**: Evita hacer consultas masivas consecutivas
- **Datos reales**: Solo funciona con transferencias SPEI reales

### Arquitectura del Cliente
- **XML automático**: Siempre se descarga y parsea automáticamente
- **PDF independiente**: Usa cliente separado para evitar conflictos
- **Datos inmediatos**: Todos los datos estructurados disponibles tras validar

### Formatos Soportados
- **PDF**: Comprobante visual para impresión
- **XML**: Datos estructurados originales del CEP
- **ZIP**: Archivo comprimido con múltiples formatos

## 🔧 Desarrollo

```bash
# Clonar repositorio
git clone https://github.com:AlbertoJALJ/cep-nodejs.git
cd cep-nodejs

# Instalar dependencias
pnpm install

# Ejecutar ejemplo
pnpm start
```

## 📁 Estructura del Proyecto

```
cep-nodejs/
├── src/
│   ├── transferencia.js    # Clase principal
│   ├── client.js          # Cliente HTTP
│   ├── cuenta.js          # Modelo de cuenta
│   ├── exceptions.js      # Errores específicos
│   └── banks.js          # Catálogo SPEI
├── examples/
│   └── ejemplo-completo.js # Ejemplo funcional
├── index.js              # Punto de entrada
├── package.json
├── README.md
└── LICENSE
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Reconocimientos

- Inspirado en el paquete Python `cep-python`
- Portal CEP de Banxico por la funcionalidad oficial
- Comunidad Node.js por las herramientas de desarrollo
