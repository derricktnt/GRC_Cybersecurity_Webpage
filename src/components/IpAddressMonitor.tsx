import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, AlertTriangle, Shield, Radio } from 'lucide-react';
import { supabase, IpAddress } from '../lib/supabase';

export function IpAddressMonitor() {
  const [ipAddresses, setIpAddresses] = useState<IpAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ip_address: '',
    hostname: '',
    location: '',
    risk_level: 'low',
    category: 'external',
    notes: ''
  });

  useEffect(() => {
    fetchIpAddresses();
  }, []);

  const fetchIpAddresses = async () => {
    const { data, error } = await supabase
      .from('ip_addresses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching IP addresses:', error);
    } else {
      setIpAddresses(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('ip_addresses')
      .insert([{
        ...formData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }]);

    if (error) {
      console.error('Error adding IP address:', error);
    } else {
      setFormData({
        ip_address: '',
        hostname: '',
        location: '',
        risk_level: 'low',
        category: 'external',
        notes: ''
      });
      setShowForm(false);
      fetchIpAddresses();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('ip_addresses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting IP address:', error);
    } else {
      fetchIpAddresses();
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Radio className="w-4 h-4" />;
      case 'low':
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'external': return 'bg-gray-100 text-gray-800';
      case 'partner': return 'bg-teal-100 text-teal-800';
      case 'threat': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskStats = () => {
    const stats = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    ipAddresses.forEach(ip => {
      if (ip.risk_level in stats) {
        stats[ip.risk_level as keyof typeof stats]++;
      }
    });
    return stats;
  };

  const stats = getRiskStats();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Globe className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">IP Address Monitoring</h2>
              <p className="text-sm text-gray-500">Track and assess network security threats</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add IP Address
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Low Risk</span>
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.low}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-700">Medium Risk</span>
              <Radio className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.medium}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-700">High Risk</span>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">{stats.high}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-700">Critical Risk</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">{stats.critical}</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input
                  type="text"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                  placeholder="192.168.1.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hostname</label>
                <input
                  type="text"
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="server.example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="US, EU, APAC, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                  <option value="partner">Partner</option>
                  <option value="threat">Threat</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="Additional information about this IP address..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add IP Address
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {ipAddresses.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No IP addresses monitored yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first IP address to start monitoring</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ipAddresses.map((ip) => (
              <div
                key={ip.id}
                className={`p-4 border rounded-lg hover:shadow-md transition-all ${getRiskColor(ip.risk_level)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-lg font-semibold font-mono">{ip.ip_address}</code>
                      <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${getRiskColor(ip.risk_level)}`}>
                        {getRiskIcon(ip.risk_level)}
                        {ip.risk_level}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(ip.category)}`}>
                        {ip.category}
                      </span>
                    </div>
                    {ip.hostname && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Hostname:</span> {ip.hostname}
                      </p>
                    )}
                    {ip.location && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Location:</span> {ip.location}
                      </p>
                    )}
                    {ip.notes && (
                      <p className="text-sm text-gray-600 mt-2 p-2 bg-white bg-opacity-50 rounded">
                        {ip.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Last seen: {new Date(ip.last_seen).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(ip.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 ml-4"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
