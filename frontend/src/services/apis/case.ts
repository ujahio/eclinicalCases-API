import { caseApi, config } from "../config/axiosConfig";


const convertToFormData = (caseStudy: any) => {
  const formData = new FormData();

  for (const key in caseStudy) {
    if (key === "caseMaterials") {
      for (let i = 0; i < caseStudy.caseMaterials.length; i++) {
        formData.append(`caseMaterials`, caseStudy.caseMaterials[i]);
      }
    } else if (key === "caseQuestions") {
      formData.append(key, JSON.stringify(caseStudy[key]));
    } else {
      formData.append(key, caseStudy[key]);
    }
  }

  return formData;
};

export const addCaseApi = (caseData: any, token: string) => {
  const formData = convertToFormData(caseData);
  return caseApi.post(`/add`, formData, config(token));
};

export const updateCaseApi = (caseData: any, token: string, _id: any) => {
  const formData = convertToFormData(caseData);
  return caseApi.post(`/update/${_id}`, formData, config(token));
};

export const getAllCasesApi = (token: string, isRecent?: string) => {
  let url = `/all/`;
  url += `?caseStatus=${isRecent}`;
  return caseApi.get(url, config(token));
};

export const fetchCaseDetailsApi = (caseId: any, token: string) => {
  return caseApi.get(`/details/${caseId}/`, config(token));
};

export const fetchOngoingCasesApi = (token: string) => {
  return caseApi.get(`/ongoing-case/`, config(token));
};
export const deleteCaseApi = (caseId: string, token: string) => {
  return caseApi.delete(`/delete-case/${caseId}/`, config(token));
};

export const fetchCaseDataApi = (caseId: string, token: string) => {
  return caseApi.get(`/data/${caseId}/`, config(token));
};
