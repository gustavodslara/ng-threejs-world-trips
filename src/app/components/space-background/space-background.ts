import { Component, ElementRef, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { SpaceBackgroundService } from '../../core/services/space-background';

@Component({
  selector: 'app-space-background',
  imports: [],
  templateUrl: './space-background.html',
  styleUrl: './space-background.css'
})
export class SpaceBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('spaceCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(private spaceService: SpaceBackgroundService) {}

  ngOnInit(): void {
    window.addEventListener('resize', () => this.onResize());
  }

  ngAfterViewInit(): void {
    this.spaceService.initialize(this.canvasRef.nativeElement);
  }

  onResize(): void {
    if (this.canvasRef) {
      this.spaceService.resizeCanvas();
    }
  }

  ngOnDestroy(): void {
    this.spaceService.destroy();
    window.removeEventListener('resize', () => this.onResize());
  }
}
