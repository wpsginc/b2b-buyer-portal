import { createContext, Dispatch, ReactNode, useMemo, useReducer } from 'react';

import { InvoiceDetailList } from '@/types';

export interface CustomInvoiceDetailState {
  nsOrderInternalID?: string;
  orderNumber?: string;
  bcOrderNum?: string;
  status?: string;
  date?: string;
  lines?: InvoiceDetailList[];
  printLink?: string;
}

interface CustomInvoiceDetailsAction {
  type: string;
  payload: CustomInvoiceDetailState;
}

export interface CustomInvoiceDetailsContextType {
  state: CustomInvoiceDetailState;
  dispatch: Dispatch<CustomInvoiceDetailsAction>;
}

interface CustomInvoiceDetailsProviderProps {
  children: ReactNode;
}

const initState = {
  nsOrderInternalID: '',
  orderNumber: '',
  bcOrderNum: '',
  status: '',
  date: '',
  lines: [],
  printLink: '',
};

export const CustomInvoiceDetailsContext = createContext<CustomInvoiceDetailsContextType>({
  state: initState,
  dispatch: () => {},
});

const reducer = (state: CustomInvoiceDetailState, action: CustomInvoiceDetailsAction) => {
  switch (action.type) {
    case 'all':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export function CustomInvoiceDetailsProvider(props: CustomInvoiceDetailsProviderProps) {
  const [state, dispatch] = useReducer(reducer, initState);

  const { children } = props;

  const CustomInvoiceDetailsValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return (
    <CustomInvoiceDetailsContext.Provider value={CustomInvoiceDetailsValue}>
      {children}
    </CustomInvoiceDetailsContext.Provider>
  );
}
