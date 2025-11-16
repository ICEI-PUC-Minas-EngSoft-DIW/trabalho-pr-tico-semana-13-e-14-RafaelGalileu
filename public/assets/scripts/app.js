document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.cards .row');
    const formAdicionar = document.getElementById('form-novo-lugar');
    const formEditar = document.getElementById('form-editar-lugar');
    const modalEditarElement = document.getElementById('modal-editar');
    const modalEditar = new bootstrap.Modal(modalEditarElement);
    
    const apiURL = 'http://localhost:3000/lugares';

    if (!cardContainer || !formAdicionar || !formEditar) {
        console.error('Elementos essenciais (formulários, modal ou container) não encontrados.');
        return;
    }

    const carregarCards = () => {
        cardContainer.innerHTML = ''; 

        fetch(apiURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro de rede: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(lugares => {
                lugares.sort((a, b) => b.id - a.id); 

                lugares.forEach(lugar => {
                    const col = document.createElement('div');
                    col.className = 'col';

                    col.innerHTML = `
                        <div class="card h-100">
                            <img src="${lugar.imagem_pincipal}" class="card-img-top" alt="Imagem principal de ${lugar.nome}">
                            <div class="card-body">
                                <h5 class="card-title">${lugar.nome} - ${lugar.pais}</h5>
                                <p class="card-text">${lugar.descricao}</p>
                                
                                ${lugar.data ? `<small class="text-muted">Última viagem: ${lugar.data}</small>` : ''}
                            </div>
                            
                            <div class="card-footer d-flex justify-content-end gap-2">
                                <button class="btn btn-secondary btn-sm btn-editar" data-id="${lugar.id}">
                                    Editar
                                </button>
                                <button class="btn btn-danger btn-sm btn-deletar" data-id="${lugar.id}">
                                    Excluir
                                </button>
                            </div>
                        </div>
                    `;

                    col.querySelector('.card-body, .card-img-top').addEventListener('click', () => {
                        window.location.href = `detalhe.html?id=${lugar.id}`;
                    });
                    col.querySelector('.card-body').style.cursor = 'pointer';

                    const btnDeletar = col.querySelector('.btn-deletar');
                    btnDeletar.addEventListener('click', () => {
                        
                        if (!confirm(`Tem certeza que deseja excluir "${lugar.nome}"?`)) {
                            return;
                        }

                        const lugarId = btnDeletar.getAttribute('data-id');
                        fetch(`${apiURL}/${lugarId}`, { method: 'DELETE' })
                        .then(response => {
                            if (!response.ok) throw new Error('Erro ao deletar o lugar.');
                            carregarCards(); 
                        })
                        .catch(error => console.error('Erro DELETE:', error));
                    });

                    const btnEditar = col.querySelector('.btn-editar');
                    btnEditar.addEventListener('click', () => {
                        const lugarId = btnEditar.getAttribute('data-id');
                        abrirModalEdicao(lugarId);
                    });

                    cardContainer.appendChild(col);
                });
            })
            .catch(error => {
                console.error('Falha ao buscar dados da API:', error);
                cardContainer.innerHTML = `<p class="text-danger text-center"><b>Erro ao carregar lugares.</b> Verifique o <code>npm start</code>.</p>`;
            });
    };

    formAdicionar.addEventListener('submit', (evento) => {
        evento.preventDefault(); 

        const novoLugar = {
            nome: document.getElementById('form-nome').value,
            pais: document.getElementById('form-pais').value,
            imagem_pincipal: document.getElementById('form-imagem').value,
            descricao: document.getElementById('form-descricao').value,
            conteudo: document.getElementById('form-conteudo').value,
            destaque: document.getElementById('form-destaque').checked,
            atracoes: [] 
        };

        fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoLugar)
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao adicionar novo lugar.');
            return response.json();
        })
        .then(() => {
            formAdicionar.reset(); 
            carregarCards(); 
        })
        .catch(error => console.error('Erro POST:', error));
    });

    const abrirModalEdicao = (id) => {
        fetch(`${apiURL}/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Falha ao buscar dados do lugar.');
                return response.json();
            })
            .then(lugar => {
                document.getElementById('edit-form-id').value = lugar.id;
                document.getElementById('edit-form-nome').value = lugar.nome;
                document.getElementById('edit-form-pais').value = lugar.pais;
                document.getElementById('edit-form-imagem').value = lugar.imagem_pincipal;
                document.getElementById('edit-form-descricao').value = lugar.descricao;
                document.getElementById('edit-form-conteudo').value = lugar.conteudo;
                document.getElementById('edit-form-destaque').checked = lugar.destaque;
                
                modalEditar.show();
            })
            .catch(error => console.error('Erro GET (para editar):', error));
    };

    formEditar.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const lugarId = document.getElementById('edit-form-id').value;

        const lugarAtualizado = {
            id: parseInt(lugarId),
            nome: document.getElementById('edit-form-nome').value,
            pais: document.getElementById('edit-form-pais').value,
            imagem_pincipal: document.getElementById('edit-form-imagem').value,
            descricao: document.getElementById('edit-form-descricao').value,
            conteudo: document.getElementById('edit-form-conteudo').value,
            destaque: document.getElementById('edit-form-destaque').checked,
            // NOTA: Este PUT vai sobrescrever as atrações. 
            // Uma lógica de PATCH ou GET/Merge seria necessária para mantê-las.
            // Para este exercício, assumimos que as atrações são gerenciadas em outro lugar
            // ou que estamos ok em resetá-las se o 'db.json' não as mantiver.
            // Vamos buscar as atrações atuais para não perdê-las.
        };
        
        // Pequena lógica para não perder as atrações existentes no PUT
        fetch(`${apiURL}/${lugarId}`)
            .then(res => res.json())
            .then(lugarExistente => {
                lugarAtualizado.atracoes = lugarExistente.atracoes; // Mantém as atrações antigas

                return fetch(`${apiURL}/${lugarId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(lugarAtualizado)
                });
            })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao salvar alterações.');
                return response.json();
            })
            .then(() => {
                modalEditar.hide();
                carregarCards();
            })
            .catch(error => console.error('Erro PUT:', error));
    });

    carregarCards();
});