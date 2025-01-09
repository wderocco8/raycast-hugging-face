import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FormValidation, useForm } from "@raycast/utils";
import { useModels } from "../../hooks/useModels";
import { Model } from "../../types/model";

interface ModelFormFormValues {
  name: string;
  prompt: string;
  model: string;
}

const inferenceModels = ["meta-llama/Meta-Llama-3-8B-Instruct", "Qwen/QwQ-32B-Preview", "Qwen/Qwen2.5-72B-Instruct"];

interface ModelFormProps {
  modelId?: string;
}

export default function ModelForm({ modelId }: ModelFormProps) {
  const { pop } = useNavigation();
  const { data: models, add, update, isLoading: isLoadingModels } = useModels();
  const [model, setModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { handleSubmit, itemProps, reset } = useForm<ModelFormFormValues>({
    async onSubmit(values) {
      if (isLoading) return;

      setIsLoading(true);

      if (modelId && model) {
        await update(model.id, values.name, values.prompt, values.model);
      } else {
        await add({
          id: uuidv4(),
          name: values.name || "Untitled Model",
          prompt: values.prompt,
          model: values.model,
          createdAt: new Date().toISOString(),
        });
      }

      pop();
      setIsLoading(false);
    },
    initialValues:
      modelId
        ? undefined
        : {
            prompt: "You are a helpful assistant.",
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
          },
    validation: {
      prompt: FormValidation.Required,
      model: FormValidation.Required,
    },
  });

  // Single useEffect to handle initialization
  useEffect(() => {
    if (isLoadingModels) {
      return;
    }

    const initializeForm = async () => {
      if (modelId) {
        const foundModel = models.find((m) => m.id === modelId);
        if (foundModel) {
          setModel(foundModel);
          reset({
            name: foundModel.name,
            prompt: foundModel.prompt,
            model: foundModel.model,
          });
        }
      }
      setIsLoading(false);
    };

    initializeForm();
  }, [isLoadingModels, modelId, models, reset]);

  useEffect(() => {
    console.log("Form values after reset", itemProps.model.value);
  }, [itemProps.model.value]);

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title={modelId ? "Update Model" : "Create Model"} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField title="Name" placeholder="Enter a custom name (optional)..." {...itemProps.name} />
      <Form.TextArea title="Prompt" placeholder="Enter a custom prompt..." {...itemProps.prompt} />
      <Form.Dropdown title="Model" {...itemProps.model} info="To find more models, go to...">
        {inferenceModels.map((model, index) => (
          <Form.Dropdown.Item key={index} value={model} title={model} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
