document.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        window.location.href = '/admin.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const alertDiv = document.getElementById('login-alert');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        alertDiv.style.display = 'none';
        alertDiv.textContent = '';

        if (!email || !password) {
            showAlert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: { email, password }
            });

            setToken(data.token);
            setUser(data.user);

            window.location.href = '/admin.html';
        } catch (error) {
            showAlert(error.message || 'Falha ao tentar realizar o login. Verifique os dados inseridos.');
        }
    });

    function showAlert(message) {
        alertDiv.textContent = message;
        alertDiv.style.display = 'block';
    }
});
