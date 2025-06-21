const AuthController = {
    elements: {
        loginBtn: document.getElementById('btnAdminLogin'),
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
        // Iniciar sesión
        if (this.elements.loginBtn) {
            this.elements.loginBtn.addEventListener('click', () => {
                this.login();
            });
        }

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
                this.handleLogin;
            });
        }
    },

    async checkAuthStatus() {
        const token = localStorage.getItem('token');

        if (token){
            try {
                // Obtener perfil del usuario
                const userData = await ApiClient.getProfile();
                this.updateUiForAuthenticatedUser(userData);
            } catch (error){
                // Token inválido o expirado
                console.error('Error al verificar el estado de autenticación: ', error);
                this.logout();
            }
        } else {
            this.updateUiForAuthenticatedUser();
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
            logalStorage.setItem('user', JSON.stringify(response.user));

            // Actualizar UI
            this.updateUiForAuthenticatedUser(response.user);

            // Mostrar mensaje de éxito
            this.showToast('Bienvenido!', 'Has iniciado sesión correctamente')
        } catch (error){

        }
    }
}