import miniReact from './mini-react'

const element = miniReact.createElement(
  'div',
  { title: 'hello world' },
  miniReact.createElement('h1', { style: 'background-color: pink;' }, 'Hello World!'),
  miniReact.createElement('a', { href: '//www.baidu.com', target: '_blank' }, '前往百度'),
)
const container: HTMLDivElement = document.querySelector('#root')!

miniReact.render(element, container)

export {}
