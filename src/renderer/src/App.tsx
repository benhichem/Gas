import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import image from "./assets/wavy-lines.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export type SuccessMessage = {
  status: 200 | 500;
  results: number;
  path: string;
};

interface FormData {
  keywords: string | Array<string>;
  language: string;
  system: "computer" | "phone";
  deviceType: "android" | "ios";
  outputFormat: "csv" | "json";
  output: string;
}

function TransformTextInput(keywordInputTextInput: string): Array<string> {
  const words: Array<string> = [];
  keywordInputTextInput.split("\n").map((item) => {
    if (item !== "") {
      words.push(item.trim());
    }
  });
  return words;
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    keywords: "",
    language: "",
    system: "computer",
    deviceType: "android",
    outputFormat: "csv",
    output: "",
  });
  const [isPhone, setIsPhone] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);

  useEffect(() => {
    window.electron.ipcRenderer.on(
      "finished_scraping",
      //@ts-ignore
      (e, data: SuccessMessage) => {
        console.log(data);
        setIsScraping(false);
        setFormData({
          keywords: "",
          language: "",
          system: "computer",
          deviceType: "android",
          output: "",
          outputFormat: "csv",
        });
        if (data.status === 200) {
          toast(
            `Scraping Finished /n results : ${data.results} /n path: ${data.path}`,
            {
              position: "top-right",
              autoClose: 3000,
              icon: <FaCheckCircle />,
              style: {
                background: "#4CAF50", // Green background
                color: "white",
              },
              progressStyle: {
                background: "#45a049", // Slightly darker progress bar
              },
            },
          );
        } else if (data.status === 500) {
          toast(
            `Scraping Finished /n results : ${data.results} /n path: ${data.path}`,
            {
              position: "top-right",
              autoClose: 3000,
              icon: <FaTimesCircle />,
              style: {
                background: "#F44336", // Deep Red background
                color: "white",
              },
              progressStyle: {
                background: "#d32f2f", // Darker progress bar
              },
            },
          );
        }
      },
    );

    // Cleanup listener
    return () => {
      // Remove listener to prevent memory leaks
      window.electron.ipcRenderer.removeAllListeners("");
    };
    ("");
  }, []);

  const handleSystemChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as FormData["system"];
    setIsPhone(value === "phone");
    setFormData((prev) => ({
      ...prev,
      system: value,
    }));
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log("Form Data:", formData);
    toast("Scraping started");
    formData.keywords = TransformTextInput(formData.keywords as string);
    window.electron.ipcRenderer.send("ping", formData);
    setIsScraping(true);
  };

  return (
    <div className="min-h-screen bg-white-900 relative">
      {/* Background image container */}
      <div className="absolute inset-0">
        <img
          src={image} // Update this path to match your SVG location
          alt="background pattern"
          className="w-full h-full object-cover"
          style={{ pointerEvents: "none" }}
        />
      </div>

      {/* Content container */}

      <div className="min-h-screen relative flex items-center justify-center">
        <div className="w-full max-w-2xl mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <header className="mb-10 text-center">
              <div className="flex items-center justify-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                  Google Ads Scraper
                </h1>
              </div>
              <p className="text-gray-600 text-sm">
                Professional tool for extracting and analyzing Google Ads data
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords
                </label>
                <textarea
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  //@ts-ignore
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                  hover:border-gray-400 transition-all duration-200"
                  placeholder="Enter target keywords..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the keywords you want to analyze, separated by a NEW
                  LINE
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                  hover:border-gray-400 transition-all duration-200"
                  placeholder="e.g., English, Spanish..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Specify the language for the ads you want to analyze
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  output
                </label>
                <input
                  type="text"
                  name="output"
                  value={formData.output}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                  hover:border-gray-400 transition-all duration-200"
                  placeholder="file name to output data into"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Specify the name of the file to export the data into
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System
                  </label>
                  <select
                    name="system"
                    value={formData.system}
                    onChange={handleSystemChange}
                    className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                    hover:border-gray-400 transition-all duration-200"
                  >
                    <option value="computer">Computer</option>
                    <option value="phone">Phone</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose the platform where ads will be displayed
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Output Format
                  </label>
                  <select
                    name="outputFormat"
                    value={formData.outputFormat}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                    hover:border-gray-400 transition-all duration-200"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Select the format for your exported data
                  </p>
                </div>
              </div>

              {isPhone && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Type
                  </label>
                  <select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                    hover:border-gray-400 transition-all duration-200"
                  >
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose the mobile platform for your analysis
                  </p>
                </div>
              )}

              <div className="pt-4">
                {!isScraping ? (
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 
                  transition-colors duration-200 font-medium text-sm flex items-center justify-center space-x-2"
                  >
                    <span>Generate Report</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium text-sm flex items-center justify-center space-x-2"
                  >
                    <span>Scraping</span>
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;
