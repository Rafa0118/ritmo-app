const calendarGrid = document.querySelector('#calendarGrid');
const monthTitle = document.querySelector('#monthTitle');
const routineList = document.querySelector('#routineList');
const toast = document.querySelector('#toast');
const chatPanel = document.querySelector('#chatPanel');
const chatMessages = document.querySelector('#chatMessages');
const chatInput = document.querySelector('#chatInput');
const eventModal = document.querySelector('#eventModal');
const eventForm = document.querySelector('#eventForm');
const eventName = document.querySelector('#eventName');
const eventTone = document.querySelector('#eventTone');
const deleteEvent = document.querySelector('#deleteEvent');
const completedCount = document.querySelector('#completedCount');
const routineTotal = document.querySelector('#routineTotal');
const pendingCount = document.querySelector('#pendingCount');
const progressPercent = document.querySelector('#progressPercent');
const progressSummary = document.querySelector('#progressSummary');
const progressMessage = document.querySelector('#progressMessage');
const progressRing = document.querySelector('.progress-ring');
const routineModal = document.querySelector('#routineModal');
const routineForm = document.querySelector('#routineForm');
const routineName = document.querySelector('#routineName');
const routineTime = document.querySelector('#routineTime');
let displayedProgress = 50;
let progressAnimation;
let displayedMonth = new Date(2025, 7, 1);
const defaultEvents = { 2: [['Planejar semana', 'coral']], 4: [['Treino', 'blue'], ['Leitura', 'yellow']], 7: [['Revisar metas', 'coral']], 12: [['Meditação', 'blue']], 15: [['Projeto pessoal', 'coral']], 18: [['Caminhada', 'green'], ['Jantar', 'yellow']], 21: [['Revisar prioridades', 'coral'], ['Caminhada', 'blue']], 24: [['Dia sem telas', 'green']], 28: [['Fechamento do mês', 'coral']] };
let events = JSON.parse(localStorage.getItem('ritmo-events')) || defaultEvents;
let selectedEvent = null;

