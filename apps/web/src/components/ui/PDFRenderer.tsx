'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFRendererProps {
  fileUrl: string;
  onError: (error: string) => void;
}

export default function PDFRenderer({ fileUrl, onError }: PDFRendererProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [Document, setDocument] = useState<any>(null);
  const [Page, setPage] = useState<any>(null);
  const [pdfWorkerConfigured, setPdfWorkerConfigured] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const loadPDFComponents = async () => {
      try {
        const [reactPdf, pdfjs] = await Promise.all([
          import('react-pdf'),
          import('pdfjs-dist')
        ]);

        if (!mounted) return;

        // Configure PDF.js worker
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        
        setDocument(() => reactPdf.Document);
        setPage(() => reactPdf.Page);
        setPdfWorkerConfigured(true);

        console.log('PDF.js components loaded and worker configured');
      } catch (error) {
        console.error('Failed to load PDF components:', error);
        if (mounted) {
          onError('Failed to initialize PDF viewer. Please try refreshing the page.');
        }
      }
    };

    loadPDFComponents();

    return () => {
      mounted = false;
    };
  }, [onError]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
    console.log('PDF loaded successfully with', numPages, 'pages');
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setIsLoading(false);
    onError(`Failed to load PDF: ${error.message}`);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.3, prev - 0.2));
  };

  // Don't render until components are loaded
  if (!pdfWorkerConfigured || !Document || !Page) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing PDF viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1 || isLoading}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[60px] text-center">
            {isLoading ? '...' : `${pageNumber} of ${numPages}`}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages || isLoading}
            size="sm"
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={zoomOut} 
            size="sm" 
            variant="outline"
            disabled={isLoading}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button 
            onClick={zoomIn} 
            size="sm" 
            variant="outline"
            disabled={isLoading}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <div className="flex justify-center">
          <div className="bg-white shadow-lg">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-8">
                  <p className="text-red-600">Error loading PDF</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading page...</p>
                    </div>
                  </div>
                }
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
}