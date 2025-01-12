/**
 * export-data Command
 *
 * This file defines a...
 *
 */

import { ActionPanel, Form, Action, showToast, Toast } from "@raycast/api";
import fs from "fs";
import { exportToFile } from "./utils/storage";

export default function ExportData() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Submit Name"
            onSubmit={(values: { folders: string[] }) => {
              const folder = values.folders[0];
              try {
                // Ensure the folder exists
                if (!fs.existsSync(folder) || !fs.lstatSync(folder).isDirectory()) {
                  throw new Error("The selected folder is invalid or does not exist.");
                }

                exportToFile(folder);
              } catch (error) {
                console.error("Failed to export file", error);
                if (error instanceof Error) {
                  showToast({ style: Toast.Style.Failure, title: "Error", message: error.message });
                }
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.FilePicker id="folders" allowMultipleSelection={false} canChooseDirectories canChooseFiles={false} />
    </Form>
  );
}
