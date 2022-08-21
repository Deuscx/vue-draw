<script lang="ts" setup>
import { fabric } from 'fabric'
import { nanoid } from 'nanoid'
const props = defineProps<{
  onMount: (canvas: fabric.Canvas) => void
  undo: () => void
  redo: () => void
}>()

/**
 * How to set additional properties in all fabric.Objects · fabricjs/fabric.js Wiki:
 * https://github.com/fabricjs/fabric.js/wiki/How-to-set-additional-properties-in-all-fabric.Objects
 */

const emit = defineEmits(['changePage'])
let rectInstance: fabric.Rect | null
let ellipseInstance: fabric.Ellipse | null
let triangleInstance: fabric.Triangle | null
let textInstance: fabric.Textbox | null
let lineInstance: fabric.Line | null
/**
 * 记录绘制的起点
 */
let origX: number
let origY: number

enum ToolType {
  DEFAULT = 'DEFAULT',
  RECTANGLE = 'RECTANGLE',
  TRIANGLE = 'TRIANGLE',
  ELLIPSE = 'ELLIPSE',
  LINE = 'LINE',
  TEXT = 'TEXT',
  PENCIL = 'PENCIL',
  ERASER = 'ERASER',
  SELECT = 'SELECT',
}

const fill = ref(false)
const brushWidth = ref(5)
const currentColor = ref('#000')
const selectedTool = ref(ToolType.DEFAULT)
const canvasRef = ref<HTMLCanvasElement>()
let canvas: fabric.Canvas

function handleSelectTool(tool: ToolType) {
  selectedTool.value = tool
  if (!canvas)
    return
  canvas.selection = false
  canvas.isDrawingMode = tool === ToolType.PENCIL
  canvas.skipTargetFind = tool !== ToolType.SELECT
  canvas.selection = tool === ToolType.SELECT
  canvas.discardActiveObject()
  const drawObjects = canvas.getObjects()
  if (drawObjects.length > 0) {
    drawObjects.forEach((item) => {
      item.selectable = tool === ToolType.SELECT
    })
  }
}
const initCanvas = () => {
  canvas = new fabric.Canvas(canvasRef.value!, {
    fill: '#000',
    width: canvasRef.value?.clientWidth,
    height: canvasRef.value?.clientHeight,
    selectionBorderColor: '#4447A9',

  })
  fabric.Object.prototype.transparentCorners = false
  fabric.Object.prototype.cornerStyle = 'circle'
  fabric.Object.prototype.cornerColor = '#4447A9'
  fabric.Object.prototype.cornerSize = 6
  fabric.Object.prototype.padding = 10
  fabric.Object.prototype.borderDashArray = [5, 5]

  canvas.on('mouse:down', (e: fabric.IEvent) => {
    if (!canvas)
      return
    switch (selectedTool.value) {
      case ToolType.LINE:
        return enterDrawLine(e)
      case ToolType.RECTANGLE:
        return enterDrawRectangle(e)
      case ToolType.ELLIPSE:
        return enterDrawEllipse(e)
      case ToolType.TRIANGLE:
        return enterDrawTriangle(e)
      case ToolType.TEXT:
        return enterDrawText(e)
      case ToolType.SELECT:
        return enterSelect(e)
      case ToolType.PENCIL:
        return enterDrawPencil(e)
      case ToolType.ERASER:
        return enterEraser(e)
      default:
        break
    }
  })

  canvas.on('mouse:move', (e) => {
    if (!canvas)
      return
    switch (selectedTool.value) {
      case ToolType.LINE:
        return drawLine(e)
      case ToolType.RECTANGLE:
        return drawRectangle(e)
      case ToolType.ELLIPSE:
        return drawEllipse(e)
      case ToolType.TRIANGLE:
        return drawTriangle(e)
      case ToolType.ERASER:
        return erase(e)
      default:
        break
    }
  })

  canvas.on('mouse:up', (e) => {
    if (!canvas)
      return
    switch (selectedTool.value) {
      case ToolType.LINE:
        if (!lineInstance)
          return
        // 长度短的移除
        if (origX === lineInstance.get('x2') && origY === lineInstance.get('y2'))
          canvas.remove(lineInstance)

        lineInstance = null
        canvas.discardActiveObject()
        emitCanvasData()
        break
      case ToolType.RECTANGLE:
        if (!rectInstance)
          return
        if (rectInstance.get('width') === 0 || rectInstance.get('height') === 0)
          canvas.remove(rectInstance)
        rectInstance = null
        canvas.discardActiveObject()
        emitCanvasData()
        break
      case ToolType.ELLIPSE:
        if (!ellipseInstance)
          return
        if (ellipseInstance.get('rx') === 0 || ellipseInstance.get('ry') === 0)
          canvas.remove(ellipseInstance)
        ellipseInstance = null
        canvas.discardActiveObject()
        emitCanvasData()
        break
      case ToolType.TRIANGLE:
        if (!triangleInstance)
          return
        if (triangleInstance.get('width') === 0 || triangleInstance.get('height') === 0)
          canvas.remove(triangleInstance)
        triangleInstance = null
        canvas.discardActiveObject()
        emitCanvasData()
        break
      default:
        break
    }
  })

  canvas.on('path:created', (e) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    e.path.id = nanoid()
    emitCanvasData()
  })

  canvas.on('object:modified', (e) => {
    emitCanvasData()
  })
  return canvas
}

