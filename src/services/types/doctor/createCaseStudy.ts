export type handleAddCaseType = (draft?: boolean) => void;
export interface CaseQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface CaseStudy {
  caseClue: string;
  caseDescription: string;
  caseTopic: string;
  caseExplanation: string;
  caseDeadline: string;
  caseQuestions: CaseQuestion[];
  draft: boolean;
  caseMaterials: any[];
}

export interface CreateCaseStudyProps {
  activeTab: number;
  switchTab: React.Dispatch<React.SetStateAction<number>>;
  goNext: () => void;
  progress: number;
  isActive: (key: string) => boolean;
  caseStudy: CaseStudy;
  setCaseStudy: React.Dispatch<React.SetStateAction<CaseStudy>>;
  handleAddCase: handleAddCaseType;
}

export interface DoctorCaseQuestionProps {
  goNext: () => void;
  caseStudy: CaseStudy;
  setCaseStudy: React.Dispatch<React.SetStateAction<CaseStudy>>;
  handleAddCase?: handleAddCaseType;
}
export interface DoctorCaseAnswerProps extends DoctorCaseQuestionProps {}
export interface DoctorMaterialsAndDeadlineProps extends DoctorCaseQuestionProps {}
export interface DoctorCMEQuestionsProps extends DoctorCaseQuestionProps {}
export interface FinalReviewProps {
  goNext: () => void;
  caseStudy: CaseStudy;
  handleAddCase: handleAddCaseType;
}

export interface UpdateCaseStudyProps {
  activeTab: number;
  switchTab: React.Dispatch<React.SetStateAction<number>>;
  goNext: () => void;
  progress: number;
  isActive: (key: string) => boolean;
  caseStudy: CaseStudy;
  setCaseStudy: React.Dispatch<React.SetStateAction<CaseStudy>>;
  prevCaseMaterials: File[];
  setPrevCaseMaterials: React.Dispatch<React.SetStateAction<File[]>>;
  handleUpdateCase: any;
}
