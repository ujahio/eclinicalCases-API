import CaseCard from "@/components/cases/CaseCard";
import { SearchBar } from "@/components/form-elements";
import DashboardLayout from "@/components/layouts/dashboard";
import React from "react";

const StudentCaseStudies = () => {
  return (
    <DashboardLayout>
      <SearchBar placeholder="Search for case studies..." />
      <div className="mt-7.5">
        <ul className="grid grid-cols-items gap-5 md:gap-6.25">
          {caseStudies.map((caseS, index) => (
            <CaseCard case={caseS} key={index} />
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
};

const caseStudies = [
  {
    title: "Malaria",
    description:
      "Learn how patients with a serious infection can be managed in outpatient settings with the help of an OPAT service.",
    created: "Feb 20, 2018",
    deadline: "May 20, 2018",
    _id: "563ghs7sbshiuss",
  },
  {
    title: "Dysentry",
    description:
      "Learn how patients with a serious infection can be managed in outpatient settings with the help of an OPAT service.",
    created: "Feb 20, 2018",
    deadline: "May 20, 2018",
    _id: "563ghs7sbshiuss",
  },
  {
    title: "Measles",
    description:
      "Learn how patients with a serious infection can be managed in outpatient settings with the help of an OPAT service.",
    created: "Feb 20, 2018",
    deadline: "May 20, 2018",
    _id: "563ghs7sbshiuss",
  },
  {
    title: "Malaria",
    description:
      "Learn how patients with a serious infection can be managed in outpatient settings with the help of an OPAT service.",
    created: "Feb 20, 2018",
    deadline: "May 20, 2018",
    _id: "563ghs7sbshiuss",
  },
  {
    title: "Dysentry",
    description:
      "Learn how patients with a serious infection can be managed in outpatient settings with the help of an OPAT service.",
    created: "Feb 20, 2018",
    deadline: "May 20, 2018",
    _id: "563ghs7sbshiuss",
  },
  {
    title: "Measles",
    description:
      "Learn how patients with a serious infection can be managed in outpatient settings with the help of an OPAT service.",
    created: "Feb 20, 2018",
    deadline: "May 20, 2018",
    _id: "563ghs7sbshiuss",
  },
];

export default StudentCaseStudies;
