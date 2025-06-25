// URL base de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Cliente API
const ApiClient = {
    // Función para obtener el token JWT del localStorage
    getToken() {
        return localStorage.getItem('token');
    },

    // Función para realizar peticiones a la API
    async fetchApi(endpoint, options = {}){
        const token = this.getToken();
        const defaultHeaders = {};

        // solo para POST, PUT, etc.
        if (options.body) {
            defaultHeaders['Content-Type'] = 'application/json';
        }

        // Añadir token de autorización si existe
        if (token && !['/authRoutes/login', '/productosRoutes/obtener', '/ventasRoutes/crear']) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        // Configuración por defecto para fetck
        const config = {
            headers: {...defaultHeaders, ...options.headers},
            ...options
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...config,
                headers: config.headers
            });

            const data = await response.json();

            if (!response.ok){
                throw new Error(data.message || 'Error en la petición')
            }

            return data;
        } catch (error){
            console.error('Error en la petición API: ', error);
            throw error;
        }
    },

    // Inicio de sesión
    async login(credentials){
        return this.fetchApi('/authRoutes/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // Cerrar Sesión
    async logout() {
        await this.fetchApi('/authRoutes/logout', { method: 'POST' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/adminLogin.html';
    },

    // Obtener perfil del usuario
    async getProfile(){
        return this.fetchApi('/authRoutes/profile');
    }
}