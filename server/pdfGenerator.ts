import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import PDFDocument from 'pdfkit';
import MarkdownIt from 'markdown-it';

const TEMP_DIR = '/tmp';

interface PDFPayrollData {
  doctorId: string;
  doctorName: string;
  doctorRut: string;
  societyName?: string;
  societyRut?: string;
  month: number;
  year: number;
  participacionAttentions: any[];
  hmqAttentions: any[];
  participacionTotal: number;
  hmqTotal: number;
  totalAmount: number;
}

export async function generatePayrollPDF(data: PDFPayrollData): Promise<Buffer> {
  const monthNames = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const cartola = Math.floor(Math.random() * 900000) + 100000;
  const currentDate = new Date().toLocaleDateString('es-CL');

  // HTML template based on the provided sample
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CARTOLA DE PAGO - ${data.doctorName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            margin: 0;
            padding: 40px;
            color: #1a1a1a;
            background: #ffffff;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .document-container {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 48px;
            border: 1px solid #e5e7eb;
        }
        .header {
            text-align: center;
            margin-bottom: 48px;
            padding: 32px 0;
            border-bottom: 3px solid #3b82f6;
            background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
            border-radius: 8px;
            margin: -24px -24px 48px -24px;
            padding: 32px 24px;
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .subtitle {
            font-size: 16px;
            font-weight: 500;
            color: #2563eb;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .date {
            font-size: 14px;
            color: #475569;
            font-weight: 500;
            margin-bottom: 0;
        }
        .cartola-info {
            background: #f0f9ff;
            padding: 20px 24px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 32px;
            font-weight: 600;
            font-size: 16px;
            color: #1e3a8a;
        }
        .doctor-info {
            background: #fefefe;
            padding: 24px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin-bottom: 40px;
            font-weight: 500;
            color: #334155;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .doctor-info .rut {
            color: #2563eb;
            font-weight: 600;
        }
        .doctor-info .name {
            color: #1e293b;
            font-weight: 700;
            font-size: 15px;
        }
        .section-title {
            font-weight: 700;
            font-size: 18px;
            margin: 48px 0 24px 0;
            color: white;
            padding: 12px 20px;
            background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }
        .table-header {
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding: 5px 0;
            margin-bottom: 10px;
        }
        .attention-row {
            margin-bottom: 8px;
            padding: 2px 0;
        }
        .patient-name {
            margin-bottom: 2px;
        }
        .attention-details {
            margin-left: 0px;
            font-size: 9px;
            line-height: 1.3;
        }
        .totals {
            margin-top: 48px;
            background: #f8fafc;
            padding: 32px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 15px;
        }
        .total-row:last-child {
            border-bottom: none;
            border-top: 2px solid #2563eb;
            margin-top: 16px;
            padding-top: 24px;
            font-weight: 700;
            font-size: 18px;
            color: #1e3a8a;
        }
        .total-label {
            font-weight: 600;
            color: #475569;
        }
        .total-amount {
            font-weight: 700;
            color: #1e3a8a;
            font-size: 16px;
            text-align: right;
            min-width: 150px;
            font-family: 'Courier New', monospace;
        }
        .footer {
            margin-top: 64px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            padding: 24px;
            border-top: 2px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 8px;
            line-height: 1.8;
        }
        .footer strong {
            color: #2563eb;
            font-weight: 600;
        }
        .no-data {
            text-align: center;
            font-style: italic;
            color: #94a3b8;
            margin: 32px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 9px;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 6px;
            overflow: hidden;
        }
        
        th {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-weight: 600;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-bottom: 2px solid #1d4ed8;
        }
        
        td {
            padding: 6px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9px;
            line-height: 1.3;
            vertical-align: middle;
        }
        
        tr:nth-child(even) {
            background: #f8fafc;
        }
        
        tr:hover {
            background: #f1f5f9;
        }
        
        .amount {
            text-align: right;
            font-weight: 600;
            color: #1e40af;
        }
        
        .center {
            text-align: center;
        }
        
        /* Fix RUT alignment */
        .rut-number {
            white-space: nowrap;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.5px;
        }
        
        .percentage {
            background: #dbeafe;
            color: #1e3a8a;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
        }
            padding: 32px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px dashed #cbd5e1;
            font-size: 14px;
        }

    </style>
</head>
<body>
    <div class="document-container">
    <div class="header">
        <div class="title">CARTOLA DE PAGO${data.participacionAttentions.length > 0 && data.hmqAttentions.length > 0 ? '' : data.participacionAttentions.length > 0 ? ' - Participaciones' : data.hmqAttentions.length > 0 ? ' - HMQ' : ''}</div>
        <div class="subtitle">PORTAL PAGOS MÉDICOS</div>
        <div class="date">FECHA PAGO: ${currentDate}</div>
    </div>

    <div class="cartola-info">
        NRO CARTOLA: ${cartola}
    </div>

    <div class="doctor-info">
        ${data.societyName ? `<div style="margin-bottom: 12px;"><span class="rut">RUT Pago:</span> <span class="name">${data.societyRut || ''} ${data.societyName}</span></div>` : ''}
        <div><span class="rut">RUT Profesional:</span> <span class="name">${data.doctorRut} ${data.doctorName}</span></div>
    </div>

    ${data.participacionAttentions.length > 0 ? `
    <div class="section-title">PARTICIPACIONES</div>
    <table>
        <thead>
            <tr>
                <th>Fecha Atención</th>
                <th>RUT Paciente</th>
                <th>Previsión</th>
                <th>Código Prestación</th>
                <th>Nombre</th>
                <th>Horario</th>
                <th class="amount">Bruto</th>
                <th class="center">%</th>
                <th class="amount">Monto Participación</th>
                <th class="amount">Comisión</th>
            </tr>
        </thead>
        <tbody>
            ${data.participacionAttentions.map(att => `
            <tr>
                <td>${formatDate(att.attentionDate)}</td>
                <td><span class="rut-number">${att.patientRut || ''}</span></td>
                <td>${att.providerType || ''}</td>
                <td>${att.serviceCode || ''}</td>
                <td>${att.serviceName || ''}</td>
                <td>HABIL</td>
                <td class="amount">${formatCurrency(parseFloat(att.baseAmount || '0'))}</td>
                <td class="center"><span class="percentage">${att.participationPercentage || '0'}%</span></td>
                <td class="amount">${formatCurrency(parseFloat(att.participatedAmount))}</td>
                <td class="amount">${formatCurrency(parseFloat(att.commissionAmount || '0'))}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    ` : `
    <div class="section-title">PARTICIPACIONES</div>
    <div class="table-header">
        Fecha Atención&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RUT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Paciente&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Previsión&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Código Prestación&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Nombre&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Horario&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bruto&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Monto Participación&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Comisión
    </div>
    <div class="no-data">No se encontraron datos</div>
    `}

    ${data.hmqAttentions.length > 0 ? `
    <div class="section-title">HMQ</div>
    <table>
        <thead>
            <tr>
                <th>Fecha Atención</th>
                <th>RUT Paciente</th>
                <th>Previsión</th>
                <th>Código Prestación</th>
                <th>Nombre</th>
                <th>Horario</th>
                <th class="amount">Bruto</th>
                <th class="center">%</th>
                <th class="amount">Monto Participación</th>
                <th class="amount">Comisión</th>
            </tr>
        </thead>
        <tbody>
            ${data.hmqAttentions.map(att => `
            <tr>
                <td>${formatDate(att.attentionDate)}</td>
                <td><span class="rut-number">${att.patientRut || ''}</span></td>
                <td>${att.providerType || ''}</td>
                <td>${att.serviceCode || ''}</td>
                <td>${att.serviceName || ''}</td>
                <td>HABIL</td>
                <td class="amount">${formatCurrency(parseFloat(att.baseAmount || '0'))}</td>
                <td class="center"><span class="percentage">${att.participationPercentage || '0'}%</span></td>
                <td class="amount">${formatCurrency(parseFloat(att.participatedAmount))}</td>
                <td class="amount">${formatCurrency(parseFloat(att.commissionAmount || '0'))}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    ` : ''}

    <div class="totals">
        ${data.participacionTotal > 0 ? `
        <div class="total-row">
            <span class="total-label">TOTAL PARTICIPACIONES:</span>
            <span class="total-amount">$${formatCurrency(data.participacionTotal)}</span>
        </div>` : ''}
        ${data.hmqTotal > 0 ? `
        <div class="total-row">
            <span class="total-label">TOTAL HMQ:</span>
            <span class="total-amount">$${formatCurrency(data.hmqTotal)}</span>
        </div>` : ''}
        <div class="total-row">
            <span class="total-label">${data.participacionTotal > 0 && data.hmqTotal > 0 ? 'TOTAL GENERAL:' : data.participacionTotal > 0 ? 'TOTAL PARTICIPACIONES:' : 'TOTAL HMQ:'}</span>
            <span class="total-amount">$${formatCurrency(data.totalAmount)}</span>
        </div>
    </div>

    <div class="footer">
        <strong>Portal de Pagos Médicos</strong> - Sistema de Liquidaciones<br>
        Generado el ${new Date().toLocaleString('es-CL')}<br>
        Período: ${monthNames[data.month - 1]} ${data.year}
    </div>
    </div>
</body>
</html>`;

  // For now, generate a simple PDF using pure HTML until we can install proper PDF library
  // Save HTML temporarily and return the HTML as a file download
  const pdfId = `${data.doctorId}_${data.month}_${data.year}_${Date.now()}`;
  const htmlFilePath = join(TEMP_DIR, `${pdfId}.html`);
  
  writeFileSync(htmlFilePath, html);
  
  // Read the HTML file as buffer to simulate PDF for now
  const htmlBuffer = readFileSync(htmlFilePath);
  
  return htmlBuffer;
}

// Función para generar PDFs profesionales de manuales
export async function generateManualPDF(manualType: 'sistema' | 'tecnico'): Promise<Buffer> {
  const fileName = manualType === 'sistema' ? 'MANUAL_DE_SISTEMA.md' : 'MANUAL_TECNICO.md';
  const title = manualType === 'sistema' ? 'MANUAL DE SISTEMA' : 'MANUAL TÉCNICO';
  
  // Leer el archivo Markdown
  const markdownContent = readFileSync(fileName, 'utf-8');
  const currentDate = new Date().toLocaleDateString('es-CL');
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        info: {
          Title: `${title} - Portal de Pagos Médicos`,
          Author: 'Portal de Pagos Médicos - Chile',
          Subject: 'Documentación Sistema Médico',
          Keywords: 'manual, sistema, pagos, medicos, chile, inapi'
        }
      });
      
      let pageNumber = 1;
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // PÁGINA DE PORTADA
      createCoverPage(doc, title, currentDate);
      doc.addPage();
      pageNumber++;
      
      // ÍNDICE DE CONTENIDO
      createTableOfContents(doc, markdownContent);
      doc.addPage();
      pageNumber++;
      
      // CONTENIDO PRINCIPAL
      if (manualType === 'sistema') {
        pageNumber = generateSystemManualContent(doc, pageNumber);
      } else {
        pageNumber = generateTechnicalManualContent(doc, pageNumber);
      }
      
      // PIE DE PÁGINA EN TODAS LAS PÁGINAS
      addPageNumbers(doc);
      
      doc.end();
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      reject(error);
    }
  });
}

// Crear página de portada profesional
function createCoverPage(doc: PDFKit.PDFDocument, title: string, currentDate: string) {
  // Header con gradiente visual
  doc.rect(0, 0, doc.page.width, 200)
     .fill('#1e3a8a');
  
  // Título principal
  doc.fontSize(36)
     .fillColor('white')
     .text(title, 72, 80, { align: 'center', width: doc.page.width - 144 });
  
  // Subtítulo
  doc.fontSize(20)
     .text('Portal de Pagos Médicos', 72, 140, { align: 'center', width: doc.page.width - 144 });
  
  // Información del documento
  doc.fillColor('#1e3a8a')
     .fontSize(14)
     .text('INFORMACIÓN DEL DOCUMENTO', 72, 250, { underline: true });
  
  doc.fillColor('black')
     .fontSize(12)
     .text(`Versión: 1.0`, 72, 280)
     .text(`Fecha de Generación: ${currentDate}`, 72, 300)
     .text('País: Chile', 72, 320)
     .text('Sistema: Portal de Pagos Médicos', 72, 340)
     .text('Destinatario: INAPI Chile', 72, 360);
  
  // Sección de confidencialidad
  doc.rect(72, 420, doc.page.width - 144, 120)
     .stroke('#e2e8f0')
     .fillAndStroke('#f8fafc', '#e2e8f0');
  
  doc.fillColor('#dc2626')
     .fontSize(14)
     .text('CONFIDENCIAL', 90, 440, { underline: true });
  
  doc.fillColor('#374151')
     .fontSize(11)
     .text('Este documento contiene información de propiedad intelectual ', 90, 465)
     .text('destinada exclusivamente para registro ante el Instituto Nacional', 90, 480)
     .text('de Propiedad Industrial (INAPI) de Chile.', 90, 495)
     .text('Prohibida su reproducción sin autorización expresa.', 90, 515);
  
  // Footer de portada
  doc.fillColor('#6b7280')
     .fontSize(10)
     .text('Portal de Pagos Médicos - Sistema Integral de Liquidaciones Médicas', 72, 700, {
       align: 'center',
       width: doc.page.width - 144
     });
}

// Crear índice de contenidos
function createTableOfContents(doc: PDFKit.PDFDocument, markdownContent: string) {
  doc.fontSize(24)
     .fillColor('#1e3a8a')
     .text('ÍNDICE DE CONTENIDOS', 72, 100, { underline: true });
  
  let yPosition = 150;
  const lines = markdownContent.split('\n');
  let sectionNumber = 1;
  let subsectionNumber = 1;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('## ')) {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 100;
      }
      
      const sectionTitle = trimmed.substring(3);
      doc.fontSize(12)
         .fillColor('#1e40af')
         .text(`${sectionNumber}. ${sectionTitle}`, 72, yPosition);
      
      yPosition += 20;
      sectionNumber++;
      subsectionNumber = 1;
    }
    
    if (trimmed.startsWith('### ')) {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 100;
      }
      
      const subsectionTitle = trimmed.substring(4);
      doc.fontSize(11)
         .fillColor('#374151')
         .text(`    ${sectionNumber - 1}.${subsectionNumber} ${subsectionTitle}`, 90, yPosition);
      
      yPosition += 18;
      subsectionNumber++;
    }
  });
}

// Generar contenido del manual de sistema con pantallas detalladas
function generateSystemManualContent(doc: PDFKit.PDFDocument, pageNumber: number): number {
  // Introducción
  addSectionHeader(doc, '1. INTRODUCCIÓN AL SISTEMA');
  
  addParagraph(doc, 'El Portal de Pagos Médicos es una solución integral desarrollada específicamente para el sistema de salud chileno. Este sistema automatiza completamente el proceso de cálculo y liquidación de honorarios médicos, adaptándose a la complejidad del marco regulatorio nacional.');
  
  addParagraph(doc, 'CARACTERÍSTICAS PRINCIPALES:');
  addBulletPoint(doc, 'Gestión completa de profesionales médicos y especialidades');
  addBulletPoint(doc, 'Cálculo automático de participaciones según normativa chilena');
  addBulletPoint(doc, 'Integración con FONASA, ISAPREs y previsión particular');
  addBulletPoint(doc, 'Sistema de nómina bancaria para transferencias automáticas');
  addBulletPoint(doc, 'Reportes contables compatibles con software chileno');
  addBulletPoint(doc, 'Asistente de IA especializado en terminología médica nacional');
  
  doc.addPage();
  pageNumber++;
  
  // PANTALLAS DEL SISTEMA
  addSectionHeader(doc, '2. PANTALLAS PRINCIPALES DEL SISTEMA');
  
  addSubsectionHeader(doc, '2.1 Pantalla de Acceso/Login');
  addScreenDescription(doc, 'PANTALLA DE ACCESO AL SISTEMA', [
    'ELEMENTO VISUAL: Logo institucional "Pagos Médicos Chile" centrado en la parte superior',
    'TÍTULO PRINCIPAL: "Portal Pagos Médicos" con subtítulo "Chile" en azul',
    'CAMPO RUT: Input con placeholder "12345678-9" y etiqueta "RUT sin puntos con guión"',
    'CAMPO CONTRASEÑA: Input con botón mostrar/ocultar contraseña',
    'BOTÓN PRINCIPAL: "🔒 Iniciar Sesión" en azul, ancho completo',
    'ENLACE: "¿Olvidó mi clave?" alineado a la derecha',
    'SECCIÓN DESARROLLO: 3 botones para perfiles de prueba',
    '  - Administrador - Dr. María González',
    '  - Supervisor - Dr. Carlos Rodríguez', 
    '  - Médico - Dra. Ana López',
    'ACCESO PROFESIONAL: Botón verde "Acceso Profesional (RUT/Contraseña)"',
    'FONDO: Imagen médica con overlay oscuro',
    'MENSAJE: "Desconectado con éxito" en la parte inferior'
  ]);

  addParagraph(doc, 'FUNCIONALIDAD E INNOVACIÓN:');
  addBulletPoint(doc, 'VALIDACIÓN RUT CHILENO: Implementa algoritmo módulo 11 propietario para validar formato estándar chileno XX.XXX.XXX-Y, rechazando automáticamente RUTs malformados o con dígito verificador incorrecto.');
  addBulletPoint(doc, 'AUTENTICACIÓN MULTI-NIVEL: Sistema de roles diferenciados que redirige automáticamente según perfil (Administrador → panel completo, Supervisor → módulos limitados, Médico → dashboard personal).');
  addBulletPoint(doc, 'MODO DESARROLLO INTEGRADO: Perfiles de prueba pre-configurados que permiten testing completo sin afectar datos productivos, manteniendo trazabilidad de sesiones de desarrollo.');
  addBulletPoint(doc, 'SEGURIDAD VISUAL: Toggle de visibilidad de contraseña con estados seguros que previene shoulder surfing manteniendo experiencia de usuario.');
  addBulletPoint(doc, 'RECUPERACIÓN AUTOMÁTICA: Sistema de gestión de sesiones perdidas con redirección inteligente y mantenimiento de estado de trabajo previo.');
  
  doc.addPage();
  pageNumber++;
  
  addSubsectionHeader(doc, '2.2 Dashboard Principal (Panel de Control)');
  addScreenDescription(doc, 'PANEL DE CONTROL - VISTA ADMINISTRADOR', [
    'ENCABEZADO: "Panel de Control" con descripción "Resumen general del sistema"',
    'TARJETAS ESTADÍSTICAS (fila superior):',
    '  - Tarjeta Verde: Ícono CheckCircle + Número "Reglas Activas"',
    '  - Tarjeta Naranja: Ícono Clock + Número "En Revisión"', 
    '  - Tarjeta Roja: Ícono AlertTriangle + Número "Vencidas"',
    '  - Tarjeta Azul: Ícono TrendingUp + "1,247 Cálculos Este Mes"',
    'SECCIÓN IZQUIERDA: "Resumen del Sistema"',
    '  - Médicos Registrados: Badge con contador dinámico',
    '  - Especialidades: Badge con total de especialidades activas',
    '  - Prestaciones: Badge con servicios médicos disponibles',
    '  - Reglas de Cálculo: Badge con total de reglas configuradas',
    'SECCIÓN DERECHA: "Actividad Reciente"',
    '  - Indicadores de colores: verde, azul, naranja, púrpura',
    '  - Mensajes de actividad: "Nueva regla creada", "Médico actualizado"',
    'SECCIÓN INFERIOR: "Acciones Rápidas"',
    '  - 4 botones: Crear Nueva Regla, Registrar Médico, Ver Reportes, Configuración'
  ]);

  addParagraph(doc, 'FUNCIONALIDAD E INNOVACIÓN:');
  addBulletPoint(doc, 'MÉTRICAS EN TIEMPO REAL: Dashboard actualiza automáticamente contadores de reglas activas/vencidas mediante queries optimizadas que analizan fechas de vigencia y estado de activación.');
  addBulletPoint(doc, 'DIFERENCIACIÓN POR ROLES: Interfaz adaptativa que muestra diferentes módulos según permisos (Administrador ve todo, Supervisor módulos limitados, Médico solo dashboard personal).');
  addBulletPoint(doc, 'ACTIVIDAD CENTRALIZADA: Feed de eventos del sistema que rastrea cambios críticos (creación de reglas, actualizaciones de médicos, vencimientos) con códigos de color para priorización visual.');
  addBulletPoint(doc, 'ACCIONES CONTEXTUALES: Botones de acceso rápido que redirigen dinámicamente a funciones más utilizadas según el perfil del usuario y estadísticas de uso.');
  addBulletPoint(doc, 'CÁLCULOS AGREGADOS: Procesamiento automático de estadísticas mensuales de cálculos realizados, mostrando tendencias y volúmenes de trabajo del sistema.');
  
  doc.addPage();
  pageNumber++;
  
  addSubsectionHeader(doc, '2.3 Gestión de Médicos');
  addScreenDescription(doc, 'PANTALLA CONFIGURACIÓN MÉDICOS', [
    'ENCABEZADO: "Configuración Médicos" + botón azul "+ Nuevo Médico"',
    'DESCRIPCIÓN: "Gestiona la información de los profesionales médicos"',
    'CARD FILTROS: "Filtros de Búsqueda"',
    '  - Campo búsqueda con ícono Search',
    '  - Dropdown "Filtrar por Especialidad"',
    '  - Botón "Buscar"',
    'TABLA PRINCIPAL (columnas):',
    '  - RUT (formato chileno con guión)',
    '  - Nombre Completo',
    '  - Especialidad (badge)',
    '  - Email',
    '  - Tipo (Individual/Sociedad)',
    '  - Acciones: Botones Editar (azul) y Eliminar (rojo)',
    'MODAL CREAR/EDITAR MÉDICO:',
    '  - Título: "Crear Nuevo Médico" o "Editar Médico"',
    '  - Campos en grilla 2 columnas:',
    '    * RUT (requerido)',
    '    * Nombre Completo (requerido)',
    '    * Email y Teléfono',
    '    * Especialidad (dropdown)',
    '    * Tipo HMQ',
    '    * Estación/Departamento',
    '    * Tipo Sociedad (Individual/Sociedad)',
    '    * Tipo de Pago (Transferencia/Cheque/Depósito)',
    '  - Sección Información Bancaria:',
    '    * Banco, Número de Cuenta',
    '    * Titular Cuenta, RUT Titular',
    '  - Botones: "Cancelar" (gris) y "Crear"/"Actualizar" (azul)'
  ]);
  
  doc.addPage();
  pageNumber++;
  
  addSubsectionHeader(doc, '2.4 Calcular Pagos');
  addScreenDescription(doc, 'PANTALLA CALCULAR PAGOS', [
    'ENCABEZADO: Ícono Calculator + "Calcular Pagos"',
    'DESCRIPCIÓN: "Analiza la producción médica y calcula pagos por participaciones"',
    'LAYOUT: 3 columnas - Filtros (izq) + Resultados (centro-derecha)',
    'PANEL FILTROS:',
    '  - Título: "Filtros de Búsqueda"',
    '  - Dropdown "Doctor/Profesional" con "Todos los médicos"',
    '  - Campos fecha: "Fecha Desde" y "Fecha Hasta"',
    '  - Checkboxes:',
    '    * ✓ Registros Participaciones',
    '    * ✓ Registros HMQ',
    '  - Botón azul: "Analizar Producción"',
    'PANEL RESULTADOS:',
    '  - Card "Resumen de Producción":',
    '    * 4 métricas en tarjetas de colores:',
    '      - Azul: Total Atenciones',
    '      - Verde: Participaciones', 
    '      - Púrpura: Registros HMQ',
    '      - Naranja: Monto Total (formato $CLP)',
    '    * Promedio por atención en fondo gris',
    '  - Card "Atenciones Pendientes de Cálculo":',
    '    * Tabla con columnas:',
    '      - Paciente (nombre + RUT)',
    '      - Fecha (dd/mm/yyyy)',
    '      - Servicio',
    '      - Tipo (badge Participación/HMQ)',
    '      - Monto (formato moneda chilena)',
    '    * Mensaje "Y X atenciones más..."',
    '    * Botón central "Calcular Pagos (X atenciones)"',
    'ESTADO SIN DATOS:',
    '  - Ícono AlertCircle grande',
    '  - Título "Sin datos para el período seleccionado"',
    '  - Sugerencias de verificación'
  ]);
  
  doc.addPage();
  pageNumber++;
  
  addSubsectionHeader(doc, '2.5 Nómina Bancaria');
  addScreenDescription(doc, 'PANTALLA NÓMINA BANCARIA', [
    'ENCABEZADO: Ícono Banknote + "Nómina Bancaria"',
    'DESCRIPCIÓN: "Genera archivos de transferencias bancarias"',
    'CARD CONFIGURACIÓN:',
    '  - Título "Configuración de Nómina Bancaria"',
    '  - 4 campos en línea:',
    '    * Dropdown "Mes" (Enero-Diciembre)',
    '    * Campo "Año" (numérico)',
    '    * Dropdown "Formato Bancario":',
    '      - Banco Santander',
    '      - Banco BCI',
    '      - Banco de Chile',
    '      - BancoEstado',
    '      - Formato Universal',
    '    * Botón verde "Generar Nómina"',
    '  - Campo "Notas Adicionales" (textarea)',
    'RESUMEN GENERADO:',
    '  - 3 tarjetas estadísticas:',
    '    * Total Transferencias (ícono FileText)',
    '    * Monto Total (ícono DollarSign, formato CLP)',
    '    * Formato (ícono Building, nombre banco)',
    'SELECCIÓN TRANSFERENCIAS:',
    '  - Checkbox "Seleccionar todas" + contador',
    '  - Lista de transferencias con:',
    '    * Checkbox individual',
    '    * Nombre médico + RUT',
    '    * Información sociedad (si aplica)', 
    '    * Email',
    '    * Monto en verde',
    '    * Detalles bancarios en grilla:',
    '      - Banco, Cuenta, Tipo Cuenta, Referencia',
    'GENERACIÓN ARCHIVO:',
    '  - Card "Generar Archivo Bancario"',
    '  - Botón verde "Descargar Archivo (X transferencias)"'
  ]);
  
  doc.addPage();
  pageNumber++;
  
  // Módulo de Maestros
  addSectionHeader(doc, '3. FUNCIONALIDADES POR MÓDULO');
  
  addSubsectionHeader(doc, '3.1 Gestión de Médicos');
  addParagraph(doc, 'El sistema permite registrar profesionales médicos con toda la información requerida por la legislación chilena:');
  
  addBulletPoint(doc, 'RUT chileno con validación de dígito verificador');
  addBulletPoint(doc, 'Registro profesional y especialidades certificadas');
  addBulletPoint(doc, 'Tipo de participación: Individual o Sociedad Médica');
  addBulletPoint(doc, 'Datos bancarios para transferencias electrónicas');
  addBulletPoint(doc, 'Configuración de porcentajes de participación personalizados');
  
  addSubsectionHeader(doc, '3.2 Motor de Cálculo');
  addParagraph(doc, 'El corazón del sistema es su motor de cálculo adaptativo que procesa automáticamente:');
  
  addBulletPoint(doc, 'Aplicación de reglas según especialidad médica');
  addBulletPoint(doc, 'Cálculo de participaciones por porcentaje');
  addBulletPoint(doc, 'Procesamiento de HMQ con montos fijos');
  addBulletPoint(doc, 'Validación de topes y rangos según normativa');
  addBulletPoint(doc, 'Generación automática de comprobantes');
  
  addSubsectionHeader(doc, '3.3 Tipos de Previsión');
  addParagraph(doc, 'Integración completa con el sistema previsional chileno:');
  
  addBulletPoint(doc, 'FONASA Tramo A: Población más vulnerable, copago 0%');
  addBulletPoint(doc, 'FONASA Tramo B: Ingresos bajos, copago reducido');
  addBulletPoint(doc, 'FONASA Tramo C: Ingresos medios, copago intermedio');
  addBulletPoint(doc, 'FONASA Tramo D: Ingresos altos, copago máximo');
  addBulletPoint(doc, 'ISAPREs: Instituciones de Salud Previsional privadas');
  addBulletPoint(doc, 'Particulares: Pacientes sin previsión específica');
  
  doc.addPage();
  pageNumber++;
  
  // Contabilidad y Tesorería
  addSectionHeader(doc, '4. CONTABILIDAD Y TESORERÍA');
  
  addSubsectionHeader(doc, '4.1 Exportación Contable');
  addParagraph(doc, 'Genera asientos contables automáticos compatibles con principales software chilenos:');
  
  addBulletPoint(doc, 'Cuenta 5110001: Honorarios Médicos Profesionales (Debe)');
  addBulletPoint(doc, 'Cuenta 1110001: Banco Cuenta Corriente (Haber)');
  addBulletPoint(doc, 'Formatos: CSV, Excel, TXT para importación directa');
  addBulletPoint(doc, 'Validación automática de balance contable');
  addBulletPoint(doc, 'Trazabilidad completa de transacciones');
  
  addSubsectionHeader(doc, '4.2 Nómina Bancaria');
  addParagraph(doc, 'Integración directa con formatos de principales bancos chilenos:');
  
  addBulletPoint(doc, 'Banco Santander: Formato específico para transferencias masivas');
  addBulletPoint(doc, 'Banco BCI: Estructura de archivo para nómina empresarial');
  addBulletPoint(doc, 'Banco de Chile: Formato estándar para pagos múltiples');
  addBulletPoint(doc, 'BancoEstado: Archivo compatible con plataforma estatal');
  addBulletPoint(doc, 'Formato Universal: Compatible con otros bancos');
  
  doc.addPage();
  pageNumber++;
  
  // Casos de Uso Prácticos
  addSectionHeader(doc, '5. CASOS DE USO CON PANTALLAS');
  
  addSubsectionHeader(doc, '5.1 Caso: Registro de Nuevo Médico');
  addParagraph(doc, 'FLUJO PASO A PASO CON PANTALLAS:');
  addBulletPoint(doc, '1. ACCESO: Login como Administrador usando pantalla de acceso');
  addBulletPoint(doc, '2. NAVEGACIÓN: Desde dashboard → menú "Maestros" → "Médicos"');
  addBulletPoint(doc, '3. PANTALLA: Se carga "Configuración Médicos" con tabla existente');
  addBulletPoint(doc, '4. ACCIÓN: Click botón azul "+ Nuevo Médico" (esquina superior)');
  addBulletPoint(doc, '5. MODAL: Se abre formulario "Crear Nuevo Médico"');
  addBulletPoint(doc, '6. DATOS: Completar RUT (validado), nombre, email, especialidad');
  addBulletPoint(doc, '7. TIPO: Seleccionar "Individual" o "Sociedad" en dropdown');
  addBulletPoint(doc, '8. BANCO: Llenar información bancaria en sección inferior');
  addBulletPoint(doc, '9. GUARDAR: Click "Crear" → modal se cierra → tabla se actualiza');

  addParagraph(doc, 'VALOR FUNCIONAL DE ESTE PROCESO:');
  addBulletPoint(doc, 'VALIDACIÓN INTEGRAL: Sistema valida automáticamente formato RUT chileno, existencia de especialidad, y completitud de datos bancarios obligatorios.');
  addBulletPoint(doc, 'INTEGRIDAD REFERENCIAL: Evita duplicación de médicos y mantiene consistencia con tabla de especialidades y sociedades médicas registradas.');
  addBulletPoint(doc, 'CONFIGURACIÓN AUTOMÁTICA: Pre-llena campos de sociedad médica y calcula automáticamente parámetros de pago según tipo seleccionado (Individual vs Sociedad).');
  addBulletPoint(doc, 'TRAZABILIDAD COMPLETA: Registra timestamp de creación, usuario creador, y mantiene histórico de modificaciones para auditoría.');
  
  addSubsectionHeader(doc, '5.2 Caso: Cálculo de Pagos Mensual');
  addParagraph(doc, 'FLUJO COMPLETO CON PANTALLAS:');
  addBulletPoint(doc, '1. ACCESO: Desde dashboard → "Sistema de Pagos" → "Calcular Pagos"');
  addBulletPoint(doc, '2. FILTROS: En panel izquierdo configurar:');
  addBulletPoint(doc, '   - Doctor: "Todos los médicos" o seleccionar uno específico');
  addBulletPoint(doc, '   - Fechas: "01/08/2025" hasta "31/08/2025"');
  addBulletPoint(doc, '   - Tipos: Ambos checkboxes marcados');
  addBulletPoint(doc, '3. ANÁLISIS: Click "Analizar Producción" → panel derecho se llena');
  addBulletPoint(doc, '4. REVISIÓN: Verificar "Resumen de Producción" con 4 métricas');
  addBulletPoint(doc, '5. DETALLE: Revisar tabla "Atenciones Pendientes" con datos');
  addBulletPoint(doc, '6. CÁLCULO: Click botón central "Calcular Pagos (X atenciones)"');
  addBulletPoint(doc, '7. RESULTADO: Sistema procesa y muestra confirmación de éxito');

  addParagraph(doc, 'VALOR FUNCIONAL DE ESTE PROCESO:');
  addBulletPoint(doc, 'ALGORITMO DE SELECCIÓN: Motor inteligente que aplica reglas de cálculo más específicas primero, garantizando máxima precisión en cálculos de participaciones.');
  addBulletPoint(doc, 'PROCESAMIENTO MASIVO: Capacidad de procesar múltiples atenciones simultáneamente aplicando diferentes reglas según especialidad y tipo de prestación.');
  addBulletPoint(doc, 'VALIDACIÓN DE NEGOCIO: Aplica automáticamente topes máximos, porcentajes permitidos, y comisiones según normativa chilena de salud.');
  addBulletPoint(doc, 'GENERACIÓN DE RESPALDOS: Crea registros de cálculo con trazabilidad completa, permitiendo auditorías posteriores y re-cálculos si es necesario.');
  
  doc.addPage();
  pageNumber++;
  
  addSubsectionHeader(doc, '5.3 Gestión de Especialidades y Prestaciones');
  addParagraph(doc, 'FUNCIONALIDAD CLAVE DEL SISTEMA:');
  addBulletPoint(doc, 'CATÁLOGO DINÁMICO: Sistema mantiene actualizado automáticamente el código de prestaciones médicas según nomenclatura oficial chilena (FONASA/ISAPREs).');
  addBulletPoint(doc, 'VALIDACIÓN CRUZADA: Verifica automáticamente que especialidades médicas coincidan con prestaciones permitidas según regulaciones del MINSAL.');
  addBulletPoint(doc, 'HISTORIZACIÓN DE CAMBIOS: Mantiene versiones históricas de códigos y tarifas para garantizar cálculos correctos de períodos anteriores.');
  addBulletPoint(doc, 'INTEGRACIÓN NORMATIVA: Actualiza automáticamente tarifas y códigos según boletines oficiales del sistema de salud chileno.');

  addSubsectionHeader(doc, '5.4 Sistema de Importación Inteligente');
  addParagraph(doc, 'INNOVACIÓN TÉCNICA PATENTABLE:');
  addBulletPoint(doc, 'AUTO-CREACIÓN DE ENTIDADES: Durante importación masiva CSV, sistema detecta automáticamente médicos y servicios faltantes, los crea dinámicamente manteniendo integridad referencial.');
  addBulletPoint(doc, 'VALIDACIÓN EN TIEMPO REAL: Procesa miles de registros simultáneamente aplicando validaciones específicas del sistema médico chileno (RUT, códigos FONASA, especialidades).');
  addBulletPoint(doc, 'MAPPEO INTELIGENTE: Algoritmo propietario que identifica equivalencias entre códigos de sistemas externos (HIS hospitalarios) y nomenclatura interna.');
  addBulletPoint(doc, 'RECUPERACIÓN DE ERRORES: Sistema de rollback automático que deshace importaciones fallidas manteniendo consistencia de base de datos.');
  addBulletPoint(doc, 'MÚLTIPLES FUENTES: Capacidad de importar desde CSV, APIs externas, y sistemas HIS hospitalarios con formatos unificados.');

  addSubsectionHeader(doc, '5.5 Generación de Documentos Profesionales');
  addParagraph(doc, 'SISTEMA DE REPORTES ADAPTATIVOS:');
  addBulletPoint(doc, 'PDF DINÁMICOS: Genera cartolas de pago que muestran automáticamente solo secciones relevantes (Participaciones, HMQ, o ambas) según datos disponibles.');
  addBulletPoint(doc, 'DISEÑO PROFESIONAL: Aplica automáticamente estilo corporativo chileno con gradientes, tipografía médica, y elementos visuales de identificación institucional.');
  addBulletPoint(doc, 'DATOS EN VIVO: Conecta directamente con base de datos para mostrar información actualizada sin necesidad de exportar/importar datos.');
  addBulletPoint(doc, 'COMPROBANTES OFICIALES: Genera documentos con numeración correlativa y trazabilidad completa para auditorías contables.');
  addBulletPoint(doc, 'FORMATOS BANCARIOS: Produce archivos de nómina compatible con todos los bancos chilenos (Santander, BCI, Chile, Estado).');

  // Innovaciones y Ventajas Competitivas
  addSectionHeader(doc, '6. INNOVACIONES PATENTABLES');
  
  addParagraph(doc, 'El sistema incorpora tres innovaciones principales susceptibles de protección intelectual:');
  
  addSubsectionHeader(doc, '6.1 Motor de Cálculo Adaptativo');
  addParagraph(doc, 'Algoritmo propietario que selecciona automáticamente las reglas de cálculo más específicas según criterios jerárquicos. Esta innovación elimina la necesidad de configuración manual compleja.');
  
  addSubsectionHeader(doc, '6.2 Sistema de Importación Inteligente');
  addParagraph(doc, 'Tecnología que auto-crea entidades faltantes durante importación masiva, manteniendo integridad referencial. Reduce significativamente errores de carga de datos.');
  
  addSubsectionHeader(doc, '6.3 Generación Adaptativa de Documentos');
  addParagraph(doc, 'Sistema que genera documentos PDF dinámicos mostrando solo secciones relevantes según tipo de datos disponibles. Optimiza presentación de información.');
  
  return pageNumber;
}

// Generar contenido del manual técnico con más detalle
function generateTechnicalManualContent(doc: PDFKit.PDFDocument, pageNumber: number): number {
  // Arquitectura del Sistema
  addSectionHeader(doc, '1. ARQUITECTURA TÉCNICA DETALLADA');
  
  addSubsectionHeader(doc, '1.1 Patrón Arquitectónico 3-Tier');
  addParagraph(doc, 'El sistema implementa una arquitectura de tres capas completamente separadas:');
  
  addBulletPoint(doc, 'CAPA DE PRESENTACIÓN: React 18.x + TypeScript para interfaz de usuario');
  addBulletPoint(doc, 'CAPA DE LÓGICA: Node.js + Express.js para procesamiento de negocio');
  addBulletPoint(doc, 'CAPA DE DATOS: PostgreSQL + Drizzle ORM para persistencia');
  
  addParagraph(doc, 'Esta separación permite:');
  addBulletPoint(doc, 'Escalabilidad horizontal independiente por capa');
  addBulletPoint(doc, 'Mantenimiento sin afectar otras capas');
  addBulletPoint(doc, 'Testing unitario aislado por responsabilidad');
  addBulletPoint(doc, 'Deployment independiente de componentes');
  
  doc.addPage();
  pageNumber++;
  
  // Stack Tecnológico Detallado
  addSectionHeader(doc, '2. STACK TECNOLÓGICO COMPLETO');
  
  addSubsectionHeader(doc, '2.1 Frontend Technologies Stack');
  addCodeBlock(doc, `
// Core Framework
React: 18.3.1 (Library para UI)
TypeScript: 5.6.3 (Tipado estático)
Vite: 5.4.19 (Build tool y dev server)

// State Management
TanStack React Query: 5.60.5 (Server state)
React Hook Form: 7.55.0 (Form management)
Zod: 3.24.2 (Runtime validation)

// UI Component System
shadcn/ui: Component library
Radix UI: Accessible primitives
Tailwind CSS: 3.4.17 (Utility-first CSS)
Lucide React: 0.453.0 (Icon system)
  `);
  
  addSubsectionHeader(doc, '2.2 Backend Technologies Stack');
  addCodeBlock(doc, `
// Runtime y Framework
Node.js: 20.x LTS (JavaScript runtime)
Express.js: 4.21.2 (Web framework)
TypeScript: 5.6.3 (Type safety)

// Database Layer
PostgreSQL: 15.x (Relational database)
Drizzle ORM: 0.39.1 (Type-safe ORM)
Drizzle Kit: 0.30.4 (Schema management)
@neondatabase/serverless: 0.10.4 (Connection)

// Authentication & Security
OpenID Connect: Auth protocol
Passport.js: 0.7.0 (Auth middleware)
Express Session: 1.18.1 (Session management)
  `);
  
  doc.addPage();
  pageNumber++;
  
  // Base de Datos Detallada
  addSectionHeader(doc, '3. DISEÑO DE BASE DE DATOS');
  
  addSubsectionHeader(doc, '3.1 Modelo Entidad-Relación Completo');
  addParagraph(doc, 'El sistema maneja 15 entidades principales con más de 50 campos específicos del dominio médico chileno:');
  
  addCodeBlock(doc, `
-- Entidades Principales
USERS: Gestión de usuarios y roles
DOCTORS: Profesionales médicos
MEDICAL_SOCIETIES: Sociedades médicas
SPECIALTIES: Especialidades médicas
SERVICES: Prestaciones médicas
CALCULATION_RULES: Reglas de cálculo
PROVIDER_TYPES: Tipos de previsión
SERVICE_TARIFFS: Tarifas por prestación
MEDICAL_ATTENTIONS: Atenciones médicas
PAYMENT_CALCULATIONS: Cálculos de pago
PAYMENTS: Pagos procesados
  `);
  
  addSubsectionHeader(doc, '3.2 Índices de Performance');
  addParagraph(doc, 'Optimización para consultas frecuentes:');
  
  addCodeBlock(doc, `
-- Índices Principales
CREATE INDEX idx_doctors_rut ON doctors(rut);
CREATE INDEX idx_attentions_doctor_date 
  ON medical_attentions(doctor_id, attention_date);
CREATE INDEX idx_calculations_attention 
  ON payment_calculations(medical_attention_id);
CREATE INDEX idx_payments_doctor_date 
  ON payments(doctor_id, payment_date);

-- Índices Compuestos para Consultas Complejas
CREATE INDEX idx_service_tariffs_composite 
  ON service_tariffs(service_id, provider_type_id, effective_date);
  `);
  
  doc.addPage();
  pageNumber++;
  
  // APIs REST Detalladas
  addSectionHeader(doc, '4. ESPECIFICACIÓN API REST');
  
  addSubsectionHeader(doc, '4.1 Arquitectura de APIs');
  addParagraph(doc, 'Diseño RESTful con documentación completa:');
  
  addBulletPoint(doc, 'Protocolo: HTTP/HTTPS con TLS 1.3');
  addBulletPoint(doc, 'Formato: JSON con schema validation');
  addBulletPoint(doc, 'Autenticación: Session-based + CSRF protection');
  addBulletPoint(doc, 'Rate Limiting: 1000 requests/min por usuario');
  addBulletPoint(doc, 'Versionado: Path-based /api/v1/');
  
  addSubsectionHeader(doc, '4.2 Endpoints Críticos de Negocio');
  addCodeBlock(doc, `
// Cálculo de Pagos (Endpoint Principal)
POST /api/calculate-payments
Content-Type: application/json
Body: {
  "month": 8,
  "year": 2025,
  "doctorIds": ["doc001", "doc002"],
  "includeHMQ": true,
  "includeParticipations": true
}

Response: {
  "calculations": [
    {
      "id": "calc001",
      "doctorId": "doc001", 
      "totalAmount": 2500000,
      "participationAmount": 1800000,
      "hmqAmount": 700000,
      "attentionsCount": 45
    }
  ],
  "summary": {
    "totalDoctors": 2,
    "totalAmount": 4500000,
    "calculationDate": "2025-08-07T10:30:00Z"
  }
}
  `);
  
  doc.addPage();
  pageNumber++;
  
  // Algoritmos Propietarios
  addSectionHeader(doc, '5. ALGORITMOS PROPIETARIOS');
  
  addSubsectionHeader(doc, '5.1 Motor de Cálculo de Participaciones');
  addParagraph(doc, 'Algoritmo central que procesa pagos médicos con lógica específica del sistema chileno:');
  
  addCodeBlock(doc, `
function calculateParticipation(
  attention: MedicalAttention,
  rules: CalculationRule[]
): PaymentCalculation {
  
  // 1. Selección de regla por prioridad jerárquica
  const priorities = [
    'doctor_and_service_specific',
    'doctor_and_specialty', 
    'service_and_provider',
    'doctor_only',
    'service_only',
    'specialty_only',
    'default_rule'
  ];
  
  // 2. Aplicación de regla más específica
  const applicableRule = findApplicableRule(
    attention, rules, priorities
  );
  
  // 3. Cálculo con validaciones de negocio
  const participatedAmount = 
    (attention.baseAmount * applicableRule.percentage) / 100;
  
  // 4. Aplicación de topes y comisiones
  const finalAmount = applyBusinessRules(
    participatedAmount, 
    applicableRule,
    attention.providerType
  );
  
  return createCalculationRecord(
    attention, applicableRule, finalAmount
  );
}
  `);
  
  addSubsectionHeader(doc, '5.2 Validación de RUT Chileno');
  addParagraph(doc, 'Implementación del algoritmo módulo 11 para validación de RUT:');
  
  addCodeBlock(doc, `
function validateChileanRUT(rut: string): boolean {
  // Limpieza y normalización
  const cleanRUT = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRUT.length < 8 || cleanRUT.length > 9) {
    return false;
  }
  
  // Separación de dígitos
  const digits = cleanRUT.slice(0, -1);
  const checkDigit = cleanRUT.slice(-1).toUpperCase();
  
  // Algoritmo módulo 11
  let sum = 0;
  let multiplier = 2;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const expectedDigit = remainder === 0 ? '0' : 
                       remainder === 1 ? 'K' : 
                       (11 - remainder).toString();
  
  return checkDigit === expectedDigit;
}
  `);
  
  doc.addPage();
  pageNumber++;
  
  // Integraciones Externas
  addSectionHeader(doc, '6. INTEGRACIONES EXTERNAS');
  
  addSubsectionHeader(doc, '6.1 Integración OpenAI GPT-4o');
  addParagraph(doc, 'Sistema de IA especializado en medicina chilena:');
  
  addCodeBlock(doc, `
const MEDICAL_AI_PROMPT = \`
Eres un asistente especializado en el sistema de pagos 
médicos chileno. Tienes conocimiento profundo sobre:

- Cálculos de participaciones médicas
- Sistema de salud chileno (FONASA tramos A/B/C/D)
- ISAPREs y seguros complementarios  
- Regulaciones médicas nacionales
- Procesos de liquidación hospitalaria
- Códigos GES y prestaciones médicas
- Terminología médica específica de Chile

Responde siempre en español chileno profesional
con explicaciones claras y precisas.
\`;

async function getChatResponse(message: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: MEDICAL_AI_PROMPT },
      { role: "user", content: message }
    ],
    max_tokens: 1500,
    temperature: 0.3  // Respuestas más precisas
  });
  
  return response.choices[0].message.content;
}
  `);
  
  return pageNumber;
}

