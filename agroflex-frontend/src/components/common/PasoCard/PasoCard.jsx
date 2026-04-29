const colorMap = {
  verde: 'bg-green-600',
  ambar: 'bg-amber-400',
  azul: 'bg-blue-500'
}

function PasoCard({ numero, titulo, descripcion, colorNumero = 'verde' }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className={`${colorMap[colorNumero] || colorMap.verde} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg`}>
        {numero}
      </div>
      <h3 className="text-sm font-medium text-gray-800 leading-snug">
        {titulo}
      </h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        {descripcion}
      </p>
    </div>
  )
}

export { PasoCard }
export default PasoCard
