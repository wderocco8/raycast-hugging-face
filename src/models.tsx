/**
 * models Command
 *
 * This file defines a...
 *
 */

import { Action, ActionPanel, Alert, Color, confirmAlert, Image, Keyboard, List, useNavigation } from "@raycast/api";
import ModelForm from "./views/models/ModelForm";
import { useModels } from "./hooks/useModels";
import { Model } from "./types/model";
import { formatFullTime } from "./utils/date/time";

export default function Models() {
  const { push } = useNavigation();
  const { data: models, remove: removeModel, refresh: refreshModels, isLoading: isLoadingModels } = useModels();

  const handleConfirmDelete = (model: Model) => {
    return confirmAlert({
      title: "Delete this model?",
      message: "You will not be able to recover it",
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
        onAction: () => removeModel(model),
      },
      dismissAction: {
        title: "Cancel",
      },
    });
  };

  const renderMarkdown = (model: Model) => `**Prompt:** ${model.prompt}`;

  const renderListActions = () => (
    <ActionPanel>
      <Action
        title="New Model"
        shortcut={Keyboard.Shortcut.Common.New}
        onAction={() =>
          push(<ModelForm />, async () => {
            await refreshModels();
          })
        }
      />
    </ActionPanel>
  );

  const renderItemActions = (model: Model) => (
    <ActionPanel>
      <Action
        title="New Model"
        shortcut={Keyboard.Shortcut.Common.New}
        onAction={() =>
          push(<ModelForm />, async () => {
            await refreshModels();
          })
        }
      />
      <Action
        title="Delete Conversation"
        style={Action.Style.Destructive}
        shortcut={Keyboard.Shortcut.Common.Remove}
        onAction={() => handleConfirmDelete(model)}
      />
    </ActionPanel>
  );

  return (
    <List isLoading={isLoadingModels} isShowingDetail={models.length !== 0} actions={renderListActions()}>
      {models.length === 0 ? (
        <List.EmptyView
          icon={{ source: "no-conversations.jpeg", mask: Image.Mask.RoundedRectangle }}
          title="No models yet"
          description="Create models for personalized conversations 🌟"
        />
      ) : (
        models.map((model) => (
          <List.Item
            key={model.id}
            id={model.id}
            title={model.name}
            detail={
              <List.Item.Detail
                isLoading={isLoadingModels}
                markdown={renderMarkdown(model)}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.TagList title="Name">
                      {model.model ? (
                        <List.Item.Detail.Metadata.TagList.Item text={model.name} color={Color.Blue} />
                      ) : (
                        <List.Item.Detail.Metadata.TagList.Item text={"Default"} color={Color.SecondaryText} />
                      )}
                    </List.Item.Detail.Metadata.TagList>
                    <List.Item.Detail.Metadata.Label title="Model" text={model.model} />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label title="Date Created" text={formatFullTime(model.createdAt)} />
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={renderItemActions(model)}
          />
        ))
      )}
    </List>
  );
}
