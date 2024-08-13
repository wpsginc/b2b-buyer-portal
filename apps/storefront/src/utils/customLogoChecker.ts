const { VITE_B2B_TFS_LOGO, VITE_B2B_OS_LOGO, VITE_B2B_EMS_LOGO, VITE_B2B_GD_LOGO } = import.meta
  .env;

const TFS_LOGO = VITE_B2B_TFS_LOGO;
const OS_LOGO = VITE_B2B_OS_LOGO;
const EMS_LOGO = VITE_B2B_EMS_LOGO;
const GD_LOGO = VITE_B2B_GD_LOGO;

export const getStoreLogo = () => {
  const location = window.location.href;
  let storeLogo = TFS_LOGO;
  if (location.includes('officer')) storeLogo = OS_LOGO;
  if (location.includes('ems')) storeLogo = EMS_LOGO;
  if (location.includes('gideon')) storeLogo = GD_LOGO;

  return storeLogo;
};

export default getStoreLogo;
