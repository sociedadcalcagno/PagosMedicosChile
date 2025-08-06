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
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 20px;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            font-weight: bold;
        }
        .title {
            font-size: 16px;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 14px;
            margin-bottom: 5px;
        }
        .date {
            font-size: 12px;
            margin-bottom: 20px;
        }
        .cartola-info {
            margin-bottom: 20px;
            font-weight: bold;
        }
        .doctor-info {
            margin-bottom: 30px;
            font-weight: bold;
        }
        .section-title {
            font-weight: bold;
            font-size: 14px;
            margin: 30px 0 10px 0;
            text-decoration: underline;
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
            margin-top: 30px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 15px;
        }
        .total-row {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            border-top: 1px solid #666;
            padding-top: 15px;
        }
        .no-data {
            text-align: center;
            font-style: italic;
            color: #666;
            margin: 20px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            text-align: left;
            padding: 4px 8px;
            border-bottom: 1px solid #ccc;
            font-size: 11px;
        }
        th {
            font-weight: bold;
            background-color: #f5f5f5;
        }
        .amount {
            text-align: right;
        }
        .center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">CARTOLA DE PAGO - Participaciones</div>
        <div class="subtitle">PORTAL PAGOS MÉDICOS</div>
        <div class="date">FECHA PAGO: ${currentDate}</div>
    </div>

    <div class="cartola-info">
        NRO CARTOLA: ${cartola}
    </div>

    <div class="doctor-info">
        ${data.societyName ? `RUT Pago: ${data.societyRut || ''} ${data.societyName}` : ''}
        <br>RUT Profesional: ${data.doctorRut} ${data.doctorName}
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
                <td class="center">${att.participationPercentage || '0'}%</td>
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
                <td class="center">${att.participationPercentage || '0'}%</td>
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
            <span>TOTAL PARTICIPACIONES:</span>
            <span>$${formatCurrency(data.participacionTotal)}</span>
        </div>
        <div class="total-row">
            <span>TOTAL HMQ:</span>
            <span>$${formatCurrency(data.hmqTotal)}</span>
        </div>
        <div class="total-row" style="border-top: 1px solid #000; padding-top: 8px; margin-top: 8px;">
            <span>TOTAL GENERAL:</span>
            <span>$${formatCurrency(data.totalAmount)}</span>
        </div>
    </div>

    <div class="footer">
        Portal de Pagos Médicos - Sistema de Liquidaciones<br>
        Generado el ${new Date().toLocaleString('es-CL')}<br>
        Período: ${monthNames[data.month - 1]} ${data.year}
    </div>
</body>
</html>`;

  return html;
}