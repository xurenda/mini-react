import miniReact from './mini-react'

const container: HTMLDivElement = document.querySelector('#root')!

function changeVal(val: string) {
  renderer(val)
}

function renderer(val: string) {
  const element = miniReact.createElement(
    'div',
    null,
    miniReact.createElement('input', { type: 'text', value: val, oninput: (e: any) => changeVal(e.target?.value || '') }),
    miniReact.createElement('br'),
    miniReact.createElement('span', null, val),
  )
  miniReact.render(element, container)
}

renderer('hello')

export {}
