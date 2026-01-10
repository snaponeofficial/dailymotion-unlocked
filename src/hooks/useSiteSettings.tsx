import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_favicon: string;
  site_logo: string;
  site_primary_color: string;
  site_og_image: string;
  site_twitter_handle: string;
  site_keywords: string;
}

const defaultSettings: SiteSettings = {
  site_name: 'DailyWatch',
  site_tagline: 'Ad-Free Dailymotion Experience',
  site_description: 'Watch Dailymotion videos without ads. Premium ad-free streaming, save favorites, continue watching, and more.',
  site_favicon: '',
  site_logo: '',
  site_primary_color: '#22d3ee',
  site_og_image: '',
  site_twitter_handle: '',
  site_keywords: 'dailymotion, ad-free, video streaming, no ads, watch videos',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', Object.keys(defaultSettings));

      if (data && data.length > 0) {
        const settingsMap: Partial<SiteSettings> = {};
        data.forEach((s: { key: string; value: string }) => {
          settingsMap[s.key as keyof SiteSettings] = s.value;
        });
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply settings to document
  useEffect(() => {
    if (loading) return;

    // Update document title
    document.title = settings.site_name || defaultSettings.site_name;

    // Update favicon
    const faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (faviconLink && settings.site_favicon) {
      faviconLink.href = settings.site_favicon;
    }

    // Update meta description
    const descMeta = document.querySelector("meta[name='description']") as HTMLMetaElement;
    if (descMeta) {
      descMeta.content = settings.site_description || settings.site_tagline || defaultSettings.site_description;
    }

    // Update keywords
    let keywordsMeta = document.querySelector("meta[name='keywords']") as HTMLMetaElement;
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.name = 'keywords';
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.content = settings.site_keywords || defaultSettings.site_keywords;

    // Update Open Graph tags
    const ogTitle = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
    if (ogTitle) {
      ogTitle.content = settings.site_name || defaultSettings.site_name;
    }

    const ogDesc = document.querySelector("meta[property='og:description']") as HTMLMetaElement;
    if (ogDesc) {
      ogDesc.content = settings.site_description || settings.site_tagline || defaultSettings.site_description;
    }

    const ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
    if (ogImage && settings.site_og_image) {
      ogImage.content = settings.site_og_image;
    }

    // Update Twitter tags
    const twitterImage = document.querySelector("meta[name='twitter:image']") as HTMLMetaElement;
    if (twitterImage && settings.site_og_image) {
      twitterImage.content = settings.site_og_image;
    }

    const twitterSite = document.querySelector("meta[name='twitter:site']") as HTMLMetaElement;
    if (twitterSite && settings.site_twitter_handle) {
      twitterSite.content = settings.site_twitter_handle.startsWith('@') 
        ? settings.site_twitter_handle 
        : `@${settings.site_twitter_handle}`;
    }

    // Update Twitter title and description
    let twitterTitle = document.querySelector("meta[name='twitter:title']") as HTMLMetaElement;
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta');
      twitterTitle.name = 'twitter:title';
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.content = settings.site_name || defaultSettings.site_name;

    let twitterDesc = document.querySelector("meta[name='twitter:description']") as HTMLMetaElement;
    if (!twitterDesc) {
      twitterDesc = document.createElement('meta');
      twitterDesc.name = 'twitter:description';
      document.head.appendChild(twitterDesc);
    }
    twitterDesc.content = settings.site_description || settings.site_tagline || defaultSettings.site_description;

    // Apply primary color to CSS custom property (optional)
    if (settings.site_primary_color) {
      // Convert hex to HSL for the CSS variable
      const hex = settings.site_primary_color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      document.documentElement.style.setProperty(
        '--primary', 
        `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
      );
    }
  }, [settings, loading]);

  return { settings, loading, refetch: fetchSettings };
}
