import { useState, useEffect } from "react";
import { FACET_OPTIONS } from "../utils/constants";
import { DSL_MAPPING } from "../utils/facetMappings";
import { getSourceTypeFromUrl, getNumericFields } from "../utils/dslUtils";

export default function DimensionsDSLConverter() {
  const [url, setUrl] = useState("");
  const [dslQuery, setDslQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFacet, setSelectedFacet] = useState("");
  const [sourceType, setSourceType] = useState("publications");
  const [availableFacets, setAvailableFacets] = useState(FACET_OPTIONS.publications);

  useEffect(() => {
    if (!selectedFacet || !availableFacets.includes(selectedFacet)) {
      setSelectedFacet(availableFacets[0]);
    }
  }, [availableFacets]);

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    if (newUrl && newUrl.includes("app.dimensions.ai")) {
      try {
        const detectedSourceType = getSourceTypeFromUrl(newUrl);
        setSourceType(detectedSourceType);
        const newAvailableFacets = FACET_OPTIONS[detectedSourceType] || [detectedSourceType];
        setAvailableFacets(newAvailableFacets);
      } catch (err) {}
    }
  };

  const convertUrlToDsl = (url) => {
    setIsLoading(true);
    setError("");

    try {
      if (!url || !url.includes("app.dimensions.ai")) {
        throw new Error("Please enter a valid Dimensions.ai URL");
      }

      const parsedUrl = new URL(url);
      const searchParams = new URLSearchParams(parsedUrl.search);
      const dslConditions = [];

      const detectedSourceType = getSourceTypeFromUrl(url);
      setSourceType(detectedSourceType);
      const facetMapping = DSL_MAPPING[detectedSourceType];
      const numericFields = getNumericFields(detectedSourceType);
      const newAvailableFacets = FACET_OPTIONS[detectedSourceType] || [detectedSourceType];
      setAvailableFacets(newAvailableFacets);

      const orConditions = {};
      const skippedFields = [];

      for (const [param, value] of searchParams.entries()) {
        if (param.startsWith("and_facet_") || param.startsWith("or_facet_")) {
          const isOr = param.startsWith("or_facet_");
          const facet = param.replace("and_facet_", "").replace("or_facet_", "");
          const dslField = facetMapping[facet];

          if (dslField) {
            const shouldQuote = !numericFields.includes(dslField) || isNaN(value);
            const quoted = shouldQuote ? `"${value}"` : value;
            if (isOr) {
              orConditions[dslField] = orConditions[dslField] || [];
              orConditions[dslField].push(quoted);
            } else {
              dslConditions.push(`${dslField} = ${quoted}`);
            }
          } else if (
            detectedSourceType === "clinical_trials" &&
            ["research_org_country", "research_org_state", "research_org_city"].includes(facet)
          ) {
            skippedFields.push(facet);
          }
        }
      }

      for (const [field, values] of Object.entries(orConditions)) {
        dslConditions.push(
          values.length === 1
            ? `${field} = ${values[0]}`
            : `${field} in [${values.join(",")}]`
        );
      }

      const facetToReturn = selectedFacet && newAvailableFacets.includes(selectedFacet)
        ? selectedFacet
        : newAvailableFacets[0];

      let query = `search ${detectedSourceType}`;
      if (dslConditions.length > 0) {
        query += `
where ${dslConditions.join(" and ")}`;
      }
      query += `
return ${facetToReturn}`;

      setDslQuery(query);

      if (skippedFields.length > 0) {
        setError(`Warning: Skipped unsupported filters: ${skippedFields.join(", ")}`);
      }
    } catch (err) {
      setError(err.message);
      setDslQuery("");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (dslQuery) {
      navigator.clipboard.writeText(dslQuery).then(() => {
        alert("DSL query copied to clipboard!");
      }).catch(err => {
        console.error("Failed to copy:", err);
      });
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Dimensions DSL Converter</h1>

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
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => convertUrlToDsl(url)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {isLoading ? "Converting..." : "Convert"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="facet-select" className="block text-sm font-medium text-gray-700 mb-2">
          Return facet:
        </label>
        <select
          id="facet-select"
          value={selectedFacet}
          onChange={(e) => setSelectedFacet(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          {availableFacets.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {dslQuery && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">DSL Query:</h2>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm bg-gray-200 rounded"
            >
              Copy
            </button>
          </div>
          <pre className="bg-gray-800 text-green-400 p-4 rounded-md whitespace-pre-wrap overflow-x-auto">
            {dslQuery}
          </pre>
        </div>
      )}
    </div>
  );
}
