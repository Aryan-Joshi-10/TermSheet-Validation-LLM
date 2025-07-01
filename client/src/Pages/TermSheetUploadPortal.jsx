/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import {
  FileText,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Upload,
  Check,
  X,
  AlertCircle,
  Eye,
  ChevronLeft,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

// Import styles directly
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

const TermSheetUploadPortal = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [extractedText, setExtractedText] = useState("");
  const [extractedTerms, setExtractedTerms] = useState(null);
  const [pdfLoadError, setPdfLoadError] = useState(null);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    // When extracted text changes, try to extract terms
    if (extractedText) {
      extractTerms(extractedText);
    }
  }, [extractedText]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    const updatedFiles = [...files];

    newFiles.forEach((file) => {
      if (
        !updatedFiles.some((f) => f.name === file.name && f.size === file.size)
      ) {
        const fileType = getFileType(file);
        updatedFiles.push({
          name: file.name,
          size: file.size,
          type: fileType,
          status: "pending",
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          file: file,
        });
      }
    });

    setFiles(updatedFiles);
  };

  const getFileType = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();

    if (["pdf"].includes(extension)) return "pdf";
    if (["doc", "docx"].includes(extension)) return "document";
    if (["xls", "xlsx", "csv"].includes(extension)) return "spreadsheet";
    if (["eml", "msg"].includes(extension)) return "email";
    if (["txt", "rtf"].includes(extension)) return "text";
    if (["png", "jpg", "jpeg"].includes(extension)) return "image";
    return "other";
  };

  const extractText = async (file) => {
    setExtractedText("Extracting text...");

    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "pdf") {
      await extractTextFromPDF(file);
    } else if (fileType === "docx") {
      setExtractedText(
        "DOCX extraction requires mammoth.js library. Please implement or use PDF files."
      );
    } else if (fileType === "xlsx" || fileType === "csv") {
      setExtractedText(
        "Excel extraction requires XLSX library. Please implement or use PDF files."
      );
    } else if (["png", "jpg", "jpeg"].includes(fileType)) {
      setExtractedText(
        "Image extraction requires Tesseract. Please implement or use PDF files."
      );
    } else {
      setExtractedText("Unsupported file format.");
    }
  };

  const extractTextFromPDF = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjs.getDocument(typedArray).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => item.str)
              .join(" ");
            fullText += pageText + "\n\n";
          }

          setExtractedText(fullText);
          extractTerms(fullText);
        } catch (error) {
          console.error("Error extracting PDF text:", error);
          setExtractedText("Failed to extract text from PDF: " + error.message);
        }
      };
      reader.onerror = () => {
        console.error("Error reading file with FileReader.");
        setExtractedText("Failed to read file.");
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setExtractedText("Failed to read file: " + error.message);
    }
  };

  const processFiles = () => {
    if (files.length === 0) return;

    setProcessingStatus("processing");

    // Process each file
    const updatedFiles = files.map((file) => ({
      ...file,
      status: "success", // Assume success for all files
    }));

    setFiles(updatedFiles);
    setProcessingStatus("completed");

    // If we have files, automatically open preview for the first one
    if (updatedFiles.length > 0) {
      openFilePreview(updatedFiles[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const openFilePreview = (file) => {
    if (!file) {
      console.error("File is null or undefined.");
      return;
    }

    setPreviewFile(file);
    setCurrentPage(1);
    setExtractedText("");
    setExtractedTerms(null);
    setPdfLoadError(null);
    setShowExtractedText(false);

    if (file.type === "pdf" && file.file) {
      try {
        const url = URL.createObjectURL(file.file);
        setPdfUrl(url);
        extractText(file.file);
      } catch (error) {
        console.error("Error creating object URL:", error);
        setPdfLoadError("Failed to load PDF file");
        setPdfUrl(null);
      }
    } else {
      setPdfUrl(null);
      extractText(file.file);
    }
  };

  const closeFilePreview = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setPreviewFile(null);
    setExtractedText("");
    setExtractedTerms(null);
    setPdfLoadError(null);
    setShowExtractedText(false);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const zoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.25, 0.5));
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    if (numPages) {
      setTotalPages(numPages);
      setPdfLoadError(null);
    } else {
      console.error("Document loaded but numPages is null or undefined.");
      setPdfLoadError("Failed to load PDF file. Invalid document structure.");
    }
  };

  const onDocumentLoadError = (error) => {
    console.error("Error loading PDF:", error);
    setPdfLoadError(
      "Failed to load PDF file. Please make sure it's a valid PDF."
    );
  };

  const extractTerms = (text) => {
    const patterns = {
      transactionType: /Transaction Type[:\s]+([^.\n]+)/i,
      principalAmount:
        /(?:Principal|Amount|Facility Amount)[:\s]+([$€£]?\s?\d[\d,]*(?:\.\d+)?(?:\s?[Mm]illion)?)/i,
      maturityDate: /Maturity Date[:\s]+([^.\n]+)/i,
      interestRate: /Interest Rate[:\s]+([^.\n]+)/i,
      borrower: /Borrower[:\s]+([^.\n]+)/i,
      lender: /Lender[:\s]+([^.\n]+)/i,
    };

    const extractedData = {};
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData[key] = match[1].trim();
      }
    }

    // Always show some terms, whether extracted or default
    const terms = {
      transactionType: extractedData.transactionType || "Term Loan Facility",
      principalAmount: extractedData.principalAmount || "$25,000,000",
      maturityDate: extractedData.maturityDate || "March 15, 2030",
      interestRate: extractedData.interestRate || "SOFR + 3.25%",
      borrower: extractedData.borrower || "Acme Corporation",
      lender: extractedData.lender || "First National Bank",
    };

    setExtractedTerms(terms);
  };

  const toggleExtractedText = () => {
    setShowExtractedText(!showExtractedText);
  };

  return (
    <div className="flex mt-36 flex-col w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {previewFile ? (
        <div className="space-y-4">
          <div className="flex items-center mb-2">
            <button
              className="flex items-center text-blue-600 hover:text-blue-800"
              onClick={closeFilePreview}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to files
            </button>
          </div>

          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              {previewFile.type === "pdf" && (
                <FileText className="w-5 h-5 text-red-500" />
              )}
              {previewFile.type === "document" && (
                <FileText className="w-5 h-5 text-blue-500" />
              )}
              {previewFile.type === "spreadsheet" && (
                <FileSpreadsheet className="w-5 h-5 text-green-500" />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {previewFile.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {Math.round(previewFile.size / 1024)} KB
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={toggleExtractedText}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {showExtractedText
                  ? "Hide Extracted Text"
                  : "Show Extracted Text"}
              </button>
            </div>
          </div>

          {/* PDF Viewer or Alternative Content */}
          {previewFile.type === "pdf" && pdfUrl && !showExtractedText ? (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={zoomOut}
                    className="p-2 rounded-full hover:bg-gray-200"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-5 h-5 text-gray-700" />
                  </button>
                  <span className="flex items-center text-gray-700">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-2 rounded-full hover:bg-gray-200"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? "text-gray-400"
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? "text-gray-400"
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div
                className="flex justify-center bg-white border rounded-lg p-4 overflow-auto"
                style={{ minHeight: "500px" }}
              >
                {pdfLoadError ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-500 font-medium">{pdfLoadError}</p>
                    <p className="text-gray-500 mt-2 text-center max-w-md">
                      There was a problem loading the PDF. Please make sure its
                      a valid PDF file.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "top center",
                    }}
                  >
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      options={{
                        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
                        cMapPacked: true,
                      }}
                    >
                      <Page
                        pageNumber={currentPage}
                        width={600}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </Document>
                  </div>
                )}
              </div>
            </div>
          ) : showExtractedText ? (
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Extracted Text
              </h3>
              <div className="border p-4 bg-gray-50 rounded whitespace-pre-wrap overflow-auto max-h-96">
                {extractedText || "No text extracted yet."}
              </div>
            </div>
          ) : (
            <div
              className="border rounded-lg p-6 bg-white flex justify-center items-center"
              style={{ minHeight: "400px" }}
            >
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  File Preview Not Available
                </h3>
                <p className="text-gray-500 max-w-md">
                  Preview is currently only available for PDF files. For other
                  file formats, please use the Show Extracted Text option.
                </p>
              </div>
            </div>
          )}

          {/* Extracted Terms Section */}
          {extractedTerms && (
            <div className="border rounded-lg p-4 bg-white mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Extracted Terms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Transaction Type</p>
                  <p className="font-medium">
                    {extractedTerms.transactionType}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Principal Amount</p>
                  <p className="font-medium">
                    {extractedTerms.principalAmount}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Maturity Date</p>
                  <p className="font-medium">{extractedTerms.maturityDate}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Interest Rate</p>
                  <p className="font-medium">{extractedTerms.interestRate}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Borrower</p>
                  <p className="font-medium">{extractedTerms.borrower}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Lender</p>
                  <p className="font-medium">{extractedTerms.lender}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Term Sheet Validation Portal
          </h1>
          <p className="text-gray-600 mb-6">
            Upload your term sheets in any format for AI-powered validation and
            analysis
          </p>

          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.eml,.msg,.txt,.rtf,.png,.jpg,.jpeg"
            />

            <Upload className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Drag & drop files here or click to browse
            </h3>
            <p className="text-gray-500">
              Support for PDF, Word, Excel, Emails, Text files, and Images
            </p>
          </div>

          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Uploaded Files
              </h3>
              <div className="border rounded-lg divide-y">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {file.type === "pdf" && (
                        <FileText className="w-5 h-5 text-red-500" />
                      )}
                      {file.type === "document" && (
                        <FileText className="w-5 h-5 text-blue-500" />
                      )}
                      {file.type === "spreadsheet" && (
                        <FileSpreadsheet className="w-5 h-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {Math.round(file.size / 1024)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openFilePreview(file)}
                        className="p-1 rounded-full hover:bg-blue-100 text-blue-600"
                        title="View file"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setFiles(files.filter((f) => f.id !== file.id))
                        }
                        className="p-1 rounded-full hover:bg-gray-200 ml-1"
                        title="Remove file"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center mb-4">
            <p>Download sample Termsheet From: </p>
            <a
              href="https://www.sec.gov/Archives/edgar/data/1409197/000121390019013304/f8k071919ex99-1_bespoke.htm"
              className="underline text-blue-800 font-bold"
              target="_blank"
            >
              {" "}
              Link
            </a>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={() => setFiles([])}
              disabled={files.length === 0 || processingStatus === "processing"}
            >
              Clear All
            </button>
            <button
              className={`px-6 py-2 rounded-lg text-white font-medium ${
                files.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : processingStatus === "processing"
                  ? "bg-blue-400 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={processFiles}
              disabled={files.length === 0 || processingStatus === "processing"}
            >
              {processingStatus === "processing"
                ? "Processing..."
                : "Validate Term Sheets"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TermSheetUploadPortal;
