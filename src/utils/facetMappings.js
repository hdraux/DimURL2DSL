// Object mapping facets in the URL to DSL fields for publications
export const PUBLICATION_FACET_TO_DSL = {
  "year": "year",
  "researcher": "researchers",
  "funder": "funders",
  "funder_country": "funder_countries",
  "research_org": "research_orgs",
  "org_type": "research_org_types",
  "research_org_country": "research_org_countries",
  "research_org_state": "research_org_state_names",
  "research_org_city": "research_org_cities",
  "for": "category_for",
  "rcdc": "category_rcdc",
  "hrcs_hc": "category_hrcs_hc",
  "hrcs_rac": "category_hrcs_rac",
  "broad_research_areas": "category_bra",
  "health_research_areas": "category_hra",
  "cancer_types": "category_icrp_ct",
  "cso": "category_icrp_cso",
  "uoa": "category_uoa",
  "sdg": "category_sdg",
  "publication_type": "type",
  "document_type": "document_type",
  "source_title": "source_title",
  "publisher": "publisher",
  "open_access_status": "open_access",
  "journal_list": "journal_lists"
};

// Object mapping facets in the URL to DSL fields for grants
export const GRANT_FACET_TO_DSL = {
  "year": "start_year",
  "active_year": "active_year",
  "active_status": "active_status",
  "researcher": "researchers",
  "funder": "funders",
  "funder_country": "funder_countries",
  "research_org": "research_orgs",
  "org_type": "research_org_types",
  "research_org_country": "research_org_countries",
  "research_org_state": "research_org_state_names",
  "research_org_city": "research_org_cities",
  "for": "category_for",
  "rcdc": "category_rcdc",
  "hrcs_hc": "category_hrcs_hc",
  "hrcs_rac": "category_hrcs_rac",
  "broad_research_areas": "category_bra",
  "health_research_areas": "category_hra",
  "cancer_types": "category_icrp_ct",
  "cso": "category_icrp_cso",
  "uoa": "category_uoa",
  "sdg": "category_sdg"
};

// Object mapping facets in the URL to DSL fields for datasets
export const DATASET_FACET_TO_DSL = {
  "year": "year",
  "researcher": "researchers",
  "funder": "funders",
  "funder_country": "funder_countries",
  "research_org": "research_orgs",
  "research_org_country": "research_org_countries",
  "research_org_state": "research_org_states",
  "research_org_city": "research_org_cities",
  "for": "category_for",
  "rcdc": "category_rcdc",
  "hrcs_hc": "category_hrcs_hc",
  "hrcs_rac": "category_hrcs_rac",
  "broad_research_areas": "category_bra",
  "health_research_areas": "category_hra",
  "cancer_types": "category_icrp_ct",
  "cso": "category_icrp_cso",
  "sdg": "category_sdg",
  "repository": "repository",
  "source_title": "journal"  // maps from source_title label in filter to 'journal' field in data
};

// Object mapping facets in the URL to DSL fields for patents
export const PATENT_FACET_TO_DSL = {
  "year": "year",
  "granted_year": "granted_year",
  "priority_year": "priority_year",
  "filed_year": "filed_year",
  "researcher": "researchers",
  "funder": "funders",
  "funder_country": "funder_countries",
  "research_org": "assignees",
  "org_type": "assignee_org_types",  // may not always exist in API
  "research_org_country": "assignee_countries",
  "research_org_state": "assignee_state_codes",
  "research_org_city": "assignee_cities",
  "for": "category_for",
  "rcdc": "category_rcdc",
  "hrcs_hc": "category_hrcs_hc",
  "hrcs_rac": "category_hrcs_rac",
  "broad_research_areas": "category_bra",
  "health_research_areas": "category_hra",
  "cancer_types": "category_icrp_ct",
  "cso": "category_icrp_cso",
  "sdg": "category_sdg",
  "ipcr": "ipcr",
  "cpc": "cpc",
  "jurisdiction": "jurisdiction",
  "legal_status": "legal_status",
  "filing_status": "filing_status",
  "kind": "kind",
  "additional_filters": "additional_filters"
};

// Object mapping facets in the URL to DSL fields for clinical trials
export const CLINICAL_TRIAL_FACET_TO_DSL = {
  "year": "year",
  "active_year": "active_years",
  "active_status": "status",
  "researcher": "researchers",
  "funder": "funders",
  "funder_country": "funder_countries",
  "research_org": "research_orgs",
  "org_type": "org_types",
  // Note: the following fields don't exist in the API despite being in the UI
  // They're kept here to identify them as skipped fields
  "research_org_country": null,
  "research_org_state": null,
  "research_org_city": null,
  "for": "category_for",
  "rcdc": "category_rcdc",
  "hrcs_hc": "category_hrcs_hc",
  "hrcs_rac": "category_hrcs_rac",
  "broad_research_areas": "category_bra",
  "health_research_areas": "category_hra",
  "cancer_types": "category_icrp_ct",
  "cso": "category_icrp_cso",
  "sdg": "category_sdg",
  "condition": "conditions",
  "phase": "phase",
  "gender": "gender",
  "registry": "registry"
};

// Object mapping facets in the URL to DSL fields for policy documents
export const POLICY_DOCUMENT_FACET_TO_DSL = {
  "year": "year",
  "research_org": "publisher_org",
  "research_org_country": "publisher_org_country",
  "research_org_state": "publisher_org_state",
  "research_org_city": "publisher_org_city",
  "for": "category_for",
  "rcdc": "category_rcdc",
  "hrcs_hc": "category_hrcs_hc",
  "hrcs_rac": "category_hrcs_rac",
  "broad_research_areas": "category_bra",
  "health_research_areas": "category_hra",
  "cancer_types": "category_icrp_ct",
  "cso": "category_icrp_cso",
  "sdg": "category_sdg"
};

// Source type to facet mapping
export const SOURCE_TYPE_TO_FACET_MAPPING = {
  publications: PUBLICATION_FACET_TO_DSL,
  grants: GRANT_FACET_TO_DSL,
  datasets: DATASET_FACET_TO_DSL,
  patents: PATENT_FACET_TO_DSL,
  clinical_trials: CLINICAL_TRIAL_FACET_TO_DSL,
  policy_documents: POLICY_DOCUMENT_FACET_TO_DSL
};

// Export an array of source types
export const SOURCE_TYPES = Object.keys(SOURCE_TYPE_TO_FACET_MAPPING);
