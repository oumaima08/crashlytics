import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bug, Smartphone, AlertTriangle, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface CrashReport {
  _id: string;
  app_id: string;
  device_model: string | null;
  error_summary: string;
  solution: string;
}

export const CrashReports = () => {
  const [crashes, setCrashes] = useState<CrashReport[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [searching, setSearching] = useState(false);
  const [appId, setAppId] = useState('');
  const [device, setDevice] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  
   useEffect(() => {
     fetchCrashReports();
   }, []);

  const fetchCrashReports = async (searchAppId?: string, searchDevice?: string) => {
    const isSearch = searchAppId !== undefined || searchDevice !== undefined;
    if (isSearch) {
      setSearching(true);
    } else {
      setLoading(true);
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchAppId && searchAppId.trim()) {
        params.append('app_id', searchAppId.trim());
      }
      if (searchDevice && searchDevice.trim()) {
        params.append('device', searchDevice.trim());
      }

      const url = `http://localhost:5678/webhook-test/filter${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Fetching from URL:', url);
      
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      
      // Handle object-based response where keys are IDs and values are crash reports
      let crashData: CrashReport[] = [];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        crashData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Convert object to array of crash reports
        crashData = Object.values(response.data).filter(item => 
          item && typeof item === 'object' && item._id
        ) as CrashReport[];
      }
      
      console.log('Processed crash data:', crashData);
      setCrashes(crashData);
      
      if (isSearch) {
        setHasSearched(true);
        toast.success(`Found ${crashData.length} crash reports`);
      } else {
        setInitialLoadComplete(true);
        toast.success(`Loaded ${crashData.length} crash reports`);
      }
    } catch (error) {
      console.error('Failed to fetch crash reports:', error);
      toast.error('Failed to load crash reports.');
      setCrashes([]);
      if (!isSearch) {
        setInitialLoadComplete(true);
      }
    } finally {
      if (isSearch) {
        setSearching(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    if (!appId.trim() && !device.trim()) {
      toast.error('Please enter at least one search criteria');
      return;
    }
    fetchCrashReports(appId, device);
  };

  const handleClearSearch = () => {
    setAppId('');
    setDevice('');
    setHasSearched(false);
    // Reload initial data
    fetchCrashReports();
  };

  // Ensure crashes is always an array before rendering
  const safeCrashes = Array.isArray(crashes) ? crashes : [];

  if (loading) {
    return (
      <div className="rounded-xl p-8 border" style={{ backgroundColor: 'var(--custom-white)', borderColor: 'var(--custom-blue)' }}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" style={{ color: 'var(--custom-yellow)' }} />
          <span className="text-lg" style={{ color: 'var(--custom-blue)' }}>Loading crash reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--custom-white)', borderColor: 'var(--custom-blue)' }}>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--custom-blue)' }}>
          <Bug className="h-6 w-6" style={{ color: 'var(--custom-yellow)' }} />
          Crash Reports Dashboard
        </h2>
        
        {/* Search Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--custom-blue)' }}>
                App ID
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="Enter app ID..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--custom-blue)', 
                  backgroundColor: 'var(--custom-white)',
                  color: 'var(--custom-blue)',
                  '--tw-ring-color': 'var(--custom-yellow)'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--custom-blue)' }}>
                Device Model
              </label>
              <input
                type="text"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                placeholder="Enter device model..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--custom-blue)', 
                  backgroundColor: 'var(--custom-white)',
                  color: 'var(--custom-blue)',
                  '--tw-ring-color': 'var(--custom-yellow)'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={searching}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--custom-yellow)', 
                color: 'var(--custom-blue)',
                border: '1px solid var(--custom-blue)'
              }}
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {searching ? 'Searching...' : 'Search'}
            </button>
            
            {hasSearched && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--custom-white)', 
                  color: 'var(--custom-blue)',
                  border: '1px solid var(--custom-blue)'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {hasSearched && (
          <div className="text-sm mt-4" style={{ color: 'var(--custom-blue)', opacity: 0.7 }}>
            Search results: {safeCrashes.length} crash reports found
          </div>
        )}
        
        {initialLoadComplete && !hasSearched && (
          <div className="text-sm mt-4" style={{ color: 'var(--custom-blue)', opacity: 0.7 }}>
            Total crash reports: {safeCrashes.length}
          </div>
        )}
      </div>

      {/* Crash Reports Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--custom-white)', borderColor: 'var(--custom-blue)' }}>
        {!initialLoadComplete && !hasSearched ? (
          <div className="p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: 'var(--custom-yellow)' }} />
            <p className="text-lg" style={{ color: 'var(--custom-blue)' }}>Loading crash reports...</p>
          </div>
        ) : safeCrashes.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--custom-blue)', opacity: 0.5 }} />
            <p className="text-lg" style={{ color: 'var(--custom-blue)' }}>
              {hasSearched ? 'No crash reports found' : 'No crash reports available'}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--custom-blue)', opacity: 0.7 }}>
              {hasSearched ? 'Try adjusting your search criteria' : 'No crash reports have been recorded yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--custom-beige)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--custom-blue)' }}>
                    App ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--custom-blue)' }}>
                    Device
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--custom-blue)' }}>
                    Error
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--custom-blue)' }}>
                    Solution
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--custom-beige)' }}>
                {safeCrashes.map((crash) => (
                  <tr key={crash._id} className="hover:opacity-80 transition-colors" style={{ backgroundColor: 'var(--custom-white)' }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--custom-beige)', color: 'var(--custom-blue)' }}>
                        {crash.app_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2" style={{ color: 'var(--custom-blue)' }}>
                        <Smartphone className="h-4 w-4" style={{ color: 'var(--custom-blue)', opacity: 0.7 }} />
                        {crash.device_model || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs">
                      <div className="flex items-start gap-2" style={{ color: 'var(--custom-blue)' }}>
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--custom-yellow)' }} />
                        <span className="line-clamp-2">{crash.error_summary}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-md">
                      <div className="text-xs" style={{ color: 'var(--custom-blue)', opacity: 0.8 }}>
                        <div className="line-clamp-3">{crash.solution}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};