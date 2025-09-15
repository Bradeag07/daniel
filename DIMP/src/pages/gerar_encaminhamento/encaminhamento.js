document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const horarioCheckboxes = document.querySelectorAll('input[name="horario"]');
    const horarioInputs = {
        'entradaAtrasada': document.getElementById('horarioEntrada'),
        'saidaAntecipada': document.getElementById('horarioSaida')
    };
    const motivosPessoaisCheckbox = document.getElementById('motivosPessoais');
    const motivosPessoaisTexto = document.getElementById('motivosPessoaisTexto');
    const motivosCheckboxes = document.querySelectorAll('input[name="motivo"]');
    const gerarEncaminhamentoBtn = document.getElementById('gerarEncaminhamento');

    // --- Lógica de Interação do Formulário (sem alterações) ---

    // Visibilidade do input de horário
    horarioCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            Object.values(horarioInputs).forEach(input => input.style.display = 'none');
            if (this.checked) {
                const correspondingInput = horarioInputs[this.id];
                correspondingInput.style.display = 'block';
                horarioCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== this) otherCheckbox.checked = false;
                });
            }
        });
        checkbox.addEventListener('click', function() {
            const correspondingInput = horarioInputs[this.id];
            if (!this.checked) {
                correspondingInput.style.display = 'none';
            } else {
                correspondingInput.style.display = 'block';
                correspondingInput.focus();
            }
        });
    });

    // Visibilidade da área de texto "Motivos Pessoais"
    motivosPessoaisCheckbox.addEventListener('change', function() {
        motivosPessoaisTexto.style.display = this.checked ? 'block' : 'none';
        if (this.checked) motivosPessoaisTexto.focus();
    });

    // Exclusividade mútua dos checkboxes de "Motivo"
    motivosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                motivosCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                        if (otherCheckbox.id === 'motivosPessoais') {
                            motivosPessoaisTexto.style.display = 'none';
                        }
                    }
                });
            }
        });
    });
    
    // --- Lógica de Geração do Documento (Modificada) ---

    gerarEncaminhamentoBtn.addEventListener('click', () => {
        // Coleta o checkbox de horário que está marcado
        const checkedHorario = document.querySelector('input[name="horario"]:checked');
        let horarioTipo = null;
        let horarioTempo = null;

        if (checkedHorario) {
            horarioTipo = checkedHorario.value;
            // Pega o valor do input de tempo correspondente usando o ID do checkbox
            horarioTempo = horarioInputs[checkedHorario.id].value;
        }

        const formData = {
            nome: document.getElementById('nome').value,
            turma: document.getElementById('turma').value,
            nascimento: document.getElementById('nascimento').value,
            horario: {
                tipo: horarioTipo,
                tempo: horarioTempo
            },
            motivo: {
                tipo: document.querySelector('input[name="motivo"]:checked')?.value,
                descricao: document.getElementById('motivosPessoaisTexto')?.value
            }
        };

        if (!formData.nome) {
            alert('Por favor, preencha o nome do aluno.');
            return;
        }

        if (formData.horario.tipo && !formData.horario.tempo) {
            alert('Por favor, selecione o horário para ' + 
                (formData.horario.tipo === 'entrada-atrasada' ? 'entrada atrasada' : 'saída antecipada'));
            return;
        }

        // Chama a nova função para gerar o PDF
        generatePdf(formData);
    });
    
    /**
     * Gera um documento PDF com os dados do formulário de encaminhamento.
     * @param {object} data - Os dados coletados do formulário.
     */
    function generatePdf(data) {
        // Pega a classe jsPDF do objeto window, que foi carregado pelo script no HTML
        const { jsPDF } = window.jspdf;
        // Cria uma nova instância do jsPDF em tamanho A4, orientação retrato
        const doc = new jsPDF('p', 'mm', 'a4');

        // Define as coordenadas iniciais
        const margin = 20;
        let y = 30; // Posição vertical inicial

        // --- Conteúdo do PDF ---
        
        // Título do documento
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("SENAI 302 DIMP - ENCAMINHAMENTO", 105, 20, { align: "center" });

        // Linha separadora
        doc.setLineWidth(0.5);
        doc.line(margin, 25, 190, 25);

        // Informações do Aluno
        doc.setFontSize(12);
        
        doc.setFont("helvetica", "bold");
        doc.text("NOME DO(A) ALUNO(A):", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(data.nome || "Não informado", margin + 55, y);
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.text("TURMA:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(data.turma || "Não informado", margin + 20, y);
        y += 10;

        if (data.nascimento) {
            const dataFormatada = new Date(data.nascimento + 'T00:00:00').toLocaleDateString('pt-BR');
            doc.setFont("helvetica", "bold");
            doc.text("DATA DE NASCIMENTO:", margin, y);
            doc.setFont("helvetica", "normal");
            doc.text(dataFormatada, margin + 58, y);
            y += 10;
        }

        y += 10; // Espaço antes da próxima seção

        // Seção: Motivo do Encaminhamento
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("MOTIVO DO ENCAMINHAMENTO", margin, y);
        y += 10;
        doc.setFontSize(12);

        // Motivo de Horário
        if (data.horario.tipo && data.horario.tempo) {
            const horarioLabel = getHorarioLabel(data.horario.tipo);
            doc.setFont("helvetica", "bold");
            doc.text("Tipo de Ocorrência:", margin, y);
            doc.setFont("helvetica", "normal");
            doc.text(`${horarioLabel} às ${data.horario.tempo}`, margin + 45, y);
            y += 10;
        }

        // Outros Motivos
        if (data.motivo.tipo) {
            const motivoLabel = getMotivoLabel(data.motivo.tipo);
            doc.setFont("helvetica", "bold");
            doc.text("Motivo:", margin, y);
            doc.setFont("helvetica", "normal");
            doc.text(motivoLabel, margin + 20, y);
            y += 10;

            if (data.motivo.tipo === 'motivos-pessoais' && data.motivo.descricao) {
                doc.setFont("helvetica", "bold");
                doc.text("Descrição:", margin, y);
                doc.setFont("helvetica", "normal");
                
                // Quebra o texto da descrição se for muito longo
                const splitDescription = doc.splitTextToSize(data.motivo.descricao, 150);
                doc.text(splitDescription, margin + 25, y);
                // Ajusta a posição Y com base no número de linhas da descrição
                y += (splitDescription.length * 6);
            }
        }

        // --- Salvar o PDF ---
        doc.save(`Encaminhamento_${data.nome.replace(/ /g, "_")}.pdf`);
    }

    // Funções auxiliares (sem alterações)
    function getHorarioLabel(value) {
        switch(value) {
            case 'entrada-atrasada': return 'Entrada com Atraso';
            case 'saida-antecipada': return 'Saída Antecipada';
            default: return value;
        }
    }

    function getMotivoLabel(value) {
        switch(value) {
            case 'resolver-assuntos': return 'Resolver Assuntos Fora de Sala';
            case 'sem-uniforme': return 'Sem Uniforme';
            case 'motivos-pessoais': return 'Motivos Pessoais/Outros';
            default: return value;
        }
    }
});