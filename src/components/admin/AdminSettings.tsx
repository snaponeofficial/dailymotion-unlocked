import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Key, Send, Bell, Save, Eye, EyeOff } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  encrypted: boolean;
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({
    xendit_api_key: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
    notifications_enabled: 'false',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*');
    
    if (data) {
      const settingsMap: Record<string, string> = {};
      data.forEach((s: Setting) => {
        settingsMap[s.key] = s.value;
      });
      setSettings(prev => ({ ...prev, ...settingsMap }));
    }
  };

  const saveSetting = async (key: string, value: string, encrypted = false) => {
    setLoading(true);
    
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ 
        key, 
        value, 
        encrypted,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'key' 
      });
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save setting',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Saved',
        description: `${key.replace(/_/g, ' ')} updated successfully`,
      });
    }
    
    setLoading(false);
  };

  const testTelegramNotification = async () => {
    if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
      toast({
        title: 'Missing Configuration',
        description: 'Please configure Telegram bot token and chat ID first',
        variant: 'destructive',
      });
      return;
    }

    setTestingTelegram(true);
    
    try {
      const response = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          message: '🧪 Test notification from DailyWatch Admin!\n\nIf you see this, Telegram notifications are working correctly.',
          test: true,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: 'Test Sent',
        description: 'Check your Telegram for the test message',
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Could not send test notification. Check your configuration.',
        variant: 'destructive',
      });
    }
    
    setTestingTelegram(false);
  };

  return (
    <div className="space-y-6">
      {/* Xendit API Key */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Xendit API Configuration
          </CardTitle>
          <CardDescription>
            Configure your Xendit secret key for payment processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="xendit_api_key">Secret API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="xendit_api_key"
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.xendit_api_key}
                  onChange={(e) => setSettings(prev => ({ ...prev, xendit_api_key: e.target.value }))}
                  placeholder="xnd_production_..."
                  className="bg-secondary/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                onClick={() => saveSetting('xendit_api_key', settings.xendit_api_key, true)}
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://dashboard.xendit.co/settings/developers#api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Xendit Dashboard
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Notifications */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Telegram Notifications
          </CardTitle>
          <CardDescription>
            Receive instant payment notifications via Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications_enabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts when payments are made
              </p>
            </div>
            <Switch
              id="notifications_enabled"
              checked={settings.notifications_enabled === 'true'}
              onCheckedChange={(checked) => {
                const value = checked ? 'true' : 'false';
                setSettings(prev => ({ ...prev, notifications_enabled: value }));
                saveSetting('notifications_enabled', value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram_bot_token">Bot Token</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="telegram_bot_token"
                  type={showTelegramToken ? 'text' : 'password'}
                  value={settings.telegram_bot_token}
                  onChange={(e) => setSettings(prev => ({ ...prev, telegram_bot_token: e.target.value }))}
                  placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                  className="bg-secondary/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowTelegramToken(!showTelegramToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showTelegramToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                onClick={() => saveSetting('telegram_bot_token', settings.telegram_bot_token, true)}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a bot via{' '}
              <a 
                href="https://t.me/BotFather" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @BotFather
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram_chat_id">Chat ID</Label>
            <div className="flex gap-2">
              <Input
                id="telegram_chat_id"
                value={settings.telegram_chat_id}
                onChange={(e) => setSettings(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                placeholder="-100123456789"
                className="flex-1 bg-secondary/50"
              />
              <Button
                onClick={() => saveSetting('telegram_chat_id', settings.telegram_chat_id)}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Use{' '}
              <a 
                href="https://t.me/userinfobot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @userinfobot
              </a>
              {' '}to get your chat ID
            </p>
          </div>

          <Button
            variant="outline"
            onClick={testTelegramNotification}
            disabled={testingTelegram}
            className="w-full"
          >
            <Bell className="w-4 h-4 mr-2" />
            {testingTelegram ? 'Sending...' : 'Send Test Notification'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
