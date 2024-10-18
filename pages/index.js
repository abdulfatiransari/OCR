import { useState } from "react";
import Tesseract from "tesseract.js";
import { ethers } from "ethers";
import { PDFDocument } from "pdf-lib";
import ReceiptContract from "../contract/ABI.json";

const contractAddress = "YOUR_CONTRACT_ADDRESS";

export default function Home() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  console.log("🚀 ~ Home ~ data:", data)

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleScan = async () => {
    if (!file) return;

    let text = '';

    if (file.type === 'application/pdf') {
      // Convert PDF to images
      text = await extractTextFromPDF(file);
      console.log("🚀 ~ handleScan ~ text:", text)
    } else {
      // Perform OCR directly on image
      const result = await Tesseract.recognize(file, 'eng');
      console.log("🚀 ~ handleScan ~ result:", result)
      text = result.data.text;
    }

    console.log(text,'kjagdkja')

    // Extract data points using regex or other parsing methods
    const totalAmount = text.match(/Total Amount: (\d+\.\d+)/)?.[1] || 'N/A';
    const dateTime = text.match(/Date: (.*)/)?.[1] || 'N/A';
    const fuelQuantity = text.match(/Quantity: (\d+\.\d+)/)?.[1] || 'N/A';

    setData({ totalAmount, dateTime, fuelQuantity });

    // Store data on Ethereum
    // await storeDataOnBlockchain(totalAmount, dateTime, fuelQuantity);
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();
    let text = ''; // Initialize text variable for the PDF extraction

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Create a canvas to render the PDF page
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      // Placeholder: Render the page visually if needed.
      // For actual rendering, consider using a library like PDF.js.
      // You would draw the PDF content onto the canvas here.

      // Capture the image from canvas
      const imageDataUrl = canvas.toDataURL();
      
      // Perform OCR on the image
      const result = await Tesseract.recognize(imageDataUrl, 'eng');
      text += result.data.text + ' '; // Append extracted text
    }

    return text;
  };

  const storeDataOnBlockchain = async (totalAmount, dateTime, fuelQuantity) => {
    if (typeof window !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ReceiptContract.abi,
        signer
      );

      const tx = await contract.storeReceipt(
        totalAmount,
        dateTime,
        fuelQuantity
      );
      await tx.wait();
      alert("Data stored on the blockchain!");
    }
  };

  return (
    <div>
      <h1>Gas Receipt Scanner</h1>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
      />
      <button onClick={handleScan}>Scan Receipt</button>
      {data && (
        <div>
          <h2>Extracted Data</h2>
          <p>Total Amount: {data.totalAmount}</p>
          <p>Date & Time: {data.dateTime}</p>
          <p>Fuel Quantity: {data.fuelQuantity}</p>
        </div>
      )}
    </div>
  );
}
