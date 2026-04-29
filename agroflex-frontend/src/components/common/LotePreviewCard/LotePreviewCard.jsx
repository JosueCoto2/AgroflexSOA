import { Link } from 'react-router-dom'
import { ROUTES } from '../../../routes/routeConfig'

function LotePreviewCard({
  emoji,
  categoria,
  nombre,
  ubicacion,
  precio,
  unidad = '/kg',
  estrellas = 5
}) {
  const renderStars = (num) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < num ? 'text-amber-400' : 'text-gray-300'}>
        ★
      </span>
    ))
  }

  return (
    <Link
      to={ROUTES.REGISTER}
      className="flex-shrink-0 w-32 bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
      title="Regístrate para ver el detalle"
    >
      <div className="flex flex-col gap-2">
        {/* Emoji grande */}
        <div className="text-4xl text-center">
          {emoji}
        </div>

        {/* Categoría badge */}
        <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full text-center">
          {categoria}
        </span>

        {/* Nombre */}
        <h4 className="text-xs font-medium text-gray-800 line-clamp-2">
          {nombre}
        </h4>

        {/* Ubicación */}
        <p className="text-xs text-gray-600 flex items-center gap-1">
          <span>📍</span>
          <span className="line-clamp-1">{ubicacion}</span>
        </p>

        {/* Precio */}
        <p className="text-sm font-bold text-green-600">
          ${precio}
          <span className="text-xs font-normal text-gray-600">{unidad}</span>
        </p>

        {/* Estrellas */}
        <div className="text-xs flex gap-0.5 justify-center">
          {renderStars(estrellas)}
        </div>
      </div>
    </Link>
  )
}

export { LotePreviewCard }
export default LotePreviewCard