function renderCalendar() {
    const year = displayedMonth.getFullYear(); const month = displayedMonth.getMonth();
    const monthName = displayedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    monthTitle.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate(); const previousDays = new Date(year, month, 0).getDate();
    calendarGrid.innerHTML = '';
    for (let index = 0; index < 42; index += 1) {
        const day = index - firstDay + 1; const cell = document.createElement('div'); cell.className = 'calendar-day'; let dayNumber = day;
        if (day < 1) { cell.classList.add('muted'); dayNumber = previousDays + day; } if (day > daysInMonth) { cell.classList.add('muted'); dayNumber = day - daysInMonth; } if (day === 21 && month === 7 && year === 2025) cell.classList.add('today');
        cell.innerHTML = `<span class="day-number">${dayNumber}</span>`;
        if (day >= 1 && day <= daysInMonth && events[day]) {
            const eventList = document.createElement('div'); eventList.className = 'event-list';
            events[day].forEach(([label, tone], eventIndex) => { const event = document.createElement('button'); event.className = `event ${tone}`; event.textContent = label; event.dataset.day = day; event.dataset.eventIndex = eventIndex; eventList.appendChild(event); });
            cell.appendChild(eventList);
        }
        if (day >= 1 && day <= daysInMonth) { cell.dataset.day = day; cell.addEventListener('click', (event) => { if (event.target.classList.contains('event')) return; openEventEditor(day); }); }
        calendarGrid.appendChild(cell);
    }
}
function showToast(message) { toast.textContent = message; toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 2200); }
function animateProgress(targetProgress) {
    cancelAnimationFrame(progressAnimation);
    const startProgress = displayedProgress;
    const startTime = performance.now();
    const duration = 700;
    function drawProgress(currentTime) {
        const elapsed = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        displayedProgress = startProgress + (targetProgress - startProgress) * eased;
        progressRing.style.background = `conic-gradient(var(--coral) ${displayedProgress}%, #dfddd4 0)`;
        if (elapsed < 1) progressAnimation = requestAnimationFrame(drawProgress);
    }
    progressAnimation = requestAnimationFrame(drawProgress);
}
function updateRoutineProgress() {
    const total = routineList.querySelectorAll('.routine-item').length;
    const completed = routineList.querySelectorAll('.routine-item.done').length;
    const pending = total - completed;
    const percentage = total ? Math.round((completed / total) * 100) : 0;
    completedCount.textContent = String(completed).padStart(2, '0'); routineTotal.textContent = String(total).padStart(2, '0');
    pendingCount.textContent = pending === 0 ? 'Tudo concluído' : `${pending} ${pending === 1 ? 'pendente' : 'pendentes'}`;
    progressPercent.textContent = `${percentage}%`; progressSummary.textContent = `${completed} de ${total}`; progressMessage.textContent = percentage === 100 ? 'Dia completo!' : percentage >= 50 ? 'Bom trabalho!' : 'Vamos no ritmo certo.';
    animateProgress(percentage);
}
function saveEvents() { localStorage.setItem('ritmo-events', JSON.stringify(events)); }
function openEventEditor(day, eventIndex = null) { selectedEvent = { day, eventIndex }; const current = eventIndex === null ? ['', 'coral'] : events[day][eventIndex]; document.querySelector('#eventModalTitle').textContent = eventIndex === null ? 'Novo evento' : 'Editar evento'; eventName.value = current[0]; eventTone.value = current[1]; deleteEvent.hidden = eventIndex === null; eventModal.classList.add('open'); eventModal.setAttribute('aria-hidden', 'false'); eventName.focus(); }
function closeEventEditor() { eventModal.classList.remove('open'); eventModal.setAttribute('aria-hidden', 'true'); selectedEvent = null; }
function openRoutineEditor() { routineModal.classList.add('open'); routineModal.setAttribute('aria-hidden', 'false'); routineName.value = ''; routineTime.value = '09:00'; routineName.focus(); }
function closeRoutineEditor() { routineModal.classList.remove('open'); routineModal.setAttribute('aria-hidden', 'true'); }
function formatRoutineTime(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (!digits) return '';
    let hours = digits.slice(0, 2);
    let minutes = digits.slice(2, 4);
    if (hours.length === 2) hours = String(Math.min(Number(hours), 23)).padStart(2, '0');
    if (minutes.length === 2) minutes = String(Math.min(Number(minutes), 59)).padStart(2, '0');
    return minutes ? `${hours}:${minutes}` : hours;
}
function addChatMessage(message, type) { const bubble = document.createElement('div'); bubble.className = `chat-message ${type}-message`; bubble.textContent = message; chatMessages.appendChild(bubble); chatMessages.scrollTop = chatMessages.scrollHeight; }
function normalizeText(text) { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function routineSummary() {
    const items = [...routineList.querySelectorAll('.routine-item')];
    const completed = items.filter((item) => item.classList.contains('done')).map((item) => item.querySelector('strong').textContent);
    const pending = items.filter((item) => !item.classList.contains('done')).map((item) => item.querySelector('strong').textContent);
    return { completed, pending, total: items.length };
}
function answerQuestion(question) {
    const normalized = normalizeText(question);
    const { completed, pending, total } = routineSummary();
    const focusTerms = ['rotina', 'tarefa', 'habito', 'calendario', 'agenda', 'foco', 'produtiv', 'prioridade', 'descans', 'sono', 'estress', 'ansied', 'disciplina', 'concentr', 'procrastin', 'organizar', 'planejar', 'hoje', 'agora', 'tenho'];
    if (/^(oi|ola|olá|bom dia|boa tarde|boa noite|hey|hello)\b/.test(normalized)) return 'Oi! Estou pronto para ajudar. Pode perguntar sobre sua rotina, estudos, foco, descanso, calendário ou qualquer outro assunto.';
    if (/obrigad|valeu|perfeito|entendi/.test(normalized)) return 'Por nada! Quando precisar, estou aqui para pensar junto com você.';
    if (/quem e voce|o que voce faz|como voce funciona/.test(normalized)) return 'Sou o Assistente Ritmo. Organizo informações do seu dia, respondo dúvidas gerais e ajudo você a transformar intenções em próximos passos práticos.';
    if (/que horas|horario|hora agora/.test(normalized)) return `Agora são ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`;
    if (/que dia|data de hoje|hoje e/.test(normalized)) return `Hoje é ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}.`;
    if (/^[\d\s()+\-*/.,]+$/.test(question)) {
        try { const result = Function(`"use strict"; return (${question.replace(',', '.')})`)(); if (Number.isFinite(result)) return `O resultado é ${result}.`; } catch { return 'Esse cálculo parece incompleto. Envie uma expressão como 12 * 4.'; }
    }
    if (/(o que|quais|lista|tenho|tarefas|rotinas).*(hoje|agora)|hoje.*(tarefa|rotina)/.test(normalized)) {
        return pending.length ? `Hoje você tem ${pending.length} tarefas pendentes: ${pending.join(', ')}. Você já concluiu ${completed.length} de ${total}.` : `Você concluiu todas as ${total} rotinas de hoje. Excelente trabalho!`;
    }
    if (/quantas|quantos|progresso|complet/.test(normalized) && /tarefa|rotina|hoje/.test(normalized)) return `Você completou ${completed.length} de ${total} rotinas. ${pending.length ? `Faltam: ${pending.join(', ')}.` : 'Tudo concluído, excelente trabalho!'}`;
    if (/organizar|planejar|prioridade|produtiv/.test(normalized)) return 'Escolha no máximo três prioridades. Comece pela mais importante, divida tarefas grandes em blocos de 25 minutos e reserve pausas curtas para recuperar energia.';
    if (/habito|hábito|consistencia|disciplina/.test(normalized)) return 'Comece pequeno: escolha uma ação de menos de 10 minutos, conecte-a a algo que você já faz e marque cada repetição. Ajuste o plano, mas evite abandonar a sequência por causa de um dia ruim.';
    if (/foco|concentr|procrastin/.test(normalized)) return 'Reduza o começo: deixe apenas a próxima ação visível, tire notificações por 25 minutos e defina um objetivo concreto para esse bloco. Depois, faça uma pausa de 5 minutos.';
    if (/descans|sono|dormir|ansied|estress/.test(normalized)) return 'Tente reduzir estímulos à noite, manter um horário previsível e escolher uma atividade calma antes de dormir. Se isso estiver afetando sua saúde ou rotina por muito tempo, converse com um profissional.';
    if (/calendario|agenda|evento|rotina/.test(normalized)) return 'No calendário, clique em um dia vazio para criar um evento. Clique em um evento existente para editar ou excluir. As alterações ficam salvas neste navegador.';
    if (!focusTerms.some((term) => normalized.includes(term))) return 'Essa pergunta fugiu bastante do meu foco. Posso ajudar você com organização da rotina, tarefas, calendário, hábitos, produtividade, foco, descanso e planejamento do dia.';
    if (/como|o que|por que|qual|pode/.test(normalized)) return 'Boa pergunta. Para responder melhor, me diga qual é o objetivo, o contexto e o que você já tentou. Assim consigo sugerir um próximo passo mais útil.';
    return 'Posso ajudar com sua rotina, foco, hábitos, tarefas e calendário. Qual desses assuntos você quer organizar agora?';
}
function sendChat(question) { const cleanQuestion = question.trim(); if (!cleanQuestion) return; addChatMessage(cleanQuestion, 'user'); chatInput.value = ''; const thinking = document.createElement('div'); thinking.className = 'chat-message assistant-message thinking'; thinking.textContent = 'Pensando...'; chatMessages.appendChild(thinking); chatMessages.scrollTop = chatMessages.scrollHeight; setTimeout(() => { thinking.remove(); addChatMessage(answerQuestion(cleanQuestion), 'assistant'); }, 450); }
document.querySelector('#previousMonth').addEventListener('click', () => { displayedMonth.setMonth(displayedMonth.getMonth() - 1); renderCalendar(); });
document.querySelector('#nextMonth').addEventListener('click', () => { displayedMonth.setMonth(displayedMonth.getMonth() + 1); renderCalendar(); });
document.querySelector('#todayButton').addEventListener('click', () => { displayedMonth = new Date(2025, 7, 1); renderCalendar(); showToast('Voltamos para hoje'); });
calendarGrid.addEventListener('click', (event) => { if (!event.target.classList.contains('event')) return; openEventEditor(Number(event.target.dataset.day), Number(event.target.dataset.eventIndex)); });
eventForm.addEventListener('submit', (event) => { event.preventDefault(); const { day, eventIndex } = selectedEvent; if (!events[day]) events[day] = []; const updatedEvent = [eventName.value.trim(), eventTone.value]; if (eventIndex === null) events[day].push(updatedEvent); else events[day][eventIndex] = updatedEvent; saveEvents(); renderCalendar(); closeEventEditor(); showToast(eventIndex === null ? 'Evento adicionado ao calendário' : 'Evento atualizado'); });
deleteEvent.addEventListener('click', () => { const { day, eventIndex } = selectedEvent; events[day].splice(eventIndex, 1); if (!events[day].length) delete events[day]; saveEvents(); renderCalendar(); closeEventEditor(); showToast('Evento removido'); });
document.querySelector('#closeEventModal').addEventListener('click', closeEventEditor);
eventModal.addEventListener('click', (event) => { if (event.target === eventModal) closeEventEditor(); });
document.querySelector('#addRoutine').addEventListener('click', openRoutineEditor);
document.querySelector('#addTask').addEventListener('click', openRoutineEditor);
routineTime.addEventListener('input', () => { routineTime.value = formatRoutineTime(routineTime.value); routineTime.setCustomValidity(''); });
routineForm.addEventListener('submit', (event) => { event.preventDefault(); if (!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(routineTime.value)) { routineTime.setCustomValidity('Use o formato 24 horas, por exemplo 09:30.'); routineTime.reportValidity(); return; } routineTime.setCustomValidity(''); const item = document.createElement('div'); item.className = 'routine-item'; item.innerHTML = `<button class="check" aria-label="Marcar como concluído"></button><div><strong>${routineName.value.trim()}</strong><span>${routineTime.value} · Pessoal</span></div><b class="routine-dot yellow"></b>`; routineList.appendChild(item); updateRoutineProgress(); closeRoutineEditor(); showToast('Rotina adicionada ao seu dia'); });
document.querySelector('#closeRoutineModal').addEventListener('click', closeRoutineEditor);
routineModal.addEventListener('click', (event) => { if (event.target === routineModal) closeRoutineEditor(); });
routineList.addEventListener('click', (event) => { if (!event.target.classList.contains('check')) return; const item = event.target.closest('.routine-item'); item.classList.toggle('done'); event.target.textContent = item.classList.contains('done') ? '✓' : ''; event.target.setAttribute('aria-label', item.classList.contains('done') ? 'Marcar como pendente' : 'Marcar como concluído'); updateRoutineProgress(); });
document.querySelectorAll('#openChat, #topChat').forEach((button) => button.addEventListener('click', () => { chatPanel.classList.add('open'); chatPanel.setAttribute('aria-hidden', 'false'); chatInput.focus(); }));
document.querySelector('#closeChat').addEventListener('click', () => { chatPanel.classList.remove('open'); chatPanel.setAttribute('aria-hidden', 'true'); });
document.querySelector('#chatForm').addEventListener('submit', (event) => { event.preventDefault(); sendChat(chatInput.value); });
document.querySelectorAll('.chat-suggestions button').forEach((button) => button.addEventListener('click', () => sendChat(button.dataset.question)));
renderCalendar();
updateRoutineProgress();
