// import '../styles/globals.css'
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import theme from "../src/theme";

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

export default MyApp;
