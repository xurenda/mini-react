export function isNotChildrenProps(propsKey: string) {
  return propsKey !== 'children'
}

export function isEventProp(propKey: string) {
  return propKey.startsWith('on')
}

export function createDOM(fiber: Fiber): HTMLElement | Text {
  switch (fiber.type) {
    case 'ROOT': {
      throw new Error('should not create the ROOT DOM!')
    }
    case 'TEXT_ELEMENT': {
      const node = document.createTextNode('')
      node['nodeValue'] = (fiber.props as TextElementProps).nodeValue
      return node
    }
    default: {
      const node = document.createElement(fiber.type) as HTMLElement
      Object.keys(fiber.props)
        .filter(isNotChildrenProps)
        .forEach(prop => {
          addDOMProp(node, prop, (fiber.props as Record<string, any>)[prop])
        })
      return node
    }
  }
}

export function updateDOM(dom: HTMLElement, oldProps: ElementProps, newProps: ElementProps) {
  Object.keys(oldProps)
    .filter(isNotChildrenProps)
    .forEach(oldPropKey => {
      const oldPropVal = (oldProps as Record<string, any>)[oldPropKey]
      const newPropVal = (newProps as Record<string, any>)[oldPropKey]
      if (!newPropVal) {
        removeDOMProp(dom, oldPropKey)
      } else if (oldPropVal !== newPropVal) {
        addDOMProp(dom, oldPropKey, newPropVal)
      }
    })
}

export function addDOMProp(dom: HTMLElement, propKey: string, propVal: any) {
  if (isEventProp(propKey)) {
    ;(dom as any)[propKey.toLowerCase()] = propVal
  } else {
    ;(dom as any)[propKey] = propVal
  }
}

export function removeDOMProp(dom: HTMLElement, propKey: string) {
  if (isEventProp(propKey)) {
    ;(dom as any)[propKey.toLowerCase()] = null
  } else {
    ;(dom as any)[propKey] = null
  }
}
