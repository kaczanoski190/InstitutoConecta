document.addEventListener('DOMContentLoaded', async () => {
    const coursesGrid = document.getElementById('courses-grid');
    const loginBtnContainer = document.getElementById('login-btn-container');

    // Botão de acesso rápido apontando para a demonstração interativa
    if (loginBtnContainer) {
        loginBtnContainer.innerHTML = `<a href="demo.html#login" class="btn-login"><i class="fa-solid fa-right-to-bracket"></i> Acessar Minha Conta</a>`;
    }

    try {
        const courses = await apiFetch('/courses');
        
        if (!coursesGrid) return;
        
        coursesGrid.innerHTML = '';
        
        if (courses.length === 0) {
            coursesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Nenhum curso disponível no momento.</p>';
            return;
        }

        courses.forEach(course => {
            if (course.status !== 'Ativo') return;

            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <div>
                    <h3>${escapeHTML(course.titulo)}</h3>
                    <p>${escapeHTML(course.descricao || 'Sem descrição cadastrada.')}</p>
                </div>
                <div class="course-meta">
                    <span><i class="fa-solid fa-clock"></i> ${course.carga_horaria}h</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(course.modalidade)}</span>
                    <span><i class="fa-solid fa-users"></i> ${course.vagas} vagas</span>
                </div>
            `;
            coursesGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        if (coursesGrid) {
            coursesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger);">Não foi possível carregar os cursos. Tente novamente mais tarde.</p>';
        }
    }
});

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
