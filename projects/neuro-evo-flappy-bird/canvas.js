
class Canvas {
  constructor (canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
  }

  /**
   * fillRect - Draws a rectangle with the stroke color
   * and then fills the rectangle with the fill color.
   *
   * @param  {Number} x1 The x coordinate of the top-left point
   * @param  {Number} y1 The y coordinate of the top-left point
   * @param  {Number} x2 The x coordinate of the bot-right point
   * @param  {Number} y2 The y coordinate of the bot-right point
   * @return {Canvas}    This Canvas instance
   */
  fillRect (x1, y1, x2, y2, c) {
    const origColor = this.getColor();
    this.setColor (c ? c : origColor);
    this.ctx.fillRect(x1, y1, x2-x1, y2-y1);
    this.setColor (origColor);
    return this;
  }

  /**
   * drawRect - Draws a rectangle with the stroke color.
   *
   * @param  {Number} x1 The x coordinate of the top-left point
   * @param  {Number} y1 The y coordinate of the top-left point
   * @param  {Number} x2 The x coordinate of the bot-right point
   * @param  {Number} y2 The y coordinate of the bot-right point
   * @return {Canvas}    This Canvas instance
   */
  drawRect (x1, y1, x2, y2) {
    this.ctx.rect(x1, y1, x2-x1, y2-y1);
    return this;
  }

  drawLine (x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    return this;
  }

  drawCircle (x, y, r) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.stroke();
    return this;
  }

  fillCircle (x, y, r, c) {
    const origColor = this.getColor();
    this.setColor (c ? c : origColor);
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fill();
    this.setColor (origColor);
    return this;
  }

  drawImage (img, x, y, width, height) {
    this.ctx.drawImage (img, x, y, width, height);
    return this;
  }

  setWidth (width) {
    this.canvas.width = width;
    return this;
  }

  getWidth () {
    return this.canvas.width;
  }

  setHeight (height) {
    this.canvas.height = height;
    return this;
  }

  getHeight () {
    return this.canvas.height;
  }

  getCanvas () {
    return this.canvas;
  }

  setCanvas (canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext ("2d");
  }

  /**
   * setLineWidth - Assigns the line width property of the canvas
   *
   * @param  {Number} n The line width
   * @return {Canvas}   This Canvas instance
   */
  setLineWidth (n) {
    this.ctx.lineWidth = n;
    return this;
  }

  getLineWidth (n) {
    return this.ctx.lineWidth;
  }

  setColor (color) {
    this.ctx.fillStyle = color;
    return this;
  }

  getColor () {
    return this.ctx.fillStyle;
  }

  setStrokeStyle (color) {
    this.ctx.strokeStyle = color;
    return this;
  }

  getStrokeStyle () {
    return this.ctx.strokeStyle;
  }
}