// Funciones auxiliares para formatting
function addSectionHeader(doc: PDFKit.PDFDocument, title: string) {
  if (doc.y > 650) doc.addPage();
  
  doc.fontSize(16)
     .fillColor('#1e3a8a')
     .text(title, 72, doc.y, { underline: true });
  doc.moveDown(0.8);
}

function addSubsectionHeader(doc: PDFKit.PDFDocument, title: string) {
  if (doc.y > 680) doc.addPage();
  
  doc.fontSize(13)
     .fillColor('#2563eb')
     .text(title, 72, doc.y);
  doc.moveDown(0.5);
}

function addParagraph(doc: PDFKit.PDFDocument, text: string) {
  if (doc.y > 720) doc.addPage();
  
  doc.fontSize(11)
     .fillColor('#000000')
     .text(text, 72, doc.y, { 
       align: 'justify', 
       width: doc.page.width - 144,
       lineGap: 2
     });
  doc.moveDown(0.8);
}

function addBulletPoint(doc: PDFKit.PDFDocument, text: string) {
  if (doc.y > 720) doc.addPage();
  
  doc.fontSize(11)
     .fillColor('#000000')
     .text(`• ${text}`, 90, doc.y, { 
       width: doc.page.width - 162,
       lineGap: 1
     });
  doc.moveDown(0.4);
}

