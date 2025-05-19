
I'll customize this artifact:


Dimensions.ai URL to DSL Converter
Interactive artifact 
Transform any artifact into something uniquely yours by customizing its core elements.

Change the topic - Adapt the content for a different subject
Update the style - Refresh the visuals or overall design
Make it personal - Tailor specifically for your needs
Share your vision - I'll bring it to life
Where would you like to begin?




Can you convert this into a Vite-based project for Vercel, if possible with the following structure;

├── index.html ├── package.json ├── vite.config.js ├── src/ │ ├── main.jsx │ ├── App.jsx │ ├── components/ │ │ └── DimensionsDSLConverter.jsx │ └── utils/ │ ├── constants.js │ ├── facetMappings.js │ └── dslUtils.js

Only write:
DimensionsDSLConverter.jsx
and 
dslUtils.js

I'll create the files you need for a Vite-based project structure. Here are the two key files you requested:


DimensionsDSLConverter.jsx
Code 

dslUtils.js
Code 
I've created the two key files for your Vite-based Dimensions.ai DSL converter project:

DimensionsDSLConverter.jsx - The main React component that handles the user interface and interactions.
dslUtils.js - Utility functions for processing Dimensions.ai URLs and converting them to DSL queries.
These files are designed to work within the structure you specified. For a complete project setup, you'll need to create the remaining files:

index.html - Main HTML entry point
package.json - Dependencies and scripts
vite.config.js - Vite configuration
src/main.jsx - React entry point
src/App.jsx - Main App component
src/utils/constants.js - Constants for the application
src/utils/facetMappings.js - This file should contain all the facet mappings and arrays referenced in dslUtils.js:
PUBLICATION_FACETS, GRANT_FACETS, etc.
PUBLICATION_FACET_TO_DSL, GRANT_FACET_TO_DSL, etc.
The component is built with React and Tailwind CSS styling, making it ready for a Vercel deployment. It handles all the logic to convert Dimensions.ai URLs into DSL queries, with support for all source types (publications, grants, patents, clinical trials, policy documents, and datasets).

Would you like me to create the facetMappings.js file or any of the other remaining files for your project structure?




It's missing the "or" logic it seems?

You're absolutely right. The "or" logic is missing from the URL parsing in the convertUrlToDsl function. Let me fix this by updating the dslUtils.js file:


dslUtils.js
Code 
You're right, I should make sure the DimensionsDSLConverter.jsx component is properly handling the OR logic as well. Let me check and update that component:


DimensionsDSLConverter.jsx
Code 
Let me also make sure the component will populate the available facets correctly when it first mounts:


DimensionsDSLConverter.jsx
Code 
Let's also fix one more issue to ensure the free text search functionality is working properly:


dslUtils.js
Code 

dslUtils.js
Code 
Now the code properly handles the OR logic for Dimensions.ai URL conversion. I've made the following improvements:

Added search query parsing - The code now extracts and processes the free text search query from the URL parameters.
Fixed OR logic handling - Previously, the OR conditions were being incorrectly merged into the main dslConditions array. Now they're kept separate and properly processed when building the final DSL query.
Improved UI state management - Added useEffect to initialize available facets when the component mounts, and ensured state is properly updated when converting URLs.
Enhanced DSL query generation - Now properly combines AND and OR conditions in the final query, with appropriate formatting.
These changes ensure that the converter correctly handles all aspects of Dimensions.ai URLs, including:




import { 
  PUBLICATION_FACETS,
  GRANT_FACETS,
  PATENT_FACETS,
  CLINICAL_TRIAL_FACETS,
  POLICY_DOCUMENT_FACETS,
  DATASET_FACETS,
  PUBLICATION_FACET_TO_DSL,
  GRANT_FACET_TO_DSL,
  DATASET_FACET_TO_DSL,
  PATENT_FACET_TO_DSL,
  CLINICAL_TRIAL_FACET_TO_DSL,
  POLICY_DOCUMENT_FACET_TO_DSL
} from './facetMappings';

/**
 * Determines the source type based on the URL path
 * @param {string} url - Dimensions.ai URL
 * @returns {string} Source type (publications, grants, etc.)
 */
export const getSourceTypeFromUrl = (url) => {
  const pathname = new URL(url).pathname.toLowerCase();
  
  if (pathname.includes("/grant")) return "grants";
  if (pathname.includes("/dataset")) return "datasets";
  if (pathname.includes("/patent")) return "patents";
  if (pathname.includes("/clinical_trial")) return "clinical_trials";
  if (pathname.includes("/policy_document")) return "policy_documents";
  
  // Default to publications
  return "publications";
};

/**
 * Returns the appropriate facet mapping object based on source type
 * @param {string} sourceType - Source type (publications, grants, etc.)
 * @returns {Object} Mapping between URL facets and DSL fields
 */
export const getFacetMapping = (sourceType) => {
  switch (sourceType) {
    case "grants": return GRANT_FACET_TO_DSL;
    case "datasets": return DATASET_FACET_TO_DSL;
    case "patents": return PATENT_FACET_TO_DSL;
    case "clinical_trials": return CLINICAL_TRIAL_FACET_TO_DSL;
    case "policy_documents": return POLICY_DOCUMENT_FACET_TO_DSL;
    default: return PUBLICATION_FACET_TO_DSL;
  }
};

