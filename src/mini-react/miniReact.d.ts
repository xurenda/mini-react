type TextElementType = 'TEXT_ELEMENT'
type RootElementType = 'ROOT'
type ElementType = keyof HTMLElementTagNameMap

interface ElementProps {
  children: ReactNode[]
  [other]: any
}

interface TextElementProps extends ElementProps {
  nodeValue: string
}

interface ReactNode {
  type: RootElementType | TextElementType | ElementType
  props: ElementProps
}

interface ReactTextNode extends ReactNode {
  type: TextElementType
  props: TextElementProps
}

// --------------
interface Scheduler {
  nextUnitOfWork: Fiber | null // 下一个工作
  wipRoot: Fiber | null // 正在进行的工作的 root
}

interface Fiber extends ReactNode {
  dom: HTMLElement | null
  child: Fiber | null
  sibling: Fiber | null
  parent: Fiber | null
}
