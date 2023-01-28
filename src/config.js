

export const ConfigFields = [
  {
    type: "static-text",
    id: "info",
    width: 12,
    label: "Information",
    value:
      "This module controls camstreamer camstreamer cameras. In a later release it will ask the camera about the attributes, up till then not all commands will work with each camstreamer camera",
  },
  {
    type: "textinput",
    id: "host",
    label: "Camera IP",
    width: 10,
    // regex: Regex.IP
  },
  {
    type: "number",
    id: "httpPort",
    label: "HTTP Port (Default: 80)",
    width: 10,
    default: 80,
    min: 1,
    max: 65535,
  },
  {
    type: "static-text",
    id: "authtoken",
    width: 12,
    label: " ",
    value: " ",
  },
  {
    type: "textinput",
    id: "user",
    label: "User name",
    tooltip: "The user name.",
    width: 10,
  },
  {
    type: "textinput",
    id: "password",
    label: "Password",
    tooltip: "The password",
    width: 10,
  },
  {
    type: "dropdown",
    id: "authmethod",
    default: "0",
    label: "Authentication method",
    width: 10,

    choices: [
      { id: 0, label: "BasicAuth" },
      { id: 1, label: "DigestAuth" },
    ],
  },
  {
    type: 'number',
    label: 'Interval between refreshments of broadcasts statuses and streams health (in seconds)',
    id: 'loadRefreshInterval',
    min: 1,
    max: 300,
    default: 60,
    required: true,
    width: 6,
},
{
  type: 'number',
  label: 'How many broadcasts to fetch from Camera',
  id: 'loadMaxBroadcastCount',
  min: 1,
  max: 50,
  default: 10,
  required: true,
  width: 6,
},
];
