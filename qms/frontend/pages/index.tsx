import SystemsSearch from "../src/components/SystemsSearch";
import { gql } from "@apollo/client/core";
import { useLazyQuery, useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import pushClientToKiwi from "../src/helpers/PushClientToKiwi";
import { Trans, useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Alert,
  AlertTitle,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

const QUEUE_CLIENT = gql`
  mutation QueueClient($input: QueueClientInput) {
    queueClient(input: $input) {
      message
      uuid
    }
  }
`;

const QUEUED_CLIENT_FIND_UUID = gql`
  query QueuedClient($uuid: String!) {
    queuedClient(uuid: $uuid) {
      inProgress
      uuid
      pending
      platform
      system
      cmdr
      codeRed
      odyssey
    }
  }
`;

enum EmptyBoolean {
  TRUE = "TRUE",
  FALSE = "FALSE",
  EMPTY = "EMPTY",
}

export default function Home() {
  const [
    queueNewClient,
    { loading, data: queuedClient, error: queueNewClientError },
  ] = useMutation(QUEUE_CLIENT, {
    fetchPolicy: "no-cache",
  });
  const [findQueueUuid, { data: alreadyQueuedClient }] = useLazyQuery(
    QUEUED_CLIENT_FIND_UUID,
    {
      fetchPolicy: "no-cache",
    }
  );
  const [platform, setPlatform] = useState<string>("");
  const [codeRed, setCodeRed] = useState<EmptyBoolean>(EmptyBoolean.EMPTY);
  const [name, setName] = useState<string>("");
  const [system, setSystem] = useState<string>("");
  const [odyssey, setOdyssey] = useState<EmptyBoolean>(EmptyBoolean.EMPTY);
  const router = useRouter();
  const { t } = useTranslation();
  const canStart =
    platform.length &&
    name.length &&
    system.length &&
    ((platform === "PC" && odyssey !== EmptyBoolean.EMPTY) ||
      platform !== "PC");

  if (alreadyQueuedClient) {
    if (
      !alreadyQueuedClient.queuedClient.inProgress &&
      !alreadyQueuedClient.queuedClient.pending
    ) {
      router.push("/queued/" + alreadyQueuedClient.queuedClient.uuid);
    } else {
      pushClientToKiwi({
        system: alreadyQueuedClient.queuedClient.system,
        platform: alreadyQueuedClient.queuedClient.platform,
        cmdr: alreadyQueuedClient.queuedClient.cmdr,
        timer: alreadyQueuedClient.queuedClient.codeRed,
        odyssey: alreadyQueuedClient.queuedClient.odyssey,
        submit: true,
        time: Date.now(),
      });
    }
  }

  useEffect(() => {
    const lastQueueString = localStorage.getItem("latestQueue");
    if (lastQueueString) {
      const lastQueue = JSON.parse(lastQueueString);
      if (lastQueue?.data?.uuid?.length) {
        findQueueUuid({ variables: { uuid: lastQueue.data.uuid } });
      }
    }
  }, [findQueueUuid]);

  const handlePlatformChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlatform(event.target.value);
    if (platform !== "PC") {
      setOdyssey(EmptyBoolean.EMPTY);
    }
  };
  const handleCodeRedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCodeRed(event.currentTarget.value as EmptyBoolean);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  const handleSystemChange = (newName: string) => {
    setSystem(newName);
  };

  const handleOdysseyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOdyssey(event.currentTarget.value as EmptyBoolean);
  };

  const onSubmit = async () => {
    const newClientInput = {
      cmdr: name,
      platform,
      locale: navigator.language,
      codeRed: codeRed === EmptyBoolean.TRUE,
      odyssey: odyssey === EmptyBoolean.TRUE,
      system: system,
    };
    localStorage.setItem(
      "latestInput",
      JSON.stringify({
        input: newClientInput,
        date: new Date().toISOString(),
      })
    );

    queueNewClient({
      variables: {
        input: newClientInput,
      },
    });
  };

  if (queuedClient?.queueClient.message === "queued") {
    localStorage.setItem(
      "latestQueue",
      JSON.stringify({
        data: queuedClient.queueClient,
        date: new Date().toISOString(),
      })
    );
    router.push("/queued/" + queuedClient.queueClient.uuid);
  }

  if (queueNewClientError || queuedClient?.queueClient.message === "go_ahead") {
    pushClientToKiwi({
      system: system,
      platform: platform.toUpperCase() as unknown as "PC" | "XB" | "PS4",
      cmdr: name,
      timer: codeRed === EmptyBoolean.TRUE,
      odyssey: odyssey === EmptyBoolean.TRUE,
      submit: true,
    });
  }

  return (
    <Container maxWidth="xs">
      <Box my={2} display="flex" justifyContent="center" alignItems="center">
        <Image
          src="/logo.svg"
          layout="fixed"
          width={250}
          height={250}
          alt="Fuel Rats logo"
        />
      </Box>
      <Typography component="h1" variant="h5">
        {t("rescueForm:timer?")}
      </Typography>
      <RadioGroup
        value={codeRed}
        color="primary"
        row
        onChange={handleCodeRedChange}
      >
        <FormControlLabel
          control={<Radio />}
          label={t("common:yes")}
          value={EmptyBoolean.TRUE}
        />
        <FormControlLabel
          control={<Radio />}
          label={t("common:no")}
          value={EmptyBoolean.FALSE}
        />
      </RadioGroup>
      {codeRed === EmptyBoolean.TRUE && (
        <>
          <Box my={2}>
            <Alert severity="error">
              <AlertTitle>
                {t("rescueForm:exitAlert.title").toUpperCase()}
              </AlertTitle>
              <Trans
                i18nKey="rescueForm:exitAlert.exitInstructions"
                components={{ strong: <strong /> }}
              />
            </Alert>
          </Box>
          <Box my={2}>
            <Alert severity="warning">
              {t("rescueForm:infoAlert.enterGameWarning")}
              <br />
              <br />
              <Trans
                i18nKey="rescueForm:infoAlert.gatherInfo"
                components={{ strong: <strong /> }}
              />
            </Alert>
          </Box>
        </>
      )}

      <Box my={2}>
        <Typography>{t("rescueForm:cmdrName")}</Typography>
        <TextField
          placeholder="Surly Badger"
          fullWidth
          value={name}
          onChange={handleNameChange}
          variant="outlined"
        />
      </Box>

      <Box my={2}>
        <Typography>{t("rescueForm:system.systemName")}</Typography>
        <SystemsSearch
          onChange={handleSystemChange}
          label={t("rescueForm:system.searchLabel")}
        />
      </Box>

      <Typography>{t("rescueForm:platform.header")}</Typography>
      <RadioGroup
        value={platform}
        aria-label="large primary button group"
        onChange={handlePlatformChange}
      >
        <FormControlLabel control={<Radio />} label="PC" value="PC" />

        <FormControlLabel control={<Radio />} label="XBOX" value="XB" />
        <FormControlLabel control={<Radio />} label="Playstation" value="PS4" />
      </RadioGroup>

      {platform === "PC" && (
        <Box my={2}>
          <Typography>{t("rescueForm:platform.which?")}</Typography>
          <RadioGroup value={odyssey} onChange={handleOdysseyChange}>
            <FormControlLabel
              value={EmptyBoolean.FALSE}
              control={<Radio />}
              label={
                <Box my={2}>
                  <Image
                    src="/horizons.png"
                    layout="fixed"
                    alt="Horizons"
                    width={250}
                    height={179}
                  />
                </Box>
              }
            />
            <FormControlLabel
              value={EmptyBoolean.TRUE}
              control={<Radio />}
              label={
                <Box my={2}>
                  <Image
                    src="/odyssey.png"
                    layout="fixed"
                    alt="Odyssey"
                    width={250}
                    height={179}
                  />
                </Box>
              }
            />
          </RadioGroup>
        </Box>
      )}

      <Box my={4}>
        <Button
          variant="contained"
          onClick={onSubmit}
          fullWidth
          disabled={!canStart || loading}
          size="large"
          color="secondary"
        >
          {t("rescueForm:start")}
        </Button>
      </Box>
      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
    </Container>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "rescueForm"])),
    },
  };
}
