export default function RecipeCardSkeleton() {
  return (
    <article className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,.04)] h-full flex flex-col animate-pulse">
      <div className="relative aspect-[4/3] bg-gray-200">
        <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded-full"></div>
        <div className="absolute top-3 right-3 w-12 h-6 bg-gray-300 rounded-full"></div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 bg-gray-200 rounded mb-1"></div>
            <div className="w-12 h-3 bg-gray-200 rounded"></div>
            <div className="w-8 h-3 bg-gray-200 rounded mt-1"></div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 bg-gray-200 rounded mb-1"></div>
            <div className="w-12 h-3 bg-gray-200 rounded"></div>
            <div className="w-8 h-3 bg-gray-200 rounded mt-1"></div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 bg-gray-200 rounded mb-1"></div>
            <div className="w-12 h-3 bg-gray-200 rounded"></div>
            <div className="w-8 h-3 bg-gray-200 rounded mt-1"></div>
          </div>
        </div>

        <div className="mt-3 flex gap-1">
          <div className="w-12 h-5 bg-gray-200 rounded-full"></div>
          <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
          <div className="w-14 h-5 bg-gray-200 rounded-full"></div>
        </div>

        <div className="mt-auto pt-4">
          <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </article>
  )
}
