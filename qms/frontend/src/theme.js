import { createMuiTheme } from "@material-ui/core";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    secondary: {
      main: "#d65050",
    },
  },
  typography: {
    fontFamily: ["Raleway", "sans-serif"],
  },
});
export default theme;
