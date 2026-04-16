import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../services/auth.service'
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

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  const { data: admin, isLoading } = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: () => authService.getMe(),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CredentialsForm>({
    defaultValues: { currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' },
  })

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
      // Yangi token saqlash (username o'zgargan bo'lishi mumkin)
      localStorage.setItem('admin_token', result.access_token)
      reset()
      toast({ description: "Ma'lumotlar muvaffaqiyatli yangilandi!" })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Xatolik yuz berdi'
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
    <div className="max-w-xl p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sozlamalar</h1>
          <p className="text-sm text-muted-foreground">Username va parolni o'zgartirish</p>
        </div>
      </div>

      {/* Joriy ma'lumotlar */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Joriy username</p>
        <p className="mt-1 text-lg font-semibold">{admin?.username}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Joriy parol */}
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

        {/* Yangi username */}
        <div>
          <label className="mb-2 block text-sm font-medium">Yangi username</label>
          <Input
            {...register('newUsername')}
            placeholder="Yangi username (o'zgartirmasangiz bo'sh qoldiring)"
          />
          <p className="mt-1 text-xs text-muted-foreground">Kamida 3 ta belgi</p>
        </div>

        {/* Yangi parol */}
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

        {/* Parolni tasdiqlash */}
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
    </div>
  )
}
