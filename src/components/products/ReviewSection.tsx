import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProductReviews, useCreateReview } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReviewSectionProps {
    productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
    const { user } = useAuth();
    const { data, isLoading } = useProductReviews(productId);
    const createReview = useCreateReview();

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        try {
            await createReview.mutateAsync({
                product_id: productId,
                rating,
                title: name || undefined, // Store optional name in title field
                comment,
            });
            setIsSubmitted(true);
            setComment('');
            setName('');
            toast.success("Avis envoyé ! Il sera visible après modération.");
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue.");
        }
    };

    if (isLoading) return <div className="py-12 text-center text-muted-foreground">Chargement des avis...</div>;

    const reviews = data?.reviews || [];
    const stats = data?.stats;

    return (
        <section className="py-20 border-t border-border/50">
            <div className="container-luxury">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Stats & Form */}
                    <div className="lg:col-span-1 space-y-12">
                        <div>
                            <h2 className="text-3xl font-playfair font-bold mb-6">Avis Clients</h2>
                            {stats && stats.count > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-5xl font-bold text-primary">{stats.average.toFixed(1)}</span>
                                        <div>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => {
                                                    const fill = Math.min(1, Math.max(0, stats.average - (s - 1)));
                                                    const pct = Math.round(fill * 100);
                                                    const gradId = `star-grad-rs-${s}`;
                                                    return (
                                                        <svg key={s} className="h-5 w-5" viewBox="0 0 24 24">
                                                            <defs>
                                                                <linearGradient id={gradId}>
                                                                    <stop offset={`${pct}%`} stopColor="#f59e0b" />
                                                                    <stop offset={`${pct}%`} stopColor="#374151" />
                                                                </linearGradient>
                                                            </defs>
                                                            <path fill={`url(#${gradId})`} stroke="#f59e0b" strokeWidth="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                        </svg>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">Sur la base de {stats.count} avis</p>
                                        </div>
                                    </div>

                                    {/* Distribution Bar */}
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((s) => {
                                            const count = (stats.distribution as any)[s] || 0;
                                            const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
                                            return (
                                                <div key={s} className="flex items-center gap-3 text-sm">
                                                    <span className="w-3 text-muted-foreground">{s}</span>
                                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${percentage}%` }}
                                                            className="h-full bg-primary"
                                                        />
                                                    </div>
                                                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Soyez le premier à donner votre avis sur ce parfum d'exception.</p>
                            )}
                        </div>

                        {/* Leave a Review */}
                        <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm text-left">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Partagez votre expérience
                            </h3>

                            <AnimatePresence mode="wait">
                                {isSubmitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-6 space-y-4"
                                    >
                                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                            <CheckCircle2 className="h-10 w-10" />
                                        </div>
                                        <h4 className="font-bold text-lg">Merci !</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Votre avis a été envoyé avec succès. Il sera visible dès qu'il aura été approuvé par notre équipe.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsSubmitted(false)}
                                        >
                                            Écrire un autre avis
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Votre note</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onMouseEnter={() => setHoverRating(s)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setRating(s)}
                                                        className="transition-transform active:scale-90"
                                                    >
                                                        <Star
                                                            className={`h-8 w-8 transition-colors ${s <= (hoverRating || rating)
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-border fill-transparent'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Votre Nom / Pseudo (Optionnel)</label>
                                            <Input
                                                placeholder="Laissez vide pour rester anonyme"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="bg-background/50 border-border focus:border-primary"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Votre commentaire</label>
                                            <Textarea
                                                placeholder="Qu'avez-vous pensé de la fragrance, de sa tenue et de son sillage ?"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="min-h-[120px] bg-background/50 border-border focus:border-primary resize-none"
                                                required
                                            />
                                        </div>



                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={createReview.isPending}
                                        >
                                            {createReview.isPending ? "Envoi..." : "Publier l'avis"}
                                            <Send className="ml-2 h-4 w-4" />
                                        </Button>
                                    </form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="lg:col-span-2 space-y-8 text-left">
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            Avis ({reviews.length})
                        </h3>

                        {reviews.length > 0 ? (
                            <div className="space-y-8">
                                {reviews.map((review: any, idx: number) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-8 rounded-2xl bg-card border border-border/40 shadow-sm hover:border-border/80 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                    {(review.title || review.user?.profile?.first_name || review.user?.name || 'U')[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">
                                                        {review.title || (review.user?.profile?.first_name
                                                            ? `${review.user.profile.first_name} ${review.user.profile.last_name || ''}`
                                                            : (review.user?.name || 'Utilisateur Anonyme'))}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-0.1">
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star
                                                                    key={s}
                                                                    className={`h-3 w-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-border fill-border'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <time className="text-xs text-muted-foreground italic">
                                                {new Date(review.created_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </time>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                                            "{review.comment}"
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-muted/30 rounded-3xl border border-dashed border-border">
                                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">Aucun avis pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
