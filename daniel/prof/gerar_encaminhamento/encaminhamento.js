document.addEventListener('DOMContentLoaded', () => {
    // Time input visibility and interaction
    const horarioCheckboxes = document.querySelectorAll('input[name="horario"]');
    const horarioInputs = {
        'entradaAtrasada': document.getElementById('horarioEntrada'),
        'saidaAntecipada': document.getElementById('horarioSaida')
    };

    horarioCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Hide all time inputs first
            Object.values(horarioInputs).forEach(input => {
                input.style.display = 'none';
            });

            // If checkbox is checked, show its corresponding time input
            if (this.checked) {
                const correspondingInput = horarioInputs[this.id];
                correspondingInput.style.display = 'block';

                // Uncheck other horario checkboxes
                horarioCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
            }
        });

        // Always show time input when clicking on checkbox
        checkbox.addEventListener('click', function() {
            const correspondingInput = horarioInputs[this.id];
            
            // If unchecking, hide the input
            if (!this.checked) {
                correspondingInput.style.display = 'none';
            } else {
                // If checking, show the input
                correspondingInput.style.display = 'block';
                correspondingInput.focus(); // Automatically focus on the time input
            }
        });
    });

    // Motivos Pessoais textarea visibility toggle
    const motivosPessoaisCheckbox = document.getElementById('motivosPessoais');
    const motivosPessoaisTexto = document.getElementById('motivosPessoaisTexto');
    motivosPessoaisCheckbox.addEventListener('change', function() {
        motivosPessoaisTexto.style.display = this.checked ? 'block' : 'none';
        if (this.checked) {
            motivosPessoaisTexto.focus(); // Automatically focus on the textarea
        }
    });

    // Motivos checkbox mutual exclusivity
    const motivosCheckboxes = document.querySelectorAll('input[name="motivo"]');
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

    // Gerar Encaminhamento button functionality
    const gerarEncaminhamentoBtn = document.getElementById('gerarEncaminhamento');
    gerarEncaminhamentoBtn.addEventListener('click', () => {
        // Collect form data
        const formData = {
            nome: document.getElementById('nome').value,
            turma: document.getElementById('turma').value,
            nascimento: document.getElementById('nascimento').value,
            horario: {
                tipo: document.querySelector('input[name="horario"]:checked')?.value,
                tempo: document.querySelector('input[name="horario"]:checked')?.nextElementSibling.value
            },
            motivo: {
                tipo: document.querySelector('input[name="motivo"]:checked')?.value,
                descricao: document.getElementById('motivosPessoaisTexto')?.value
            }
        };

        // Basic validation
        if (!formData.nome) {
            alert('Por favor, preencha o nome do aluno.');
            return;
        }

        // Validate horario input if a horario checkbox is checked
        if (formData.horario.tipo && !formData.horario.tempo) {
            alert('Por favor, selecione o horário para ' + 
                (formData.horario.tipo === 'entrada-atrasada' ? 'entrada atrasada' : 'saída antecipada'));
            return;
        }

        // Generate document (simplified - you'd typically use a backend service)
        generateDocument(formData);
    });

    // Mock document generation function
    function generateDocument(data) {
        let documentContent = `SENAI 302 DIMP - ENCAMINHAMENTO\n\n`;
        documentContent += `Nome do Aluno: ${data.nome}\n`;
        documentContent += `Turma: ${data.turma}\n`;
        
        if (data.nascimento) {
            documentContent += `Data de Nascimento: ${data.nascimento}\n`;
        }

        if (data.horario.tipo) {
            documentContent += `Motivo de Horário: ${getHorarioLabel(data.horario.tipo)} - ${data.horario.tempo}\n`;
        }

        if (data.motivo.tipo) {
            documentContent += `Motivo: ${getMotivoLabel(data.motivo.tipo)}\n`;
            if (data.motivo.tipo === 'motivos-pessoais') {
                documentContent += `Descrição: ${data.motivo.descricao}\n`;
            }
        }

        // In a real application, this would typically call a backend service to generate a Word document
        // For now, we'll create a downloadable text file
        const blob = new Blob([documentContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Encaminhamento_${data.nome}.txt`;
        link.click();
    }

    // Helper functions to convert values to readable labels
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
