import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Image, Type, Save, RefreshCw } from 'lucide-react';

interface BrandingSetting {
  key: string;
  value: string;
}

export function BrandingSettings() {
  const [settings, setSettings] = useState({
    site_name: 'DailyWatch',
    site_tagline: 'Ad-Free Dailymotion Experience',
    site_favicon: '',
    site_logo: '',
    site_primary_color: '#22d3ee',
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
      .in('key', ['site_name', 'site_tagline', 'site_favicon', 'site_logo', 'site_primary_color']);
    
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
      description: 'Branding settings have been updated. Refresh the page to see changes.',
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
              Leave empty to use default favicon. Recommended: .ico or .png
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
        {saving ? 'Saving...' : 'Save All Branding Settings'}
      </Button>
    </div>
  );
}
