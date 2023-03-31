import { grey } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

// Create a Material-UI theme instance
// https://mui.com/customization/theming/
const theme = createTheme({
  palette: {
    /* primary: {
     *   main: "#ffffff",
     * },
     * secondary: {
     *   main: grey[800],
     * }, */

    primary: {
      light: grey[50],
      main: grey[100],
      dark: "#002884",
      contrastText: "#000",
    },
    secondary: {
      light: grey[800],
      main: grey[900],
      dark: "#ba000d",
      contrastText: "#fff",
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
