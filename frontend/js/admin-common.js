const AdminCommon = {
    API_BASE: '/api',
    
    /**
     * Esta función cambia entre tema claro y oscuro
     * Es la que uso en todas las páginas del admin para que sea consistente
     * Cambia el atributo data-theme del body y el emoji del botón
     */
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
    
    /**
     * Al cargar cualquier página del admin, esta función recupera el tema guardado
     * Si no hay nada guardado, usa modo oscuro por defecto
     * También actualiza el emoji del botón para que coincida
     */
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
    
    /**
     * Super importante esta función - verifica que el usuario esté logueado
     * Hace una petición al servidor para validar el token
     * Si algo está mal, borra todo y manda al login
     * @returns {boolean} true si está autenticado, false si no
     */
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
    
    /**
     * Función para cerrar sesión de forma segura
     * Borra el token, borra la info del usuario y redirige al login
     * La uso desde cualquier página del admin
     */
    // Logout común
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/html/admin-login.html';
    },
    
    /**
     * Esta es mi función universal para mostrar mensajes al usuario
     * La uso en toda la aplicación admin para mantener consistencia visual
     * @param {string} mensaje - el texto que quiero mostrar
     * @param {string} tipo - 'error', 'success', 'warning', etc.
     */
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
    
    /**
     * Función que llamo al principio de cada página del admin
     * Se encarga de cargar el tema y verificar autenticación
     * Es como un "setup" inicial para todas las páginas
     * @returns {boolean} true si todo está OK, false si hay problemas de auth
     */
    // Inicializar página común
    async init() {
        this.loadTheme();
        return await this.checkAuth();
    }
};

/**
 * Función global para compatibilidad con los onclick del HTML
 * Simplemente llama al método del objeto AdminCommon
 */
// Función global para toggle theme (compatibilidad con HTML onclick)
function toggleTheme() {
    AdminCommon.toggleTheme();
}

/**
 * Función global para logout desde cualquier parte del HTML
 * También es para compatibilidad con los onclick
 */
// Función global para logout (compatibilidad con HTML onclick)
function logout() {
    AdminCommon.logout();
}
