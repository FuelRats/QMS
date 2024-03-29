// import '../styles/globals.css'
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import theme from "../src/theme";
import { appWithTranslation } from "next-i18next";
import { CssBaseline, ThemeProvider } from "@mui/material";

const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default appWithTranslation(MyApp);
