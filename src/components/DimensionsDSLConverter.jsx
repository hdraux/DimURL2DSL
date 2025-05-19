import { useState } from "react";
import { getSourceTypeFromUrl, parseDslFromUrl } from "../utils/dslUtils";
import { FACETS } from "../utils/constants";

export default function DimensionsDSLConverter() {
  const [url, setUrl] = useState("");
  const [dslQuery, setDslQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFacet, setSelectedFacet] = useState("publications");
  const [sourceType, setSourceType] = useState("publications");

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (newUrl && newUrl.includes("app.dimensions.ai")) {
      const detectedSourceType = getSourceTypeFromUrl(newUrl);
      setSourceType(detectedSourceType);
      setSelectedFacet(detectedSourceType);
    }
  };

  const convertUrlToDsl = () => {
    setIsLoading(true);
    setError("");
    try {
      if (!url || !url.includes("app.dimensions.ai")) {
        throw new Error("Please enter a valid Dimensions.ai URL");
      }
      const { query, source } = parseDslFromUrl(url, selectedFacet);
      setDslQuery(query);
      setSourceType(source);
    } catch (err) {
      setError(err.message);
      setDslQuery("");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (dslQuery) {
      navigator.clipboard.writeText(dslQuery)
        .then(() => alert("DSL query copied to clipboard!"))
        .catch(err => console.error("Failed to copy: ", err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Dimensions.ai URL to DSL Query Converter</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Enter Dimensions.ai URL:</label>
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            className="flex-1 px-4 py-2 border rounded"
            placeholder="https://app.dimensions.ai/discover/publication?and_facet_year=2024"
          />
          <button
            onClick={convertUrlToDsl}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Converting..." : "Convert"}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Return facet:</label>
        <select
          value={selectedFacet}
          onChange={(e) => setSelectedFacet(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        >
          {FACETS[sourceType].map(facet => (
            <option key={facet} value={facet}>{facet}</option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">Choose what to return in the DSL query.</p>
      </div>

      {dslQuery && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">DSL Query:</h2>
            <button onClick={copyToClipboard} className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
              Copy
            </button>
          </div>
          <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto whitespace-pre-wrap">
            {dslQuery}
          </pre>
        </div>
      )}
    </div>
  );
}
