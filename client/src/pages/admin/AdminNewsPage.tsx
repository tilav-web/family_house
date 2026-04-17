import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { newsService } from '../../services/news.service'
import { EmptyState } from '../../components/admin/EmptyState'
import { Button } from '../../components/ui/button'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Trash2, Plus, Edit } from 'lucide-react'
import { useToast } from '../../components/ui/use-toast'

export default function AdminNewsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['admin', 'news'],
    queryFn: () => newsService.findAllAdmin(1, 50),
  })

  const { mutate: deleteNews, isPending: deletingNews } = useMutation({
    mutationFn: (id: string) => newsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] })
      toast({ description: 'News deleted' })
    },
  })

  const news = newsData?.items || []

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">News</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">News</h1>
        <Button onClick={() => navigate('/admin/news/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add News
        </Button>
      </div>

      {news.length === 0 ? (
        <EmptyState title="Hozircha yangiliklar yo'q" description="Yangi yangilik qo'shish uchun yuqoridagi tugmani bosing" />
      ) : (
      <div className="grid gap-4">
        {news.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{item.title.uz}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/news/${item.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingNews}
                  onClick={() => deleteNews(item.id)}
                >
                  {deletingNews ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      )}
    </div>
  )
}
