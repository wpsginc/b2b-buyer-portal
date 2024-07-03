import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { useB3Lang } from '@b3/lang';
import { Box, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';

import { PRODUCT_DEFAULT_IMAGE } from '@/constants';
import { useMobile } from '@/hooks';
import { snackbar } from '@/utils';

import { EditableQty } from '../../../../types';
import {
  defaultItemStyle,
  Flex,
  FlexItem,
  mobileItemStyle,
  ProductHead,
  ProductImage,
} from '../../styled';

interface ReturnListProps {
  lineKey: number;
  quantityToReturn: number;
}

interface OrderCheckboxProductProps {
  products: EditableQty[];
  getProductQuantity?: (item: EditableQty) => number;
  onProductChange?: (products: EditableQty[]) => void;
  setCheckedArr?: (items: number[]) => void;
  setReturnArr?: (items: ReturnListProps[]) => void;
  textAlign?: string;
  type?: string;
}

export default function OrderCheckboxProduct(props: OrderCheckboxProductProps) {
  const {
    products,
    getProductQuantity = (item) => item.editQuantity,
    onProductChange = () => {},
    setCheckedArr = () => {},
    setReturnArr = () => {},
    textAlign = 'left',
    type,
  } = props;

  const b3Lang = useB3Lang();

  const [isMobile] = useMobile();

  const [list, setList] = useState<number[]>([]);

  const [returnList, setReturnList] = useState<ReturnListProps[]>([]);

  const itemStyle = isMobile ? mobileItemStyle : defaultItemStyle;

  const handleSelectAllChange = () => {
    const newlist = [...list];
    if (newlist.length === products.length) {
      setList([]);
      setReturnList([]);
    } else {
      const variantIds = products.map((item) => item.lineKey);
      const returnIds: ReturnListProps[] = [];
      products.forEach((item, index) => {
        returnIds[index] = {
          lineKey: item.lineKey,
          quantityToReturn: +item.editQuantity,
        };
      });

      setList(variantIds);
      setReturnList(returnIds);
    }
  };

  const handleSelectChange = (lineKey: number, quantityToReturn: number) => {
    const newlist = [...list];
    const newReturnList = [...returnList];
    const index = newlist.findIndex((item) => item === lineKey);
    const returnIndex = newReturnList.findIndex((item) => item.lineKey === lineKey);
    if (index !== -1) {
      newlist.splice(index, 1);
      newReturnList.splice(returnIndex, 1);
    } else {
      newlist.push(lineKey);
      newReturnList.push({
        lineKey,
        quantityToReturn,
      });
    }
    setList(newlist);
    setReturnList(newReturnList);
  };

  const isChecked = (lineKey: number) => list.includes(lineKey);

  const handleProductQuantityChange =
    (product: EditableQty) => (e: ChangeEvent<HTMLInputElement>) => {
      const element = product;
      const valueNum = e.target.value;
      if (+valueNum >= 0 && +valueNum <= 1000000) {
        element.editQuantity = valueNum;
        if (type === 'return') {
          if (+valueNum > +product.quantity) {
            element.editQuantity = product.returnableQuantity;
            snackbar.error(
              b3Lang('purchasedProducts.error.returnedQuantityShouldBeWithinThePurchase'),
            );
          } else {
            returnList.forEach((listItem) => {
              const item = listItem;
              if (item.lineKey === product.lineKey) {
                item.quantityToReturn = +valueNum;
              }
            });
            setReturnArr(returnList);
          }
        }
        onProductChange([...products]);
      }
    };

  const handleNumberInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['KeyE', 'Equal', 'Minus'].indexOf(event.code) > -1) {
      event.preventDefault();
    }
  };

  const handleNumberInputBlur = (product: EditableQty) => () => {
    const editableProduct = product;
    if (!product.editQuantity || +product.editQuantity === 0) {
      editableProduct.editQuantity = '1';
      onProductChange([...products]);
    }
  };

  useEffect(() => {
    setCheckedArr(list);
    // Disabling this line as this dispatcher does not need to be in the dep array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  useEffect(() => {
    setReturnArr(returnList);
    // Disabling this line as this dispatcher does not need to be in the dep array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnList]);

  return products.length > 0 ? (
    <Box>
      {!isMobile && (
        <Flex isHeader isMobile={isMobile}>
          <Checkbox checked={list.length === products.length} onChange={handleSelectAllChange} />
          <FlexItem>
            <ProductHead>{b3Lang('purchasedProducts.product')}</ProductHead>
          </FlexItem>
          <FlexItem textAlignLocation={textAlign} {...itemStyle.default}>
            <ProductHead>{b3Lang('global.searchProduct.qty')}</ProductHead>
          </FlexItem>
          <FlexItem textAlignLocation={textAlign} {...itemStyle.default}>
            <ProductHead>{b3Lang('global.searchProduct.returnable')}</ProductHead>
          </FlexItem>
        </Flex>
      )}

      {isMobile && (
        <FormControlLabel
          label="Select all products"
          control={
            <Checkbox checked={list.length === products.length} onChange={handleSelectAllChange} />
          }
          sx={{
            paddingLeft: '0.6rem',
          }}
        />
      )}

      {products.map((product: EditableQty) => (
        <Flex isMobile={isMobile} key={product.sku}>
          <Checkbox
            checked={isChecked(product.lineKey)}
            onChange={() => handleSelectChange(product.lineKey, +product.editQuantity)}
          />
          <FlexItem>
            <ProductImage src={PRODUCT_DEFAULT_IMAGE} />
            <Box
              sx={{
                marginLeft: '16px',
              }}
            >
              <Typography variant="body1" color="#212121">
                {product.descr}
              </Typography>
              <Typography variant="body1" color="#616161">
                {product.sku}
              </Typography>
            </Box>
          </FlexItem>
          <FlexItem textAlignLocation={textAlign} padding="10px 0 0" {...itemStyle.default}>
            {isMobile && <span>{b3Lang('purchasedProducts.orderCheckboxProduct.price')} </span>}
            {product.quantity}
          </FlexItem>
          <FlexItem textAlignLocation={textAlign} {...itemStyle.default}>
            <TextField
              type="number"
              variant="filled"
              hiddenLabel={!isMobile}
              label={isMobile ? b3Lang('purchasedProducts.orderCheckboxProduct.qty') : ''}
              value={getProductQuantity(product)}
              onChange={handleProductQuantityChange(product)}
              onKeyDown={handleNumberInputKeyDown}
              onBlur={handleNumberInputBlur(product)}
              size="small"
              sx={{
                width: isMobile ? '60%' : '80px',
                '& .MuiFormHelperText-root': {
                  marginLeft: '0',
                  marginRight: '0',
                },
              }}
              error={!!product.helperText}
              helperText={product.helperText}
            />
          </FlexItem>
        </Flex>
      ))}
    </Box>
  ) : null;
}
