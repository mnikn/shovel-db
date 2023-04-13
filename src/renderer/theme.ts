import { blue, blueGrey, grey, indigo, lightBlue } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

export const borderRadius = {
  slightly: { borderRadius: '2px' },
  normal: { borderRadius: '4px' },
  large: { borderRadius: '12px' },
  larger: { borderRadius: '24px' },
  round: { borderRadius: '50%' },
};

export const animation = {
  autoFade: { transition: 'all 0.2s ease' },
};

// Create a Material-UI theme instance
// https://mui.com/customization/theming/
const theme = createTheme({
  palette: {
    primary: {
      light: grey[600],
      main: grey[700],
      contrastText: '#fff',
    },
    secondary: {
      light: grey[50],
      main: grey[200],
      contrastText: '#fff',
    },
  },
  /* typography: {
   *   fontWeightMedium: 600,
   *   fontSize: 17,
   *   h1: {
   *     fontSize: "2.2rem",
   *     fontWeight: 400,
   *     color: "#9EEAF9",
   *   },
   *   body1: {
   *     color: "#9EEAF9",
   *   },
   * }, */
});

export default theme;
