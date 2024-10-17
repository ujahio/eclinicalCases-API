export interface CaseDetail {
	caseID: string;
	caseTopic: string;
	caseTopicAnswer: string;
	caseExplanation: string;
	answers: Answer[];
	caseDescription: string;
	caseDeadline: string;
	studentCaseTopicResponse: string;
	studentCaseExplanation: string;
}

export interface Answer {
	question: string;
	options: string[];
	studentAnswer: number | null;
}

export interface StudentCaseStudyProps {
	caseDetails: CaseDetail;
	setCaseDetails: React.Dispatch<React.SetStateAction<CaseDetail>>;
	handleSubmitResponse: () => void;
	activeTab: number;
	switchTab: (tab: number) => void;
	tabs: string[];
	progress: number;
	isActive: (key: string) => boolean;
	goNext: () => void;
	goBack: () => void;
}
