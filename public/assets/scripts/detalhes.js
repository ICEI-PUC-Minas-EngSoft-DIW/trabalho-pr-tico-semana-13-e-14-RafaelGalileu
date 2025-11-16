document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lugarId = urlParams.get('id');

    const apiURL = 'http://localhost:3000/lugares';

    if (!lugarId) {
        document.getElementById('detalhe-titulo').textContent = "Erro: ID não fornecido.";
        return;
    }

    fetch(`${apiURL}/${lugarId}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Lugar não encontrado');
                }
                throw new Error(`Erro de rede: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(lugar => {
            document.title = `Viagem e Turismo - ${lugar.nome}`;
            document.getElementById('detalhe-titulo').textContent = `${lugar.nome} - ${lugar.pais}`;
            document.getElementById('detalhe-imagem-principal').src = lugar.imagem_pincipal;
            document.getElementById('detalhe-imagem-principal').alt = `Imagem de ${lugar.nome}`;
            
            const conteudoEl = document.getElementById('detalhe-conteudo');
            conteudoEl.innerHTML = `
                <p><strong>Local:</strong> ${lugar.nome}</p>
                <p><strong>País:</strong> ${lugar.pais}</p>
                <p><strong>Resumo:</strong> ${lugar.descricao}</p>
                <hr>
                <p>${lugar.conteudo}</p>
            `;

            const atracoesContainer = document.getElementById('detalhe-atracoes-container');
            atracoesContainer.innerHTML = ''; 

            if (lugar.atracoes && lugar.atracoes.length > 0) {
                lugar.atracoes.forEach(atracao => {
                    const col = document.createElement('div');
                    col.className = 'col';
                    col.innerHTML = `
                        <div class="card h-100">
                            <img src="${atracao.imagem}" class="card-img-top" alt="Imagem de ${atracao.nome}">
                            <div class="card-body">
                                <h5 class="card-title">${atracao.nome}</h5>
                                <p class="card-text">${atracao.descricao}</p>
                            </div>
                        </div>
                    `;
                    atracoesContainer.appendChild(col);
                });
            } else {
                document.querySelector('.atracoes').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Falha ao buscar detalhes do lugar:', error);
            document.getElementById('detalhe-titulo').textContent = error.message;
            document.querySelector('.informacoesGerais').style.display = 'none';
            document.querySelector('.atracoes').style.display = 'none';
        });
});