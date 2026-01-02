export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiConfig<BodyType = unknown, ResponseType = unknown> {
  method: ApiMethod;
  path: string;
  bodyType?: BodyType;
  responseType?: ResponseType;
}

/**
 * API 엔드포인트 이름 타입
 */
export type ApiName = keyof typeof import('./definitions').API_DEFINITIONS;

/**
 * 모든 API 엔드포인트에 대한 메타정보
 */
export type ApiDefinitions = {
  [K in ApiName]: ApiConfig<
    (typeof import('./definitions').API_DEFINITIONS)[K] extends { bodyType: infer BodyType }
      ? BodyType
      : never,
    (typeof import('./definitions').API_DEFINITIONS)[K] extends {
      responseType: infer ResponseType;
    }
      ? ResponseType
      : never
  >;
};

/**
 * ApiBody<EP> - 요청 바디 타입
 */
export type ApiBody<EP extends ApiName> = ApiDefinitions[EP] extends {
  bodyType: infer B;
}
  ? B
  : never;

/**
 * ApiResponse<EP> - 응답 타입
 */
export type ApiResponse<EP extends ApiName> = ApiDefinitions[EP] extends {
  responseType: infer R;
}
  ? R
  : never;

export interface ApiBasicResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  error?: string;
  status?: string;
  statusCode?: number;
}

/**
 * 제네릭 API 요청 인터페이스
 */
export interface ApiRequest<Req = unknown, Res = unknown> {
  endpoint: ApiName;
  request?: Req;
  response?: Res;
}
