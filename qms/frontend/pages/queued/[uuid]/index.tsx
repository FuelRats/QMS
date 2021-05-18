import { Box, Container, LinearProgress, Typography } from "@material-ui/core";
import { gql } from "@apollo/client/core";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { Alert, AlertTitle } from "@material-ui/lab";
import Image from "next/image";
import React from "react";
import pushClientToKiwi from "../../../src/helpers/PushClientToKiwi";

const GET_QUEUED_CLIENT = gql`
  query GetQueuedClient($uuid: String!) {
    queuedClient(uuid: $uuid) {
      pending
      platform
      system
      cmdr
      codeRed
      odyssey
      position
    }
  }
`;

export default function Index() {
  const router = useRouter();
  const { uuid } = router.query;
  const { data, loading, error } = useQuery(GET_QUEUED_CLIENT, {
    variables: { uuid },
    pollInterval: parseInt(process.env.NEXT_PUBLIC_QUEUE_POLL_INTERVAL),
    fetchPolicy: "no-cache",
  });

  if (!loading && !error && data?.queuedClient?.pending === true) {
    pushClientToKiwi({
      system: data.queuedClient.system,
      platform: data.queuedClient.platform,
      cmdr: data.queuedClient.cmdr,
      timer: data.queuedClient.codeRed,
      odyssey: data.queuedClient.odyssey,
      submit: true,
    });
  }

  if (loading || !data) {
    return (
      <Container maxWidth="xs">
        <Typography>Loading your rescue....</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Box my={2} display="flex" justifyContent="center" alignItems="center">
        <Image src="/logo.svg" layout="fixed" width={250} height={250} />
      </Box>
      <Box my={2}>
        <Alert severity="info">
          <AlertTitle>
            <strong>You are in the Queue!</strong>
          </AlertTitle>
          It is currently extremely busy with rescue cases.
          <br />
          This screen will refresh automatically and let you in once it&apos;s
          your turn.
        </Alert>
      </Box>
      <Box my={2}>
        <Alert severity="warning">
          <AlertTitle>
            <strong>Exit to the main menu</strong>
          </AlertTitle>
          To prevent burning unnecessary fuel, please exit to the main menu
          where you can see your ship in the hangar while you wait here.
        </Alert>
      </Box>
      <Typography variant="h5" component="h3">
        Your position in the queue: {data.queuedClient.position}
      </Typography>
      <Box width="100%" my={2}>
        <LinearProgress />
      </Box>
    </Container>
  );
}
