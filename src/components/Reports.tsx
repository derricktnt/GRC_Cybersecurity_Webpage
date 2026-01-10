import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Calendar, Shield, Key, Globe, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReportData {
  totalApiKeys: number;
  activeApiKeys: number;
  expiredApiKeys: number;
  totalIpAddresses: number;
  highRiskIps: number;
  criticalRiskIps: number;
  apiKeysByEnvironment: Record<string, number>;
  ipsByRiskLevel: Record<string, number>;
  ipsByCategory: Record<string, number>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export function Reports() {
  const [reportData, setReportData] = useState<ReportData>({
    totalApiKeys: 0,
    activeApiKeys: 0,
    expiredApiKeys: 0,
    totalIpAddresses: 0,
    highRiskIps: 0,
    criticalRiskIps: 0,
    apiKeysByEnvironment: {},
    ipsByRiskLevel: {},
    ipsByCategory: {},
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);

    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('*');

    const { data: ipAddresses } = await supabase
      .from('ip_addresses')
      .select('*');

    if (apiKeys && ipAddresses) {
      const apiKeysByEnv: Record<string, number> = {};
      apiKeys.forEach(key => {
        apiKeysByEnv[key.environment] = (apiKeysByEnv[key.environment] || 0) + 1;
      });

      const ipsByRisk: Record<string, number> = {};
      const ipsByCat: Record<string, number> = {};
      ipAddresses.forEach(ip => {
        ipsByRisk[ip.risk_level] = (ipsByRisk[ip.risk_level] || 0) + 1;
        ipsByCat[ip.category] = (ipsByCat[ip.category] || 0) + 1;
      });

      const recentActivity = [
        ...apiKeys.slice(0, 3).map(key => ({
          type: 'api_key',
          description: `API Key "${key.name}" for ${key.service}`,
          timestamp: key.created_at
        })),
        ...ipAddresses.slice(0, 3).map(ip => ({
          type: 'ip_address',
          description: `IP Address ${ip.ip_address} (${ip.risk_level} risk)`,
          timestamp: ip.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      setReportData({
        totalApiKeys: apiKeys.length,
        activeApiKeys: apiKeys.filter(k => k.status === 'active').length,
        expiredApiKeys: apiKeys.filter(k => k.status === 'expired').length,
        totalIpAddresses: ipAddresses.length,
        highRiskIps: ipAddresses.filter(ip => ip.risk_level === 'high').length,
        criticalRiskIps: ipAddresses.filter(ip => ip.risk_level === 'critical').length,
        apiKeysByEnvironment: apiKeysByEnv,
        ipsByRiskLevel: ipsByRisk,
        ipsByCategory: ipsByCat,
        recentActivity
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    );
  }

  const totalThreats = reportData.highRiskIps + reportData.criticalRiskIps;
  const securityScore = Math.max(0, 100 - (totalThreats * 5) - (reportData.expiredApiKeys * 3));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <BarChart3 className="w-7 h-7 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Reports & Analytics</h2>
          <p className="text-sm text-gray-500">Comprehensive overview of your security posture</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Security Score</h3>
            <Shield className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{securityScore}/100</p>
          <p className="text-xs opacity-80 mt-1">
            {securityScore >= 90 ? 'Excellent' : securityScore >= 70 ? 'Good' : securityScore >= 50 ? 'Fair' : 'Needs Attention'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">API Keys</h3>
            <Key className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{reportData.totalApiKeys}</p>
          <p className="text-xs opacity-80 mt-1">{reportData.activeApiKeys} active, {reportData.expiredApiKeys} expired</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">IP Addresses</h3>
            <Globe className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{reportData.totalIpAddresses}</p>
          <p className="text-xs opacity-80 mt-1">Monitored endpoints</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Active Threats</h3>
            <AlertCircle className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{totalThreats}</p>
          <p className="text-xs opacity-80 mt-1">{reportData.criticalRiskIps} critical, {reportData.highRiskIps} high</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">API Keys by Environment</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(reportData.apiKeysByEnvironment).map(([env, count]) => {
              const total = reportData.totalApiKeys;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const envColors: Record<string, string> = {
                production: 'bg-blue-500',
                staging: 'bg-yellow-500',
                development: 'bg-green-500'
              };
              return (
                <div key={env}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">{env}</span>
                    <span className="text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${envColors[env] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(reportData.apiKeysByEnvironment).length === 0 && (
              <p className="text-gray-500 text-sm">No API keys data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">IP Addresses by Risk Level</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(reportData.ipsByRiskLevel).map(([risk, count]) => {
              const total = reportData.totalIpAddresses;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const riskColors: Record<string, string> = {
                low: 'bg-green-500',
                medium: 'bg-yellow-500',
                high: 'bg-orange-500',
                critical: 'bg-red-500'
              };
              return (
                <div key={risk}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">{risk} Risk</span>
                    <span className="text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${riskColors[risk] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(reportData.ipsByRiskLevel).length === 0 && (
              <p className="text-gray-500 text-sm">No IP address data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">IP Addresses by Category</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(reportData.ipsByCategory).map(([category, count]) => {
              const total = reportData.totalIpAddresses;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const categoryColors: Record<string, string> = {
                internal: 'bg-blue-500',
                external: 'bg-gray-500',
                partner: 'bg-teal-500',
                threat: 'bg-red-500'
              };
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">{category}</span>
                    <span className="text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${categoryColors[category] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(reportData.ipsByCategory).length === 0 && (
              <p className="text-gray-500 text-sm">No IP category data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {reportData.recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {activity.type === 'api_key' ? (
                    <Key className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Globe className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {reportData.recentActivity.length === 0 && (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Security Recommendations</h3>
        </div>
        <div className="space-y-3">
          {reportData.expiredApiKeys > 0 && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Expired API Keys Detected</p>
                <p className="text-sm text-red-700 mt-1">
                  You have {reportData.expiredApiKeys} expired API key(s). Rotate or remove them immediately.
                </p>
              </div>
            </div>
          )}
          {reportData.criticalRiskIps > 0 && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Critical Risk IP Addresses</p>
                <p className="text-sm text-red-700 mt-1">
                  {reportData.criticalRiskIps} IP address(es) marked as critical risk. Review and block if necessary.
                </p>
              </div>
            </div>
          )}
          {reportData.highRiskIps > 0 && (
            <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">High Risk IP Addresses</p>
                <p className="text-sm text-orange-700 mt-1">
                  {reportData.highRiskIps} IP address(es) marked as high risk. Monitor closely.
                </p>
              </div>
            </div>
          )}
          {reportData.expiredApiKeys === 0 && totalThreats === 0 && (
            <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">All Systems Secure</p>
                <p className="text-sm text-green-700 mt-1">
                  No critical security issues detected. Continue monitoring your systems regularly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
