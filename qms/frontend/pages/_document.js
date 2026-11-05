import Document, { Html, Head, Main, NextScript } from "next/document";
import {
  DocumentHeadTags,
  documentGetInitialProps,
} from "@mui/material-nextjs/v16-pagesRouter";
import theme from "../src/theme";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA primary color */}
          <meta content={theme.palette.primary.main} name="theme-color" />
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
            rel="stylesheet"
          />
          <DocumentHeadTags {...this.props} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// https://mui.com/material-ui/integrations/nextjs/#pages-router
MyDocument.getInitialProps = async (ctx) => documentGetInitialProps(ctx);
