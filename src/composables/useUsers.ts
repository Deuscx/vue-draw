// TODO: Room cursor awareness
import { Room } from '@y-presence/client'
import { awareness } from './store'
interface MultiplayerOptions {
  initPresence: any
}

interface ICursor {
  x: number
  y: number
}
interface IUser {
  name: string
  color: string
  cursor?: ICursor
}

interface IPresence {
  id: string
  presence: IUser
}
export default function useUsers(options: MultiplayerOptions) {
  const room = new Room<IUser>(awareness, options.initPresence)
  const others = ref<IUser[]>()
  const unsubOthers = room.subscribe('others', (v) => {
    others.value = v as any
  })

  return {
    unsubOthers,
    room,
    others,
  }
}
