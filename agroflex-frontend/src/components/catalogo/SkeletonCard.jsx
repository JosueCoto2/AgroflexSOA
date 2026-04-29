/**
 * SkeletonCard — Placeholder animado que imita la forma de ProductCard.
 * Se muestra mientras se cargan los productos del catálogo.
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-card shadow-card border border-tinta-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-tinta-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-5 w-20 bg-tinta-100 rounded-chip" />
        <div className="h-4 bg-tinta-100 rounded w-4/5" />
        <div className="h-4 bg-tinta-100 rounded w-3/5" />
        <div className="h-6 bg-tinta-100 rounded w-2/5 mt-1" />
        <div className="h-3 bg-tinta-100 rounded w-full" />
        <div className="h-3 bg-tinta-100 rounded w-3/4" />
        <div className="h-3 bg-tinta-100 rounded w-1/2" />
        <div className="flex gap-2 pt-1">
          <div className="h-9 flex-1 bg-tinta-100 rounded-btn" />
          <div className="h-9 flex-1 bg-tinta-100 rounded-btn" />
        </div>
      </div>
    </div>
  )
}
