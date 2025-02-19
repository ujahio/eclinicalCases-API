import React, { PropsWithChildren } from "react";
import { render, RenderResult } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
	preloadedState?: any;
}

type ExtendedRenderResult = Omit<RenderResult, "store"> & {
	store: ReturnType<typeof makeStore>;
};

export function renderWithProviders(
	ui: React.ReactElement,
	{ preloadedState = {}, ...renderOptions }: ExtendedRenderOptions = {}
): ExtendedRenderResult {
	const store = makeStore();

	function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
		return <Provider store={store}>{children}</Provider>;
	}

	return {
		store,
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
	} as ExtendedRenderResult;
}

// re-export everything
export * from "@testing-library/react";
