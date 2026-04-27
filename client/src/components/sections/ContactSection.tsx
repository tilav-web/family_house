import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Send, Phone, Mail, MapPin } from 'lucide-react'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { contactsService } from '../../services/contacts.service'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useToast } from '../ui/use-toast'
import { ScrollReveal } from '../shared/ScrollReveal'

const contactSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  phone: z.string().min(9, 'Phone required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  message: z.string().min(10, 'Message too short'),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactSection() {
  const { t, i18n } = useTranslation()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { phone: '' },
  })

  const { mutate: submitContact } = useMutation({
    mutationFn: (data: ContactFormData) =>
      contactsService.create({
        ...data,
        language: i18n.language,
      }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: t('contact.success'),
      })
      reset()
    },
    onError: () => {
      toast({
        title: 'Error',
        description: t('contact.error'),
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: ContactFormData) => {
    submitContact(data)
  }

  return (
    <section id="contact" className="client-section overflow-hidden py-24 lg:py-32">
      <div className="client-grid" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <ScrollReveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="client-label">{t('contact.label')}</span>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('contact.title')}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="client-badge self-start lg:self-auto">
            {t('contact.phoneLabel')}
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 max-w-6xl mx-auto">
          <ScrollReveal direction="left" className="lg:col-span-2 space-y-4">
            <div className="client-panel rounded-lg px-6 py-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Family House
              </p>
              <p className="mt-4 text-lg font-semibold text-foreground">
                {t('contact.subtitle')}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t('contact.address')}
              </p>
            </div>

            <div className="client-panel-strong flex items-start gap-4 rounded-lg p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('contact.phoneLabel')}</h3>
                <p className="text-muted-foreground text-sm mt-1">{t('contact.phoneNumber')}</p>
              </div>
            </div>

            <div className="client-panel-strong flex items-start gap-4 rounded-lg p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('contact.emailLabel')}</h3>
                <p className="text-muted-foreground text-sm mt-1">{t('contact.emailAddress')}</p>
              </div>
            </div>

            <div className="client-panel-strong flex items-start gap-4 rounded-lg p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('contact.addressLabel')}</h3>
                <p className="text-muted-foreground text-sm mt-1">{t('contact.address')}</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2} className="lg:col-span-3">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="client-panel-strong space-y-5 rounded-lg p-8"
            >
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('contact.name')}
                </label>
                <Input
                  {...register('name')}
                  placeholder={t('contact.namePlaceholder')}
                  disabled={isSubmitting}
                  className="h-11 rounded-lg border-[var(--client-line)] bg-background/70 focus:border-primary"
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1.5">{errors.name.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {t('contact.phone')}
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        defaultCountry="uz"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        inputClassName="!h-11 !w-full !rounded-r-lg !border-[var(--client-line)] !border-l-0 !bg-transparent !pl-3 !text-sm focus:!border-primary"
                        countrySelectorStyleProps={{
                          buttonClassName: '!mr-0 !h-11 !rounded-l-lg !border-[var(--client-line)] !px-3',
                          dropdownStyleProps: {
                            className: '!mt-1 !rounded-lg !border-[var(--client-line)] !shadow-xl',
                          },
                        }}
                        dialCodePreviewStyleProps={{
                          className: '!text-sm !text-muted-foreground !pl-1 !pr-2',
                        }}
                        className="phone-input-wrapper"
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-xs mt-1.5">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {t('contact.email')}
                  </label>
                  <Input
                    {...register('email')}
                    placeholder="email@example.com"
                    type="email"
                    disabled={isSubmitting}
                    className="h-11 rounded-lg border-[var(--client-line)] bg-background/70 focus:border-primary"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('contact.message')}
                </label>
                <Textarea
                  {...register('message')}
                  placeholder={t('contact.messagePlaceholder')}
                  rows={5}
                  disabled={isSubmitting}
                  className="resize-none rounded-lg border-[var(--client-line)] bg-background/70 focus:border-primary"
                />
                {errors.message && (
                  <p className="text-destructive text-xs mt-1.5">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full rounded-lg text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('admin.loading')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {t('contact.send')}
                  </span>
                )}
              </Button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
