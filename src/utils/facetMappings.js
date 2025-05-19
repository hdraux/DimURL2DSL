export const FACET_TO_DSL = {
  publications: { year: "year", open_access_status: "open_access" },
  grants: { year: "start_year", funder: "funders" },
  patents: { year: "year", granted_year: "granted_year" },
  clinical_trials: { year: "year", active_year: "active_years" },
  policy_documents: { year: "year", research_org: "publisher_org" },
  datasets: { year: "year", researcher: "researchers" }
};
