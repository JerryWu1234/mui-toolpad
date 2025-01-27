import * as React from 'react';
import {
  Button,
  Typography,
  Box,
  useTheme,
  Alert,
  ButtonProps,
  Popover,
  styled,
  IconButton,
  Tooltip,
  Snackbar,
  IconButtonProps,
  popoverClasses,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useMatch } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IS_CUSTOM_SERVER, PREVIEW_HEADER_HEIGHT } from './constants';

interface CopyToClipboardButtonProps extends IconButtonProps {
  content: string;
}

function CopyToClipboardButton({ content, onClick, ...props }: CopyToClipboardButtonProps) {
  const [confirmSnackbarOpen, setConfirmSnackbarOpen] = React.useState(false);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      window.navigator.clipboard.writeText(content);
      setConfirmSnackbarOpen(true);
      onClick?.(event);
    },
    [content, onClick],
  );

  const handleCopySnackbarClose = React.useCallback(() => setConfirmSnackbarOpen(false), []);

  return (
    <React.Fragment>
      <Tooltip title="Copy to clipboard">
        <IconButton {...props} onClick={handleClick}>
          <ContentCopyIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Snackbar
        open={confirmSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCopySnackbarClose}
        message="Copied to clipboard"
      />
    </React.Fragment>
  );
}

interface CodeViewProps {
  children?: string;
}

const classes = {
  copyToClipboardButton: 'Toolpad_CodeView_CopyToClipboardButton',
  hasCopyToClipboardButton: 'Toolpad_CodeView_hasCopyToClipboardButton',
};

const CodeViewRoot = styled('pre')(({ theme }) => ({
  position: 'relative',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  paddingRight: theme.spacing(5),
  borderRadius: theme.shape.borderRadius,

  fontFamily: theme.fontFamilyMonospaced,

  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  [`& .${classes.copyToClipboardButton}`]: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

function CodeView({ children }: CodeViewProps) {
  return (
    <CodeViewRoot>
      <Typography noWrap component="code" fontFamily="inherit">
        {children}
      </Typography>

      {children ? (
        <CopyToClipboardButton
          size="small"
          content={children}
          className={classes.copyToClipboardButton}
        />
      ) : null}
    </CodeViewRoot>
  );
}

function OpenInEditorButton({ children = 'Open in editor', ...props }: ButtonProps) {
  return (
    <Button color="inherit" size="small" startIcon={<EditIcon />} {...props}>
      {children}
    </Button>
  );
}

interface CustomServerInstructionsProps {
  basename: string;
}

function CustomServerInstructions({ basename }: CustomServerInstructionsProps) {
  const id = React.useId();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const appUrl = React.useMemo(() => {
    return new URL(basename, window.location.origin).href;
  }, [basename]);

  return (
    <React.Fragment>
      <OpenInEditorButton aria-describedby={id} onClick={handleClick} />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          [`& .${popoverClasses.paper}`]: {
            maxWidth: 700,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography>
            This application is running under a custom server. Run the standalone Toolpad editor to
            make changes to this application.
          </Typography>
          <CodeView>{`npx @mui/toolpad editor ${appUrl}`}</CodeView>
        </Box>
      </Popover>
    </React.Fragment>
  );
}

export interface PreviewHeaderProps {
  basename: string;
}

export default function PreviewHeader({ basename }: PreviewHeaderProps) {
  const pageMatch = useMatch('/pages/:slug');
  const activePage = pageMatch?.params.slug;

  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        width: '100%',
        height: PREVIEW_HEADER_HEIGHT,
        zIndex: theme.zIndex.drawer + 2,
      }}
    >
      <Alert
        severity="warning"
        sx={{
          borderRadius: 0,
        }}
        action={
          IS_CUSTOM_SERVER ? (
            <CustomServerInstructions basename={basename} />
          ) : (
            <OpenInEditorButton
              component="a"
              href={activePage ? `/_toolpad/app/pages/${activePage}` : '/_toolpad/app'}
            />
          )
        }
      >
        <Typography variant="body2">
          This is a preview version of the application, not suitable for production.
        </Typography>
      </Alert>
    </Box>
  );
}
