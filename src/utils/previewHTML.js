import { getExcelColumnName } from './excelUtils.js';

export const generatePreviewHTML = (data, title) => {
    const headers = data[0] || [];
    const rows = data.slice(1);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RUNA Data Matcher - ${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .stats {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e9ecef;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .stat-item {
            text-align: center;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .stat-label {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 5px;
        }
        
        .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #495057;
        }
        
        .table-container {
            overflow: auto;
            max-height: calc(100vh - 300px);
            padding: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        th, td {
            border: 1px solid #dee2e6;
            text-align: left;
            font-size: 12px;
            max-width: 200px;
        }
        
        th {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 10;
            padding: 8px;
        }
        
        .row-number {
            background: #f8f9fa !important;
            text-align: center;
            font-weight: bold;
            color: #6c757d;
            min-width: 40px;
            padding: 8px;
        }
        
        .excel-column {
            background: #c8e6c9;
            color: #2e7d32;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            text-align: center;
            padding: 4px;
            border-radius: 4px;
            margin-bottom: 4px;
            font-size: 10px;
        }
        
        .column-name {
            font-weight: normal;
            color: #495057;
            padding: 0 4px;
            word-wrap: break-word;
        }
        
        .data-cell {
            padding: 8px;
            word-wrap: break-word;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        tr:hover {
            background-color: #e3f2fd !important;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 15px 20px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
            .header { background: #667eea; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 ${title}</h1>
            <p>Vista independiente • Abierto: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-label">📊 Total Registros</div>
                <div class="stat-value">${rows.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">📋 Total Columnas</div>
                <div class="stat-value">${headers.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">🗂️ Tipo de Archivo</div>
                <div class="stat-value">${title.includes('Base') ? 'Plantilla' : title.includes('Fuente') ? 'Datos' : 'Procesado'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">⏰ Generado</div>
                <div class="stat-value">${new Date().toLocaleTimeString()}</div>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="row-number">#</th>
                        ${headers.map((header, index) => `
                            <th>
                                <div class="excel-column">${getExcelColumnName(index)}</div>
                                <div class="column-name" title="${header || `Columna ${index + 1}`}">
                                    ${header || `Columna ${index + 1}`}
                                </div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row, rowIndex) => `
                        <tr>
                            <td class="row-number">${rowIndex + 1}</td>
                            ${row.map((cell, cellIndex) => `
                                <td class="data-cell" title="${cell || '-'}">${cell || '-'}</td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>
                📄 RUNA Data Matcher - Generado automáticamente • 
                Total de ${rows.length} registros en ${headers.length} columnas • 
                ${new Date().toLocaleDateString()}
            </p>
        </div>
    </div>
    
    <script>
        // Hacer que la tabla sea más interactiva
        document.addEventListener('DOMContentLoaded', function() {
            const cells = document.querySelectorAll('.data-cell');
            cells.forEach(cell => {
                cell.addEventListener('click', function() {
                    const content = this.textContent;
                    if (content && content !== '-') {
                        navigator.clipboard.writeText(content).then(() => {
                            const originalBg = this.style.backgroundColor;
                            this.style.backgroundColor = '#4caf50';
                            this.style.color = 'white';
                            setTimeout(() => {
                                this.style.backgroundColor = originalBg;
                                this.style.color = '';
                            }, 500);
                        }).catch(() => {
                            alert('Contenido: ' + content);
                        });
                    }
                });
            });
            
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'p') {
                    e.preventDefault();
                    window.print();
                }
            });
        });
    </script>
</body>
</html>`;
};
