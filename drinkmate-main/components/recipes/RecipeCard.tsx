import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/lib/translation-context"
import StatPill from "./StatPill"

interface Recipe {
  id: number
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
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          loading="lazy"
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
        />
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
