import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/lib/contexts/translation-context"
import StatPill from "./StatPill"
import { isValidImageUrl } from '@/lib/utils'

interface Recipe {
  id: string
  title: string
  slug: string
  image: string
  category: string
  rating: number
  prepTime: number
  difficulty: string
  servings: number
  tags: string[]
  description?: string
}

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { t, isRTL, isHydrated } = useTranslation()

  return (
    <article className="group rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,.04)] h-full flex flex-col">
      <div className="relative aspect-[4/3]">
        {isValidImageUrl(recipe.image) ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-white/90 font-medium ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
          {recipe.category}
        </span>
        <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-white/90 font-medium ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
          ⭐ {recipe.rating.toFixed(1)}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-semibold leading-snug line-clamp-2 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
          {recipe.title}
        </h3>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-black/70">
          <StatPill 
            icon="⏱" 
            label={isRTL ? "التحضير" : "Prep"} 
            value={`${recipe.prepTime} min`} 
          />
          <StatPill 
            icon="🍹" 
            label={isRTL ? "الصعوبة" : "Difficulty"} 
            value={recipe.difficulty} 
          />
          <StatPill 
            icon="❤️" 
            label={isRTL ? "الحصص" : "Servings"} 
            value={recipe.servings.toString()} 
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1 text-xs text-black/60">
          {recipe.tags.slice(0, 4).map((tag, index) => (
            <span 
              key={index} 
              className={`px-2 py-0.5 rounded-full bg-black/5 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <Link 
            href={`/recipes/${recipe.slug}`}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
          >
            {isRTL ? "عرض التفاصيل" : "Show Details"}
          </Link>
        </div>
      </div>
    </article>
  )
}
