import { Box, CircularProgress, Container, Grid } from "@material-ui/core";
import { gql } from "@apollo/client/core";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { Alert, AlertTitle } from "@material-ui/lab";
import Image from "next/image";
import React from "react";

const GET_QUEUED_CLIENT = gql`
  query GetQueuedClient($uuid: String!) {
    queuedClient(uuid: $uuid) {
      pending
      platform
      system
      cmdr
      codeRed
      odyssey
    }
  }
`;

export default function Index() {
  const router = useRouter();
  const { uuid } = router.query;
  const { data, loading, error } = useQuery(GET_QUEUED_CLIENT, {
    variables: { uuid },
    pollInterval: parseInt(process.env.NEXT_PUBLIC_QUEUE_POLL_INTERVAL),
  });

  if (!loading && !error && data?.queuedClient?.pending === true) {
    const prefilledData = {
      system: data.queuedClient.system,
      platform: data.queuedClient.platform,
      cmdr: data.queuedClient.cmdr,
      timer: data.queuedClient.codeRed,
      odyssey: data.queuedClient.odyssey,
      submit: true,
    };
    router.push(
      process.env.NEXT_PUBLIC_KIWI_URL +
        "?prefilledData=" +
        btoa(JSON.stringify(prefilledData))
    );
  }

  return (
    <Container maxWidth="xs">
      <Box my={2} display="flex"
           justifyContent="center"
           alignItems="center">
        <Image
            src="/logo.svg"
            layout="fixed"
            width={250}
            height={250}
        />
      </Box>
      <Box my={2}>
        <Alert severity="info">
          <AlertTitle>
            <strong>You are in the Queue!</strong>
          </AlertTitle>
          It is currently extremely busy with rescue cases.
          <br />
          This screen will refresh automatically and let you in once it&apos;s your turn.
        </Alert>
      </Box>
      <Box my={2}>
        <Alert severity="warning">
          <AlertTitle>
            <strong>Exit to the main menu</strong>
          </AlertTitle>
          To prevent burning too much fuel, please exit to the main menu while
          you wait here.
          <br />
          <br />
          Make sure you see your ship in the hangar!
        </Alert>
      </Box>
      <Grid container justify="center" alignItems="center">
        <CircularProgress size={200} />
      </Grid>
    </Container>
  );
}
