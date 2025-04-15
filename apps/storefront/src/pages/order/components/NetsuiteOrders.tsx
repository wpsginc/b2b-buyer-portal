import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useB3Lang } from '@b3/lang';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';

import B3Spin from '@/components/spin/B3Spin';
import { useMobile } from '@/hooks';
import { getCustomData } from '@/shared/service/b2b';
import { useAppSelector } from '@/store';

import OrderStatus from './OrderStatus';

const headCells = [
  {
    id: 'bcOrderNum',
    numeric: true,
    disablePadding: false,
    label: 'BC Order Number',
  },
  {
    id: 'orderId',
    numeric: true,
    disablePadding: true,
    label: 'Order Number',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Status',
  },
  {
    id: 'returnable',
    numeric: false,
    disablePadding: false,
    label: 'Returnable',
  },
  {
    id: 'rmaNumber',
    numeric: false,
    disablePadding: false,
    label: 'RMA #',
  },
  {
    id: 'createdAt',
    numeric: false,
    disablePadding: false,
    label: 'CreatedAt',
  },
];

function EnhancedTableHead() {
  const [isMobile] = useMobile();

  return (
    <TableHead
      sx={
        isMobile
          ? { display: 'none' }
          : {
              display: 'table-header-group',
            }
      }
    >
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell align="center" key={headCell.id}>
            <TableSortLabel>{headCell.label}</TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export interface NetsuiteOrdersProps {
  companyId: string;
  isCompanyOrder: boolean;
}

export default function NetsuiteOrders({ companyId, isCompanyOrder }: NetsuiteOrdersProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [allTotal, setAllTotal] = useState(0);
  const [allOrders, setAllOrders] = useState([]);
  const [isRequestLoading, setIsRequestLoading] = useState(true);
  const customerId = useAppSelector(({ company }) => company.customer.id);

  const navigate = useNavigate();
  const [isMobile] = useMobile();
  const b3Lang = useB3Lang();

  useEffect(() => {
    const initializeOrders = async () => {
      const data = [
        {
          order_id: 0,
          customer_id: isCompanyOrder ? companyId || customerId.toString() : customerId.toString(),
          return_reason: [],
          line_items: [],
          submitType: 'get-orders',
        },
      ];

      const fn = await getCustomData(data);
      const nsOrders = await fn;
      const totalCount = nsOrders?.orders?.length;
      const orders = nsOrders?.orders;

      setAllOrders(orders);
      setAllTotal(totalCount || 0);
      setRowsPerPage(10);
      setPage(0);

      setIsRequestLoading(false);
    };

    initializeOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (id: number) => {
    navigate(`/orderDetail/ns-${id}`, {
      state: {
        currentIndex: 0,
        totalCount: allTotal,
        isCompanyOrder,
      },
    });
  };

  const dateFormat = (date: any) => {
    const itemDate = new Date(date).toLocaleString('default', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return itemDate;
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - allTotal) : 0;

  const visibleRows = useMemo(
    () => allOrders?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, allOrders],
  );

  return (
    <B3Spin isSpinning={isRequestLoading}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Paper sx={isMobile ? { boxShadow: 'unset' } : { width: '100%' }}>
          {isMobile ? (
            visibleRows?.map((data: any) => {
              return (
                <Box
                  key={data.nsOrderInternalID}
                  onClick={() => handleClick(data.nsOrderInternalID)}
                  sx={{
                    padding: '20px',
                    boxShadow: '0 5px 5px -6px #777',
                    marginBottom: '30px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                  >
                    <Box
                      sx={{
                        fontSize: '15px',
                        color: 'rgba(0, 0, 0, 0.6)',
                        marginTop: '0.5rem',
                      }}
                    >
                      Order#: {data.bcOrderNum ? data.bcOrderNum : '-'}
                    </Box>
                    <Box
                      sx={{
                        fontSize: '15px',
                        color: 'rgba(0, 0, 0, 0.6)',
                        marginTop: '0.5rem',
                      }}
                    >
                      <OrderStatus code={data.status} />
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                  >
                    <Box
                      sx={{
                        fontSize: '20px',
                        color: '#191819',
                        marginTop: '0.5rem',
                      }}
                    >
                      SO#: {data.orderNumber}
                    </Box>
                  </Box>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                  >
                    <Box
                      sx={{
                        fontSize: '15px',
                        color: 'rgba(0, 0, 0, 0.6)',
                        marginTop: '0.5rem',
                      }}
                    >
                      {data.returnable === true ? 'Returnable' : 'Non-Returnable'}
                    </Box>
                    <Box
                      sx={{
                        fontSize: '15px',
                        color: 'rgba(0, 0, 0, 0.6)',
                        marginTop: '0.5rem',
                      }}
                    >
                      {dateFormat(data.date)}
                    </Box>
                  </Box>
                </Box>
              );
            })
          ) : (
            <TableContainer>
              <Table aria-labelledby="netsuiteOrders" size="medium">
                <EnhancedTableHead />
                <TableBody>
                  {visibleRows?.length > 0 ? (
                    visibleRows?.map((data: any) => {
                      return (
                        <TableRow
                          hover
                          onClick={() => handleClick(data.nsOrderInternalID)}
                          role="checkbox"
                          tabIndex={-1}
                          key={data.nsOrderInternalID}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell align="center">
                            {data.bcOrderNum ? data.bcOrderNum : '-'}
                          </TableCell>
                          <TableCell align="center">{data.orderNumber}</TableCell>
                          <TableCell align="center">
                            <OrderStatus code={data.status} />
                          </TableCell>
                          <TableCell align="center">
                            {data.returnable === true ? 'Yes' : 'No'}
                          </TableCell>
                          <TableCell align="center">{data?.rma ? data.rma : '-'}</TableCell>
                          <TableCell align="center">{dateFormat(data.date)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow
                      style={{
                        height: 53 * emptyRows,
                      }}
                    >
                      <TableCell align="center" colSpan={6} sx={{ fontSize: '16px' }}>
                        {b3Lang('orderDetail.invoice.noOrders')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={allTotal}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </B3Spin>
  );
}
