const HarvestCardSkeleton = () => (
  <article className="flex flex-col overflow-hidden rounded-card border border-campo-100 bg-white shadow-card animate-pulse">

    {/* Imagen skeleton — aspecto 3/2 igual que la card real */}
    <div className="relative aspect-[3/2] bg-campo-100">
      {/* Badge top-left */}
      <div className="absolute left-3 top-3 h-6 w-16 rounded-chip bg-campo-200" />
      {/* Emoji top-right */}
      <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-campo-200" />
      {/* Precio bottom-left */}
      <div className="absolute bottom-3 left-3">
        <div className="h-3 w-16 rounded bg-campo-200 mb-1.5" />
        <div className="h-6 w-24 rounded-btn bg-campo-200" />
      </div>
      {/* Stock bottom-right */}
      <div className="absolute bottom-3 right-3 h-6 w-20 rounded-chip bg-campo-200" />
    </div>

    {/* Contenido skeleton */}
    <div className="flex flex-1 flex-col gap-3 p-4">
      {/* Nombre — 2 líneas */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded bg-campo-100" />
        <div className="h-3.5 w-4/5 rounded bg-campo-100" />
      </div>
      {/* Ubicación */}
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-campo-100" />
        <div className="h-3 w-36 rounded bg-campo-100" />
      </div>
      {/* Divider + productor + rating */}
      <div className="mt-auto flex items-center justify-between border-t border-campo-100 pt-3">
        <div className="space-y-1">
          <div className="h-2.5 w-14 rounded bg-campo-100" />
          <div className="h-3 w-24 rounded bg-campo-100" />
        </div>
        <div className="flex gap-0.5">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="h-3 w-3 rounded-sm bg-campo-100" />
          ))}
        </div>
      </div>
      {/* CTA */}
      <div className="h-9 w-full rounded-btn bg-campo-100" />
    </div>

  </article>
)

export default HarvestCardSkeleton
