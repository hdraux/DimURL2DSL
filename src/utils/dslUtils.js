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
  const conditions = [];
  const orGroups = {};
  const numeric = ["year", "start_year", "active_year", "granted_year"];

  for (const [param, value] of searchParams.entries()) {
    const isOr = param.startsWith("or_facet_");
    const fieldKey = param.replace(/^(and|or)_facet_/, "");
    const field = facetMapping[fieldKey];
    if (!field) continue;

    const quote = numeric.includes(field) ? value : `"${value}"`;

    if (isOr) {
      if (!orGroups[field]) orGroups[field] = [];
      orGroups[field].push(quote);
    } else {
      conditions.push(`${field} = ${quote}`);
    }
  }

  for (const [field, values] of Object.entries(orGroups)) {
    const clause = values.length === 1 ? `${field} = ${values[0]}` : `${field} in [${values.join(",")}]`;
    conditions.push(clause);
  }

  let query = `search ${sourceType}`;
  if (conditions.length) query += `\nwhere ${conditions.join(" and ")}`;
  query += `\nreturn ${selectedFacet}`;

  return { query, source: sourceType };
}
