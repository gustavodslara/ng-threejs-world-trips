export interface StarColor {
  r: number;
  g: number;
  b: number;
}

export class Star {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  maxOpacity: number;
  minOpacity: number;
  twinkleSpeed: number;
  twinkleDirection: number;
  color: StarColor;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedY = Math.random() * 0.1 - 0.05;
    this.speedX = Math.random() * 0.1 - 0.05;
    this.opacity = Math.random() * 0.5 + 0.3;
    this.maxOpacity = this.opacity;
    this.minOpacity = this.opacity * 0.3;
    this.twinkleSpeed = Math.random() * 0.015 + 0.003;
    this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;

    const colorTypes: StarColor[] = [
      { r: 255, g: 255, b: 255 },
      { r: 255, g: 245, b: 235 },
      { r: 245, g: 245, b: 255 },
      { r: 255, g: 235, b: 235 },
      { r: 235, g: 245, b: 255 },
    ];
    this.color = colorTypes[Math.floor(Math.random() * colorTypes.length)];
  }

  update(canvasWidth: number, canvasHeight: number): void {
    this.opacity += this.twinkleSpeed * this.twinkleDirection;
    if (this.opacity <= this.minOpacity || this.opacity >= this.maxOpacity) {
      this.twinkleDirection *= -1;
    }

    this.y += this.speedY;
    this.x += this.speedX;

    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;
    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.size > 1) {
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 2
      );
      gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`);
      gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x - this.size * 2, this.y - this.size * 2, this.size * 4, this.size * 4);
    }

    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight * 0.5;
    this.length = Math.random() * 80 + 20;
    this.speed = Math.random() * 10 + 6;
    this.opacity = 0;
    this.angle = Math.PI / 4;
  }

  reset(canvasWidth: number, canvasHeight: number): void {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight * 0.5;
    this.length = Math.random() * 80 + 20;
    this.speed = Math.random() * 10 + 6;
    this.opacity = 1;
  }

  update(canvasWidth: number, canvasHeight: number): void {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.opacity -= 0.01;

    if (this.opacity <= 0 || this.x > canvasWidth || this.y > canvasHeight) {
      if (Math.random() < 0.001) {
        this.reset(canvasWidth, canvasHeight);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.opacity > 0) {
      const gradient = ctx.createLinearGradient(
        this.x, this.y,
        this.x - Math.cos(this.angle) * this.length,
        this.y - Math.sin(this.angle) * this.length
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x - Math.cos(this.angle) * this.length,
        this.y - Math.sin(this.angle) * this.length
      );
      ctx.stroke();
    }
  }
}
