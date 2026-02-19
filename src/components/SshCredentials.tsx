import { useState, useEffect } from 'react';
import { Server, Plus, Trash2, Eye, EyeOff, Key, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SshCredential {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: 'password' | 'key' | 'key_with_passphrase';
  private_key?: string;
  passphrase?: string;
  password?: string;
  description?: string;
  last_used?: string;
  is_active: boolean;
  created_at: string;
}

export function SshCredentials() {
  const [credentials, setCredentials] = useState<SshCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    auth_type: 'password' as 'password' | 'key' | 'key_with_passphrase',
    private_key: '',
    passphrase: '',
    password: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ssh_credentials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching SSH credentials:', error);
    } else {
      setCredentials(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const credential = {
      user_id: user.id,
      ...formData,
      private_key: formData.auth_type !== 'password' ? formData.private_key : null,
      passphrase: formData.auth_type === 'key_with_passphrase' ? formData.passphrase : null,
      password: formData.auth_type === 'password' ? formData.password : null,
    };

    const { error } = await supabase
      .from('ssh_credentials')
      .insert([credential]);

    if (error) {
      console.error('Error creating SSH credential:', error);
      alert('Error creating SSH credential');
    } else {
      setShowForm(false);
      setFormData({
        name: '',
        host: '',
        port: 22,
        username: '',
        auth_type: 'password',
        private_key: '',
        passphrase: '',
        password: '',
        description: '',
        is_active: true
      });
      fetchCredentials();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SSH credential?')) return;

    const { error } = await supabase
      .from('ssh_credentials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting SSH credential:', error);
      alert('Error deleting SSH credential');
    } else {
      fetchCredentials();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('ssh_credentials')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating SSH credential:', error);
    } else {
      fetchCredentials();
    }
  };

  const toggleShowSecret = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskSecret = (secret: string | undefined, credentialId: string) => {
    if (!secret) return 'Not set';
    if (showSecrets[credentialId]) return secret;
    return '••••••••••••';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading SSH credentials...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <Server className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">SSH Credentials</h2>
            <p className="text-sm text-gray-500">Manage SSH keys and server credentials</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Credential
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New SSH Credential</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="Production Server"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host
                </label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="192.168.1.1 or server.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  min="1"
                  max="65535"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="root or admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authentication Type
              </label>
              <select
                value={formData.auth_type}
                onChange={(e) => setFormData({ ...formData, auth_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="password">Password</option>
                <option value="key">SSH Key</option>
                <option value="key_with_passphrase">SSH Key with Passphrase</option>
              </select>
            </div>

            {formData.auth_type === 'password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {(formData.auth_type === 'key' || formData.auth_type === 'key_with_passphrase') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Private Key
                </label>
                <textarea
                  value={formData.private_key}
                  onChange={(e) => setFormData({ ...formData, private_key: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                  rows={6}
                  required
                  placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                />
              </div>
            )}

            {formData.auth_type === 'key_with_passphrase' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passphrase
                </label>
                <input
                  type="password"
                  value={formData.passphrase}
                  onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                placeholder="Additional notes about this credential"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Credential
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {credentials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
          <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No SSH Credentials</h3>
          <p className="text-gray-500 mb-6">Add your first SSH credential to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add SSH Credential
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {credentials.map((credential) => (
            <div
              key={credential.id}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${credential.is_active ? 'bg-green-50' : 'bg-gray-100'}`}>
                    {credential.auth_type === 'password' ? (
                      <Lock className={`w-5 h-5 ${credential.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                    ) : (
                      <Key className={`w-5 h-5 ${credential.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{credential.name}</h3>
                      {credential.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Host:</span> {credential.host}:{credential.port}
                      </p>
                      <p>
                        <span className="font-medium">Username:</span> {credential.username}
                      </p>
                      <p>
                        <span className="font-medium">Auth Type:</span>{' '}
                        {credential.auth_type === 'password' ? 'Password' : credential.auth_type === 'key' ? 'SSH Key' : 'SSH Key with Passphrase'}
                      </p>
                      {credential.description && (
                        <p className="text-gray-500 italic">{credential.description}</p>
                      )}
                      {credential.last_used && (
                        <p className="text-gray-500">
                          Last used: {new Date(credential.last_used).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      {credential.password && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Password:</span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            {maskSecret(credential.password, credential.id)}
                          </code>
                          <button
                            onClick={() => toggleShowSecret(credential.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {showSecrets[credential.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                      {credential.private_key && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-700">Private Key:</span>
                          <div className="flex-1">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono block overflow-x-auto">
                              {showSecrets[credential.id] ? credential.private_key : '••••••••••••'}
                            </code>
                          </div>
                          <button
                            onClick={() => toggleShowSecret(credential.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {showSecrets[credential.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                      {credential.passphrase && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Passphrase:</span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            {maskSecret(credential.passphrase, credential.id)}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(credential.id, credential.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      credential.is_active
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                    title={credential.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {credential.is_active ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(credential.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Created: {new Date(credential.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
