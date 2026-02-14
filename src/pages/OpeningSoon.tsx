import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useSiteSettings, type OpeningSoonSettings } from "@/hooks/useSiteSettings";

export default function OpeningSoon() {
    const { data: settings } = useSiteSettings();
    const osSettings = settings?.opening_soon as OpeningSoonSettings;

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            await api.post("/newsletter/subscribe", { email, phone });
            setIsSuccess(true);
            toast.success("Merci ! Nous vous tiendrons informé.");
            setEmail("");
            setPhone("");
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = osSettings?.title || "Bientôt Disponible";
    const subtitle = osSettings?.subtitle || "Rayova Luxury Fragrance";
    const description = osSettings?.description || "Nous préparons une expérience olfactive inégalée. Soyez les premiers au courant de notre lancement.";
    const videoUrl = osSettings?.video_url;
    const imageUrl = osSettings?.image_url || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80";

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
                {videoUrl ? (
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-60 scale-105"
                    >
                        <source src={videoUrl} type="video/mp4" />
                    </video>
                ) : (
                    <img
                        src={imageUrl}
                        alt="Background"
                        className="w-full h-full object-cover opacity-50 scale-105"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl px-6 py-12 flex flex-col items-center text-center">
                {/* Logo Area */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-12"
                >
                    <img
                        src="/logo.png"
                        alt="Rayova Logo"
                        className="h-32 md:h-48 w-auto drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://api.rayovaparfums.com/storage/site/logo.png';
                        }}
                    />
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="space-y-6 mb-12"
                >
                    <h2 className="text-[#D4AF37] font-medium tracking-[0.4em] uppercase text-xs md:text-sm border-b border-[#D4AF37]/20 pb-2 inline-block">
                        {subtitle}
                    </h2>
                    <h1 className="text-5xl md:text-8xl font-display font-bold leading-tight bg-gradient-to-b from-[#FFF0C1] via-[#D4AF37] to-[#8E6D1A] bg-clip-text text-transparent drop-shadow-sm">
                        {title}
                    </h1>
                    <p className="text-white/70 max-w-xl mx-auto text-base md:text-xl leading-relaxed font-light italic">
                        {description}
                    </p>
                </motion.div>

                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="w-full max-w-md mx-auto"
                >
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                className="space-y-4"
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#D4AF37] transition-colors">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <Input
                                            type="email"
                                            placeholder="Votre adresse email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-14 pl-12 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 rounded-2xl transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#D4AF37] transition-colors">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <Input
                                            type="tel"
                                            placeholder="Numéro de téléphone (optionnel)"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="h-14 pl-12 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 rounded-2xl transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#8E6D1A] hover:opacity-90 text-black font-bold text-base shadow-[0_10px_20px_rgba(212,175,55,0.2)] transition-all group overflow-hidden relative"
                                    disabled={isSubmitting}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isSubmitting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                M'informer du lancement
                                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8 px-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex flex-col items-center gap-4 text-emerald-400"
                            >
                                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-xl text-white">C'est noté !</h3>
                                    <p className="text-sm text-emerald-400/80">
                                        Vous recevrez une invitation exclusive dès l'ouverture.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsSuccess(false)}
                                    className="text-white/40 hover:text-white transition-colors mt-2"
                                >
                                    S'inscrire avec un autre email
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer Teaser */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-20 text-[10px] uppercase tracking-[0.5em] text-white/20"
                >
                    Excellence & Luxe • Arrivée Imminente
                </motion.p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
        </div>
    );
}
