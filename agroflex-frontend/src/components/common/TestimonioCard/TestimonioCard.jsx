const colorAvatarMap = {
  verde: 'bg-verde-100 text-verde-700',
  azul:  'bg-blue-100 text-blue-700',
  ambar: 'bg-ambar-100 text-ambar-700',
  rojo:  'bg-red-100 text-red-700',
}

function TestimonioCard({
  iniciales,
  nombre,
  rol,
  estado,
  texto,
  colorAvatar = 'verde'
}) {
  return (
    <div className="bg-white rounded-card border-l-4 border-verde-400 p-5 flex flex-col gap-3 shadow-card">
      <div className="flex items-start gap-3">
        <div className={`${colorAvatarMap[colorAvatar] || colorAvatarMap.verde} w-10 h-10 rounded-fab flex items-center justify-center text-sm font-bold flex-shrink-0`}>
          {iniciales}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-tinta-800">
              {nombre}
            </h4>
            <span className="text-xs bg-verde-100 text-verde-700 font-semibold px-2 py-0.5 rounded-full">
              ✓ Verificado
            </span>
          </div>
          <p className="text-xs text-tinta-500">
            {rol} · {estado}
          </p>
        </div>
      </div>

      <blockquote className="text-sm text-tinta-600 leading-relaxed italic">
        "{texto}"
      </blockquote>
    </div>
  )
}

export { TestimonioCard }
export default TestimonioCard
