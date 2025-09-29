document.addEventListener('DOMContentLoaded', function() {
    // --- ELEMENTOS DE FORMULARIOS ---
    const form = document.getElementById('gastoForm');
    const ciudadSelect = document.getElementById('ciudad');
    const transporteSelect = document.getElementById('transporte');
    const costoViajeInput = document.getElementById('costoViaje');
    const resultadoDiv = document.getElementById('resultado');

    const comparacionForm = document.getElementById('comparacionForm');
    const ciudadSelect2 = document.getElementById('ciudad2');
    const transporteSelect2 = document.getElementById('transporte2');
    const costoViajeInput2 = document.getElementById('costoViaje2');
    const resultadoDiv2 = document.getElementById('resultado2');

    // --- ELEMENTOS DE RESULTADOS GENERALES ---
    const resultadosGenerales = document.getElementById('resultadosGenerales');
    const comparacionSection = document.getElementById('comparacion');
    const comparacionTablaBody = document.querySelector('#comparacion-tabla tbody');
    
    // Instancia de Chart
    window.myChart = null; 

    // --- DATOS DE COSTOS ---
    const costosPorTipo = {
        'guayaquil': { 'bus': 1.75, 'taxi': 5.00, 'motocicleta': 1.50 },
        'babahoyo': { 'bus': 1.65, 'taxi': 10.00, 'motocicleta': 3.00 },
        'duran': { 'bus': 1.55, 'taxi': 4.00, 'motocicleta': 1.00 }
    };

    /** Función de utilidad para actualizar costo por viaje */
    function actualizarCostoViaje(ciudadSel, transporteSel, costoInput) {
        if (costosPorTipo[ciudadSel.value] && costosPorTipo[ciudadSel.value][transporteSel.value]) {
            costoInput.value = costosPorTipo[ciudadSel.value][transporteSel.value].toFixed(2);
            costoInput.readOnly = true;
            costoInput.style.backgroundColor = '#e9ecef';
        } else {
            costoInput.value = '';
            costoInput.readOnly = false;
            costoInput.style.backgroundColor = '#fff';
        }
    }

    // Inicialización de listeners para ambos formularios
    ciudadSelect.addEventListener('change', () => actualizarCostoViaje(ciudadSelect, transporteSelect, costoViajeInput));
    transporteSelect.addEventListener('change', () => actualizarCostoViaje(ciudadSelect, transporteSelect, costoViajeInput));
    actualizarCostoViaje(ciudadSelect, transporteSelect, costoViajeInput);

    ciudadSelect2.addEventListener('change', () => actualizarCostoViaje(ciudadSelect2, transporteSelect2, costoViajeInput2));
    transporteSelect2.addEventListener('change', () => actualizarCostoViaje(ciudadSelect2, transporteSelect2, costoViajeInput2));
    actualizarCostoViaje(ciudadSelect2, transporteSelect2, costoViajeInput2);

    // =========================================================================
    // LÓGICA DE CÁLCULO INDIVIDUAL (Escenario 1)
    // =========================================================================
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const viajes = parseFloat(document.getElementById('viajes').value);
        const costoViaje = parseFloat(costoViajeInput.value);
        const gastoFijo = parseFloat(document.getElementById('gastoFijo').value);
        const ciudad = ciudadSelect.value; 
        const transporte = transporteSelect.value;

        if (isNaN(viajes) || isNaN(costoViaje) || isNaN(gastoFijo) || viajes < 0 || costoViaje < 0 || gastoFijo < 0) {
            alert('Por favor, ingresa valores numéricos positivos para todos los campos del Escenario 1.');
            return;
        }

        const gastoTotal = (costoViaje * viajes) + gastoFijo;
        document.getElementById('gastoTotal').textContent = `$${gastoTotal.toFixed(2)}`;
        resultadoDiv.style.display = 'block';

        // Ocultar el resultado del Escenario 2 si estaba visible
        resultadoDiv2.style.display = 'none';

        // Mostrar la sección de resultados generales
        resultadosGenerales.style.display = 'block';

        // Generar Comparación (Tabla) y Gráfica SOLO con alternativas de la ciudad seleccionada
        generarComparacion(viajes, gastoFijo, ciudad, transporte, costoViaje, false); 
        generarGrafico(viajes, gastoFijo, costoViaje, ciudad, transporte, null); 
    });

    // =========================================================================
    // LÓGICA DE COMPARACIÓN DIRECTA 
    // =========================================================================
    comparacionForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // 1. Obtener Datos de ambos escenarios
        const viajes1 = parseFloat(document.getElementById('viajes').value);
        const costoViaje1 = parseFloat(costoViajeInput.value);
        const gastoFijo1 = parseFloat(document.getElementById('gastoFijo').value);
        const ciudad1 = ciudadSelect.value;
        const transporte1 = transporteSelect.value;
        const gastoTotal1 = (costoViaje1 * viajes1) + gastoFijo1;
        
        const viajes2 = parseFloat(document.getElementById('viajes2').value);
        const costoViaje2 = parseFloat(costoViajeInput2.value);
        const gastoFijo2 = parseFloat(document.getElementById('gastoFijo2').value);
        const ciudad2 = ciudadSelect2.value;
        const transporte2 = transporteSelect2.value;

        if (isNaN(viajes1) || isNaN(costoViaje1) || isNaN(gastoFijo1) || viajes1 < 0 || costoViaje1 < 0 || gastoFijo1 < 0 ||
            isNaN(viajes2) || isNaN(costoViaje2) || isNaN(gastoFijo2) || viajes2 < 0 || costoViaje2 < 0 || gastoFijo2 < 0) {
            alert('Por favor, ingresa valores numéricos positivos para ambos escenarios.');
            return;
        }

        const gastoTotal2 = (costoViaje2 * viajes2) + gastoFijo2;
        document.getElementById('gastoTotal2').textContent = `$${gastoTotal2.toFixed(2)}`;
        resultadoDiv2.style.display = 'block';

        // Ocultar el resultado del Escenario 1 si estaba visible (o mostrarlo si no lo está)
        document.getElementById('gastoTotal').textContent = `$${gastoTotal1.toFixed(2)}`;
        resultadoDiv.style.display = 'block'; 

        // Mostrar la sección de resultados generales
        resultadosGenerales.style.display = 'block';
        comparacionSection.style.display = 'none'; 
        // 2. Preparar Datos para Escenario 2
        const escenario2 = {
            ciudad: ciudad2, transporte: transporte2, viajes: viajes2, 
            costoViaje: costoViaje2, gastoFijo: gastoFijo2, gastoTotal: gastoTotal2
        };
        
        // 3. Generar la gráfica de comparación directa
        generarGrafico(viajes1, gastoFijo1, costoViaje1, ciudad1, transporte1, escenario2); 
    });


    // =========================================================================
    //  (Tabla y Gráfica)
    // =========================================================================
    
    /**
     * Genera la tabla de comparación, filtrando por la ciudad principal.
     */
    function generarComparacion(viajes, gastoFijo, ciudadPrincipal, transportePrincipal, costoViajePrincipal, isComparisonMode) {
        comparacionTablaBody.innerHTML = '';
        
        if (isComparisonMode) {
             comparacionSection.style.display = 'none';
             return;
        }

        let datosComparativos = [];
        
        // 1. Escenario Principal del usuario (Siempre se incluye)
        const escenarioPrincipalActual = {
            ciudad: ciudadPrincipal.charAt(0).toUpperCase() + ciudadPrincipal.slice(1),
            transporte: transportePrincipal.charAt(0).toUpperCase() + transportePrincipal.slice(1),
            viajes: viajes,
            costoViaje: costoViajePrincipal,
            gastoFijo: gastoFijo,
            gastoTotal: (costoViajePrincipal * viajes) + gastoFijo,
            isCurrentScenario: true
        };
        datosComparativos.push(escenarioPrincipalActual);

        // 2. Alternativas de la misma ciudad (Solo si la ciudad es predefinida)
        if (costosPorTipo[ciudadPrincipal]) {
            const transportesConstantes = ['bus', 'taxi', 'motocicleta'];
            
            transportesConstantes.forEach(transporte => {
                const costoViajeAlternativo = costosPorTipo[ciudadPrincipal][transporte]; 

                
                const isDifferentScenario = !(transporte === transportePrincipal && costoViajeAlternativo === costoViajePrincipal);

                if (costoViajeAlternativo !== undefined && isDifferentScenario) {
                    const gastoTotal = (costoViajeAlternativo * viajes) + gastoFijo;
                    
                    datosComparativos.push({
                        ciudad: ciudadPrincipal.charAt(0).toUpperCase() + ciudadPrincipal.slice(1),
                        transporte: transporte.charAt(0).toUpperCase() + transporte.slice(1),
                        viajes: viajes,
                        costoViaje: costoViajeAlternativo,
                        gastoFijo: gastoFijo,
                        gastoTotal: gastoTotal,
                        isCurrentScenario: false
                    });
                }
            });
        }
        
        // 3. Ordenar y Renderizar
        datosComparativos.sort((a, b) => a.gastoTotal - b.gastoTotal);

        datosComparativos.forEach(item => {
            const row = document.createElement('tr');
            const className = item.isCurrentScenario ? 'destacado' : ''; 
            row.className = className;
            
            row.innerHTML = `
                <td>${item.ciudad}</td>
                <td>${item.transporte} ${item.isCurrentScenario ? '(Tu Escenario)' : ''}</td>
                <td>${item.viajes}</td>
                <td>$${item.costoViaje.toFixed(2)}</td>
                <td>$${item.gastoFijo.toFixed(2)}</td>
                <td>$${item.gastoTotal.toFixed(2)}</td>
            `;
            comparacionTablaBody.appendChild(row);
        });

        comparacionSection.style.display = 'block';
    }
    
    /**
     * Genera la gráfica. Puede ser de alternativas (si scenario2 es null) o de comparación directa.
     */
    function generarGrafico(viajesPrincipal, gastoFijoPrincipal, costoViajePrincipal, ciudadPrincipal, transportePrincipal, scenario2) {
        const ctx = document.getElementById('gastoChart').getContext('2d');
        if (window.myChart) {
            window.myChart.destroy();
        }

        let datasets = [];
        let chartTitle = '';

        
        const escenario1Data = {
            label: `Escenario 1: ${ciudadPrincipal.charAt(0).toUpperCase() + ciudadPrincipal.slice(1)} - ${transportePrincipal.charAt(0).toUpperCase() + transportePrincipal.slice(1)} (Total: $${((costoViajePrincipal * viajesPrincipal) + gastoFijoPrincipal).toFixed(2)})`,
            data: [gastoFijoPrincipal, (costoViajePrincipal * viajesPrincipal) + gastoFijoPrincipal],
            borderColor: '#004d99',
            backgroundColor: 'rgba(0, 77, 153, 0.2)',
            borderWidth: 3,
            fill: scenario2 === null, 
            pointRadius: scenario2 ? 5 : 7 
        };
        datasets.push(escenario1Data);
        
        
        if (scenario2 === null) {
            chartTitle = `Comparación de Alternativas en ${ciudadPrincipal.charAt(0).toUpperCase() + ciudadPrincipal.slice(1)}`;
            
            const colores = [
                '#0099cc', '#2ca25f', '#e65c00', '#6610f2',
                '#20c997', '#dc3545', '#ffc107', '#17a2b8', '#6c757d'
            ];
            let colorIndex = 0;
            
            
            if (costosPorTipo[ciudadPrincipal]) {
                const transportesConstantes = ['bus', 'taxi', 'motocicleta'];

                transportesConstantes.forEach(transporte => {
                    const costoViajeAlternativo = costosPorTipo[ciudadPrincipal][transporte];
                    
                    const isDifferentScenario = !(transporte === transportePrincipal && costoViajeAlternativo === costoViajePrincipal);

                    if (costoViajeAlternativo !== undefined && isDifferentScenario) {
                        
                        const gastoTotalConstante = (costoViajeAlternativo * viajesPrincipal) + gastoFijoPrincipal;
                        datasets.push({
                            label: `${ciudadPrincipal.charAt(0).toUpperCase() + ciudadPrincipal.slice(1)} - ${transporte.charAt(0).toUpperCase() + transporte.slice(1)} (Total: $${gastoTotalConstante.toFixed(2)})`,
                            data: [gastoFijoPrincipal, gastoTotalConstante],
                            borderColor: colores[colorIndex % colores.length],
                            backgroundColor: colores[colorIndex % colores.length],
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false
                        });
                        colorIndex++;
                    }
                });
            }
            
        } else {
            // 3. Lógica de Gráfica de COMPARACIÓN DIRECTA 
            chartTitle = 'Comparación Directa: Escenario 1 vs Escenario 2';

            // Datos para Escenario 2
            const escenario2Data = {
                label: `Escenario 2: ${scenario2.ciudad.charAt(0).toUpperCase() + scenario2.ciudad.slice(1)} - ${scenario2.transporte.charAt(0).toUpperCase() + scenario2.transporte.slice(1)} (Total: $${scenario2.gastoTotal.toFixed(2)})`,
                data: [scenario2.gastoFijo, scenario2.gastoTotal],
                borderColor: '#ff8c00', 
                backgroundColor: 'rgba(255, 140, 0, 0.2)',
                borderWidth: 3,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 5
            };
            
            datasets.push(escenario2Data);
        }

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Gasto Fijo', `Gasto Total (${scenario2 ? 'Comparación' : viajesPrincipal + ' viajes'})`],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { 
                            display: true, 
                            text: 'Punto de Referencia (Gasto Fijo vs. Gasto Total)',
                            font: { size: 14, weight: 'bold' } 
                        }
                    },
                    y: {
                        title: { 
                            display: true, 
                            text: 'Gasto Total Mensual ($)',
                            font: { size: 14, weight: 'bold' } 
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: chartTitle,
                        font: { size: 16, weight: 'bold' },
                        padding: { top: 10, bottom: 15 }
                    },
                    legend: { 
                        display: true, // <-- CAMBIO CLAVE: Muestra la leyenda
                        position: 'top',
                        labels: {
                            padding: 15
                        }
                    }, 
                    tooltip: { enabled: true, mode: 'index', intersect: false }
                },
                hover: { mode: 'index', intersect: false }
            }
        });
    }
});