document.addEventListener('DOMContentLoaded', () => {
    // Elementos "Outros" e suas caixas de texto correspondentes
    const outrosCheckboxes = {
        'dificuldadeOutros': document.getElementById('dificuldadeOutrosTexto'),
        'recomendacaoAlunoOutros': document.getElementById('recomendacaoAlunoOutrosTexto'),
        'recomendacaoPaisOutros': document.getElementById('recomendacaoPaisOutrosTexto'),
        'providenciaOutros': document.getElementById('providenciaOutrosTexto')
    };

    // Adicionar eventos para mostrar/ocultar as caixas de texto "Outros"
    Object.keys(outrosCheckboxes).forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        const textareaElement = outrosCheckboxes[checkboxId];

        checkbox.addEventListener('change', function() {
            textareaElement.style.display = this.checked ? 'block' : 'none';
            if (this.checked) {
                textareaElement.focus();
            }
        });
    });

    // Função para validar o formulário
    function validarFormulario() {
        const camposObrigatorios = [
            'nomeAluno',
            'disciplina',
            'numero',
            'turma',
            'disponibilidade',
            'periodoInicio',
            'periodoFim',
            'professor',
            'frequenciaPorcentagem',
            'notaBimestre'
        ];

        let todosPreenchidos = true;
        let primeiroElementoVazio = null;

        camposObrigatorios.forEach(campoId => {
            const elemento = document.getElementById(campoId);
            if (!elemento.value.trim()) {
                todosPreenchidos = false;
                elemento.classList.add('campo-invalido');
                if (!primeiroElementoVazio) {
                    primeiroElementoVazio = elemento;
                }
            } else {
                elemento.classList.remove('campo-invalido');
            }
        });

        if (!todosPreenchidos) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            if (primeiroElementoVazio) {
                primeiroElementoVazio.focus();
            }
            return false;
        }

        // Validações adicionais para as checkboxes com caixas de texto "Outros"
        for (const checkboxId in outrosCheckboxes) {
            const checkbox = document.getElementById(checkboxId);
            const textareaElement = outrosCheckboxes[checkboxId];
            
            if (checkbox.checked && !textareaElement.value.trim()) {
                alert(`Por favor, preencha o campo de texto para "${checkbox.nextElementSibling.textContent}".`);
                textareaElement.focus();
                return false;
            }
        }

        return true;
    }

    // Adicionar evento para validar o formulário ao enviar
    document.getElementById('gerarFicha').addEventListener('click', () => {
        if (validarFormulario()) {
            gerarFichaAvaliacao();
        }
    });

    // Função para coletar checkboxes marcados por nome
    function coletarCheckboxesMarcados(nome) {
        const checkboxes = document.querySelectorAll(`input[name="${nome}"]:checked`);
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    // Função para obter o texto do label de um checkbox pelo seu valor
    function obterLabelCheckbox(valor, tipoCampo) {
        const checkbox = document.querySelector(`input[name="${tipoCampo}"][value="${valor}"]`);
        return checkbox ? checkbox.nextElementSibling.textContent : valor;
    }

    // Função para gerar a ficha de avaliação
    function gerarFichaAvaliacao() {
        // Coletar todos os dados do formulário
        const formData = {
            aluno: {
                nome: document.getElementById('nomeAluno').value,
                disciplina: document.getElementById('disciplina').value,
                numero: document.getElementById('numero').value,
                turma: document.getElementById('turma').value,
                disponibilidade: document.getElementById('disponibilidade').value,
                periodoAvaliacao: {
                    inicio: document.getElementById('periodoInicio').value,
                    fim: document.getElementById('periodoFim').value
                },
                professor: document.getElementById('professor').value,
                frequencia: document.getElementById('frequenciaPorcentagem').value,
                nota: document.getElementById('notaBimestre').value
            },
            dificuldades: coletarCheckboxesMarcados('dificuldade'),
            dificuldadeOutrosTexto: document.getElementById('dificuldadeOutrosTexto').value,
            objetivosNaoAtingidos: document.getElementById('objetivosNaoAtingidos').value,
            recomendacoesAluno: coletarCheckboxesMarcados('recomendacaoAluno'),
            recomendacaoAlunoOutrosTexto: document.getElementById('recomendacaoAlunoOutrosTexto').value,
            recomendacoesPais: coletarCheckboxesMarcados('recomendacaoPais'),
            recomendacaoPaisOutrosTexto: document.getElementById('recomendacaoPaisOutrosTexto').value,
            providencias: coletarCheckboxesMarcados('providencia'),
            providenciaOutrosTexto: document.getElementById('providenciaOutrosTexto').value
        };

        // Formatar datas
        const dataInicio = new Date(formData.aluno.periodoAvaliacao.inicio);
        const dataFim = new Date(formData.aluno.periodoAvaliacao.fim);
        const formatoData = { day: '2-digit', month: '2-digit', year: 'numeric' };
        
        const periodoFormatado = `De: ${dataInicio.toLocaleDateString('pt-BR', formatoData)} Até: ${dataFim.toLocaleDateString('pt-BR', formatoData)}`;

        // Gerar conteúdo do documento
        let conteudoDocumento = `FICHA INDIVIDUAL DE AVALIAÇÃO PERIÓDICA\n\n`;
        conteudoDocumento += `Aluno(a): ${formData.aluno.nome}\n`;
        conteudoDocumento += `Disciplina: ${formData.aluno.disciplina}\n`;
        conteudoDocumento += `Nº: ${formData.aluno.numero}       Turma: ${formData.aluno.turma}       Disponibilidade: ${formData.aluno.disponibilidade}\n`;
        conteudoDocumento += `Período de avaliação: ${periodoFormatado}\n`;
        conteudoDocumento += `Professor: ${formData.aluno.professor}\n`;
        conteudoDocumento += `Frequência na classe: ${formData.aluno.frequencia}%       Nota no bimestre: ${formData.aluno.nota}\n\n`;

        // Adicionar dificuldades
        conteudoDocumento += `PRINCIPAIS DIFICULDADES DO ALUNO:\n`;
        formData.dificuldades.forEach(dificuldade => {
            conteudoDocumento += `- ${obterLabelCheckbox(dificuldade, 'dificuldade')}\n`;
        });
        if (formData.dificuldades.includes('outros')) {
            conteudoDocumento += `  Outros: ${formData.dificuldadeOutrosTexto}\n`;
        }
        conteudoDocumento += `\n`;

        // Adicionar objetivos não atingidos
        conteudoDocumento += `OBJETIVOS NÃO ATINGIDOS:\n`;
        conteudoDocumento += `${formData.objetivosNaoAtingidos || "Nenhum informado"}\n\n`;

        // Adicionar recomendações ao aluno
        conteudoDocumento += `RECOMENDAÇÕES DO PROFESSOR AO ALUNO:\n`;
        formData.recomendacoesAluno.forEach(recomendacao => {
            conteudoDocumento += `- ${obterLabelCheckbox(recomendacao, 'recomendacaoAluno')}\n`;
        });
        if (formData.recomendacoesAluno.includes('outros')) {
            conteudoDocumento += `  Outros: ${formData.recomendacaoAlunoOutrosTexto}\n`;
        }
        conteudoDocumento += `\n`;

        // Adicionar recomendações aos pais
        conteudoDocumento += `RECOMENDAÇÕES DO PROFESSOR AOS PAIS OU RESPONSÁVEIS:\n`;
        formData.recomendacoesPais.forEach(recomendacao => {
            conteudoDocumento += `- ${obterLabelCheckbox(recomendacao, 'recomendacaoPais')}\n`;
        });
        if (formData.recomendacoesPais.includes('outros')) {
            conteudoDocumento += `  Outros: ${formData.recomendacaoPaisOutrosTexto}\n`;
        }
        conteudoDocumento += `\n`;

        // Adicionar providências
        conteudoDocumento += `PROVIDÊNCIAS DO PROFESSOR E DA ESCOLA PARA AUXILIAR O ALUNO:\n`;
        formData.providencias.forEach(providencia => {
            conteudoDocumento += `- ${obterLabelCheckbox(providencia, 'providencia')}\n`;
        });
        if (formData.providencias.includes('outros')) {
            conteudoDocumento += `  Outros: ${formData.providenciaOutrosTexto}\n`;
        }

        // Criar o arquivo para download
        const blob = new Blob([conteudoDocumento], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Ficha_Avaliacao_${formData.aluno.nome}.txt`;
        link.click();
    }

    // Adicionar estilo CSS para campos inválidos
    const style = document.createElement('style');
    style.textContent = `
        .campo-invalido {
            border: 2px solid #ff0000 !important;
            background-color: #ffeeee !important;
        }
    `;
    document.head.appendChild(style);
});