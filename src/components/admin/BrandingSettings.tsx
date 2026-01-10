import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Image, Type, Save, RefreshCw, Globe, Share2, Search } from 'lucide-react';

interface BrandingSetting {
  key: string;
  value: string;
}

export function BrandingSettings() {
  const [settings, setSettings] = useState({
    site_name: 'DailyWatch',
    site_tagline: 'Ad-Free Dailymotion Experience',
    site_description: 'Watch Dailymotion videos without ads. Premium ad-free streaming, save favorites, continue watching, and more.',
    site_favicon: '',
    site_logo: '',
    site_primary_color: '#22d3ee',
    site_og_image: '',
    site_twitter_handle: '',
    site_keywords: 'dailymotion, ad-free, video streaming, no ads, watch videos',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .in('key', Object.keys(settings));
    
    if (data) {
      const settingsMap: Record<string, string> = {};
      data.forEach((s: BrandingSetting) => {
        settingsMap[s.key] = s.value;
      });
      setSettings(prev => ({ ...prev, ...settingsMap }));
    }
    setLoading(false);
  };

  const saveAllSettings = async () => {
    setSaving(true);
    
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      encrypted: false,
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      await supabase
        .from('admin_settings')
        .upsert(update, { onConflict: 'key' });
    }
    
    toast({
      title: 'Settings Saved',
      description: 'Branding & SEO settings have been updated. Refresh the page to see changes.',
    });
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Site Identity */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Site Identity
          </CardTitle>
          <CardDescription>
            Customize your site name and tagline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_name">Site Name</Label>
            <Input
              id="site_name"
              value={settings.site_name}
              onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
              placeholder="DailyWatch"
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              This appears in browser tabs and when sharing links
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_tagline">Tagline</Label>
            <Input
              id="site_tagline"
              value={settings.site_tagline}
              onChange={(e) => setSettings(prev => ({ ...prev, site_tagline: e.target.value }))}
              placeholder="Ad-Free Dailymotion Experience"
              className="bg-secondary/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            SEO Settings
          </CardTitle>
          <CardDescription>
            Optimize your site for search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_description">Meta Description</Label>
            <Textarea
              id="site_description"
              value={settings.site_description}
              onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
              placeholder="A brief description of your site for search engines..."
              className="bg-secondary/50 min-h-[80px]"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {settings.site_description.length}/160 characters - This appears in search results
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_keywords">Keywords</Label>
            <Input
              id="site_keywords"
              value={settings.site_keywords}
              onChange={(e) => setSettings(prev => ({ ...prev, site_keywords: e.target.value }))}
              placeholder="dailymotion, ad-free, video streaming"
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated keywords for search engines
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing / Open Graph */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Social Sharing (Open Graph)
          </CardTitle>
          <CardDescription>
            How your site appears when shared on social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_og_image">Social Share Image URL</Label>
            <Input
              id="site_og_image"
              value={settings.site_og_image}
              onChange={(e) => setSettings(prev => ({ ...prev, site_og_image: e.target.value }))}
              placeholder="https://example.com/og-image.png"
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x630px - Shows when sharing on Facebook, Messenger, Discord, etc.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_twitter_handle">Twitter/X Handle</Label>
            <Input
              id="site_twitter_handle"
              value={settings.site_twitter_handle}
              onChange={(e) => setSettings(prev => ({ ...prev, site_twitter_handle: e.target.value }))}
              placeholder="@yourhandle"
              className="bg-secondary/50"
            />
          </div>
          
          {/* Preview */}
          {(settings.site_og_image || settings.site_name) && (
            <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-3">Social Share Preview</p>
              <div className="border border-border/50 rounded-lg overflow-hidden max-w-sm bg-background">
                {settings.site_og_image && (
                  <img 
                    src={settings.site_og_image} 
                    alt="OG preview" 
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{settings.site_name || 'Your Site Name'}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{settings.site_description || 'Your site description...'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logo & Favicon */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Logo & Favicon
          </CardTitle>
          <CardDescription>
            Set your site logo and favicon URLs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_logo">Logo URL</Label>
            <Input
              id="site_logo"
              value={settings.site_logo}
              onChange={(e) => setSettings(prev => ({ ...prev, site_logo: e.target.value }))}
              placeholder="https://example.com/logo.png"
              className="bg-secondary/50"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to use default logo. Recommended size: 40x40px
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_favicon">Favicon URL</Label>
            <Input
              id="site_favicon"
              value={settings.site_favicon}
              onChange={(e) => setSettings(prev => ({ ...prev, site_favicon: e.target.value }))}
              placeholder="https://example.com/favicon.ico"
              className="bg-secondary/50"
            />
            <p className="text-sm text-muted-foreground">
              Shows in browser tabs. Recommended: .ico or .png (32x32px)
            </p>
          </div>
          {(settings.site_logo || settings.site_favicon) && (
            <div className="flex gap-4 p-4 bg-secondary/30 rounded-lg">
              {settings.site_logo && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">Logo Preview</p>
                  <img 
                    src={settings.site_logo} 
                    alt="Logo preview" 
                    className="w-10 h-10 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {settings.site_favicon && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">Favicon Preview</p>
                  <img 
                    src={settings.site_favicon} 
                    alt="Favicon preview" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Color */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme Color
          </CardTitle>
          <CardDescription>
            Set your primary brand color
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_primary_color">Primary Color</Label>
            <div className="flex gap-3">
              <input
                type="color"
                id="site_primary_color"
                value={settings.site_primary_color}
                onChange={(e) => setSettings(prev => ({ ...prev, site_primary_color: e.target.value }))}
                className="w-12 h-10 rounded cursor-pointer border-0"
              />
              <Input
                value={settings.site_primary_color}
                onChange={(e) => setSettings(prev => ({ ...prev, site_primary_color: e.target.value }))}
                placeholder="#22d3ee"
                className="flex-1 bg-secondary/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveAllSettings} disabled={saving} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : 'Save All Branding & SEO Settings'}
      </Button>
    </div>
  );
}
