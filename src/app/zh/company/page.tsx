import CompanyView, { companyMetadata } from "@/app/company/CompanyView";

// The Company view in Chinese (bilingual Part 2). The English is at `/company`.
export const metadata = companyMetadata("zh");

export default function ZhCompanyPage() {
  return <CompanyView locale="zh" />;
}
