import {
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
} from "@material-ui/core";
import SystemsSearch from "../src/components/SystemsSearch";
import { gql } from "@apollo/client/core";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Alert, AlertTitle } from "@material-ui/lab";
import Image from "next/image";
import { useRouter } from "next/router";
import pushClientToKiwi from "../src/helpers/PushClientToKiwi";

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

  const handlePlatformChange = (event) => {
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
      platform: platform,
      cmdr: name,
      timer: codeRed === EmptyBoolean.TRUE,
      odyssey: odyssey === EmptyBoolean.TRUE,
      submit: true,
    });
  }

  return (
    <Container maxWidth="xs">
      <Box my={2} display="flex" justifyContent="center" alignItems="center">
        <Image src="/logo.svg" layout="fixed" width={250} height={250} />
      </Box>
      <Typography component="h1" variant="h5">
        Do you see an &apos;oxygen depleted&apos; timer?
      </Typography>
      <RadioGroup
        value={codeRed}
        color="primary"
        row
        onChange={handleCodeRedChange}
      >
        <FormControlLabel
          control={<Radio />}
          label="Yes"
          value={EmptyBoolean.TRUE}
        />
        <FormControlLabel
          control={<Radio />}
          label="No"
          value={EmptyBoolean.FALSE}
        />
      </RadioGroup>
      {codeRed === EmptyBoolean.TRUE && (
        <>
          <Box my={2}>
            <Alert severity="error">
              <AlertTitle>EXIT TO MAIN MENU</AlertTitle>
              Please exit to the main menu where you can see your ship in the
              hangar <strong>immediately!</strong>
            </Alert>
          </Box>
          <Box my={2}>
            <Alert severity="warning">
              Do not enter back into the game unless you are told so.
              <br />
              <br />
              <strong>DO NOT login to check</strong>, but write down how much
              time was left on the oxygen clock and where you were approximately
              in the system. This will be asked during the rescue.
            </Alert>
          </Box>
        </>
      )}

      <Box my={2}>
        <Typography>CMDR Name</Typography>
        <TextField
          placeholder="Surly Badger"
          fullWidth
          value={name}
          onChange={handleNameChange}
          variant="outlined"
        />
      </Box>

      <Box my={2}>
        <Typography>System Name</Typography>
        <SystemsSearch onChange={handleSystemChange} />
      </Box>

      <Typography>Platform</Typography>
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
          <Typography>Are you playing on Odyssey?</Typography>
          <RadioGroup row value={odyssey} onChange={handleOdysseyChange}>
            <FormControlLabel
              value={EmptyBoolean.TRUE}
              control={<Radio />}
              label="Yes"
            />
            <FormControlLabel
              value={EmptyBoolean.FALSE}
              control={<Radio />}
              label="No"
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
          Start
        </Button>
      </Box>
      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
    </Container>
  );
}
