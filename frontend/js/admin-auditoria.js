const API_BASE = '/api';

let auditoriaData = [];

document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    cargarAuditoria();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/html/admin-login.html';
        return;
    }
}

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
            // Ordenar por fecha descendente (más reciente primero)
            auditoriaData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            mostrarAuditoria(auditoriaData);
            // Eliminamos actualizarEstadisticas(auditoriaData);
        } else if (response.status === 401) {
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

function mostrarAuditoria(acciones) {
    const tbody = document.getElementById('auditoriaTableBody');
    
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
    // Mostrar solo los primeros 50 registros para mejor rendimiento
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

function mostrarAlerta(mensaje, tipo) {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}