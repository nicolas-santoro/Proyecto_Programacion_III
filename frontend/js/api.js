// URL base de la API
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * ApiClient es como mi "traductor" entre el frontend y el backend
 * Se encarga de hacer todas las peticiones HTTP de forma organizada
 * y manejar la autenticación con tokens JWT
 */
const ApiClient = {
    /**
     * Esta función busca el token de autenticación que está guardado en localStorage
     * El token es como un "pase VIP" que demuestra que el usuario ya se logueó
     * 
     * @returns {string|null} - El token JWT o null si no hay ninguno
     */
    getToken() {
        return localStorage.getItem('token');
    },

    /**
     * Esta es la función más importante de todo el cliente API
     * Es como un "mensajero universal" que puede hacer cualquier tipo de petición
     * Se encarga de:
     * 1. Agregar headers necesarios (Content-Type, Authorization)
     * 2. Manejar errores de forma consistente
     * 3. Convertir las respuestas a JSON
     * 
     * @param {string} endpoint - La ruta de la API (ej: '/productos/obtener')
     * @param {Object} options - Opciones de la petición (method, body, headers, etc.)
     * @returns {Promise} - Promesa que resuelve con los datos de la respuesta
     */
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

    /**
     * Esta función maneja el proceso de login del usuario
     * Envía email y password al servidor y espera recibir un token JWT
     * 
     * @param {Object} credentials - Objeto con email y password
     * @returns {Promise} - Promesa que resuelve con el token y datos del usuario
     */
    async login(credentials) {
        return this.fetchApi('/authRoutes/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    /**
     * Esta función cierra la sesión del usuario de forma completa
     * 1. Le avisa al servidor que el usuario se está deslogueando
     * 2. Borra todos los datos del localStorage
     * 3. Redirige al usuario al login
     */
    async logout() {
        await this.fetchApi('/authRoutes/logout', { method: 'POST' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login'; // Redirige al login
    },

    /**
     * Esta función obtiene la información del usuario que está logueado
     * Es útil para mostrar el nombre, email, etc. en el panel admin
     * 
     * @returns {Promise} - Promesa que resuelve con los datos del usuario
     */
    async getProfile() {
        return this.fetchApi('/authRoutes/profile');
    },

    // ===== MÉTODOS ADMINISTRATIVOS =====

    // === Productos ===

    /**
     * Esta función trae TODOS los productos para mostrar en el panel administrativo
     * A diferencia de la versión pública, esta incluye productos inactivos
     * 
     * @returns {Promise} - Promesa que resuelve con array de todos los productos
     */
    async obtenerProductosAdmin() {
        return this.fetchApi('/admin/productos');
    },

    /**
     * Esta función crea un nuevo producto desde el panel admin
     * Envía todos los datos del producto al servidor para que lo guarde en la BD
     * 
     * @param {Object} producto - Objeto con nombre, precio, categoría, etc.
     * @returns {Promise} - Promesa que resuelve con el producto creado
     */
    async crearProductoAdmin(producto) {
        return this.fetchApi('/admin/productos', {
            method: 'POST',
            body: JSON.stringify(producto)
        });
    },

    /**
     * Esta función edita un producto que ya existe
     * Envía los datos modificados al servidor para actualizar la BD
     * 
     * @param {string} id - El ID del producto a editar
     * @param {Object} producto - Objeto con los nuevos datos del producto
     * @returns {Promise} - Promesa que resuelve con el producto actualizado
     */
    async editarProductoAdmin(id, producto) {
        return this.fetchApi(`/admin/productos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(producto)
        });
    },

    /**
     * Esta función elimina un producto de forma PERMANENTE
     * Una vez que se ejecuta, no hay vuelta atrás
     * 
     * @param {string} id - El ID del producto a eliminar
     * @returns {Promise} - Promesa que resuelve cuando el producto se eliminó
     */
    async eliminarProductoAdmin(id) {
        return this.fetchApi(`/admin/productos/${id}/eliminar`, {
            method: 'DELETE'
        });
    },

    // === Ventas ===

    /**
     * Esta función trae todas las ventas registradas en el sistema
     * Es útil para que el admin vea reportes de ventas, estadísticas, etc.
     * 
     * @returns {Promise} - Promesa que resuelve con array de todas las ventas
     */
    async obtenerVentasAdmin() {
        return this.fetchApi('/admin/ventas');
    },

    
    // === Auditoría ===

    /**
     * Esta función trae el registro de auditoría del sistema
     * Muestra quién hizo qué y cuándo (crear productos, eliminar, etc.)
     * Es como un "historial de actividad" para seguridad
     * 
     * @returns {Promise} - Promesa que resuelve con el log de auditoría
     */
    async obtenerAuditoriaAdmin() {
        return this.fetchApi('/admin/auditoria');
    }
};