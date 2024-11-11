import InfoIcon from '@mui/icons-material/Info';
import { Box, Link, List, ListItem, Typography } from '@mui/material';

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
        </Typography>
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
        <Typography sx={{ paddingTop: '10px', paddingBottom: '10px' }}>
          If you encounter issues receiving the reset password link:
        </Typography>
        <List sx={{ listStyle: 'decimal', ml: '40px' }}>
          <ListItem sx={{ display: 'list-item', p: '0' }}>
            <strong>Check your spam folder</strong> for the reset password email.
          </ListItem>
          <ListItem sx={{ display: 'list-item', p: '0' }}>
            <strong>Click &quot;Create Account&quot;</strong> to register the same email address
            previously used for your online account.
          </ListItem>
        </List>
        We have implemented a migration process to transfer active online accounts. If the
        &quot;Reset Password&quot; link is not working, please click &quot;Create Account&quot; to
        regain access. For further assistance, contact{' '}
        <Link href="mailto:customerservice@wpsginc.com">Customer Service</Link>.
        <Typography sx={{ paddingTop: '10px', paddingBottom: '10px' }}>
          We apologize for any inconvenience this may cause and appreciate your understanding.
        </Typography>
      </Box>
    </Box>
  );
}
