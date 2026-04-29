import axiosClient from './axiosClient'

/**
 * Obtiene municipios de Puebla desde el geolocation-service.
 * @param {string} [q] - Filtro de búsqueda parcial (opcional)
 */
export const getMunicipios = (q) =>
  axiosClient.get('/api/geolocation/municipios', {
    params: { estado: 'puebla', ...(q ? { q } : {}) },
  })
