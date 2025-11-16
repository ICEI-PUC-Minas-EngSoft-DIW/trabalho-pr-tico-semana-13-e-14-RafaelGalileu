document.addEventListener('DOMContentLoaded', () => {

    const ctx = document.getElementById('graficoDestinos');
    
    const apiURL = 'http://localhost:3000/lugares';

    if (!ctx) {
        console.error('Elemento canvas não encontrado');
        return;
    }

    fetch(apiURL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro de rede: ${response.status}`);
            }
            return response.json();
        })
        .then(lugares => {
            const dadosProcessados = processarDados(lugares);
            
            renderizarGrafico(dadosProcessados);
        })
        .catch(error => {
            console.error('Erro ao buscar ou processar dados para o gráfico:', error);
            ctx.parentElement.innerHTML = '<p class="text-danger text-center"><b>Erro ao carregar o gráfico.</b></p>';
        });

    function processarDados(lugares) {

        const contagemPorPais = lugares.reduce((acc, lugar) => {
            const pais = lugar.pais || "País não definido";
            
            acc[pais] = (acc[pais] || 0) + 1;
            
            return acc;
        }, {});

        const labels = Object.keys(contagemPorPais);
        const data = Object.values(contagemPorPais);

        return { labels, data };
    }

    function renderizarGrafico(dadosProcessados) {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: dadosProcessados.labels,
                datasets: [{
                    label: 'Nº de Destinos',
                    data: dadosProcessados.data,

                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribuição de Destinos por País'
                    }
                }
            }
        });
    }
});