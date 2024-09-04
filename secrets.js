import { Resource } from "sst";

const SECRETS = {
  JWT_SECRET: Resource.JWT_SECRET.value,
  PASS_SECRET: Resource.PASS_SECRET.value,
  NEXT_PUBLIC_BASE_URL:  Resource.NEXT_PUBLIC_BASE_URL.value,
  NEXT_NODE_ENV: Resource.NEXT_NODE_ENV.value,
  NEXT_PASS_SECRET_KEY:  Resource.NEXT_PASS_SECRET_KEY.value,
};

export default SECRETS;
