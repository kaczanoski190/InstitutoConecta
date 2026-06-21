const API_URL = '/api';

function getToken() {
    return localStorage.getItem('conecta_token');
}

function setToken(token) {
    localStorage.setItem('conecta_token', token);
}

function getUser() {
    const userStr = localStorage.getItem('conecta_user');
    return userStr ? JSON.parse(userStr) : null;
}

function setUser(user) {
    localStorage.setItem('conecta_user', JSON.stringify(user));
}

function isLoggedIn() {
    return !!getToken();
}

function logout() {
    localStorage.removeItem('conecta_token');
    localStorage.removeItem('conecta_user');
    window.location.href = '/login.html';
}

async function apiFetch(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers
    };
    
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(url, config);
        
        if (response.status === 401 || response.status === 403) {
            if (!window.location.pathname.includes('login.html')) {
                localStorage.removeItem('conecta_token');
                localStorage.removeItem('conecta_user');
                window.location.href = '/login.html';
                return;
            }
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Ocorreu um erro ao processar a requisição.');
        }
        
        return data;
    } catch (error) {
        console.error(`Erro na chamada API (${endpoint}):`, error);
        throw error;
    }
}

function formatDateBR(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const year = adjustedDate.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateInput(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatCPF(cpf) {
    if (!cpf) return '-';
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return cpf;
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}
