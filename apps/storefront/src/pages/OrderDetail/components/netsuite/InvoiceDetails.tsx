import { Fragment, useEffect, useState } from 'react';
import { useB3Lang } from '@b3/lang';
import { Box, Divider, Typography } from '@mui/material';
import throttle from 'lodash-es/throttle';

import CustomButton from '@/components/button/CustomButton';
import B3Spin from '@/components/spin/B3Spin';
import OrderStatus from '@/pages/order/components/OrderStatus';
import { getNSReturnDetails } from '@/shared/service/b2b/graphql/orders';
import { useAppSelector } from '@/store';

interface InvoiceDetail {
  nsInternalId: string;
}

interface InvoiceList {
  id: string;
  nsOrderInternalID: string;
  orderNumber: string;
  bcOrderNum: string;
  status: string;
  date: string;
  lines: InvoiceLine[];
  printLink: string;
}

interface InvoiceLine {
  lineKey: string;
  itemInternalID: string;
  sku: string;
  descr: string;
  quantity: string;
  rate: string;
  amount: string;
}

export default function InvoiceDetails(props: InvoiceDetail) {
  const b3Lang = useB3Lang();
  const { nsInternalId } = props;
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [invoiceList, setInvoiceList] = useState<InvoiceList | null>(null);
  const customerId = useAppSelector(({ company }) => company.customer.id);

  useEffect(() => {
    const getReturnDetails = async () => {
      const id = parseInt(nsInternalId, 10);
      if (!id) return;

      setIsRequestLoading(true);

      try {
        const data = [
          {
            order_id: 0,
            customer_id: customerId.toString(),
            return_reason: [],
            line_items: [],
            submitType: 'invoice',
            invID: nsInternalId,
          },
        ];

        const req = getNSReturnDetails(data);
        const nsDetails = await req;

        setInvoiceList(nsDetails);
      } catch (err) {
        setIsRequestLoading(false);
      } finally {
        setIsRequestLoading(false);
      }
    };

    getReturnDetails();
  }, [nsInternalId, customerId]);

  const handleOpenDialog = (name: string, printLink?: string) => {
    if (name === 'printInvoice') {
      const url = printLink;
      window.open(url, 'blank');
    }
  };

  const invoice_data = [
    {
      key: 'invoiceNumber',
      name: 'Invoice Number:',
      value: invoiceList?.orderNumber,
    },
    {
      key: 'bcOrderNum',
      name: 'Order Number:',
      value: invoiceList?.bcOrderNum,
    },
    {
      key: 'date',
      name: 'Date created:',
      value: invoiceList?.date,
    },
  ];

  const invoice_line = [
    {
      key: 'sku',
      value: 'SKU',
    },
    {
      key: 'descr',
      value: 'Description',
    },
    {
      key: 'quantity',
      value: 'Quantity',
    },
    {
      key: 'rate',
      value: 'Rate',
    },
    {
      key: 'amount',
      value: 'Amount',
    },
  ];

  return (
    <B3Spin isSpinning={isRequestLoading} background="rgba(255,255,255,0.2)">
      {invoiceList && (
        <Box
          sx={{
            overflow: 'auto',
            flex: 1,
          }}
        >
          <Box
            sx={{
              marginBottom: '10px',
              width: '100%',
            }}
          >
            <Fragment key={`invoice-line-${invoiceList?.orderNumber}`}>
              <Box
                sx={{
                  margin: '0px 0 2px',
                }}
              >
                {invoice_data.map((item) => (
                  <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: '400' }}
                      key={`item-line-${item.name}`}
                    >
                      {item.name} {'   '} {item.value} {'   '}{' '}
                      {item.key === 'invoiceNumber' && invoiceList?.status && (
                        <OrderStatus code={invoiceList?.status} />
                      )}
                    </Typography>
                    {item.key === 'invoiceNumber' && (
                      <CustomButton
                        value={b3Lang('orderDetail.printInvoice')}
                        key={b3Lang('orderDetail.printInvoice')}
                        name="printInvoice"
                        variant="contained"
                        onClick={throttle(() => {
                          handleOpenDialog('printInvoice', invoiceList?.printLink);
                        }, 2000)}
                      >
                        {b3Lang('orderDetail.printInvoice')}
                      </CustomButton>
                    )}
                  </Box>
                ))}

                {invoiceList?.lines &&
                  invoiceList?.lines?.length > 0 &&
                  invoiceList?.lines.map((item) => (
                    <Box
                      key={item?.lineKey}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '10px',
                        background: '#',
                      }}
                    >
                      <Divider
                        sx={{
                          marginBottom: '1rem',
                          marginTop: '0.5rem',
                        }}
                      />
                      {invoice_line.map((line) => (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'left',
                            gap: '1rem',
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: '500', width: '90px' }}>
                            {line.value}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: '400' }}>
                            {line.key === 'rate' || line.key === 'amount' ? '$' : ''}
                            {item[line.key as keyof InvoiceLine]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ))}
              </Box>
            </Fragment>
          </Box>
        </Box>
      )}
    </B3Spin>
  );
}
