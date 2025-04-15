import { useEffect, useMemo, useState } from 'react';
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
import throttle from 'lodash-es/throttle';

import CustomButton from '@/components/button/CustomButton';
import B3Spin from '@/components/spin/B3Spin';
import { useMobile } from '@/hooks';
import OrderStatus from '@/pages/order/components/OrderStatus';
import OrderDialog from '@/pages/OrderDetail/components/netsuite/OrderDialog';
import { getCustomData } from '@/shared/service/b2b';
import { isB2BUserSelector, useAppSelector } from '@/store';

const headCells = [
  {
    id: 'bcOrderNum',
    numeric: true,
    disablePadding: false,
    label: 'BC Order Number',
  },
  {
    id: 'orderNumber',
    numeric: true,
    disablePadding: true,
    label: 'Invoice Number',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Status',
  },
  {
    id: 'date',
    numeric: false,
    disablePadding: false,
    label: 'CreatedAt',
  },
  {
    id: 'printLink',
    numeric: false,
    disablePadding: false,
    label: 'Action',
  },
];

const dateFormat = (date: any) => {
  const itemDate = new Date(date).toLocaleString('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return itemDate;
};

interface DialogData {
  dialogTitle: string;
  type: string;
  description: string;
  confirmText: string;
}

type Invoice = {
  id: string;
  nsOrderInternalID: string;
  bcOrderNum: string;
  orderNumber: string;
  status: string;
  date: string;
  printLink: string;
};

interface InvoiceListData {
  id: string;
  nsOrderInternalID: string;
  bcOrderNum: string;
  orderNumber: string;
  status: string;
  date: string;
  printLink: string;
}

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

function CustomInvoice() {
  const [isMobile] = useMobile();
  const b3Lang = useB3Lang();
  const customerId = useAppSelector(({ company }) => company.customer.id);
  const isB2BUser = useAppSelector(isB2BUserSelector);
  const companyB2BId = useAppSelector(({ company }) => company.companyInfo.id);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [invoices, setInvoices] = useState<InvoiceListData[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<string>('');
  const [isRequestLoading, setIsRequestLoading] = useState(true);
  const [nsId, setNsId] = useState<string | undefined>(undefined);
  const [currentDialogData, setCurrentDialogData] = useState<DialogData>();

  const dialogData = [
    {
      dialogTitle: b3Lang('orderDetail.orderCard.invoice'),
      type: 'invoice',
      description: b3Lang('orderDetail.orderCard.invoiceDescription'),
      confirmText: b3Lang('orderDetail.orderCard.invoiceConfirmText'),
    },
  ];

  useEffect(() => {
    const loadInvoices = async () => {
      const data = [
        {
          order_id: 0,
          customer_id: isB2BUser ? companyB2BId.toString() : customerId.toString(),
          return_reason: [],
          line_items: [],
          invID: 0,
          submitType: 'invoices',
        },
      ];

      const fn = await getCustomData(data);
      const customInvoices = await fn;

      setInvoices(customInvoices);
      setTotalInvoices(customInvoices?.length || 0);
      setRowsPerPage(10);
      setPage(0);

      setIsRequestLoading(false);
    };

    loadInvoices();
  }, [customerId, companyB2BId, isB2BUser]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalInvoices) : 0;

  const invoicesList = useMemo(
    () => invoices?.[0] && invoices?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, invoices],
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (name: string, printLink?: string, invId?: string) => {
    if (name === 'printInvoice') {
      const url = printLink;
      window.open(url, 'blank');
    }
    if (name === 'invoice') {
      setOpen(true);
      setType(name);
      const newDialogData = dialogData.find((data: DialogData) => data.type === name);
      setCurrentDialogData(newDialogData);
      if (invId) setNsId(invId);
    } else {
      // if (!isAgenting) {
      //     snackbar.error(b3Lang('orderDetail.invoice.noInvince'));
      //     return;
      // }
    }
  };

  return (
    <B3Spin isSpinning={isRequestLoading}>
      <Paper sx={isMobile ? { boxShadow: 'unset' } : { width: '100%' }}>
        {isMobile ? (
          invoicesList?.map((data: any) => {
            return (
              <Box
                key={data.nsOrderInternalID}
                onClick={() => handleOpenDialog(data.nsOrderInternalID)}
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
                    INVOICE#: {data.orderNumber}
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
                    <CustomButton
                      value={b3Lang('orderDetail.printInvoice')}
                      key={b3Lang('orderDetail.printInvoice')}
                      name="printInvoice"
                      variant="outlined"
                      onClick={throttle(() => {
                        handleOpenDialog('printInvoice', data?.printLink);
                      }, 2000)}
                    >
                      {b3Lang('orderDetail.printInvoice')}
                    </CustomButton>
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
            <Table aria-labelledby="invoices" size="medium">
              <EnhancedTableHead />
              <TableBody>
                {invoicesList?.length > 0 ? (
                  invoicesList?.map((data: Invoice) => {
                    return (
                      <TableRow
                        hover
                        onClick={throttle(() => {
                          handleOpenDialog('invoice', '', data?.nsOrderInternalID);
                        }, 2000)}
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
                        <TableCell align="center">{dateFormat(data.date)}</TableCell>
                        <TableCell align="center">
                          <CustomButton
                            value={b3Lang('orderDetail.printInvoice')}
                            key={b3Lang('orderDetail.printInvoice')}
                            name="printInvoice"
                            variant="outlined"
                            onClick={throttle(() => {
                              handleOpenDialog('printInvoice', data?.printLink);
                            }, 2000)}
                          >
                            {b3Lang('orderDetail.printInvoice')}
                          </CustomButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow
                    style={{
                      height: 53 * emptyRows,
                    }}
                  >
                    <TableCell align="center" colSpan={5} sx={{ fontSize: '16px' }}>
                      {b3Lang('orderDetail.invoice.noInvince')}
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
          count={totalInvoices}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <OrderDialog
          open={open}
          products={[]}
          currentDialogData={currentDialogData}
          type={type}
          setOpen={setOpen}
          orderId={Number(nsId)}
        />
      </Paper>
    </B3Spin>
  );
}

export default CustomInvoice;
