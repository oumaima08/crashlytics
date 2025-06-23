import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, Download, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Recommendation {
  title: string;
  detail: string;
  code: string;
  severity: string;
  fixes: string[];
}

interface ScanResult {
  message: string;
  pdf_path: string; 
  summary: string;
  score: number;
  recommandations?: Recommendation[];
}

export const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.name.toLowerCase().endsWith('.apk')) {
      setFile(selectedFile);
      setScanResult(null);
      toast.success(`APK file selected: ${selectedFile.name}`);
    } else {
      toast.error('Please select a valid APK file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an APK file first');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('apk', file);

    try {
      const response = await axios.post('http://localhost:5678/webhook-test/receive-apk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setScanResult(response.data);
      toast.success('APK scan completed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to scan APK. Please check your n8n backend connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadReport = () => {
    const link = document.createElement('a');
    link.href = '/reports/latest.pdf';
    link.setAttribute('download', 'scan-report.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('PDF download started!');
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <div
        className="rounded-xl p-8 border"
        style={{
          backgroundColor: 'var(--custom-white)',
          borderColor: 'var(--custom-blue)',
        }}
      >
        <h2
          className="text-2xl font-bold mb-6 flex items-center gap-3"
          style={{ color: 'var(--custom-blue)' }}
        >
          <Upload className="h-6 w-6" style={{ color: 'var(--custom-yellow)' }} />
          APK Security Scanner
        </h2>

        {/* Drag & Drop */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
            dragOver ? 'opacity-80' : 'hover:opacity-80'
          }`}
          style={{
            borderColor: dragOver ? 'var(--custom-yellow)' : 'var(--custom-blue)',
            backgroundColor: dragOver ? 'var(--custom-beige)' : 'transparent',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-4">
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--custom-beige)' }}
            >
              <FileText className="h-8 w-8" style={{ color: 'var(--custom-blue)' }} />
            </div>
            <div>
              <p className="text-lg mb-2" style={{ color: 'var(--custom-blue)' }}>
                {file ? file.name : 'Drop your APK file here or click to browse'}
              </p>
              <p className="text-sm" style={{ color: 'var(--custom-blue)', opacity: 0.7 }}>
                Only .apk files are supported
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Upload Button */}
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              backgroundColor:
                !file || isUploading ? 'var(--custom-blue)' : 'var(--custom-yellow)',
              color: !file || isUploading ? 'var(--custom-white)' : 'var(--custom-blue)',
            }}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Scanning APK...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Start Security Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div
          className="rounded-xl p-6 border space-y-6"
          style={{
            backgroundColor: 'var(--custom-white)',
            borderColor: 'var(--custom-yellow)',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-6 w-6" style={{ color: 'var(--custom-yellow)' }} />
            <h3 className="text-xl font-semibold" style={{ color: 'var(--custom-blue)' }}>
              Scan Complete
            </h3>
          </div>

          <p style={{ color: 'var(--custom-blue)' }}>Summary: {scanResult.summary}</p>
          <p style={{ color: 'var(--custom-blue)' }}>
            Security Score: {scanResult.score}
          </p>

          <button
            onClick={handleDownloadReport}
            className="font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            style={{ backgroundColor: 'var(--custom-yellow)', color: 'var(--custom-blue)' }}
          >
            <Download className="h-4 w-4" />
            Download Scan Report
          </button>

          {scanResult.recommandations && (
            <div className="mt-6">
              <h4
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'var(--custom-blue)' }}
              >
                <ShieldCheck className="h-5 w-5" style={{ color: 'var(--custom-yellow)' }} />
                Recommendations
              </h4>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border text-sm text-left">
                  <thead style={{ backgroundColor: 'var(--custom-blue)', color: 'white' }}>
                    <tr>
                      <th className="px-4 py-2 border">Title / Detail</th>
                      <th className="px-4 py-2 border">Severity</th>
                      <th className="px-4 py-2 border">Code</th>
                      <th className="px-4 py-2 border">Fixes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResult.recommandations.map((rec, index) => (
                      <tr
                        key={index}
                        className="border-t"
                        style={{ borderColor: 'var(--custom-blue)' }}
                      >
                        <td className="px-4 py-3 border">
                          <div className="font-semibold">{rec.title}</div>
                          <div className="text-xs opacity-80">{rec.detail}</div>
                        </td>
                        <td className="px-4 py-3 border">
                          <span
                            className="px-2 py-1 rounded font-semibold text-xs"
                            style={{
                              backgroundColor:
                                rec.severity === 'critique'
                                  ? 'var(--custom-red)'
                                  : 'var(--custom-yellow)',
                              color:
                                rec.severity === 'critique'
                                  ? 'white'
                                  : 'var(--custom-blue)',
                            }}
                          >
                            {rec.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 border whitespace-pre-wrap font-mono text-xs">
                          {rec.code}
                        </td>
                        <td className="px-4 py-3 border">
                          <ul className="list-disc pl-5 space-y-1">
                            {rec.fixes.map((fix, i) => (
                              <li key={i}>{fix}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
