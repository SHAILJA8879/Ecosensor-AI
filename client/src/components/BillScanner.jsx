import { useState, useCallback, useRef } from 'react';

/**
 * BillScanner component for EcoSense AI.
 * Uploads a utility bill image, analyzes it using Gemini, and autofills input fields.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {function} props.onScanSuccess - Callback function triggered with scanned data { kwh, fuel_liters, billing_date }
 * @returns {React.ReactElement} The visual AI Bill Scanner upload component
 */
export default function BillScanner({ onScanSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  const fileInputRef = useRef(null);

  // Validate file client-side before processing
  const validateAndSetFile = useCallback((selectedFile) => {
    setError('');
    
    if (!selectedFile) {
      return;
    }

    // Check size limit: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      const sizeErr = 'File is too large. Max size allowed is 5MB.';
      setError(sizeErr);
      setAnnouncement(sizeErr);
      return;
    }

    // Check file format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      const typeErr = 'Invalid file format. Please upload a JPEG, PNG, or WEBP image.';
      setError(typeErr);
      setAnnouncement(typeErr);
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setAnnouncement(`File ${selectedFile.name} successfully uploaded. Ready to scan.`);
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [validateAndSetFile]);

  const handleFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  }, [validateAndSetFile]);

  // Clean upload states
  const handleClear = useCallback(() => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError('');
    setAnnouncement('Upload cleared.');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  // Submit and trigger API upload
  const handleScan = useCallback(async () => {
    if (!file) {
      return;
    }

    setIsLoading(true);
    setError('');
    setAnnouncement('Scanning bill image. Please wait...');

    const formData = new FormData();
    formData.append('bill', file);

    try {
      const response = await fetch('/api/scan-bill', {
        method: 'POST',
        body: formData
      });

      if (response.status === 429) {
        throw new Error('429 Rate Limit Exceeded');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'An error occurred while scanning the bill.');
      }

      setAnnouncement('Bill scan complete. Data successfully extracted.');
      
      if (onScanSuccess) {
        onScanSuccess(result.data);
      }
    } catch (err) {
      const userFriendlyMsg = err.message.includes('overloaded') || err.message.includes('429')
        ? 'The server is currently busy scanning bills. Please try again in a moment.'
        : 'Failed to read bill details. Make sure the image is clear and readable.';
      
      setError(userFriendlyMsg);
      setAnnouncement(`Scan failed: ${userFriendlyMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [file, onScanSuccess]);

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl flex flex-col">
      {/* Accessibility live announcement region */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      <h3 className="text-xl font-bold font-display text-white mb-2">
        AI Bill Scanner
      </h3>
      <p className="text-slate-400 text-sm mb-6">
        Upload an image of your electricity or fuel bill to automatically scan metrics using Google Gemini.
      </p>

      {/* Upload Drag and Drop Panel */}
      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`group cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            isDragActive 
              ? 'border-emerald-500 bg-emerald-500/5' 
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Drag and drop your bill image here, or click to browse files"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileSelect(); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            tabIndex={-1}
          />
          <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-sm text-slate-300 font-semibold group-hover:text-white transition-colors">
            Drag & drop bill image here
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Supports JPEG, PNG, or WEBP up to 5MB
          </p>
        </div>
      ) : (
        /* Image Preview Section */
        <div className="flex flex-col space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-48 bg-slate-950 flex items-center justify-center">
            <img 
              src={previewUrl} 
              alt="Uploaded bill scan preview" 
              className="object-contain max-h-48 w-full"
            />
            {/* Overlay during scanning */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center" aria-hidden="true">
                <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleScan}
              disabled={isLoading}
              aria-label="Scan the uploaded bill image using Gemini AI"
              className="flex-grow py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {isLoading ? 'Scanning...' : 'Scan Bill'}
            </button>
            <button
              onClick={handleClear}
              disabled={isLoading}
              aria-label="Clear selected file and reset scanner"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 disabled:text-slate-700 disabled:border-slate-900 border border-slate-850 text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* User-friendly error message */}
      {error && (
        <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-2">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-red-400 text-xs font-semibold leading-relaxed">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
