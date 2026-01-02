import camelcaseKeys from 'camelcase-keys';

import { CamelToSnake } from '../lib/type-utils';

import { ApiBody, ApiResponse, ApiName } from './api.types';
import { API_DEFINITIONS } from './definitions';
import { httpClient } from './httpRequest';

export async function apiCaller<Endpoint extends ApiName>(
  endpoint: Endpoint,
  params?: {
    pathParams?: Record<string, string>;
    queryParams?: Record<string, string>;
  },
  body?: ApiBody<Endpoint>,
  options?: {
    suppressGlobalError?: boolean;
  }
): Promise<ApiResponse<Endpoint>> {
  const apiConfig = API_DEFINITIONS[endpoint];
  let path = apiConfig.path as string;

  // pathParams 적용
  if (params?.pathParams) {
    Object.entries(params.pathParams).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }

  // queryParams 적용
  if (params?.queryParams) {
    const query = new URLSearchParams(params.queryParams).toString();
    path += `&${query}`;
  }

  const headersObj: Record<string, string> = {
    'user-token': sessionStorage.getItem('userToken') ?? '',
  };

  type CamelCaseResponse = ApiResponse<Endpoint>;
  type SnakeCaseResponse = CamelToSnake<CamelCaseResponse>;

  const rawData = await httpClient<SnakeCaseResponse>({
    url: path,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    method: apiConfig.method as any,
    headers: headersObj,
    body,
    instanceType: 'default',
    suppressGlobalError: options?.suppressGlobalError,
  });

  if (Array.isArray(rawData)) {
    return camelcaseKeys(rawData, { deep: true }) as ApiResponse<Endpoint>;
  }

  if (typeof rawData === 'object' && rawData !== null) {
    return camelcaseKeys(rawData as Record<string, unknown>, {
      deep: true,
    }) as ApiResponse<Endpoint>;
  }

  return rawData as ApiResponse<Endpoint>;
}
