/**
 * models Command
 *
 * This file defines a...
 *
 */

import { Action, ActionPanel, Keyboard, List, useNavigation } from "@raycast/api";
import ModelForm from "./views/models/ModelForm";
import { useModels } from "./hooks/useModels";

export default function Models() {
  const { push } = useNavigation();
  const { refresh } = useModels();

  const renderActions = () => (
    <ActionPanel>
      <Action
        title="Create Model"
        shortcut={Keyboard.Shortcut.Common.New}
        onAction={() =>
          push(<ModelForm />, async () => {
            await refresh();
          })
        }
      />
    </ActionPanel>
  );

  return <List actions={renderActions()}></List>;
}
