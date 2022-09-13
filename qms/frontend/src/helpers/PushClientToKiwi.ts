export default function pushClientToKiwi(prefilledData: {
  system: string;
  platform: "PC" | "XB" | "PS4";
  cmdr: string;
  timer: boolean;
  odyssey: "horizons3" | "horizons4" | "odyssey";
  submit: boolean;
}) {
  window.location.href =
    process.env.NEXT_PUBLIC_KIWI_URL +
    "?prefilledData=" +
    encodeURIComponent(JSON.stringify(prefilledData));
}
