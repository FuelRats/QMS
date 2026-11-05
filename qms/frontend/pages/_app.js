// import '../styles/globals.css'
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

import theme from "../src/theme";
import { appWithTranslation } from "next-i18next/pages";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppCacheProvider } from "@mui/material-nextjs/v16-pagesRouter";

const client = new ApolloClient({
  link: new HttpLink({ uri: "/api/graphql" }),
  cache: new InMemoryCache(),
});

function MyApp(props) {
  const { Component, pageProps } = props;
  return (
    <AppCacheProvider {...props}>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
    </AppCacheProvider>
  );
}

export default appWithTranslation(MyApp);
