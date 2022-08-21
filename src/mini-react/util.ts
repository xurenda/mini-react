export function isNotChildrenProps(propsKey: string) {
  return propsKey !== 'children'
}

export function isEventProp(propKey: string) {
  return propKey.startsWith('on')
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
    dom.setAttribute(propKey, propVal)
  }
}

export function removeDOMProp(dom: HTMLElement, propKey: string) {
  if (isEventProp(propKey)) {
    ;(dom as any)[propKey.toLowerCase()] = null
  } else {
    dom.removeAttribute(propKey)
  }
}
