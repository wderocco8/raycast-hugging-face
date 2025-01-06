/**
 * ModelForm Component
 *
 * This file defines a form-based...
 *
 */

import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FormValidation, useForm } from "@raycast/utils";
import { useModels } from "../../hooks/useModels";

interface ModelFormFormValues {
  name: string;
  prompt: string;
  model: string;
}

const models = ["meta-llama/Meta-Llama-3-8B-Instruct", "Qwen/QwQ-32B-Preview", "Qwen/Qwen2.5-72B-Instruct"];

export default function ModelForm() {
  const { pop } = useNavigation();
  const { add } = useModels();
  const [loading, setLoading] = useState<boolean>(false);

  const { handleSubmit, itemProps } = useForm<ModelFormFormValues>({
    async onSubmit(values) {
      if (loading) return; // Prevent duplicate submissions

      setLoading(true);

      await add({
        id: uuidv4(),
        name: values.name ?? "Untitled Model",
        prompt: values.prompt,
        model: values.model,
        createdAt: new Date().toISOString(),
      });

      pop(); // Redirect back to Models
      setLoading(false);
    },
    initialValues: {
      prompt: "You are a helpful assistant.",
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
    },
    validation: {
      prompt: FormValidation.Required,
      model: FormValidation.Required,
    },
  });

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Chat" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="Name"
        placeholder="Enter a custom name to reference the form (optional)..."
        {...itemProps.name}
      />
      <Form.TextArea title="Prompt" placeholder="Enter a custom prompt..." {...itemProps.prompt} />
      {/* TODO: add ability to request new models */}
      <Form.Dropdown
        title="Prompt"
        placeholder="Enter a custom prompt..."
        {...itemProps.model}
        info="To find more models, go to..."
      >
        {models.map((model) => (
          <Form.Dropdown.Item value={model} title={model} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
