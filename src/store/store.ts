import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer/rootReducer";

const isDevelopment =
	process.env.NEXT_PUBLIC_NODE_ENV !== "production" &&
	process.env.NEXT_PUBLIC_NODE_ENV !== "preproduction";

export const makeStore = () => {
	let store = configureStore({
		reducer: rootReducer,
		devTools: isDevelopment,
	});
	return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
