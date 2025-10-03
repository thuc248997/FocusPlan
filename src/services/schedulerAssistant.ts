import Constants from 'expo-constants';

export type AssistantMessageRole = 'system' | 'user' | 'assistant';

export interface AssistantMessage {
  role: AssistantMessageRole;
  content: string;
}

type ExtraConfig = {
  openAIApiKey?: string;
  openAIModel?: string;
};

const CHAT_COMPLETIONS_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

const resolveExtraConfig = (): ExtraConfig =>
  (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as ExtraConfig;

export const invokeSchedulerAssistant = async (
  messages: AssistantMessage[]
): Promise<string> => {
  const extra = resolveExtraConfig();
  const apiKey = extra.openAIApiKey;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Add it to your environment before using the assistant.');
  }

  const response = await fetch(CHAT_COMPLETIONS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: extra.openAIModel || DEFAULT_MODEL,
      temperature: 0.2,
      messages
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Assistant request failed (status ${response.status}): ${message}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Assistant response did not include any content.');
  }

  return content;
};
