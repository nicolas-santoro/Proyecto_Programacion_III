// URL base de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Cliente API: agrupación de métodos para interactuar con el backend
const ApiClient = {
    // Obtiene el token JWT almacenado en localStorage
    getToken() {
        return localStorage.getItem('token');
    },

    // Función genérica para realizar peticiones a la API
    async fetchApi(endpoint, options = {}) {
        const token = this.getToken();
        const defaultHeaders = {};

        // Si hay body (ej: POST o PUT), se agrega Content-Type
        if (options.body) {
            defaultHeaders['Content-Type'] = 'application/json';
        }

        // Lista de endpoints públicos que no requieren autenticación
        const endpointsPublicos = [
            '/authRoutes/login',
            '/productos/obtener',
            '/ventas/crear'
        ];

        // Si el token existe y el endpoint no es público, se agrega el Authorization header
        if (token && !endpointsPublicos.includes(endpoint)) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        // Configuración final de la petición
        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...config,
                headers: config.headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error en la petición API: ', error);
            throw error;
        }
    },

    // ===== AUTENTICACIÓN =====

    // Realiza login con credenciales (email y password)
    async login(credentials) {
        return this.fetchApi('/authRoutes/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // Cierra sesión del usuario y limpia localStorage
    async logout() {
        await this.fetchApi('/authRoutes/logout', { method: 'POST' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login'; // Redirige al login
    },

    // Obtiene el perfil del usuario autenticado
    async getProfile() {
        return this.fetchApi('/authRoutes/profile');
    },

    // ===== MÉTODOS ADMINISTRATIVOS =====

    // === Productos ===

    // Obtiene todos los productos para el panel admin
    async obtenerProductosAdmin() {
        return this.fetchApi('/admin/productos');
    },

    // Crea un nuevo producto desde el panel admin
    async crearProductoAdmin(producto) {
        return this.fetchApi('/admin/productos', {
            method: 'POST',
            body: JSON.stringify(producto)
        });
    },

    // Edita un producto existente (por ID)
    async editarProductoAdmin(id, producto) {
        return this.fetchApi(`/admin/productos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(producto)
        });
    },

    // Elimina un producto (por ID)
    async eliminarProductoAdmin(id) {
        return this.fetchApi(`/admin/productos/${id}`, {
            method: 'DELETE'
        });
    },

    // === Ventas ===

    // Obtiene todas las ventas registradas
    async obtenerVentasAdmin() {
        return this.fetchApi('/admin/ventas');
    },

    
    // === Auditoría ===

    // Obtiene el registro de acciones del sistema
    async obtenerAuditoriaAdmin() {
        return this.fetchApi('/admin/auditoria');
    }
};