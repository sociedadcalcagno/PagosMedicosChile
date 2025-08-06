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

export function generatePayrollPDF(data: PDFPayrollData): string {
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
            font-size: 13px;
            line-height: 1.6;
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
            border-bottom: 3px solid #0f766e;
            background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
            border-radius: 8px;
            margin: -24px -24px 48px -24px;
            padding: 32px 24px;
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #0f766e;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .subtitle {
            font-size: 16px;
            font-weight: 500;
            color: #0d9488;
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
            background: #f8fafc;
            padding: 20px 24px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 32px;
            font-weight: 600;
            font-size: 16px;
            color: #1e40af;
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
            color: #0f766e;
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
            color: #0f766e;
            padding: 12px 20px;
            background: linear-gradient(90deg, #0f766e 0%, #14b8a6 100%);
            color: white;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(15, 118, 110, 0.2);
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
            font-size: 11px;
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
            border-top: 2px solid #0f766e;
            margin-top: 16px;
            padding-top: 24px;
            font-weight: 700;
            font-size: 18px;
            color: #0f766e;
        }
        .total-label {
            font-weight: 600;
            color: #475569;
        }
        .total-amount {
            font-weight: 700;
            color: #0f766e;
            font-size: 16px;
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
            color: #0f766e;
            font-weight: 600;
        }
        .no-data {
            text-align: center;
            font-style: italic;
            color: #94a3b8;
            margin: 32px 0;
            padding: 32px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px dashed #cbd5e1;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
        }
        th, td {
            text-align: left;
            padding: 16px 20px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
        }
        th {
            font-weight: 600;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            color: #475569;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #cbd5e1;
        }
        tbody tr:hover {
            background-color: #f8fafc;
        }
        tbody tr:last-child td {
            border-bottom: none;
        }
        .amount {
            text-align: right;
            font-weight: 600;
            color: #059669;
        }
        .center {
            text-align: center;
        }
        .percentage {
            background: #ecfdf5;
            color: #059669;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="document-container">
    <div class="header">
        <div class="title">CARTOLA DE PAGO - Participaciones</div>
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
                <td>${att.patientRut || ''}</td>
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
                <td>${att.patientRut || ''}</td>
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
    <div class="section-title">HMQ</div>
    <div class="table-header">
        Fecha Atención&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RUT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Paciente&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Previsión&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Código Prestación&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Nombre&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Horario&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bruto&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Monto Participación&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Comisión
    </div>
    <div class="no-data">No se encontraron datos</div>
    `}

    <div class="totals">
        <div class="total-row">
            <span class="total-label">TOTAL PARTICIPACIONES:</span>
            <span class="total-amount">$${formatCurrency(data.participacionTotal)}</span>
        </div>
        <div class="total-row">
            <span class="total-label">TOTAL HMQ:</span>
            <span class="total-amount">$${formatCurrency(data.hmqTotal)}</span>
        </div>
        <div class="total-row">
            <span class="total-label">TOTAL GENERAL:</span>
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

  return html;
}