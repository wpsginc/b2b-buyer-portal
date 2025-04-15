import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useB3Lang } from '@b3/lang';
import { Box, Tab, Tabs } from '@mui/material';

// import { B2BAutoCompleteCheckbox } from '@/components';
import B3Filter from '@/components/filter/B3Filter';
import B3Spin from '@/components/spin/B3Spin';
import { B3PaginationTable, GetRequestList } from '@/components/table/B3PaginationTable';
import { TableColumnItem } from '@/components/table/B3Table';
import { useSort } from '@/hooks';
import {
  getB2BAllOrders,
  getBCAllOrders,
  getBcOrderStatusType,
  getOrdersCreatedByUser,
  getOrderStatusType,
} from '@/shared/service/b2b';
import { isB2BUserSelector, useAppSelector } from '@/store';
import { CustomerRole } from '@/types';
import { currencyFormat, displayFormat, ordersCurrencyFormat } from '@/utils';

import NetsuiteOrders from './components/NetsuiteOrders';
import OrderStatus from './components/OrderStatus';
import { orderStatusTranslationVariables } from './shared/getOrderStatus';
import {
  defaultSortKey,
  FilterSearchProps,
  getFilterMoreData,
  getInitFilter,
  getOrderStatusText,
  sortKeys,
} from './config';
import { OrderItemCard } from './OrderItemCard';

interface CompanyInfoProps {
  companyId: string;
  companyName: string;
  companyAddress: string;
  companyCountry: string;
  companyState: string;
  companyCity: string;
  companyZipCode: string;
  phoneNumber: string;
  bcId: string;
}

interface ListItem {
  firstName: string;
  lastName: string;
  orderId: string;
  poNumber?: string;
  money: string;
  totalIncTax: string;
  status: string;
  createdAt: string;
  companyName: string;
  companyInfo?: CompanyInfoProps;
}

interface SearchChangeProps {
  startValue?: string;
  endValue?: string;
  PlacedBy?: string;
  orderStatus?: string | number;
  company?: string;
}

interface OrderProps {
  isCompanyOrder?: boolean;
}

function useData() {
  const isB2BUser = useAppSelector(isB2BUserSelector);
  const companyB2BId = useAppSelector(({ company }) => company.companyInfo.id);
  const role = useAppSelector(({ company }) => company.customer.role);
  const salesRepCompanyId = useAppSelector(({ b2bFeatures }) => b2bFeatures.masqueradeCompany.id);
  const isAgenting = useAppSelector(({ b2bFeatures }) => b2bFeatures.masqueradeCompany.isAgenting);

  const { order: orderSubViewPermission } = useAppSelector(
    ({ company }) => company.pagesSubsidiariesPermission,
  );

  const { selectCompanyHierarchyId, isEnabledCompanyHierarchy } = useAppSelector(
    ({ company }) => company.companyHierarchyInfo,
  );
  const currentCompanyId =
    role === CustomerRole.SUPER_ADMIN && isAgenting
      ? Number(salesRepCompanyId)
      : Number(companyB2BId);

  const companyId = companyB2BId || salesRepCompanyId;

  return {
    role,
    isAgenting,
    isB2BUser,
    orderSubViewPermission,
    selectCompanyHierarchyId,
    isEnabledCompanyHierarchy,
    currentCompanyId,
    companyId,
  };
}

