import { useContext } from 'react';
import { Box, ImageListItem } from '@mui/material';

import { STORE_DEFAULT_LOGO } from '@/constants';
import { useMobile } from '@/hooks';
import { GlobaledContext } from '@/shared/global';

const { VITE_B2B_TFS_LOGO, VITE_B2B_OS_LOGO, VITE_B2B_EMS_LOGO, VITE_B2B_GD_LOGO } = import.meta
  .env;

const TFS_LOGO = VITE_B2B_TFS_LOGO;
const OS_LOGO = VITE_B2B_OS_LOGO;
const EMS_LOGO = VITE_B2B_EMS_LOGO;
const GD_LOGO = VITE_B2B_GD_LOGO;

export default function B3Logo() {
  const {
    // eslint-disable-next-line no-empty-pattern
    state: {},
  } = useContext(GlobaledContext);

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
              flexShrink: '0',
              height: 'auto',
              width: '45%',
              display: 'contents',
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              },
            }
          : {
              width: '100%',
              height: '64px',
              '& img': {
                width: '100%',
                maxHeight: '64px',
                objectFit: 'contain',
              },
            }
      }
    >
      <ImageListItem
        sx={{
          maxWidth: '250px',
          cursor: 'pointer',
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
