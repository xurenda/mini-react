export default function createElement(type: ElementType, props?: Record<string, any> | null, ...children: (ReactNode | string)[]): ReactNode {
  const _children: ReactNode[] = children.map(child => (typeof child === 'string' ? createTextElement(child) : child))

  return {
    type,
    props: {
      ...props,
      children: _children,
    },
  }
}

function createTextElement(text: string): ReactTextNode {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      children: [],
      nodeValue: text,
    },
  }
}
