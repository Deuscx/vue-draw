declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}


declare module fabric {
  interface Line {
    id: string
  }

  interface Rect {
    id: string
  }

  interface Ellipse {
    id: string
  }
  interface Triangle {
    id: string
  }
  interface Textbox {
    id: string
  }
  interface Object {
    id: string
  }
}