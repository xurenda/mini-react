import { isNotChildrenProps } from './util'

const scheduler: Scheduler = {
  nextUnitOfWork: null,
}

export default function render(element: ReactNode, container: HTMLElement) {
  scheduler.nextUnitOfWork = {
    type: 'ROOT',
    props: {
      children: [element],
    },
    dom: container,
    child: null,
    sibling: null,
    parent: null,
  }

  workLoop(scheduler.nextUnitOfWork)
}

function workLoop(nextUnitOfWork: Scheduler['nextUnitOfWork']) {
  function loop(deadline: IdleDeadline) {
    let shouldYield = false

    while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitWork(nextUnitOfWork)

      if (deadline.timeRemaining() < 1) {
        shouldYield = true
      }
    }

    window.requestIdleCallback(loop)
  }

  window.requestIdleCallback(loop)
}

function performUnitWork(fiber: Fiber): Scheduler['nextUnitOfWork'] {
  if (!fiber.dom) {
    fiber.dom = createDOM(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom!.appendChild(fiber.dom)
  }

  const nodes = fiber.props.children

  for (let idx = 0, pervSibling: Fiber | null = null; idx < nodes.length; idx++) {
    const node = nodes[idx]

    const newFiber: Fiber = {
      type: node.type,
      props: node.props,
      dom: null,
      parent: fiber,
      child: null,
      sibling: null,
    }

    if (idx === 0) {
      fiber.child = newFiber
    } else {
      pervSibling!.sibling = newFiber
    }

    pervSibling = newFiber
  }

  if (fiber.child) {
    return fiber.child
  }
  let nextFiber: Fiber | null = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
  return null
}

function createDOM(fiber: Fiber): HTMLElement {
  let node: HTMLElement | Text
  switch (fiber.type) {
    case 'ROOT':
      throw new Error('should not create the ROOT DOM!')
    case 'TEXT_ELEMENT':
      node = document.createTextNode((fiber.props as TextElementProps).nodeValue)
      break
    default:
      node = document.createElement(fiber.type)
      Object.keys(fiber.props)
        .filter(isNotChildrenProps)
        .forEach(prop => {
          ;(node as HTMLElement).setAttribute(prop, (fiber.props as Record<string, any>)[prop])
        })
      break
  }

  return node as HTMLElement
}
