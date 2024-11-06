import { configureStore } from "@reduxjs/toolkit";
import rootReducer, { RootState } from "./rootReducer/rootReducer";
import createFilter from "redux-persist-transform-filter";
import {
	persistReducer,
	persistStore,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const loginFilter = createFilter("login", ["isLoggedIn", "user"]);
const persistConfig = {
	key: "eclinical",
	storage,
	whitelist: ["login"],
	transforms: [loginFilter],
};

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

export const makeStore = () => {
	let store: any = configureStore({
		reducer: persistedReducer,
		devTools:
			isDevelopment && typeof window !== "undefined"
				? (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
				  (window as any).__REDUX_DEVTOOLS_EXTENSION__()
				: undefined,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: {
					ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
				},
			}),
	});
	store.__persistor = persistStore(store);
	return store;
};

export type AppStore = ReturnType<typeof makeStore>;
// export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
