document.addEventListener('DOMContentLoaded', () => {
    const outrosCheckboxes = {
        'dificuldadeOutros': document.getElementById('dificuldadeOutrosTexto'),
        'recomendacaoAlunoOutros': document.getElementById('recomendacaoAlunoOutrosTexto'),
        'recomendacaoPaisOutros': document.getElementById('recomendacaoPaisOutrosTexto'),
        'providenciaOutros': document.getElementById('providenciaOutrosTexto')
    };

    // --- Lógica de Interação do Formulário (sem alterações) ---
    Object.keys(outrosCheckboxes).forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        const textareaElement = outrosCheckboxes[checkboxId];

        checkbox.addEventListener('change', function() {
            textareaElement.style.display = this.checked ? 'block' : 'none';
            if (this.checked) textareaElement.focus();
        });
    });

    function validarFormulario() {
        // Lógica de validação continua a mesma...
        const camposObrigatorios = ['nomeAluno', 'disciplina', 'numero', 'turma', 'disponibilidade', 'periodoInicio', 'periodoFim', 'professor', 'frequenciaPorcentagem', 'notaBimestre'];
        let todosPreenchidos = true;
        let primeiroElementoVazio = null;
        camposObrigatorios.forEach(campoId => {
            const elemento = document.getElementById(campoId);
            if (!elemento.value.trim()) {
                todosPreenchidos = false;
                elemento.classList.add('campo-invalido');
                if (!primeiroElementoVazio) primeiroElementoVazio = elemento;
            } else {
                elemento.classList.remove('campo-invalido');
            }
        });
        if (!todosPreenchidos) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            if (primeiroElementoVazio) primeiroElementoVazio.focus();
            return false;
        }
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

    document.getElementById('gerarFicha').addEventListener('click', () => {
        if (validarFormulario()) {
            // Chama a nova função para gerar PDF
            gerarFichaPdf();
        }
    });
    
    // --- Funções Auxiliares (sem alterações) ---
    function coletarCheckboxesMarcados(nome) {
        const checkboxes = document.querySelectorAll(`input[name="${nome}"]:checked`);
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    function obterLabelCheckbox(valor, tipoCampo) {
        const checkbox = document.querySelector(`input[name="${tipoCampo}"][value="${valor}"]`);
        return checkbox ? checkbox.nextElementSibling.textContent : valor;
    }

    const style = document.createElement('style');
    style.textContent = `.campo-invalido { border: 2px solid #ff0000 !important; background-color: #ffeeee !important; }`;
    document.head.appendChild(style);

    // --- Nova Função para Gerar o PDF da Ficha de Avaliação ---

    function gerarFichaPdf() {
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

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        const margin = 15;
        const docWidth = doc.internal.pageSize.getWidth();
        let y = 15; // Posição vertical inicial
        const lineHeight = 7; // Altura padrão da linha
        const sectionSpacing = 5; // Espaçamento após uma seção

        // Função para checar e adicionar nova página se necessário
        const checkPageBreak = () => {
            if (y > 270) { // 297mm (altura A4) - margem inferior
                doc.addPage();
                y = 20; // Posição Y no topo da nova página
            }
        };
        
        // Título Principal
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("FICHA INDIVIDUAL DE AVALIAÇÃO PERIÓDICA", docWidth / 2, y, { align: "center" });
        y += lineHeight * 2;
        
        // --- Dados do Aluno ---
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("NOME DO(A) ALUNO(A):", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(formData.aluno.nome, margin + 50, y);
        y += lineHeight;

        doc.setFont("helvetica", "bold");
        doc.text("DISCIPLINA:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(formData.aluno.disciplina, margin + 27, y);
        doc.setFont("helvetica", "bold");
        doc.text("Nº:", docWidth / 2 + 30, y);
        doc.setFont("helvetica", "normal");
        doc.text(formData.aluno.numero, docWidth / 2 + 35, y);
        y += lineHeight;
        
        doc.setFont("helvetica", "bold");
        doc.text("TURMA:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(formData.aluno.turma, margin + 18, y);
        doc.setFont("helvetica", "bold");
        doc.text("DISPONIBILIDADE:", docWidth / 2 + 30, y);
        doc.setFont("helvetica", "normal");
        doc.text(formData.aluno.disponibilidade, docWidth / 2 + 65, y);
        y += lineHeight;
        
        const dataInicio = new Date(formData.aluno.periodoAvaliacao.inicio + 'T00:00:00').toLocaleDateString('pt-BR');
        const dataFim = new Date(formData.aluno.periodoAvaliacao.fim + 'T00:00:00').toLocaleDateString('pt-BR');
        doc.setFont("helvetica", "bold");
        doc.text("PERÍODO DE AVALIAÇÃO:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(`De: ${dataInicio} Até: ${dataFim}`, margin + 52, y);
        y += lineHeight;

        doc.setFont("helvetica", "bold");
        doc.text("PROFESSOR:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(formData.aluno.professor, margin + 27, y);
        y += lineHeight;

        doc.setFont("helvetica", "bold");
        doc.text("FREQUÊNCIA NA CLASSE:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(`${formData.aluno.frequencia}%`, margin + 50, y);
        doc.setFont("helvetica", "bold");
        doc.text("NOTA NO BIMESTRE:", docWidth / 2 + 30, y);
        doc.setFont("helvetica", "normal");
        doc.text(formData.aluno.nota, docWidth / 2 + 68, y);
        y += lineHeight;

        // Função para desenhar seções com checkboxes
        const drawCheckboxSection = (title, items, name, outrosText) => {
            y += sectionSpacing;
            checkPageBreak();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(title, margin, y);
            y += lineHeight;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            
            if (items.length === 0) {
                doc.text("- Nenhuma opção selecionada.", margin, y);
                y += lineHeight;
            } else {
                items.forEach(item => {
                    checkPageBreak();
                    let label = obterLabelCheckbox(item, name);
                    if (item === 'outros' && outrosText) {
                        const splitText = doc.splitTextToSize(`- ${label}: ${outrosText}`, docWidth - (margin * 2) - 5);
                        doc.text(splitText, margin, y);
                        y += splitText.length * (lineHeight - 2);
                    } else {
                        doc.text(`- ${label}`, margin, y);
                        y += lineHeight - 1;
                    }
                });
            }
        };

        // Desenhar seções
        drawCheckboxSection("PRINCIPAIS DIFICULDADES DO ALUNO", formData.dificuldades, 'dificuldade', formData.dificuldadeOutrosTexto);
        
        y += sectionSpacing;
        checkPageBreak();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("OBJETIVOS NÃO ATINGIDOS:", margin, y);
        y += lineHeight;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const objetivosText = formData.objetivosNaoAtingidos || "Nenhum informado.";
        const splitObjetivos = doc.splitTextToSize(objetivosText, docWidth - (margin * 2));
        doc.text(splitObjetivos, margin, y);
        y += splitObjetivos.length * (lineHeight - 1);
        
        drawCheckboxSection("RECOMENDAÇÕES DO PROFESSOR AO ALUNO", formData.recomendacoesAluno, 'recomendacaoAluno', formData.recomendacaoAlunoOutrosTexto);
        drawCheckboxSection("RECOMENDAÇÕES DO PROFESSOR AOS PAIS OU RESPONSÁVEIS", formData.recomendacoesPais, 'recomendacaoPais', formData.recomendacaoPaisOutrosTexto);
        drawCheckboxSection("PROVIDÊNCIAS DO PROFESSOR E DA ESCOLA PARA AUXILIAR O ALUNO", formData.providencias, 'providencia', formData.providenciaOutrosTexto);

        // --- Salvar o PDF ---
        doc.save(`Ficha_Avaliacao_${formData.aluno.nome.replace(/ /g, "_")}.pdf`);
    }
});