import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@material-ui/core";
import SystemsSearch from "../src/components/SystemsSearch";
import { gql } from "@apollo/client/core";
import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { Alert, AlertTitle } from "@material-ui/lab";
import Image from "next/image";
import { useRouter } from "next/router";

const QUEUE_CLIENT = gql`
  mutation QueueClient($input: QueueClientInput) {
    queueClient(input: $input) {
      message
      uuid
    }
  }
`;

enum EmptyBoolean {
  TRUE = "TRUE",
  FALSE = "FALSE",
  EMPTY = "EMPTY",
}

export default function Home() {
  const [queueNewClient, { loading, data: queuedClient }] =
    useMutation(QUEUE_CLIENT);
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
    ((platform === "PC" && odyssey !== null) || platform !== "PC");

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
    queueNewClient({
      variables: {
        input: {
          cmdr: name,
          platform,
          locale: navigator.language,
          codeRed: codeRed === EmptyBoolean.TRUE,
          odyssey: odyssey === EmptyBoolean.TRUE,
          system: system,
        },
      },
    });
  };
  if (queuedClient) {
    if (queuedClient.queueClient.message === "queued") {
      router.push("/queued/" + queuedClient.queueClient.uuid);
    }
    if (queuedClient.queueClient.message === "go_ahead") {
      const prefilledData = {
        system: system,
        platform: platform,
        cmdr: name,
        timer: codeRed === EmptyBoolean.TRUE,
        odyssey: odyssey === EmptyBoolean.TRUE,
        submit: true,
      };
      router.push(
        process.env.NEXT_PUBLIC_KIWI_URL +
          "?prefilledData=" +
          btoa(JSON.stringify(prefilledData))
      );
    }
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
              hanger <strong>immediately!</strong>
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
      <Typography>System Name</Typography>
      <SystemsSearch onChange={handleSystemChange} />

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
            <FormControlLabel value={EmptyBoolean.TRUE} control={<Radio />} label="Yes" />
            <FormControlLabel value={EmptyBoolean.FALSE} control={<Radio />} label="No" />
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
    </Container>
  );
}
