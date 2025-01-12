/**
 * import-data Command
 *
 * This file defines a...
 *
 */

import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import fs from "fs";
import path from "path";
import { importFromFile } from "./utils/storage";

export default function ImportData() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Submit Name"
            onSubmit={(values: { files: string[] }) => {
              const file = values.files[0];
              try {
                if (!file) {
                  throw new Error("No file selected.");
                }

                if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) {
                  throw new Error("The selected file is invalid or does not exist.");
                }

                // Validate file type (e.g., only allow .json files)
                const allowedExtensions = [".json"];
                const fileExtension = path.extname(file);
                if (!allowedExtensions.includes(fileExtension)) {
                  throw new Error(`Invalid file type. Please select a ${allowedExtensions.join(",")} file.`);
                }

                return importFromFile(file);
              } catch (error) {
                console.error("Error", error);
                if (error instanceof Error) {
                  showToast({ style: Toast.Style.Failure, title: "Error", message: error.message });
                }
                return false;
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.FilePicker id="files" allowMultipleSelection={false} />
    </Form>
  );
}
