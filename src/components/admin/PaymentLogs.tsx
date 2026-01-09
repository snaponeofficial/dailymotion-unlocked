import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Receipt, ChevronDown, ChevronUp } from 'lucide-react';

interface PaymentLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  external_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  invoice_url: string | null;
  ip_address: string | null;
  created_at: string;
  xendit_response: Record<string, unknown> | null;
}

export function PaymentLogs() {
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (data) {
      setLogs(data as PaymentLog[]);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log =>
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.external_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'settled':
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
      case 'created':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'expired':
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, ID, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No payment logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="glass rounded-lg p-4 border border-border/30"
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{log.user_email || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {log.external_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-display font-bold">
                      {log.currency} {log.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                  {expandedLog === log.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              {expandedLog === log.id && (
                <div className="mt-4 pt-4 border-t border-border/30 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="ml-2">{log.payment_method || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="ml-2 font-mono">{log.ip_address || 'N/A'}</span>
                    </div>
                    {log.invoice_url && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Invoice:</span>
                        <a 
                          href={log.invoice_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:underline"
                        >
                          View Invoice
                        </a>
                      </div>
                    )}
                  </div>
                  {log.xendit_response && (
                    <div className="mt-2">
                      <span className="text-muted-foreground">Raw Response:</span>
                      <pre className="mt-1 p-2 bg-secondary/50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.xendit_response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
