import type { fabric } from 'fabric'
import {
  doc,
  provider,
  undoManager,
  yShapes,
} from './store'
import useState from '~/composables/useState'

export function useMultiplayer() {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  function onMount(canvas: fabric.Canvas) {
    setCanvas(canvas)
  }
  function onChangePage({ objects }: { objects: fabric.Object[] }) {
    console.log('onChangePage', objects)
    undoManager.stopCapturing()
    yShapes.clear()
    doc.transact(() => {
      // added new or remove
      objects.forEach((object) => {
        yShapes.set(object.id, object)
      })
    })
  }

  const onUndo = () => undoManager.undo()
  const onRedo = () => undoManager.redo()

  function handleDisconnect() {
    provider.disconnect()
  }
  window.addEventListener('beforeunload', handleDisconnect)
  function handleChanges() {
    canvas.value?.loadFromJSON({ objects: [...yShapes.values()] }, () => { })
  }
  async function setup() {
    yShapes.observeDeep(handleChanges)
    handleChanges()
  }

  tryOnMounted(() => {
    setup()
  })

  tryOnUnmounted(() => {
    window.removeEventListener('beforeunload', handleDisconnect)
    yShapes.unobserveDeep(handleChanges)
  })

  return {
    onMount,
    onChangePage,
    onUndo,
    onRedo,
  }
}

