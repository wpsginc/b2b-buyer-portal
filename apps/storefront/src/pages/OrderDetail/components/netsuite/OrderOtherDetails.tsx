import { Fragment, useContext, useEffect, useState } from 'react';
import { useB3Lang } from '@b3/lang';
import styled from '@emotion/styled';
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import throttle from 'lodash-es/throttle';

import CustomButton from '@/components/button/CustomButton';
import { useAppSelector } from '@/store';
import { snackbar } from '@/utils';

import { NSOrderDetailsContext } from '../context/NSOrderDetailsContext';

import OrderDialog from './OrderDialog';

const OrderActionContainer = styled('div')(() => ({}));

interface StyledCardActionsProps {
  isShowButtons: boolean;
}

const StyledCardActions = styled('div')<StyledCardActionsProps>((props) => ({
  flexWrap: 'wrap',
  padding: props.isShowButtons ? '0 1rem 1rem 1rem' : 0,

  '& button': {
    marginLeft: '0',
    marginRight: '8px',
    margin: '8px 8px 0 0',
  },
}));

interface Buttons {
  value: string;
  key: string;
  name: string;
  variant?: 'text' | 'contained' | 'outlined';
  isCanShow: boolean;
}

interface DialogData {
  dialogTitle: string;
  type: string;
  description: string;
  confirmText: string;
}

const ItemContainer = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  fontWeight: 400,
  gap: '1rem',

  '& p': {
    marginTop: 1,
    marginBottom: '0',
    lineHeight: 1.2,
  },
}));

export default function OrderOtherDetails() {
  const b3Lang = useB3Lang();

  const buttons: Buttons[] = [
    {
      value: b3Lang('orderDetail.printSO'),
      key: 'Print Sales Order',
      name: 'printSalesOrder',
      variant: 'contained',
      isCanShow: true,
    },
    {
      value: b3Lang('orderDetail.return'),
      key: 'Return',
      name: 'return',
      variant: 'outlined',
      isCanShow: true,
    },
  ];

  const dialogData = [
    {
      dialogTitle: b3Lang('orderDetail.orderCard.return'),
      type: 'return',
      description: b3Lang('orderDetail.orderCard.returnDescription'),
      confirmText: b3Lang('orderDetail.orderCard.returnConfirmText'),
    },
    {
      dialogTitle: b3Lang('orderDetail.orderCard.invoice'),
      type: 'invoice',
      description: b3Lang('orderDetail.orderCard.invoiceDescription'),
      confirmText: b3Lang('orderDetail.orderCard.invoiceConfirmText'),
    },
  ];

  const isAgenting = useAppSelector(({ b2bFeatures }) => b2bFeatures.masqueradeCompany.isAgenting);
  const role = useAppSelector(({ company }) => company.customer.role);
  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<string>('');
  const [nsId, setNsId] = useState<string | undefined>(undefined);
  const [currentDialogData, setCurrentDialogData] = useState<DialogData>();
  const isShowButtons = buttons.filter((btn) => btn.isCanShow).length > 0;

  const {
    state: {
      nsOrderInternalID,
      bcOrderNum,
      date,
      orderNumber,
      printLink,
      lines = [],
      invList = [],
    },
  } = useContext(NSOrderDetailsContext);

  useEffect(() => {
    setNsId(nsOrderInternalID);
  }, [nsOrderInternalID]);

  const handleOpenDialog = (name: string, printLink?: string, invId?: string) => {
    if (name === 'printSalesOrder') {
      const url = printLink;
      window.open(url, 'blank');
    } else if (name === 'return' || (name === 'invoice' && invId !== '')) {
      setOpen(true);
      setType(name);
      const newDialogData = dialogData.find((data: DialogData) => data.type === name);
      setCurrentDialogData(newDialogData);
      if (invId) setNsId(invId);
    } else if (!isAgenting && +role === 3) {
      snackbar.error(b3Lang('orderDetail.orderCard.errorMasquerade'));
    }
  };

  const otherDetails = [
    {
      name: 'Sales Order',
      value: orderNumber || '',
      key: 'orderNumber',
    },
    {
      name: 'Order Number',
      value: bcOrderNum || '',
      key: 'bcOrderNum',
    },
    {
      name: 'Date Created:',
      value: date || '',
      key: 'date',
    },
    {
      name: 'Invoice(s):',
      value: invList || [],
      key: 'invlist',
    },
  ];

  return (
    <OrderActionContainer>
      {nsOrderInternalID && (
        <>
          <Card
            sx={{
              marginBottom: '1rem',
            }}
          >
            <Box
              sx={{
                padding: '1rem 1rem 0 1rem',
              }}
            >
              <Typography variant="h5">{b3Lang('orderDetail.header')}</Typography>
            </Box>
            <CardContent>
              <Box
                sx={{
                  '& #item-name-key': {
                    maxWidth: '70%',
                    wordBreak: 'break-word',
                  },
                }}
              >
                {otherDetails.map((item) => (
                  <Fragment key={item.key}>
                    <ItemContainer key={item?.name}>
                      {typeof item.value === 'string' ? (
                        <>
                          <p id="item-name-key">{item?.name}</p>
                          <p id="item-key">{item.value}</p>
                        </>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: '5px',
                            width: '100%',
                          }}
                          key={item.key}
                        >
                          <Typography sx={{ fontSize: '18px', fontWeight: 700 }} key={item.key}>
                            {item.name}
                          </Typography>
                          {item.value.length > 0 &&
                            item.value.map((inv) => (
                              <Box
                                sx={{
                                  width: '100%',
                                  display: 'flex',
                                  gap: '1rem',
                                  cursor: 'pointer',
                                  color: '#585858',
                                }}
                                key={inv.invID}
                              >
                                <span
                                  role="button"
                                  id="item-name-key"
                                  tabIndex={0}
                                  onClick={throttle(() => {
                                    handleOpenDialog('invoice', '', inv?.invID);
                                  }, 2000)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      throttle(() => {
                                        handleOpenDialog('invoice', '', inv?.invID);
                                      }, 2000)();
                                    }
                                  }}
                                >
                                  {inv.invNumber}
                                </span>
                              </Box>
                            ))}

                          {item.value.length === 0 ? (
                            <p id="item-name-key">{b3Lang('orderDetail.invoice.noInvince')}</p>
                          ) : (
                            ''
                          )}
                        </Box>
                      )}
                    </ItemContainer>
                  </Fragment>
                ))}
              </Box>
            </CardContent>
            <Divider
              sx={{
                marginBottom: '1rem',
                marginTop: '0.5rem',
              }}
            />
            <StyledCardActions isShowButtons={isShowButtons}>
              {buttons &&
                buttons.map((button: Buttons) => (
                  <Fragment key={button.key}>
                    {button.isCanShow && (
                      <CustomButton
                        value={button.value}
                        key={button.key}
                        name={button.name}
                        variant={button.variant}
                        onClick={throttle(() => {
                          handleOpenDialog(button.name, printLink);
                        }, 2000)}
                      >
                        {button.value}
                      </CustomButton>
                    )}
                  </Fragment>
                ))}
            </StyledCardActions>
          </Card>

          <OrderDialog
            open={open}
            products={lines}
            currentDialogData={currentDialogData}
            type={type}
            setOpen={setOpen}
            orderId={type === 'invoice' ? Number(nsId) : Number(nsOrderInternalID)}
          />
        </>
      )}
    </OrderActionContainer>
  );
}
