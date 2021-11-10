import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#d65050",
    },
    secondary: {
      main: "#d65050",
    },
    background: {
      default: "#303030",
      paper: "#303030",
    },
  },
  typography: {
    fontFamily: ["Raleway", "sans-serif"],
  },
});
export default theme;
