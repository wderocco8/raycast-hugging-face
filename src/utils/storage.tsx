import { LocalStorage, showInFinder, showToast, Toast } from "@raycast/api";
import fs from "fs";
import path from "path";

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
