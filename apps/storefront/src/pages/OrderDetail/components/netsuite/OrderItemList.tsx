import { useContext } from 'react';
import { useB3Lang } from '@b3/lang';
import styled from '@emotion/styled';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

import { PRODUCT_DEFAULT_IMAGE } from '@/constants';
import { useMobile } from '@/hooks';
import { useAppSelector } from '@/store';
import { OrderItemList } from '@/types';

import { ProductImage } from '../../styled';
import { NSOrderDetailsContext } from '../context/NSOrderDetailsContext';

interface FlexProps {
  isHeader?: boolean;
  isMobile?: boolean;
}

interface FlexItemProps {
  width?: string;
  padding?: string;
  textAlignLocation?: string;
  sx?: {
    [key: string]: string | number;
  };
}

const ProductHead = styled('div')(() => ({
  fontSize: '0.875rem',
  lineHeight: '1.5',
  color: '#263238',
}));

const Flex = styled('div')<FlexProps>(({ isHeader, isMobile }) => {
  const headerStyle = isHeader
    ? {
        borderBottom: '1px solid #D9DCE9',
        paddingBottom: '8px',
      }
    : {};

  const mobileStyle = isMobile
    ? {
        borderTop: '1px solid #D9DCE9',
        padding: '12px 0 12px',
        '&:first-of-type': {
          marginTop: '12px',
        },
      }
    : {};

  const flexWrap = isMobile ? 'wrap' : 'initial';

  return {
    color: '#212121',
    display: isMobile && isHeader ? 'none' : 'flex',
    wordBreak: 'break-word',
    padding: '8px 0 0',
    gap: '8px',
    flexWrap,
    alignItems: ' flex-start',
    ...headerStyle,
    ...mobileStyle,
  };
});

const FlexItem = styled('div')(
  ({ width, textAlignLocation, padding = '0', sx }: FlexItemProps) => ({
    display: 'flex',
    justifyContent: textAlignLocation,
    flexGrow: width ? 0 : 1,
    flexShrink: width ? 0 : 1,
    alignItems: 'center',
    width,
    padding,
    ...sx,
  }),
);

const defaultItemStyle = {
  default: {
    width: '10%',
  },
  qty: {
    width: '12%',
  },
};

const mobileItemStyle = {
  default: {
    width: '100%',
    padding: '0 0 0 76px',
  },
  qty: {
    width: '100%',
    padding: '0 0 0 76px',
  },
};

export default function NSOrderItemList() {
  const [isMobile] = useMobile();
  const b3Lang = useB3Lang();

  const {
    state: { lines = [] },
  } = useContext(NSOrderDetailsContext);

  const itemStyle = isMobile ? mobileItemStyle : defaultItemStyle;

  const customerName = useAppSelector(
    ({ company }) => `${company.customer.firstName} ${company.customer.lastName}`,
  );

  const companyName = useAppSelector(
    ({ company }) => `${company?.companyInfo?.id}-${company?.companyInfo?.companyName}`,
  );

  return (
    <Stack spacing={2}>
      {lines && lines.length > 0 && (
        <Card>
          <CardContent>
            <>
              <Box
                sx={{
                  margin: '20px 0 2px',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '24px',
                    fontWeight: '400',
                  }}
                >
                  {customerName} {' - '} {companyName}
                </Typography>
              </Box>
              <Box sx={{ borderBottom: '1px solid #D9DCE9', paddingBottom: '20px' }}>
                <Flex isHeader isMobile={isMobile}>
                  <FlexItem padding={isMobile ? '0' : '0 6% 0 1%'}>
                    <ProductHead>{b3Lang('global.searchProduct.product')}</ProductHead>
                  </FlexItem>
                  <FlexItem textAlignLocation="center" {...itemStyle.default}>
                    <ProductHead>{b3Lang('global.searchProduct.qty')}</ProductHead>
                  </FlexItem>
                  <FlexItem textAlignLocation="center" {...itemStyle.qty}>
                    <ProductHead>{b3Lang('global.searchProduct.returnable')}</ProductHead>
                  </FlexItem>
                  <FlexItem textAlignLocation="center" {...itemStyle.default}>
                    <ProductHead>{b3Lang('global.searchProduct.fulfilled')}</ProductHead>
                  </FlexItem>
                </Flex>

                {lines.map((list: OrderItemList) => (
                  <Flex isMobile={isMobile} key={list.lineKey}>
                    <FlexItem padding={isMobile ? '0' : '0 6% 0 0'}>
                      <ProductImage src={list?.bcData?.images || PRODUCT_DEFAULT_IMAGE} />
                      <Box
                        sx={{
                          marginLeft: '16px',
                        }}
                      >
                        <Typography variant="body1" color="#616161">
                          {list?.productSku}
                        </Typography>
                        <Box
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                          }}
                        >
                          <Typography
                            variant="body1"
                            color="#212121"
                            sx={{
                              cursor: 'pointer',
                            }}
                          >
                            {list?.bcData?.name}
                          </Typography>
                        </Box>
                      </Box>
                    </FlexItem>

                    <FlexItem
                      padding=""
                      {...itemStyle.default}
                      sx={
                        isMobile
                          ? {
                              fontSize: '14px',
                              justifyContent: 'left',
                            }
                          : {
                              justifyContent: 'center',
                            }
                      }
                    >
                      {isMobile && <span>{`${b3Lang('global.searchProduct.qty')} : `} </span>}{' '}
                      {list?.quantity}
                    </FlexItem>

                    <FlexItem
                      {...itemStyle.qty}
                      sx={
                        isMobile
                          ? {
                              fontSize: '14px',
                              justifyContent: 'left',
                            }
                          : {
                              justifyContent: 'center',
                            }
                      }
                    >
                      {isMobile && (
                        <span>{`${b3Lang('global.searchProduct.returnable')} : `} </span>
                      )}{' '}
                      {list?.returnableQuantity}
                    </FlexItem>

                    <FlexItem
                      padding=""
                      {...itemStyle.default}
                      sx={
                        isMobile
                          ? {
                              fontSize: '14px',
                              justifyContent: 'left',
                            }
                          : {
                              justifyContent: 'center',
                            }
                      }
                    >
                      {isMobile && <span>{`${b3Lang('global.searchProduct.fulfilled')} : `} </span>}{' '}
                      {list?.fulfilled}
                    </FlexItem>
                  </Flex>
                ))}
              </Box>
            </>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
