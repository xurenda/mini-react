type TextElementType = 'TEXT_ELEMENT'
type ElementType = keyof HTMLElementTagNameMap

interface ElementProps {
  children: ReactNode[]
  [other]: any
}

interface TextElementProps extends ElementProps {
  nodeValue: string
}

interface ReactNode {
  type: ElementType | TextElementType
  props: ElementProps
}

interface ReactTextNode extends ReactNode {
  type: TextElementType
  props: TextElementProps
}
