/**
 * ImageUploader.jsx — Componente reutilizable de subida de imágenes a Firebase Storage
 *
 * Props:
 *   carpeta       {string}   - STORAGE_FOLDERS.* (productos, insignias, perfiles)
 *   userId        {string}   - ID del usuario autenticado
 *   onUpload      {Function} - callback(url) cuando la subida termina exitosamente
 *   onError       {Function} - callback(mensaje) cuando ocurre un error
 *   textoBoton    {string}   - texto del botón de selección (default: "Seleccionar imagen")
 *   imagenActual  {string}   - URL de imagen existente para mostrar como preview inicial
 *   accept        {string}   - tipos MIME aceptados (default: "image/jpeg,image/png,image/webp")
 *   disabled      {boolean}  - deshabilita el componente
 */

import { useRef } from 'react'
import { useImageUpload } from '../../hooks/useImageUpload'

const ImageUploader = ({
  carpeta,
  userId,
  onUpload,
  onError,
  textoBoton   = 'Seleccionar imagen',
  imagenActual = null,
  accept       = 'image/jpeg,image/png,image/webp',
  disabled     = false,
}) => {
  const inputRef = useRef(null)
  const {
    estado, progreso, url, error, preview,
    seleccionar, subir, limpiar,
  } = useImageUpload(carpeta)

  const previewSrc = preview || url || imagenActual

  /* ── Drag & drop ─────────────────────────────────────────────────────────── */
  const handleDrop = (e) => {
    e.preventDefault()
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) seleccionar(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  /* ── Input change ─────────────────────────────────────────────────────────── */
  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) seleccionar(file)
    // Reset input so el mismo archivo puede volverse a seleccionar
    e.target.value = ''
  }

  /* ── Subir ────────────────────────────────────────────────────────────────── */
  const handleSubir = async () => {
    const uploadedUrl = await subir(userId)
    if (uploadedUrl) {
      onUpload?.(uploadedUrl)
    } else {
      onError?.(error || 'Error al subir el archivo')
    }
  }

  /* ── Limpiar ──────────────────────────────────────────────────────────────── */
  const handleLimpiar = () => {
    limpiar()
    onUpload?.(null)
  }

  /* ── Estilos inline (sin dependencia de Tailwind para portabilidad) ─────── */
  const styles = {
    wrapper: {
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           '12px',
      width:         '100%',
    },
    dropzone: {
      border:        `2px dashed ${estado === 'error' ? '#ef4444' : estado === 'success' ? '#22c55e' : '#9ca3af'}`,
      borderRadius:  '8px',
      padding:       '24px',
      textAlign:     'center',
      cursor:        disabled ? 'not-allowed' : 'pointer',
      background:    disabled ? '#f9fafb' : '#fafafa',
      width:         '100%',
      boxSizing:     'border-box',
      transition:    'border-color 0.2s',
    },
    previewImg: {
      maxWidth:      '100%',
      maxHeight:     '200px',
      borderRadius:  '6px',
      objectFit:     'cover',
      marginBottom:  '8px',
    },
    progressBar: {
      width:         '100%',
      height:        '8px',
      background:    '#e5e7eb',
      borderRadius:  '4px',
      overflow:      'hidden',
    },
    progressFill: {
      height:        '100%',
      width:         `${progreso}%`,
      background:    '#16a34a',
      transition:    'width 0.3s',
    },
    errorMsg: {
      color:         '#ef4444',
      fontSize:      '0.85rem',
    },
    successMsg: {
      color:         '#16a34a',
      fontSize:      '0.85rem',
    },
    btnRow: {
      display:       'flex',
      gap:           '8px',
      justifyContent:'center',
      flexWrap:      'wrap',
    },
    btn: (variant) => ({
      padding:       '8px 16px',
      borderRadius:  '6px',
      border:        'none',
      cursor:        'pointer',
      fontSize:      '0.9rem',
      fontWeight:    '600',
      background:    variant === 'primary' ? '#16a34a'
                   : variant === 'danger'  ? '#ef4444'
                   : '#6b7280',
      color:         '#fff',
      opacity:       disabled ? 0.5 : 1,
    }),
  }

  return (
    <div style={styles.wrapper}>
      {/* ── Zona de drop ────────────────────────────────────────────────── */}
      <div
        style={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && estado !== 'uploading' && inputRef.current?.click()}
      >
        {previewSrc ? (
          <img src={previewSrc} alt="Preview" style={styles.previewImg} />
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Arrastra una imagen aquí o haz clic para seleccionar
            </div>
          </>
        )}

        {estado === 'uploading' && (
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>
        )}
      </div>

      {/* ── Mensajes de estado ─────────────────────────────────────────── */}
      {estado === 'error'   && <p style={styles.errorMsg}>{error}</p>}
      {estado === 'success' && <p style={styles.successMsg}>Imagen subida correctamente</p>}
      {estado === 'uploading' && (
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          Subiendo… {progreso}%
        </p>
      )}

      {/* ── Botones ───────────────────────────────────────────────────── */}
      <div style={styles.btnRow}>
        {(estado === 'idle' || estado === 'error') && (
          <button
            type="button"
            style={styles.btn('secondary')}
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {textoBoton}
          </button>
        )}

        {estado === 'preview' && (
          <>
            <button
              type="button"
              style={styles.btn('primary')}
              disabled={disabled}
              onClick={handleSubir}
            >
              Subir imagen
            </button>
            <button
              type="button"
              style={styles.btn('danger')}
              disabled={disabled}
              onClick={handleLimpiar}
            >
              Cancelar
            </button>
          </>
        )}

        {estado === 'success' && (
          <button
            type="button"
            style={styles.btn('secondary')}
            disabled={disabled}
            onClick={handleLimpiar}
          >
            Cambiar imagen
          </button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  )
}

export default ImageUploader
