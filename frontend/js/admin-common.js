const AdminCommon = {
    API_BASE: '/api',
    
    // Toggle tema común
    toggleTheme() {
        const body = document.body;
        const themeToggle = document.querySelector('.theme-toggle');
        
        if (body.getAttribute('data-theme') === 'dark') {
            body.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '☀️';
            localStorage.setItem('admin-theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '🌙';
            localStorage.setItem('admin-theme', 'dark');
        }
    },
    
    // Cargar tema guardado
    loadTheme() {
        const savedTheme = localStorage.getItem('admin-theme') || 'dark';
        const body = document.body;
        const themeToggle = document.querySelector('.theme-toggle');
        
        body.setAttribute('data-theme', savedTheme);
        if (themeToggle) {
            themeToggle.innerHTML = savedTheme === 'dark' ? '🌙' : '☀️';
        }
    },
    
    // Verificar autenticación común
    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/html/admin-login.html';
            return false;
        }

        try {
            const response = await fetch(`${this.API_BASE}/admin/productos`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/html/admin-login.html';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/html/admin-login.html';
            return false;
        }
    },
    
    // Logout común
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/html/admin-login.html';
    },
    
    // Mostrar alerta común
    showAlert(mensaje, tipo = 'error') {
        const alert = document.getElementById('alert');
        if (alert) {
            alert.className = `alert alert-${tipo}`;
            alert.textContent = mensaje;
            alert.style.display = 'block';
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 5000);
        }
    },
    
    // Inicializar página común
    async init() {
        this.loadTheme();
        return await this.checkAuth();
    }
};

// Función global para toggle theme (compatibilidad con HTML onclick)
function toggleTheme() {
    AdminCommon.toggleTheme();
}

// Función global para logout (compatibilidad con HTML onclick)
function logout() {
    AdminCommon.logout();
}
