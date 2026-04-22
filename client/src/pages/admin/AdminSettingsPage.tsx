import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Shield, Eye, EyeOff, Send, CheckCircle2, AlertTriangle } from 'lucide-react'
import { authService } from '../../services/auth.service'
import {
  botSettingsService,
  type UpdateBotSettingsPayload,
} from '../../services/bot-settings.service'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Skeleton } from '../../components/ui/skeleton'
import { useToast } from '../../components/ui/use-toast'

interface CredentialsForm {
  currentPassword: string
  newUsername: string
  newPassword: string
  confirmPassword: string
}

interface BotSettingsForm {
  botToken: string
  channelId: string
  webhookSecret: string
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showBotToken, setShowBotToken] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)

  const { data: admin, isLoading } = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: () => authService.getMe(),
  })

  const { data: botSettings, isLoading: loadingBot } = useQuery({
    queryKey: ['admin', 'bot-settings'],
    queryFn: () => botSettingsService.get(),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CredentialsForm>({
    defaultValues: { currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' },
  })

  const botForm = useForm<BotSettingsForm>({
    defaultValues: { botToken: '', channelId: '', webhookSecret: '' },
  })

  useEffect(() => {
    botForm.reset({
      botToken: '',
      channelId: botSettings?.channelId ?? '',
      webhookSecret: '',
    })
  }, [botSettings?.channelId, botForm])

  const { mutate: changeCredentials, isPending } = useMutation({
    mutationFn: (data: CredentialsForm) => {
      const payload: { currentPassword: string; newUsername?: string; newPassword?: string } = {
        currentPassword: data.currentPassword,
      }
      if (data.newUsername.trim()) payload.newUsername = data.newUsername.trim()
      if (data.newPassword) payload.newPassword = data.newPassword
      return authService.changeCredentials(payload)
    },
    onSuccess: (result) => {
      localStorage.setItem('admin_token', result.access_token)
      reset()
      toast({ description: "Ma'lumotlar muvaffaqiyatli yangilandi!" })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Xatolik yuz berdi'
      toast({ description: message, variant: 'destructive' })
    },
  })

  const { mutate: saveBotSettings, isPending: savingBot } = useMutation({
    mutationFn: (data: BotSettingsForm) => {
      const payload: UpdateBotSettingsPayload = {}
      if (data.botToken.trim()) payload.botToken = data.botToken.trim()
      if (data.channelId.trim() !== (botSettings?.channelId ?? '').trim()) {
        payload.channelId = data.channelId.trim()
      }
      if (data.webhookSecret.trim()) payload.webhookSecret = data.webhookSecret.trim()
      return botSettingsService.update(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'bot-settings'] })
      toast({ description: "Bot sozlamalari saqlandi va webhook yangilandi" })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Xatolik yuz berdi'
      toast({ description: message, variant: 'destructive' })
    },
  })

  const { mutate: testBot, isPending: testingBot } = useMutation({
    mutationFn: () => botSettingsService.test(),
    onSuccess: () => toast({ description: "Test xabar yuborildi! Kanalni tekshiring" }),
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Test xabar yuborilmadi"
      toast({ description: message, variant: 'destructive' })
    },
  })

  const onSubmit = (data: CredentialsForm) => {
    if (!data.newUsername.trim() && !data.newPassword) {
      toast({ description: "Yangi username yoki paroldan birini kiriting", variant: 'destructive' })
      return
    }
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      toast({ description: "Parollar mos kelmayapti", variant: 'destructive' })
      return
    }
    if (data.newPassword && data.newPassword.length < 6) {
      toast({ description: "Parol kamida 6 ta belgi bo'lishi kerak", variant: 'destructive' })
      return
    }
    changeCredentials(data)
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-96 max-w-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-xl p-8 space-y-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sozlamalar</h1>
          <p className="text-sm text-muted-foreground">Admin hisob va tizim sozlamalari</p>
        </div>
      </div>

      {/* ═══════════ Admin credentials ═══════════ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold mb-1">Admin ma'lumotlari</h2>
        <p className="text-sm text-muted-foreground mb-5">Username va parolni o'zgartirish</p>

        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Joriy username</p>
          <p className="mt-1 text-lg font-semibold">{admin?.username}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Joriy parol <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                {...register('currentPassword', { required: 'Joriy parolni kiriting' })}
                type={showCurrentPw ? 'text' : 'password'}
                placeholder="Hozirgi parolingiz"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <hr className="border-slate-200" />

          <div>
            <label className="mb-2 block text-sm font-medium">Yangi username</label>
            <Input
              {...register('newUsername')}
              placeholder="Yangi username (o'zgartirmasangiz bo'sh qoldiring)"
            />
            <p className="mt-1 text-xs text-muted-foreground">Kamida 3 ta belgi</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Yangi parol</label>
            <div className="relative">
              <Input
                {...register('newPassword')}
                type={showNewPw ? 'text' : 'password'}
                placeholder="Yangi parol (o'zgartirmasangiz bo'sh qoldiring)"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Kamida 6 ta belgi</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Parolni tasdiqlash</label>
            <Input
              {...register('confirmPassword')}
              type="password"
              placeholder="Yangi parolni qayta kiriting"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saqlanmoqda...
              </span>
            ) : (
              "O'zgarishlarni saqlash"
            )}
          </Button>
        </form>
      </section>

      {/* ═══════════ Telegram Bot ═══════════ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
            <Send className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-lg font-bold">Telegram Bot</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Sayt kontakt formasi orqali kelgan xabarlarni Telegram kanalga yuborish uchun
        </p>

        {loadingBot ? (
          <Skeleton className="h-64" />
        ) : (
          <>
            {/* Status */}
            <div className="mb-5 grid gap-2">
              <div className="flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                {botSettings?.hasBotToken ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                <span className="font-medium">Bot token:</span>
                <span className="text-muted-foreground">
                  {botSettings?.botTokenMasked ?? 'sozlanmagan'}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                {botSettings?.channelId ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                <span className="font-medium">Kanal ID:</span>
                <span className="text-muted-foreground">
                  {botSettings?.channelId ?? 'sozlanmagan'}
                </span>
              </div>
            </div>

            <form
              onSubmit={botForm.handleSubmit((d) => saveBotSettings(d))}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Bot token
                  {botSettings?.hasBotToken && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (o'zgartirmasangiz bo'sh qoldiring)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Input
                    {...botForm.register('botToken')}
                    type={showBotToken ? 'text' : 'password'}
                    placeholder="123456789:AAEhBP..."
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBotToken(!showBotToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showBotToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  @BotFather dan oling. Saqlangach, webhook avtomatik ro'yxatdan o'tadi.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Kanal ID</label>
                <Input
                  {...botForm.register('channelId')}
                  placeholder="-1001234567890 yoki @kanal_username"
                  autoComplete="off"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Private kanal uchun -100... raqam. Botni kanalga admin qilib qo'shing.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Webhook secret (ixtiyoriy)
                  {botSettings?.hasWebhookSecret && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (o'zgartirmasangiz bo'sh qoldiring)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Input
                    {...botForm.register('webhookSecret')}
                    type={showWebhookSecret ? 'text' : 'password'}
                    placeholder="Tasodifiy matn"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Webhook so'rovlarini tekshirish uchun. Tavsiya etiladi.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={savingBot} className="flex-1">
                  {savingBot ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={testingBot || !botSettings?.hasBotToken || !botSettings?.channelId}
                  onClick={() => testBot()}
                >
                  {testingBot ? 'Yuborilmoqda...' : 'Test xabar'}
                </Button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
