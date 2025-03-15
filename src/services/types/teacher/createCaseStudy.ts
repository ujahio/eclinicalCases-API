export type handleUpdateDraftCase = React.Dispatch<React.SetStateAction<any>>;
export interface CaseQuestion {
	question: string;
	options: string[];
	correctAnswer: number;
}

export type CaseStudy = {
	id?: string;
	caseDescription: string;
	caseTopic: string;
	caseExplanation?: string;
	caseTeaching: string;
	caseDeadline: string;
	caseQuestions: CaseQuestion[];
	caseStatus: string;
	caseMaterials: {
		fileName: string;
		documentKey: string;
	}[];
};

export interface CreateCaseStudyProps {
	activeTab: number;
	switchTab: React.Dispatch<React.SetStateAction<number>>;
	goNext: () => void;
	goBack: () => void;
	progress: number;
	isActive: (key: string) => boolean;
	caseStudy: CaseStudy;
	setCaseStudy: React.Dispatch<React.SetStateAction<CaseStudy>>;
	handleUpdateDraftCase: handleUpdateDraftCase;
	handlePublishCase: React.Dispatch<React.SetStateAction<any>>;
}

export interface TeacherCaseQuestionProps {
	goNext: () => void;
	caseStudy: CaseStudy;
	setCaseStudy: React.Dispatch<React.SetStateAction<CaseStudy>>;
	handleUpdateDraftCase: handleUpdateDraftCase;
}

export interface TeacherCaseAnswerProps extends TeacherCaseQuestionProps {
	goBack: () => void;
}
export interface TeacherCaseTeachingProps extends TeacherCaseQuestionProps {
	goBack: () => void;
}
export interface TeacherCMEQuestionsProps extends TeacherCaseQuestionProps {
	goBack: () => void;
}
export interface FinalReviewProps {
	caseStudy: CaseStudy;
	handleUpdateDraftCase: handleUpdateDraftCase;
	handlePublishCase: React.Dispatch<React.SetStateAction<any>>;
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
	handleUpdateDraftCase: () => void;
	handlePublishCase: () => void;
}
