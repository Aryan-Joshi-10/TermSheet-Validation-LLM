import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader,
} from "lucide-react";

export default function TermSheetValidationDisplay() {
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [termSheetText, setTermSheetText] = useState("");

  // Function to extract term sheet data
  const extractTermSheet = async (text) => {
    try {
      setLoading(true);
      const extractResponse = await fetch("http://localhost:5001/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!extractResponse.ok) {
        throw new Error("Extract API request failed");
      }

      const extractedData = await extractResponse.json();
      return extractedData;
    } catch (err) {
      setError("Failed to extract term sheet data: " + err.message);
      return null;
    }
  };

  // Function to validate extracted data
  const validateTermSheet = async (extractedData) => {
    try {
      const validateResponse = await fetch("http://localhost:5001/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(extractedData),
      });

      if (!validateResponse.ok) {
        throw new Error("Validate API request failed");
      }

      const validationResult = await validateResponse.json();
      setValidationData(validationResult);
    } catch (err) {
      setError("Failed to validate term sheet: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateTermSheet(termSheetText);
  }, []);

  // Function to handle the full process
  // const processTermSheet = async () => {
  //   if (!termSheetText.trim()) {
  //     setError("Please enter term sheet text");
  //     return;
  //   }

  //   setError(null);
  //   console.log("Processing term sheet:", termSheetText);
  //   const extractedData = await extractTermSheet(termSheetText);
  //   if (extractedData) {
  //     await validateTermSheet(extractedData);
  //   }
  // };

  // Define status color based on validation result
  const getStatusColor = (result) => {
    if (result.includes("Valid") && !result.includes("Partially"))
      return "text-green-600";
    if (result.includes("Partially")) return "text-amber-500";
    return "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Term Sheet Validator
      </h1>

      {/* Input section */}
      <div className="mb-6">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={10}
          placeholder="Paste your term sheet text here..."
          value={termSheetText}
          onChange={(e) => setTermSheetText(e.target.value)}
        />
        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:bg-blue-300"
          onClick={processTermSheet}
          disabled={loading || !termSheetText.trim()}
        >
          {loading ? (
            <>
              <Loader className="inline-block mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Validate Term Sheet"
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Results section - only show when data is available */}
      {validationData && (
        <>
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {validationData.term_sheet_type}
            </h2>
            <div className="flex items-center mt-2">
              <span
                className={`text-lg font-semibold ${getStatusColor(
                  validationData.validation_result
                )}`}
              >
                {validationData.validation_result ===
                "Partially Valid Term Sheet" ? (
                  <AlertTriangle className="inline mr-2 h-5 w-5" />
                ) : validationData.validation_result.includes("Valid") ? (
                  <CheckCircle className="inline mr-2 h-5 w-5" />
                ) : (
                  <XCircle className="inline mr-2 h-5 w-5" />
                )}
                {validationData.validation_result}
              </span>
            </div>
            <p className="mt-3 text-gray-600">
              {validationData.validation_summary}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Matched Keywords
            </h2>
            <div className="flex flex-wrap gap-2">
              {validationData.matched_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-600 mb-3 flex items-center">
              <XCircle className="mr-2 h-5 w-5" />
              Identified Issues
            </h2>
            <ul className="space-y-2">
              {validationData.errors.map((error, index) => (
                <li
                  key={index}
                  className="bg-red-50 p-3 rounded border-l-4 border-red-500"
                >
                  <p className="text-gray-800">{error}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-green-600 mb-3 flex items-center">
              <ArrowRight className="mr-2 h-5 w-5" />
              Suggested Corrections
            </h2>
            <ul className="space-y-2">
              {validationData.suggested_corrections.map((correction, index) => (
                <li
                  key={index}
                  className="bg-green-50 p-3 rounded border-l-4 border-green-500"
                >
                  <p className="text-gray-800">{correction}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              Download Full Report
            </button>
            <button className="ml-4 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded">
              Edit Term Sheet
            </button>
          </div>
        </>
      )}

      {/* For testing, you can include a button to load sample data */}
      {!validationData && !loading && (
        <button
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          onClick={() => {
            setValidationData({
              term_sheet_type: "Merger & Acquisition Term Sheet",
              validation_result: "Partially Valid Term Sheet",
              validation_summary:
                "Extraction is mostly accurate, but there are critical legal and financial inconsistencies.",
              matched_keywords: [
                "transaction",
                "merger",
                "consideration",
                "ownership split",
                "due diligence",
                "acquisition agreement",
                "conduct of business",
                "valuation of the company",
              ],
              errors: [
                "Ownership division (70% to Buyer and 70% to Company) is inconsistent with post-money valuation and stated investment.",
                "Due Diligence limited only to marketing materials, which is unrealistic and unsafe for M&A.",
                "Acquisition Agreement is not legally binding (verbal agreement mentioned).",
                "Conduct of Business section allows risky new ventures without restriction.",
                "Exit Rights section is missing, though it is critical for minority protection.",
              ],
              suggested_corrections: [
                "Correct the ownership split calculation to match the $12 million post-money valuation.",
                "Expand Due Diligence to full operational, financial, and legal due diligence.",
                "Draft a formal, legally binding Acquisition Agreement with clear conditions and covenants.",
                "Restrict high-risk activities during negotiation in the Conduct of Business section.",
                "Add an Exit Rights section detailing minority protection and buyer obligations.",
              ],
            });
          }}
        >
          Load Sample Data (for testing)
        </button>
      )}
    </div>
  );
}
