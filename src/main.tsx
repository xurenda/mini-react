import miniReact from './mini-react'

const element = miniReact.createElement('h1', { title: 'hello world' }, 'Hello World!')
const container: HTMLDivElement = document.querySelector('#root')!

miniReact.render(element, container)

export {}
