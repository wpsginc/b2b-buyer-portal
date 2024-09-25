import { useEffect, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useB3Lang } from '@b3/lang';
import { Box, Typography } from '@mui/material';

import { B3CustomForm } from '@/components';
import B3Dialog from '@/components/B3Dialog';
import { useMobile } from '@/hooks';
import { createNSReturn } from '@/shared/service/b2b/graphql/orders';
import { isB2BUserSelector, useAppSelector } from '@/store';
import { snackbar } from '@/utils';
import b2bLogger from '@/utils/b3Logger';

import { EditableQty, OrderItemList } from '../../../../types';

import getReturnFormFields from './config';
import OrderCheckboxProduct from './OrderCheckboxProduct';

interface ReturnListProps {
  lineKey: number;
  quantityToReturn: number;
  returnableQty: number;
}

interface DialogData {
  dialogTitle: string;
  type: string;
  description: string;
  confirmText: string;
}

interface OrderDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  products?: OrderItemList[];
  type?: string;
  currentDialogData?: DialogData;
  orderId: number;
}

export default function OrderDialog({
  open,
  products = [],
  type,
  currentDialogData = undefined,
  setOpen,
  orderId,
}: OrderDialogProps) {
  const isB2BUser = useAppSelector(isB2BUserSelector);
  const [editableProducts, setEditableProducts] = useState<EditableQty[]>([]);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [checkedArr, setCheckedArr] = useState<number[]>([]);
  const [returnArr, setReturnArr] = useState<ReturnListProps[]>([]);
  const customerId = useAppSelector(({ company }) => company.customer.id);

  const [returnFormFields] = useState(getReturnFormFields());

  const [isMobile] = useMobile();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setValue,
  } = useForm({
    mode: 'all',
  });

  const b3Lang = useB3Lang();

  const handleClose = () => {
    setOpen(false);
  };

  const sendReturnRequest = async (
    returnReason: FieldValues,
    returnArr: ReturnListProps[],
    orderId: number,
  ) => {
    if (!Object.keys(returnReason).length || !returnArr.length) {
      snackbar.error(b3Lang('purchasedProducts.error.selectOneItem'));
      return;
    }

    try {
      setIsRequestLoading(true);

      const data = [
        {
          order_id: orderId,
          customer_id: customerId,
          return_reason: returnReason?.return_reason,
          line_items: returnArr,
        },
      ];

      const validateZero = data[0]?.line_items.filter((items) => items.quantityToReturn === 0);
      const validateReturnable = data[0]?.line_items.filter(
        (items) => items.quantityToReturn > items.returnableQty,
      );
      if (validateZero.length > 0) {
        snackbar.error(b3Lang('purchasedProducts.error.rmaReturnQtyZero'));
        setIsRequestLoading(false);
        return;
      }

      if (validateReturnable.length > 0) {
        snackbar.error(b3Lang('purchasedProducts.error.rmaReturnableQty'));
        setIsRequestLoading(false);
        return;
      }

      const req = createNSReturn(data);
      const postReturn = await req;

      if (postReturn?.rmaID && postReturn?.rmaNumber) {
        snackbar.success(b3Lang('purchasedProducts.success.rmaSuccessfulApplication'));
      } else {
        snackbar.error(b3Lang('purchasedProducts.success.rmaErrorApplication'));
      }

      setIsRequestLoading(false);
      handleClose();
    } catch (err) {
      b2bLogger.error(err);
    }
  };

  const handleReturn = () => {
    handleSubmit((data) => {
      sendReturnRequest(data, returnArr, orderId);
    })();
  };

  const handleSaveClick = () => {
    if (checkedArr.length === 0) {
      snackbar.error(b3Lang('purchasedProducts.error.selectOneItem'));
    } else if (type === 'return') {
      handleReturn();
    }
  };

  useEffect(() => {
    if (!open) return;
    setEditableProducts(
      products.map((item: OrderItemList) => ({
        ...item,
        editQuantity: item.quantity,
      })),
    );
  }, [isB2BUser, open, products]);

  const handleProductChange = (products: EditableQty[]) => {
    setEditableProducts(products);
  };

  return (
    <Box
      sx={{
        ml: 3,
        width: '50%',
      }}
    >
      <B3Dialog
        isOpen={open}
        fullWidth
        handleLeftClick={handleClose}
        handRightClick={handleSaveClick}
        title={currentDialogData?.dialogTitle || ''}
        rightSizeBtn={currentDialogData?.confirmText || 'Save'}
        maxWidth="md"
        loading={isRequestLoading}
      >
        <Typography
          sx={{
            margin: isMobile ? '0 0 1rem' : '1rem 0',
          }}
        >
          {currentDialogData?.description || ''}
        </Typography>
        <OrderCheckboxProduct
          products={editableProducts}
          onProductChange={handleProductChange}
          setCheckedArr={setCheckedArr}
          setReturnArr={setReturnArr}
          textAlign={isMobile ? 'left' : 'right'}
          type={type}
        />

        {type === 'return' && (
          <>
            <Typography
              variant="body1"
              sx={{
                margin: '20px 0',
              }}
            >
              {b3Lang('purchasedProducts.orderDialog.aditionalInformation')}
            </Typography>
            <B3CustomForm
              formFields={returnFormFields}
              errors={errors}
              control={control}
              getValues={getValues}
              setValue={setValue}
            />
          </>
        )}
      </B3Dialog>
    </Box>
  );
}
