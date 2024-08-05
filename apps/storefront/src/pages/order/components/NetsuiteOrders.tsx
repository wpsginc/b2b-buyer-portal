import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

import B3Spin from '@/components/spin/B3Spin';
import { getNSOrders } from '@/shared/service/b2b';
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
    id: 'createdAt',
    numeric: false,
    disablePadding: false,
    label: 'CreatedAt',
  },
];

function EnhancedTableHead() {
  return (
    <TableHead>
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

export default function NetsuiteOrders() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [allTotal, setAllTotal] = useState(0);
  const [allOrders, setAllOrders] = useState([]);
  const [isRequestLoading, setIsRequestLoading] = useState(true);
  const customerId = useAppSelector(({ company }) => company.customer.id);

  const navigate = useNavigate();

  useEffect(() => {
    const initializeOrders = async () => {
      const data = [
        {
          order_id: 0,
          customer_id: customerId,
          return_reason: [],
          line_items: [],
        },
      ];

      const fn = await getNSOrders(data);
      const nsOrders = await fn;
      const totalCount = nsOrders?.orders?.length;
      const orders = nsOrders?.orders;

      setAllOrders(orders);
      setAllTotal(totalCount ? totalCount : 0);
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

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - allTotal) : 0;

  const visibleRows = useMemo(
    () => allOrders?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, rowsPerPage],
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
        <Paper sx={{ width: '100%', mb: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
              <EnhancedTableHead />
              <TableBody>
                {visibleRows?.map((data: any) => {
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
                      <TableCell align="center">{dateFormat(data.date)}</TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: 53 * emptyRows,
                    }}
                  >
                    <TableCell colSpan={5} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
