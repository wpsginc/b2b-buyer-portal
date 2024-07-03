const {
  VITE_B2B_URL,
  VITE_NETSUITE_BACKEND,
  VITE_NETSUITE_SCRIPT_ID,
  VITE_NETSUITE_DEPLOY_ID,
  VITE_NETSUITE_TOKEN,
} = import.meta.env;

const B2B_BASIC_URL = VITE_B2B_URL;
const NS_BACKEND = VITE_NETSUITE_BACKEND;
const NS_SCRIPT_ID = VITE_NETSUITE_SCRIPT_ID;
const NS_DEPLOY_ID = VITE_NETSUITE_DEPLOY_ID;
const NS_TOKEN = VITE_NETSUITE_TOKEN;

enum RequestType {
  B2BGraphql = 'B2BGraphql',
  BCGraphql = 'BCGraphql',
  BCProxyGraphql = 'BCProxyGraphql',
  B2BRest = 'B2BRest',
  BCRest = 'BCRest',
  TranslationService = 'TranslationService',
  NSBackend = 'NSBackend',
}

export type RequestTypeKeys = keyof typeof RequestType;

const queryParse = <T>(query: T): string => {
  let queryText = '';

  Object.keys(query || {}).forEach((key: string) => {
    queryText += `${key}=${(query as any)[key]}&`;
  });
  return queryText.slice(0, -1);
};

export { B2B_BASIC_URL, NS_BACKEND, NS_SCRIPT_ID, NS_DEPLOY_ID, NS_TOKEN, queryParse, RequestType };
