// import { useContext } from 'react';
import { Box, ImageListItem } from '@mui/material';

import { STORE_DEFAULT_LOGO } from '@/constants';
import { useMobile } from '@/hooks';
// import { GlobaledContext } from '@/shared/global';

const { VITE_B2B_TFS_LOGO, VITE_B2B_OS_LOGO, VITE_B2B_EMS_LOGO, VITE_B2B_GD_LOGO } = import.meta
  .env;

const TFS_LOGO = VITE_B2B_TFS_LOGO;
const OS_LOGO = VITE_B2B_OS_LOGO;
const EMS_LOGO = VITE_B2B_EMS_LOGO;
const GD_LOGO = VITE_B2B_GD_LOGO;

export default function B3Logo() {
  // const {
  //   state: {},
  // } = useContext(GlobaledContext);

  const [isMobile] = useMobile();

  const location = window.location.href;
  let storeLogo = TFS_LOGO;
  if (location.includes('officer')) storeLogo = OS_LOGO;
  if (location.includes('ems')) storeLogo = EMS_LOGO;
  if (location.includes('gideon')) storeLogo = GD_LOGO;

  return (
    <Box
      sx={
        isMobile
          ? {
              height: '40px',
              width: '140px',
              '& li': {
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '1rem',
              },
              '& img': {
                maxHeight: '40px',
              },
            }
          : {
              width: '200px',
              height: '65px',
              display: 'flex',
              alignItems: 'center',
              '& img': {
                maxHeight: '65px',
              },
            }
      }
    >
      <ImageListItem
        sx={{
          maxWidth: '200px',
          cursor: 'pointer',
          '& .MuiImageListItem-img': {
            objectFit: 'contain',
            width: 'auto',
          },
        }}
        onClick={() => {
          window.location.href = '/';
        }}
      >
        <img src={storeLogo || STORE_DEFAULT_LOGO} alt="logo" />
      </ImageListItem>
    </Box>
  );
}