function addCodeBlock(doc: PDFKit.PDFDocument, code: string) {
  if (doc.y > 600) doc.addPage();
  
  // Background gris para el código
  const codeHeight = doc.heightOfString(code, { width: doc.page.width - 144 }) + 20;
  
  doc.rect(72, doc.y - 10, doc.page.width - 144, codeHeight)
     .fill('#f3f4f6');
  
  doc.fontSize(9)
     .fillColor('#1f2937')
     .font('Courier')
     .text(code.trim(), 82, doc.y, { 
       width: doc.page.width - 164,
       lineGap: 1
     });
  
  doc.font('Helvetica'); // Volver a fuente normal
  doc.moveDown(1);
}

function addScreenDescription(doc: PDFKit.PDFDocument, title: string, elements: string[]) {
  if (doc.y > 600) doc.addPage();
  
  // Título de pantalla en fondo azul
  doc.rect(72, doc.y - 10, doc.page.width - 144, 30)
     .fill('#3b82f6');
  
  doc.fontSize(12)
     .fillColor('white')
     .text(title, 82, doc.y - 5, { 
       width: doc.page.width - 164
     });
  
  doc.moveDown(1);
  
  // Lista de elementos de la pantalla
  elements.forEach(element => {
    if (doc.y > 720) doc.addPage();
    
    if (element.startsWith('  ')) {
      // Elemento indentado (sub-elemento)
      doc.fontSize(10)
         .fillColor('#374151')
         .text(element, 110, doc.y, { 
           width: doc.page.width - 182
         });
    } else {
      // Elemento principal
      doc.fontSize(10)
         .fillColor('#1f2937')
         .text(`• ${element}`, 90, doc.y, { 
           width: doc.page.width - 162
         });
    }
    doc.moveDown(0.3);
  });
  
  doc.moveDown(0.5);
}

function addPageNumbers(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Header
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text('Portal de Pagos Médicos - Documentación INAPI Chile', 
             72, 30, { width: doc.page.width - 144, align: 'center' });
    
    // Footer con número de página
    doc.text(`Página ${i + 1} de ${range.count}`, 
             72, doc.page.height - 50, 
             { width: doc.page.width - 144, align: 'center' });
  }
}

// Función auxiliar para convertir Markdown a HTML
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown
    // Títulos
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    
    // Texto en negrita y cursiva
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Código inline y bloques
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // Enlaces
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
    
    // Líneas horizontales
    .replace(/^---$/gim, '<hr>')
    
    // Saltos de línea y párrafos
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, ' ');
  
  // Envolver en párrafos
  html = '<p>' + html + '</p>';
  
  // Limpiar párrafos vacíos y mal formados
  html = html
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<hr>)<\/p>/g, '$1')
    .replace(/<p>(<pre>.*?<\/pre>)<\/p>/g, '$1')
    .replace(/<p>(<table>.*?<\/table>)<\/p>/g, '$1');
  
  return html;
}