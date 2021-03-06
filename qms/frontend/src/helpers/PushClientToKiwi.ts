export default function pushClientToKiwi(prefilledData: {
  system: string;
  platform: "PC" | "XB" | "PS4";
  cmdr: string;
  timer: boolean;
  odyssey: boolean;
  submit: boolean;
}) {
  window.location.href =
    process.env.NEXT_PUBLIC_KIWI_URL +
    "?prefilledData=" +
    btoa(JSON.stringify(prefilledData));
}
