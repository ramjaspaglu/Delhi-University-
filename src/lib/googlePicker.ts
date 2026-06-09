import firebaseConfig from "../../firebase-applet-config.json";

let isGapiLoaded = false;
let isPickerLoaded = false;

export function loadGooglePickerScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isGapiLoaded && isPickerLoaded) {
      resolve();
      return;
    }

    if (typeof window === "undefined") {
      reject(new Error("Window not found"));
      return;
    }

    // Check if script is already present
    const existingScript = document.getElementById("google-gapi-script");
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if ((window as any).gapi && (window as any).gapi.picker) {
          isGapiLoaded = true;
          isPickerLoaded = true;
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gapi-script";
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      (window as any).gapi.load("picker", {
        callback: () => {
          isGapiLoaded = true;
          isPickerLoaded = true;
          resolve();
        },
        onerror: () => {
          reject(new Error("Failed to load Google Picker extension"));
        },
      });
    };
    script.onerror = () => {
      reject(new Error("Failed to load Google API Client script"));
    };

    document.body.appendChild(script);
  });
}

export interface GooglePickerFile {
  id: string;
  name: string;
  url: string;
  mimeType: string;
}

export function openGooglePicker(
  accessToken: string,
  onFileSelect: (file: GooglePickerFile) => void,
  onCancel?: () => void,
): void {
  const gapi = (window as any).gapi;
  const google = (window as any).google;

  if (!gapi || !gapi.picker || !google || !google.picker) {
    console.error("Google Picker not loaded.");
    return;
  }

  const developerKey = firebaseConfig.apiKey;

  const pickerCallback = (data: any) => {
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      const doc = data[google.picker.Response.DOCUMENTS][0];
      const selectedFile: GooglePickerFile = {
        id: doc[google.picker.Document.ID],
        name: doc[google.picker.Document.NAME],
        url: doc[google.picker.Document.URL],
        mimeType: doc[google.picker.Document.MIME_TYPE],
      };
      onFileSelect(selectedFile);
    } else if (
      data[google.picker.Response.ACTION] === google.picker.Action.CANCEL
    ) {
      if (onCancel) onCancel();
    }
  };

  try {
    const view = new google.picker.View(google.picker.ViewId.DOCS);

    // Create the picker
    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(developerKey)
      .setCallback(pickerCallback)
      .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
      .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
      .build();

    picker.setVisible(true);
  } catch (error) {
    console.error("Error constructing Google Picker:", error);
  }
}
