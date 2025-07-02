// URL base para las solicitudes a la API
const API_BASE = '/api';

// Arreglo donde se guardarán los datos de auditoría
let auditoriaData = [];

// Evento que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();  // Verifica si el usuario está autenticado
    cargarAuditoria();         // Carga los datos de auditoría desde el servidor
});

// Verifica si hay un token en el almacenamiento local; si no, redirige al login
async function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/html/admin-login.html';
        return false;
    }

    // Verificar token con el servidor
    try {
        const response = await fetch(`${API_BASE}/admin/productos`, {
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
}

// Carga los datos de auditoría desde la API
async function cargarAuditoria() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/auditoria`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            auditoriaData = data.data || [];

            // Ordena las acciones por fecha descendente
            auditoriaData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            mostrarAuditoria(auditoriaData);  // Muestra los datos en la tabla

        } else if (response.status === 401) {
            // Token inválido: se elimina y redirige al login
            localStorage.removeItem('token');
            window.location.href = '/html/admin-login.html';
        } else {
            console.error('Error al cargar auditoría');
            mostrarAlerta('Error al cargar los datos de auditoría', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión', 'error');
    }
}

// Muestra las acciones de auditoría en una tabla HTML
function mostrarAuditoria(acciones) {
    const tbody = document.getElementById('auditoriaTableBody');

    // Si no hay acciones, se muestra un mensaje vacío
    if (acciones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <div class="icon">📊</div>
                        <h3>No hay acciones registradas</h3>
                        <p>Las acciones del sistema aparecerán aquí</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';

    // Se muestran solo las primeras 50 acciones para mejorar el rendimiento
    const accionesAMostrar = acciones.slice(0, 50);

    accionesAMostrar.forEach(accion => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(accion.fecha).toLocaleString('es-ES')}</td>
            <td>
                <span class="badge badge-${getRolColor(accion.usuario?.rol || 'unknown')}">
                    ${accion.usuario?.nombre || 'Sistema'}
                </span>
            </td>
            <td>
                <span class="badge badge-${getAccionColor(accion.accion)}">
                    ${accion.accion}
                </span>
            </td>
            <td style="max-width: 300px; word-wrap: break-word;">
                ${accion.detalles || 'Sin detalles'}
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Si hay más de 50 registros, se muestra una advertencia informativa
    if (acciones.length > 50) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="4" style="text-align: center; color: #a020f0; font-style: italic;">
                Mostrando los 50 registros más recientes de ${acciones.length} total
            </td>
        `;
        tbody.appendChild(tr);
    }
}

// Retorna el color del badge según el rol del usuario
function getRolColor(rol) {
    const colors = {
        'admin': 'danger',
        'editor': 'warning',
        'vendedor': 'info',
        'auditor': 'secondary',
        'unknown': 'secondary'
    };
    return colors[rol] || 'secondary';
}

// Retorna el color del badge según la acción realizada
function getAccionColor(accion) {
    const colors = {
        'CREATE': 'success',
        'CREAR_PRODUCTO': 'success',
        'UPDATE': 'warning',
        'ACTUALIZAR_PRODUCTO': 'warning',
        'DELETE': 'danger',
        'DESACTIVAR_PRODUCTO': 'danger',
        'REACTIVAR_PRODUCTO': 'info',
        'LOGIN': 'info',
        'LOGOUT': 'secondary',
        'VENTA': 'primary',
        'CREAR_VENTA': 'primary'
    };
    return colors[accion] || 'secondary';
}

// Muestra una alerta temporal en pantalla with un mensaje y un tipo (info, error, etc.)
function mostrarAlerta(mensaje, tipo) {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;
    alert.style.display = 'block';

    // Oculta la alerta después de 5 segundos
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}