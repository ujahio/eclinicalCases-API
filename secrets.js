import { Resource } from "sst";

const SECRETS = {
	JwtSecret: Resource.JwtSecret.value,
	PassSecret: Resource.PassSecret.value,
	NextPublicBaseUrl: Resource.NextPublicBaseUrl.value,
	NextNodeEnv: Resource.NextNodeEnv.value,
	NextPassSecretKey: Resource.NextPassSecretKey.value,
};

export default SECRETS;
