import { useState } from "react";
import { pdfjs } from "react-pdf";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

export default function FileTextExtractor() {
  const [extractedText, setExtractedText] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      extractText(selectedFile);
    }
  };

  const extractText = async (file) => {
    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "pdf") {
      extractTextFromPDF(file);
    } else if (fileType === "docx") {
      extractTextFromDocx(file);
    } else if (fileType === "xlsx" || fileType === "csv") {
      extractTextFromExcel(file);
    } else if (["png", "jpg", "jpeg"].includes(fileType)) {
      extractTextFromImage(file);
    } else {
      setExtractedText("Unsupported file format.");
    }
  };

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjs.getDocument(typedArray).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item) => item.str).join(" ") + "\n";
      }
      setExtractedText(text);
    };
  };

  const extractTextFromDocx = (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const result = await mammoth.extractRawText({ arrayBuffer });
      setExtractedText(result.value);
    };
  };

  const extractTextFromExcel = (file) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      let text = "";
      workbook.SheetNames.forEach((sheet) => {
        const sheetData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet]);
        text += sheetData + "\n";
      });
      setExtractedText(text);
    };
  };

  const extractTextFromImage = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (event) => {
      const { data } = await Tesseract.recognize(event.target.result, "eng");
      setExtractedText(data.text);
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          Upload a File to Extract Text
        </h2>
        <input
          type="file"
          accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="mb-4 border p-2 rounded w-full"
        />
        {file && <p className="text-gray-700 text-sm">File: {file.name}</p>}
        <button
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={() => setExtractedText("")}
        >
          Clear
        </button>
      </div>
      {extractedText && (
        <div className="bg-white p-4 rounded-lg shadow-lg mt-6 w-full max-w-lg overflow-auto h-64">
          <h3 className="text-lg font-semibold">Extracted Text:</h3>
          <pre className="text-gray-800 text-sm whitespace-pre-wrap">
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}
