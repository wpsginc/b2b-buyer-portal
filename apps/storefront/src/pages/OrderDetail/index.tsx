import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useB3Lang } from '@b3/lang';
import { ArrowBackIosNew } from '@mui/icons-material';
import { Box, Grid, Stack, Typography } from '@mui/material';

import { b3HexToRgb, getContrastColor } from '@/components/outSideComponents/utils/b3CustomStyles';
import B3Spin from '@/components/spin/B3Spin';
import { useMobile } from '@/hooks';
import { CustomStyleContext } from '@/shared/customStyleButton';
import { GlobaledContext } from '@/shared/global';
import {
  getB2BAddressConfig,
  getB2BOrderDetails,
  getB2BVariantInfoBySkus,
  getBCOrderDetails,
  getBcOrderStatusType,
  getBcVariantInfoBySkus,
  getOrderStatusType,
} from '@/shared/service/b2b';
import { getNSReturnDetails } from '@/shared/service/b2b/graphql/orders';
import { isB2BUserSelector, useAppSelector } from '@/store';
import b2bLogger from '@/utils/b3Logger';

import { AddressConfigItem, OrderStatusItem } from '../../types';
import OrderStatus from '../order/components/OrderStatus';
import { orderStatusTranslationVariables } from '../order/shared/getOrderStatus';

import NSOrderItems from './components/netsuite/OrderItems';
import { OrderDetailsContext, OrderDetailsProvider } from './context/OrderDetailsContext';
import convertB2BOrderDetails from './shared/B2BOrderData';
import {
  DetailPagination,
  OrderAction,
  OrderBilling,
  OrderHistory,
  OrderShipping,
} from './components';

const convertBCOrderDetails = convertB2BOrderDetails;

interface LocationState {
  isCompanyOrder: boolean;
}

