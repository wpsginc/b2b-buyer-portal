import { Fragment } from 'react'
import { useB3Lang } from '@b3/lang'
import styled from '@emotion/styled'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

import { useMobile } from '@/hooks'

import { useAppSelector } from '@/store'
import OrderAction from './OrderAction'
import { ProductImage } from '../../styled'
import { PRODUCT_DEFAULT_IMAGE } from '@/constants'

interface FlexProps {
    isHeader?: boolean
    isMobile?: boolean
  }
  
interface FlexItemProps {
  width?: string
  padding?: string
  textAlignLocation?: string
  sx?: {
    [key: string]: string | number
  }
}

const ProductHead = styled('div')(() => ({
    fontSize: '0.875rem',
    lineHeight: '1.5',
    color: '#263238',
}))

const Flex = styled('div')<FlexProps>(({ isHeader, isMobile }) => {
  const headerStyle = isHeader
    ? {
        borderBottom: '1px solid #D9DCE9',
        paddingBottom: '8px',
      }
    : {}

  const mobileStyle = isMobile
    ? {
        borderTop: '1px solid #D9DCE9',
        padding: '12px 0 12px',
        '&:first-of-type': {
          marginTop: '12px',
        },
      }
    : {}

  const flexWrap = isMobile ? 'wrap' : 'initial'

  return {
    color: '#212121',
    display: 'flex',
    wordBreak: 'break-word',
    padding: '8px 0 0',
    gap: '8px',
    flexWrap,
    alignItems: ' flex-start',
    ...headerStyle,
    ...mobileStyle,
  }
})
  
const FlexItem = styled('div')(
  ({ width, textAlignLocation, padding = '0', sx }: FlexItemProps) => ({
    display: 'flex',
    justifyContent: textAlignLocation === 'right' ? 'flex-end' : 'flex-start',
    flexGrow: width ? 0 : 1,
    flexShrink: width ? 0 : 1,
    alignItems: 'center',
    width,
    padding,
    ...sx,
  })
)

const defaultItemStyle = {
  default: {
    width: '10%',
  },
  qty: {
    width: '12%',
  },
}

const mobileItemStyle = {
  default: {
    width: '100%',
    padding: '0 0 0 76px',
  },
  qty: {
    width: '100%',
    padding: '0 0 0 76px',
  },
}

export default function NSOrderItems(nsItemDetails: any) {
    const customerName = useAppSelector(({ company }) => company.customer.firstName +  ' ' + company.customer.lastName);
    const companyName = useAppSelector(({ company}) => company?.companyInfo?.id + '-' + company?.companyInfo?.companyName);
    const lineItem = nsItemDetails?.nsItemDetails?.lines;

    const [isMobile] = useMobile()
    const itemStyle = isMobile ? mobileItemStyle : defaultItemStyle

    const b3Lang = useB3Lang()

    return (
        <Stack spacing={2}>
            <Card key={`shipping-${nsItemDetails?.nsItemDetails?.nsOrderInternalID}`}>
            <CardContent>
                <Box
                sx={{
                    wordBreak: 'break-word',
                    color: 'rgba(0, 0, 0, 0.87)',
                }}
                >
                <Typography
                    variant="h6"
                    sx={{
                    fontSize: '24px',
                    fontWeight: '400',
                    }}
                >
                    {customerName}
                    {' – '}
                    {companyName}
                </Typography>
                </Box>
                    <Fragment key={`shipment-${nsItemDetails?.nsItemDetails?.nsOrderInternalID}`}>
                    <Box
                        sx={{
                        margin: '20px 0 2px',
                        }}
                    >
                    </Box>
                        
                    <Box 
                      sx={{borderBottom: '1px solid #D9DCE9', paddingBottom: '20px'}}
                    >
                        <Flex isHeader isMobile={isMobile}>
                        <FlexItem padding={isMobile ? '0' : '0 6% 0 1%'}>
                            <ProductHead>{b3Lang('global.searchProduct.product')}</ProductHead>
                        </FlexItem>
                        <FlexItem textAlignLocation='right' {...itemStyle.default}>
                            <ProductHead>{b3Lang('global.searchProduct.qty')}</ProductHead>
                        </FlexItem>
                        <FlexItem textAlignLocation='right' {...itemStyle.qty}>
                            <ProductHead>{b3Lang('global.searchProduct.returnable')}</ProductHead>
                        </FlexItem>
                        <FlexItem textAlignLocation='right' {...itemStyle.default}>
                            <ProductHead>{b3Lang('global.searchProduct.fulfilled')}</ProductHead>
                        </FlexItem>
                        </Flex>

                        {lineItem && lineItem.length > 0 && lineItem.map((item: any) => (   
                            <Flex isMobile={isMobile} key={item.lineKey}>
                                <FlexItem padding={isMobile ? '0' : '0 6% 0 0'}>
                                <ProductImage src={PRODUCT_DEFAULT_IMAGE} />
                                <Box
                                    sx={{
                                    marginLeft: '16px',
                                    }}
                                >
                                    <Typography
                                    variant="body1"
                                    color="#212121"
                                    sx={{
                                        cursor: 'pointer',
                                    }}
                                    >
                                    {item?.descr}
                                    </Typography>
                                    <Typography variant="body1" color="#616161">
                                    {item?.sku}
                                    </Typography>
                                </Box>
                            </FlexItem>

                            <FlexItem
                            textAlignLocation="right"
                            padding=''
                            {...itemStyle.default}
                            sx={
                                isMobile
                                ? {
                                    fontSize: '14px',
                                    }
                                : {}
                            }
                            >
                            {item?.quantity}
                            </FlexItem>

                            <FlexItem
                            textAlignLocation="right"
                            {...itemStyle.qty}
                            sx={
                                isMobile
                                ? {
                                    fontSize: '14px',
                                    }
                                : {}
                            }
                            >
                        {item?.returnableQuantity}
                            </FlexItem>

                            <FlexItem
                            padding=''
                            {...itemStyle.default}
                            textAlignLocation="right"
                            sx={
                                isMobile
                                ? {
                                    fontSize: '14px',
                                    }
                                : {}
                            }
                            >
                            {item?.fulfilled}
                            </FlexItem>
                            </Flex>
                        ))}
                    </Box>
                    <Box
                        sx={{
                        margin: '20px 0 2px',
                        display: 'flex',
                        justifyContent: 'right'
                        }}
                    >
                      <OrderAction itemDetails={nsItemDetails?.nsItemDetails} />
                    </Box>
                    </Fragment>
            </CardContent>
            </Card>
        </Stack>
    )
}
