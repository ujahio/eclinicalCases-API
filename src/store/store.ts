import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer/rootReducer";

const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

export const makeStore = () => {
	let store = configureStore({
		reducer: rootReducer,
		devTools:
			isDevelopment && typeof window !== "undefined"
				? (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
				  (window as any).__REDUX_DEVTOOLS_EXTENSION__()
				: undefined,
	});
	return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
