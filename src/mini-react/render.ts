import { isNotChildrenProps } from './util'

export default function render(element: ReactNode, container: HTMLElement) {
  let node: HTMLElement | Text
  if (element.type === 'TEXT_ELEMENT') {
    node = document.createTextNode((element as ReactTextNode).props.nodeValue)
  } else {
    node = document.createElement(element.type)

    Object.keys(element.props)
      .filter(isNotChildrenProps)
      .forEach(prop => {
        ;(node as HTMLElement).setAttribute(prop, (element.props as Record<string, any>)[prop])
      })

    element.props.children.forEach(child => render(child, node as HTMLElement))
  }

  container.appendChild(node)
}
