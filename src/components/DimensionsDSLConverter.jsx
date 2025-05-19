import { useState } from "react";
import { 
  getSourceTypeFromUrl, 
  getFacetsForSourceType, 
  getFacetMapping, 
  getNumericFields, 
  convertUrlToDsl 
} from "../utils/dslUtils";

export default function DimensionsDSLConverter() {
  // Initialize with default values
  const [url, setUrl] = useState("");
  const [dslQuery, setDslQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFacet, setSelectedFacet] = useState("");
  const [sourceType, setSourceType] = useState("publications");
  const [availableFacets, setAvailableFacets] = useState([]);

  // Handle URL input change
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // If it's a valid Dimensions URL, update the source type and available facets
    if (newUrl && newUrl.includes("app.dimensions.ai")) {
      try {
        const detectedSourceType = getSourceTypeFromUrl(newUrl);
        setSourceType(detectedSourceType);
        const newAvailableFacets = getFacetsForSourceType(detectedSourceType);
        setAvailableFacets(newAvailableFacets);
        
        // Set default selected facet if not already set or not valid for this source type
        if (!selectedFacet || !newAvailableFacets.includes(selectedFacet)) {
          setSelectedFacet(detectedSourceType); // Default to the source type itself
        }
      } catch (err) {
        // If there's an error parsing the URL, keep the current state
      }
    }
  };

  // Process the URL and generate DSL query
  const handleConvert = () => {
    setIsLoading(true);
    setError("");
    
    try {
      if (!url || !url.includes("app.dimensions.ai")) {
        throw new Error("Please enter a valid Dimensions.ai URL");
      }
      
      const { query, detectedSourceType, skippedFields } = convertUrlToDsl(url, selectedFacet);
      
      setDslQuery(query);
      
      // Set warning if any fields were skipped
      if (skippedFields.length > 0) {
        const formattedFields = skippedFields.map(field => `"${field}"`).join(", ");
        setError(`Warning: The following filters are not supported in the ${detectedSourceType} API and were not included: ${formattedFields}. All other filters were processed.`);
      }
    } catch (err) {
      setError(err.message);
      setDslQuery("");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = () => {
    if (dslQuery) {
      navigator.clipboard.writeText(dslQuery)
        .then(() => {
          alert("DSL query copied to clipboard!");
        })
        .catch(err => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Dimensions.ai URL to DSL Query Converter</h1>
      
      <div className="mb-6">
        <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
          Enter Dimensions.ai URL:
        </label>
        <div className="flex gap-2">
          <input
            id="url-input"
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://app.dimensions.ai/discover/publication?and_facet_year=2024"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleConvert}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Converting..." : "Convert"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      
      <div className="mb-6">
        <label htmlFor="facet-select" className="block text-sm font-medium text-gray-700 mb-2">
          Return facet (for aggregation):
        </label>
        <select
          id="facet-select"
          value={selectedFacet}
          onChange={(e) => setSelectedFacet(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {availableFacets.map(facet => (
            <option key={facet} value={facet}>{facet}</option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select what to return in the DSL query. Choose a specific facet for aggregation or select the source type ({sourceType}) to return all records.
        </p>
      </div>
      
      {dslQuery && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">DSL Query:</h2>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Copy
            </button>
          </div>
          <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
            {dslQuery}
          </pre>
        </div>
      )}
      
      <div className="mt-8 border-t pt-4 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">How to use:</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Enter a Dimensions.ai URL with facet filters</li>
          <li>Click "Convert" to generate the equivalent DSL query</li>
          <li>Copy the result to use with the Dimensions API</li>
        </ol>
        <p className="mt-3">Supports URLs for all Dimensions source types:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><code>https://app.dimensions.ai/discover/publication?...</code></li>
          <li><code>https://app.dimensions.ai/discover/grant?...</code></li>
          <li><code>https://app.dimensions.ai/discover/dataset?...</code></li>
          <li><code>https://app.dimensions.ai/discover/patent?...</code></li>
          <li><code>https://app.dimensions.ai/discover/clinical_trial?...</code></li>
          <li><code>https://app.dimensions.ai/discover/policy_document?...</code></li>
        </ul>
      </div>
    </div>
  );
}
