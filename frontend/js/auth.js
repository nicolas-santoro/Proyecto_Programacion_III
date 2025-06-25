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
    },

    async checkAuthStatus() {
        const token = localStorage.getItem('token');

        if (token){
            try {
                // Obtener perfil del usuario
                await ApiClient.getProfile();
                window.location.href = './adminCenter.html';
            } catch (error){
                // Token inválido o expirado
                console.log('Error al verificar el estado de autenticación:', error);

                this.logout();
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
    }
}

AuthController.init();