import { FACET_TO_DSL } from "./facetMappings";

export function getSourceTypeFromUrl(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.includes("/grant")) return "grants";
    if (pathname.includes("/dataset")) return "datasets";
    if (pathname.includes("/patent")) return "patents";
    if (pathname.includes("/clinical_trial")) return "clinical_trials";
    if (pathname.includes("/policy_document")) return "policy_documents";
    return "publications";
  } catch {
    return "publications";
  }
}

export function parseDslFromUrl(url, selectedFacet) {
  const parsedUrl = new URL(url);
  const searchParams = new URLSearchParams(parsedUrl.search);
  const sourceType = getSourceTypeFromUrl(url);
  const facetMapping = FACET_TO_DSL[sourceType];
  const dslConditions = [];
  const orConditions = {};
  const numericFields = [
    "year", "start_year", "active_year", "granted_year",
    "priority_year", "filed_year", "active_years"
  ];

  for (const [param, value] of searchParams.entries()) {
    if (param.startsWith("and_facet_") || param.startsWith("or_facet_")) {
      const isOr = param.startsWith("or_facet_");
      const facet = param.replace(isOr ? "or_facet_" : "and_facet_", "");
      const dslField = facetMapping[facet];

      if (dslField) {
        const shouldQuote = !numericFields.includes(dslField) || isNaN(value);
        const quotedValue = shouldQuote ? `"${value}"` : value;

        if (isOr) {
          if (!orConditions[dslField]) {
            orConditions[dslField] = [];
          }
          orConditions[dslField].push(quotedValue);
        } else {
          dslConditions.push(`${dslField} = ${quotedValue}`);
        }
      }
    }
  }

  for (const [field, values] of Object.entries(orConditions)) {
    if (values.length === 1) {
      dslConditions.push(`${field} = ${values[0]}`);
    } else {
      dslConditions.push(`${field} in [${values.join(",")}]`);
    }
  }

  let query = `search ${sourceType}`;
  if (dslConditions.length > 0) {
    query += `\nwhere ${dslConditions.join(" and ")}`;
  }
  query += `\nreturn ${selectedFacet}`;

  return { query, source: sourceType };
}
