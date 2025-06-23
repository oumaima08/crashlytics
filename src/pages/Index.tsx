import React, { useState, useEffect } from 'react';
import { FileUpload } from '../components/FileUpload';
import { CrashReports } from '../components/CrashReports';
import { Shield, Bug, AlertTriangle } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('scanner');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--custom-beige)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 mr-3" style={{ color: 'var(--custom-yellow)' }} />
            <h1 className="text-5xl font-bold" style={{ color: 'var(--custom-blue)' }}>APK Crash Guardian</h1>
          </div>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--custom-blue)' }}>
            Advanced APK security scanning and crash report analysis platform
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="rounded-lg p-1 border" style={{ backgroundColor: 'var(--custom-blue)', borderColor: 'var(--custom-blue)' }}>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'scanner'
                  ? 'shadow-lg'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'scanner' ? 'var(--custom-yellow)' : 'transparent',
                color: activeTab === 'scanner' ? 'var(--custom-blue)' : 'var(--custom-white)',
              }}
            >
              <Shield className="h-5 w-5" />
              Security Scanner
            </button>
            <button
              onClick={() => setActiveTab('crashes')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'crashes'
                  ? 'shadow-lg'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'crashes' ? 'var(--custom-yellow)' : 'transparent',
                color: activeTab === 'crashes' ? 'var(--custom-blue)' : 'var(--custom-white)',
              }}
            >
              <Bug className="h-5 w-5" />
              Crash Reports
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'scanner' && <FileUpload />}
          {activeTab === 'crashes' && <CrashReports />}
        </div>
      </div>
    </div>
  );
};

export default Index;