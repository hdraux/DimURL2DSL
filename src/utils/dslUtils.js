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
  
  // Process OR conditions and add them to dslConditions
  for (const [field, values] of Object.entries(orConditions)) {
    if (values.length === 1) {
      // If only one value, use equals
      dslConditions.push(`${field} = ${values[0]}`);
    } else {
      // If multiple values, use IN operator
      dslConditions.push(`${field} in [${values.join(",")}]`);
    }
  }
  
  // Build the DSL query
  let query = `search ${detectedSourceType}`;
  if (dslConditions.length > 0) {
    query += `\nwhere ${dslConditions.join(" and ")}`;
  }
  query += `\nreturn ${returnFacet}`;
  
  return {
    query,
    detectedSourceType,
    skippedFields
  };
};
