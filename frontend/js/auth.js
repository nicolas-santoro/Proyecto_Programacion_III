const AuthController = {
    elements: {
        logoutBtn: document.getElementById('btnAdminLogout'),
        loginForm: document.getElementById('formAdminLogin')
    },

    // Inicializar eventos
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Verificar si hay un usuario autenticado
            this.checkAuthStatus();

            // Event listeners
            this.setupEventListeners();
        });
    },

    // Configurar listeners de eventos
    setupEventListeners() {
        // Cerrar sesión
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Enviar formulario de login
        if (this.elements.loginForm){
            this.elements.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    },    async checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const currentPage = window.location.pathname;

        if (token && user){
            // Solo redirigir si estamos en la página de login
            if (currentPage.includes('/admin/login') || currentPage === '/') {
                window.location.href = './adminCenter.html';
            }
            // Si ya estamos en adminCenter.html, no hacer nada
        } else {
            // Si no hay token/user y estamos en adminCenter, redirigir a login
            if (currentPage.includes('adminCenter.html')) {
                window.location.href = '/admin/login';
            }
        }
    },

    // Manejar inicio de sesión
    async handleLogin() {
        try {
            const email = document.getElementById('adminMail').value;
            const password = document.getElementById('adminPassword').value;

            // Realizar login
            const response = await ApiClient.login({email, password});

            // Guardar token en localStorage
            localStorage.setItem('token', response.token);

            // Guardar datos del usuario en localStorage
            localStorage.setItem('user', JSON.stringify(response.user));

            // Redirigir directamente
            window.location.href = './adminCenter.html';
        } catch (error){
            console.log('Usuario equivocado:', error);
        }
    },

    // Cerrar sesión
    logout() {
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirigir al login
        window.location.href = '/admin/login';
    }
}

AuthController.init();