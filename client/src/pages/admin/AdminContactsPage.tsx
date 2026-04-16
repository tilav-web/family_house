import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { contactsService } from '../../services/contacts.service'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Trash2, MessageSquare } from 'lucide-react'
import { useToast } from '../../components/ui/use-toast'

export default function AdminContactsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ['contacts', page],
    queryFn: () => contactsService.findAll(page, 20),
  })

  const { mutate: markAsRead, isPending: markingRead } = useMutation({
    mutationFn: (id: string) => contactsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast({ description: 'Marked as read' })
    },
  })

  const { mutate: deleteContact, isPending: deletingContact } = useMutation({
    mutationFn: (id: string) => contactsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast({ description: 'Contact deleted' })
    },
  })

  const contacts = contactsData?.items || []

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Contacts</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Contacts</h1>

      <div className="grid gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className={!contact.isRead ? 'border-primary' : ''}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {!contact.isRead && <MessageSquare className="h-4 w-4 text-primary" />}
                  {contact.name}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">{contact.email || contact.phone}</p>
              </div>
              <div className="flex gap-2">
                {!contact.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={markingRead}
                    onClick={() => markAsRead(contact.id)}
                  >
                    {markingRead ? '...' : 'Mark Read'}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingContact}
                  onClick={() => deleteContact(contact.id)}
                >
                  {deletingContact ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{contact.message}</p>
              <p className="text-xs text-slate-500 mt-2">
                {new Date(contact.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {contactsData && contactsData.total > 20 && (
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {Math.ceil(contactsData.total / 20)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(contactsData.total / 20)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
