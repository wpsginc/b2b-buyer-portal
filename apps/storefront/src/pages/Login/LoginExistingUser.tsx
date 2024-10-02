import InfoIcon from '@mui/icons-material/Info';
import { Box, List, ListItem, Typography } from '@mui/material';

export default function LoginExistingUser() {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '10px',
        bgcolor: '#fffbed',
        border: '2px solid #f0ad4e',
        borderRadius: '5px',
        padding: '30px 20px',
      }}
    >
      <Box>
        <InfoIcon
          sx={{
            color: '#f0ad4e',
            fontSize: '25px',
          }}
        />
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            margin: 0,
          }}
        >
          For existing customers:
        </Typography>
        <Typography variant="body1">
          To access your account on our new website, all existing users need to reset their
          passwords. Please follow these steps:
          <List sx={{ listStyle: 'decimal', ml: '40px' }}>
            <ListItem sx={{ display: 'list-item', p: '0' }}>
              Click &quot;Forgot your password?&quot;
            </ListItem>
            <ListItem sx={{ display: 'list-item', p: '0' }}>
              Type in your email address and click &quot;Reset password&quot;
            </ListItem>
          </List>
          After resetting, you will receive an email with a link to set your new password.
          <br />
          We apologize for any inconvenience this may cause and appreciate your understanding.
        </Typography>
      </Box>
    </Box>
  );
}
