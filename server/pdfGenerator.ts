import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

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

// Función para generar PDFs de manuales desde Markdown
export async function generateManualPDF(manualType: 'sistema' | 'tecnico'): Promise<Buffer> {
  const fileName = manualType === 'sistema' ? 'MANUAL_DE_SISTEMA.md' : 'MANUAL_TECNICO.md';
  const title = manualType === 'sistema' ? 'MANUAL DE SISTEMA' : 'MANUAL TÉCNICO';
  const subtitle = 'Portal de Pagos Médicos - Chile';
  
  // Leer el archivo Markdown
  const markdownContent = readFileSync(fileName, 'utf-8');
  
  // Convertir Markdown a HTML básico
  const htmlContent = convertMarkdownToHTML(markdownContent);
  
  const currentDate = new Date().toLocaleDateString('es-CL');
  
  // HTML template profesional para documentación
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Portal Pagos Médicos</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            font-size: 11px;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            color: #1f2937;
            background: #ffffff;
            max-width: none;
        }
        
        .document-container {
            background: #ffffff;
            margin: 0 auto;
            padding: 0;
        }
        
        .cover-page {
            text-align: center;
            padding: 80px 60px;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%);
            color: white;
            page-break-after: always;
            border-radius: 0;
            margin-bottom: 60px;
        }
        
        .cover-title {
            font-size: 42px;
            font-weight: 800;
            margin-bottom: 20px;
            letter-spacing: -1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .cover-subtitle {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 40px;
            opacity: 0.95;
            letter-spacing: 0.5px;
        }
        
        .cover-info {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 12px;
            margin: 40px auto;
            max-width: 500px;
            backdrop-filter: blur(10px);
        }
        
        .cover-info p {
            font-size: 16px;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .content {
            max-width: 210mm;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1e3a8a;
            margin: 50px 0 25px 0;
            padding-bottom: 15px;
            border-bottom: 3px solid #3b82f6;
            page-break-before: always;
        }
        
        h1:first-of-type {
            page-break-before: auto;
        }
        
        h2 {
            font-size: 22px;
            font-weight: 600;
            color: #1e40af;
            margin: 40px 0 20px 0;
            padding: 12px 0;
            border-bottom: 2px solid #dbeafe;
        }
        
        h3 {
            font-size: 18px;
            font-weight: 600;
            color: #2563eb;
            margin: 30px 0 15px 0;
        }
        
        h4 {
            font-size: 15px;
            font-weight: 600;
            color: #3730a3;
            margin: 25px 0 12px 0;
        }
        
        h5 {
            font-size: 13px;
            font-weight: 600;
            color: #4338ca;
            margin: 20px 0 10px 0;
        }
        
        p {
            margin: 12px 0;
            text-align: justify;
            line-height: 1.7;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        li {
            margin: 8px 0;
            line-height: 1.6;
        }
        
        ul li {
            list-style-type: none;
            position: relative;
            padding-left: 20px;
        }
        
        ul li:before {
            content: "•";
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        code {
            background: #f1f5f9;
            color: #1e40af;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 10px;
        }
        
        pre {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.5;
        }
        
        pre code {
            background: none;
            padding: 0;
            border-radius: 0;
            color: #374151;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10px;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 6px;
            overflow: hidden;
        }
        
        th {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10px;
            line-height: 1.4;
            vertical-align: top;
        }
        
        tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .info-box {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #0ea5e9;
        }
        
        .warning-box {
            background: #fefce8;
            border: 1px solid #eab308;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #eab308;
        }
        
        .success-box {
            background: #f0fdf4;
            border: 1px solid #22c55e;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #22c55e;
        }
        
        .footer-info {
            margin-top: 80px;
            padding: 30px;
            background: #f8fafc;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e2e8f0;
            page-break-inside: avoid;
        }
        
        .footer-info h4 {
            color: #1e3a8a;
            margin-bottom: 15px;
        }
        
        .footer-info p {
            margin: 5px 0;
            font-size: 12px;
            color: #64748b;
        }
        
        strong {
            font-weight: 600;
            color: #1e40af;
        }
        
        em {
            font-style: italic;
            color: #4338ca;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e2e8f0;
            margin: 40px 0;
        }
        
        blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 20px;
            margin: 20px 0;
            color: #4b5563;
            font-style: italic;
            background: #f8fafc;
            padding: 15px 20px;
            border-radius: 0 8px 8px 0;
        }
        
        @page {
            margin: 2cm;
            @bottom-center {
                content: counter(page);
                font-size: 10px;
                color: #64748b;
            }
        }
        
        .page-break {
            page-break-before: always;
        }
        
    </style>
</head>
<body>
    <div class="document-container">
        <div class="cover-page">
            <div class="cover-title">${title}</div>
            <div class="cover-subtitle">${subtitle}</div>
            <div class="cover-info">
                <p><strong>Versión:</strong> 1.0</p>
                <p><strong>Fecha:</strong> ${currentDate}</p>
                <p><strong>País:</strong> Chile</p>
                <p><strong>Documento:</strong> Propiedad Intelectual</p>
            </div>
        </div>
        
        <div class="content">
            ${htmlContent}
            
            <div class="footer-info">
                <h4>Información del Documento</h4>
                <p><strong>Generado para:</strong> Instituto Nacional de Propiedad Industrial (INAPI) - Chile</p>
                <p><strong>Fecha de Generación:</strong> ${new Date().toLocaleString('es-CL')}</p>
                <p><strong>Sistema:</strong> Portal de Pagos Médicos</p>
                <p><strong>Confidencialidad:</strong> Documento de Propiedad Intelectual</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  
  // Generar PDF (por ahora HTML como simulación)
  const pdfId = `manual_${manualType}_${Date.now()}`;
  const htmlFilePath = join(TEMP_DIR, `${pdfId}.html`);
  
  writeFileSync(htmlFilePath, html);
  
  // Leer HTML como buffer
  const htmlBuffer = readFileSync(htmlFilePath);
  
  return htmlBuffer;
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