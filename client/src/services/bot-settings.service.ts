import api from '../lib/api'

export interface BotSettingsView {
  botTokenMasked: string | null
  hasBotToken: boolean
  channelId: string | null
  hasWebhookSecret: boolean
  updatedAt: string | null
}

export interface UpdateBotSettingsPayload {
  botToken?: string
  channelId?: string
  webhookSecret?: string
}

export const botSettingsService = {
  get: () =>
    api.get<BotSettingsView>('/admin/bot-settings').then((res) => res.data),
  update: (payload: UpdateBotSettingsPayload) =>
    api
      .patch<BotSettingsView>('/admin/bot-settings', payload)
      .then((res) => res.data),
  test: () =>
    api
      .post<{ ok: true }>('/admin/bot-settings/test')
      .then((res) => res.data),
}
