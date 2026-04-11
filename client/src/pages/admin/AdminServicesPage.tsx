import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesService } from '../../services/services.service'
import type { Service } from '../../types'
import { Button } from '../../components/ui/button'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Input } from '../../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Trash2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useToast } from '../../components/ui/use-toast'

interface ServiceFormValues {
  uz_title: string
  ru_title: string
  en_title: string
  uz_description: string
  ru_description: string
  en_description: string
  iconName: string
  order: number
  isActive: boolean
}

const defaultValues: ServiceFormValues = {
  uz_title: '',
  ru_title: '',
  en_title: '',
  uz_description: '',
  ru_description: '',
  en_description: '',
  iconName: 'Star',
  order: 0,
  isActive: true,
}

export default function AdminServicesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin', 'services'],
    queryFn: () => servicesService.findAllAdmin(),
  })

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues,
  })

  const { mutate: saveService, isPending } = useMutation({
    mutationFn: (data: ServiceFormValues) => {
      const serviceData = {
        title: {
          uz: data.uz_title,
          ru: data.ru_title,
          en: data.en_title,
        },
        description: {
          uz: data.uz_description,
          ru: data.ru_description,
          en: data.en_description,
        },
        iconName: data.iconName,
        order: data.order,
        isActive: data.isActive,
      }

      if (editingService) {
        return servicesService.update(editingService.id, serviceData)
      }
      return servicesService.create(serviceData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast({ description: 'Service saved successfully' })
      setIsDialogOpen(false)
      reset()
      setEditingService(null)
    },
    onError: () => {
      toast({ description: 'Error saving service', variant: 'destructive' })
    },
  })

  const { mutate: deleteService } = useMutation({
    mutationFn: (id: string) => servicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast({ description: 'Service deleted' })
    },
  })

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setValue('uz_title', service.title.uz)
    setValue('ru_title', service.title.ru)
    setValue('en_title', service.title.en)
    setValue('uz_description', service.description.uz)
    setValue('ru_description', service.description.ru)
    setValue('en_description', service.description.en)
    setValue('iconName', service.iconName)
    setValue('order', service.order)
    setValue('isActive', service.isActive)
    setIsDialogOpen(true)
  }

  const handleNewService = () => {
    setEditingService(null)
    reset(defaultValues)
    setIsDialogOpen(true)
  }

  const onSubmit = (data: ServiceFormValues) => {
    saveService(data)
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Services</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewService}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title (UZ)</label>
                  <Input {...register('uz_title')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Title (RU)</label>
                  <Input {...register('ru_title')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Title (EN)</label>
                  <Input {...register('en_title')} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description (UZ)</label>
                  <Input {...register('uz_description')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description (RU)</label>
                  <Input {...register('ru_description')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description (EN)</label>
                  <Input {...register('en_description')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Icon Name</label>
                  <Input {...register('iconName')} placeholder="e.g., Star, Heart, Settings" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <Input {...register('order', { valueAsNumber: true })} type="number" />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" {...register('isActive')} />
                Visible on public website
              </label>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{service.title.uz}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {service.iconName} • order {service.order} •{' '}
                  {service.isActive ? 'active' : 'inactive'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(service)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteService(service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
