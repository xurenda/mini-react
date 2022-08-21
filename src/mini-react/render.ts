import { addDOMProp, isNotChildrenProps, updateDOM } from './util'

const scheduler: Scheduler = {
  nextUnitOfWork: null,
  wipRoot: null,
  pervRoot: null,
  deletions: [],
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
    alternate: scheduler.pervRoot,
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
    fiber.dom = createDOM(fiber) as unknown as HTMLElement
  }

  const nodes = fiber.props.children
  reconcileChildren(fiber, nodes)

  return findNextFiber(fiber)
}

function commitRoot() {
  function commitWork(fiber: Fiber | null) {
    if (!fiber) return

    const parentFiber = fiber.parent
    if (parentFiber?.dom && fiber.dom) {
      switch (fiber.effectTag) {
        case 'UPDATE':
          updateDOM(fiber.dom, fiber.alternate!.props, fiber.props)
          break
        case 'ADDED':
          parentFiber.dom.appendChild(fiber.dom)
          break
        case 'DELETE':
          parentFiber.dom.removeChild(fiber.dom)
          break
      }
    }

    commitWork(findNextFiber(fiber))
  }

  scheduler.deletions.forEach(commitWork)
  commitWork(scheduler.wipRoot!.child)
  scheduler.pervRoot = scheduler.wipRoot
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

function reconcileChildren(wipFiber: Fiber, nodes: ReactNode[]) {
  let idx: number = 0
  let oldFiber = wipFiber.alternate?.child || null
  let pervSibling: Fiber | null = null
  let newFiber: Fiber | null = null

  while (idx < nodes.length || oldFiber) {
    const node = nodes[idx]

    const sameType = node && oldFiber && node.type === node.type

    if (!oldFiber && node) {
      // Added
      newFiber = {
        type: node.type,
        props: node.props,
        dom: null,
        parent: wipFiber,
        sibling: null,
        child: null,
        alternate: null,
        effectTag: 'ADDED',
      }
    } else if (oldFiber && !node) {
      // Delete
      newFiber = null
      oldFiber.effectTag = 'DELETE'
      scheduler.deletions.push(oldFiber)
    } else if (oldFiber && node) {
      // update
      newFiber = {
        type: node.type,
        props: node.props,
        dom: oldFiber.type === node.type ? oldFiber.dom : null,
        parent: wipFiber,
        sibling: null,
        child: null,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (idx === 0) {
      wipFiber.child = newFiber
    } else {
      pervSibling!.sibling = newFiber
    }

    pervSibling = newFiber
    idx++
  }
}

function createDOM(fiber: Fiber): HTMLElement | Text {
  switch (fiber.type) {
    case 'ROOT':
      throw new Error('should not create the ROOT DOM!')
    case 'TEXT_ELEMENT':
      return document.createTextNode((fiber.props as TextElementProps).nodeValue)
    default:
      const node = document.createElement(fiber.type) as HTMLElement
      Object.keys(fiber.props)
        .filter(isNotChildrenProps)
        .forEach(prop => {
          addDOMProp(node, prop, (fiber.props as Record<string, any>)[prop])
        })
      return node
  }
}
