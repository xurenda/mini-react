import { isNotChildrenProps } from './util'

const scheduler: Scheduler = {
  nextUnitOfWork: null,
  wipRoot: null,
}

export default function render(element: ReactNode, container: HTMLElement) {
  const rootFiber: Fiber = {
    type: 'ROOT',
    props: {
      children: [element],
    },
    dom: container,
    child: null,
    sibling: null,
    parent: null,
  }

  scheduler.nextUnitOfWork = scheduler.wipRoot = rootFiber
  workLoop()
}

function workLoop() {
  function loop(deadline: IdleDeadline) {
    let shouldYield = false

    while (scheduler.nextUnitOfWork && !shouldYield) {
      scheduler.nextUnitOfWork = performUnitWork(scheduler.nextUnitOfWork)

      if (deadline.timeRemaining() < 1) {
        shouldYield = true
      }
    }

    if (scheduler.wipRoot && !scheduler.nextUnitOfWork) {
      commitRoot()
    }

    window.requestIdleCallback(loop)
  }

  window.requestIdleCallback(loop)
}

function performUnitWork(fiber: Fiber): Scheduler['nextUnitOfWork'] {
  if (!fiber.dom) {
    fiber.dom = createDOM(fiber)
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

  return findNextFiber(fiber)
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

function commitRoot() {
  function commitWork(fiber: Fiber | null) {
    if (!fiber) return

    fiber.parent!.dom!.appendChild(fiber.dom!)

    commitWork(findNextFiber(fiber))
  }

  commitWork(scheduler.wipRoot!.child)
  scheduler.wipRoot = null
}

function findNextFiber(fiber: Fiber): Fiber | null {
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
