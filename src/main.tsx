import miniReact from './mini-react'

let val = ''
function changeVal(_val: string) {
  val = _val
}

const element = miniReact.createElement(
  'div',
  null,
  miniReact.createElement('input', { type: 'text', oninput: (e: any) => changeVal(e.target?.value || '') }),
  miniReact.createElement('span', null, val),
)
const container: HTMLDivElement = document.querySelector('#root')!

miniReact.render(element, container)

export {}
