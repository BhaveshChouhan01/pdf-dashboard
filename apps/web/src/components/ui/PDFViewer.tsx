'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, AlertCircle, FileText, RefreshCw, Download } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadPDF();
    }
  }, [mounted, fileUrl]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading PDF from:', fileUrl);
      
      // Fetch the PDF as blob to avoid CORS issues
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create blob URL for local viewing
      const blobUrl = URL.createObjectURL(blob);
      setPdfBlob(blobUrl);
      setLoading(false);
      
      console.log('PDF loaded successfully');
      
    } catch (err: any) {
      console.error('PDF loading error:', err);
      
      // Check if it's a CORS issue
      if (err.message.includes('CORS') || err.message.includes('fetch')) {
        setError('CORS policy prevents loading this PDF. The file can be opened in a new tab instead.');
      } else {
        setError(err.message || 'Failed to load PDF');
      }
      
      setShowErrorDialog(true);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setShowErrorDialog(false);
    loadPDF();
  };

  const handleCloseDialog = () => {
    setShowErrorDialog(false);
  };

  const openInNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback to opening in new tab
      openInNewTab();
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlob) {
        URL.revokeObjectURL(pdfBlob);
      }
    };
  }, [pdfBlob]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing PDF viewer...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading PDF...</p>
          <p className="text-xs text-gray-500 mt-2">This may take a moment for large files...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header with controls */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-600">PDF Viewer</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRetry}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={downloadPDF}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={openInNewTab}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 relative">
          {error || !pdfBlob ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center max-w-md p-8">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  PDF Preview Not Available
                </h3>
                <p className="text-gray-600 mb-6">
                  The PDF cannot be displayed directly in the browser due to security restrictions. You can still access it using the options below.
                </p>
                <div className="space-y-3">
                  <Button onClick={openInNewTab} className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button 
                    onClick={downloadPDF} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      Technical note: {error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              <object
                data={pdfBlob}
                type="application/pdf"
                className="w-full h-full"
                aria-label="PDF Document"
              >
                <iframe
                  src={pdfBlob}
                  className="w-full h-full border-0"
                  title="PDF Document"
                >
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <div className="text-center max-w-md p-8">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        PDF Viewer Not Supported
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Your browser doesn't support inline PDF viewing. Please use the options below.
                      </p>
                      <div className="space-y-3">
                        <Button onClick={openInNewTab} className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                        <Button 
                          onClick={downloadPDF} 
                          variant="outline" 
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </iframe>
              </object>
            </div>
          )}
        </div>
      </div>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              PDF Display Issue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The PDF cannot be displayed inline due to browser security restrictions or CORS policies.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">Available Options:</p>
              <div className="space-y-2">
                <Button 
                  onClick={openInNewTab} 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Browser Tab
                </Button>
                <Button 
                  onClick={downloadPDF} 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download to Device
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600">
                <strong>Why this happens:</strong> Localhost URLs cannot be embedded in iframes due to browser security policies. This is normal and expected behavior.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={handleCloseDialog} 
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}