import CompanyView, { companyMetadata } from "./CompanyView";

// The Company view in English; `/zh/company` renders the same view in Chinese (bilingual Part 2).
export const metadata = companyMetadata("en");

export default function CompanyPage() {
  return <CompanyView locale="en" />;
}
