const canvas = document.getElementById('canvas')

class Paint {
  constructor(width, height, pixelSize, color) {
    canvas.width = width
    canvas.height = height
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.pixelSize = pixelSize
    this.color = color
    this.isMouseDown = false
  }

  drawCircle(x, y, diameter = this.pixelSize, color = this.color) {
    this.ctx.beginPath()
    this.ctx.fillStyle = color
    this.ctx.arc(x, y, diameter / 2, 0, Math.PI * 2)
    this.ctx.fill()
  }

  drawConnectingLine(x, y, lineWidth = this.pixelSize, color = this.color) {
    this.ctx.lineTo(x, y)
    this.ctx.lineWidth = lineWidth
    this.ctx.strokeStyle = color
    this.ctx.stroke()
  }

  storePosition(x, y) {
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
  }

  drawLine(x1, y1, x2, y2, lineWidth = 2, color = '#00bfff') {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineWidth = lineWidth
    this.ctx.strokeStyle = color
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  drawCell(x1, y1, size = this.pixelSize, color = '#00bfff') {
    this.ctx.beginPath()
    this.ctx.fillStyle = color
    this.ctx.rect(x1, y1, size, size)
    this.ctx.fill()
  }

  toNumericalRepresentation(shouldBeDrawn) {
    const numericalRepresentation = []
    let cellsToDraw = []

    for (let x = 0; x < this.canvas.width; x += this.pixelSize) {
      for (let y = 0; y < this.canvas.height; y += this.pixelSize) {
        const cell = this.ctx.getImageData(x, y, this.pixelSize, this.pixelSize)
        let isFilled = false

        for(let i = 0; i < cell.data.length; i += 10) {
          if (cell.data[i] !== 0) {
            isFilled = true
            break
          }
        }

        if (isFilled) {
          numericalRepresentation.push(1)
          cellsToDraw.push({ x, y })
        } else {
          numericalRepresentation.push(0)
        }
      }
    }

    if (shouldBeDrawn) {
      cellsToDraw.forEach((cell) => this.drawCell(cell.x, cell.y))
    }

    return numericalRepresentation
  }

  drawGrid() {
    for (let x = 0; x < this.canvas.width; x += this.pixelSize) {
      this.drawLine(x, 0, x, this.canvas.height)
    }

    for (let y = 0; y < this.canvas.height; y += this.pixelSize) {
      this.drawLine(0, y, this.canvas.width, y)
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  run() {
    this.canvas.addEventListener('mousedown', () => {
      this.isMouseDown = true
      this.ctx.beginPath()
    })

    this.canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false
    })

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        const x = e.offsetX
        const y = e.offsetY

        this.drawConnectingLine(x, y)
        this.drawCircle(x, y)
        this.storePosition(x, y)
      }
    })
  }
}

const paint = new Paint(600, 400, 20, 'red')
paint.run()

const statistic = []

const addToStatistic = (name, numericalRepresentation) => {
  statistic.push({
    input: numericalRepresentation,
    output: {
      [name]: 1
    }
  })
}

document.addEventListener('keypress', ({ code }) => {
  if (code === 'KeyC') {
    paint.clear()
  }

  if (code === 'KeyV') {
    const numericalRepresentation = paint.toNumericalRepresentation(true)
    addToStatistic(prompt('Что изображено?'), numericalRepresentation)
  }

  if (code === 'KeyB') {
    const neuralNetwork = new brain.NeuralNetwork()
    neuralNetwork.train(statistic, { log: true })
    const numericalRepresentation = paint.toNumericalRepresentation()
    const result = brain.likely(numericalRepresentation, neuralNetwork)

    if (confirm(`На рисунке изображен ${result}. Я угадал?`)) {
      addToStatistic(result, numericalRepresentation)
    } else {
      addToStatistic(prompt('А что тогда изображено?'), numericalRepresentation)
    }

    console.log(statistic)
  }
})