function emitCanvasData() {
  if (!canvas)
    return
  const data = canvas.toObject(['id'])
  emit('changePage', data)
}
onMounted(() => {
  const c = initCanvas()
  props?.onMount(c)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  window.canvasInstance = canvas
})

/*  ==== line  ==== */
function enterDrawLine(e: fabric.IEvent) {
  if (!canvas)
    return
  const pointer = canvas.getPointer(e.e)
  origX = pointer.x
  origY = pointer.y
  lineInstance = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
    strokeWidth: brushWidth.value,
    stroke: currentColor.value,
    selectable: false,
  })
  lineInstance.id = nanoid()
  canvas.add(lineInstance)
  canvas.requestRenderAll()
}

function drawLine(e: fabric.IEvent) {
  if (!lineInstance)
    return
  const pointer = canvas.getPointer(e.e)
  lineInstance.set({
    x2: pointer.x,
    y2: pointer.y,
  })
  lineInstance.setCoords()
  canvas.requestRenderAll()
}

/* ==== rectangle ==== */

function enterDrawRectangle(e: fabric.IEvent) {
  const pointer = canvas.getPointer(e.e)
  origX = pointer.x
  origY = pointer.y
  rectInstance = new fabric.Rect({
    stroke: currentColor.value,
    strokeWidth: brushWidth.value,
    fill: fill.value ? currentColor.value : 'transparent',
    left: origX,
    top: origY,
    selectable: false,
  })
  rectInstance.id = nanoid()
  canvas.add(rectInstance)

  // drawInstance.on('mousedown', (e) => {
  //   if (options.currentMode === tool.ERASER) {
  //     console.log('刪除', e)
  //     canvas.remove(e.target)
  //   }
  // })
}

function drawRectangle(e: fabric.IEvent) {
  if (!rectInstance)
    return
  const pointer = canvas.getPointer(e.e)

  if (pointer.x < origX)
    rectInstance.set('left', pointer.x)

  if (pointer.y < origY)
    rectInstance.set('top', pointer.y)

  rectInstance.set({
    width: Math.abs(pointer.x - origX),
    height: Math.abs(pointer.y - origY),
  })
  rectInstance.setCoords()
  canvas.renderAll()
}

/* ==== Ellipse ==== */
function enterDrawEllipse(e: fabric.IEvent) {
  const pointer = canvas.getPointer(e.e)
  origX = pointer.x
  origY = pointer.y
  ellipseInstance = new fabric.Ellipse({
    stroke: currentColor.value,
    strokeWidth: brushWidth.value,
    fill: fill.value ? currentColor.value : 'transparent',
    left: origX,
    top: origY,
    cornerSize: 7,
    objectCaching: false,
    selectable: false,
  })
  ellipseInstance.id = nanoid()
  canvas.add(ellipseInstance)
}

function drawEllipse(e: fabric.IEvent) {
  if (!ellipseInstance)
    return
  const pointer = canvas.getPointer(e.e)
  if (pointer.x < origX)
    ellipseInstance.set('left', pointer.x)

  if (pointer.y < origY)
    ellipseInstance.set('top', pointer.y)

  ellipseInstance.set({
    rx: Math.abs(pointer.x - origX) / 2,
    ry: Math.abs(pointer.y - origY) / 2,
  })
  ellipseInstance.setCoords()
  canvas.renderAll()
}

