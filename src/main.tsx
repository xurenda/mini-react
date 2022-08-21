const element = {
  type: 'h1',
  props: {
    title: 'hello world',
    children: 'Hello World!',
  },
}

const container: HTMLDivElement = document.querySelector('#root')!

const node = document.createElement(element.type)
node['title'] = element.props.title
const textNode = document.createTextNode('')
textNode['nodeValue'] = element.props.children

node.appendChild(textNode)
container.appendChild(node)

export {}
