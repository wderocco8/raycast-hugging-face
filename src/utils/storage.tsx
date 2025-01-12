import { LocalStorage, popToRoot, showInFinder, showToast, Toast } from "@raycast/api";
import fs from "fs";
import path from "path";

const specialKey = "raycast-hugging-face";
const dataVersion = "1.0";
const keys = ["questions", "conversations", "models"];

export const exportToFile = async (outputFolder: string, fileName: string = "hugging-face-ai-data.json") => {
  try {
    const data: Record<string, unknown> = {};

    await Promise.all(
      keys.map(async (key) => {
        const item = await LocalStorage.getItem<string>(key);
        if (item) {
          data[key] = JSON.parse(item);
        } else {
          data[key] = null;
        }
      }),
    );

    // Use special key to ensure imported data is correct (see function below)
    data[specialKey] = true;
    data.version = dataVersion;

    // Construct file path
    const filePath = path.join(outputFolder, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    showToast({ style: Toast.Style.Success, title: "Success", message: `Stored data in "${fileName}"` });
    showInFinder(filePath);
  } catch (error) {
    console.error("Failed to export file", error);
    if (error instanceof Error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to export file", message: error.message });
    }
    return false;
  }
};

export const importFromFile = async (filePath: string) => {
  try {
    const fileData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileData);

    // Validate the data
    if (!data[specialKey] || data.version !== dataVersion) {
      throw new Error("Invalid file contents or data version.");
    }

    // Write data to LocalStorage
    await Promise.all(
      keys.map(async (key) => {
        await LocalStorage.setItem(key, JSON.stringify(data[key] ?? []));
      }),
    );

    showToast({ style: Toast.Style.Success, title: "Success", message: "Imported data to LocalStorage" });
    popToRoot();
  } catch (error) {
    console.error("Failed to import data", error);
    if (error instanceof Error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to import data", message: error.message });
    }
    return false;
  }
};
