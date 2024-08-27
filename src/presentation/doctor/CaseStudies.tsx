import React, { useState } from "react";
import AdminLayout from "@/components/layouts/dashboard/admin";
import { SearchBar } from "@/components/form-elements";
import Link from "next/link";
import { CaseCard } from "@/components/cases";
import { useAppSelector } from "@/services/hooks/hooks";
import { formatDate } from "@/utils/formatDate";

interface IProps {
  handleDeleteCase: (caseId: string) => void;
}

const DoctorCaseStudies = ({ handleDeleteCase }: IProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const allCasesState = useAppSelector((state) => state.getAllCases.cases?.data);
  const cases = allCasesState?.map((caseItem: any) => ({
    _id: caseItem.id,
    title: caseItem.caseTopic,
    description:
      "Learn how patients with a serious infection can be managed in outpatient settings with the help of an OPAT service.",
    deadline: formatDate(caseItem.caseDeadline),
    created: formatDate(caseItem.createdAt),
    caseStatus: caseItem.caseStatus,
  }));
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredCases = cases?.filter(
    (caseItem: any) =>
      caseItem.title.toLowerCase().includes(searchQuery) || caseItem.description.toLowerCase().includes(searchQuery)
  );

  return (
    <AdminLayout>
      <SearchBar placeholder="Search for case studies..." onChange={handleSearch} />

      <div className="mt-7.5">
        <ul className="grid grid-cols-items gap-5 md:gap-6.25">
          {filteredCases?.length > 0 ? (
            <>
              {filteredCases.map((caseS: any) => (
                <CaseCard case={caseS} key={caseS._id} handleDeleteCase={handleDeleteCase} />
              ))}
            </>
          ) : (
            <p className="text-black">No cases found matching your search query.</p>
          )}
        </ul>
      </div>
    </AdminLayout>
  );
};

export default DoctorCaseStudies;