function OrderDetail() {
  const isB2BUser = useAppSelector(isB2BUserSelector);

  const params = useParams();

  const navigate = useNavigate();

  const b3Lang = useB3Lang();

  const {
    state: { addressConfig },
    dispatch: globalDispatch,
  } = useContext(GlobaledContext);

  const {
    state: {
      poNumber,
      status = '',
      customStatus,
      orderSummary,
      orderStatus = [],
      variantImages = [],
    },
    state: detailsData,
    dispatch,
  } = useContext(OrderDetailsContext);

  const {
    state: {
      portalStyle: { backgroundColor = '#FEF9F5' },
    },
  } = useContext(CustomStyleContext);

  const customColor = getContrastColor(backgroundColor);

  const localtion = useLocation();

  const [isMobile] = useMobile();
  const [preOrderId, setPreOrderId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [canGetVariantImages, setCanGetVariantImages] = useState(false);

  const [isNsOrder, setisNsOrder] = useState(false);
  const customerId = useAppSelector(({ company }) => company.customer.id);
  const [nsStatus, setNsStatus] = useState('');
  const [nsItemDetails, setNSItemDetails] = useState([]);

  useEffect(() => {
    setOrderId(params.id || '');
  }, [params]);

  const goToOrders = () => {
    navigate(
      `${(localtion.state as LocationState).isCompanyOrder ? '/company-orders' : '/orders'}`,
      {
        state: {
          isNetsuiteOrder: isNsOrder ? 1 : 0,
        },
      },
    );
  };

  useEffect(() => {
    let paramId;

    if (params?.id?.includes('ns-')) {
      paramId = params?.id?.split('-')[1];
      setisNsOrder(true);
    } else {
      paramId = params.id || '';
    }

    setOrderId(paramId);
  }, [params]);

  useEffect(() => {
    if (orderId) {
      if (isNsOrder) {
        const getReturnDetails = async () => {
          const id = parseInt(orderId, 10);
          if (!id) return;

          setIsRequestLoading(true);

          try {
            const data = [
              {
                order_id: parseInt(orderId, 10),
                customer_id: customerId,
                return_reason: [],
                line_items: [],
              },
            ];

            const req = getNSReturnDetails(data);
            const nsDetails = await req;
            const orderStat = nsDetails?.status;
            const orderNum = nsDetails?.orderNumber;

            setNsStatus(orderStat);
            setNSItemDetails(nsDetails);
            setOrderId(orderNum);
          } catch (err) {
            if (err === 'order does not exist') {
              setTimeout(() => {
                window.location.hash = `/orderDetail/${preOrderId}`;
              }, 1000);
            }
          } finally {
            setIsRequestLoading(false);
          }
        };

        getReturnDetails();
      } else {
        const getOrderDetails = async () => {
          const id = parseInt(orderId, 10);

          if (!id) {
            return;
          }

          setIsRequestLoading(true);

          try {
            const order = isB2BUser ? await getB2BOrderDetails(id) : await getBCOrderDetails(id);

            if (order) {
              const data = isB2BUser
                ? convertB2BOrderDetails(order, b3Lang)
                : convertBCOrderDetails(order, b3Lang);
              dispatch({
                type: 'all',
                payload: data,
              });
              setPreOrderId(orderId);
              dispatch({
                type: 'variantImages',
                payload: {
                  variantImages: [],
                },
              });
              setCanGetVariantImages(true);
            }
          } catch (err) {
            if (err === 'order does not exist') {
              setTimeout(() => {
                window.location.hash = `/orderDetail/${preOrderId}`;
              }, 1000);
            }
          } finally {
            setIsRequestLoading(false);
          }
        };

        const getOrderStatus = async () => {
          const orderStatus = isB2BUser ? await getOrderStatusType() : await getBcOrderStatusType();

          dispatch({
            type: 'statusType',
            payload: {
              orderStatus,
            },
          });
        };

        getOrderDetails();
        getOrderStatus();
      }
    }
    // Disabling rule since dispatch does not need to be in the dep array and b3Lang has rendering errors
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isB2BUser, orderId, preOrderId]);

  const handlePageChange = (orderId: string | number) => {
    setOrderId(orderId.toString());
  };

  useEffect(() => {
    const getAddressLabelPermission = async () => {
      try {
        let configList = addressConfig;
        if (!configList) {
          const { addressConfig: newConfig }: CustomFieldItems = await getB2BAddressConfig();
          configList = newConfig;

          globalDispatch({
            type: 'common',
            payload: {
              addressConfig: configList,
            },
          });
        }

        const permission =
          (configList || []).find((config: AddressConfigItem) => config.key === 'address_label')
            ?.isEnabled === '1';
        dispatch({
          type: 'addressLabel',
          payload: {
            addressLabelPermission: permission,
          },
        });
      } catch (error) {
        b2bLogger.error(error);
      }
    };
    getAddressLabelPermission();
    // disabling as we only need to run this once and values at starting render are good enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOrderStatusLabel = (status: string) => {
    const currentOrderStatus = orderStatus.find(
      (item: OrderStatusItem) => item.systemLabel === status,
    );
    let activeStatusLabel = currentOrderStatus?.customLabel || customStatus;
    if (currentOrderStatus) {
      const optionLabel = orderStatusTranslationVariables[currentOrderStatus.systemLabel];
      activeStatusLabel =
        optionLabel && b3Lang(optionLabel) !== currentOrderStatus.systemLabel
          ? b3Lang(optionLabel)
          : activeStatusLabel;
    }
    return activeStatusLabel;
  };

  useEffect(() => {
    const getVariantImage = async () => {
      const products = detailsData.products || [];

      const skus = products.map((product) => product.sku);
      if (skus.length > 0) {
        const getVariantInfoBySku = isB2BUser ? getB2BVariantInfoBySkus : getBcVariantInfoBySkus;

        const { variantSku: variantInfoList = [] }: CustomFieldItems = await getVariantInfoBySku({
          skus,
        });

        const newVariantImages = variantInfoList.map((variantInfo: CustomFieldItems) => ({
          variantId: variantInfo.variantId,
          variantSku: variantInfo.variantSku,
          variantImage: variantInfo.imageUrl,
        }));

        dispatch({
          type: 'variantImages',
          payload: {
            variantImages: newVariantImages,
          },
        });
        setCanGetVariantImages(false);
      }
    };

    if (variantImages.length === 0 && canGetVariantImages) {
      getVariantImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGetVariantImages]);

  return (
    <B3Spin isSpinning={isRequestLoading} background="rgba(255,255,255,0.2)">
      <Box
        sx={{
          overflow: 'auto',
          flex: 1,
        }}
      >
        <Box
          sx={{
            marginBottom: '10px',
            width: 'fit-content',
          }}
        >
          <Box
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={goToOrders}
          >
            {localtion.state !== null ? (
              <>
                <ArrowBackIosNew
                  sx={{
                    fontSize: '13px',
                    margin: '0 8px',
                  }}
                />
                <span>{b3Lang('orderDetail.backToOrders')}</span>
              </>
            ) : (
              ''
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid
            item
            xs={isMobile ? 12 : 8}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              order: isMobile ? 1 : 0,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: b3HexToRgb(customColor, 0.87) || '#263238',
              }}
            >
              {b3Lang('orderDetail.orderId', { orderId })}
              {b3Lang('orderDetail.purchaseOrderNumber', {
                purchaseOrderNumber: poNumber ?? '',
              })}
            </Typography>
            <OrderStatus
              code={isNsOrder ? nsStatus : status}
              text={getOrderStatusLabel(isNsOrder ? nsStatus : status)}
            />
          </Grid>
          {!isNsOrder ? (
            <Grid
              container
              item
              xs={isMobile ? 12 : 4}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {localtion?.state && (
                <DetailPagination
                  onChange={(orderId) => handlePageChange(orderId)}
                  color={customColor}
                />
              )}
            </Grid>
          ) : (
            ''
          )}
        </Grid>
        {isNsOrder ? (
          <Grid
            container
            spacing={2}
            sx={{
              marginTop: '0',
              overflow: 'auto',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              paddingBottom: '20px',
            }}
          >
            <Grid
              item
              sx={
                isMobile
                  ? {
                      flexBasis: '100%',
                    }
                  : {
                      flexBasis: '690px',
                      flexGrow: 1,
                    }
              }
            >
              <Stack spacing={3}>
                <NSOrderItems nsItemDetails={nsItemDetails} />
              </Stack>
            </Grid>
          </Grid>
        ) : (
          <Grid
            container
            spacing={2}
            sx={{
              marginTop: '0',
              overflow: 'auto',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              paddingBottom: '20px',
            }}
          >
            <Grid
              item
              sx={
                isMobile
                  ? {
                      flexBasis: '100%',
                    }
                  : {
                      flexBasis: '690px',
                      flexGrow: 1,
                    }
              }
            >
              <Stack spacing={3}>
                <OrderShipping />
                {/* Digital Order Display */}
                <OrderBilling />

                <OrderHistory />
              </Stack>
            </Grid>
            <Grid
              item
              sx={
                isMobile
                  ? {
                      flexBasis: '100%',
                    }
                  : {
                      flexBasis: '340px',
                    }
              }
            >
              {JSON.stringify(orderSummary) === '{}' ? null : (
                <OrderAction detailsData={detailsData} />
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </B3Spin>
  );
}

function OrderDetailsContent() {
  return (
    <OrderDetailsProvider>
      <OrderDetail />
    </OrderDetailsProvider>
  );
}

export default OrderDetailsContent;
