import { Box, Container, LinearProgress, Typography } from "@material-ui/core";
import { gql } from "@apollo/client/core";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { Alert, AlertTitle } from "@material-ui/lab";
import Image from "next/image";
import React from "react";
import pushClientToKiwi from "../../../src/helpers/PushClientToKiwi";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

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

const sendToHomeClean = () => {
  localStorage.removeItem("latestInput");
  localStorage.removeItem("latestQueue");
  window.location.href = "/";
};

export default function Index() {
  const router = useRouter();
  const { uuid } = router.query;
  const { t } = useTranslation();
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

  if (!loading && error) {
    const lastInputString = localStorage.getItem("latestQueue");
    if (!lastInputString) {
      sendToHomeClean();
      return;
    }
    let lastInput = undefined;
    try {
      lastInput = JSON.parse(lastInputString);
    } catch (e) {
      sendToHomeClean();
      return;
    }
    if (typeof lastInput !== "object" || !lastInput?.input) {
      sendToHomeClean();
      return;
    }

    try {
      pushClientToKiwi({
        system: lastInput.input.system,
        platform: lastInput.input.platform,
        cmdr: lastInput.input.cmdr,
        timer: lastInput.input.codeRed,
        odyssey: lastInput.input.odyssey,
        submit: true,
      });
    } catch (e) {
      sendToHomeClean();
      return;
    }
  }

  if (loading || !data) {
    return (
      <Container maxWidth="xs">
        <Typography>{t("queuePage:loading")}</Typography>
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
            <strong>{t("queuePage:queueAlert.inQueue")}</strong>
          </AlertTitle>
          {t("queuePage:queueAlert.busy")}
          <br />
        </Alert>
      </Box>
      <Box my={2}>
        <Alert severity="warning">
          <AlertTitle>
            <strong>{t("queuePage:fuelAlert.exit")}</strong>
          </AlertTitle>
          {t("queuePage:fuelAlert.instructions")}
        </Alert>
      </Box>
      <Typography variant="h5" component="h3">
        {t("queuePage:position", { position: data.queuedClient.position })}
      </Typography>
      <Box width="100%" my={2}>
        <LinearProgress />
      </Box>
    </Container>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "queuePage"])),
    },
  };
}
