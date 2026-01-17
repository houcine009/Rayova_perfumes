import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSiteSettings, useUpdateSetting, type HeroSettings, type ContactSettings } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const [isSaving, setIsSaving] = useState(false);

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'hero_background_url' | 'hero_video_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    setIsSaving(true);
    try {
      const response = await api.post('/admin/settings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newUrl = response.url;
      if (key === 'hero_background_url') {
        setHeroSettings(prev => ({ ...prev, image_url: newUrl }));
      } else {
        setHeroSettings(prev => ({ ...prev, video_url: newUrl }));
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

  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title: 'Rayova',
    subtitle: "L'Art du Parfum",
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

  const { toast } = useToast();

  useEffect(() => {
    if (settings) {
      if (settings.hero) {
        setHeroSettings(settings.hero as HeroSettings);
      }
      if (settings.contact) {
        setContactSettings(settings.contact as ContactSettings);
      }
    }
  }, [settings]);

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
          <TabsTrigger value="contact">Coordonnées</TabsTrigger>
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
                    value={heroSettings.title}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Sous-titre</Label>
                  <Input
                    id="hero_subtitle"
                    value={heroSettings.subtitle}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, subtitle: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_primary">Bouton principal</Label>
                  <Input
                    id="cta_primary"
                    value={heroSettings.cta_primary}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, cta_primary: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_secondary">Bouton secondaire</Label>
                  <Input
                    id="cta_secondary"
                    value={heroSettings.cta_secondary}
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
                      value={heroSettings.video_url || ''}
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
                  {heroSettings.video_url && (
                    <video
                      src={heroSettings.video_url}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                      muted
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="image_url">Fond Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image_url"
                      value={heroSettings.image_url || ''}
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
                  {heroSettings.image_url && (
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
                  value={contactSettings.email}
                  onChange={(e) =>
                    setContactSettings({ ...contactSettings, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone</Label>
                <Input
                  id="contact_phone"
                  value={contactSettings.phone}
                  onChange={(e) =>
                    setContactSettings({ ...contactSettings, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_address">Adresse</Label>
                <Input
                  id="contact_address"
                  value={contactSettings.address}
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
      </Tabs>
    </div>
  );
};

export default AdminSettings;
