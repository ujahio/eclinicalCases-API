import { makeStore } from "@/store/store";
import { getCaseMaterials } from "../getCaseMaterialsSlice";
import {
	getPresignedUrlForDocumentUploadApi,
	getPresignedUrlForFetchingDocumentsApi,
} from "@/services/apis/case";

jest.mock("@/services/apis/case", () => ({
	getPresignedUrlForDocumentUploadApi: jest.fn(),
	getPresignedUrlForFetchingDocumentsApi: jest.fn(),
}));

describe("getCaseMaterialsSlice", () => {
	let store = makeStore();

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().caseMaterials).toEqual({
			status: "idle",
			error: null,
			pdfMaterials: {},
		});
	});

	it("should handle successful document upload URL fetch", async () => {
		const uploadFileResponse = { pdfUrl: "upload-url", documentKey: "doc-123" };
		(getPresignedUrlForDocumentUploadApi as jest.Mock).mockResolvedValue({
			data: uploadFileResponse,
		});

		await store.dispatch(getCaseMaterials({ fileProcess: "upload" }));

		expect(store.getState().caseMaterials.status).toBe("succeeded");
	});

	it("should handle successful document download URLs fetch", async () => {
		const downloadFileResponse = {
			signedUrls: [
				{ documentKey: "doc-1", pdfUrl: "download-url-1" },
				{ documentKey: "doc-2", pdfUrl: "download-url-2" },
			],
		};
		(getPresignedUrlForFetchingDocumentsApi as jest.Mock).mockResolvedValue({
			data: downloadFileResponse,
		});

		await store.dispatch(
			getCaseMaterials({
				fileProcess: "download",
				documentKeys: ["doc-1", "doc-2"],
			})
		);

		expect(store.getState().caseMaterials.status).toBe("succeeded");
		expect(store.getState().caseMaterials.pdfMaterials).toEqual({
			"doc-1": { pdfUrl: "download-url-1" },
			"doc-2": { pdfUrl: "download-url-2" },
		});
	});

	it("should handle API error", async () => {
		const error = {
			response: {
				status: 500,
				data: "Server error",
			},
		};
		(getPresignedUrlForDocumentUploadApi as jest.Mock).mockRejectedValue(error);

		await store.dispatch(getCaseMaterials({ fileProcess: "upload" }));

		expect(store.getState().caseMaterials.status).toBe("failed");
		expect(store.getState().caseMaterials.error).toEqual({
			status: 500,
			message: "Server error",
		});
	});
});
