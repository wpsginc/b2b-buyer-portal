import { Box, Grid, Stack } from '@mui/material';

import B3Spin from '@/components/spin/B3Spin';
import { useMobile } from '@/hooks';

import NSOrderItemList from './OrderItemList';
import OrderOtherDetails from './OrderOtherDetails';

export default function NSOrderItems() {
  const [isMobile] = useMobile();
  const isRequestLoading = false;

  return (
    <B3Spin isSpinning={isRequestLoading} background="rgba(255,255,255,0.2)">
      <Box
        sx={{
          overflow: 'auto',
          flex: 1,
        }}
      >
        <Grid container spacing={2}>
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
              <Stack spacing={4}>
                <NSOrderItemList />
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
              <OrderOtherDetails />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </B3Spin>
  );
}