function Order({ isCompanyOrder = false }: OrderProps) {
  const companyB2BId = useAppSelector(({ company }) => company.companyInfo.id);
  const b3Lang = useB3Lang();
  // const [isMobile] = useMobile();
  const {
    role,
    isAgenting,
    companyId,
    isB2BUser,
    // orderSubViewPermission,
    selectCompanyHierarchyId,
    // isEnabledCompanyHierarchy,
    currentCompanyId,
  } = useData();

  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [allTotal, setAllTotal] = useState(0);
  const [filterData, setFilterData] = useState<Partial<FilterSearchProps> | null>(null);
  const [filterInfo, setFilterInfo] = useState<Array<any>>([]);
  const [getOrderStatuses, setOrderStatuses] = useState<Array<any>>([]);
  // const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  const [handleSetOrderBy, order, orderBy] = useSort(
    sortKeys,
    defaultSortKey,
    filterData,
    setFilterData,
  );

  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (location.state?.isNetsuiteOrder === 1) setTabValue(1);

    const search = getInitFilter(isCompanyOrder, isB2BUser);
    if (isB2BUser) {
      search.companyIds = [Number(selectCompanyHierarchyId) || Number(currentCompanyId)];
    }
    setFilterData(search);
    // setIsAutoRefresh(true);
    if (role === 100) return;

    const initFilter = async () => {
      const createdByUsers =
        isB2BUser && isCompanyOrder ? await getOrdersCreatedByUser(Number(companyId), 0) : {};

      const orderStatuses = isB2BUser ? await getOrderStatusType() : await getBcOrderStatusType();

      const filterInfo = getFilterMoreData(
        isB2BUser,
        role,
        isCompanyOrder,
        isAgenting,
        createdByUsers,
        orderStatuses,
      );
      setOrderStatuses(orderStatuses);

      const filterInfoWithTranslatedLabel = filterInfo.map((element) => {
        const translatedElement = element;
        translatedElement.label = b3Lang(element.idLang);

        if (element.name === 'orderStatus') {
          translatedElement.options = element.options.map(
            (option: { customLabel: string; systemLabel: string }) => {
              const optionLabel = orderStatusTranslationVariables[option.systemLabel];
              const elementOption = option;
              elementOption.customLabel =
                b3Lang(optionLabel) === elementOption.systemLabel
                  ? elementOption.customLabel
                  : b3Lang(optionLabel);

              return option;
            },
          );
        }

        return element;
      });

      setFilterInfo(filterInfoWithTranslatedLabel);
    };

    initFilter();
    // disabling as we only need to run this once and values at starting render are good enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectCompanyHierarchyId]);

  const fetchList: GetRequestList<Partial<FilterSearchProps>, ListItem> = async (params) => {
    const { edges = [], totalCount } = isB2BUser
      ? await getB2BAllOrders(params)
      : await getBCAllOrders(params);

    setAllTotal(totalCount);
    // setIsAutoRefresh(false);
    return {
      edges,
      totalCount,
    };
  };

  // CAUSING ERROR AND IT USES IS UNKNOWN
  // useEffect(() => {
  //   fetchList;
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [tabValue]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const navigate = useNavigate();

  const goToDetail = (item: ListItem, index: number) => {
    navigate(`/orderDetail/${item.orderId}`, {
      state: {
        currentIndex: index,
        searchParams: filterData,
        totalCount: allTotal,
        isCompanyOrder,
        beginDateAt: filterData?.beginDateAt,
        endDateAt: filterData?.endDateAt,
      },
    });
  };

  const columnAllItems: TableColumnItem<ListItem>[] = [
    {
      key: 'orderId',
      title: b3Lang('orders.order'),
      width: '10%',
      isSortable: true,
    },
    {
      key: 'companyName',
      title: b3Lang('orders.company'),
      width: '10%',
      isSortable: false,
      render: (item: ListItem) => {
        const { companyInfo } = item;

        return <Box>{companyInfo?.companyName || '–'}</Box>;
      },
    },
    {
      key: 'poNumber',
      title: b3Lang('orders.poReference'),
      render: (item: ListItem) => <Box>{item.poNumber ? item.poNumber : '–'}</Box>,
      width: '10%',
      isSortable: true,
    },
    {
      key: 'totalIncTax',
      title: b3Lang('orders.grandTotal'),
      render: (item: ListItem) =>
        item?.money
          ? ordersCurrencyFormat(JSON.parse(JSON.parse(item.money)), item.totalIncTax)
          : currencyFormat(item.totalIncTax),
      width: '8%',
      style: {
        textAlign: 'right',
      },
      isSortable: true,
    },
    {
      key: 'status',
      title: b3Lang('orders.orderStatus'),
      render: (item: ListItem) => (
        <OrderStatus text={getOrderStatusText(item.status, getOrderStatuses)} code={item.status} />
      ),
      width: '10%',
      isSortable: true,
    },
    {
      key: 'placedBy',
      title: b3Lang('orders.placedBy'),
      render: (item: ListItem) => `${item.firstName} ${item.lastName}`,
      width: '10%',
      isSortable: true,
    },
    {
      key: 'createdAt',
      title: b3Lang('orders.createdOn'),
      render: (item: ListItem) => `${displayFormat(Number(item.createdAt))}`,
      width: '10%',
      isSortable: true,
    },
  ];

  const getColumnItems = () => {
    const getNewColumnItems = columnAllItems.filter((item: { key: string }) => {
      const { key } = item;
      if (!isB2BUser && key === 'companyName') return false;
      if ((!isB2BUser || (Number(role) === 3 && !isAgenting)) && key === 'placedBy') return false;
      if (key === 'companyId' && isB2BUser && (Number(role) !== 3 || isAgenting)) return false;
      if (
        (key === 'companyId' || key === 'placedBy') &&
        !(Number(role) === 3 && !isAgenting) &&
        !isCompanyOrder
      )
        return false;
      return true;
    });

    return getNewColumnItems;
  };

  const handleChange = (key: string, value: string) => {
    if (key === 'search') {
      setFilterData({
        ...filterData,
        q: value,
      });
    }
  };

  const handleFilterChange = (value: unknown) => {
    const filterValue = value as SearchChangeProps; // Explicitly cast 'value' to 'SearchChangeProps'

    let currentStatus = filterValue?.orderStatus || '';
    if (currentStatus && Array.isArray(getOrderStatuses)) {
      const originStatus = getOrderStatuses.find(
        (status) => status.customLabel === currentStatus || status.systemLabel === currentStatus,
      );

      currentStatus = originStatus?.systemLabel || currentStatus;
    }

    const search: Partial<FilterSearchProps> = {
      beginDateAt: filterValue?.startValue || null,
      endDateAt: filterValue?.endValue || null,
      createdBy: filterValue?.PlacedBy || '',
      statusCode: currentStatus,
      companyName: filterValue?.company || '',
    };

    setFilterData((prevFilterData) => ({
      ...prevFilterData,
      ...search,
    }));
  };

  const columnItems = getColumnItems();

  // const handleSelectCompanies = (company: number[]) => {
  //   const newCompanyIds = company.includes(-1) ? [] : company;

  //   setFilterData({
  //     ...filterData,
  //     companyIds: newCompanyIds,
  //   });
  // };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="order tab">
          <Tab label="Web Orders" />
          <Tab label="All Orders / Returns" />
        </Tabs>
      </Box>

      {tabValue === 0 ? (
        <B3Spin isSpinning={isRequestLoading}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <B3Filter
              // sortByConfig={sortByConfigData}
              startPicker={{
                isEnabled: true,
                label: b3Lang('orders.from'),
                defaultValue: filterData?.beginDateAt || null,
                pickerKey: 'start',
              }}
              endPicker={{
                isEnabled: true,
                label: b3Lang('orders.to'),
                defaultValue: filterData?.endDateAt || null,
                pickerKey: 'end',
              }}
              filterMoreInfo={filterInfo}
              handleChange={handleChange}
              handleFilterChange={handleFilterChange}
            />
            <B3PaginationTable
              columnItems={columnItems}
              rowsPerPageOptions={[10, 20, 30]}
              getRequestList={fetchList}
              searchParams={filterData || {}}
              isCustomRender={false}
              requestLoading={setIsRequestLoading}
              tableKey="orderId"
              sortDirection={order}
              orderBy={orderBy}
              sortByFn={handleSetOrderBy}
              renderItem={(row: ListItem, index?: number) => (
                <OrderItemCard
                  key={row.orderId}
                  item={row}
                  index={index}
                  allTotal={allTotal}
                  filterData={filterData}
                  isCompanyOrder={isCompanyOrder}
                />
              )}
              onClickRow={(item: ListItem, index?: number) => {
                if (index !== undefined) {
                  goToDetail(item, index);
                }
              }}
              hover
            />
          </Box>
        </B3Spin>
      ) : (
        <NetsuiteOrders companyId={companyB2BId} isCompanyOrder={isCompanyOrder} />
      )}
    </Box>
  );
}

export default Order;