/* === triangle === */
function enterDrawTriangle(e: fabric.IEvent) {
  const pointer = canvas.getPointer(e.e)
  origX = pointer.x
  origY = pointer.y
  triangleInstance = new fabric.Triangle({
    stroke: currentColor.value,
    strokeWidth: brushWidth.value,
    fill: fill.value ? currentColor.value : 'transparent',
    left: pointer.x,
    top: pointer.y,
    selectable: false,
  })
  triangleInstance.id = nanoid()
  canvas.add(triangleInstance)
}

function drawTriangle(e: fabric.IEvent) {
  if (!triangleInstance)
    return
  const pointer = canvas.getPointer(e.e)
  if (pointer.x < origX)
    triangleInstance.set('left', pointer.x)

  if (pointer.y < origY)
    triangleInstance.set('top', pointer.y)

  triangleInstance.set({
    width: Math.abs(pointer.x - origX),
    height: Math.abs(pointer.y - origY),
  })

  triangleInstance.setCoords()
  canvas.renderAll()
}

// text
function enterDrawText(e: fabric.IEvent) {
  const pointer = canvas.getPointer(e.e)
  textInstance = new fabric.Textbox('', {
    left: pointer.x,
    top: pointer.y,
    fill: currentColor.value,
    selectable: false,
  })
  textInstance.id = nanoid()

  canvas.add(textInstance)
  canvas.setActiveObject(textInstance)
  textInstance.enterEditing()
  textInstance.on('editing:exited', (e) => {
    selectedTool.value = ToolType.SELECT
    emitCanvasData()
    if (!canvas)
      return
    if (!textInstance)
      return
    if (!textInstance.text?.trim())
      canvas.remove(textInstance)
  })
}

//
function enterEraser(e: fabric.IEvent) {
  canvas.isDrawingMode = false
}

function erase(e: fabric.IEvent) {
  if (!canvas)
    return
  const p = canvas.getPointer(e.e)
  canvas.forEachObject((obj) => {
    if (!obj)
      return
    if (obj.containsPoint(p as fabric.Point))
      canvas.remove(obj)
  })

  canvas.renderAll()
}

// select mode
function enterSelect(e: fabric.IEvent) {
  if (!canvas)
    return
  selectedTool.value = ToolType.SELECT
  canvas.hoverCursor = 'all-scroll'
}

function clearCanvas() {
  canvas.getObjects().forEach((item) => {
    if (item !== canvas.backgroundImage)
      canvas.remove(item)
  })
  emitCanvasData()
}
function canvasToJson() {
  if (!canvas)
    return
  alert(JSON.stringify(canvas.toJSON()))
}

function enterDrawPencil(e: fabric.IEvent) {
  if (!canvas)
    return
  canvas.freeDrawingBrush.width = brushWidth.value
  canvas.freeDrawingBrush.color = currentColor.value
  canvas.isDrawingMode = true
}
</script>

<template>
  <div>
    <button btn :disabled="selectedTool === ToolType.LINE" @click="handleSelectTool(ToolType.LINE)">
      line
    </button>
    <button btn :disabled="selectedTool === ToolType.RECTANGLE" @click="handleSelectTool(ToolType.RECTANGLE)">
      Rectangle
    </button>
    <button btn :disabled="selectedTool === ToolType.ELLIPSE" @click="handleSelectTool(ToolType.ELLIPSE)">
      Ellipse
    </button>
    <button btn :disabled="selectedTool === ToolType.TRIANGLE" @click="() => handleSelectTool(ToolType.TRIANGLE)">
      Triangle
    </button>
    <button btn @click="handleSelectTool(ToolType.PENCIL)">
      Pencil
    </button>
    <button btn @click="handleSelectTool(ToolType.TEXT)">
      Text
    </button>
    <button btn @click="handleSelectTool(ToolType.SELECT)">
      SelectMode
    </button>
    <button btn @click="handleSelectTool(ToolType.ERASER)">
      Eraser
    </button>
    <button btn @click="clearCanvas()">
      Delete
    </button>
    <div>
      <button btn if="undo" @click="undo">
        undo
      </button>
      <button btn if="redo" @click="redo">
        redo
      </button>
    </div>
    <div>
      <input id="fill" type="checkbox" name="fill" @v-model="fill">
      <label htmlFor="fill">fill</label>
    </div>
    <div>
      <input id="color" v-model="currentColor" type="color" name="color">
    </div>
    <input v-model="brushWidth" type="range" min="1" max="20" step="1">
    <button @click="canvasToJson">
      To Json
    </button>
  </div>
  <canvas id="canvas" ref="canvasRef" h100vh w100vw />
</template>

<style scoped>
</style>
