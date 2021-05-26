import { createMuiTheme } from "@material-ui/core";

const titleFonts = ['"Raleway"', "sans-serif"].join(",");
const paragraphFonts = ['"Open Sans"', "sans-serif"].join(",");

const theme = createMuiTheme({
  palette: {
    type: "dark",
    secondary: {
      main: "#d65050",
    },
  },
  typography: {
    fontFamily: titleFonts,
    body1: {
      fontFamily: paragraphFonts,
    },
    body2: {
      fontFamily: paragraphFonts,
    },
    button: {
      fontFamily: paragraphFonts,
      fontWeight: 600,
    },
    caption: {
      fontFamily: paragraphFonts,
    },
    overline: {
      fontFamily: paragraphFonts,
    },
    subtitle1: {
      fontFamily: paragraphFonts,
    },
    subtitle2: {
      fontFamily: paragraphFonts,
      fontWeight: 600,
    },
  },
});
export default theme;
