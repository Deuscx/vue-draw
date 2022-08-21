import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import type { fabric } from 'fabric'

const VERSION = 1

// Create the doc
export const doc = new Y.Doc()

export const roomID = `y-vuedraw-${VERSION}`

// Create a websocket provider
export const provider = new WebsocketProvider(
  'wss://demos.yjs.dev',
  roomID,
  doc,
  {
    connect: true,
  },
)

// Export the provider's awareness API
export const awareness = provider.awareness

export const yShapes: Y.Map<fabric.Object> = doc.getMap('shapes')
// export const yBindings: Y.Map<TDBinding> = doc.getMap('bindings')

// Create an undo manager for the shapes and binding maps
export const undoManager = new Y.UndoManager([yShapes])
