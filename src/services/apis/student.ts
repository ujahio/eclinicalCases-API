import { config, studentApi } from "../config/axiosConfig";

export const submitCaseResponseApi = (responsePayload: any, token: string) => {
  // const formData = new FormData();
  // for (const key in responsePayload) {
  //   if (key === "answers") {
  //     formData.append(key, JSON.stringify(responsePayload[key]));
  //   } else {
  //     formData.append(key, responsePayload[key]);
  //   }
  // }
  return studentApi.post(`/quiz/submit/`, responsePayload, config(token));
};

const convertToFormData = (data: any) => {
  const formData = new FormData();
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      formData.append(key, JSON.stringify(data[key]));
    }
  }
  return formData;
};

export const addFeedbackApi = (feedbackData: any, token: string) => {
  const formData = convertToFormData(feedbackData);
  return studentApi.post(`/case/add/feedback`, feedbackData, config(token));
};
