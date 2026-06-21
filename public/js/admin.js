let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    currentUser = getUser();
    
    document.getElementById('user-display-name').textContent = currentUser.nome;
    document.getElementById('user-display-role').textContent = currentUser.perfil === 'ADMIN' ? 'Administrador' : 'Usuário';

    const userMenuLi = document.getElementById('menu-li-users');
    if (currentUser.perfil !== 'ADMIN' && userMenuLi) {
        userMenuLi.style.display = 'none';
    }

    initNavigation();
    loadDashboard();
    initUsersCRUD();
    initCoursesCRUD();
    initParticipantsCRUD();
    initEnrollmentsCRUD();

    document.getElementById('btn-logout').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});

function initNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            
            if (!targetTab) return;

            menuItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            item.classList.add('active');
            const targetEl = document.getElementById(targetTab);
            if (targetEl) {
                targetEl.classList.add('active');
            }

            switch(targetTab) {
                case 'tab-dashboard':
                    loadDashboard();
                    break;
                case 'tab-users':
                    if (currentUser.perfil === 'ADMIN') loadUsers();
                    break;
                case 'tab-courses':
                    loadCourses();
                    break;
                case 'tab-participants':
                    loadParticipants();
                    break;
                case 'tab-enrollments':
                    loadEnrollments();
                    break;
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) closeModal(modal.id);
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

async function loadDashboard() {
    try {
        const data = await apiFetch('/dashboard/metrics');
        
        document.getElementById('dash-count-participants').textContent = data.totalParticipantes;
        document.getElementById('dash-count-courses').textContent = data.totalCursos;
        document.getElementById('dash-count-enrollments').textContent = data.totalInscricoes;

        const tbody = document.getElementById('dash-popular-courses-tbody');
        tbody.innerHTML = '';

        if (data.cursosPopulares.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum dado de inscrição disponível.</td></tr>';
            return;
        }

        data.cursosPopulares.forEach(course => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHTML(course.titulo)}</strong></td>
                <td>${escapeHTML(course.modalidade)}</td>
                <td>${course.vagas}</td>
                <td><span class="badge badge-success">${course.total_inscritos} inscritos</span></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro ao carregar métricas:', error);
    }
}

let usersList = [];

