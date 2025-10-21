import { Injectable } from '@angular/core';
import { Star, ShootingStar } from '../models/star.model';

@Injectable({
  providedIn: 'root'
})
export class SpaceBackgroundService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private shootingStars: ShootingStar[] = [];
  private animationId: number | null = null;

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.resizeCanvas();
    this.createStars();
    this.createShootingStars();
    this.animate();
  }

  resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private createStars(): void {
    const starCount = 200;
    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      this.stars.push(new Star(this.canvas.width, this.canvas.height));
    }
  }

  private createShootingStars(): void {
    this.shootingStars = [];
    for (let i = 0; i < 3; i++) {
      const shootingStar = new ShootingStar(this.canvas.width, this.canvas.height);
      shootingStar.opacity = 0;
      this.shootingStars.push(shootingStar);
    }
  }

  private animate(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.stars.forEach(star => {
      star.update(this.canvas.width, this.canvas.height);
      star.draw(this.ctx);
    });

    this.shootingStars.forEach(shootingStar => {
      shootingStar.update(this.canvas.width, this.canvas.height);
      shootingStar.draw(this.ctx);
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
