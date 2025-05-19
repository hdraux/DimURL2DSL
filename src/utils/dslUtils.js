export const getSourceTypeFromUrl = (url) => {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.includes("/grant")) return "grants";
  if (pathname.includes("/dataset")) return "datasets";
  if (pathname.includes("/patent")) return "patents";
  if (pathname.includes("/clinical_trial")) return "clinical_trials";
  if (pathname.includes("/policy_document")) return "policy_documents";
  return "publications";
};

export const getNumericFields = (sourceType) => {
  const base = ["year"];
  const extra = {
    grants: ["start_year", "active_year"],
    patents: ["granted_year", "priority_year", "filed_year"],
    clinical_trials: ["active_years"]
  };
  return [...base, ...(extra[sourceType] || [])];
};
