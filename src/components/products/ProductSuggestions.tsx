import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSuggestionsProps {
    currentProductId: string;
    categorySlug?: string;
    gender?: string;
    limit?: number;
    title?: string;
}

export const ProductSuggestions = ({
    currentProductId,
    categorySlug,
    gender,
    limit = 4,
    title = "Vous aimerez aussi"
}: ProductSuggestionsProps) => {
    const { data: products, isLoading } = useProducts({
        category: categorySlug,
        gender: categorySlug ? undefined : gender, // Only use gender if no category
        per_page: limit + 1, // Get one extra to exclude current
    });

    const suggestions = products
        ?.filter((p) => p.id !== currentProductId)
        .slice(0, limit);

    if (isLoading) {
        return (
            <div className="space-y-8 mt-16 sm:mt-24">
                <div className="text-center">
                    <Skeleton className="h-8 w-48 mx-auto mb-4" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                            <div className="space-y-2 px-2">
                                <Skeleton className="h-4 w-1/2 mx-auto" />
                                <Skeleton className="h-4 w-3/4 mx-auto" />
                                <Skeleton className="h-4 w-1/4 mx-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!suggestions || suggestions.length === 0) return null;

    return (
        <section className="mt-16 sm:mt-24 section-optimize">
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-4xl font-display text-foreground tracking-tight">
                    {title}
                </h2>
                <div className="h-1 w-12 bg-primary mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {suggestions.map((product) => (
                    <ProductCard
                        key={product.id}
                        {...product}
                        image={product.media?.find(m => m.is_primary)?.url || product.media?.[0]?.url}
                    />
                ))}
            </div>
        </section>
    );
};