function initUsersCRUD() {
    const form = document.getElementById('user-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const nome = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const senha = document.getElementById('user-password').value;
        const perfil = document.getElementById('user-profile').value;

        const payload = { nome, email, perfil };
        if (senha) payload.senha = senha;

        try {
            if (id) {
                await apiFetch(`/users/${id}`, {
                    method: 'PUT',
                    body: payload
                });
                alert('Usuário atualizado com sucesso!');
            } else {
                if (!senha) {
                    alert('Senha é obrigatória para novos usuários.');
                    return;
                }
                payload.senha = senha;
                await apiFetch('/users', {
                    method: 'POST',
                    body: payload
                });
                alert('Usuário criado com sucesso!');
            }
            closeModal('modal-user');
            loadUsers();
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('btn-add-user').addEventListener('click', () => {
        document.getElementById('user-modal-title').textContent = 'Cadastrar Novo Usuário';
        document.getElementById('user-id').value = '';
        document.getElementById('user-password').placeholder = 'Senha de acesso';
        document.getElementById('user-password-help').textContent = '';
        openModal('modal-user');
    });
}

async function loadUsers() {
    try {
        usersList = await apiFetch('/users');
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';

        if (usersList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum usuário cadastrado.</td></tr>';
            return;
        }

        usersList.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td><strong>${escapeHTML(user.nome)}</strong></td>
                <td>${escapeHTML(user.email)}</td>
                <td><span class="badge ${user.perfil === 'ADMIN' ? 'badge-info' : 'badge-success'}">${user.perfil}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editUser(${user.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" onclick="deleteUser(${user.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

window.editUser = function(id) {
    const user = usersList.find(u => u.id === id);
    if (!user) return;

    document.getElementById('user-modal-title').textContent = 'Editar Usuário';
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.nome;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-profile').value = user.perfil;
    document.getElementById('user-password').value = '';
    document.getElementById('user-password').placeholder = 'Deixe em branco para não alterar';
    document.getElementById('user-password-help').textContent = 'Preencha apenas se deseja alterar a senha atual.';

    openModal('modal-user');
}

window.deleteUser = async function(id) {
    if (confirm('Deseja realmente excluir este usuário?')) {
        try {
            await apiFetch(`/users/${id}`, { method: 'DELETE' });
            alert('Usuário excluído com sucesso!');
            loadUsers();
        } catch (error) {
            alert(error.message);
        }
    }
}

let coursesList = [];

function initCoursesCRUD() {
    const form = document.getElementById('course-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('course-id').value;
        const titulo = document.getElementById('course-title').value.trim();
        const descricao = document.getElementById('course-description').value.trim();
        const carga_horaria = parseInt(document.getElementById('course-hours').value);
        const modalidade = document.getElementById('course-modality').value;
        const vagas = parseInt(document.getElementById('course-vacancies').value);
        const data_inicio = document.getElementById('course-start-date').value;
        const data_fim = document.getElementById('course-end-date').value;
        const status = document.getElementById('course-status').value;

        const payload = { titulo, descricao, carga_horaria, modalidade, vagas, data_inicio, data_fim, status };

        try {
            if (id) {
                await apiFetch(`/courses/${id}`, {
                    method: 'PUT',
                    body: payload
                });
                alert('Curso atualizado com sucesso!');
            } else {
                await apiFetch('/courses', {
                    method: 'POST',
                    body: payload
                });
                alert('Curso cadastrado com sucesso!');
            }
            closeModal('modal-course');
            loadCourses();
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('btn-add-course').addEventListener('click', () => {
        document.getElementById('course-modal-title').textContent = 'Cadastrar Novo Curso';
        document.getElementById('course-id').value = '';
        openModal('modal-course');
    });

    document.getElementById('course-search').addEventListener('input', (e) => {
        loadCourses(e.target.value.trim());
    });
}

async function loadCourses(search = '') {
    try {
        coursesList = await apiFetch(`/courses?search=${encodeURIComponent(search)}`);
        const tbody = document.getElementById('courses-tbody');
        tbody.innerHTML = '';

        if (coursesList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum curso encontrado.</td></tr>';
            return;
        }

        coursesList.forEach(course => {
            const tr = document.createElement('tr');
            
            let statusBadge = 'badge-success';
            if (course.status === 'Planejado') statusBadge = 'badge-info';
            if (course.status === 'Concluído') statusBadge = 'badge-success';
            if (course.status === 'Cancelado') statusBadge = 'badge-danger';

            tr.innerHTML = `
                <td>${course.id}</td>
                <td><strong>${escapeHTML(course.titulo)}</strong></td>
                <td>${course.carga_horaria}h</td>
                <td>${escapeHTML(course.modalidade)}</td>
                <td>${course.vagas}</td>
                <td>${formatDateBR(course.data_inicio)}</td>
                <td><span class="badge ${statusBadge}">${course.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editCourse(${course.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" onclick="deleteCourse(${course.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
}

window.editCourse = function(id) {
    const course = coursesList.find(c => c.id === id);
    if (!course) return;

    document.getElementById('course-modal-title').textContent = 'Editar Curso';
    document.getElementById('course-id').value = course.id;
    document.getElementById('course-title').value = course.titulo;
    document.getElementById('course-description').value = course.descricao || '';
    document.getElementById('course-hours').value = course.carga_horaria;
    document.getElementById('course-modality').value = course.modalidade;
    document.getElementById('course-vacancies').value = course.vagas;
    document.getElementById('course-start-date').value = formatDateInput(course.data_inicio);
    document.getElementById('course-end-date').value = formatDateInput(course.data_fim);
    document.getElementById('course-status').value = course.status;

    openModal('modal-course');
}

window.deleteCourse = async function(id) {
    if (confirm('Deseja realmente excluir este curso? Todas as inscrições relacionadas serão removidas permanentemente!')) {
        try {
            await apiFetch(`/courses/${id}`, { method: 'DELETE' });
            alert('Curso excluído com sucesso!');
            loadCourses();
        } catch (error) {
            alert(error.message);
        }
    }
}

let participantsList = [];

function initParticipantsCRUD() {
    const form = document.getElementById('participant-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('participant-id').value;
        const nome = document.getElementById('participant-name').value.trim();
        const cpf = document.getElementById('participant-cpf').value.trim();
        const email = document.getElementById('participant-email').value.trim();
        const telefone = document.getElementById('participant-phone').value.trim();
        const municipio = document.getElementById('participant-municipality').value.trim();
        const escolaridade = document.getElementById('participant-education').value;

        const payload = { nome, cpf, email, telefone, municipio, escolaridade };

        try {
            if (id) {
                await apiFetch(`/participants/${id}`, {
                    method: 'PUT',
                    body: payload
                });
                alert('Dados do participante atualizados com sucesso!');
            } else {
                await apiFetch('/participants', {
                    method: 'POST',
                    body: payload
                });
                alert('Participante cadastrado com sucesso!');
            }
            closeModal('modal-participant');
            loadParticipants();
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('btn-add-participant').addEventListener('click', () => {
        document.getElementById('participant-modal-title').textContent = 'Cadastrar Novo Participante';
        document.getElementById('participant-id').value = '';
        openModal('modal-participant');
    });

    document.getElementById('participant-search').addEventListener('input', (e) => {
        loadParticipants(e.target.value.trim());
    });
}

async function loadParticipants(search = '') {
    try {
        participantsList = await apiFetch(`/participants?search=${encodeURIComponent(search)}`);
        const tbody = document.getElementById('participants-tbody');
        tbody.innerHTML = '';

        if (participantsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum participante encontrado.</td></tr>';
            return;
        }

        participantsList.forEach(part => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${part.id}</td>
                <td><strong>${escapeHTML(part.nome)}</strong></td>
                <td>${formatCPF(part.cpf)}</td>
                <td>${escapeHTML(part.email)}</td>
                <td>${escapeHTML(part.telefone)}</td>
                <td>${escapeHTML(part.municipio)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editParticipant(${part.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" onclick="deleteParticipant(${part.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar participantes:', error);
    }
}

window.editParticipant = function(id) {
    const part = participantsList.find(p => p.id === id);
    if (!part) return;

    document.getElementById('participant-modal-title').textContent = 'Editar Participante';
    document.getElementById('participant-id').value = part.id;
    document.getElementById('participant-name').value = part.nome;
    document.getElementById('participant-cpf').value = part.cpf;
    document.getElementById('participant-email').value = part.email;
    document.getElementById('participant-phone').value = part.telefone;
    document.getElementById('participant-municipality').value = part.municipio;
    document.getElementById('participant-education').value = part.escolaridade;

    openModal('modal-participant');
}

window.deleteParticipant = async function(id) {
    if (confirm('Deseja realmente excluir este participante? Todas as suas inscrições serão removidas permanentemente!')) {
        try {
            await apiFetch(`/participants/${id}`, { method: 'DELETE' });
            alert('Participante excluído com sucesso!');
            loadParticipants();
        } catch (error) {
            alert(error.message);
        }
    }
}

let enrollmentsList = [];

function initEnrollmentsCRUD() {
    const form = document.getElementById('enrollment-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const participante_id = parseInt(document.getElementById('enroll-participant-select').value);
        const curso_id = parseInt(document.getElementById('enroll-course-select').value);

        if (!participante_id || !curso_id) {
            alert('Por favor, selecione o participante e o curso.');
            return;
        }

        try {
            await apiFetch('/enrollments', {
                method: 'POST',
                body: { participante_id, curso_id }
            });
            alert('Inscrição efetuada com sucesso!');
            closeModal('modal-enrollment');
            loadEnrollments();
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('btn-add-enrollment').addEventListener('click', async () => {
        try {
            const parts = await apiFetch('/participants');
            const courses = await apiFetch('/courses');

            const partSelect = document.getElementById('enroll-participant-select');
            const courseSelect = document.getElementById('enroll-course-select');

            partSelect.innerHTML = '<option value="">-- Selecione o Participante --</option>';
            courseSelect.innerHTML = '<option value="">-- Selecione o Curso --</option>';

            parts.forEach(p => {
                partSelect.innerHTML += `<option value="${p.id}">${escapeHTML(p.nome)} (CPF: ${formatCPF(p.cpf)})</option>`;
            });

            courses.forEach(c => {
                if (c.status === 'Ativo') {
                    courseSelect.innerHTML += `<option value="${c.id}">${escapeHTML(c.titulo)} (Vagas: ${c.vagas})</option>`;
                }
            });

            openModal('modal-enrollment');
        } catch (error) {
            alert('Erro ao carregar dados dos formulários.');
        }
    });
}

async function loadEnrollments() {
    try {
        enrollmentsList = await apiFetch('/enrollments');
        const tbody = document.getElementById('enrollments-tbody');
        tbody.innerHTML = '';

        if (enrollmentsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma inscrição registrada.</td></tr>';
            return;
        }

        enrollmentsList.forEach(enroll => {
            const tr = document.createElement('tr');
            
            const badgeClass = enroll.status === 'Ativo' ? 'badge-success' : 'badge-danger';

            const cancelBtn = enroll.status === 'Ativo' 
                ? `<button class="btn-action btn-delete" onclick="cancelEnrollment(${enroll.id})" title="Cancelar Inscrição"><i class="fa-solid fa-ban"></i></button>`
                : `<span style="font-size:0.85rem;color:var(--text-muted);">Cancelado</span>`;

            tr.innerHTML = `
                <td>${enroll.id}</td>
                <td><strong>${escapeHTML(enroll.participante_nome)}</strong><br><small>${escapeHTML(enroll.participante_email)}</small></td>
                <td><strong>${escapeHTML(enroll.curso_titulo)}</strong></td>
                <td>${formatDateBR(enroll.data_inscricao)}</td>
                <td><span class="badge ${badgeClass}">${enroll.status}</span></td>
                <td>
                    <div class="action-buttons">
                        ${cancelBtn}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar inscrições:', error);
    }
}

window.cancelEnrollment = async function(id) {
    if (confirm('Deseja realmente CANCELAR esta inscrição? Esta ação atualizará o status e liberará a vaga do curso.')) {
        try {
            await apiFetch(`/enrollments/${id}/cancelar`, { method: 'PUT' });
            alert('Inscrição cancelada com sucesso!');
            loadEnrollments();
        } catch (error) {
            alert(error.message);
        }
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