/**
 * Determines which fields should not be quoted (numeric fields)
 * @param {string} sourceType - Source type (publications, grants, etc.)
 * @returns {Array} List of field names that should not be quoted
 */
export const getNumericFields = (sourceType) => {
  const commonNumericFields = ["year"];
  
  switch (sourceType) {
    case "grants":
      return [...commonNumericFields, "start_year", "active_year"];
    case "patents":
      return [...commonNumericFields, "granted_year", "priority_year", "filed_year"];
    case "clinical_trials":
      return [...commonNumericFields, "active_years"];
    default:
      return commonNumericFields;
  }
};

/**
 * Gets available facets based on source type
 * @param {string} sourceType - Source type (publications, grants, etc.)
 * @returns {Array} List of available facets for the source type
 */
export const getFacetsForSourceType = (sourceType) => {
  switch (sourceType) {
    case "publications":
      return PUBLICATION_FACETS;
    case "grants":
      return GRANT_FACETS;
    case "patents":
      return PATENT_FACETS;
    case "clinical_trials":
      return CLINICAL_TRIAL_FACETS;
    case "policy_documents":
      return POLICY_DOCUMENT_FACETS;
    case "datasets":
      return DATASET_FACETS;
    default:
      return [sourceType]; // Default to just the source type itself
  }
};

/**
 * Converts a Dimensions.ai URL to a DSL query
 * @param {string} url - Dimensions.ai URL with facet filters
 * @param {string} selectedFacet - The facet to return in the DSL query
 * @returns {Object} Object containing the DSL query, detected source type, and any skipped fields
 */
export const convertUrlToDsl = (url, selectedFacet) => {
  // Parse the URL
  const parsedUrl = new URL(url);
  const searchParams = new URLSearchParams(parsedUrl.search);
  const dslConditions = [];
  
  // Determine source type and get appropriate mapping
  const detectedSourceType = getSourceTypeFromUrl(url);
  
  // Use provided selected facet or default to source type
  const returnFacet = selectedFacet || detectedSourceType;
  
  const facetMapping = getFacetMapping(detectedSourceType);
  const numericFields = getNumericFields(detectedSourceType);
  
  // Track OR conditions by field
  const orConditions = {};
  
  // Keep track of skipped/unsupported fields for warning messages
  const skippedFields = [];
  
  // Parse search query if present (comes after 'search' parameter)
  const searchQuery = searchParams.get("search");
  if (searchQuery && searchQuery.trim()) {
    dslConditions.push(`"${searchQuery.trim()}"`);
  }

  // Extract facets from URL parameters
  for (const [param, value] of searchParams.entries()) {
    if (param.startsWith("and_facet_") || param.startsWith("or_facet_")) {
      const isOr = param.startsWith("or_facet_");
      const facet = param.replace(isOr ? "or_facet_" : "and_facet_", "");
      const dslField = facetMapping[facet];
      
      // Special case for clinical trials and research_org fields
      const isClinicalTrialsResearchOrgField = 
        detectedSourceType === "clinical_trials" && 
        (facet === "research_org_country" || facet === "research_org_state" || facet === "research_org_city");
      
      if (dslField) {
        // Check if the value should be quoted (generally yes, except for numeric values)
        const shouldQuote = !numericFields.includes(dslField) || isNaN(value);
        const quotedValue = shouldQuote ? `"${value}"` : value;
        
        if (isOr) {
          // For OR conditions, group by field
          if (!orConditions[dslField]) {
            orConditions[dslField] = [];
          }
          orConditions[dslField].push(quotedValue);
        } else {
          // For AND conditions, add directly
          dslConditions.push(`${dslField} = ${quotedValue}`);
        }
      } else if (isClinicalTrialsResearchOrgField) {
        // Track skipped research_org fields in clinical trials
        skippedFields.push(facet);
      } else if (facet in facetMapping && facetMapping[facet] === null) {
        // Track fields that are explicitly marked as not supported
        skippedFields.push(facet);
      } else if (!(facet in facetMapping)) {
        // Track unknown/unmapped fields
        skippedFields.push(facet);
      }
    }
  }
  
  // Note: OR conditions are now processed in the final query building step
  
  // Build the DSL query
  let query = `search ${detectedSourceType}`;
  
  // Add conditions if any exist
  if (dslConditions.length > 0 || Object.keys(orConditions).length > 0) {
    const allConditions = [...dslConditions];
    
    // Process OR conditions and add them to allConditions
    for (const [field, values] of Object.entries(orConditions)) {
      if (values.length === 1) {
        // If only one value, use equals
        allConditions.push(`${field} = ${values[0]}`);
      } else {
        // If multiple values, use IN operator
        allConditions.push(`${field} in [${values.join(", ")}]`);
      }
    }
    
    query += `\nwhere ${allConditions.join(" and ")}`;
  }
  
  query += `\nreturn ${returnFacet}`;
  
  return {
    query,
    detectedSourceType,
    skippedFields
  };
};
