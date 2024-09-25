import { Fragment, useState } from 'react';
import { useB3Lang } from '@b3/lang';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import throttle from 'lodash-es/throttle';

import CustomButton from '@/components/button/CustomButton';
import { useAppSelector } from '@/store';
import { snackbar } from '@/utils';

import OrderDialog from './OrderDialog';

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

export default function OrderAction(nsItemDetails: any) {
  const role = useAppSelector(({ company }) => company.customer.role);

  const b3Lang = useB3Lang();

  const buttons: Buttons[] = [
    {
      value: b3Lang('orderDetail.returnRMA'),
      key: 'Return',
      name: 'return',
      variant: 'contained',
      isCanShow: true,
    },
  ];

  const isAgenting = useAppSelector(({ b2bFeatures }) => b2bFeatures.masqueradeCompany.isAgenting);

  const dialogData = [
    {
      dialogTitle: b3Lang('orderDetail.orderCard.return'),
      type: 'return',
      description: b3Lang('orderDetail.orderCard.returnDescription'),
      confirmText: b3Lang('orderDetail.orderCard.returnConfirmText'),
    },
  ];

  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<string>('');
  const [currentDialogData, setCurrentDialogData] = useState<DialogData>();
  const isShowButtons = buttons.filter((btn) => btn.isCanShow).length > 0;
  const { itemDetails } = nsItemDetails;
  const { nsOrderInternalID, lines } = itemDetails;

  if (!nsOrderInternalID) {
    return null;
  }

  const handleOpenDialog = (name: string) => {
    if (!isAgenting && +role === 3) {
      snackbar.error(b3Lang('orderDetail.orderCard.errorMasquerade'));
      return;
    }

    setOpen(true);
    setType(name);

    const newDialogData = dialogData.find((data: DialogData) => data.type === name);

    setCurrentDialogData(newDialogData);
  };

  return (
    <Box
      sx={{
        marginBottom: '1rem',
      }}
    >
      <Box
        sx={{
          padding: '0rem 1rem 0 1rem',
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
                    handleOpenDialog(button.name);
                  }, 2000)}
                >
                  {button.value}
                </CustomButton>
              )}
            </Fragment>
          ))}
      </StyledCardActions>

      <OrderDialog
        open={open}
        products={lines}
        currentDialogData={currentDialogData}
        type={type}
        setOpen={setOpen}
        orderId={nsOrderInternalID}
      />
    </Box>
  );
}
