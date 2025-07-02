// Controlador de autenticación para el panel de administrador
const AuthController = {
    // Elementos del DOM utilizados por el controlador
    elements: {
        logoutBtn: document.getElementById('btnAdminLogout'), // Botón de cierre de sesión
        loginForm: document.getElementById('formAdminLogin')  // Formulario de inicio de sesión
    },

    // Inicializa el controlador y configura los eventos al cargar la página
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuthStatus();     // Verifica si el usuario está autenticado
            this.setupEventListeners(); // Configura los listeners de eventos
        });
    },

    // Configura los listeners de eventos: login y logout
    setupEventListeners() {
        // Listener para cerrar sesión
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Listener para enviar el formulario de login
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();     // Previene el envío por defecto
                this.handleLogin();     // Llama al método de login
            });
        }
    },

    // Verifica el estado de autenticación del usuario
    async checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const currentPage = window.location.pathname;

        // Lista de páginas que requieren autenticación
        const paginasProtegidas = [
            '/html/admin-dashboard.html',
            '/html/admin-ventas.html', 
            '/html/admin-productos.html',
            '/html/admin-auditoria.html',
            '/html/admin-form-producto.html',
        ];

        // Si estamos en la página de login y ya hay token válido, redirigir al dashboard
        if (currentPage.includes('/html/admin-login.html') && token && user) {
            try {
                const response = await fetch('/api/admin/productos', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    window.location.href = '/html/admin-dashboard.html';
                    return;
                }
            } catch (error) {
                // Si falla la verificación, limpiar tokens y permitir acceso al login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        // Verificar si la página actual requiere autenticación
        const paginaProtegida = paginasProtegidas.some(pagina => currentPage.includes(pagina));

        if (paginaProtegida) {
            if (!token || !user) {
                window.location.href = '/html/admin-login.html';
                return;
            }

            // Verificar token con el servidor
            try {
                const response = await fetch('/api/admin/productos', {
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
                    return;
                }
            } catch (error) {
                console.error('Error verificando token:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/html/admin-login.html';
                return;
            }
        }
    },

    // Maneja el proceso de login del usuario
    async handleLogin() {
        try {
            const email = document.getElementById('adminMail').value;
            const password = document.getElementById('adminPassword').value;

            // Realiza la solicitud de login al servidor usando el cliente API
            const response = await ApiClient.login({ email, password });

            // Guarda el token y los datos del usuario en localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Redirige al panel de administrador
            window.location.href = './admin-dashboard.html';
        } catch (error) {
            console.log('Usuario equivocado:', error);
        }
    },

    // Cierra sesión del usuario
    logout() {
        // Limpia el almacenamiento local
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirige al login
        window.location.href = '/admin/login';
    }
};

// Inicia el controlador al cargar la página
AuthController.init();