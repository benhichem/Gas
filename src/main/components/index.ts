export type IPC_form_data = {
  keywords: Array<string>;
  language: string;
  system: "computer" | "phone";
  deviceType: DeviceType;
  outputFormat: "csv" | "json";
  output: string;
};

export type DeviceType = "android" | "ios";
export type FileFormat = "csv" | "json";

export type SuccessMessage = {
  status: 200 | 500;
  results: number;
  path: string;
};
