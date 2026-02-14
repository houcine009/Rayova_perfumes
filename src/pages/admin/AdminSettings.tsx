import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Save,
  Cloud,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  AlertCircle as AlertCircleIcon,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSiteSettings, useUpdateSetting, type HeroSettings, type ContactSettings, type OpeningSoonSettings } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [storageStatus, setStorageStatus] = useState<{
    type: 'cloudinary' | 'local';
    is_configured: boolean;
    cloud_name: string | null;
    message: string;
  } | null>(null);

  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title: 'Rayova',
    subtitle: "L'Art du Parfum",
    description: "Découvrez l´essence de luxe",
    description_color_light: '#1a1a1a',
    description_color_dark: '#f2f2f2',
    cta_primary: 'Découvrir',
    cta_secondary: 'Acheter',
    video_url: null,
    image_url: null,
  });

  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: 'contact@rayova.ma',
    phone: '+212 5XX-XXXXXX',
    address: 'Casablanca, Maroc',
  });

  const [openingSoonSettings, setOpeningSoonSettings] = useState<OpeningSoonSettings>({
    enabled: false,
    title: 'Bientôt Disponible',
    subtitle: 'Rayova Luxury Fragrance',
    description: 'Nous préparons quelque chose de spécial pour vous.',
    video_url: null,
    image_url: null,
  });

  // Fetch storage status on mount
  useEffect(() => {
    const fetchStorageStatus = async () => {
      try {
        const response = await api.get('/admin/storage/status');
        if (response && (response as any).data) {
          setStorageStatus((response as any).data);
        } else {
          setStorageStatus(response as any);
        }
      } catch (error) {
        console.error('Erreur status stockage:', error);
      }
    };
    fetchStorageStatus();
  }, []);

  // Initialize form data from settings
  useEffect(() => {
    if (settings) {
      if (settings.hero) {
        setHeroSettings(prev => ({ ...prev, ...(settings.hero as HeroSettings) }));
      }
      if (settings.contact) {
        setContactSettings(prev => ({ ...prev, ...(settings.contact as ContactSettings) }));
      }
      if (settings.opening_soon) {
        setOpeningSoonSettings(prev => ({ ...prev, ...(settings.opening_soon as OpeningSoonSettings) }));
      }
    }
  }, [settings]);

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'hero_background_url' | 'hero_video_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    setIsSaving(true);
    try {
      console.log(`[Upload] Starting upload for ${key}...`);
      const response: any = await api.post('/admin/settings/upload', formData);

      const newUrl = response.url;
      console.log(`[Upload] Success! New URL: ${newUrl}`);
      if (key === 'hero_background_url') {
        setHeroSettings(prev => ({ ...prev, image_url: newUrl }));
      } else if (key === 'hero_video_url') {
        setHeroSettings(prev => ({ ...prev, video_url: newUrl }));
      } else if (key === 'opening_soon_image') {
        setOpeningSoonSettings(prev => ({ ...prev, image_url: newUrl }));
      } else if (key === 'opening_soon_video') {
        setOpeningSoonSettings(prev => ({ ...prev, video_url: newUrl }));
      }

      toast({ title: 'Fichier chargé avec succès' });
    } catch (error: any) {
      toast({
        title: 'Erreur d\'upload',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHero = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({ key: 'hero', value: heroSettings });
      toast({ title: 'Paramètres du hero sauvegardés' });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContact = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({ key: 'contact', value: contactSettings });
      toast({ title: 'Coordonnées sauvegardées' });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOpeningSoon = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({ key: 'opening_soon', value: openingSoonSettings });
      toast({ title: 'Paramètres "Ouverture Prochaine" sauvegardés' });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Paramètres
        </h1>
        <p className="text-muted-foreground mt-1">
          Configurez les paramètres globaux de votre site
        </p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hero">Section Hero</TabsTrigger>
          <TabsTrigger value="opening_soon">Ouverture Prochaine</TabsTrigger>
          <TabsTrigger value="contact">Coordonnées</TabsTrigger>
          <TabsTrigger value="storage">Stockage</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Section Hero</CardTitle>
              <CardDescription>
                Personnalisez la section d'accueil de votre site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_title">Titre</Label>
                  <Input
                    id="hero_title"
                    value={heroSettings?.title || ''}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Sous-titre</Label>
                  <Input
                    id="hero_subtitle"
                    value={heroSettings?.subtitle || ''}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, subtitle: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_description">Texte de description</Label>
                  <Input
                    id="hero_description"
                    value={heroSettings?.description || ''}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_description_color_light">Couleur description (Mode Clair)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hero_description_color_light"
                      type="color"
                      className="w-12 p-1 h-10"
                      value={heroSettings?.description_color_light || '#1a1a1a'}
                      onChange={(e) =>
                        setHeroSettings({ ...heroSettings, description_color_light: e.target.value })
                      }
                    />
                    <Input
                      value={heroSettings?.description_color_light || '#1a1a1a'}
                      onChange={(e) =>
                        setHeroSettings({ ...heroSettings, description_color_light: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_description_color_dark">Couleur description (Mode Sombre)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hero_description_color_dark"
                      type="color"
                      className="w-12 p-1 h-10"
                      value={heroSettings?.description_color_dark || '#f2f2f2'}
                      onChange={(e) =>
                        setHeroSettings({ ...heroSettings, description_color_dark: e.target.value })
                      }
                    />
                    <Input
                      value={heroSettings?.description_color_dark || '#f2f2f2'}
                      onChange={(e) =>
                        setHeroSettings({ ...heroSettings, description_color_dark: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_primary">Bouton principal</Label>
                  <Input
                    id="cta_primary"
                    value={heroSettings?.cta_primary || ''}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, cta_primary: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_secondary">Bouton secondaire</Label>
                  <Input
                    id="cta_secondary"
                    value={heroSettings?.cta_secondary || ''}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, cta_secondary: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="video_url">Fond Vidéo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="video_url"
                      value={heroSettings?.video_url || ''}
                      onChange={(e) =>
                        setHeroSettings({ ...heroSettings, video_url: e.target.value || null })
                      }
                      placeholder="URL de la vidéo..."
                    />
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Charger</span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={(e) => handleBackgroundUpload(e, 'hero_video_url')}
                      />
                    </label>
                  </div>
                  {heroSettings?.video_url && (
                    <video
                      src={heroSettings.video_url}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                      muted
                      controls
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="image_url">Fond Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image_url"
                      value={heroSettings?.image_url || ''}
                      onChange={(e) =>
                        setHeroSettings({ ...heroSettings, image_url: e.target.value || null })
                      }
                      placeholder="URL de l'image..."
                    />
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Charger</span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleBackgroundUpload(e, 'hero_background_url')}
                      />
                    </label>
                  </div>
                  {heroSettings?.image_url && (
                    <img
                      src={heroSettings.image_url}
                      alt="Hero background"
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                  )}
                </div>
              </div>

              <Button onClick={handleSaveHero} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opening_soon">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ouverture Prochaine (Maintenance)</CardTitle>
                  <CardDescription>
                    Activez cette page pour teser votre lancement
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="opening_soon_enabled" className="text-sm font-medium">Activer</Label>
                  <Switch
                    id="opening_soon_enabled"
                    checked={openingSoonSettings.enabled}
                    onCheckedChange={(checked) => setOpeningSoonSettings({ ...openingSoonSettings, enabled: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="os_title">Titre Principal</Label>
                  <Input
                    id="os_title"
                    value={openingSoonSettings.title}
                    onChange={(e) => setOpeningSoonSettings({ ...openingSoonSettings, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="os_subtitle">Sous-titre</Label>
                  <Input
                    id="os_subtitle"
                    value={openingSoonSettings.subtitle}
                    onChange={(e) => setOpeningSoonSettings({ ...openingSoonSettings, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="os_description">Message de Teaser</Label>
                <Textarea
                  id="os_description"
                  value={openingSoonSettings.description}
                  onChange={(e) => setOpeningSoonSettings({ ...openingSoonSettings, description: e.target.value })}
                  className="min-h-[100px] bg-background/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Fond Vidéo (Recommandé)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={openingSoonSettings.video_url || ''}
                      onChange={(e) => setOpeningSoonSettings({ ...openingSoonSettings, video_url: e.target.value || null })}
                      placeholder="URL de la vidéo..."
                    />
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Charger</span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={(e) => handleBackgroundUpload(e, 'opening_soon_video' as any)}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Fond Image (Alternative)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={openingSoonSettings.image_url || ''}
                      onChange={(e) => setOpeningSoonSettings({ ...openingSoonSettings, image_url: e.target.value || null })}
                      placeholder="URL de l'image..."
                    />
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Charger</span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleBackgroundUpload(e, 'opening_soon_image' as any)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveOpeningSoon} disabled={isSaving} className="mt-4">
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Sauvegarder les paramètres
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Coordonnées</CardTitle>
              <CardDescription>
                Les informations de contact affichées sur le site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={contactSettings?.email || ''}
                  onChange={(e) =>
                    setContactSettings({ ...contactSettings, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone</Label>
                <Input
                  id="contact_phone"
                  value={contactSettings?.phone || ''}
                  onChange={(e) =>
                    setContactSettings({ ...contactSettings, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_address">Adresse</Label>
                <Input
                  id="contact_address"
                  value={contactSettings?.address || ''}
                  onChange={(e) =>
                    setContactSettings({ ...contactSettings, address: e.target.value })
                  }
                />
              </div>

              <Button onClick={handleSaveContact} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>État du Stockage</CardTitle>
              <CardDescription>
                Vérifiez si vos fichiers sont sauvegardés de manière permanente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {storageStatus ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border flex items-start gap-4 ${storageStatus.is_configured
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                    }`}>
                    {storageStatus.is_configured ? (
                      <CheckCircle2 className="h-6 w-6 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold flex items-center gap-2 font-display">
                        {storageStatus.type === 'cloudinary' ? 'Stockage Cloud (Cloudinary)' : 'Stockage Local (Temporaire)'}
                      </h4>
                      <p className="text-sm mt-1 opacity-90">
                        {storageStatus.message}
                      </p>
                    </div>
                  </div>

                  {!storageStatus.is_configured && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                      <AlertCircleIcon className="h-4 w-4" />
                      <AlertTitle className="font-bold">Attention : Risque de perte de données</AlertTitle>
                      <AlertDescription>
                        L'environnement de production utilise un système de fichiers éphémère. Sans Cloudinary, tous vos médias (images de produits, bannières, etc.) seront <strong>supprimés</strong> à chaque nouveau déploiement ou redémarrage du serveur.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted/30 border-none">
                      <CardHeader className="py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type de Driver</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-xl font-bold uppercase text-foreground">{storageStatus.type}</span>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30 border-none">
                      <CardHeader className="py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cloud Name</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-xl font-bold text-foreground">{storageStatus.cloud_name || 'Non configuré'}</span>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 p-5 rounded-xl">
                    <h5 className="font-bold text-sm mb-3 flex items-center gap-2 text-primary">
                      <Cloud className="h-4 w-4" />
                      Comment activer le stockage permanent ?
                    </h5>
                    <ol className="text-xs space-y-3 text-muted-foreground list-decimal pl-4">
                      <li>Créez un compte gratuit sur <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Cloudinary.com</a></li>
                      <li>Récupérez votre <strong>Cloud Name</strong>, <strong>API Key</strong> et <strong>API Secret</strong> sur votre tableau de bord</li>
                      <li>Ajoutez ces variables d'environnement dans votre tableau de bord de déploiement (Render, Railway, etc.) :
                        <div className="mt-2 p-3 bg-card rounded border border-border/50 font-mono text-[10px] space-y-1">
                          <div>CLOUDINARY_CLOUD_NAME=votre_nom</div>
                          <div>CLOUDINARY_API_KEY=votre_cle</div>
                          <div>CLOUDINARY_API_SECRET=votre_secret</div>
                        </div>
                      </li>
                      <li>Le projet se redéploiera automatiquement et vos fichiers seront désormais en sécurité !</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
