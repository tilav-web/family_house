import api from '../lib/api'
import type {
  PanoramaHotspot,
  PanoramaHotspotPayload,
  PanoramaScene,
  PanoramaScenePayload,
  Room,
  RoomImage,
  RoomPayload,
} from '../types'

function appendFile(formData: FormData, file: File) {
  formData.append('file', file)
  return formData
}

export const roomsService = {
  findAll: () => api.get<Room[]>('/rooms').then((response) => response.data),
  findAllAdmin: () => api.get<Room[]>('/rooms/admin').then((response) => response.data),
  findOne: (id: string) => api.get<Room>(`/rooms/${id}`).then((response) => response.data),
  findOneAdmin: (id: string) =>
    api.get<Room>(`/rooms/admin/${id}`).then((response) => response.data),
  create: (data: RoomPayload) =>
    api.post<Room>('/rooms/admin', data).then((response) => response.data),
  update: (id: string, data: RoomPayload) =>
    api.patch<Room>(`/rooms/admin/${id}`, data).then((response) => response.data),
  delete: (id: string) => api.delete(`/rooms/admin/${id}`),
  addImages: (roomId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return api
      .post<RoomImage[]>(`/rooms/admin/${roomId}/images`, formData)
      .then((response) => response.data)
  },
  reorderImages: (roomId: string, imageIds: string[]) =>
    api
      .patch(`/rooms/admin/${roomId}/images/reorder`, { imageIds })
      .then((response) => response.data),
  deleteImage: (roomId: string, imageId: string) =>
    api.delete(`/rooms/admin/${roomId}/images/${imageId}`),
  setThumbnail: (roomId: string, imageId: string) =>
    api.patch(`/rooms/admin/${roomId}/thumbnail`, { imageId }).then((response) => response.data),
  createScene: (roomId: string, data: PanoramaScenePayload) =>
    api
      .post<PanoramaScene>(`/rooms/admin/${roomId}/scenes`, data)
      .then((response) => response.data),
  updateScene: (roomId: string, sceneId: string, data: Partial<PanoramaScenePayload>) =>
    api
      .patch<PanoramaScene>(`/rooms/admin/${roomId}/scenes/${sceneId}`, data)
      .then((response) => response.data),
  deleteScene: (roomId: string, sceneId: string) =>
    api.delete(`/rooms/admin/${roomId}/scenes/${sceneId}`),
  uploadScenePanorama: (roomId: string, sceneId: string, file: File) =>
    api
      .post<PanoramaScene>(
        `/rooms/admin/${roomId}/scenes/${sceneId}/panorama`,
        appendFile(new FormData(), file),
      )
      .then((response) => response.data),
  uploadSceneThumbnail: (roomId: string, sceneId: string, file: File) =>
    api
      .post<PanoramaScene>(
        `/rooms/admin/${roomId}/scenes/${sceneId}/thumbnail`,
        appendFile(new FormData(), file),
      )
      .then((response) => response.data),
  createHotspot: (roomId: string, sceneId: string, data: PanoramaHotspotPayload) =>
    api
      .post<PanoramaHotspot>(`/rooms/admin/${roomId}/scenes/${sceneId}/hotspots`, data)
      .then((response) => response.data),
  updateHotspot: (
    roomId: string,
    sceneId: string,
    hotspotId: string,
    data: Partial<PanoramaHotspotPayload>,
  ) =>
    api
      .patch<PanoramaHotspot>(
        `/rooms/admin/${roomId}/scenes/${sceneId}/hotspots/${hotspotId}`,
        data,
      )
      .then((response) => response.data),
  deleteHotspot: (roomId: string, sceneId: string, hotspotId: string) =>
    api.delete(`/rooms/admin/${roomId}/scenes/${sceneId}/hotspots/${hotspotId}`),
}
