import React, { useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const BillExtractor = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Check file sizes
    const invalidFiles = selectedFiles.filter(
      (file) => file.size > MAX_FILE_SIZE
    );
    if (invalidFiles.length > 0) {
      alert(
        `The following files are too large (max 50MB):\n${invalidFiles
          .map((f) => f.name)
          .join("\n")}`
      );
      return;
    }

    setFiles(selectedFiles);
    setResults([]);
    setShowResults(false);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(
        "https://fuel-bill-extraction-usingllm-1.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 413) {
          throw new Error("File too large. Maximum file size is 50MB.");
        }
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setShowResults(true);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadExcel = () => {
    if (results.length === 0) return;

    // Create CSV content
    const headers = [
      "File Name",
      "Petrol Pump Name",
      "Date",
      "Product",
      "Volume(L)",
      "Rate per Litre",
      "Total Amount (Rs)",
      "Error",
    ];

    const csvContent = [
      headers.join(","),
      ...results.map((result) =>
        [
          result.file || "",
          result.data ? `"${result.data["Petrol Pump Name"] || ""}"` : "",
          result.data ? result.data["Date"] || "" : "",
          result.data ? result.data["Product"] || "" : "",
          result.data ? result.data["Volume(L)"] || "" : "",
          result.data ? result.data["Rate per Litre"] || "" : "",
          result.data ? result.data["Total Amount (Rs)"] || "" : "",
          result.error ? `"${result.error}"` : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "bill_extraction_results.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const previewFileHandler = (file) => {
    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewFile({ type: "pdf", url, name: file.name });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewFile({
          type: "image",
          url: e.target.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const closePreview = () => {
    if (previewFile && previewFile.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bill Data Extractor
          </h1>
          <p className="text-gray-600">
            Upload petrol/diesel bills to extract structured data
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Bills (PDF, PNG, JPG, JPEG)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG, JPEG (Max 16MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Selected Files:
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        {file.size > MAX_FILE_SIZE && (
                          <span className="text-red-500">
                            {" "}
                            - File too large!
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => previewFileHandler(file)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Extract Data
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Extraction Results
              </h2>
              <button
                onClick={downloadExcel}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pump Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume (L)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate/L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total (Rs)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr
                      key={index}
                      className={result.error ? "bg-red-50" : "bg-white"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.error ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.file}
                      </td>
                      {result.error ? (
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-sm text-red-600"
                        >
                          Error: {result.error}
                        </td>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.data["Petrol Pump Name"] || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.data["Date"] || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.data["Product"] || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.data["Volume(L)"] || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.data["Rate per Litre"] || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.data["Total Amount (Rs)"] || "-"}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">{previewFile.name}</h3>
                <button
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                {previewFile.type === "pdf" ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-96"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={previewFile.url}
                    alt="Preview"
                    className="max-w-full max-h-96 object-contain mx-auto"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillExtractor;
