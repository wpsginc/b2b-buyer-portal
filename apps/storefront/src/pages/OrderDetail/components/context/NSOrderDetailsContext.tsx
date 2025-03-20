import { createContext, Dispatch, ReactNode, useMemo, useReducer } from 'react';

import { CustomInvoiceList, OrderItemList } from '@/types';

export interface NSOrderDetailsState {
  nsOrderInternalID?: string;
  orderNumber?: string;
  bcOrderNum?: string;
  status?: string;
  date?: string;
  lines?: OrderItemList[];
  printLink?: string;
  invList?: CustomInvoiceList[];
}

interface NSOrderDetailsAction {
  type: string;
  payload: NSOrderDetailsState;
}

export interface NSOrderDetailsContextType {
  state: NSOrderDetailsState;
  dispatch: Dispatch<NSOrderDetailsAction>;
}

interface NSOrderDetailsProviderProps {
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
  invList: [],
};

export const NSOrderDetailsContext = createContext<NSOrderDetailsContextType>({
  state: initState,
  dispatch: () => {},
});

const reducer = (state: NSOrderDetailsState, action: NSOrderDetailsAction) => {
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

export function NSOrderDetailsProvider(props: NSOrderDetailsProviderProps) {
  const [state, dispatch] = useReducer(reducer, initState);

  const { children } = props;

  const NSOrderDetailsValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return (
    <NSOrderDetailsContext.Provider value={NSOrderDetailsValue}>
      {children}
    </NSOrderDetailsContext.Provider>
  );
}
