import Cookies from 'js-cookie';

import { store } from '@/store';
import { BigCommerceStorefrontAPIBaseURL, channelId, snackbar, storeHash } from '@/utils';
import { encrypt } from '@/utils/customUtils';

import {
  ENCRYPTIONSECRET,
  getAPIBaseURL,
  NS_BACKEND,
  NS_TOKEN,
  queryParse,
  RequestType,
  RequestTypeKeys,
} from './base';
import nsFetch from './custom';
import b3Fetch from './fetch';

const GraphqlEndpointsFn = (type: RequestTypeKeys): string => {
  const GraphqlEndpoints: CustomFieldStringItems = {
    NSBackend: NS_BACKEND,
    B2BGraphql: `${getAPIBaseURL()}/graphql`,
    BCGraphql: `${BigCommerceStorefrontAPIBaseURL}/graphql`,
    BCProxyGraphql: `${getAPIBaseURL()}/api/v3/proxy/bc-storefront/graphql`,
  };

  return GraphqlEndpoints[type] || '';
};

function request(path: string, config?: RequestInit, type?: RequestTypeKeys) {
  const url = RequestType.B2BRest === type ? `${getAPIBaseURL()}${path}` : path;
  const { B2BToken } = store.getState().company.tokens;
  const getToken: HeadersInit =
    type === RequestType.BCRest
      ? {
          'x-xsrf-token': Cookies.get('XSRF-TOKEN') ?? '',
        }
      : {
          authToken: B2BToken,
        };

  const {
    headers = {
      'content-type': 'application/json',
    },
  } = config || {};

  const init = {
    ...config,
    headers: {
      ...headers,
      ...getToken,
    },
  };
  return b3Fetch(url, init);
}

function graphqlRequest<T, Y>(type: RequestTypeKeys, data: T, config?: Y) {
  const init = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...config,
    },
    body: JSON.stringify(data),
  };

  const url = GraphqlEndpointsFn(type);
  return b3Fetch(url, init);
}

function nsRequest<Y>(type: RequestTypeKeys, data: any, config?: Y) {
  const { order_id, customer_id, return_reason, line_items, invID, submitType } = data[0];
  const orderID = order_id;
  const customerID = customer_id;
  const returnReason = return_reason;
  const lineItems = line_items;
  const inv_id = invID ? encrypt(invID, ENCRYPTIONSECRET) : invID;
  const sType = submitType;

  const data_json = {
    custId:
      sType === 'invoices' || sType === 'invoice'
        ? encrypt(customerID.toString(), ENCRYPTIONSECRET)
        : customerID.toString(),
    orderID: orderID.toString() || '0',
    order: order_id.toString() || '0',
    returnReason: returnReason || '',
    invID: inv_id || 0,
    lines:
      lineItems && lineItems.length > 0
        ? lineItems.map((line: { lineKey: number; quantityToReturn: number }) => ({
            lineKey: line.lineKey.toString(),
            quantityToReturn: line.quantityToReturn,
          }))
        : [],
  };

  const init = {
    method: 'POST',
    headers: {
      ...config,
    },
    body: JSON.stringify(data_json),
  };

  let url = GraphqlEndpointsFn(type);

  url = `${url}/${sType}`;

  return nsFetch(url, init);
}

interface B2bGQLResponse {
  data: any;
  errors?: Array<{
    message: string;
    extensions: {
      code: number;
    };
  }>;
}

export interface B2BRequest {
  query: string;
  variables?: any;
}

const B3Request = {
  nsBackend: function post(data: any): Promise<any> {
    const config = {
      Authorization: `${NS_TOKEN}`,
      'content-type': 'application/json',
      accept: 'application/json',
    };
    return nsRequest(RequestType.NSBackend, data, config);
  },

  /** 
Request to B2B graphql API using B2B token
   */
  graphqlB2B: function post<T = CustomFieldItems>(
    data: B2BRequest,
    customMessage = false,
  ): Promise<T> {
    const { B2BToken } = store.getState().company.tokens;
    const config = {
      Authorization: `Bearer  ${B2BToken}`,
    };

    return graphqlRequest(RequestType.B2BGraphql, data, config).then((value: B2bGQLResponse) => {
      const error = value.errors?.[0];

      const message = error?.message;
      const extensions = error?.extensions;

      if (extensions?.code === 40101) {
        if (window.location.hash.startsWith('#/')) {
          window.location.href = '#/login?loginFlag=loggedOutLogin&showTip=false';
        }

        if (message) {
          snackbar.error(message);
        }

        return new Promise(() => {});
      }

      if (message) {
        if (!customMessage) {
          snackbar.error(message);
        }

        throw new Error(message);
      }

      if (value?.data?.countries?.length > 0) {
        return {
          countries: value.data.countries?.filter(
            (country: any) => country.countryCode === 'US' || country.countryCode === 'CA',
          ),
        };
      }

      return value.data;
    });
  },
  /**
   * @deprecated use {@link B3Request.graphqlBCProxy} instead
   * Request to BC graphql API using BC graphql token
   */
  graphqlBC: function post<T>(data: T): Promise<any> {
    const { bcGraphqlToken } = store.getState().company.tokens;
    const config = {
      Authorization: `Bearer  ${bcGraphqlToken}`,
    };
    return graphqlRequest(RequestType.BCGraphql, data, config);
  },
  /**
   * Request to BC graphql API using B2B token
   */
  graphqlBCProxy: function post<T>(data: T): Promise<any> {
    let config = {};
    const { B2BToken } = store.getState().company.tokens;

    if (B2BToken) {
      config = {
        Authorization: `Bearer  ${B2BToken}`,
      };
    } else {
      config = {
        'Store-Hash': storeHash,
        'BC-Channel-Id': channelId,
      };
    }

    return graphqlRequest(RequestType.BCProxyGraphql, data, config);
  },
  get: function get<T, Y>(url: string, type: RequestTypeKeys, data?: T, config?: Y): Promise<any> {
    if (data) {
      const params = queryParse(data);
      return request(`${url}?${params}`, {
        method: 'GET',
        ...config,
      });
    }
    return request(
      url,
      {
        method: 'GET',
      },
      type,
    );
  },
  post: function post<T>(url: string, type: RequestTypeKeys, data: T): Promise<any> {
    return request(
      url,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      },
      type,
    );
  },
  put: function put<T>(url: string, type: RequestTypeKeys, data: T): Promise<any> {
    return request(
      url,
      {
        body: JSON.stringify(data),
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
      },
      type,
    );
  },
  delete: function deleteFn(url: string, type: RequestTypeKeys): Promise<any> {
    return request(
      url,
      {
        method: 'DELETE',
      },
      type,
    );
  },
  fileUpload: function fileUpload<T extends FormData, Y>(
    url: string,
    formData: T,
    config?: Y,
  ): Promise<any> {
    return request(`${getAPIBaseURL()}${url}`, {
      method: 'POST',
      body: formData,
      headers: {},
      ...config,
    });
  },
};

export default B3Request;
