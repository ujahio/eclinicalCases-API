export type handleAddCaseType = React.Dispatch<React.SetStateAction<any>>;
export interface CaseQuestion {
	question: string;
	options: string[];
	correctAnswer: number;
}

export interface CaseStudy {
	caseClue: string;
	caseDescription: string | null;
	caseTopic: string;
	caseExplanation: string | null;
	caseDeadline: string;
	caseQuestions: CaseQuestion[];
	caseStatus: string;
	caseMaterials: {
		fileName: string;
		documentKey: string;
	}[];
	shouldPublish?: boolean;
}

export interface CreateCaseStudyProps {
	activeTab: number;
	switchTab: React.Dispatch<React.SetStateAction<number>>;
	goNext: () => void;
	goBack: () => void;
	progress: number;
	isActive: (key: string) => boolean;
	caseStudy: CaseStudy;
	setCaseStudy: React.Dispatch<React.SetStateAction<CaseStudy>>;
	handleAddCase: handleAddCaseType;
	handlePublishCase: React.Dispatch<React.SetStateAction<any>>;
}

export interface DoctorCaseQuestionProps {
	goNext: () => void;
	caseStudy: CaseStudy;
	setCaseStudy: React.Dispatch<React.SetStateAction<CaseStudy>>;
	handleAddCase: handleAddCaseType;
}
export interface DoctorCaseAnswerProps extends DoctorCaseQuestionProps {
	goBack: () => void;
}
export interface DoctorMaterialsAndDeadlineProps
	extends DoctorCaseQuestionProps {
	goBack: () => void;
}
export interface DoctorCMEQuestionsProps extends DoctorCaseQuestionProps {
	goBack: () => void;
}
export interface FinalReviewProps {
	caseStudy: CaseStudy;
	handleAddCase: handleAddCaseType;
	handlePublishCase: () => void;
}

export interface UpdateCaseStudyProps {
	activeTab: number;
	switchTab: React.Dispatch<React.SetStateAction<number>>;
	goNext: () => void;
	goBack: () => void;
	progress: number;
	isActive: (key: string) => boolean;
	caseStudy: CaseStudy;
	setCaseStudy: React.Dispatch<React.SetStateAction<CaseStudy>>;
	handleUpdateCase: () => void;
	handlePublishCase: () => void;
}
