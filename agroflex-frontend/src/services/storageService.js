/**
 * storageService.js — Subida de archivos a Cloudinary (CAPA 4)
 *
 * Flujo AgroFlex:
 *   1. Usuario selecciona archivo en el frontend
 *   2. Este servicio sube DIRECTO a Cloudinary (unsigned upload)
 *   3. Cloudinary devuelve URL pública
 *   4. El frontend envía esa URL al backend Spring Boot
 *   5. Spring Boot guarda la URL en MySQL
 *
 * Setup requerido en Cloudinary Console:
 *   1. Crear cuenta en cloudinary.com (plan gratis: 25 GB)
 *   2. Dashboard → Settings → Upload → Add upload preset
 *      - Signing Mode: Unsigned
 *      - Folder: agroflex
 *      - Guardar el nombre del preset
 *   3. Copiar Cloud Name del Dashboard
 *   4. Llenar en .env:
 *      VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
 *      VITE_CLOUDINARY_UPLOAD_PRESET=tu_preset
 */

const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const UPLOAD_URL     = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`

// ── Carpetas en Cloudinary ───────────────────────────────────────────────────
export const STORAGE_FOLDERS = {
  PRODUCTOS: 'productos',
  INSIGNIAS: 'insignias',
  PERFILES:  'perfiles',
}

const MAX_SIZES = {
  productos: 5  * 1024 * 1024,   // 5 MB
  insignias: 10 * 1024 * 1024,   // 10 MB
  perfiles:  2  * 1024 * 1024,   // 2 MB
}

const TIPOS_PERMITIDOS = {
  productos: ['image/jpeg', 'image/png', 'image/webp'],
  insignias: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  perfiles:  ['image/jpeg', 'image/png', 'image/webp'],
}

// ── Validación antes de subir ────────────────────────────────────────────────
export const validarArchivo = (archivo, carpeta) => {
  const errores = []
  const maxMB   = MAX_SIZES[carpeta] / 1024 / 1024

  if (!archivo) {
    errores.push('No se seleccionó ningún archivo')
    return { valido: false, errores }
  }
  if (archivo.size > MAX_SIZES[carpeta])
    errores.push(`El archivo excede el límite de ${maxMB} MB`)

  if (!TIPOS_PERMITIDOS[carpeta]?.includes(archivo.type))
    errores.push(`Tipo no permitido. Acepta: ${TIPOS_PERMITIDOS[carpeta]?.join(', ')}`)

  return { valido: errores.length === 0, errores }
}

// ── Subida principal con seguimiento de progreso ────────────────────────────
/**
 * @param {Object}   opts
 * @param {File}     opts.archivo              - File del input
 * @param {string}   opts.carpeta              - STORAGE_FOLDERS.*
 * @param {string}   opts.userId               - ID del usuario (para la ruta)
 * @param {Function} [opts.onProgreso]         - callback(0-100)
 * @param {string}   [opts.nombrePersonalizado]
 * @returns {Promise<{ url, ruta, nombre, tipo, tamaño }>}
 */
export const subirArchivo = ({ archivo, carpeta, userId, onProgreso, nombrePersonalizado }) => {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      reject(new Error('Cloudinary no está configurado. Verifica VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en .env'))
      return
    }

    const { valido, errores } = validarArchivo(archivo, carpeta)
    if (!valido) {
      reject(new Error(errores[0]))
      return
    }

    const extension  = archivo.name.split('.').pop().toLowerCase()
    const nombre     = nombrePersonalizado || `${userId}_${Date.now()}.${extension}`
    const ruta       = `agroflex/${carpeta}/${userId}/${nombre}`
    const isPdf      = archivo.type === 'application/pdf'
    const resourceType = isPdf ? 'raw' : 'image'

    const formData = new FormData()
    formData.append('file', archivo)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', `agroflex/${carpeta}/${userId}`)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgreso) {
        onProgreso(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText)
        resolve({
          url:    res.secure_url,
          ruta:   res.public_id,
          nombre: res.original_filename || nombre,
          tipo:   archivo.type,
          tamaño: archivo.size,
        })
      } else {
        let mensaje = 'Error al subir el archivo a Cloudinary'
        try {
          const err = JSON.parse(xhr.responseText)
          mensaje = err.error?.message || mensaje
        } catch {}
        console.error('[AgroFlex Cloudinary] Error:', xhr.status, xhr.responseText)
        reject(new Error(mensaje))
      }
    }

    xhr.onerror = () => reject(new Error('Error de red al subir el archivo'))
    xhr.send(formData)
  })
}

// Alias para imágenes (mismo comportamiento)
export const subirImagen = subirArchivo

// ── Eliminar archivo (requiere firma del backend — no disponible en upload unsigned) ──
export const eliminarArchivo = async (rutaOUrl) => {
  // La eliminación con upload preset unsigned no está disponible desde el frontend.
  // Se hace desde el backend con las credenciales de Cloudinary si se necesita.
  console.warn('[AgroFlex Storage] Eliminar desde frontend no disponible con Cloudinary unsigned. URL:', rutaOUrl)
  return false
}
